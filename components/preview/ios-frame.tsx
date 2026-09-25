"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Fixed design resolution (iPhone 14/15 Pro Max logical points). The frame
// is always laid out at exactly this size, then scaled as a single rigid
// unit to fit the available space — so nothing inside it ever reflows,
// overlaps, or resizes independently when the pane or browser zoom changes.
export const DESIGN_WIDTH = 430;
export const DESIGN_HEIGHT = 904;
export const SCREEN_CORNER_RADIUS = 55;

// Pure device chrome only: bezel, Dynamic Island, scaling. The status bar
// and app header live inside `children` (see InstagramPreview) so they can
// share one continuous background/blur/gradient container.
export function IosFrame({
  children,
  screenRef,
  flattened,
  dynamicIsland = true,
}: {
  children: React.ReactNode;
  // Ref to the screen surface only (content + Dynamic Island, no bezel/
  // shadow/scale) — this is what export captures, at whatever size it's
  // currently rendered on screen (see lib/screenshot.ts).
  screenRef?: React.Ref<HTMLDivElement>;
  // Drops the rounded corners and bezel shadow entirely, rendering (and
  // capturing) a plain rectangle instead — a screen-capture crop is always
  // a plain rectangle, and a plain rectangle can never cleanly bound a
  // rounded shape, so during the brief export instant there's simply no
  // rounding for that mismatch to happen with. Restored right after.
  flattened?: boolean;
  // False skips only the Dynamic Island pill — for generators (like
  // Notification Overlay) whose `children` is a real uploaded screenshot
  // that already has a real notch baked into its pixels, where drawing a
  // second synthetic one on top would double up. The black bezel
  // shadow/border stays either way: it's a box-shadow drawn outside the
  // screen's own bounds (see the `shadow-[...]` below), so it never
  // overlaps `children` — it's what actually reads as "this is a phone"
  // rather than a bare rectangle, so removing it made the frame invisible
  // instead of avoiding any real duplication.
  dynamicIsland?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      // The phone should read as an object sitting inside the pane, not
      // fill it edge to edge — cap it at 95% of the available height (also
      // benefits export quality: screen-capture resolution is bounded by
      // how big the frame actually renders on screen).
      const next = Math.min(width / DESIGN_WIDTH, (height * 0.95) / DESIGN_HEIGHT);
      setScale(next > 0 ? next : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const radius = flattened ? 0 : SCREEN_CORNER_RADIUS;

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative shrink-0"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          // A `transform` on this wrapper would become the containing block
          // for any `position: fixed` descendant (like the export capture
          // logic briefly applies to screenRef) instead of the real
          // viewport, trapping it inside this small scaled box instead of
          // letting it escape to the screen. Drop the transform entirely
          // while flattened (export-only) so that can't happen.
          transform: flattened ? undefined : `scale(${scale})`,
        }}
      >
        <div
          className={cn(
            "absolute inset-0 overflow-hidden bg-black",
            !flattened && "shadow-[0_0_0_10px_#1c1c1e,0_20px_50px_rgba(0,0,0,0.5)]",
          )}
          style={{ borderRadius: radius }}
        >
          <div
            ref={screenRef}
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: radius }}
          >
            <div className="absolute inset-0 flex flex-col">{children}</div>

            {dynamicIsland && (
              <div
                className="pointer-events-none absolute left-1/2 top-[11px] z-20 -translate-x-1/2 rounded-full bg-black"
                style={{ width: 126, height: 37 }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
