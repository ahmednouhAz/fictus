import { truncateUsername } from "@/lib/format";
import type { PhotoItem } from "@/schemas/conversation-item";
import { cn } from "@/lib/utils";

const SIZE_PRESETS = {
  lg: { width: 171, height: 306 },
  sm: { width: 96, height: 172 },
} as const;

export function StoryCard({
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
  const isLongUsername = (ownerUsername?.length ?? 0) > 13;
  const { width, height } = SIZE_PRESETS[size];

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
    </div>
  );
}
