import type { PhotoItem } from "@/schemas/conversation-item";
import { cn } from "@/lib/utils";

const SIZE_PRESETS = {
  lg: { width: 168, height: 220, scale: 1 },
  md: { width: 88, height: 116, scale: 88 / 168 },
  sm: { width: 44, height: 58, scale: 44 / 168 },
} as const;

// Bounding box a single (non-stacked) photo is fit into, preserving its own
// aspect ratio instead of being cropped to the fixed card shape above.
const SINGLE_MAX = {
  lg: { width: 220, height: 280 },
  md: { width: 115, height: 146 },
  sm: { width: 58, height: 73 },
} as const;

// Horizontal offset + rotation per card, indexed by distance from the
// front-most card (0 = front). Offsets are at "lg" scale; other sizes scale
// them proportionally. Vertical spacing is handled separately, as a fraction
// of card height, via VERTICAL_STEP_RATIO below.
const FAN_OFFSETS = [
  { x: 0, rotate: 2 },
  { x: -25, rotate: -3 },
  { x: 25, rotate: 4 },
  { x: 0, rotate: -3 },
] as const;

// How far down each card behind the front one sits, as a fraction of card
// height. A 4-photo stack reads as a tight, mostly-hidden deck; 2-3 photo
// stacks fan out further so more of each card underneath is visible.
function verticalStepRatio(n: number) {
  return n >= 4 ? 0.08 : 0.7;
}

export function PhotoStack({
  photos,
  size = "lg",
  className,
}: {
  photos: PhotoItem[];
  size?: keyof typeof SIZE_PRESETS;
  className?: string;
}) {
  const { width, height, scale } = SIZE_PRESETS[size];
  const n = Math.min(Math.max(photos.length, 1), 4);
  const front = photos[0];

  if (n === 1) {
    const maxBox = SINGLE_MAX[size];
    let boxWidth = maxBox.width;
    let boxHeight = maxBox.height;
    if (front) {
      const ratio = front.width / front.height;
      boxHeight = boxWidth / ratio;
      if (boxHeight > maxBox.height) {
        boxHeight = maxBox.height;
        boxWidth = boxHeight * ratio;
      }
    }
    return (
      <div
        className={cn("overflow-hidden rounded-2xl bg-[#3a3a3c]", className)}
        style={{ width: boxWidth, height: boxHeight }}
      >
        {front && <img src={front.dataUrl} alt="" className="h-full w-full object-cover" />}
      </div>
    );
  }

  const yStep = height * verticalStepRatio(n);
  // distance 0 = front-most card, distance n-1 = furthest back
  const steps = Array.from({ length: n }, (_, distance) => {
    const offset = FAN_OFFSETS[distance];
    return { x: offset.x * scale, y: distance * yStep, rotate: offset.rotate };
  });

  const minX = Math.min(...steps.map((s) => s.x));
  const maxX = Math.max(...steps.map((s) => s.x));
  const maxY = Math.max(...steps.map((s) => s.y));
  const pad = 24 * scale;

  const originX = pad / 2 - minX;
  const originY = pad / 2;
  const containerWidth = width + (maxX - minX) + pad;
  const containerHeight = height + maxY + pad;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {steps.map((step, distance) => {
        const photo = photos[distance];
        return (
          <div
            key={photo?.id ?? distance}
            className="absolute overflow-hidden rounded-2xl bg-[#3a3a3c]"
            style={{
              width,
              height,
              left: originX + step.x,
              top: originY + (maxY - step.y),
              transform: `rotate(${step.rotate}deg)`,
              zIndex: n - distance,
            }}
          >
            {photo && <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />}
          </div>
        );
      })}
    </div>
  );
}
