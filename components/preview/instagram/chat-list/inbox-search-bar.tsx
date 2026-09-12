import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// /3 conversions of the given screenshot-scale spec (1209x134, 42 left
// padding) — see notes-list.tsx for the same convention.
const SEARCH_WIDTH = 403; // 1209 / 3
const SEARCH_HEIGHT = 44.67; // 134 / 3
const SEARCH_PADDING_LEFT = 14; // 42 / 3

export function InboxSearchBar({ theme }: { theme?: "dark" | "light" }) {
  const isLight = theme === "light";
  return (
    <div className="flex justify-center px-3">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full",
          isLight ? "bg-[#F0F1F3]" : "bg-[#262627]",
        )}
        style={{
          width: SEARCH_WIDTH,
          height: SEARCH_HEIGHT,
          maxWidth: "100%",
          paddingLeft: SEARCH_PADDING_LEFT,
          paddingRight: SEARCH_PADDING_LEFT,
        }}
      >
        <Search className={cn("h-4 w-4 shrink-0", isLight ? "text-black/40" : "text-white/40")} />
        <span
          className={cn("truncate text-[13px]", isLight ? "text-black/40" : "text-white/40")}
        >
          Search or ask Meta AI
        </span>
      </div>
    </div>
  );
}
