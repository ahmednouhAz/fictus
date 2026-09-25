"use client";

import * as React from "react";
import { Camera, Check, ChevronDown } from "lucide-react";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useRecipientStore } from "@/stores/useRecipientStore";
import type { SavedRecipient } from "@/schemas/recipient";
import { resizeImageToDataUrl } from "@/lib/image";

// Picks the profile an item (chat-list note/row, follow-request row, ...)
// belongs to — either a saved recipient (auto-fills username/avatar and
// syncs if that recipient changes later) or a custom, one-off name typed
// directly. Saved recipients already used by another item in the same list
// are hidden so the same person can't be picked twice.
export function ProfilePicker({
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
  // Defensively falls back to "" — `username` is typed as required, but
  // rows carried over from before a schema field rename (or any other
  // stale persisted state) can still hand this a real `undefined` at
  // runtime, and `undefined.trim()` below would otherwise crash the picker.
  const [customDraft, setCustomDraft] = React.useState(username ?? "");
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
          setCustomDraft(username ?? "");
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
