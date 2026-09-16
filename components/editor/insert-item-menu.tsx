"use client";

import * as React from "react";
import {
  Plus,
  Clock,
  MessageSquareDot,
  Phone,
  Image as ImageIcon,
  Clapperboard,
  Circle,
  Mic,
  SquareStack,
  Check,
  X,
  Shuffle,
  Lock,
} from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";
import { useExportQuota } from "@/components/paywall/export-quota-provider";
import { UpgradeDialog } from "@/components/paywall/upgrade-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DividerTimeRow } from "@/components/editor/divider-time-row";
import { SystemPresetButtons } from "@/components/editor/system-message-presets";
import { CallFormRow, type CallTime } from "@/components/editor/call-form-row";
import { PhotoUploadEditor } from "@/components/editor/photo-upload-editor";
import { ReelForm, type ReelDraft } from "@/components/editor/reel-form";
import { StoryForm, type StoryDraft } from "@/components/editor/story-form";
import { VoiceDurationInput } from "@/components/editor/voice-duration-input";
import { VoiceWaveformEditor } from "@/components/editor/voice-waveform-editor";
import { PostForm, type PostDraft } from "@/components/editor/post-form";
import { ToggleButton } from "@/components/editor/toggle-button";
import {
  computeBarCount,
  generateDefaultBarHeights,
  generateRandomBarHeights,
} from "@/components/preview/voice-note-bubble";
import type {
  CallKind,
  DividerDay,
  Meridiem,
  MessageSender,
  PhotoItem,
} from "@/schemas/conversation-item";

type Step = "menu" | "divider" | "system" | "call" | "photo" | "reel" | "story" | "voice" | "post";

