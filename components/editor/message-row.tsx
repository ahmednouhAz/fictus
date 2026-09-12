"use client";

import * as React from "react";
import { ArrowLeftRight, Check, Mic, CornerUpLeft, Shuffle } from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";
import { ItemRowShell } from "@/components/editor/item-row-shell";
import { MessageReactionPicker } from "@/components/editor/message-reaction-picker";
import { TimePicker } from "@/components/editor/time-picker";
import { PhotoUploadEditor } from "@/components/editor/photo-upload-editor";
import { ReelForm, type ReelDraft } from "@/components/editor/reel-form";
import { StoryForm, type StoryDraft } from "@/components/editor/story-form";
import { VoiceDurationInput } from "@/components/editor/voice-duration-input";
import { VoiceWaveformEditor } from "@/components/editor/voice-waveform-editor";
import { PostForm, type PostDraft } from "@/components/editor/post-form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CallIcon } from "@/components/preview/call-icon";
import { PhotoStack } from "@/components/preview/photo-stack";
import { ReelCard } from "@/components/preview/reel-card";
import { StoryCard } from "@/components/preview/story-card";
import { PostCard } from "@/components/preview/post-card";
import {
  computeBarCount,
  generateDefaultBarHeights,
  generateRandomBarHeights,
} from "@/components/preview/voice-note-bubble";
import { clockFromTimestamp, formatCallTime, formatCallTitle, formatVoiceDuration } from "@/lib/format";
import type { MessageItem, PhotoItem } from "@/schemas/conversation-item";
import { cn } from "@/lib/utils";

export function MessageRow({
  message,
  disableMeSender,
}: {
  message: MessageItem;
  disableMeSender?: boolean;
}) {
  const selectedId = useEditorStore((s) => s.selectedItemId);
  const select = useEditorStore((s) => s.select);
  const updateContent = useEditorStore((s) => s.updateMessageContent);
  const updateSender = useEditorStore((s) => s.updateMessageSender);
  const setEdited = useEditorStore((s) => s.setMessageEdited);

  // A freshly-created reply starts out empty and selected — jump straight
  // into editing it instead of making the user click the bubble first.
  const [editingContent, setEditingContent] = React.useState(
    () => message.type === "text" && message.content === "" && selectedId === message.id,
  );
  const [draft, setDraft] = React.useState(message.content);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (editingContent) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [editingContent]);

  function commitContent() {
    updateContent(message.id, draft);
    setEditingContent(false);
  }

  return (
    <ItemRowShell
      id={message.id}
      selected={selectedId === message.id}
      onSelect={() => select(message.id)}
      extraAction={<ReplyMenuButton messageId={message.id} />}
    >
      <div className="mb-1 flex items-center gap-2">
        {message.replyTo && (
          <span className="flex items-center gap-0.5 text-[11px] text-foreground-subtle">
            <CornerUpLeft className="h-3 w-3" />
            Reply
          </span>
        )}
        {!disableMeSender && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateSender(message.id, message.sender === "me" ? "recipient" : "me");
              }}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                message.sender === "me"
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border text-foreground-subtle",
              )}
            >
              {message.sender === "me" ? "Me" : "Recipient"}
            </button>
            <SwapSenderButton message={message} />
          </>
        )}
        <MessageReactionPicker messageId={message.id} reaction={message.reaction} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEdited(message.id, !message.edited);
          }}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
            message.edited
              ? "border-accent/50 bg-accent/15 text-accent"
              : "border-border text-foreground-subtle",
          )}
        >
          Edited
        </button>
      </div>

      {message.type === "call" ? (
        <CallTimeRow message={message} />
      ) : message.type === "photo" ? (
        <PhotoStyleRow message={message} />
      ) : message.type === "reel" ? (
        <ReelStyleRow message={message} />
      ) : message.type === "story" ? (
        <StoryStyleRow message={message} />
      ) : message.type === "voice" ? (
        <VoiceStyleRow message={message} />
      ) : message.type === "post" ? (
        <PostStyleRow message={message} />
      ) : editingContent ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={commitContent}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitContent();
            }
            if (e.key === "Escape") {
              setDraft(message.content);
              setEditingContent(false);
            }
          }}
          rows={Math.min(6, Math.max(1, draft.split("\n").length))}
          className="w-full resize-none rounded-md border border-accent/50 bg-surface px-2 py-1.5 text-sm text-foreground outline-none ring-2 ring-accent/30"
        />
      ) : (
        <p
          onClick={(e) => {
            e.stopPropagation();
            setDraft(message.content);
            setEditingContent(true);
          }}
          className="whitespace-pre-wrap break-words rounded-md px-2 py-1.5 text-sm text-foreground hover:glass-surface"
        >
          {message.content}
        </p>
      )}
    </ItemRowShell>
  );
}

