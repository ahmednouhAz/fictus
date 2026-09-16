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
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Download,
  GripVertical,
  Lock,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useExportQuota } from "@/components/paywall/export-quota-provider";
import { UpgradeDialog } from "@/components/paywall/upgrade-dialog";
import { IosFrame } from "@/components/preview/ios-frame";
import { InstagramChatListPreview } from "@/components/preview/instagram/chat-list/instagram-chat-list-preview";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { EditableText } from "@/components/ui/editable-text";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ToggleButton } from "@/components/editor/toggle-button";
import { TimePicker } from "@/components/editor/time-picker";
import { SignalBars, WifiGlyph } from "@/components/preview/status-bar-icons";
import type { NoteItemData, ChatRowData, ChatPreviewKind } from "@/schemas/chat-list";
import { useProjectStore } from "@/stores/useProjectStore";
import { useRecipientStore } from "@/stores/useRecipientStore";
import type { SavedRecipient } from "@/schemas/recipient";
import { resizeImageToDataUrl } from "@/lib/image";
import { captureElementViaScreen } from "@/lib/screenshot";
import { cn } from "@/lib/utils";

type LeftTab = "inbox" | "display";

const LEFT_TABS: { value: LeftTab; label: string }[] = [
  { value: "inbox", label: "Inbox" },
  { value: "display", label: "Display" },
];

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

// Shared 0-4 segmented picker for cellular/wifi signal strength — same as
// DisplaySettingsTab's BarLevelPicker.
function BarLevelPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (bars: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border text-[12px] transition-colors",
            value === level
              ? "border-accent/50 text-accent"
              : "border-border text-foreground-subtle hover:glass-surface",
          )}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

// Drag handle + reorderable wrapper for one row in a list — same
// @dnd-kit/sortable pattern as the conversation editor's message list
// (see ItemRowShell), just without the select/duplicate/delete chrome
// that doesn't apply here.
function SortableRow({
  id,
  selected,
  onSelect,
  children,
}: {
  id: string;
  // Highlighted when this row's item is the one currently selected from
  // the preview (see ChatListWorkspaceView's selectedItemId) — same idea
  // as ItemRowShell's selected state in the conversation editor.
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

function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-fit rounded-full border px-2.5 py-1 text-[12px] transition-colors",
        active ? "border-accent/50 bg-accent/15 text-accent" : "border-border text-foreground-subtle",
      )}
    >
      {children}
    </button>
  );
}

