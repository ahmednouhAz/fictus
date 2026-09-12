import { ChevronDown, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";

// /3 conversions of the given screenshot-scale spec (190 height, 68 font,
// 67 vertical padding, 79 from the right edge) — see notes-list.tsx for
// the same convention.
export const INBOX_TOP_BAR_HEIGHT = 63.33; // 190 / 3
const BAR_HEIGHT = INBOX_TOP_BAR_HEIGHT;
const PADDING_Y = 22.33; // 67 / 3
const USERNAME_FONT = 22.67; // 68 / 3
const COMPOSE_RIGHT_OFFSET = 26.33; // 79 / 3

export function InboxTopBar({
  username,
  // The chevron next to the username is a switch-accounts affordance in
  // real Instagram — this app treats whether it's shown as an editable
  // toggle rather than something that's always on.
  showAccountSwitcher = true,
  theme,
}: {
  username: string;
  showAccountSwitcher?: boolean;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  return (
    <div
      className="relative flex shrink-0 items-center justify-end"
      style={{ height: BAR_HEIGHT, paddingTop: PADDING_Y, paddingBottom: PADDING_Y }}
    >
      <div className="absolute left-1/2 flex max-w-[70%] -translate-x-1/2 items-center gap-1">
        <span
          className={cn("truncate font-bold", isLight ? "text-black" : "text-white")}
          style={{ fontSize: USERNAME_FONT }}
        >
          {username}
        </span>
        {showAccountSwitcher && (
          <ChevronDown
            className={cn("h-4 w-4 shrink-0", isLight ? "text-black" : "text-white")}
            strokeWidth={2.5}
          />
        )}
      </div>
      <button
        type="button"
        aria-label="New message"
        className={cn("shrink-0", isLight ? "text-black" : "text-white")}
        style={{ marginRight: COMPOSE_RIGHT_OFFSET }}
      >
        <SquarePen className="h-6 w-6" strokeWidth={1.75} />
      </button>
    </div>
  );
}
