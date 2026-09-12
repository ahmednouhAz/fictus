import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { cn } from "@/lib/utils";

// Glass-rim border: visible all the way around the circle (like light
// grazing the raised edge of real glass), but brightest at the top-left and
// bottom-right — the rest fades down to a dim baseline instead of dropping
// to full transparency, so there's no dead/invisible arc. Plain translucent
// white, tuned separately per theme: the dark-theme opacities read fine
// against that near-black button fill, but the same low opacities are
// nearly invisible against the light theme's near-white fill, so light
// theme gets its own brighter stops instead of just blending away.
const GLASS_RING_BACKGROUND_DARK =
  "conic-gradient(from 0deg, rgba(255,255,255,0.13) 0deg, rgba(255,255,255,0.05) 45deg, rgba(255,255,255,0.22) 135deg, rgba(255,255,255,0.05) 225deg, rgba(255,255,255,0.22) 315deg, rgba(255,255,255,0.13) 360deg)";
const GLASS_RING_BACKGROUND_LIGHT =
  "conic-gradient(from 0deg, rgba(255,255,255,0.55) 0deg, rgba(255,255,255,0.25) 45deg, rgba(255,255,255,0.9) 135deg, rgba(255,255,255,0.25) 225deg, rgba(255,255,255,0.9) 315deg, rgba(255,255,255,0.55) 360deg)";
const GLASS_RING_MASK =
  "radial-gradient(circle closest-side, transparent calc(100% - 1.25px), black calc(100% - 1.25px))";

function HeaderIconButton({
  ariaLabel,
  isLight,
  lightBg = "#FEFEFE",
  children,
}: {
  ariaLabel: string;
  isLight?: boolean;
  lightBg?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "isolate relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full backdrop-blur-[36px]",
        !isLight && "bg-[#141517]/40",
      )}
      style={isLight ? { backgroundColor: `${lightBg}66` } : undefined}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: isLight ? GLASS_RING_BACKGROUND_LIGHT : GLASS_RING_BACKGROUND_DARK,
          WebkitMaskImage: GLASS_RING_MASK,
          maskImage: GLASS_RING_MASK,
        }}
      />
      {children}
    </button>
  );
}

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
