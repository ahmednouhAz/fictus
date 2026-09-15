// Sizing here is tuned to match a real iOS Instagram DM screenshot at its
// native scale (the phone frame renders at a fixed 430x932 design
// resolution — see IosFrame). These px values are iOS-specific; other
// devices (Android/Desktop, once built) should get their own tuned values
// rather than inheriting these.
import { Scissors, Sparkle, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MessageItem } from "@/schemas/conversation-item";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { CallIcon } from "@/components/preview/call-icon";
import { PhotoStack } from "@/components/preview/photo-stack";
import { ReelCard } from "@/components/preview/reel-card";
import { StoryCard } from "@/components/preview/story-card";
import { VoiceNoteBubble } from "@/components/preview/voice-note-bubble";
import { PostCard } from "@/components/preview/post-card";
import { useEditorStore } from "@/stores/useEditorStore";
import { formatCallTime, formatCallTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

const EDITED_LABEL_COLOR = "#0095F6";

// Pure opacity, no position/layout tracking at all — deliberately, after
// a position-based (layout/layoutId) version kept glitching on remount.
// Fading in place sidesteps that whole class of bug: nothing ever needs
// to know its "previous" screen position.
const FADE_TRANSITION = { duration: 0.35, ease: "easeInOut" } as const;

function replyCaption(replySender: MessageItem["sender"], targetSender: MessageItem["sender"]) {
  const isSelfReply = replySender === targetSender;
  if (replySender === "me") return isSelfReply ? "You replied to yourself" : "You replied";
  return isSelfReply ? "Replied to themselves" : "Replied to you";
}

function bubbleRadius(isMe: boolean, isFirst: boolean, isLast: boolean) {
  const outer = "1.125rem";
  const inner = "0.25rem";
  const topRadius = isFirst ? outer : inner;
  const bottomRadius = isLast ? outer : inner;

  return isMe
    ? `${outer} ${topRadius} ${bottomRadius} ${outer}`
    : `${topRadius} ${outer} ${outer} ${bottomRadius}`;
}

// Compact stand-in for whatever the quoted message actually is — literally
// the same component the message normally renders with, shrunk to its
// small/preview size and dimmed, so it reads as a secondary reference
// rather than primary content. Text is the one type with its own bespoke
// look (oversized, ultra-light, clipped) rather than a scaled-down bubble.
function QuotedMessagePreview({
  target,
  isMe,
  isLight,
  onSelect,
}: {
  target: MessageItem;
  // The replying message's own side — the quoted bubble's color follows
  // whichever side this reply block sits on, not who was originally
  // quoted, so the whole block reads as one consistent color.
  isMe: boolean;
  isLight?: boolean;
  onSelect: () => void;
}) {
  if (target.type === "call") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-2xl px-3 brightness-[0.55]",
          isLight ? "bg-[#F0F1F3]" : "bg-[#262627]",
        )}
      >
        <CallIcon
          kind={target.callKind ?? "audio"}
          phase={target.callPhase ?? "started"}
          className={cn("h-3.5 w-3.5", isLight && "invert")}
        />
        <span className={cn("whitespace-nowrap text-[13px]", isLight ? "text-black" : "text-white")}>
          {formatCallTitle(target.callKind ?? "audio", target.callPhase ?? "started")}
        </span>
      </button>
    );
  }

  if (target.type === "voice") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-2xl px-3 brightness-[0.55]",
          isLight ? "bg-[#F0F1F3]" : "bg-[#262627]",
        )}
      >
        <Mic className={cn("h-3.5 w-3.5", isLight ? "text-black" : "text-white")} />
        <span className={cn("whitespace-nowrap text-[13px]", isLight ? "text-black" : "text-white")}>
          Voice message
        </span>
      </button>
    );
  }

  if (target.type === "photo" || target.type === "reel" || target.type === "story" || target.type === "post") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="cursor-pointer overflow-hidden rounded-2xl brightness-[0.55]"
      >
        {target.type === "photo" && <PhotoStack photos={target.photos ?? []} size="sm" />}
        {target.type === "reel" && (
          <ReelCard
            thumbnail={target.reelThumbnail}
            ownerUsername={target.reelOwnerUsername}
            ownerAvatar={target.reelOwnerAvatar}
            verified={target.reelVerified}
            size="sm"
          />
        )}
        {target.type === "story" && (
          <StoryCard
            thumbnail={target.storyThumbnail}
            ownerUsername={target.storyOwnerUsername}
            ownerAvatar={target.storyOwnerAvatar}
            verified={target.storyVerified}
            size="sm"
          />
        )}
        {target.type === "post" && (
          <PostCard
            thumbnail={target.postThumbnail}
            ownerUsername={target.postOwnerUsername}
            ownerAvatar={target.postOwnerAvatar}
            verified={target.postVerified}
            caption={target.postCaption}
            isCarousel={target.postIsCarousel}
            scale={0.4}
            theme={isLight ? "light" : "dark"}
          />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[40px] max-w-[215px] cursor-pointer items-center whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left text-[12px] font-light leading-snug text-white/70"
      style={{ backgroundColor: isLight ? "#B4A1FB" : isMe ? "#181D21" : "#B332D7" }}
    >
      {target.content}
    </button>
  );
}

