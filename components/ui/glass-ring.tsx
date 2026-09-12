import { cn } from "@/lib/utils";

// Shared popup material: a soft diagonal highlight (light catching the
// top-left/bottom-right corners), masked down to a thin border ring via
// mask-composite so it reads as a rim rather than a filled gradient —
// paired with a blurred translucent fill on the popup itself. Used by
// every floating popup surface (Popover, DropdownMenu) so they read as
// one consistent material across the app.
const GLASS_RING_BACKGROUND =
  "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 28%, transparent 72%, rgba(255,255,255,0.28) 100%)";

export function GlassRing({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        padding: 1,
        background: GLASS_RING_BACKGROUND,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
}
