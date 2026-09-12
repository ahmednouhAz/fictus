import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-white/10 bg-black/40 px-3 text-sm text-foreground placeholder:text-foreground-subtle backdrop-blur-md transition-colors duration-150 outline-none",
        "hover:border-white/20",
        "focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
