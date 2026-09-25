"use client";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Download, GripVertical, Plus, Star, Trash2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useExportQuota } from "@/components/paywall/export-quota-provider";
import { formatExportsLeftLabel } from "@/lib/export-quota";
import { PolarCheckoutLink } from "@/components/landing/polar-checkout-link";
import { IosFrame } from "@/components/preview/ios-frame";
import { InstagramFollowRequestsPreview } from "@/components/preview/instagram/follow-requests/instagram-follow-requests-preview";
import { EditableText } from "@/components/ui/editable-text";
import { Input } from "@/components/ui/input";
import { ProfilePicker } from "@/components/editor/profile-picker";
import { ToggleButton } from "@/components/editor/toggle-button";
import { DisplaySettingsTab } from "@/components/editor/display-settings-tab";
import { useProjectStore } from "@/stores/useProjectStore";
import type { FollowRequestRow } from "@/schemas/follow-request";
import { resizeImageToDataUrl } from "@/lib/image";
import { captureElementViaScreen } from "@/lib/screenshot";
import { cn } from "@/lib/utils";

const POLAR_PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;

type LeftTab = "requests" | "display";

const LEFT_TABS: { value: LeftTab; label: string }[] = [
  { value: "requests", label: "Requests" },
  { value: "display", label: "Display" },
];

function createBlankRow(index: number): FollowRequestRow {
  return { id: crypto.randomUUID(), displayName: `User ${index + 1}` };
}

