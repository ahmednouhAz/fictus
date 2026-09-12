"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { GlassRing } from "@/components/ui/glass-ring";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

function PopoverContent({
  className,
  align = "start",
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 w-72 rounded-lg bg-black/40 p-3 text-foreground shadow-md outline-none backdrop-blur-md",
          "data-[state=open]:animate-[overlay-in_150ms_var(--ease-standard)]",
          "data-[state=closed]:animate-[overlay-out_100ms_var(--ease-standard)]",
          className,
        )}
        {...props}
      >
        <GlassRing className="rounded-lg" />
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
