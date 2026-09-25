import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Glass-rim border: visible all the way around the shape (like light
// grazing the raised edge of real glass), but brightest at the top-left and
// bottom-right — the rest fades down to a dim baseline instead of dropping
// to full transparency, so there's no dead/invisible arc. Plain translucent
// white, tuned separately per theme: the dark-theme opacities read fine
// against that near-black button fill, but the same low opacities are
// nearly invisible against the light theme's near-white fill, so light
// theme gets its own brighter stops instead of just blending away.
const GLASS_RING_BACKGROUND_DARK =
  "conic-gradient(from 0deg, rgba(255,255,255,0.13) 0deg, rgba(255,255,255,0.05) 45deg, rgba(255,255,255,0.22) 135deg, rgba(255,255,255,0.05) 225deg, rgba(255,255,255,0.22) 315deg, rgba(255,255,255,0.13) 360deg)";
const GLASS_RING_BACKGROUND_LIGHT =
  "conic-gradient(from 0deg, rgba(255,255,255,0.55) 0deg, rgba(255,255,255,0.25) 45deg, rgba(255,255,255,0.9) 135deg, rgba(255,255,255,0.25) 225deg, rgba(255,255,255,0.9) 315deg, rgba(255,255,255,0.55) 360deg)";
const GLASS_RING_MASK =
  "radial-gradient(circle closest-side, transparent calc(100% - 1.25px), black calc(100% - 1.25px))";

// Base glass-pill button — frosted background + a thin glass-rim ring —
// shared by every rounded-full header control (icon-only circles and
// text pills alike). `className` controls size/shape/padding; everything
// else about the glass treatment stays identical across every use so
// "the same button" actually means the same button, not a lookalike.
export function HeaderGlassButton({
  ariaLabel,
  isLight,
  lightBg = "#FEFEFE",
  darkBg = "#141517",
  className,
  // The conic+radial-mask ring trick below only produces a correct result
  // on a perfect circle — `radial-gradient(circle closest-side, ...)` sizes
  // itself off the *shorter* side, so on a wider pill button it paints a
  // small circular hole in the middle of the pill instead of hugging the
  // pill's actual outline (the "weird circle, not full background" bug).
  // Pills get a plain translucent border instead — it's shape-agnostic by
  // construction, so it can't have that failure mode.
  shape = "circle",
  // Solid, fully opaque fill instead of the default translucent one — the
  // glass-rim ring/border decoration stays either way, only the fill's
  // opacity and the backdrop-blur (pointless on a fully opaque fill) change.
  opaque = false,
  // A soft, spread drop shadow under the button — light mode only, since a
  // near-white button otherwise has almost no visible separation from a
  // white/light page background without one.
  lightShadow = false,
  children,
}: {
  ariaLabel: string;
  isLight?: boolean;
  lightBg?: string;
  darkBg?: string;
  className?: string;
  shape?: "circle" | "pill";
  opaque?: boolean;
  lightShadow?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "isolate relative flex shrink-0 items-center justify-center rounded-full",
        !opaque && "backdrop-blur-[36px]",
        shape === "pill" && (isLight ? "border border-black/10" : "border border-white/15"),
        isLight && lightShadow && "shadow-[0_2px_30px_rgba(0,0,0,0.08)]",
        className,
      )}
      style={{
        backgroundColor: opaque
          ? isLight
            ? lightBg
            : darkBg
          : isLight
            ? `${lightBg}66`
            : `${darkBg}66`,
      }}
    >
      {shape === "circle" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: isLight ? GLASS_RING_BACKGROUND_LIGHT : GLASS_RING_BACKGROUND_DARK,
            WebkitMaskImage: GLASS_RING_MASK,
            maskImage: GLASS_RING_MASK,
          }}
        />
      )}
      {children}
    </button>
  );
}

// Fixed 44px circle — the conversation header's back/info/call buttons
// (see instagram-header.tsx) and anywhere else that needs that exact same
// icon-only button.
export function HeaderIconButton({
  ariaLabel,
  isLight,
  lightBg,
  darkBg,
  children,
}: {
  ariaLabel: string;
  isLight?: boolean;
  lightBg?: string;
  darkBg?: string;
  children: ReactNode;
}) {
  return (
    <HeaderGlassButton
      ariaLabel={ariaLabel}
      isLight={isLight}
      lightBg={lightBg}
      darkBg={darkBg}
      className="h-11 w-11"
    >
      {children}
    </HeaderGlassButton>
  );
}
