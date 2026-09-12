import * as React from "react";
import { GlassRing } from "@/components/ui/glass-ring";
import { cn } from "@/lib/utils";

// Same glass material as every popup surface in the app (see
// components/ui/glass-ring.tsx) — the app's one default look for any
// floating or card-like surface, not just overlays.
function Panel({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative rounded-lg bg-black/40 backdrop-blur-md", className)}
      {...props}
    >
      <GlassRing className="rounded-lg" />
      {children}
    </div>
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 px-4 pt-4", className)}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-[13px] font-medium text-foreground", className)}
      {...props}
    />
  );
}

function PanelDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-[13px] text-foreground-muted", className)}
      {...props}
    />
  );
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}

export { Panel, PanelHeader, PanelTitle, PanelDescription, PanelContent };