function ReplyMenuButton({ messageId }: { messageId: string }) {
  const addReply = useEditorStore((s) => s.addReply);
  const [open, setOpen] = React.useState(false);

  function reply(sender: "me" | "recipient") {
    addReply(messageId, sender, "");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Reply"
          className="flex h-6 w-6 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-foreground"
        >
          <CornerUpLeft className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-1 text-[11px] text-foreground-subtle">Reply as</span>
          <button
            type="button"
            onClick={() => reply("recipient")}
            className="rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:glass-surface"
          >
            Recipient
          </button>
          <button
            type="button"
            onClick={() => reply("me")}
            className="rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:glass-surface"
          >
            Me
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SwapSenderButton({ message }: { message: MessageItem }) {
  const updateSender = useEditorStore((s) => s.updateMessageSender);
  const [spinCount, setSpinCount] = React.useState(0);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    updateSender(message.id, message.sender === "me" ? "recipient" : "me");
    setSpinCount((c) => c + 1);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Swap sender and recipient"
      title="Swap sender and recipient"
      className="flex h-5 w-5 items-center justify-center rounded text-foreground-subtle transition-colors hover:text-accent"
    >
      <span
        key={spinCount}
        className={cn("inline-flex", spinCount > 0 && "[animation:swap-spin_0.35s_ease-in-out]")}
      >
        <ArrowLeftRight className="h-3 w-3" />
      </span>
    </button>
  );
}

// A completed call is stored as two linked items (started + ended, via
// pairId) but edited as one unit: one sender toggle, one time editor
// covering both timestamps, one drag handle, one duplicate/delete.
export function CallPairRow({
  started,
  ended,
  disableMeSender,
}: {
  started: MessageItem;
  ended: MessageItem;
  disableMeSender?: boolean;
}) {
  const selectedId = useEditorStore((s) => s.selectedItemId);
  const select = useEditorStore((s) => s.select);
  const updateSender = useEditorStore((s) => s.updateMessageSender);
  const setEdited = useEditorStore((s) => s.setMessageEdited);
  const selected = selectedId === started.id || selectedId === ended.id;

  return (
    <ItemRowShell id={started.id} selected={selected} onSelect={() => select(started.id)}>
      <div className="mb-1 flex items-center gap-2">
        {!disableMeSender && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateSender(started.id, started.sender === "me" ? "recipient" : "me");
              }}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                started.sender === "me"
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border text-foreground-subtle",
              )}
            >
              {started.sender === "me" ? "Me" : "Recipient"}
            </button>
            <SwapSenderButton message={started} />
          </>
        )}
        <MessageReactionPicker messageId={started.id} reaction={started.reaction} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEdited(started.id, !started.edited);
          }}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
            started.edited
              ? "border-accent/50 bg-accent/15 text-accent"
              : "border-border text-foreground-subtle",
          )}
        >
          Edited
        </button>
      </div>

      <CallPairTimeRow started={started} ended={ended} />
    </ItemRowShell>
  );
}