export function InsertItemMenu({
  index,
  disableMeSender,
}: {
  index: number;
  disableMeSender?: boolean;
}) {
  const insertDivider = useEditorStore((s) => s.insertDivider);
  const insertSystemMessage = useEditorStore((s) => s.insertSystemMessage);
  const insertCall = useEditorStore((s) => s.insertCall);
  const insertPhotoMessage = useEditorStore((s) => s.insertPhotoMessage);
  const insertReelMessage = useEditorStore((s) => s.insertReelMessage);
  const insertStoryMessage = useEditorStore((s) => s.insertStoryMessage);
  const insertVoiceMessage = useEditorStore((s) => s.insertVoiceMessage);
  const insertPostMessage = useEditorStore((s) => s.insertPostMessage);

  const { quota } = useExportQuota();
  const [upgradeFeature, setUpgradeFeature] = React.useState<"reel" | "story" | "voice" | null>(
    null,
  );

  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("menu");
  const [day, setDay] = React.useState<DividerDay>("none");
  const [hour, setHour] = React.useState(12);
  const [minute, setMinute] = React.useState(0);
  const [meridiem, setMeridiem] = React.useState<Meridiem>("PM");

  const defaultSender: MessageSender = disableMeSender ? "recipient" : "me";
  const [callSender, setCallSender] = React.useState<MessageSender>(defaultSender);
  const [callKind, setCallKind] = React.useState<CallKind>("audio");
  const [callPhase, setCallPhase] = React.useState<"ongoing" | "completed">("completed");
  const [callStartTime, setCallStartTime] = React.useState<CallTime>({
    hour: 12,
    minute: 0,
    meridiem: "PM",
  });
  const [callEndTime, setCallEndTime] = React.useState<CallTime>({
    hour: 12,
    minute: 5,
    meridiem: "PM",
  });

  const [photoSender, setPhotoSender] = React.useState<MessageSender>(defaultSender);
  const [photos, setPhotos] = React.useState<PhotoItem[]>([]);

  const [reelSender, setReelSender] = React.useState<MessageSender>(defaultSender);
  const [reelDraft, setReelDraft] = React.useState<ReelDraft>({
    ownerUsername: "",
    verified: false,
  });

  const [storySender, setStorySender] = React.useState<MessageSender>(defaultSender);
  const [storyDraft, setStoryDraft] = React.useState<StoryDraft>({
    ownerUsername: "",
    verified: false,
  });

  const [voiceSender, setVoiceSender] = React.useState<MessageSender>(defaultSender);
  const [voiceId] = React.useState(() => crypto.randomUUID());
  const [voiceDuration, setVoiceDuration] = React.useState(5);
  const [voiceBarHeights, setVoiceBarHeights] = React.useState(() =>
    generateDefaultBarHeights(5, voiceId),
  );

  const [postSender, setPostSender] = React.useState<MessageSender>(defaultSender);
  const [postDraft, setPostDraft] = React.useState<PostDraft>({
    ownerUsername: "",
    verified: false,
    caption: "",
    isCarousel: false,
  });

  function changeVoiceDuration(seconds: number) {
    setVoiceDuration(seconds);
    const expected = computeBarCount(seconds);
    setVoiceBarHeights((prev) =>
      prev.length === expected ? prev : generateDefaultBarHeights(seconds, voiceId),
    );
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setStep("menu");
      setDay("none");
      setHour(12);
      setMinute(0);
      setMeridiem("PM");
      setCallSender(defaultSender);
      setCallKind("audio");
      setCallPhase("completed");
      setCallStartTime({ hour: 12, minute: 0, meridiem: "PM" });
      setCallEndTime({ hour: 12, minute: 5, meridiem: "PM" });
      setPhotoSender(defaultSender);
      setPhotos([]);
      setReelSender(defaultSender);
      setReelDraft({ ownerUsername: "", verified: false });
      setStorySender(defaultSender);
      setStoryDraft({ ownerUsername: "", verified: false });
      setVoiceSender(defaultSender);
      setVoiceDuration(5);
      setVoiceBarHeights(generateDefaultBarHeights(5, voiceId));
      setPostSender(defaultSender);
      setPostDraft({ ownerUsername: "", verified: false, caption: "", isCarousel: false });
    }
  }

  function submitDivider() {
    insertDivider(index, { day, hour, minute, meridiem });
    onOpenChange(false);
  }

  function submitSystem(template: string) {
    insertSystemMessage(index, template);
    onOpenChange(false);
  }

  function submitCall() {
    insertCall(
      index,
      callSender,
      callKind,
      callPhase,
      callStartTime,
      callPhase === "completed" ? callEndTime : undefined,
    );
    onOpenChange(false);
  }

  function submitPhoto() {
    if (photos.length === 0) return;
    insertPhotoMessage(index, photoSender, photos);
    onOpenChange(false);
  }

  function submitReel() {
    if (!reelDraft.thumbnail) return;
    insertReelMessage(index, reelSender, {
      thumbnail: reelDraft.thumbnail,
      ownerUsername: reelDraft.ownerUsername,
      ownerAvatar: reelDraft.ownerAvatar,
      verified: reelDraft.verified,
    });
    onOpenChange(false);
  }

  function submitStory() {
    if (!storyDraft.thumbnail) return;
    insertStoryMessage(index, storySender, {
      thumbnail: storyDraft.thumbnail,
      ownerUsername: storyDraft.ownerUsername,
      ownerAvatar: storyDraft.ownerAvatar,
      verified: storyDraft.verified,
    });
    onOpenChange(false);
  }

  function submitVoice() {
    insertVoiceMessage(index, voiceSender, {
      durationSeconds: voiceDuration,
      barHeights: voiceBarHeights,
    });
    onOpenChange(false);
  }

  function submitPost() {
    if (!postDraft.thumbnail) return;
    insertPostMessage(index, postSender, {
      thumbnail: postDraft.thumbnail,
      ownerUsername: postDraft.ownerUsername,
      ownerAvatar: postDraft.ownerAvatar,
      verified: postDraft.verified,
      caption: postDraft.caption,
      isCarousel: postDraft.isCarousel,
    });
    onOpenChange(false);
  }

  return (
    <div className="group/insert relative flex h-3.5 items-center justify-center">
      <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-border opacity-30 transition-opacity group-hover/insert:opacity-100" />
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Insert here"
            className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-bg-elevated text-foreground-subtle opacity-30 transition-opacity hover:border-accent/60 hover:text-accent group-hover/insert:opacity-100"
          >
            <Plus className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          className={
            step === "divider" ||
            step === "call" ||
            step === "photo" ||
            step === "reel" ||
            step === "story" ||
            step === "voice" ||
            step === "post"
              ? "w-auto"
              : undefined
          }
        >
          {step === "menu" && (
            <div className="group/menu flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setStep("divider")}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <Clock className="h-3.5 w-3.5 text-foreground-subtle" />
                Add timestamp
              </button>
              <button
                type="button"
                onClick={() => setStep("system")}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <MessageSquareDot className="h-3.5 w-3.5 text-foreground-subtle" />
                Add system message
              </button>
              <button
                type="button"
                onClick={() => setStep("call")}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <Phone className="h-3.5 w-3.5 text-foreground-subtle" />
                Add call
              </button>
              <button
                type="button"
                onClick={() => setStep("photo")}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <ImageIcon className="h-3.5 w-3.5 text-foreground-subtle" />
                Add photos
              </button>
              <button
                type="button"
                onClick={() => (quota.locked ? setUpgradeFeature("reel") : setStep("reel"))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <Clapperboard className="h-3.5 w-3.5 text-foreground-subtle" />
                Add reel
                {quota.locked && <Lock className="ml-auto h-3 w-3 text-foreground-subtle" />}
              </button>
              <button
                type="button"
                onClick={() => (quota.locked ? setUpgradeFeature("story") : setStep("story"))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <Circle className="h-3.5 w-3.5 text-foreground-subtle" />
                Add story
                {quota.locked && <Lock className="ml-auto h-3 w-3 text-foreground-subtle" />}
              </button>
              <button
                type="button"
                onClick={() => (quota.locked ? setUpgradeFeature("voice") : setStep("voice"))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <Mic className="h-3.5 w-3.5 text-foreground-subtle" />
                Add voice note
                {quota.locked && <Lock className="ml-auto h-3 w-3 text-foreground-subtle" />}
              </button>
              <button
                type="button"
                onClick={() => setStep("post")}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground opacity-100 transition-opacity duration-150 hover:glass-surface group-hover/menu:opacity-50 hover:!opacity-100"
              >
                <SquareStack className="h-3.5 w-3.5 text-foreground-subtle" />
                Add post
              </button>
            </div>
          )}

          {step === "divider" && (
            <DividerTimeRow
              day={day}
              hour={hour}
              minute={minute}
              meridiem={meridiem}
              onChangeDay={setDay}
              onChangeHour={setHour}
              onChangeMinute={setMinute}
              onChangeMeridiem={setMeridiem}
              onConfirm={submitDivider}
              onCancel={() => onOpenChange(false)}
            />
          )}

          {step === "system" && <SystemPresetButtons onSelect={submitSystem} />}

          {step === "call" && (
            <CallFormRow
              sender={callSender}
              callKind={callKind}
              phase={callPhase}
              startTime={callStartTime}
              endTime={callEndTime}
              onChangeSender={setCallSender}
              onChangeCallKind={setCallKind}
              onChangePhase={setCallPhase}
              onChangeStartTime={setCallStartTime}
              onChangeEndTime={setCallEndTime}
              onConfirm={submitCall}
              onCancel={() => onOpenChange(false)}
              disableMeSender={disableMeSender}
            />
          )}

          {step === "photo" && (
            <div className="flex w-72 flex-col gap-2">
              {!disableMeSender && (
                <div className="flex items-center gap-1.5">
                  <ToggleButton
                    label="Me"
                    active={photoSender === "me"}
                    onClick={() => setPhotoSender("me")}
                  />
                  <ToggleButton
                    label="Recipient"
                    active={photoSender === "recipient"}
                    onClick={() => setPhotoSender("recipient")}
                  />
                </div>
              )}

              <PhotoUploadEditor photos={photos} onChangePhotos={setPhotos} />

              <div className="flex items-center justify-end gap-0.5">
                <button
                  type="button"
                  onClick={submitPhoto}
                  disabled={photos.length === 0}
                  aria-label="Confirm"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10 disabled:opacity-30"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Cancel"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === "reel" && (
            <div className="flex w-72 flex-col gap-2">
              {!disableMeSender && (
                <div className="flex items-center gap-1.5">
                  <ToggleButton
                    label="Me"
                    active={reelSender === "me"}
                    onClick={() => setReelSender("me")}
                  />
                  <ToggleButton
                    label="Recipient"
                    active={reelSender === "recipient"}
                    onClick={() => setReelSender("recipient")}
                  />
                </div>
              )}

              <ReelForm fields={reelDraft} onChange={setReelDraft} onConfirm={submitReel} onCancel={() => onOpenChange(false)} />
            </div>
          )}

          {step === "story" && (
            <div className="flex w-72 flex-col gap-2">
              {!disableMeSender && (
                <div className="flex items-center gap-1.5">
                  <ToggleButton
                    label="Me"
                    active={storySender === "me"}
                    onClick={() => setStorySender("me")}
                  />
                  <ToggleButton
                    label="Recipient"
                    active={storySender === "recipient"}
                    onClick={() => setStorySender("recipient")}
                  />
                </div>
              )}

              <StoryForm fields={storyDraft} onChange={setStoryDraft} onConfirm={submitStory} onCancel={() => onOpenChange(false)} />
            </div>
          )}

          {step === "voice" && (
            <div className="flex flex-col gap-2">
              {!disableMeSender && (
                <div className="flex items-center gap-1.5">
                  <ToggleButton
                    label="Me"
                    active={voiceSender === "me"}
                    onClick={() => setVoiceSender("me")}
                  />
                  <ToggleButton
                    label="Recipient"
                    active={voiceSender === "recipient"}
                    onClick={() => setVoiceSender("recipient")}
                  />
                </div>
              )}

              <VoiceDurationInput seconds={voiceDuration} onChange={changeVoiceDuration} />

              <VoiceWaveformEditor
                durationSeconds={voiceDuration}
                barHeights={voiceBarHeights}
                onChangeBarHeights={setVoiceBarHeights}
                isMe={voiceSender === "me"}
              />

              <div className="flex items-center justify-between gap-0.5">
                <button
                  type="button"
                  onClick={() => setVoiceBarHeights(generateRandomBarHeights(voiceBarHeights.length))}
                  className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12px] text-foreground-subtle transition-colors hover:text-accent"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  Randomize
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={submitVoice}
                    aria-label="Confirm"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Cancel"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "post" && (
            <div className="flex flex-col gap-2">
              {!disableMeSender && (
                <div className="flex items-center gap-1.5">
                  <ToggleButton
                    label="Me"
                    active={postSender === "me"}
                    onClick={() => setPostSender("me")}
                  />
                  <ToggleButton
                    label="Recipient"
                    active={postSender === "recipient"}
                    onClick={() => setPostSender("recipient")}
                  />
                </div>
              )}

              <PostForm fields={postDraft} onChange={setPostDraft} onConfirm={submitPost} onCancel={() => onOpenChange(false)} />
            </div>
          )}
        </PopoverContent>
      </Popover>

      <UpgradeDialog
        open={upgradeFeature !== null}
        onOpenChange={(open) => !open && setUpgradeFeature(null)}
        title={`${upgradeFeature ? FEATURE_LABELS[upgradeFeature] : ""} is a Pro feature`}
        description="Upgrade to Pro for unlimited exports, plus full access to Reels, Stories, and Voice messages."
      />
    </div>
  );
}

const FEATURE_LABELS: Record<"reel" | "story" | "voice", string> = {
  reel: "Reels",
  story: "Stories",
  voice: "Voice messages",
};
