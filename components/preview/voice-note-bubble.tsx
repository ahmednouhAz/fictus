import { Play } from "lucide-react";
import { formatVoiceDuration } from "@/lib/format";

export const HEIGHT = 64;
export const PADDING_X = 15;
export const PLAY_WIDTH = 30;
export const PLAY_HEIGHT = 31;
export const PLAY_TO_BARS_GAP = 14;
export const BAR_WIDTH = 3;
export const BAR_GAP = 3;
export const BAR_MAX_HEIGHT = 40;
export const BAR_MIN_HEIGHT = 8;
export const BARS_TO_DURATION_GAP = 15.67;
const DURATION_THRESHOLD_SECONDS = 4;
const MAX_BARS_AREA_WIDTH = 193;
const MIN_BARS_AREA_WIDTH = 32;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashSeed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  return h;
}

// Deterministic PRNG (mulberry32) so the same message id always regenerates
// the same "default" shape, while the randomize button uses Math.random.
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barsAreaWidth(durationSeconds: number) {
  if (durationSeconds >= DURATION_THRESHOLD_SECONDS) return MAX_BARS_AREA_WIDTH;
  const t = Math.max(0, durationSeconds) / DURATION_THRESHOLD_SECONDS;
  return Math.max(MIN_BARS_AREA_WIDTH, Math.round(t * MAX_BARS_AREA_WIDTH));
}

export function computeBarCount(durationSeconds: number) {
  const width = barsAreaWidth(durationSeconds);
  return Math.max(1, Math.floor(width / (BAR_WIDTH + BAR_GAP)));
}

// Builds a natural, speech-like envelope: a handful of overlapping smooth
// "syllable" bumps rather than independent per-bar noise, so the waveform
// flows instead of jittering bar-up-bar-down.
function generateSmoothBarHeights(count: number, rng: () => number): number[] {
  const heights = new Array(count).fill(BAR_MIN_HEIGHT);
  const syllableCount = Math.max(2, Math.round(count / 5));
  for (let s = 0; s < syllableCount; s++) {
    const center = rng() * count;
    const width = 1.2 + rng() * 2.3;
    const peak = BAR_MIN_HEIGHT + rng() * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT);
    for (let i = 0; i < count; i++) {
      const dist = i - center;
      const bump = peak * Math.exp(-(dist * dist) / (2 * width * width));
      if (bump > heights[i]) heights[i] = bump;
    }
  }
  return heights.map((h) => Math.round(clamp(h, BAR_MIN_HEIGHT, BAR_MAX_HEIGHT)));
}

export function generateDefaultBarHeights(durationSeconds: number, seedId: string) {
  const count = computeBarCount(durationSeconds);
  const rng = mulberry32(hashSeed(seedId) + 1);
  return generateSmoothBarHeights(count, rng);
}

export function generateRandomBarHeights(count: number) {
  return generateSmoothBarHeights(count, Math.random);
}

export function VoiceNoteBubble({
  id,
  durationSeconds,
  barHeights,
  isMe,
}: {
  id: string;
  durationSeconds: number;
  barHeights?: number[];
  isMe: boolean;
}) {
  const bars = barHeights ?? generateDefaultBarHeights(durationSeconds, id);
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
      <div className="flex shrink-0 items-center" style={{ gap: BAR_GAP, height: BAR_MAX_HEIGHT }}>
        {bars.map((h, i) => (
          <span
            key={i}
            className="shrink-0 rounded-full bg-white"
            style={{ width: BAR_WIDTH, height: h }}
          />
        ))}
      </div>
      <div style={{ width: BARS_TO_DURATION_GAP }} />
      <span className="shrink-0 font-light text-white" style={{ fontSize: 12 }}>
        {formatVoiceDuration(durationSeconds)}
      </span>
    </div>
  );
}
