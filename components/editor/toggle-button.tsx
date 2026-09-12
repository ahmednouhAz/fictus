"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ToggleButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1 rounded-md border px-2 text-[12px] transition-colors",
        active
          ? "border-accent/50 text-accent"
          : "border-border text-foreground-subtle hover:text-foreground-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
