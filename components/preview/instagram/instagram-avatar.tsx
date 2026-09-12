// Story ring's own thickness, and the gap between the ring and the photo
// itself — both fixed px regardless of avatar size, matching Instagram's
// own proportions closely enough at the sizes this app actually uses it at.
const RING_WIDTH = 2;
const RING_GAP = 2;

export function InstagramAvatar({
  name,
  avatarUrl,
  size = 32,
  story = "none",
}: {
  name: string;
  avatarUrl?: string;
  size?: number;
  // Matches Instagram's own story-ring treatment: a colorful gradient ring
  // when there's a story not yet watched, a plain gray ring once it's been
  // watched, no ring at all when there's no story.
  story?: "none" | "unseen" | "seen";
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const hasRing = story !== "none";

  // Three concentric, explicitly-sized layers (not padding + a box-shadow
  // ring) so the ring is genuinely centered and a consistent width all the
  // way around: outer ring color -> a fixed gap back to page-background
  // color -> the avatar itself, always exactly `size` regardless of ring
  // state, so nothing shifts layout when there's no story.
  const outerSize = hasRing ? size + 2 * (RING_GAP + RING_WIDTH) : size;
  const gapSize = hasRing ? size + 2 * RING_GAP : size;

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: outerSize,
        height: outerSize,
        background:
          story === "unseen"
            ? "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)"
            : story === "seen"
              ? "#8e8e8e"
              : "transparent",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-black"
        style={{ width: gapSize, height: gapSize }}
      >
        <div
          className="flex items-center justify-center overflow-hidden rounded-full bg-[#3a3a3c] text-white"
          style={{ width: size, height: size }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span style={{ fontSize: size * 0.4 }} className="font-medium">
              {initial}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
