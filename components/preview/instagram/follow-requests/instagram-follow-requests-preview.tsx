import { ChevronLeft } from "lucide-react";
import { SignalBars, WifiGlyph, BatteryGlyph } from "@/components/preview/status-bar-icons";
import { ProgressiveBlur } from "@/components/preview/progressive-blur";
import { InboxSearchBar } from "@/components/preview/instagram/chat-list/inbox-search-bar";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { HeaderGlassButton } from "@/components/preview/instagram/header-glass-button";
import type { FollowRequestRow } from "@/schemas/follow-request";
import type { Meridiem } from "@/schemas/conversation-item";
import { cn } from "@/lib/utils";

// Same fixed status-bar row + gradient treatment as the chat list preview
// (see instagram-chat-list-preview.tsx) — reproduced here rather than
// shared for the same reason noted there: heights/callers differ enough
// that factoring it out isn't worth it for a few lines of gain.
const STATUS_BAR_HEIGHT = 57;
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

// Up to 3 small overlapping circles — used for the "mutuals" subtitle
// variant instead of a plain @username line.
function MutualAvatarStack({ avatars, theme }: { avatars: string[]; theme?: "dark" | "light" }) {
  const isLight = theme === "light";
  return (
    <div className="flex shrink-0 items-center">
      {avatars.slice(0, 3).map((avatar, i) => (
        <div
          key={i}
          className={cn(
            "h-[20.46px] w-[20.46px] overflow-hidden rounded-full ring-2",
            isLight ? "ring-white" : "ring-[#0C1115]",
            i > 0 && "-ml-1.5",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function FollowRequestRowView({
  row,
  theme,
  onSelect,
}: {
  row: FollowRequestRow;
  theme?: "dark" | "light";
  onSelect?: () => void;
}) {
  const isLight = theme === "light";
  const mode = row.subtitleMode ?? "username";
  const mutualAvatars = row.mutualAvatars ?? [];

  const subtitleColor = isLight ? undefined : "#A7ABB4";
  const subtitleClassName = cn("truncate text-[13px]", isLight && "text-black/50");

  return (
    <div onClick={onSelect} className="flex cursor-pointer items-center gap-3 px-4 py-2.5">
      <InstagramAvatar name={row.displayName || "?"} avatarUrl={row.avatar} size={55.97} theme={theme} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-[14px] font-semibold leading-tight">
            {row.displayName || "Display name"}
          </p>
          {row.verified && <VerifiedBadge size={13} />}
        </div>
        {mode === "mutuals" ? (
          <div className="mt-1 flex items-center gap-1.5">
            {mutualAvatars.length > 0 && <MutualAvatarStack avatars={mutualAvatars} theme={theme} />}
            <p className={subtitleClassName} style={{ color: subtitleColor }}>
              {row.mutualsText?.trim() || "followed by people you follow"}
            </p>
          </div>
        ) : (
          <p className={subtitleClassName} style={{ color: subtitleColor }}>
            {row.username?.trim() || "username"}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span
          className="flex h-[34.74px] w-[87.61px] items-center justify-center rounded-[10px] bg-[#455CFF] text-[13px] font-semibold text-white"
        >
          Confirm
        </span>
        <span
          className={cn(
            "flex h-[34.74px] w-[71.79px] items-center justify-center rounded-[10px] text-[13px] font-semibold",
            isLight ? "bg-black/[0.06] text-black" : "text-white",
          )}
          style={!isLight ? { backgroundColor: "#2B3034" } : undefined}
        >
          Delete
        </span>
      </div>
    </div>
  );
}

export function InstagramFollowRequestsPreview({
  rows,
  theme,
  onSelectItem,
  statusBar,
}: {
  rows: FollowRequestRow[];
  theme?: "dark" | "light";
  // Clicking a row in the preview just calls this — the preview itself
  // doesn't show any selected/highlighted state, only the matching row in
  // the editor does (see FollowRequestsWorkspaceView's selectItem).
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
  const topChromeHeight = statusBarVisible ? STATUS_BAR_HEIGHT : 0;

  return (
    <div className={cn("relative flex h-full flex-col", isLight ? "bg-white text-black" : "bg-[#0C1115] text-white")}>
      <div style={{ height: topChromeHeight }} className="shrink-0" />

      <div
        className="relative flex h-[54px] shrink-0 items-center px-[17.33px]"
        style={{ transform: "translateY(-8.33px)" }}
      >
        <HeaderGlassButton
          ariaLabel="Back"
          isLight={isLight}
          darkBg="#1B2024"
          shape="circle"
          opaque
          lightShadow
          className="h-[43.61px] w-[43.61px]"
        >
          <ChevronLeft className="h-[24px] w-[24px]" strokeWidth={1.75} />
        </HeaderGlassButton>
        <p className="absolute left-1/2 -translate-x-1/2 text-[15px] font-bold">Follow requests</p>
        <HeaderGlassButton
          ariaLabel="Manage"
          isLight={isLight}
          darkBg="#1B2024"
          shape="pill"
          opaque
          lightShadow
          className="ml-auto h-[43.61px] w-[93.40px]"
        >
          <span className="text-[15px] font-semibold text-[#799FFF]">Manage</span>
        </HeaderGlassButton>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div>
          <InboxSearchBar
            theme={theme}
            placeholder="Search username or display name"
            height={43.61}
            darkBg="#252932"
            darkPlaceholderColor="#A7ABB4"
            fontSize={15}
          />
        </div>

        <div className="mt-[5px]">
          {rows.length === 0 ? (
            <p className={cn("px-4 py-8 text-center text-[13px]", isLight ? "text-black/40" : "text-white/40")}>
              No follow requests yet.
            </p>
          ) : (
            rows.map((row) => (
              <FollowRequestRowView
                key={row.id}
                row={row}
                theme={theme}
                onSelect={() => onSelectItem?.(row.id)}
              />
            ))
          )}
        </div>
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
              backgroundImage: isLight ? HEADER_GRADIENT_LIGHT : HEADER_GRADIENT_DARK,
            }}
          />
          <span className="relative text-[17px] font-semibold tabular-nums">
            {statusBarHour}:{String(statusBarMinute).padStart(2, "0")}
            {statusBarShowMeridiem ? ` ${statusBarMeridiem}` : ""}
          </span>
          <div className="relative flex items-center gap-[8px]">
            <SignalBars bars={statusBarSim1Bars} theme={theme} className="h-[14px] w-[22px]" />
            {statusBarSimCount === 2 && (
              <SignalBars bars={statusBarSim2Bars} theme={theme} className="h-[14px] w-[22px]" />
            )}
            {statusBarWifiEnabled && (
              <WifiGlyph bars={statusBarWifiBars} theme={theme} className="h-[14px] w-[20px]" />
            )}
            <BatteryGlyph percent={statusBarBatteryPercent} theme={theme} className="h-[14px] w-[31px]" />
          </div>
        </div>
      )}
    </div>
  );
}
