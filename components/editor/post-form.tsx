"use client";

import * as React from "react";
import { Check, Upload, X } from "lucide-react";
import { resizeImageToDataUrl } from "@/lib/image";
import { ToggleButton } from "@/components/editor/toggle-button";
import { PostCard } from "@/components/preview/post-card";
import type { PhotoItem } from "@/schemas/conversation-item";

export type PostDraft = {
  thumbnail?: PhotoItem;
  ownerUsername: string;
  ownerAvatar?: string;
  verified: boolean;
  caption: string;
  isCarousel: boolean;
};

export function PostForm({
  fields,
  onChange,
  onConfirm,
  onCancel,
}: {
  fields: PostDraft;
  onChange: (fields: PostDraft) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const thumbInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  async function handleThumbnail(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const resized = await resizeImageToDataUrl(file);
    onChange({ ...fields, thumbnail: { id: crypto.randomUUID(), ...resized } });
  }

  async function handleAvatar(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const resized = await resizeImageToDataUrl(file, 200, 0.85);
    onChange({ ...fields, ownerAvatar: resized.dataUrl });
  }

  return (
    <div className="flex w-72 flex-col gap-3">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => thumbInputRef.current?.click()}
          aria-label="Upload thumbnail"
          className="shrink-0"
        >
          {fields.thumbnail ? (
            <PostCard
              thumbnail={fields.thumbnail}
              ownerUsername={fields.ownerUsername}
              ownerAvatar={fields.ownerAvatar}
              verified={fields.verified}
              caption={fields.caption}
              isCarousel={fields.isCarousel}
              scale={0.4}
            />
          ) : (
            <div className="flex h-[141px] w-[96px] items-center justify-center rounded-2xl border border-dashed border-border text-foreground-subtle transition-colors hover:border-accent/50 hover:text-accent">
              <Upload className="h-4 w-4" />
            </div>
          )}
        </button>
        <input
          ref={thumbInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleThumbnail(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            aria-label="Upload owner avatar"
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-border text-foreground-subtle transition-colors hover:border-accent/50 hover:text-accent"
          >
            {fields.ownerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fields.ownerAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleAvatar(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <input
            value={fields.ownerUsername}
            onChange={(e) => onChange({ ...fields, ownerUsername: e.target.value })}
            placeholder="username"
            className="h-8 w-full rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 text-[13px] text-foreground outline-none focus-visible:border-accent/60"
          />

          <ToggleButton
            label="Verified"
            active={fields.verified}
            onClick={() => onChange({ ...fields, verified: !fields.verified })}
          />
          <ToggleButton
            label="Carousel"
            active={fields.isCarousel}
            onClick={() => onChange({ ...fields, isCarousel: !fields.isCarousel })}
          />
        </div>
      </div>

      <textarea
        value={fields.caption}
        onChange={(e) => onChange({ ...fields, caption: e.target.value })}
        placeholder="Caption"
        rows={2}
        className="w-full resize-none rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 py-1.5 text-[13px] text-foreground outline-none focus-visible:border-accent/60"
      />

      <div className="flex items-center justify-end gap-0.5">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!fields.thumbnail}
          aria-label="Confirm"
          className="flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10 disabled:opacity-30"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-danger"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
