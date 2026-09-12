import { useId, type CSSProperties } from "react";

// 4 ascending pill-shaped bars (rounded caps via rx = half width), matching
// the wifi glyph's solid capsule style. `bars` (0-4) controls how many
// render solid — the rest stay faintly visible.
const NETWORK_BAR_X = [0, 6.11, 12.22, 18.33];
const NETWORK_BAR_Y = [8.17, 5.25, 2.33, 0];
const NETWORK_BAR_HEIGHT = [5.83, 8.75, 11.67, 14];
const NETWORK_BAR_WIDTH = 3.67;

export function SignalBars({
  bars = 4,
  theme,
  className,
  style,
}: {
  bars?: number;
  theme?: "dark" | "light";
  className?: string;
  style?: CSSProperties;
}) {
  const clamped = Math.max(0, Math.min(4, bars));
  const isLight = theme === "light";
  return (
    <svg viewBox="0 0 22 14" fill="currentColor" className={className} style={style}>
      {NETWORK_BAR_X.map((x, i) => {
        const active = i < clamped;
        return (
          <rect
            key={i}
            x={x}
            y={NETWORK_BAR_Y[i]}
            width={NETWORK_BAR_WIDTH}
            height={NETWORK_BAR_HEIGHT[i]}
            rx={NETWORK_BAR_WIDTH / 2}
            fill={!active && isLight ? "#B2B2B2" : undefined}
            opacity={active ? 1 : isLight ? 1 : 0.3}
          />
        );
      })}
    </svg>
  );
}

// Custom solid wifi glyph (dot + 2 arcs) supplied by the user, matching the
// filled-shape style of SignalBars. Only 3 discrete segments exist, so
// `bars` (0-4) clamps to 0-3 — level 4 renders the same as full (3).
const WIFI_SEGMENTS = [
  "M323.14,324.8l-38.2,38.2c-5.39,5.39-14.12,5.39-19.51,0l-38.2-38.2c-6.19-6.19-5.11-16.47,2.19-21.3c13.12-8.69,28.85-13.75,45.77-13.75s32.65,5.06,45.77,13.75C328.25,308.33,329.32,318.61,323.14,324.8z",
  "M351.23,192.77c-24.1-10.19-49.68-15.36-76.04-15.36s-51.94,5.17-76.04,15.36c-13.98,5.91-27.1,13.36-39.24,22.25c-12.91,9.45-14.17,28.29-2.85,39.6l0.01,0.01c9.11,9.11,23.53,10.32,33.94,2.71c8.85-6.48,18.42-11.9,28.6-16.21c17.59-7.44,36.29-11.21,55.59-11.21s38,3.77,55.59,11.21c10.18,4.31,19.75,9.73,28.6,16.21c10.4,7.61,24.82,6.4,33.94-2.71l0.01-0.01c11.31-11.31,10.05-30.15-2.85-39.6C378.32,206.13,365.2,198.68,351.23,192.77z",
  "M394.59,90.12C356.76,74.11,316.58,66,275.18,66s-81.57,8.11-119.41,24.12c-27.73,11.73-53.32,27.3-76.36,46.44c-11.86,9.85-12.62,27.81-1.71,38.71l0,0c9.62,9.62,24.96,10.24,35.44,1.55c19.05-15.8,40.19-28.65,63.09-38.34c31.33-13.25,64.62-19.97,98.95-19.97s67.62,6.72,98.95,19.97c22.9,9.69,44.04,22.54,63.09,38.34c10.48,8.69,25.81,8.08,35.44-1.55l0,0c10.9-10.9,10.14-28.85-1.71-38.71C447.91,117.42,422.33,101.85,394.59,90.12z",
];

export function WifiGlyph({
  bars = 4,
  theme,
  className,
  style,
}: {
  bars?: number;
  theme?: "dark" | "light";
  className?: string;
  style?: CSSProperties;
}) {
  const clamped = Math.max(0, Math.min(3, bars));
  const isLight = theme === "light";
  return (
    <svg
      viewBox="66 66 418 297"
      fill="currentColor"
      className={className}
      style={style}
    >
      {WIFI_SEGMENTS.map((d, i) => {
        const active = i < clamped;
        return (
          <path
            key={i}
            d={d}
            fill={!active && isLight ? "#B2B2B2" : undefined}
            opacity={active ? 1 : isLight ? 1 : 0.3}
          />
        );
      })}
    </svg>
  );
}

export function BatteryGlyph({
  percent,
  theme,
  className,
  style,
  showLabel = true,
}: {
  percent: number;
  theme?: "dark" | "light";
  className?: string;
  style?: CSSProperties;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillWidth = (clamped / 100) * 28;
  const fillColor = clamped < 20 ? "#FF3B30" : clamped <= 60 ? "#FFFFFF" : "#34C759";
  const trackColor = theme === "light" ? "#B2B2B2" : "#4D4D4D";
  const clipId = useId();
  return (
    <span className={className} style={{ ...style, position: "relative", display: "inline-flex" }}>
      <svg viewBox="0 0 32 15" className="h-full w-full">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="28" height="15" rx="5" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="28" height="15" rx="5" fill={trackColor} />
        <rect x="0" y="0" width={fillWidth} height="15" fill={fillColor} clipPath={`url(#${clipId})`} />
        <rect x="29" y="4.5" width="2" height="6" rx="1" fill={trackColor} />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center font-semibold leading-none text-white"
          style={{ fontSize: "14px", paddingRight: "6%" }}
        >
          {clamped}
        </span>
      )}
    </span>
  );
}
