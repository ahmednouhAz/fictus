import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// /3 conversions of the given screenshot-scale spec (1209x134, 42 left
// padding) — see notes-list.tsx for the same convention.
const SEARCH_WIDTH = 403; // 1209 / 3
const SEARCH_HEIGHT = 44.67; // 134 / 3
const SEARCH_PADDING_LEFT = 14; // 42 / 3

export function InboxSearchBar({
  theme,
  placeholder = "Search or ask Meta AI",
  height = SEARCH_HEIGHT,
  darkBg = "#262627",
  darkPlaceholderColor,
  fontSize = 13,
}: {
  theme?: "dark" | "light";
  placeholder?: string;
  // Overrides below only ever apply in dark mode — callers that need a
  // specific look (see the Follow Requests preview) have only specified
  // one, and light mode's own defaults are unrelated to those values.
  height?: number;
  darkBg?: string;
  darkPlaceholderColor?: string;
  fontSize?: number;
}) {
  const isLight = theme === "light";
  return (
    <div className="flex justify-center px-3">
      <div
        className={cn("flex items-center gap-2 rounded-full", isLight && "bg-[#F0F1F3]")}
        style={{
          width: SEARCH_WIDTH,
          height,
          maxWidth: "100%",
          paddingLeft: SEARCH_PADDING_LEFT,
          paddingRight: SEARCH_PADDING_LEFT,
          backgroundColor: isLight ? undefined : darkBg,
        }}
      >
        <Search
          className={cn("h-4 w-4 shrink-0", isLight && "text-black/40")}
          style={!isLight ? { color: darkPlaceholderColor ?? "rgba(255,255,255,0.4)" } : undefined}
        />
        <span
          className={cn("truncate", isLight && "text-black/40")}
          style={{
            fontSize,
            color: !isLight ? (darkPlaceholderColor ?? "rgba(255,255,255,0.4)") : undefined,
          }}
        >
          {placeholder}
        </span>
      </div>
    </div>
  );
}
