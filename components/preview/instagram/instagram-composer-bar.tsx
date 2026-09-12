import { Image as ImageIcon, CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export const COMPOSER_PILL_WIDTH = 413;
export const COMPOSER_PILL_HEIGHT = 43;
export const COMPOSER_BOTTOM_STRIP_HEIGHT = 19;

export function InstagramComposerBar({ theme }: { theme?: "dark" | "light" }) {
  const isLight = theme === "light";
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div
        className={cn(
          "isolate relative flex h-[43px] w-[413px] shrink-0 items-center overflow-hidden rounded-full pl-[5px] pr-[19px] outline-none backdrop-blur-[64px]",
          isLight ? "bg-[#E5E6E8]/70 text-black" : "bg-[#141517]/70 text-white",
        )}
      >
        <div className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full bg-[#5E4CF8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/camera.svg" alt="" className="h-4 w-4" />
        </div>
        <span
          className={cn("ml-2.5 flex-1 truncate text-[15px] font-normal", !isLight && "text-white/40")}
          style={isLight ? { color: "#6E6E70" } : undefined}
        >
          Message...
        </span>
        <div className="flex shrink-0 items-center gap-[17px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/voice-clip.svg"
            alt=""
            className={cn("h-[22px] w-[22px]", isLight && "invert")}
          />
          <ImageIcon className="h-[22px] w-[22px]" strokeWidth={1.6} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/sticker.svg"
            alt=""
            className={cn("h-[22px] w-[22px]", isLight && "invert")}
          />
          <CirclePlus className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </div>
      </div>
      <div className={cn("h-[19px] w-full shrink-0", isLight ? "bg-[#FFFFFF]" : "bg-[#0C1115]")} />
    </div>
  );
}
