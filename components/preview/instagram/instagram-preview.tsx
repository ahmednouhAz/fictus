"use client";

import * as React from "react";
import type { ConversationItem, MessageItem, Meridiem } from "@/schemas/conversation-item";
import type { ProfileCardRelationship } from "@/schemas/project";
import { formatDividerLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SignalBars, WifiGlyph, BatteryGlyph } from "@/components/preview/status-bar-icons";
import { ProgressiveBlur } from "@/components/preview/progressive-blur";
import { InstagramHeader } from "@/components/preview/instagram/instagram-header";
import { InstagramComposerBar } from "@/components/preview/instagram/instagram-composer-bar";
import {
  InstagramMessageRequestBar,
  MESSAGE_REQUEST_BAR_HEIGHT,
} from "@/components/preview/instagram/instagram-message-request-bar";
import { InstagramTimestampDivider } from "@/components/preview/instagram/instagram-timestamp-divider";
import { InstagramSystemMessage } from "@/components/preview/instagram/instagram-system-message";
import { InstagramMessageGroup } from "@/components/preview/instagram/instagram-message-group";
import { InstagramProfileCard } from "@/components/preview/instagram/instagram-profile-card";

// Combined height of the status bar + header rows that share one
// background/blur/gradient container below (status bar height only
// counts when it's actually visible — see topChromeHeight).
const STATUS_BAR_HEIGHT = 57;
const HEADER_HEIGHT = 60;

// Darkening overlay behind the status bar/header: stays essentially fully
// black through a short hold near the top (covering the Dynamic Island's
// own footprint), then eases out slowly and gradually the rest of the way.
// A plain 2-3 stop linear-gradient has a visible "elbow" wherever its slope
// changes — sampling a smoothstep curve at many stops instead avoids that
// kink and reads as one continuous fade. The hold is kept short so most of
// the height participates in the gradual fade, rather than compressing it
// into a shorter, more abrupt-looking span.
const HEADER_GRADIENT_HOLD = 0.15;
const HEADER_GRADIENT_STEPS = 24;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function buildHeaderGradient(rgb: string) {
  const stops: string[] = [];
  for (let i = 0; i <= HEADER_GRADIENT_STEPS; i++) {
    const t = i / HEADER_GRADIENT_STEPS;
    const opacity = 1 - smoothstep(HEADER_GRADIENT_HOLD, 1, t);
    stops.push(`rgba(${rgb},${opacity.toFixed(3)}) ${(t * 100).toFixed(2)}%`);
  }
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

const HEADER_GRADIENT_DARK = buildHeaderGradient("0,0,0");
const HEADER_GRADIENT_LIGHT = buildHeaderGradient("255,255,255");

// Reserved blank space below the last message so it never sits directly
// under the composer pill at rest — kept as a named constant since the
// "Me" bubble color mapping below needs the same value to know where the
// visible message band actually ends.
const BOTTOM_RESERVED_HEIGHT = 78;

// "Me" text bubbles shift color based on where they currently sit on
// screen — B332D7 near the top (just under the header), fading to 5851F9
// near the bottom (just above the composer). Recomputed on scroll/resize
// against each bubble's live position, not baked in once; the bubble's own
// `transition-colors` (see instagram-message-group.tsx) is what turns
// these discrete recalculations into the soft, gradual blend as it moves.
const ME_BUBBLE_TOP_COLOR = { r: 0xb3, g: 0x32, b: 0xd7 };
const ME_BUBBLE_BOTTOM_COLOR = { r: 0x58, g: 0x51, b: 0xf9 };

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

const CLUSTER_GAP_MS = 3 * 60 * 1000;

// Native wheel deltas feel too coarse for lining up an exact export frame —
// scale them down so a normal scroll gesture moves the conversation slowly
// and precisely instead of jumping past the moment the user wants to capture.
const WHEEL_SENSITIVITY = 0.35;

type TimelineEntry =
  | { key: string; kind: "group"; messages: MessageItem[] }
  | { key: string; kind: "divider"; label: string; itemId?: string }
  | { key: string; kind: "system"; template: string; itemId: string };

function buildTimeline(items: ConversationItem[]): TimelineEntry[] {
  const timeline: TimelineEntry[] = [];
  let currentGroup: MessageItem[] = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) {
      timeline.push({ key: currentGroup[0].id, kind: "group", messages: currentGroup });
      currentGroup = [];
    }
  };

  for (const item of items) {
    if (item.kind === "divider") {
      flushGroup();
      timeline.push({
        key: item.id,
        kind: "divider",
        label: formatDividerLabel(item.day, item.hour, item.minute, item.meridiem),
        itemId: item.id,
      });
      continue;
    }
    if (item.kind === "system") {
      flushGroup();
      timeline.push({ key: item.id, kind: "system", template: item.template, itemId: item.id });
      continue;
    }

    const prevMessage = currentGroup[currentGroup.length - 1];
    if (prevMessage) {
      const gap = new Date(item.timestamp).getTime() - new Date(prevMessage.timestamp).getTime();
      if (item.sender === prevMessage.sender && gap <= CLUSTER_GAP_MS) {
        currentGroup.push(item);
        continue;
      }
    }

    flushGroup();
    currentGroup.push(item);
  }
  flushGroup();

  return timeline;
}

