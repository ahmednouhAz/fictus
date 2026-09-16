import { cn } from "@/lib/utils";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import type { NoteItemData } from "@/schemas/chat-list";

export type { NoteItemData };

// All measurements below are the /3 (screenshot-scale -> design-scale)
// conversions of the original spec, matching the rest of this app's
// convention for pixel values given from a real 3x iOS screenshot — see
// the top-of-file comment in instagram-message-group.tsx.
const BUBBLE_WIDTH = 95; // 285 / 3 — fixed; height is the only variable dimension
// No max-height on the bubble itself — it takes the min height its content
// needs (this default when short) and is free to grow taller and overflow
// upward past the avatar's top edge when content needs more room. The
// avatar/username stay in normal flow below it, so those always line up
// the same regardless of how tall any one bubble gets.
const BUBBLE_HEIGHT_DEFAULT = 47; // 141 / 3
const BUBBLE_RADIUS = 14.67; // 44 / 3
const USERNAME_GAP = 6.67; // 20 / 3
const USERNAME_FONT = 10; // 30 / 3 ("Your note" size, reused for every username)
const MUSIC_FONT = 10.67; // 32 / 3
const ITEM_GAP = 73 / 3;
// Avatar diameter isn't given a spec number — sized to read proportionate
// to the 95px bubble, matching real Instagram Notes tray proportions.
const AVATAR_SIZE = 235 / 3;
const BUBBLE_TEXT_LINE_HEIGHT = 13;
// Notch/circle tail geometry — offset toward the bubble's left edge rather
// than centered: notch sits 10px in from the left and overlaps up into
// the bubble's bottom edge; the circle sits 5px below the notch, same
// left offset.
const NOTCH_LEFT = 15;
const NOTCH_WIDTH = 15;
const NOTCH_HEIGHT = 12;
const NOTCH_OVERLAP = 0; // how far the notch tucks up into the bubble
const CIRCLE_GAP = 5;
const CIRCLE_SIZE = 8;
// The bubble (+ notch + circle) is absolutely positioned relative to the
// avatar's own top edge (`bottom: 100%` on that box, plus this offset) —
// this is the one value that controls the gap between the bubble's
// bottom and the top of the profile picture. Tweak this directly to
// reposition it; 0 means the bubble's bottom edge touches the avatar's
// top edge exactly.
const BUBBLE_BOTTOM_OFFSET = 70;
// How far the avatar's top edge sits from the top of its own wrapper
// (i.e. from where the bubble's `bottom: 100%` anchor point is) — pushes
// the avatar down without moving the bubble, which stays anchored to the
// wrapper's top regardless of this value.
const AVATAR_TOP = 144 / 3;

// Three vertical bars, high-low-high, sized/positioned to read as a small
// music-equalizer glyph next to the track info.
function MusicBars({ isLight }: { isLight: boolean }) {
  const color = isLight ? "#000000" : "#FFFFFF";
  const bars = [
    { height: 14, key: "left" },
    { height: 7, key: "mid" },
    { height: 14, key: "right" },
  ];
  return (
    <div
      className="flex shrink-0 items-center gap-[2px]"
      style={{ height: 14 }}
    >
      {bars.map((bar) => (
        <span
          key={bar.key}
          className="w-[3px] rounded-full"
          style={{ height: bar.height, backgroundColor: color }}
        />
      ))}
    </div>
  );
}

// One bubble+notch+circle+avatar+username column. The notch and circle are
// same-color shapes layered with deliberate overlap onto the bubble's
// bottom edge (rather than separate bordered pieces) so the seams
// disappear and the whole thing reads as one continuous body, not three
// parts stuck together.
const BUBBLE_MAX_HEIGHT = 189 / 3;
const BUBBLE_PADDING_Y = 10;
// How many lines of text actually fit within the bubble's max height once
// its own vertical padding is subtracted — line-clamp uses this to cut
// off overflowing text and append "…" itself, rather than us guessing a
// character count (font metrics make character-based estimates unreliable).
const BUBBLE_MAX_LINES = Math.max(
  1,
  Math.floor(
    (BUBBLE_MAX_HEIGHT - BUBBLE_PADDING_Y * 2) / BUBBLE_TEXT_LINE_HEIGHT,
  ),
);
// Dark-theme bubble fill — a diagonal gradient rather than a flat color.
// Light theme keeps its existing flat fill; these two specific hex values
// only read correctly against a dark surface.
const BUBBLE_GRADIENT = "linear-gradient(135deg, #3C4147 0%, #293036 100%)";
// Thin 1px border, brightest at the top-left corner and fading out from
// there — same masked-gradient-ring technique as PopoverContent's own
// border (see components/ui/popover.tsx).
const BUBBLE_BORDER_GRADIENT =
  "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, transparent 60%)";