export function InstagramMessageGroup({
  messages,
  recipientName,
  recipientAvatar,
  messagesById,
  theme,
}: {
  messages: MessageItem[];
  recipientName: string;
  recipientAvatar?: string;
  messagesById: Map<string, MessageItem>;
  // Only the recipient's plain text bubble changes with theme — "me"
  // bubbles and every other message type stay as-is regardless.
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  const isMe = messages[0].sender === "me";
  const select = useEditorStore((s) => s.select);

  return (
    <div className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
      <AnimatePresence mode="popLayout">
        {!isMe && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
            className="w-6 shrink-0 self-end"
          >
            <InstagramAvatar name={recipientName} avatarUrl={recipientAvatar} size={24} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("flex max-w-[75%] flex-col gap-[2px]", isMe ? "items-end" : "items-start")}>
        {messages.map((message, index) => {
          if (message.type === "call") {
            const callKind = message.callKind ?? "audio";
            const callPhase = message.callPhase ?? "started";
            return (
              <AnimatePresence key={message.id} mode="popLayout">
                <motion.div
                  key={`${message.id}-${message.sender}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_TRANSITION}
                  className={cn("relative", index > 0 && "mt-1", message.reaction && "mb-[20px]")}
                >
                  <div
                    data-item-id={message.id}
                    onClick={() => select(message.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-2xl py-2 pl-2 pr-4 transition-colors",
                      isLight ? "bg-[#F0F1F3] hover:bg-[#E4E5E8]" : "bg-[#262627] hover:bg-[#303032]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        isLight ? "bg-[#858C96]" : "bg-white/15",
                      )}
                    >
                      <CallIcon kind={callKind} phase={callPhase} className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-[13px] font-semibold leading-tight",
                          isLight ? "text-black" : "text-white",
                        )}
                      >
                        {formatCallTitle(callKind, callPhase)}
                      </span>
                      <span
                        className={cn("text-[11px] leading-tight", !isLight && "text-white/50")}
                        style={isLight ? { color: "#6E6E70" } : undefined}
                      >
                        {formatCallTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  {message.reaction && (
                    <span className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")} style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}>
                      {message.reaction}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            );
          }

          if (message.type === "photo") {
            const photos = message.photos ?? [];
            const showCaption = photos.length > 3;
            return (
              <AnimatePresence key={message.id} mode="popLayout">
                <motion.div
                  key={`${message.id}-${message.sender}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_TRANSITION}
                  className={cn(
                    "flex flex-col gap-1",
                    isMe ? "items-end" : "items-start",
                    index > 0 && "mt-1",
                    message.reaction && "mb-[20px]",
                  )}
                >
                  {showCaption && (
                    <span
                      className={cn("text-[11px]", !isLight && "text-white/40")}
                      style={isLight ? { color: "#6E6E70" } : undefined}
                    >
                      {isMe ? "You" : recipientName} sent {photos.length} photos
                    </span>
                  )}
                  <div data-item-id={message.id} onClick={() => select(message.id)} className="relative cursor-pointer">
                    <PhotoStack photos={photos} size="lg" />
                    {message.reaction && (
                      <span className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")} style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}>
                        {message.reaction}
                      </span>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          }

          if (message.type === "reel") {
            return (
              <AnimatePresence key={message.id} mode="popLayout">
                <motion.div
                  key={`${message.id}-${message.sender}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_TRANSITION}
                  className={cn(index > 0 && "mt-1", message.reaction && "mb-[20px]")}
                >
                  <div
                    className={cn("flex items-center", isMe ? "flex-row-reverse" : "flex-row")}
                    style={{ gap: 7 }}
                  >
                    <div className="relative">
                      <div
                        data-item-id={message.id}
                        onClick={() => select(message.id)}
                        className="cursor-pointer"
                      >
                        <ReelCard
                          thumbnail={message.reelThumbnail}
                          ownerUsername={message.reelOwnerUsername}
                          ownerAvatar={message.reelOwnerAvatar}
                          verified={message.reelVerified}
                          size="lg"
                        />
                      </div>
                      {message.reaction && (
                        <span
                          className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")}
                          style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}
                        >
                          {message.reaction}
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-center justify-center" style={{ gap: 12 }}>
                      <button
                        type="button"
                        aria-label="Send"
                        className={cn(
                          "flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full",
                          isLight ? "bg-[#F0F1F3] text-black" : "bg-[#262627] text-white",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icons/send.svg"
                          alt=""
                          className={cn("h-4 w-4", isLight && "invert")}
                        />
                      </button>
                      <button
                        type="button"
                        aria-label="Remix"
                        className={cn(
                          "relative flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full",
                          isLight ? "bg-[#F0F1F3] text-black" : "bg-[#262627] text-white",
                        )}
                      >
                        <Scissors className="h-4 w-4" />
                        <Sparkle className="absolute right-[6px] top-[6px] h-[7px] w-[7px]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          }

          if (message.type === "story") {
            const ownerHandle = message.storyOwnerUsername ? `@${message.storyOwnerUsername}` : "their";
            const captionText = isMe
              ? `You sent ${ownerHandle}'s story`
              : `sent ${ownerHandle}'s story`;

            const pillEl = (
              <div
                key="pill"
                className={cn("shrink-0 rounded-full", isLight ? "bg-[#F0F1F3]" : "bg-[#262627]")}
                style={{ width: 4, height: 306, marginRight: isMe ? 0 : 12 }}
              />
            );
            const cardEl = (
              <div key="card" className="relative" style={{ marginRight: isMe ? 12 : 7 }}>
                <div
                  data-item-id={message.id}
                  onClick={() => select(message.id)}
                  className="cursor-pointer"
                >
                  <StoryCard
                    thumbnail={message.storyThumbnail}
                    ownerUsername={message.storyOwnerUsername}
                    ownerAvatar={message.storyOwnerAvatar}
                    verified={message.storyVerified}
                    size="lg"
                  />
                </div>
                {message.reaction && (
                  <span
                    className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")}
                    style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}
                  >
                    {message.reaction}
                  </span>
                )}
              </div>
            );
            const buttonEl = (
              <button
                key="button"
                type="button"
                aria-label="Send"
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full",
                  isLight ? "bg-[#F0F1F3] text-black" : "bg-[#262627] text-white",
                )}
                style={{ width: 33, height: 33, marginRight: isMe ? 7 : 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/send.svg"
                  alt=""
                  className={cn("h-4 w-4", isLight && "invert")}
                />
              </button>
            );

            return (
              <AnimatePresence key={message.id} mode="popLayout">
                <motion.div
                  key={`${message.id}-${message.sender}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_TRANSITION}
                  className={cn(
                    "flex flex-col",
                    isMe ? "items-end" : "items-start",
                    index > 0 && "mt-1",
                    message.reaction && "mb-[20px]",
                  )}
                  style={{ gap: 16.67 }}
                >
                  <span
                    className={cn("text-[11px]", !isLight && "text-white/40")}
                    style={isLight ? { color: "#6E6E70" } : undefined}
                  >
                    {captionText}
                  </span>
                  <div className="flex items-center">
                    {isMe ? [buttonEl, cardEl, pillEl] : [pillEl, cardEl, buttonEl]}
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          }

          if (message.type === "voice") {
            return (
              <AnimatePresence key={message.id} mode="popLayout">
                <motion.div
                  key={`${message.id}-${message.sender}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_TRANSITION}
                  className={cn("relative", index > 0 && "mt-1", message.reaction && "mb-[20px]")}
                >
                  <div
                    data-item-id={message.id}
                    onClick={() => select(message.id)}
                    className="cursor-pointer"
                  >
                    <VoiceNoteBubble
                      id={message.id}
                      durationSeconds={message.voiceDurationSeconds ?? 0}
                      barHeights={message.voiceBarHeights}
                      isMe={isMe}
                    />
                  </div>
                  {message.reaction && (
                    <span
                      className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")}
                      style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}
                    >
                      {message.reaction}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            );
          }

          if (message.type === "post") {
            return (
              <AnimatePresence key={message.id} mode="popLayout">
                <motion.div
                  key={`${message.id}-${message.sender}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_TRANSITION}
                  className={cn(index > 0 && "mt-1", message.reaction && "mb-[20px]")}
                >
                  <div
                    className={cn("flex items-center", isMe ? "flex-row-reverse" : "flex-row")}
                    style={{ gap: 7 }}
                  >
                    <div className="relative">
                      <div
                        data-item-id={message.id}
                        onClick={() => select(message.id)}
                        className="cursor-pointer"
                      >
                        <PostCard
                          thumbnail={message.postThumbnail}
                          ownerUsername={message.postOwnerUsername}
                          ownerAvatar={message.postOwnerAvatar}
                          verified={message.postVerified}
                          caption={message.postCaption}
                          isCarousel={message.postIsCarousel}
                          theme={isLight ? "light" : "dark"}
                        />
                      </div>
                      {message.reaction && (
                        <span
                          className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")}
                          style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}
                        >
                          {message.reaction}
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-center justify-center" style={{ gap: 12 }}>
                      <button
                        type="button"
                        aria-label="Send"
                        className={cn(
                          "flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full",
                          isLight ? "bg-[#F0F1F3] text-black" : "bg-[#262627] text-white",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icons/send.svg"
                          alt=""
                          className={cn("h-4 w-4", isLight && "invert")}
                        />
                      </button>
                      <button
                        type="button"
                        aria-label="Remix"
                        className={cn(
                          "relative flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full",
                          isLight ? "bg-[#F0F1F3] text-black" : "bg-[#262627] text-white",
                        )}
                      >
                        <Scissors className="h-4 w-4" />
                        <Sparkle className="absolute right-[6px] top-[6px] h-[7px] w-[7px]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          }

          const replyTarget = message.replyTo ? messagesById.get(message.replyTo) : undefined;

          const bubbleEl = (
            <div
              data-item-id={message.id}
              data-me-bubble={isMe ? "true" : undefined}
              onClick={() => select(message.id)}
              style={{
                borderRadius: bubbleRadius(isMe, index === 0, index === messages.length - 1),
              }}
              className={cn(
                "flex min-h-[40px] cursor-pointer items-center whitespace-pre-wrap break-words px-3 py-2 text-[15px] font-normal leading-snug transition-colors duration-300 ease-out",
                isMe
                  ? "bg-[#5E4CF8] text-white hover:brightness-110"
                  : isLight
                    ? "bg-[#F0F1F3] text-black hover:bg-[#E4E5E8]"
                    : "bg-[#262627] text-white hover:bg-[#303032]",
              )}
            >
              {message.content}
            </div>
          );

          if (!replyTarget) {
            return (
              <AnimatePresence key={message.id} mode="popLayout">
                <motion.div
                  key={`${message.id}-${message.sender}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_TRANSITION}
                  className={cn(
                    "relative flex flex-col gap-1.5",
                    isMe ? "items-end" : "items-start",
                    message.reaction && "mb-[20px]",
                  )}
                >
                  {message.edited && (
                    <span
                      className={cn("text-[11px]", isMe && "text-right")}
                      style={{ color: EDITED_LABEL_COLOR }}
                    >
                      Edited
                    </span>
                  )}
                  {bubbleEl}
                  {message.reaction && (
                    <span className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")} style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}>
                      {message.reaction}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            );
          }

          const lineEl = (
            <div
              key="line"
              className={cn("w-1 shrink-0 self-stretch rounded-full", isLight ? "bg-[#F0F1F3]" : "bg-[#262627]")}
            />
          );
          const quotedEl = (
            <div key="quoted" className="min-w-0">
              <QuotedMessagePreview
                target={replyTarget}
                isMe={isMe}
                isLight={isLight}
                onSelect={() => select(replyTarget.id)}
              />
            </div>
          );

          return (
            <AnimatePresence key={message.id} mode="popLayout">
              <motion.div
                key={`${message.id}-${message.sender}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE_TRANSITION}
                className={cn(
                  "relative flex flex-col gap-1.5",
                  isMe ? "items-end" : "items-start",
                  message.reaction && "mb-[20px]",
                )}
              >
                <span
                  className={cn("text-[11px]", !isLight && "text-white/40", isMe && "text-right")}
                  style={isLight ? { color: "#6E6E70" } : undefined}
                >
                  {replyCaption(message.sender, replyTarget.sender)}
                  {message.edited && (
                    <>
                      {" · "}
                      <span style={{ color: EDITED_LABEL_COLOR }}>Edited</span>
                    </>
                  )}
                </span>
                <div className={cn("flex items-stretch gap-2", isMe && "justify-end")}>
                  {isMe ? [quotedEl, lineEl] : [lineEl, quotedEl]}
                </div>
                {bubbleEl}
                {message.reaction && (
                  <span className={cn("absolute -bottom-[15px] flex items-center justify-center border-2 text-[11px] leading-none", isLight ? "bg-[#F5EEF3]" : "bg-[#1c1c1e]")} style={{ left: 5, width: 29, height: 24, borderRadius: 11, borderColor: isLight ? "#FFFFFF" : "#0C1115" }}>
                    {message.reaction}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}
