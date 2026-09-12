import { Play } from "lucide-react";
import { truncateUsername } from "@/lib/format";
import type { PhotoItem } from "@/schemas/conversation-item";
import { cn } from "@/lib/utils";

const SIZE_PRESETS = {
  lg: { width: 160, height: 288 },
  sm: { width: 96, height: 152 },
} as const;

export function ReelCard({
  thumbnail,
  ownerUsername,
  ownerAvatar,
  verified,
  size = "lg",
  className,
}: {
  thumbnail?: PhotoItem;
  ownerUsername?: string;
  ownerAvatar?: string;
  verified?: boolean;
  size?: keyof typeof SIZE_PRESETS;
  className?: string;
}) {
  const { width, height } = SIZE_PRESETS[size];
  const isLongUsername = (ownerUsername?.length ?? 0) > 13;

  return (
    <div
      className={cn("relative overflow-hidden rounded-[15.67px] bg-[#3a3a3c]", className)}
      style={{ width, height }}
    >
      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnail.dataUrl} alt="" className="h-full w-full object-cover" />
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))",
        }}
      />

      <div className="absolute inset-x-0 top-0 flex items-center gap-[10px] p-3">
        <div className="h-[21px] w-[21px] shrink-0 overflow-hidden rounded-full bg-white/20">
          {ownerAvatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ownerAvatar} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <span
          className={cn(
            "min-w-0 truncate text-[14px] font-medium text-white",
            isLongUsername && "flex-1",
          )}
        >
          {ownerUsername ? truncateUsername(ownerUsername) : ""}
        </span>
        {verified && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icons/verified.svg" alt="" className="h-4 w-4 shrink-0" />
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <Play
          className="h-10 w-10 text-white"
          fill="white"
          strokeWidth={3}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))" }}
        />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/reel-badge.svg" alt="" className="absolute bottom-3 left-3 h-4 w-4" />
    </div>
  );
}
