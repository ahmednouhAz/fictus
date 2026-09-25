import { ChevronLeft, ChevronRight } from "lucide-react";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { HeaderIconButton } from "@/components/preview/instagram/header-glass-button";
import { cn } from "@/lib/utils";

export function InstagramHeader({
  recipientName,
  recipientNameHidden,
  recipientUsername,
  recipientAvatar,
  recipientStory,
  recipientVerified,
  hideActions,
  theme,
}: {
  recipientName: string;
  // Accounts without a display name (or ones with it manually hidden) show
  // their username in the display name's slot (bold, larger) instead of
  // the small gray line below — there's nothing left to put there, so it
  // collapses to one centered row.
  recipientNameHidden?: boolean;
  recipientUsername?: string;
  recipientAvatar?: string;
  recipientStory?: "none" | "unseen" | "seen";
  recipientVerified?: boolean;
  // Message requests hide the info/call/video-call buttons — you can't
  // call or see activity status for someone whose request you haven't
  // accepted yet.
  hideActions?: boolean;
  // Text and icons flip black/white with theme; the verified badge and any
  // other blue accents stay blue regardless — they're separate, hardcoded
  // colors, not tied to currentColor.
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  const hasDisplayName = !recipientNameHidden && recipientName.trim().length > 0;
  const titleText = hasDisplayName ? recipientName : recipientUsername;
  return (
    <div
      className={cn(
        "flex h-[60px] shrink-0 items-center pl-[20px] pr-[16px]",
        isLight ? "text-black" : "text-white",
      )}
    >
      <HeaderIconButton ariaLabel="Back" isLight={isLight}>
        <ChevronLeft className="h-[33px] w-[33px]" strokeWidth={1.75} />
      </HeaderIconButton>

      <div className="ml-3 shrink-0">
        <InstagramAvatar
          name={recipientName}
          avatarUrl={recipientAvatar}
          size={32}
          story={recipientStory}
          theme={theme}
        />
      </div>

      <div className="ml-3 flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-0.5">
          <p className="truncate text-[15px] font-bold leading-none">{titleText}</p>
          {recipientVerified ? (
            <VerifiedBadge size={14} />
          ) : (
            <ChevronRight
              className={cn("h-3.5 w-3.5 shrink-0", isLight ? "text-black/40" : "text-white/50")}
              strokeWidth={2.5}
            />
          )}
        </div>
        {hasDisplayName && recipientUsername && (
          <p
            className={cn("truncate text-[12px] font-light leading-none", !isLight && "text-[#A1A8AE]")}
            style={isLight ? { color: "#6E6E70" } : undefined}
          >
            {recipientUsername}
          </p>
        )}
      </div>

      {!hideActions && (
        <div className="flex shrink-0 items-center gap-3">
          <HeaderIconButton ariaLabel="Conversation info" isLight={isLight} >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/conversation-info.svg"
              alt=""
              className={cn("h-[22px] w-[22px]", isLight && "invert")}
            />
          </HeaderIconButton>
          <HeaderIconButton ariaLabel="Call" isLight={isLight}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/voice-call.svg"
              alt=""
              className={cn("h-[20px] w-[20px]", isLight && "invert")}
            />
          </HeaderIconButton>
          <HeaderIconButton ariaLabel="Video call" isLight={isLight}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/video-call.svg"
              alt=""
              className={cn("h-[23px] w-[23px]", isLight && "invert")}
            />
          </HeaderIconButton>
        </div>
      )}
    </div>
  );
}
