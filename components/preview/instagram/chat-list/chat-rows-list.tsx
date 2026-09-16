import { cn } from "@/lib/utils";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { CallIcon } from "@/components/preview/call-icon";
import type { ChatPreviewKind, ChatRowData } from "@/schemas/chat-list";

export type { ChatPreviewKind, ChatRowData };

// /3 conversions of the given screenshot-scale spec — see notes-list.tsx
// for the same convention.
const SECTION_MARGIN_TOP = 58 / 3;
const SECTION_PADDING_LEFT = 48 / 3;
const TITLE_FONT_SIZE = 46 / 3;
const TITLE_GAP = 64 / 3;
const REQUESTS_FONT_SIZE = 35 / 3;
// Instagram's standard link/accent blue — same value used for the
// "Edited" label and verified badge elsewhere (see instagram-message-group.tsx).
const REQUESTS_COLOR = "#0095F6";
// Above this the count reads "9+" instead of the literal number, even
// though the underlying value the user picks can go higher.
const REQUESTS_DISPLAY_CAP = 8;
// Missed-call preview text always renders in this red, regardless of
// seen/unseen — Instagram's own missed-call red.
const MISSED_CALL_COLOR = "#ED4956";
const AVATAR_SIZE = 174 / 3;
const AVATAR_GAP = 36 / 3;
const USERNAME_FONT_SIZE = 42 / 3;
const PREVIEW_FONT_SIZE = 40 / 3;
const ROW_GAP = 46 / 3;

const MISSED_CALL_LABELS: Record<
  Extract<ChatPreviewKind, "missedVideoCall" | "missedAudioCall">,
  string
> = {
  missedVideoCall: "You missed a video chat",
  missedAudioCall: "You missed an audio call",
};

function ChatCallButton({
  kind,
  seen,
}: {
  kind: Extract<ChatPreviewKind, "missedVideoCall" | "missedAudioCall">;
  seen: boolean;
}) {
  return (
    <button
      type="button"
      // Purely decorative here (no call to place) — stops its click from
      // also selecting/highlighting the row underneath it.
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "ml-2 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-white",
        seen ? "border border-white/25 bg-black" : "bg-[#0095F6]",
      )}
    >
      <CallIcon
        kind={kind === "missedVideoCall" ? "video" : "audio"}
        phase="ended"
        className="h-3 w-3"
      />
      Call
    </button>
  );
}

// Always blue regardless of seen/unseen (unlike the call button, which
// flips to black/bordered when seen) — matches the "Call" button's height.
function ChatPlayButton() {
  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      aria-label="Play"
      className="ml-2 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#0095F6]"
    >
      <svg viewBox="0 0 16 16" className="ml-[1px] h-3 w-3" fill="white">
        <path d="M3.5 2.3c0-.9 1-1.5 1.8-1L13 6.2a1.2 1.2 0 0 1 0 2l-7.7 4.9c-.8.5-1.8-.1-1.8-1z" />
      </svg>
    </button>
  );
}

