import { Home, Clapperboard, Search } from "lucide-react";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { cn } from "@/lib/utils";

// /3 conversions of the given screenshot-scale spec (66 from bottom, 1153
// width, 178 height, 67 icon size) — see notes-list.tsx for the same
// convention.
export const NAV_BAR_BOTTOM_OFFSET = 66 / 3;
export const NAV_BAR_HEIGHT = 178 / 3;
const NAV_BAR_WIDTH = 1153 / 3;
const ICON_SIZE = 67 / 3;
const SEND_PILL_WIDTH = 249 / 3;
const SEND_PILL_HEIGHT = 148 / 3;
// Theme-matched fill behind the active "send" icon — dark value as given,
// paired with a light-theme equivalent from the same neutral-gray family
// used elsewhere (see InboxSearchBar's F0F1F3/262627 pairing).
const SEND_PILL_BG_DARK = "#434446";
const SEND_PILL_BG_LIGHT = "#F0F1F3";

export function BottomNavBar({
  meUsername,
  theme,
}: {
  meUsername: string;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  return (
    <div
      className={cn(
        "pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center backdrop-blur-xl",
        isLight ? "border border-black/10 bg-white/60" : "border border-white/10 bg-black/40",
      )}
      style={{
        bottom: NAV_BAR_BOTTOM_OFFSET,
        width: NAV_BAR_WIDTH,
        height: NAV_BAR_HEIGHT,
        borderRadius: NAV_BAR_HEIGHT / 2,
      }}
    >
      <div className="relative flex flex-1 items-center justify-center">
        <Home
          className={isLight ? "text-black" : "text-white"}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          strokeWidth={1.75}
        />
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <Clapperboard
          className={isLight ? "text-black" : "text-white"}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          strokeWidth={1.75}
        />
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        {/* Purely a decorative fill behind the icon — sized/positioned on
            top of this equal-width slot rather than occupying it, so its
            extra width never throws off the even spacing between icons. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: SEND_PILL_WIDTH,
            height: SEND_PILL_HEIGHT,
            borderRadius: SEND_PILL_HEIGHT / 2,
            backgroundColor: isLight ? SEND_PILL_BG_LIGHT : SEND_PILL_BG_DARK,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/send.svg"
          alt="Messages"
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          className={cn("relative", isLight && "invert")}
        />
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <Search
          className={isLight ? "text-black" : "text-white"}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          strokeWidth={1.75}
        />
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <InstagramAvatar name={meUsername} size={ICON_SIZE} />
      </div>
    </div>
  );
}
