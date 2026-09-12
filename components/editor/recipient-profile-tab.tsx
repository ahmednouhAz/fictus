"use client";

import * as React from "react";
import { AtSign, Bookmark, Camera, Check, ChevronDown, Eye, EyeOff, UserPlus } from "lucide-react";
import { EditableText } from "@/components/ui/editable-text";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { resizeImageToDataUrl } from "@/lib/image";
import { useProjectStore } from "@/stores/useProjectStore";
import { useRecipientStore } from "@/stores/useRecipientStore";
import type { Project, ProfileCardRelationship, RecipientStory } from "@/schemas/project";
import { cn } from "@/lib/utils";

const STORY_OPTIONS: { value: RecipientStory; label: string }[] = [
  { value: "none", label: "No story" },
  { value: "unseen", label: "Unseen story" },
  { value: "seen", label: "Seen story" },
];

const RELATIONSHIP_OPTIONS: { value: ProfileCardRelationship; label: string }[] = [
  { value: "mutual", label: "Follow each other" },
  { value: "followsYou", label: "Follows you" },
  { value: "followedSince", label: "Followed since" },
  { value: "notMutual", label: "Don't follow each other" },
];

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

// Dropdown of every saved recipient (avatar + username), filterable by a
// search bar at the top — picking one copies its fields onto the current
// project and links it, so future edits sync back (see applySavedRecipient
// / the syncRecipient calls in useProjectStore).
function SavedProfilePicker({ project }: { project: Project }) {
  const recipients = useRecipientStore((s) => s.recipients);
  const applySavedRecipient = useProjectStore((s) => s.applySavedRecipient);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const linked = project.recipientId
    ? recipients.find((r) => r.id === project.recipientId)
    : undefined;

  const filtered = recipients.filter((r) =>
    (r.username ?? r.name).toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex flex-1 items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-left text-[13px] text-foreground transition-colors hover:glass-surface"
        >
          {linked ? (
            <>
              <InstagramAvatar name={linked.name} avatarUrl={linked.avatar} size={20} />
              <span className="truncate">{linked.username ?? linked.name}</span>
            </>
          ) : (
            <span className="truncate text-foreground-subtle">Load saved profile…</span>
          )}
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-foreground-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 py-1.5">
          <AtSign className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username…"
            className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-subtle"
          />
        </div>
        <div className="mt-1.5 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {recipients.length === 0 && (
            <p className="px-2 py-1.5 text-[12px] text-foreground-subtle">
              No saved profiles yet — use the save button to add this one.
            </p>
          )}
          {recipients.length > 0 && filtered.length === 0 && (
            <p className="px-2 py-1.5 text-[12px] text-foreground-subtle">No matches.</p>
          )}
          {filtered.map((recipient) => (
            <button
              key={recipient.id}
              type="button"
              onClick={() => {
                applySavedRecipient(project.id, recipient);
                setOpen(false);
                setSearch("");
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:glass-surface"
            >
              <InstagramAvatar name={recipient.name} avatarUrl={recipient.avatar} size={20} />
              <span className="truncate">{recipient.username ?? recipient.name}</span>
              {recipient.id === project.recipientId && (
                <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-accent" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RecipientProfileTab({ project }: { project: Project }) {
  const setRecipientName = useProjectStore((s) => s.setRecipientName);
  const setRecipientNameHidden = useProjectStore((s) => s.setRecipientNameHidden);
  const setRecipientUsername = useProjectStore((s) => s.setRecipientUsername);
  const setRecipientAvatar = useProjectStore((s) => s.setRecipientAvatar);
  const setRecipientVerified = useProjectStore((s) => s.setRecipientVerified);
  const setRecipientStory = useProjectStore((s) => s.setRecipientStory);
  const setProfileCard = useProjectStore((s) => s.setProfileCard);
  const saveRecipientFromProject = useProjectStore((s) => s.saveRecipientFromProject);
  const resetRecipient = useProjectStore((s) => s.resetRecipient);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  // Some Instagram accounts have no display name — the header/profile card
  // then show the username in its place. This just flips a hidden flag
  // rather than clearing recipientName, so the typed name is never lost
  // and clicking the eye again restores it exactly.
  const displayNameHidden = !!project.recipientNameHidden;

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { dataUrl } = await resizeImageToDataUrl(file, 400, 0.85);
      setRecipientAvatar(project.id, dataUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
      <div className="flex items-center gap-2">
        <SavedProfilePicker project={project} />
        <button
          type="button"
          onClick={() => saveRecipientFromProject(project.id)}
          aria-label={project.recipientId ? "Update saved profile" : "Save as new profile"}
          title={project.recipientId ? "Update saved profile" : "Save as new profile"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-foreground-subtle transition-colors hover:glass-surface hover:text-accent"
        >
          <Bookmark className={cn("h-3.5 w-3.5", project.recipientId && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={() => resetRecipient(project.id)}
          aria-label="Start a new profile"
          title="Start a new profile"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-foreground-subtle transition-colors hover:glass-surface hover:text-accent"
        >
          <UserPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="group relative rounded-full"
            aria-label="Change profile picture"
          >
            <InstagramAvatar
              name={project.recipientName}
              avatarUrl={project.recipientAvatar}
              size={88}
              story={project.recipientStory ?? "none"}
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
              <Camera className="h-5 w-5" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRecipientVerified(project.id, !project.recipientVerified)}
            aria-label={project.recipientVerified ? "Remove verified badge" : "Add verified badge"}
            className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black"
          >
            <VerifiedBadge size={18} color={project.recipientVerified ? "#0095F6" : "#8e8e8e"} />
          </button>
        </div>
        {project.recipientAvatar && (
          <button
            type="button"
            onClick={() => setRecipientAvatar(project.id, null)}
            className="text-[12px] text-foreground-subtle hover:text-danger"
          >
            Remove photo
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

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-[11px] text-foreground-subtle">Username</label>
          <EditableText
            value={project.recipientUsername ?? ""}
            onChange={(username) => setRecipientUsername(project.id, username)}
            placeholder="username"
            className="text-[14px] text-foreground"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <label className="text-[11px] text-foreground-subtle">Display name</label>
            <button
              type="button"
              onClick={() => setRecipientNameHidden(project.id, !displayNameHidden)}
              aria-label={displayNameHidden ? "Show display name" : "Hide display name"}
              className="text-foreground-subtle hover:text-foreground"
            >
              {displayNameHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <EditableText
            value={project.recipientName}
            onChange={(name) => setRecipientName(project.id, name)}
            placeholder="No display name"
            className={cn(
              "text-[14px] font-medium text-foreground",
              displayNameHidden && "text-foreground-subtle italic",
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-foreground-subtle">Story</label>
        <div className="flex gap-1.5">
          {STORY_OPTIONS.map((option) => (
            <TogglePill
              key={option.value}
              active={(project.recipientStory ?? "none") === option.value}
              onClick={() => setRecipientStory(project.id, option.value)}
            >
              {option.label}
            </TogglePill>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-6">
        <label className="text-[11px] text-foreground-subtle">Profile card</label>
        <TogglePill
          active={!!project.profileCardEnabled}
          onClick={() => setProfileCard(project.id, { enabled: !project.profileCardEnabled })}
        >
          {project.profileCardEnabled ? "Shown at top of chat" : "Hidden"}
        </TogglePill>
      </div>

      {project.profileCardEnabled && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-foreground-subtle">Followers</label>
              <Input
                value={project.profileCardFollowers ?? ""}
                onChange={(e) => setProfileCard(project.id, { followers: e.target.value })}
                placeholder="10.5K"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-foreground-subtle">Posts</label>
              <Input
                type="number"
                min={0}
                value={project.profileCardPosts ?? 0}
                onChange={(e) =>
                  setProfileCard(project.id, { posts: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Relationship</label>
            <div className="flex flex-wrap gap-1.5">
              {RELATIONSHIP_OPTIONS.map((option) => (
                <TogglePill
                  key={option.value}
                  active={project.profileCardRelationship === option.value}
                  onClick={() => setProfileCard(project.id, { relationship: option.value })}
                >
                  {option.label}
                </TogglePill>
              ))}
            </div>
          </div>

          {project.profileCardRelationship === "followedSince" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-foreground-subtle">Since year</label>
              <Input
                type="number"
                value={project.profileCardFollowedSinceYear ?? new Date().getFullYear()}
                onChange={(e) =>
                  setProfileCard(project.id, { followedSinceYear: Number(e.target.value) || undefined })
                }
                className="w-24"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Extra note</label>
            <Input
              value={project.profileCardNote ?? ""}
              onChange={(e) => setProfileCard(project.id, { note: e.target.value })}
              placeholder={`You both follow ${project.recipientUsername || "username0"} and 2 others`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">View profile button</label>
            <TogglePill
              active={!!project.profileCardShowViewProfileButton}
              onClick={() =>
                setProfileCard(project.id, {
                  showViewProfileButton: !project.profileCardShowViewProfileButton,
                })
              }
            >
              {project.profileCardShowViewProfileButton ? "Shown" : "Hidden"}
            </TogglePill>
          </div>
        </>
      )}
    </div>
  );
}
