import { cn } from "@/lib/utils";

// Simulates a blur that varies smoothly across an area — not natively
// possible with a single backdrop-filter (it's always one uniform value).
// Standard technique: stack many full-area layers, each blurred by a
// different amount, each masked to a vertical band. Each band is much
// wider than the spacing between layers, so neighboring layers overlap
// heavily — with enough layers this approximates a continuous gradient of
// blur strength instead of a few visible discrete steps. The last layer
// (weakest blur) tapers all the way to fully transparent by the very
// bottom instead of staying at full strength and cutting off — otherwise
// there's a visible seam where the blur meets the unblurred content below.
const LAYER_COUNT = 16;
const MAX_BLUR = 40;
const MIN_BLUR = 0.5;
const OVERLAP = 1.75;

const LAYERS = Array.from({ length: LAYER_COUNT }, (_, i) => {
  const t = i / (LAYER_COUNT - 1);
  // Geometric falloff — blur thins out quickly after the top rather than
  // in even steps, closer to how a real gradient would fall off.
  const blur = MAX_BLUR * Math.pow(MIN_BLUR / MAX_BLUR, t);

  const center = ((i + 0.5) / LAYER_COUNT) * 100;
  const halfWidth = (100 / LAYER_COUNT) * OVERLAP;
  const fadeInStart = Math.max(0, center - halfWidth * 2);
  const fadeInEnd = Math.max(0, center - halfWidth);
  const fadeOutStart = Math.min(100, center + halfWidth);
  const fadeOutEnd = Math.min(100, center + halfWidth * 2);

  const stops =
    i === 0
      ? `black 0%, black ${fadeOutStart}%, transparent ${fadeOutEnd}%`
      : i === LAYER_COUNT - 1
        ? `transparent ${fadeInStart}%, black ${fadeInEnd}%, transparent 100%`
        : `transparent ${fadeInStart}%, black ${fadeInEnd}%, black ${fadeOutStart}%, transparent ${fadeOutEnd}%`;

  return { blur, mask: `linear-gradient(to bottom, ${stops})` };
});

export function ProgressiveBlur({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            maskImage: layer.mask,
            WebkitMaskImage: layer.mask,
          }}
        />
      ))}
    </div>
  );
}