// Picks the profile an item (note or chat row) belongs to — either a
// saved recipient (auto-fills username/avatar and syncs if that recipient
// changes later) or a custom, one-off name typed directly. Saved
// recipients already used by another item in the same list are hidden so
// the same person can't be picked twice.
function ProfilePicker({
  username,
  avatar,
  verified,
  recipientId,
  usedRecipientIds,
  onSelectSaved,
  onSetCustom,
}: {
  username: string;
  avatar?: string;
  verified?: boolean;
  recipientId?: string;
  usedRecipientIds: Set<string>;
  onSelectSaved: (recipient: SavedRecipient) => void;
  onSetCustom: (fields: { username: string; avatar?: string; verified?: boolean }) => void;
}) {
  const recipients = useRecipientStore((s) => s.recipients);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [customDraft, setCustomDraft] = React.useState(username);
  const [customAvatarDraft, setCustomAvatarDraft] = React.useState(avatar);
  const [customVerifiedDraft, setCustomVerifiedDraft] = React.useState(!!verified);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const available = recipients.filter((r) => r.id === recipientId || !usedRecipientIds.has(r.id));
  const filtered = available.filter((r) =>
    (r.username ?? r.name).toLowerCase().includes(search.trim().toLowerCase()),
  );

  async function handleAvatarFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { dataUrl } = await resizeImageToDataUrl(file, 400, 0.85);
      setCustomAvatarDraft(dataUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setCustomDraft(username);
          setCustomAvatarDraft(avatar);
          setCustomVerifiedDraft(!!verified);
        } else {
          setSearch("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex flex-1 items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-left text-[13px] text-foreground transition-colors hover:glass-surface"
        >
          {username ? (
            <>
              <InstagramAvatar name={username} avatarUrl={avatar} size={20} />
              <span className="truncate">{username}</span>
            </>
          ) : (
            <span className="truncate text-foreground-subtle">Choose a profile…</span>
          )}
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-foreground-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="flex flex-col gap-1.5">
          <label className="px-1 text-[11px] text-foreground-subtle">Custom profile</label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Upload profile picture"
              className="group relative shrink-0 rounded-full"
            >
              <InstagramAvatar name={customDraft || "?"} avatarUrl={customAvatarDraft} size={32} />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleAvatarFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Input
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              placeholder="username"
              className="h-8 flex-1 text-[13px]"
            />
            <button
              type="button"
              onClick={() => setCustomVerifiedDraft((v) => !v)}
              aria-label={customVerifiedDraft ? "Remove verified badge" : "Add verified badge"}
              title={customVerifiedDraft ? "Verified" : "Not verified"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border transition-colors hover:glass-surface"
            >
              <VerifiedBadge size={16} color={customVerifiedDraft ? "#0095F6" : "#8e8e8e"} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onSetCustom({
                username: customDraft.trim(),
                avatar: customAvatarDraft,
                verified: customVerifiedDraft,
              });
              setOpen(false);
            }}
            disabled={!customDraft.trim()}
            className="rounded-md px-2 py-1 text-left text-[12px] font-medium text-accent hover:bg-accent/10 disabled:pointer-events-none disabled:opacity-40"
          >
            Use this profile
          </button>
        </div>

        <div className="my-2 border-t border-border" />

        <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 py-1.5">
          <span className="text-foreground-subtle">@</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved profiles…"
            className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-subtle"
          />
        </div>
        <div className="mt-1.5 flex max-h-56 flex-col gap-0.5 overflow-y-auto">
          {available.length === 0 && (
            <p className="px-2 py-1.5 text-[12px] text-foreground-subtle">
              No saved profiles yet — save one from a conversation&apos;s Profile tab first.
            </p>
          )}
          {available.length > 0 && filtered.length === 0 && (
            <p className="px-2 py-1.5 text-[12px] text-foreground-subtle">No matches.</p>
          )}
          {filtered.map((recipient) => (
            <button
              key={recipient.id}
              type="button"
              onClick={() => {
                onSelectSaved(recipient);
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:glass-surface"
            >
              <InstagramAvatar name={recipient.name} avatarUrl={recipient.avatar} size={20} />
              <span className="truncate">{recipient.username ?? recipient.name}</span>
              {recipient.id === recipientId && (
                <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-accent" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Type toggle + content fields, shared between the current user's own note
// (no profile picker — it's always "you") and every other note.
function NoteContentFields({
  note,
  onChangeType,
  onChangeText,
  onChangeMusic,
}: {
  note: NoteItemData;
  onChangeType: (type: "text" | "music") => void;
  onChangeText: (content: string) => void;
  onChangeMusic: (fields: { musicTitle?: string; musicArtist?: string }) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex gap-1.5">
        <TogglePill active={note.type === "text"} onClick={() => onChangeType("text")}>
          Text
        </TogglePill>
        <TogglePill active={note.type === "music"} onClick={() => onChangeType("music")}>
          Music
        </TogglePill>
      </div>
      {note.type === "text" ? (
        <Input
          value={note.content}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Note text"
          className="h-8 text-[13px]"
        />
      ) : (
        <div className="flex gap-1.5">
          <Input
            value={note.musicTitle}
            onChange={(e) => onChangeMusic({ musicTitle: e.target.value })}
            placeholder="Song name"
            className="h-8 text-[13px]"
          />
          <Input
            value={note.musicArtist}
            onChange={(e) => onChangeMusic({ musicArtist: e.target.value })}
            placeholder="Artist name"
            className="h-8 text-[13px]"
          />
        </div>
      )}
    </div>
  );
}

function createBlankNote(): NoteItemData {
  return { id: crypto.randomUUID(), username: "", type: "text", content: "" };
}

function createBlankChat(index: number): ChatRowData {
  return {
    id: crypto.randomUUID(),
    username: `user${index + 1}`,
    previewText: "4+ new messages",
    time: "3h",
    seen: false,
  };
}

export function ChatListWorkspaceView({ projectId }: { projectId: string }) {
  const hasHydrated = useProjectStore((s) => s.hasHydrated);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const renameProject = useProjectStore((s) => s.renameProject);
  const toggleFavorite = useProjectStore((s) => s.toggleFavorite);
  const setTheme = useProjectStore((s) => s.setTheme);
  const setStatusBar = useProjectStore((s) => s.setStatusBar);
  const setChatListMeUsername = useProjectStore((s) => s.setChatListMeUsername);
  const setChatListShowAccountSwitcher = useProjectStore(
    (s) => s.setChatListShowAccountSwitcher,
  );
  const setChatListRequestsCount = useProjectStore((s) => s.setChatListRequestsCount);
  const setChatListMeNote = useProjectStore((s) => s.setChatListMeNote);
  const setChatListNotes = useProjectStore((s) => s.setChatListNotes);
  const setChatListChats = useProjectStore((s) => s.setChatListChats);

  const [leftTab, setLeftTab] = React.useState<LeftTab>("inbox");
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  // Bumped on every select, even re-selecting the same id — the effect
  // below keys off this (not just selectedItemId) so clicking the same
  // preview item twice still scrolls it back into view.
  const [selectionTick, setSelectionTick] = React.useState(0);
  const inboxScrollRef = React.useRef<HTMLDivElement>(null);
  const noteSensors = useDndSensors();
  const chatSensors = useDndSensors();
  const screenRef = React.useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = React.useState(false);
  const [flattenFrame, setFlattenFrame] = React.useState(false);
  const clerk = useClerk();
  const { isSignedIn, quota, consume } = useExportQuota();
  const [upgradeReason, setUpgradeReason] = React.useState<"export" | "playButton" | null>(null);

  // Clicking an item in the preview both selects it and highlights the
  // matching row in the editor (see SortableRow/the "Your note" block
  // below) — jumping to the Inbox tab first if Display is active, since
  // that's the only tab those rows render in.
  function selectItem(id: string) {
    setSelectedItemId(id);
    setLeftTab("inbox");
    setSelectionTick((t) => t + 1);
  }

  React.useEffect(() => {
    if (!selectedItemId) return;
    // Wait a frame so a just-triggered Display -> Inbox tab switch has
    // actually mounted/laid out the target row before we measure it.
    const raf = requestAnimationFrame(() => {
      const container = inboxScrollRef.current;
      const target = container?.querySelector<HTMLElement>(`[data-item-id="${selectedItemId}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedItemId, leftTab, selectionTick]);

  // Same real-screen-capture export as the conversation editor (see
  // WorkspaceView.handleExport) — briefly drops the frame's rounded
  // corners/bezel shadow since a screen-capture crop is always a plain
  // rectangle and can't cleanly bound a rounded one.
  async function handleExport() {
    if (!screenRef.current) return;
    if (!isSignedIn) {
      // Keep the user on this page after sign-in instead of falling back
      // to NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL (the landing
      // page) — forceRedirectUrl takes precedence over that env default.
      clerk.openSignIn({ forceRedirectUrl: window.location.href });
      return;
    }
    // Checked against the already-known client-side quota, not a fresh
    // server round-trip — avoids prompting the screen-share picker at all
    // for someone who's already locked out.
    if (quota.locked) {
      setUpgradeReason("export");
      return;
    }
    setExporting(true);
    try {
      setFlattenFrame(true);
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      const dataUrl = await captureElementViaScreen(screenRef.current);
      const link = document.createElement("a");
      link.download = `${project?.name || "chat-list"}.png`;
      link.href = dataUrl;
      link.click();
      // Only spend a credit once the capture actually succeeded — a
      // cancelled/denied screen-share picker (getDisplayMedia) used to
      // burn a credit for nothing.
      void consume();
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setFlattenFrame(false);
      setExporting(false);
    }
  }

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

  const meUsername = project.chatListMeUsername ?? "your_username";
  const showAccountSwitcher = project.chatListShowAccountSwitcher ?? true;
  const theme = project.theme ?? "dark";
  const meNote = project.chatListMeNote ?? { type: "text" as const, content: "Make this space yours..." };
  const otherNotes = project.chatListNotes ?? [];
  const chats = project.chatListChats ?? [];
  const requestsCount = project.chatListRequestsCount ?? 0;

  const statusBarVisible = project.statusBarVisible ?? true;
  const statusBarHour = project.statusBarHour ?? 9;
  const statusBarMinute = project.statusBarMinute ?? 41;
  const statusBarMeridiem = project.statusBarMeridiem ?? "AM";
  const statusBarShowMeridiem = project.statusBarShowMeridiem ?? false;
  const statusBarBattery = project.statusBarBattery ?? 100;
  const statusBarSimCount = project.statusBarSimCount ?? 1;
  const statusBarSim1Bars = project.statusBarSim1Bars ?? 4;
  const statusBarSim2Bars = project.statusBarSim2Bars ?? 4;
  const statusBarWifiEnabled = project.statusBarWifiEnabled ?? true;
  const statusBarWifiBars = project.statusBarWifiBars ?? 3;

  const usedRecipientIds = new Set(
    otherNotes.map((n) => n.recipientId).filter((id): id is string => !!id),
  );
  const usedChatRecipientIds = new Set(
    chats.map((c) => c.recipientId).filter((id): id is string => !!id),
  );

  function addNote() {
    setChatListNotes(project!.id, [...otherNotes, createBlankNote()]);
  }
  function removeNote(id: string) {
    setChatListNotes(project!.id, otherNotes.filter((n) => n.id !== id));
  }
  function updateNote(id: string, patch: Partial<NoteItemData>) {
    setChatListNotes(
      project!.id,
      otherNotes.map((n) => (n.id === id ? ({ ...n, ...patch } as NoteItemData) : n)),
    );
  }
  function handleNoteDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChatListNotes(
        project!.id,
        arrayMove(
          otherNotes,
          otherNotes.findIndex((n) => n.id === active.id),
          otherNotes.findIndex((n) => n.id === over.id),
        ),
      );
    }
  }

  function addChat() {
    setChatListChats(project!.id, [...chats, createBlankChat(chats.length)]);
  }
  function removeChat(id: string) {
    setChatListChats(project!.id, chats.filter((c) => c.id !== id));
  }
  function updateChat(id: string, patch: Partial<ChatRowData>) {
    setChatListChats(
      project!.id,
      chats.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }
  function handleChatDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChatListChats(
        project!.id,
        arrayMove(
          chats,
          chats.findIndex((c) => c.id === active.id),
          chats.findIndex((c) => c.id === over.id),
        ),
      );
    }
  }

  const notes: NoteItemData[] = [
    { id: "me", username: meUsername, isCurrentUser: true, ...meNote },
    ...otherNotes,
  ];

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
              {quota.remaining} export{quota.remaining === 1 ? "" : "s"} left
            </span>
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

          {leftTab === "inbox" && (
            <div ref={inboxScrollRef} className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-foreground-subtle">Your username</label>
                <EditableText
                  value={meUsername}
                  onChange={(value) => setChatListMeUsername(project!.id, value)}
                  className="text-[14px] font-medium text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-foreground-subtle">Account switcher arrow</label>
                <TogglePill
                  active={showAccountSwitcher}
                  onClick={() => setChatListShowAccountSwitcher(project!.id, !showAccountSwitcher)}
                >
                  {showAccountSwitcher ? "Shown" : "Hidden"}
                </TogglePill>
              </div>

              <div
                data-item-id="me"
                onClick={() => setSelectedItemId("me")}
                className={cn(
                  "flex cursor-pointer flex-col gap-2 rounded-md border-t border-border pt-6 transition-colors",
                  selectedItemId === "me" && "border-accent/40 bg-accent/5",
                )}
              >
                <label className="text-[11px] text-foreground-subtle">Your note</label>
                <NoteContentFields
                  note={{ id: "me", username: meUsername, isCurrentUser: true, ...meNote }}
                  onChangeType={(type) =>
                    setChatListMeNote(
                      project!.id,
                      type === "text"
                        ? { type: "text", content: "" }
                        : { type: "music", musicTitle: "", musicArtist: "" },
                    )
                  }
                  onChangeText={(content) =>
                    setChatListMeNote(project!.id, { type: "text", content })
                  }
                  onChangeMusic={(fields) =>
                    setChatListMeNote(
                      project!.id,
                      meNote.type === "music"
                        ? { ...meNote, ...fields }
                        : { type: "music", musicTitle: "", musicArtist: "", ...fields },
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-foreground-subtle">Other notes</label>
                  <button
                    type="button"
                    onClick={addNote}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-accent hover:bg-accent/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add note
                  </button>
                </div>

                {otherNotes.length === 0 && (
                  <p className="text-[12px] text-foreground-subtle">
                    No other notes yet — add one and pick a profile (custom or saved) for it.
                  </p>
                )}

                <DndContext
                  sensors={noteSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleNoteDragEnd}
                >
                  <SortableContext
                    items={otherNotes.map((n) => n.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {otherNotes.map((note) => (
                        <SortableRow
                          key={note.id}
                          id={note.id}
                          selected={selectedItemId === note.id}
                          onSelect={() => setSelectedItemId(note.id)}
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <ProfilePicker
                                username={note.username}
                                avatar={note.avatar}
                                verified={note.verified}
                                recipientId={note.recipientId}
                                usedRecipientIds={usedRecipientIds}
                                onSelectSaved={(recipient) =>
                                  updateNote(note.id, {
                                    recipientId: recipient.id,
                                    username: recipient.username ?? recipient.name,
                                    avatar: recipient.avatar,
                                    story: recipient.story,
                                    verified: recipient.verified,
                                  })
                                }
                                onSetCustom={({ username, avatar, verified }) =>
                                  updateNote(note.id, {
                                    recipientId: undefined,
                                    username,
                                    avatar,
                                    story: undefined,
                                    verified,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() => removeNote(note.id)}
                                aria-label="Remove note"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:glass-surface hover:text-danger"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <NoteContentFields
                              note={note}
                              onChangeType={(type) =>
                                updateNote(
                                  note.id,
                                  type === "text"
                                    ? { type: "text", content: "" }
                                    : { type: "music", musicTitle: "", musicArtist: "" },
                                )
                              }
                              onChangeText={(content) => updateNote(note.id, { type: "text", content })}
                              onChangeMusic={(fields) =>
                                updateNote(note.id, {
                                  type: "music",
                                  musicTitle: note.type === "music" ? note.musicTitle : "",
                                  musicArtist: note.type === "music" ? note.musicArtist : "",
                                  ...fields,
                                })
                              }
                            />
                          </div>
                        </SortableRow>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-border pt-6">
                <label className="text-[11px] text-foreground-subtle">Requests count</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={requestsCount}
                    min={0}
                    onChange={(e) =>
                      setChatListRequestsCount(
                        project!.id,
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                    className="h-8 w-16 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 text-center text-[13px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[12px] text-foreground-subtle">
                    0 hides the label · displays as &quot;9+&quot; above 8
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-foreground-subtle">Chats</label>
                  <button
                    type="button"
                    onClick={addChat}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-accent hover:bg-accent/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add chat
                  </button>
                </div>

                {chats.length === 0 && (
                  <p className="text-[12px] text-foreground-subtle">
                    No chats yet — add one and pick a profile (custom or saved) for it.
                  </p>
                )}

                <DndContext
                  sensors={chatSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleChatDragEnd}
                >
                  <SortableContext items={chats.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                      {chats.map((chat) => (
                        <SortableRow
                          key={chat.id}
                          id={chat.id}
                          selected={selectedItemId === chat.id}
                          onSelect={() => setSelectedItemId(chat.id)}
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <ProfilePicker
                                username={chat.username}
                                avatar={chat.avatar}
                                verified={chat.verified}
                                recipientId={chat.recipientId}
                                usedRecipientIds={usedChatRecipientIds}
                                onSelectSaved={(recipient) =>
                                  updateChat(chat.id, {
                                    recipientId: recipient.id,
                                    username: recipient.username ?? recipient.name,
                                    avatar: recipient.avatar,
                                    story: recipient.story,
                                    verified: recipient.verified,
                                  })
                                }
                                onSetCustom={({ username, avatar, verified }) =>
                                  updateChat(chat.id, {
                                    recipientId: undefined,
                                    username,
                                    avatar,
                                    story: undefined,
                                    verified,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() => removeChat(chat.id)}
                                aria-label="Remove chat"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:glass-surface hover:text-danger"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex gap-1.5">
                              {(
                                [
                                  { value: "text", label: "Text" },
                                  { value: "missedVideoCall", label: "Missed video" },
                                  { value: "missedAudioCall", label: "Missed audio" },
                                  { value: "playButton", label: "Play button" },
                                ] as { value: ChatPreviewKind; label: string }[]
                              ).map((option) => {
                                const isLocked = option.value === "playButton" && quota.locked;
                                return (
                                  <TogglePill
                                    key={option.value}
                                    active={(chat.previewKind ?? "text") === option.value}
                                    onClick={() =>
                                      isLocked
                                        ? setUpgradeReason("playButton")
                                        : updateChat(chat.id, { previewKind: option.value })
                                    }
                                  >
                                    {isLocked && <Lock className="mr-1 inline h-3 w-3" />}
                                    {option.label}
                                  </TogglePill>
                                );
                              })}
                            </div>
                            <div className="flex gap-1.5">
                              {(chat.previewKind ?? "text") !== "missedVideoCall" &&
                                (chat.previewKind ?? "text") !== "missedAudioCall" && (
                                  <Input
                                    value={chat.previewText}
                                    onChange={(e) => updateChat(chat.id, { previewText: e.target.value })}
                                    placeholder="Preview text"
                                    className="h-8 flex-1 text-[13px]"
                                  />
                                )}
                              <Input
                                value={chat.time}
                                onChange={(e) => updateChat(chat.id, { time: e.target.value })}
                                placeholder="3h"
                                className="h-8 w-16 text-[13px]"
                              />
                            </div>
                            <TogglePill
                              active={chat.seen}
                              onClick={() => updateChat(chat.id, { seen: !chat.seen })}
                            >
                              {chat.seen ? "Seen" : "Unseen"}
                            </TogglePill>
                          </div>
                        </SortableRow>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}

          {leftTab === "display" && (
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-foreground-subtle">Theme</label>
                <div className="flex items-center gap-1.5">
                  <ToggleButton
                    label="Dark"
                    active={theme === "dark"}
                    onClick={() => setTheme(project!.id, "dark")}
                  />
                  <ToggleButton
                    label="Light"
                    active={theme === "light"}
                    onClick={() => setTheme(project!.id, "light")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-foreground-subtle">Status bar</label>
                <ToggleButton
                  label={statusBarVisible ? "Visible" : "Hidden"}
                  active={statusBarVisible}
                  onClick={() => setStatusBar(project!.id, { visible: !statusBarVisible })}
                />
              </div>

              {statusBarVisible && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-foreground-subtle">Time</label>
                    <TimePicker
                      hour={statusBarHour}
                      minute={statusBarMinute}
                      meridiem={statusBarMeridiem}
                      showMeridiem={statusBarShowMeridiem}
                      onChangeHour={(h) => setStatusBar(project!.id, { hour: h })}
                      onChangeMinute={(m) => setStatusBar(project!.id, { minute: m })}
                      onChangeMeridiem={(mer) => setStatusBar(project!.id, { meridiem: mer })}
                      onChangeShowMeridiem={(show) =>
                        setStatusBar(project!.id, { showMeridiem: show })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-foreground-subtle">Battery</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={statusBarBattery}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          setStatusBar(project!.id, {
                            battery: clamp(Number(e.target.value), 0, 100),
                          })
                        }
                        className="h-8 w-16 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 text-center text-[13px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[12px] text-foreground-subtle">%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-foreground-subtle">SIM cards</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <ToggleButton
                          label="1"
                          active={statusBarSimCount === 1}
                          onClick={() => setStatusBar(project!.id, { simCount: 1 })}
                        />
                        <ToggleButton
                          label="2"
                          active={statusBarSimCount === 2}
                          onClick={() => setStatusBar(project!.id, { simCount: 2 })}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 pl-3">
                        <span className="text-[11px] text-foreground-subtle">SIM 1</span>
                        <BarLevelPicker
                          value={statusBarSim1Bars}
                          onChange={(bars) => setStatusBar(project!.id, { sim1Bars: bars })}
                        />
                        <SignalBars
                          bars={statusBarSim1Bars}
                          className="h-[14px] w-[22px] text-foreground-muted"
                        />
                      </div>

                      {statusBarSimCount === 2 && (
                        <div className="flex items-center gap-1.5 pl-3">
                          <span className="text-[11px] text-foreground-subtle">SIM 2</span>
                          <BarLevelPicker
                            value={statusBarSim2Bars}
                            onChange={(bars) => setStatusBar(project!.id, { sim2Bars: bars })}
                          />
                          <SignalBars
                            bars={statusBarSim2Bars}
                            className="h-[14px] w-[22px] text-foreground-muted"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-foreground-subtle">Wi-Fi</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <ToggleButton
                        label={statusBarWifiEnabled ? "On" : "Off"}
                        active={statusBarWifiEnabled}
                        onClick={() =>
                          setStatusBar(project!.id, { wifiEnabled: !statusBarWifiEnabled })
                        }
                      />
                      {statusBarWifiEnabled && (
                        <div className="flex items-center gap-1.5">
                          <BarLevelPicker
                            value={statusBarWifiBars}
                            onChange={(bars) => setStatusBar(project!.id, { wifiBars: bars })}
                          />
                          <WifiGlyph
                            bars={statusBarWifiBars}
                            className="h-[14px] w-[20px] text-foreground-muted"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className="flex flex-1 flex-col bg-bg-elevated/40 backdrop-blur-md">
          <IosFrame screenRef={screenRef} flattened={flattenFrame}>
            <InstagramChatListPreview
              meUsername={meUsername || "your_username"}
              showAccountSwitcher={showAccountSwitcher}
              notes={notes}
              chats={chats}
              requestsCount={requestsCount}
              theme={theme}
              onSelectItem={selectItem}
              statusBar={{
                visible: statusBarVisible,
                hour: statusBarHour,
                minute: statusBarMinute,
                meridiem: statusBarMeridiem,
                showMeridiem: statusBarShowMeridiem,
                battery: statusBarBattery,
                simCount: statusBarSimCount,
                sim1Bars: statusBarSim1Bars,
                sim2Bars: statusBarSim2Bars,
                wifiEnabled: statusBarWifiEnabled,
                wifiBars: statusBarWifiBars,
              }}
            />
          </IosFrame>
        </section>
      </div>

      <UpgradeDialog
        open={upgradeReason !== null}
        onOpenChange={(open) => !open && setUpgradeReason(null)}
        title={
          upgradeReason === "playButton"
            ? "Play button is a Pro feature"
            : "You've used all 3 free exports"
        }
        description={
          upgradeReason === "playButton"
            ? "Upgrade to Pro for unlimited exports, plus full access to the play-button preview and more."
            : "Upgrade to Pro for unlimited exports, plus full access to Reels, Stories, and Voice messages."
        }
      />
    </div>
  );
}
