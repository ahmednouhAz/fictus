import * as React from "react";
import { cn } from "@/lib/utils";

// The one floating-popup surface reused everywhere on the landing page —
// navbar, CTA, interface fragments, pricing — so the whole site reads as
// one consistent "premium OS popup" language rather than assorted cards.
export function GlassPanel({
  className,
  children,
  as: Comp = "div",
  noGradient,
  ...props
}: React.ComponentProps<"div"> & { as?: React.ElementType; noGradient?: boolean }) {
  return (
    <Comp
      className={cn(
        "relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl",
        // Layered onto the panel's own background (not a separate overlay
        // element) so children render directly as Comp's real DOM
        // children — any flex/grid layout classes passed via `className`
        // land on them as expected, instead of on a wrapper box.
        !noGradient && "bg-gradient-to-b from-white/[0.07] via-transparent to-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
