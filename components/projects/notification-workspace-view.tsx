"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Download, ImageUp, Star, Trash2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useExportQuota } from "@/components/paywall/export-quota-provider";
import { formatExportsLeftLabel } from "@/lib/export-quota";
import { PolarCheckoutLink } from "@/components/landing/polar-checkout-link";
import { IosFrame } from "@/components/preview/ios-frame";
import { NotificationOverlayPreview } from "@/components/preview/notification-overlay-preview";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { EditableText } from "@/components/ui/editable-text";
import { Input } from "@/components/ui/input";
import { ToggleButton } from "@/components/editor/toggle-button";
import { useProjectStore } from "@/stores/useProjectStore";
import { resizeImageToDataUrl } from "@/lib/image";
import { captureElementViaScreen } from "@/lib/screenshot";
import { cn } from "@/lib/utils";

const POLAR_PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;

// Larger than the default (900px) since this image fills the whole export
// canvas edge to edge rather than sitting in a small avatar/thumbnail slot.
const BACKGROUND_MAX_DIMENSION = 1400;
const AVATAR_MAX_DIMENSION = 400;

export function NotificationWorkspaceView({ projectId }: { projectId: string }) {
  const hasHydrated = useProjectStore((s) => s.hasHydrated);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const renameProject = useProjectStore((s) => s.renameProject);
  const toggleFavorite = useProjectStore((s) => s.toggleFavorite);
  const setTheme = useProjectStore((s) => s.setTheme);
  const setNotificationBackground = useProjectStore((s) => s.setNotificationBackground);
  const setNotificationAvatar = useProjectStore((s) => s.setNotificationAvatar);
  const setNotificationContent = useProjectStore((s) => s.setNotificationContent);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const screenRef = React.useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = React.useState(false);
  const [flattenFrame, setFlattenFrame] = React.useState(false);
  const clerk = useClerk();
  const { isSignedIn, quota, consume } = useExportQuota();

  async function handleUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { dataUrl, width, height } = await resizeImageToDataUrl(
        file,
        BACKGROUND_MAX_DIMENSION,
        0.85,
      );
      setNotificationBackground(project!.id, { dataUrl, width, height });
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingAvatar(true);
    try {
      const { dataUrl } = await resizeImageToDataUrl(file, AVATAR_MAX_DIMENSION, 0.85);
      setNotificationAvatar(project!.id, dataUrl);
    } finally {
      setUploadingAvatar(false);
    }
  }

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
      link.download = `${project?.name || "notification"}.png`;
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

  const theme = project.theme ?? "dark";
  const username = project.notificationTitle ?? "username";
  const body = project.notificationBody ?? "sent you a message";

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
        <section className="flex w-[44%] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-bg-elevated/20 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Banner appearance</label>
            <div className="flex items-center gap-1.5">
              <ToggleButton label="Dark" active={theme === "dark"} onClick={() => setTheme(project.id, "dark")} />
              <ToggleButton
                label="Light"
                active={theme === "light"}
                onClick={() => setTheme(project.id, "light")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border pt-6">
            <label className="text-[11px] text-foreground-subtle">Background screenshot</label>
            {project.notificationBackgroundImage ? (
              <div className="flex items-center gap-2">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.notificationBackgroundImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-foreground-muted transition-colors hover:glass-surface hover:text-foreground disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  aria-label="Remove background image"
                  onClick={() => setNotificationBackground(project.id, null)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:glass-surface hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-foreground-subtle transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
              >
                <ImageUp className="h-5 w-5" />
                <span className="text-[12px]">{uploading ? "Uploading…" : "Upload a screenshot"}</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border pt-6">
            <label className="text-[11px] text-foreground-subtle">Profile picture</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Upload profile picture"
                className="shrink-0 rounded-full disabled:opacity-50"
              >
                <InstagramAvatar name={username || "?"} avatarUrl={project.notificationAvatar} size={44} />
              </button>
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-foreground-muted transition-colors hover:glass-surface hover:text-foreground disabled:opacity-50"
              >
                {uploadingAvatar ? "Uploading…" : project.notificationAvatar ? "Replace" : "Upload"}
              </button>
              {project.notificationAvatar && (
                <button
                  type="button"
                  aria-label="Remove profile picture"
                  onClick={() => setNotificationAvatar(project.id, null)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:glass-surface hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleAvatarUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Username</label>
            <Input
              value={username}
              onChange={(e) => setNotificationContent(project.id, { title: e.target.value })}
              placeholder="username"
              className="h-9 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Message (up to 3 lines)</label>
            <Input
              value={body}
              onChange={(e) => setNotificationContent(project.id, { body: e.target.value })}
              placeholder="sent you a message"
              className="h-9 text-[13px]"
            />
          </div>

        </section>

        <section className="flex flex-1 flex-col bg-bg-elevated/40 backdrop-blur-md">
          <IosFrame screenRef={screenRef} flattened={flattenFrame} dynamicIsland={false}>
            <NotificationOverlayPreview
              backgroundImage={project.notificationBackgroundImage}
              avatar={project.notificationAvatar}
              username={username}
              body={body}
              theme={theme}
            />
          </IosFrame>
        </section>
      </div>
    </div>
  );
}
