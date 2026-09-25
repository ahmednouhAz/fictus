import { ImageUp } from "lucide-react";
import { NotificationBanner } from "@/components/preview/instagram/notification-banner";

// The uploaded screenshot fills the whole design canvas edge to edge (the
// image is already a real screenshot, dynamic island and all — see
// IosFrame's `bezel={false}` usage in notification-workspace-view.tsx), with
// the banner overlaid near the top, same as a real iOS push notification
// dropping in over whatever was on screen.
export function NotificationOverlayPreview({
  backgroundImage,
  avatar,
  username,
  body,
  theme = "dark",
}: {
  backgroundImage?: string;
  avatar?: string;
  username: string;
  body: string;
  theme?: "dark" | "light";
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1c1c1e]">
      {backgroundImage ? (
        // object-contain, not object-cover — the whole point is to show the
        // user's screenshot exactly as they uploaded it, so it's never
        // cropped regardless of how its aspect ratio compares to the
        // design canvas below it (any mismatch just letterboxes instead).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backgroundImage} alt="" className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/40">
          <ImageUp className="h-8 w-8" strokeWidth={1.5} />
          <p className="max-w-[200px] text-center text-[13px]">
            Upload a screenshot to see the notification on top of it
          </p>
        </div>
      )}
      <div className="absolute inset-x-0 top-[66px] px-2.5">
        <NotificationBanner avatar={avatar} username={username} body={body} theme={theme} />
      </div>
    </div>
  );
}