// Up to 3 small circular slots for the "mutuals" subtitle variant's
// overlapping-avatars decoration — upload adds the next slot, clicking an
// existing one removes it.
function MutualAvatarsEditor({
  avatars,
  onChange,
}: {
  avatars: string[];
  onChange: (avatars: string[]) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/") || avatars.length >= 3) return;
    setUploading(true);
    try {
      const { dataUrl } = await resizeImageToDataUrl(file, 200, 0.85);
      onChange([...avatars, dataUrl]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {avatars.map((avatar, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(avatars.filter((_, idx) => idx !== i))}
          aria-label="Remove mutual avatar"
          className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        </button>
      ))}
      {avatars.length < 3 && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          aria-label="Add mutual avatar"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-foreground-subtle transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Drag handle + reorderable wrapper for one row — same @dnd-kit/sortable
// pattern as the chat list editor's SortableRow (see
// chat-list-workspace-view.tsx), including the select/highlight chrome:
// clicking the matching item in the preview scrolls this row into view and
// highlights it, same as conversations/chat lists.
function SortableRow({
  id,
  selected,
  onSelect,
  children,
}: {
  id: string;
  selected?: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  return (
    <div
      ref={setNodeRef}
      data-item-id={id}
      onClick={onSelect}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-start gap-1.5 rounded-md border p-2.5 transition-colors",
        selected ? "border-accent/40 bg-accent/5" : "border-border hover:glass-surface",
        isDragging && "opacity-50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        aria-label="Drag to reorder"
        className="mt-1.5 flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function FollowRequestsWorkspaceView({ projectId }: { projectId: string }) {
  const hasHydrated = useProjectStore((s) => s.hasHydrated);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const renameProject = useProjectStore((s) => s.renameProject);
  const toggleFavorite = useProjectStore((s) => s.toggleFavorite);
  const setFollowRequestRows = useProjectStore((s) => s.setFollowRequestRows);

  const [leftTab, setLeftTab] = React.useState<LeftTab>("requests");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  // Clicking a row in the preview both selects it and scrolls/highlights
  // the matching row in the editor — same pattern as chat-list-workspace-
  // view.tsx's selectItem/inboxScrollRef.
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  // Bumped on every select, even re-selecting the same id, so the effect
  // below scrolls it back into view even if it's already selected.
  const [selectionTick, setSelectionTick] = React.useState(0);
  const requestsScrollRef = React.useRef<HTMLDivElement>(null);
  const screenRef = React.useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = React.useState(false);
  const [flattenFrame, setFlattenFrame] = React.useState(false);
  const clerk = useClerk();
  const { isSignedIn, quota, consume } = useExportQuota();

  async function handleExport() {
    if (!screenRef.current) return;
    if (!isSignedIn) {
      clerk.openSignIn({
        forceRedirectUrl: window.location.href,
        signUpForceRedirectUrl: window.location.href,
      });
      return;
    }
    setExporting(true);
    try {
      setFlattenFrame(true);
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      const dataUrl = await captureElementViaScreen(screenRef.current, {
        watermark: quota.locked,
      });
      const link = document.createElement("a");
      link.download = `${project?.name || "follow-requests"}.png`;
      link.href = dataUrl;
      link.click();
      void consume();
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setFlattenFrame(false);
      setExporting(false);
    }
  }

  // Clicking a row in the preview jumps to the Requests tab (in case
  // Display is active, since rows only render there) and highlights the
  // matching row.
  function selectItem(id: string) {
    setSelectedItemId(id);
    setLeftTab("requests");
    setSelectionTick((t) => t + 1);
  }

  React.useEffect(() => {
    if (!selectedItemId) return;
    // Wait a frame so a just-triggered Display -> Requests tab switch has
    // actually mounted/laid out the target row before we measure it.
    const raf = requestAnimationFrame(() => {
      const container = requestsScrollRef.current;
      const target = container?.querySelector<HTMLElement>(`[data-item-id="${selectedItemId}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedItemId, leftTab, selectionTick]);

  if (!hasHydrated) {
    return <div className="h-full" />;
  }

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-[13px] text-foreground-muted">Project not found.</p>
        <Link href="/projects" className="text-[13px] text-accent hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const rows = project.followRequestRows ?? [];
  const usedRecipientIds = new Set(
    rows.map((r) => r.recipientId).filter((id): id is string => !!id),
  );

  function addRow() {
    setFollowRequestRows(project!.id, [...rows, createBlankRow(rows.length)]);
  }
  function removeRow(id: string) {
    setFollowRequestRows(project!.id, rows.filter((r) => r.id !== id));
  }
  function updateRow(id: string, patch: Partial<FollowRequestRow>) {
    setFollowRequestRows(
      project!.id,
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFollowRequestRows(
        project!.id,
        arrayMove(rows, rows.findIndex((r) => r.id === active.id), rows.findIndex((r) => r.id === over.id)),
      );
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-5">
        <Link
          href="/projects"
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted transition-colors hover:glass-surface hover:text-foreground"
          aria-label="Back to Projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <EditableText
          value={project.name}
          onChange={(name) => renameProject(project.id, name)}
          className="text-[13px] font-medium text-foreground"
        />
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground-subtle">
          Instagram
        </span>

        <div className="ml-auto flex items-center gap-1">
          {quota.plan === "free" && (
            <span className="text-[12px] text-foreground-subtle">
              {formatExportsLeftLabel(quota)}
            </span>
          )}
          {quota.plan === "free" && quota.locked && POLAR_PRO_PRODUCT_ID && (
            <PolarCheckoutLink
              productId={POLAR_PRO_PRODUCT_ID}
              className="flex h-8 items-center rounded-md bg-accent px-2.5 text-[13px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Upgrade to Pro
            </PolarCheckoutLink>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-foreground-muted transition-colors hover:glass-surface hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export PNG"}
          </button>
          <button
            onClick={() => toggleFavorite(project.id)}
            aria-label={project.favorite ? "Remove from favorites" : "Add to favorites"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted transition-colors hover:glass-surface hover:text-foreground"
          >
            <Star className={cn("h-4 w-4", project.favorite && "fill-accent text-accent")} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex w-[44%] shrink-0 flex-col border-r border-border bg-bg-elevated/20 backdrop-blur-xl">
          <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 pt-2">
            {LEFT_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setLeftTab(tab.value)}
                className={cn(
                  "rounded-t-md px-3 py-2 text-[13px] font-medium transition-colors",
                  leftTab === tab.value
                    ? "border-b-2 border-accent text-foreground"
                    : "border-b-2 border-transparent text-foreground-subtle hover:text-foreground-muted",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {leftTab === "requests" && (
            <div ref={requestsScrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-foreground-subtle">Requests</label>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-accent hover:bg-accent/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add request
                </button>
              </div>

              {rows.length === 0 && (
                <p className="text-[12px] text-foreground-subtle">
                  No requests yet — add one and pick a profile (custom or saved) for it.
                </p>
              )}

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3">
                    {rows.map((row) => (
                      <SortableRow
                        key={row.id}
                        id={row.id}
                        selected={selectedItemId === row.id}
                        onSelect={() => setSelectedItemId(row.id)}
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <ProfilePicker
                              username={row.displayName}
                              avatar={row.avatar}
                              verified={row.verified}
                              recipientId={row.recipientId}
                              usedRecipientIds={usedRecipientIds}
                              onSelectSaved={(recipient) =>
                                updateRow(row.id, {
                                  recipientId: recipient.id,
                                  displayName: recipient.name,
                                  username: recipient.username,
                                  avatar: recipient.avatar,
                                  verified: recipient.verified,
                                })
                              }
                              onSetCustom={({ username, avatar, verified }) =>
                                updateRow(row.id, {
                                  recipientId: undefined,
                                  displayName: username,
                                  avatar,
                                  verified,
                                })
                              }
                            />
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              aria-label="Remove request"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:glass-surface hover:text-danger"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <ToggleButton
                              label="Username"
                              active={(row.subtitleMode ?? "username") === "username"}
                              onClick={() => updateRow(row.id, { subtitleMode: "username" })}
                            />
                            <ToggleButton
                              label="Mutuals"
                              active={row.subtitleMode === "mutuals"}
                              onClick={() => updateRow(row.id, { subtitleMode: "mutuals" })}
                            />
                          </div>

                          {(row.subtitleMode ?? "username") === "username" ? (
                            <Input
                              value={row.username ?? ""}
                              onChange={(e) => updateRow(row.id, { username: e.target.value })}
                              placeholder="username"
                              className="h-8 text-[13px]"
                            />
                          ) : (
                            <>
                              <Input
                                value={row.mutualsText ?? ""}
                                onChange={(e) => updateRow(row.id, { mutualsText: e.target.value })}
                                placeholder="and 12 others"
                                className="h-8 text-[13px]"
                              />
                              <MutualAvatarsEditor
                                avatars={row.mutualAvatars ?? []}
                                onChange={(mutualAvatars) => updateRow(row.id, { mutualAvatars })}
                              />
                            </>
                          )}
                        </div>
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {leftTab === "display" && <DisplaySettingsTab project={project} />}
        </section>

        <section className="flex flex-1 flex-col bg-bg-elevated/40 backdrop-blur-md">
          <IosFrame screenRef={screenRef} flattened={flattenFrame}>
            <InstagramFollowRequestsPreview
              rows={rows}
              theme={project.theme}
              onSelectItem={selectItem}
              statusBar={{
                visible: project.statusBarVisible,
                hour: project.statusBarHour,
                minute: project.statusBarMinute,
                meridiem: project.statusBarMeridiem,
                showMeridiem: project.statusBarShowMeridiem,
                battery: project.statusBarBattery,
                simCount: project.statusBarSimCount,
                sim1Bars: project.statusBarSim1Bars,
                sim2Bars: project.statusBarSim2Bars,
                wifiEnabled: project.statusBarWifiEnabled,
                wifiBars: project.statusBarWifiBars,
              }}
            />
          </IosFrame>
        </section>
      </div>
    </div>
  );
}
