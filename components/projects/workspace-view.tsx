"use client";

import * as React from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { ArrowLeft, Star, Undo2, Redo2, Download } from "lucide-react";
import { useProjectStore } from "@/stores/useProjectStore";
import { useEditorStore } from "@/stores/useEditorStore";
import { EditableText } from "@/components/ui/editable-text";
import { MessageList } from "@/components/editor/message-list";
import { RecipientProfileTab } from "@/components/editor/recipient-profile-tab";
import { DisplaySettingsTab } from "@/components/editor/display-settings-tab";
import { ChatListWorkspaceView } from "@/components/projects/chat-list-workspace-view";
import { NotificationWorkspaceView } from "@/components/projects/notification-workspace-view";
import { FollowRequestsWorkspaceView } from "@/components/projects/follow-requests-workspace-view";
import { GenericPreview } from "@/components/preview/generic-preview";
import { InstagramPreview } from "@/components/preview/instagram/instagram-preview";
import { IosFrame } from "@/components/preview/ios-frame";
import { captureElementViaScreen } from "@/lib/screenshot";
import { useExportQuota } from "@/components/paywall/export-quota-provider";
import { formatExportsLeftLabel } from "@/lib/export-quota";
import { PolarCheckoutLink } from "@/components/landing/polar-checkout-link";
import { cn } from "@/lib/utils";

const POLAR_PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;

type LeftTab = "conversation" | "profile" | "display";

const LEFT_TABS: { value: LeftTab; label: string }[] = [
  { value: "conversation", label: "Conversation" },
  { value: "profile", label: "Profile" },
  { value: "display", label: "Display" },
];

export function WorkspaceView({ projectId }: { projectId: string }) {
  const hasHydrated = useProjectStore((s) => s.hasHydrated);
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId),
  );
  const renameProject = useProjectStore((s) => s.renameProject);
  const toggleFavorite = useProjectStore((s) => s.toggleFavorite);

  const [leftTab, setLeftTab] = React.useState<LeftTab>("conversation");
  const screenRef = React.useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = React.useState(false);
  const [flattenFrame, setFlattenFrame] = React.useState(false);
  const clerk = useClerk();
  const { isSignedIn, quota, consume } = useExportQuota();

  async function handleExport() {
    if (!screenRef.current) return;
    if (!isSignedIn) {
      // Keep the user on this page after sign-in instead of falling back
      // to NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL (the landing
      // page) — forceRedirectUrl takes precedence over that env default.
      // signUpForceRedirectUrl covers the same case when someone clicks
      // "Sign up" from inside the sign-in modal instead.
      clerk.openSignIn({
        forceRedirectUrl: window.location.href,
        signUpForceRedirectUrl: window.location.href,
      });
      return;
    }
    setExporting(true);
    try {
      // Briefly drop the frame's rounded corners/bezel shadow — a screen
      // capture crop is always a plain rectangle, and a plain rectangle
      // can never cleanly bound a rounded shape, so with no rounding
      // present during the capture instant there's nothing for that
      // mismatch to expose. Restored immediately after.
      setFlattenFrame(true);
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      // Exports are never blocked — past the free limit they're
      // watermarked instead, per `quota.locked` (already exactly "free
      // limit exceeded").
      const dataUrl = await captureElementViaScreen(screenRef.current, {
        watermark: quota.locked,
      });
      const link = document.createElement("a");
      link.download = `${project?.name || "conversation"}.png`;
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

  const loadProject = useEditorStore((s) => s.loadProject);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const selectedItemId = useEditorStore((s) => s.selectedItemId);
  const duplicateItem = useEditorStore((s) => s.duplicateItem);
  const deleteItem = useEditorStore((s) => s.deleteItem);
  const select = useEditorStore((s) => s.select);

  React.useEffect(() => {
    if (hasHydrated) loadProject(projectId);
  }, [hasHydrated, projectId, loadProject]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isTyping) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && selectedItemId) {
        e.preventDefault();
        duplicateItem(selectedItemId);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedItemId) {
        e.preventDefault();
        deleteItem(selectedItemId);
        return;
      }
      if (e.key === "Escape") {
        select(null);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, selectedItemId, duplicateItem, deleteItem, select]);

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

  if (project.kind === "chatList") {
    return <ChatListWorkspaceView projectId={projectId} />;
  }

  if (project.kind === "notification") {
    return <NotificationWorkspaceView projectId={projectId} />;
  }

  if (project.kind === "followRequests") {
    return <FollowRequestsWorkspaceView projectId={projectId} />;
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
          {(project.device ?? "ios") === "ios" && project.platform === "instagram" && (
            <>
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
            </>
          )}
          <button
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted transition-colors hover:glass-surface hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted transition-colors hover:glass-surface hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
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

          {leftTab === "conversation" && (
            <MessageList
              items={project.items}
              recipientName={project.recipientName}
              disableMeSender={project.conversationKind === "messageRequest"}
            />
          )}
          {leftTab === "profile" && <RecipientProfileTab project={project} />}
          {leftTab === "display" && <DisplaySettingsTab project={project} />}
        </section>
        <section className="flex flex-1 flex-col bg-bg-elevated/40 backdrop-blur-md">
          {project.platform === "instagram" ? (
            (project.device ?? "ios") === "ios" ? (
              <IosFrame screenRef={screenRef} flattened={flattenFrame}>
                <InstagramPreview
                  recipientName={project.recipientName}
                  recipientNameHidden={project.recipientNameHidden}
                  recipientUsername={project.recipientUsername}
                  recipientAvatar={project.recipientAvatar}
                  recipientStory={project.recipientStory}
                  recipientVerified={project.recipientVerified}
                  profileCard={{
                    enabled: project.profileCardEnabled,
                    followers: project.profileCardFollowers,
                    posts: project.profileCardPosts,
                    relationship: project.profileCardRelationship,
                    followedSinceYear: project.profileCardFollowedSinceYear,
                    note: project.profileCardNote,
                    showViewProfileButton: project.profileCardShowViewProfileButton,
                  }}
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
                  items={project.items}
                  isMessageRequest={project.conversationKind === "messageRequest"}
                  theme={project.theme}
                />
              </IosFrame>
            ) : (
              <InstagramPreview
                recipientName={project.recipientName}
                recipientNameHidden={project.recipientNameHidden}
                recipientUsername={project.recipientUsername}
                recipientAvatar={project.recipientAvatar}
                recipientStory={project.recipientStory}
                recipientVerified={project.recipientVerified}
                profileCard={{
                  enabled: project.profileCardEnabled,
                  followers: project.profileCardFollowers,
                  posts: project.profileCardPosts,
                  relationship: project.profileCardRelationship,
                  followedSinceYear: project.profileCardFollowedSinceYear,
                  note: project.profileCardNote,
                  showViewProfileButton: project.profileCardShowViewProfileButton,
                }}
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
                items={project.items}
                isMessageRequest={project.conversationKind === "messageRequest"}
                theme={project.theme}
              />
            )
          ) : (
            <GenericPreview
              recipientName={project.recipientName}
              items={project.items}
            />
          )}
        </section>
      </div>
    </div>
  );
}
