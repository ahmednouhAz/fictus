import { Layers } from "lucide-react";
import { truncateUsername } from "@/lib/format";
import type { PhotoItem } from "@/schemas/conversation-item";
import { cn } from "@/lib/utils";

const WIDTH = 239.33;
const HEIGHT = 351.67;
const RADIUS = 15.67;
const TOP_HEIGHT = 56.33;
const BOTTOM_HEIGHT = 54.67;
const PHOTO_HEIGHT = 240.67;
const PADDING_X = 9;
const CAPTION_PADDING_X = 12.33;
const AVATAR_SIZE = 31.67;
const AVATAR_GAP = 10;
const USERNAME_FONT = 14;
const CAPTION_FONT = 13.33;
const ICON_INSET = 8;

export function PostCard({
  thumbnail,
  ownerUsername,
  ownerAvatar,
  verified,
  caption,
  isCarousel,
  scale = 1,
  className,
  theme,
}: {
  thumbnail?: PhotoItem;
  ownerUsername?: string;
  ownerAvatar?: string;
  verified?: boolean;
  caption?: string;
  isCarousel?: boolean;
  scale?: number;
  className?: string;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  const isLongUsername = (ownerUsername?.length ?? 0) > 13;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width: WIDTH * scale, height: HEIGHT * scale }}
    >
      <div
        className="overflow-hidden bg-[#3a3a3c]"
        style={{
          width: WIDTH,
          height: HEIGHT,
          borderRadius: RADIUS,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          className={cn("flex items-center", isLight ? "bg-[#F0F1F3]" : "bg-[#262627]")}
          style={{
            height: TOP_HEIGHT,
            paddingLeft: PADDING_X,
            paddingRight: PADDING_X,
            gap: AVATAR_GAP,
          }}
        >
          <div
            className={cn(
              "shrink-0 overflow-hidden rounded-full",
              isLight ? "bg-black/10" : "bg-white/20",
            )}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            {ownerAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ownerAvatar} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <span
            className={cn(
              "min-w-0 truncate text-left font-medium",
              isLight ? "text-black" : "text-white",
              isLongUsername && "flex-1",
            )}
            style={{ fontSize: USERNAME_FONT }}
          >
            {ownerUsername ? truncateUsername(ownerUsername) : ""}
          </span>
          {verified && (
            <span
              aria-hidden
              className="shrink-0"
              style={{
                width: 16,
                height: 16,
                backgroundColor: "#5E4CF8",
                WebkitMaskImage: "url(/icons/verified.svg)",
                maskImage: "url(/icons/verified.svg)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
          )}
        </div>

        <div
          className="relative bg-[#3a3a3c]"
          style={{ height: PHOTO_HEIGHT + 2, marginTop: -1 }}
        >
          {thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail.dataUrl} alt="" className="h-full w-full object-cover" />
          )}
          {isCarousel && (
            <Layers
              className="absolute text-white"
              style={{ top: ICON_INSET, right: ICON_INSET, width: 16, height: 16 }}
              strokeWidth={2}
            />
          )}
        </div>

        <div
          className={isLight ? "bg-[#F0F1F3]" : "bg-[#262627]"}
          style={{
            height: BOTTOM_HEIGHT,
            paddingLeft: CAPTION_PADDING_X,
            paddingRight: CAPTION_PADDING_X,
            paddingTop: 6,
          }}
        >
          <p
            className={cn(
              "line-clamp-2 w-full text-left font-normal",
              isLight ? "text-black" : "text-white",
            )}
            style={{ fontSize: CAPTION_FONT }}
          >
            {ownerUsername && (
              <span className="font-semibold">{truncateUsername(ownerUsername)} </span>
            )}
            {caption}
          </p>
        </div>
      </div>
    </div>
  );
}
