"use client";

import { Search } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

export function CommandPaletteTrigger() {
  const toggle = useUIStore((s) => s.toggleCommandPalette);

  return (
    <button
      onClick={toggle}
      className="flex h-9 items-center gap-2 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-3 text-[13px] text-foreground-subtle transition-colors hover:border-border-strong hover:text-foreground-muted"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search</span>
      <kbd className="ml-2 rounded border border-border px-1 text-[10px] text-foreground-subtle">
        ⌘K
      </kbd>
    </button>
  );
}
