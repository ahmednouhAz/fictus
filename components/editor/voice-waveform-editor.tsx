"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { formatVoiceDuration } from "@/lib/format";
import {
  HEIGHT,
  PADDING_X,
  PLAY_WIDTH,
  PLAY_HEIGHT,
  PLAY_TO_BARS_GAP,
  BAR_MAX_HEIGHT,
  BAR_MIN_HEIGHT,
  BARS_TO_DURATION_GAP,
} from "@/components/preview/voice-note-bubble";
import { cn } from "@/lib/utils";

const BAR_WIDTH = 4;
const BAR_GAP = 8;
const HANDLE_SIZE = 12;
const HANDLE_DOT = 8;
const STEP_PX = 1.6;
const TICK_MS = 45;
const FALLOFF = [1, 0.6, 0.35, 0.15];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function nudge(heights: number[], index: number, dir: 1 | -1) {
  const next = [...heights];
  const apply = (i: number, factor: number) => {
    if (i < 0 || i >= next.length) return;
    next[i] = clamp(next[i] + STEP_PX * factor * dir, BAR_MIN_HEIGHT, BAR_MAX_HEIGHT);
  };
  apply(index, FALLOFF[0]);
  for (let d = 1; d <= 3; d++) {
    apply(index - d, FALLOFF[d]);
    apply(index + d, FALLOFF[d]);
  }
  return next;
}

export function VoiceWaveformEditor({
  durationSeconds,
  barHeights,
  onChangeBarHeights,
  isMe,
}: {
  durationSeconds: number;
  barHeights: number[];
  onChangeBarHeights: (heights: number[]) => void;
  isMe: boolean;
}) {
  const heightsRef = React.useRef(barHeights);
  React.useEffect(() => {
    heightsRef.current = barHeights;
  }, [barHeights]);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHold = React.useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  React.useEffect(() => stopHold, [stopHold]);

  function startHold(e: React.PointerEvent, index: number, dir: 1 | -1) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    stopHold();
    onChangeBarHeights(nudge(heightsRef.current, index, dir));
    intervalRef.current = setInterval(() => {
      onChangeBarHeights(nudge(heightsRef.current, index, dir));
    }, TICK_MS);
  }

  const playColor = isMe ? "white" : "#5E4CF8";

  return (
    <div
      className="flex shrink-0 items-center"
      style={{
        height: HEIGHT,
        paddingLeft: PADDING_X,
        paddingRight: PADDING_X,
        borderRadius: 19.33,
        backgroundColor: isMe ? "#5E4CF8" : "#262627",
      }}
    >
      <Play
        className="shrink-0"
        style={{ width: PLAY_WIDTH, height: PLAY_HEIGHT, color: playColor }}
        fill={playColor}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <div style={{ width: PLAY_TO_BARS_GAP }} />

      <div
        className="flex shrink-0 items-end"
        style={{ gap: BAR_GAP, paddingTop: HANDLE_SIZE, paddingBottom: HANDLE_SIZE }}
      >
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center justify-end"
            style={{ width: BAR_WIDTH, height: BAR_MAX_HEIGHT }}
          >
            <button
              type="button"
              aria-label="Increase bar"
              className="group absolute left-1/2 flex -translate-x-1/2 cursor-ns-resize touch-none items-center justify-center"
              style={{ top: -HANDLE_SIZE, width: HANDLE_SIZE, height: HANDLE_SIZE }}
              onPointerDown={(e) => startHold(e, i, 1)}
              onPointerUp={stopHold}
              onPointerCancel={stopHold}
            >
              <span
                className={cn(
                  "rounded-full bg-white/40 transition-all",
                  "group-hover:scale-125 group-hover:bg-white/80",
                  "group-active:scale-150 group-active:bg-white",
                )}
                style={{ width: HANDLE_DOT, height: HANDLE_DOT }}
              />
            </button>

            <span className="shrink-0 rounded-full bg-white" style={{ width: BAR_WIDTH, height: h }} />

            <button
              type="button"
              aria-label="Decrease bar"
              className="group absolute left-1/2 flex -translate-x-1/2 cursor-ns-resize touch-none items-center justify-center"
              style={{ bottom: -HANDLE_SIZE, width: HANDLE_SIZE, height: HANDLE_SIZE }}
              onPointerDown={(e) => startHold(e, i, -1)}
              onPointerUp={stopHold}
              onPointerCancel={stopHold}
            >
              <span
                className={cn(
                  "rounded-full bg-white/40 transition-all",
                  "group-hover:scale-125 group-hover:bg-white/80",
                  "group-active:scale-150 group-active:bg-white",
                )}
                style={{ width: HANDLE_DOT, height: HANDLE_DOT }}
              />
            </button>
          </div>
        ))}
      </div>

      <div style={{ width: BARS_TO_DURATION_GAP }} />
      <span className="shrink-0 font-light text-white" style={{ fontSize: 12 }}>
        {formatVoiceDuration(durationSeconds)}
      </span>
    </div>
  );
}