function ChatRow({
  chat,
  isLight,
  onSelect,
}: {
  chat: ChatRowData;
  isLight: boolean;
  onSelect?: () => void;
}) {
  // Unread-is-bold: unseen -> bold, seen -> regular weight.
  const usernameWeight = chat.seen ? 400 : 700;
  const textColor = isLight ? "#000000" : "#FFFFFF";
  const subtleColor = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";

  const previewKind = chat.previewKind ?? "text";
  const isMissedCall =
    previewKind === "missedVideoCall" || previewKind === "missedAudioCall";
  const isPlayButton = previewKind === "playButton";
  const previewLabel = isMissedCall
    ? MISSED_CALL_LABELS[previewKind]
    : chat.previewText;
  // Missed-call text is always bold, regardless of seen/unseen — the
  // call button (see ChatCallButton) is what carries the seen/unseen
  // distinction instead (blue when unseen, black/bordered when seen).
  const previewWeight = isMissedCall ? 700 : usernameWeight;
  // Missed-call text is always this red. Regular text is full white/black
  // like the username in both seen and unseen states — only the weight
  // above tells them apart. Either way, the trailing " · {time}" stays
  // its own constant dim/regular style, unaffected by seen/unseen.
  const previewColor = isMissedCall ? MISSED_CALL_COLOR : textColor;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center rounded-lg transition-colors",
        isLight ? "hover:bg-black/5" : "hover:bg-white/5",
      )}
      style={{ paddingRight: SECTION_PADDING_LEFT }}
    >
      <InstagramAvatar
        name={chat.username}
        avatarUrl={chat.avatar}
        size={AVATAR_SIZE}
        story={chat.story}
        theme={isLight ? "light" : "dark"}
      />
      <div style={{ width: AVATAR_GAP }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1">
          <span
            className="truncate"
            style={{
              fontSize: USERNAME_FONT_SIZE,
              fontWeight: usernameWeight,
              color: textColor,
            }}
          >
            {chat.username}
          </span>
          {chat.verified && (
            <VerifiedBadge size={USERNAME_FONT_SIZE * 0.75} />
          )}
        </span>
        <div
          className="flex min-w-0 items-baseline"
          style={{ fontSize: PREVIEW_FONT_SIZE }}
        >
          <span
            className="min-w-0 truncate"
            style={{ fontWeight: previewWeight, color: previewColor }}
          >
            {previewLabel}
          </span>
          <span
            className="shrink-0"
            style={{ fontWeight: 400, color: subtleColor }}
          >
            &nbsp;· {chat.time}
          </span>
        </div>
      </div>
      {isMissedCall && (
        <ChatCallButton
          kind={previewKind as Exclude<ChatPreviewKind, "text" | "playButton">}
          seen={chat.seen}
        />
      )}
      {isPlayButton && <ChatPlayButton />}
    </div>
  );
}

// The "Messages" section under the Notes tray, left-inset by
// SECTION_PADDING_LEFT, rows separated by ROW_GAP. Scrolls together with
// the Notes tray above it as one continuous feed (see
// InstagramChatListPreview's shared scroll container), matching the real
// app rather than having its own independent scroll region.
export function ChatRowsList({
  chats,
  requestsCount,
  theme,
  onSelectItem,
}: {
  chats: ChatRowData[];
  requestsCount?: number;
  theme?: "dark" | "light";
  onSelectItem?: (id: string) => void;
}) {
  const isLight = theme === "light";
  const hasRequests = !!requestsCount && requestsCount > 0;
  const requestsCountLabel = hasRequests
    ? requestsCount! > REQUESTS_DISPLAY_CAP
      ? `${REQUESTS_DISPLAY_CAP + 1}+`
      : String(requestsCount)
    : null;
  const requestsSubtleColor = isLight
    ? "rgba(0,0,0,0.4)"
    : "rgba(255,255,255,0.4)";
  return (
    <div
      style={{
        marginTop: SECTION_MARGIN_TOP,
        paddingLeft: SECTION_PADDING_LEFT,
        paddingRight: SECTION_PADDING_LEFT,
      }}
    >
      <div className="flex items-baseline justify-between">
        <h2
          className={cn("font-bold", isLight ? "text-black" : "text-white")}
          style={{ fontSize: TITLE_FONT_SIZE }}
        >
          Messages
        </h2>
        <span
          className="font-medium"
          style={{
            fontSize: REQUESTS_FONT_SIZE,
            color: hasRequests ? REQUESTS_COLOR : requestsSubtleColor,
          }}
        >
          {hasRequests ? `Requests (${requestsCountLabel})` : "Requests"}
        </span>
      </div>
      <div style={{ height: TITLE_GAP }} />
      <div className="flex flex-col" style={{ gap: ROW_GAP }}>
        {chats.map((chat) => (
          <ChatRow
            key={chat.id}
            chat={chat}
            isLight={isLight}
            onSelect={() => onSelectItem?.(chat.id)}
          />
        ))}
      </div>
    </div>
  );
}
