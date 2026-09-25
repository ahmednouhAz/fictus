import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { cn } from "@/lib/utils";

// A notification banner: a profile picture on the left (vertically
// centered against the text block, however tall it grows), and on the
// right a bold username line followed by up to 3 lines of message text —
// the 3rd line ellipsizes if the message runs longer. Positioned
// absolutely by the caller (see NotificationOverlayPreview).
export function NotificationBanner({
  avatar,
  username,
  body,
  theme = "dark",
}: {
  avatar?: string;
  username: string;
  body: string;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";

  return (
    <div
      className={cn(
        // isolate + translateZ(0) force this onto its own GPU compositing
        // layer — without it, Chrome's backdrop-filter can bleed a visible
        // glow/seam past this element's own box when it sits inside an
        // ancestor that's both `overflow-hidden` and `transform: scale(...)`
        // (exactly IosFrame's setup). That bleed only showed up in dark
        // mode because the leaking pixels read as a bright anomaly against
        // a dark background — light mode's own background is bright enough
        // to hide the same underlying bug.
        "isolate flex w-full items-center gap-3 rounded-[20px] px-3.5 py-3 backdrop-blur-[12px] [transform:translateZ(0)]",
        isLight ? "bg-white/85 text-black" : "bg-[#1c1c1e]/75 text-white",
      )}
    >
      <InstagramAvatar name={username || "?"} avatarUrl={avatar} size={44} theme={theme} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-tight">{username}</p>
        <p className="mt-0.5 line-clamp-3 text-[15px] font-light leading-tight break-words">{body}</p>
      </div>
    </div>
  );
}
