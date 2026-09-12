import { cn } from "@/lib/utils";

// Replaces the composer for a pending message request — you can't reply
// until you accept, so instead of a text field there's an accept/block/
// delete prompt. Sizes here follow the same /3 scale-down convention as
// the rest of this preview (source spec was given at 3x).
export const MESSAGE_REQUEST_BAR_HEIGHT = 148; // 443 / 3

const ACTION_BUTTON_STYLE = {
  height: 32, // 95 / 3
  borderRadius: 8, // 24 / 3
  fontSize: 14, // 41 / 3
} as const;

export function InstagramMessageRequestBar({
  recipientName,
  recipientUsername,
  theme,
}: {
  recipientName: string;
  recipientUsername?: string;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  return (
    <div
      className={cn("flex w-full flex-col justify-end", isLight ? "bg-[#FFFFFF]" : "bg-[#0C1115]")}
      style={{
        height: MESSAGE_REQUEST_BAR_HEIGHT,
        paddingBottom: 17,
        // Same divider weight as the dark theme's, just flipped to a
        // translucent black so it stays visible against a white bg instead
        // of blending into it.
        borderTop: isLight ? "2px solid rgba(0,0,0,0.12)" : "2px solid rgba(255,255,255,0.12)",
      }}
    >
      <div className="flex flex-col items-center gap-2 px-5 text-center">
        <p
          style={{ fontSize: 13 }}
          className={cn("font-semibold", isLight ? "text-black" : "text-white")}
        >
          Accept message request from {recipientName}
          {recipientUsername ? ` (${recipientUsername})` : ""}?
        </p>
        <p
          style={{ fontSize: 11, ...(isLight ? { color: "#6E6E70" } : undefined) }}
          className={cn(!isLight && "text-white/50")}
        >
          If you accept, they will also be able to call you and see info such as your
          activity status and when you&apos;ve read messages
        </p>
        <div className="mt-1 flex w-full gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center font-semibold"
            style={{ ...ACTION_BUTTON_STYLE, color: "#FE5F83" }}
          >
            Block
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center font-semibold"
            style={{ ...ACTION_BUTTON_STYLE, color: "#FE5F83" }}
          >
            Delete
          </button>
          <button
            type="button"
            className={cn(
              "flex flex-1 items-center justify-center font-semibold",
              isLight ? "text-black" : "text-white",
            )}
            style={{ ...ACTION_BUTTON_STYLE, backgroundColor: isLight ? "#F0F1F3" : "#262626" }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