export function InstagramPreview({
  recipientName,
  recipientNameHidden,
  recipientUsername,
  recipientAvatar,
  recipientStory,
  recipientVerified,
  profileCard,
  statusBar,
  items,
  isMessageRequest,
  theme,
}: {
  recipientName: string;
  recipientNameHidden?: boolean;
  recipientUsername?: string;
  recipientAvatar?: string;
  recipientStory?: "none" | "unseen" | "seen";
  recipientVerified?: boolean;
  profileCard?: {
    enabled?: boolean;
    followers?: string;
    posts?: number;
    relationship?: ProfileCardRelationship;
    followedSinceYear?: number;
    note?: string;
    showViewProfileButton?: boolean;
  };
  statusBar?: {
    visible?: boolean;
    hour?: number;
    minute?: number;
    meridiem?: Meridiem;
    showMeridiem?: boolean;
    battery?: number;
    simCount?: 1 | 2;
    sim1Bars?: number;
    sim2Bars?: number;
    wifiEnabled?: boolean;
    wifiBars?: number;
  };
  items: ConversationItem[];
  // A pending request from a stranger: no header call/info actions, the
  // profile card always leads (with its view-profile button), and the
  // composer is replaced by an accept/block/delete bar.
  isMessageRequest?: boolean;
  // Overall dark/light look of the chat — background, recipient bubbles,
  // header text/icons. "Me" bubbles and other blue accents stay blue
  // regardless — see instagram-message-group.tsx and instagram-header.tsx.
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  const statusBarVisible = statusBar?.visible ?? true;
  const statusBarHour = statusBar?.hour ?? 9;
  const statusBarMinute = statusBar?.minute ?? 41;
  const statusBarMeridiem = statusBar?.meridiem ?? "AM";
  const statusBarShowMeridiem = statusBar?.showMeridiem ?? false;
  const statusBarBatteryPercent = statusBar?.battery ?? 100;
  const statusBarSimCount = statusBar?.simCount ?? 1;
  const statusBarSim1Bars = statusBar?.sim1Bars ?? 4;
  const statusBarSim2Bars = statusBar?.sim2Bars ?? 4;
  const statusBarWifiEnabled = statusBar?.wifiEnabled ?? true;
  const statusBarWifiBars = statusBar?.wifiBars ?? 3;
  // Collapses to just the header's own height when the status bar is
  // hidden, rather than leaving a blank gap where it used to be.
  const topChromeHeight = statusBarVisible ? STATUS_BAR_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT;

  const timeline = buildTimeline(items);
  const messagesById = React.useMemo(() => {
    const map = new Map<string, MessageItem>();
    for (const item of items) {
      if (item.kind === "message") map.set(item.id, item);
    }
    return map;
  }, [items]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = React.useState({ top: 0, height: 0 });
  const THUMB_HEIGHT = 91;
  // The message request bar is much taller than the composer it replaces,
  // so messages need more bottom clearance to avoid sitting under it.
  const bottomReservedHeight = isMessageRequest
    ? MESSAGE_REQUEST_BAR_HEIGHT
    : BOTTOM_RESERVED_HEIGHT;

  const updateThumb = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!scrollEl || !trackEl) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    if (scrollHeight <= clientHeight) {
      setThumb({ top: 0, height: 0 });
      return;
    }
    const maxTop = Math.max(0, trackEl.clientHeight - THUMB_HEIGHT);
    const progress = scrollTop / (scrollHeight - clientHeight);
    setThumb({ top: progress * maxTop, height: THUMB_HEIGHT });
  }, [setThumb]);

  const updateMeBubbleColors = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const containerRect = scrollEl.getBoundingClientRect();
    const bandTop = containerRect.top + topChromeHeight;
    const bandHeight = Math.max(
      1,
      containerRect.height - topChromeHeight - bottomReservedHeight,
    );

    const allBubbles = scrollEl.querySelectorAll<HTMLElement>("[data-item-id]");
    allBubbles.forEach((el) => {
      if (el.dataset.meBubble !== "true") {
        // Clears any gradient color left over from when this bubble was
        // still a "me" bubble — that inline style is set outside React's
        // control below, so React's own re-render never removes it.
        el.style.backgroundColor = "";
        return;
      }
      const rect = el.getBoundingClientRect();
      const center = (rect.top + rect.bottom) / 2;
      const t = Math.min(1, Math.max(0, (center - bandTop) / bandHeight));
      const r = lerpChannel(ME_BUBBLE_TOP_COLOR.r, ME_BUBBLE_BOTTOM_COLOR.r, t);
      const g = lerpChannel(ME_BUBBLE_TOP_COLOR.g, ME_BUBBLE_BOTTOM_COLOR.g, t);
      const b = lerpChannel(ME_BUBBLE_TOP_COLOR.b, ME_BUBBLE_BOTTOM_COLOR.b, t);
      el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    });
  }, [bottomReservedHeight]);

  React.useEffect(() => {
    updateThumb();
    updateMeBubbleColors();
  }, [updateThumb, updateMeBubbleColors, items]);

  // Message requests are bottom-anchored (see the wrapper around
  // timelineContent below) — the scroll position has to actually start
  // there too, otherwise the default scrollTop of 0 just shows the
  // profile card with the messages scrolled out of view below it.
  React.useEffect(() => {
    if (!isMessageRequest) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    updateThumb();
  }, [isMessageRequest, items, updateThumb]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      el!.scrollTop += e.deltaY * WHEEL_SENSITIVITY;
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateMeBubbleColors);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateMeBubbleColors]);

  const timelineContent =
    items.length === 0 ? (
      <div className="flex flex-col gap-[12px]" />
    ) : (
      <div className="flex flex-col gap-[12px]">
        {timeline.map((entry) => {
          if (entry.kind === "divider") {
            return (
              <div key={entry.key} data-item-id={entry.itemId}>
                <InstagramTimestampDivider label={entry.label} theme={theme} />
              </div>
            );
          }
          if (entry.kind === "system") {
            return (
              <div key={entry.key} data-item-id={entry.itemId}>
                <InstagramSystemMessage template={entry.template} recipientName={recipientName} />
              </div>
            );
          }
          return (
            <InstagramMessageGroup
              key={entry.key}
              messages={entry.messages}
              recipientName={recipientName}
              recipientAvatar={recipientAvatar}
              messagesById={messagesById}
              theme={theme}
            />
          );
        })}
      </div>
    );

  return (
    <div className={cn("relative h-full", isLight ? "bg-[#FFFFFF]" : "bg-[#0C1115]")}>
      <div
        ref={scrollRef}
        data-export-scroll
        onScroll={() => {
          updateThumb();
          updateMeBubbleColors();
        }}
        className="no-scrollbar absolute inset-0 overflow-y-auto px-3"
        style={{ paddingTop: topChromeHeight, paddingBottom: bottomReservedHeight }}
      >
        {isMessageRequest ? (
          <>
            <InstagramProfileCard
              recipientName={recipientName}
              recipientNameHidden={recipientNameHidden}
              recipientUsername={recipientUsername}
              recipientAvatar={recipientAvatar}
              recipientVerified={recipientVerified}
              followers={profileCard?.followers}
              posts={profileCard?.posts}
              relationship={profileCard?.relationship}
              followedSinceYear={profileCard?.followedSinceYear}
              note={profileCard?.note}
              showViewProfileButton={profileCard?.showViewProfileButton}
              theme={theme}
            />
            {timelineContent}
          </>
        ) : (
          <>
            {profileCard?.enabled && (
              <InstagramProfileCard
                recipientName={recipientName}
                recipientNameHidden={recipientNameHidden}
                recipientUsername={recipientUsername}
                recipientAvatar={recipientAvatar}
                recipientVerified={recipientVerified}
                followers={profileCard?.followers}
                posts={profileCard?.posts}
                relationship={profileCard?.relationship}
                followedSinceYear={profileCard?.followedSinceYear}
                note={profileCard?.note}
                showViewProfileButton={profileCard?.showViewProfileButton}
                theme={theme}
              />
            )}
            {timelineContent}
          </>
        )}
      </div>

      <div
        ref={trackRef}
        className="pointer-events-none absolute bottom-[70px] right-[6px]"
        style={{ top: topChromeHeight }}
      >
        {thumb.height > 0 && (
          <div
            className="absolute right-0 w-[5px] rounded-full bg-white/25"
            style={{ top: thumb.top, height: thumb.height }}
          />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{ height: topChromeHeight }}
      >
        <ProgressiveBlur />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: isLight ? HEADER_GRADIENT_LIGHT : HEADER_GRADIENT_DARK }}
        />
        {statusBarVisible && (
          <div
            className={cn(
              "relative flex items-center justify-between pl-[61px] pr-[37px]",
              isLight ? "text-black" : "text-white",
            )}
            style={{ height: STATUS_BAR_HEIGHT }}
          >
            <span className="text-[17px] font-semibold tabular-nums">
              {statusBarHour}:{String(statusBarMinute).padStart(2, "0")}
              {statusBarShowMeridiem ? ` ${statusBarMeridiem}` : ""}
            </span>
            <div className="flex items-center gap-[8px]">
              <SignalBars bars={statusBarSim1Bars} theme={theme} className="h-[14px] w-[22px]" />
              {statusBarSimCount === 2 && (
                <SignalBars bars={statusBarSim2Bars} theme={theme} className="h-[14px] w-[22px]" />
              )}
              {statusBarWifiEnabled && (
                <WifiGlyph bars={statusBarWifiBars} theme={theme} className="h-[14px] w-[20px]" />
              )}
              <BatteryGlyph
                percent={statusBarBatteryPercent}
                theme={theme}
                className="h-[14px] w-[31px]"
              />
            </div>
          </div>
        )}
        <div className="relative pointer-events-auto" style={{ height: HEADER_HEIGHT }}>
          <InstagramHeader
            recipientName={recipientName}
            recipientNameHidden={recipientNameHidden}
            recipientUsername={recipientUsername}
            recipientAvatar={recipientAvatar}
            recipientStory={recipientStory}
            recipientVerified={recipientVerified}
            hideActions={isMessageRequest}
            theme={theme}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        {isMessageRequest ? (
          <InstagramMessageRequestBar
            recipientName={recipientName}
            recipientUsername={recipientUsername}
            theme={theme}
          />
        ) : (
          <InstagramComposerBar theme={theme} />
        )}
      </div>
    </div>
  );
}