function NoteItem({
  note,
  isLight,
  onSelect,
}: {
  note: NoteItemData;
  isLight: boolean;
  onSelect?: () => void;
}) {
  const bubbleColor = isLight ? "#F0F1F3" : "#262627";
  const bubbleBackground = isLight ? bubbleColor : BUBBLE_GRADIENT;
  const textColor = isLight ? "#000000" : "#FFFFFF";

  return (
    <div
      onClick={onSelect}
      className="flex shrink-0 cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
      style={{ width: BUBBLE_WIDTH }}
    >
      {/* Relative wrapper's only normal-flow content is the avatar, so
          `bottom: 100%` on the absolutely-positioned bubble/notch/circle
          below lands exactly at the avatar's own top edge — the position
          is calculated from the profile picture directly, not from a
          separately-tracked reserved height that has to be kept in sync. */}
      <div className="relative" style={{ width: BUBBLE_WIDTH }}>
        <div
          className="absolute z-10 left-0 flex items-center justify-center"
          style={{
            bottom: `calc(100% - ${BUBBLE_BOTTOM_OFFSET}px)`,
            width: BUBBLE_WIDTH,
            minHeight: BUBBLE_HEIGHT_DEFAULT,
            maxHeight: BUBBLE_MAX_HEIGHT,
            overflow: "hidden",
            borderRadius: BUBBLE_RADIUS,
            background: bubbleBackground,
            paddingTop: BUBBLE_PADDING_Y,
            paddingBottom: BUBBLE_PADDING_Y,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          {!isLight && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: BUBBLE_RADIUS,
                padding: 1,
                background: BUBBLE_BORDER_GRADIENT,
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
          )}
          {note.type === "text" ? (
            <p
              className="text-center"
              style={{
                color: textColor,
                fontSize: USERNAME_FONT,
                lineHeight: `${BUBBLE_TEXT_LINE_HEIGHT}px`,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: BUBBLE_MAX_LINES,
                overflow: "hidden",
              }}
            >
              {note.content}
            </p>
          ) : (
            <div className="flex w-full items-center gap-1.5">
              <MusicBars isLight={isLight} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="truncate"
                  style={{
                    color: textColor,
                    fontSize: MUSIC_FONT,
                    fontWeight: 600,
                    lineHeight: 1.15,
                  }}
                >
                  {note.musicTitle}
                </span>
                <span
                  className="truncate"
                  style={{
                    color: textColor,
                    fontSize: MUSIC_FONT,
                    fontWeight: 400,
                    lineHeight: 1.15,
                  }}
                >
                  {note.musicArtist}
                </span>
              </div>
            </div>
          )}

          {/* Notch + circle: children of the bubble itself, positioned
              relative to ITS box (not the avatar) — small fixed offsets
              off the bubble's own bottom edge, so they travel with it
              automatically wherever BUBBLE_BOTTOM_OFFSET (or the bubble's
              own dynamic height) puts it, with no shared formula to keep
              in sync. */}
          <div
            className="absolute"
            style={{
              left: NOTCH_LEFT,
              bottom: -(NOTCH_HEIGHT - NOTCH_OVERLAP),
              width: NOTCH_WIDTH,
              height: NOTCH_HEIGHT,
              borderRadius: NOTCH_HEIGHT / 2,
              background: bubbleBackground,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: NOTCH_LEFT + 5,
              bottom:
                -(NOTCH_HEIGHT - NOTCH_OVERLAP) - CIRCLE_GAP - CIRCLE_SIZE,
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              background: bubbleBackground,
            }}
          />
        </div>

        <div className="flex justify-center" style={{ marginTop: AVATAR_TOP }}>
          <InstagramAvatar
            name={note.username}
            avatarUrl={note.avatar}
            size={AVATAR_SIZE}
            story={note.story}
            theme={isLight ? "light" : "dark"}
          />
        </div>
      </div>

      <div style={{ height: USERNAME_GAP }} />

      <span className="flex max-w-full items-center justify-center gap-0.5">
        <span
          className="min-w-0 truncate"
          style={{
            fontSize: USERNAME_FONT,
            fontWeight: note.isCurrentUser ? 400 : 500,
            color: note.isCurrentUser
              ? "#8e8e8e"
              : isLight
                ? "#000000"
                : "#FFFFFF",
          }}
        >
          {note.isCurrentUser ? "Your note" : note.username}
        </span>
        {!note.isCurrentUser && note.verified && (
          <VerifiedBadge size={USERNAME_FONT * 0.75} />
        )}
      </span>
    </div>
  );
}

// Horizontal, independently-scrollable strip of notes. The first item is
// always the current user (forced to the front regardless of `notes`
// order) and shows "Your note" instead of a username. Sized so roughly
// 3.5 items are visible at once — three full, the fourth cut off — as the
// scroll affordance, rather than fitting a clean round number of items.
export function NotesList({
  notes,
  theme,
  className,
  onSelectItem,
}: {
  notes: NoteItemData[];
  theme?: "dark" | "light";
  className?: string;
  onSelectItem?: (id: string) => void;
}) {
  const isLight = theme === "light";
  const ordered = [
    ...notes.filter((n) => n.isCurrentUser),
    ...notes.filter((n) => !n.isCurrentUser),
  ];

  return (
    <div
      className={cn(
        "no-scrollbar flex overflow-y-auto  overflow-x-auto px-3",
        className,
      )}
      style={{ gap: ITEM_GAP }}
    >
      {ordered.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isLight={isLight}
          onSelect={() => onSelectItem?.(note.id)}
        />
      ))}
    </div>
  );
}