function CallPairTimeRow({ started, ended }: { started: MessageItem; ended: MessageItem }) {
  const updateCallTime = useEditorStore((s) => s.updateCallTime);
  const [open, setOpen] = React.useState(false);
  const initialStart = clockFromTimestamp(started.timestamp);
  const initialEnd = clockFromTimestamp(ended.timestamp);
  const [startHour, setStartHour] = React.useState(initialStart.hour);
  const [startMinute, setStartMinute] = React.useState(initialStart.minute);
  const [startMeridiem, setStartMeridiem] = React.useState(initialStart.meridiem);
  const [endHour, setEndHour] = React.useState(initialEnd.hour);
  const [endMinute, setEndMinute] = React.useState(initialEnd.minute);
  const [endMeridiem, setEndMeridiem] = React.useState(initialEnd.meridiem);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      const s = clockFromTimestamp(started.timestamp);
      const e = clockFromTimestamp(ended.timestamp);
      setStartHour(s.hour);
      setStartMinute(s.minute);
      setStartMeridiem(s.meridiem);
      setEndHour(e.hour);
      setEndMinute(e.minute);
      setEndMeridiem(e.meridiem);
    }
  }

  function save() {
    updateCallTime(started.id, { hour: startHour, minute: startMinute, meridiem: startMeridiem });
    updateCallTime(ended.id, { hour: endHour, minute: endMinute, meridiem: endMeridiem });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:glass-surface"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover">
            <CallIcon
              kind={started.callKind ?? "audio"}
              phase="ended"
              className="h-3.5 w-3.5 text-foreground-muted"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-foreground">
              {formatCallTitle(started.callKind ?? "audio", "ended")}
            </span>
            <span className="text-[11px] leading-tight text-foreground-subtle">
              {formatCallTime(started.timestamp)} – {formatCallTime(ended.timestamp)}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-foreground-subtle">Started</span>
            <TimePicker
              hour={startHour}
              minute={startMinute}
              meridiem={startMeridiem}
              onChangeHour={setStartHour}
              onChangeMinute={setStartMinute}
              onChangeMeridiem={setStartMeridiem}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-foreground-subtle">Ended</span>
            <TimePicker
              hour={endHour}
              minute={endMinute}
              meridiem={endMeridiem}
              onChangeHour={setEndHour}
              onChangeMinute={setEndMinute}
              onChangeMeridiem={setEndMeridiem}
            />
          </div>
          <div className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              onClick={save}
              aria-label="Confirm"
              className="flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CallTimeRow({ message }: { message: MessageItem }) {
  const updateCallTime = useEditorStore((s) => s.updateCallTime);
  const [open, setOpen] = React.useState(false);
  const initial = clockFromTimestamp(message.timestamp);
  const [hour, setHour] = React.useState(initial.hour);
  const [minute, setMinute] = React.useState(initial.minute);
  const [meridiem, setMeridiem] = React.useState(initial.meridiem);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      const current = clockFromTimestamp(message.timestamp);
      setHour(current.hour);
      setMinute(current.minute);
      setMeridiem(current.meridiem);
    }
  }

  function save() {
    updateCallTime(message.id, { hour, minute, meridiem });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:glass-surface"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover">
            <CallIcon
              kind={message.callKind ?? "audio"}
              phase={message.callPhase ?? "started"}
              className="h-3.5 w-3.5 text-foreground-muted"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-foreground">
              {formatCallTitle(message.callKind ?? "audio", message.callPhase ?? "started")}
            </span>
            <span className="text-[11px] leading-tight text-foreground-subtle">
              {formatCallTime(message.timestamp)}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <TimePicker
            hour={hour}
            minute={minute}
            meridiem={meridiem}
            onChangeHour={setHour}
            onChangeMinute={setMinute}
            onChangeMeridiem={setMeridiem}
          />
          <button
            type="button"
            onClick={save}
            aria-label="Confirm"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-accent/10"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PhotoStyleRow({ message }: { message: MessageItem }) {
  const updatePhotoMessage = useEditorStore((s) => s.updatePhotoMessage);
  const [open, setOpen] = React.useState(false);
  const [photos, setPhotos] = React.useState<PhotoItem[]>(message.photos ?? []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setPhotos(message.photos ?? []);
  }

  function save() {
    if (photos.length === 0) return;
    updatePhotoMessage(message.id, photos);
    setOpen(false);
  }

  const displayPhotos = message.photos ?? [];

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:glass-surface"
        >
          <div className="flex h-[88px] w-[68px] shrink-0 items-end justify-center">
            <PhotoStack photos={displayPhotos} size="sm" />
          </div>
          <span className="text-sm text-foreground-muted">
            {displayPhotos.length > 3
              ? `${displayPhotos.length} photos`
              : `${displayPhotos.length} photo${displayPhotos.length === 1 ? "" : "s"}`}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex w-72 flex-col gap-2">
          <PhotoUploadEditor photos={photos} onChangePhotos={setPhotos} />
          <div className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              onClick={save}
              disabled={photos.length === 0}
              aria-label="Confirm"
              className="flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10 disabled:opacity-30"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ReelStyleRow({ message }: { message: MessageItem }) {
  const updateReelMessage = useEditorStore((s) => s.updateReelMessage);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ReelDraft>({
    thumbnail: message.reelThumbnail,
    ownerUsername: message.reelOwnerUsername ?? "",
    ownerAvatar: message.reelOwnerAvatar,
    verified: message.reelVerified ?? false,
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft({
        thumbnail: message.reelThumbnail,
        ownerUsername: message.reelOwnerUsername ?? "",
        ownerAvatar: message.reelOwnerAvatar,
        verified: message.reelVerified ?? false,
      });
    }
  }

  function save() {
    if (!draft.thumbnail) return;
    updateReelMessage(message.id, {
      thumbnail: draft.thumbnail,
      ownerUsername: draft.ownerUsername,
      ownerAvatar: draft.ownerAvatar,
      verified: draft.verified,
    });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:glass-surface"
        >
          <ReelCard
            thumbnail={message.reelThumbnail}
            ownerUsername={message.reelOwnerUsername}
            ownerAvatar={message.reelOwnerAvatar}
            verified={message.reelVerified}
            size="sm"
          />
          <span className="text-sm text-foreground-muted">
            {message.reelOwnerUsername || "Reel"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <ReelForm fields={draft} onChange={setDraft} onConfirm={save} onCancel={() => onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  );
}

function StoryStyleRow({ message }: { message: MessageItem }) {
  const updateStoryMessage = useEditorStore((s) => s.updateStoryMessage);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<StoryDraft>({
    thumbnail: message.storyThumbnail,
    ownerUsername: message.storyOwnerUsername ?? "",
    ownerAvatar: message.storyOwnerAvatar,
    verified: message.storyVerified ?? false,
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft({
        thumbnail: message.storyThumbnail,
        ownerUsername: message.storyOwnerUsername ?? "",
        ownerAvatar: message.storyOwnerAvatar,
        verified: message.storyVerified ?? false,
      });
    }
  }

  function save() {
    if (!draft.thumbnail) return;
    updateStoryMessage(message.id, {
      thumbnail: draft.thumbnail,
      ownerUsername: draft.ownerUsername,
      ownerAvatar: draft.ownerAvatar,
      verified: draft.verified,
    });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:glass-surface"
        >
          <StoryCard
            thumbnail={message.storyThumbnail}
            ownerUsername={message.storyOwnerUsername}
            ownerAvatar={message.storyOwnerAvatar}
            verified={message.storyVerified}
            size="sm"
          />
          <span className="text-sm text-foreground-muted">
            {message.storyOwnerUsername || "Story"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <StoryForm fields={draft} onChange={setDraft} onConfirm={save} onCancel={() => onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  );
}

function VoiceStyleRow({ message }: { message: MessageItem }) {
  const updateVoiceMessage = useEditorStore((s) => s.updateVoiceMessage);
  const [open, setOpen] = React.useState(false);
  const [duration, setDuration] = React.useState(message.voiceDurationSeconds ?? 5);
  const [barHeights, setBarHeights] = React.useState(
    () => message.voiceBarHeights ?? generateDefaultBarHeights(message.voiceDurationSeconds ?? 5, message.id),
  );

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDuration(message.voiceDurationSeconds ?? 5);
      setBarHeights(
        message.voiceBarHeights ??
          generateDefaultBarHeights(message.voiceDurationSeconds ?? 5, message.id),
      );
    }
  }

  function changeDuration(seconds: number) {
    setDuration(seconds);
    const expected = computeBarCount(seconds);
    setBarHeights((prev) =>
      prev.length === expected ? prev : generateDefaultBarHeights(seconds, message.id),
    );
  }

  function save() {
    updateVoiceMessage(message.id, { durationSeconds: duration, barHeights });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:glass-surface"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover">
            <Mic className="h-3.5 w-3.5 text-foreground-muted" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-foreground">Voice note</span>
            <span className="text-[11px] leading-tight text-foreground-subtle">
              {formatVoiceDuration(message.voiceDurationSeconds ?? 0)}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <VoiceDurationInput seconds={duration} onChange={changeDuration} />

          <VoiceWaveformEditor
            durationSeconds={duration}
            barHeights={barHeights}
            onChangeBarHeights={setBarHeights}
            isMe={message.sender === "me"}
          />

          <div className="flex items-center justify-between gap-0.5">
            <button
              type="button"
              onClick={() => setBarHeights(generateRandomBarHeights(barHeights.length))}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12px] text-foreground-subtle transition-colors hover:text-accent"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Randomize
            </button>
            <button
              type="button"
              onClick={save}
              aria-label="Confirm"
              className="flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PostStyleRow({ message }: { message: MessageItem }) {
  const updatePostMessage = useEditorStore((s) => s.updatePostMessage);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<PostDraft>({
    thumbnail: message.postThumbnail,
    ownerUsername: message.postOwnerUsername ?? "",
    ownerAvatar: message.postOwnerAvatar,
    verified: message.postVerified ?? false,
    caption: message.postCaption ?? "",
    isCarousel: message.postIsCarousel ?? false,
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft({
        thumbnail: message.postThumbnail,
        ownerUsername: message.postOwnerUsername ?? "",
        ownerAvatar: message.postOwnerAvatar,
        verified: message.postVerified ?? false,
        caption: message.postCaption ?? "",
        isCarousel: message.postIsCarousel ?? false,
      });
    }
  }

  function save() {
    if (!draft.thumbnail) return;
    updatePostMessage(message.id, {
      thumbnail: draft.thumbnail,
      ownerUsername: draft.ownerUsername,
      ownerAvatar: draft.ownerAvatar,
      verified: draft.verified,
      caption: draft.caption,
      isCarousel: draft.isCarousel,
    });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:glass-surface"
        >
          <PostCard
            thumbnail={message.postThumbnail}
            ownerUsername={message.postOwnerUsername}
            ownerAvatar={message.postOwnerAvatar}
            verified={message.postVerified}
            caption={message.postCaption}
            isCarousel={message.postIsCarousel}
            scale={0.4}
          />
          <span className="text-sm text-foreground-muted">
            {message.postOwnerUsername || "Post"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
        <PostForm fields={draft} onChange={setDraft} onConfirm={save} onCancel={() => onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  );
}
