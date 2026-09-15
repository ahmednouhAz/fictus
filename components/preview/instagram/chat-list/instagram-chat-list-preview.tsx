"use client";

import * as React from "react";
import {
  SignalBars,
  WifiGlyph,
  BatteryGlyph,
} from "@/components/preview/status-bar-icons";
import { ProgressiveBlur } from "@/components/preview/progressive-blur";
import { InboxTopBar } from "@/components/preview/instagram/chat-list/inbox-top-bar";
import { InboxSearchBar } from "@/components/preview/instagram/chat-list/inbox-search-bar";
import {
  NotesList,
  type NoteItemData,
} from "@/components/preview/instagram/chat-list/notes-list";
import {
  ChatRowsList,
  type ChatRowData,
} from "@/components/preview/instagram/chat-list/chat-rows-list";
import {
  BottomNavBar,
  NAV_BAR_BOTTOM_OFFSET,
  NAV_BAR_HEIGHT,
} from "@/components/preview/instagram/chat-list/bottom-nav-bar";
import type { Meridiem } from "@/schemas/conversation-item";
import { cn } from "@/lib/utils";

// Clearance so the last chat row never sits underneath the floating nav
// bar — its own bottom offset plus its height, plus a little breathing
// room above it.
const BOTTOM_RESERVED_HEIGHT = NAV_BAR_BOTTOM_OFFSET + NAV_BAR_HEIGHT + 12;

// Same fixed status-bar row as the conversation preview (see
// instagram-preview.tsx) — kept as its own small block here rather than
// factored out, since it's the one piece explicitly reused as-is.
const STATUS_BAR_HEIGHT = 57;

// Same smoothstep-sampled darkening gradient behind the pinned chrome as
// the conversation header (see instagram-preview.tsx's buildHeaderGradient)
// — reproduced here rather than shared since the two headers' heights and
// callers differ enough that a shared helper would need its own generic
// height/rgb plumbing for a few lines of gain.
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

export function InstagramChatListPreview({
  meUsername,
  showAccountSwitcher,
  notes,
  chats,
  requestsCount,
  theme,
  statusBar,
  onSelectItem,
}: {
  meUsername: string;
  showAccountSwitcher?: boolean;
  notes: NoteItemData[];
  chats: ChatRowData[];
  requestsCount?: number;
  theme?: "dark" | "light";
  // Clicking a note/chat row in the preview just calls this — the preview
  // itself doesn't show any selected/highlighted state, only the matching
  // row in the editor does (see InstagramChatListGeneratorPage).
  onSelectItem?: (id: string) => void;
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
  // Collapses to zero when the status bar is hidden, rather than leaving a
  // blank gap where it used to be — same convention as instagram-preview.tsx.
  const topChromeHeight = statusBarVisible ? STATUS_BAR_HEIGHT : 0;

  // Same custom-drawn scrollbar (native one hidden via no-scrollbar, a
  // floating thumb tracks scroll progress) as instagram-preview.tsx's
  // conversation view — reproduced here so the two match exactly.
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = React.useState({ top: 0, height: 0 });
  const THUMB_HEIGHT = 91;

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

  React.useEffect(() => {
    updateThumb();
  }, [updateThumb, notes, chats]);

  return (
    <div
      className={cn(
        "relative h-full",
        isLight ? "bg-[#FFFFFF]" : "bg-[#0C1115]",
      )}
    >
      <div
        ref={scrollRef}
        onScroll={updateThumb}
        className="no-scrollbar absolute inset-0 overflow-y-auto"
        style={{
          paddingTop: topChromeHeight,
          paddingBottom: BOTTOM_RESERVED_HEIGHT,
        }}
      >
        <InboxTopBar
          username={meUsername}
          showAccountSwitcher={showAccountSwitcher}
          theme={theme}
        />
        <InboxSearchBar theme={theme} />
        <NotesList notes={notes} theme={theme} onSelectItem={onSelectItem} />
        <ChatRowsList
          chats={chats}
          requestsCount={requestsCount}
          theme={theme}
          onSelectItem={onSelectItem}
        />
      </div>

      <div
        ref={trackRef}
        className="pointer-events-none absolute right-[6px]"
        style={{ top: topChromeHeight, bottom: BOTTOM_RESERVED_HEIGHT - 8 }}
      >
        {thumb.height > 0 && (
          <div
            className="absolute right-0 w-[5px] rounded-full bg-white/25"
            style={{ top: thumb.top, height: thumb.height }}
          />
        )}
      </div>

      {statusBarVisible && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between pl-[61px] pr-[37px]",
            isLight ? "text-black" : "text-white",
          )}
          style={{ height: STATUS_BAR_HEIGHT }}
        >
          <ProgressiveBlur />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: isLight
                ? HEADER_GRADIENT_LIGHT
                : HEADER_GRADIENT_DARK,
            }}
          />
          <span className="relative text-[17px] font-semibold tabular-nums">
            {statusBarHour}:{String(statusBarMinute).padStart(2, "0")}
            {statusBarShowMeridiem ? ` ${statusBarMeridiem}` : ""}
          </span>
          <div className="relative flex items-center gap-[8px]">
            <SignalBars
              bars={statusBarSim1Bars}
              theme={theme}
              className="h-[14px] w-[22px]"
            />
            {statusBarSimCount === 2 && (
              <SignalBars
                bars={statusBarSim2Bars}
                theme={theme}
                className="h-[14px] w-[22px]"
              />
            )}
            {statusBarWifiEnabled && (
              <WifiGlyph
                bars={statusBarWifiBars}
                theme={theme}
                className="h-[14px] w-[20px]"
              />
            )}
            <BatteryGlyph
              percent={statusBarBatteryPercent}
              theme={theme}
              className="h-[14px] w-[31px]"
            />
          </div>
        </div>
      )}

      <BottomNavBar meUsername={meUsername} theme={theme} />
    </div>
  );
}
