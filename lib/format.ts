import type { CallKind, CallPhase, DividerDay, Meridiem } from "@/schemas/conversation-item";

const DIVIDER_DAY_LABELS: Record<DividerDay, string> = {
  none: "",
  yesterday: "Yesterday",
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

export function formatClockTime(hour: number, minute: number, meridiem: Meridiem): string {
  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

export function formatDividerLabel(
  day: DividerDay,
  hour: number,
  minute: number,
  meridiem: Meridiem,
): string {
  const dayLabel = DIVIDER_DAY_LABELS[day];
  const time = formatClockTime(hour, minute, meridiem);
  return dayLabel ? `${dayLabel} ${time}` : time;
}

export function buildTimeFromClock(
  hour: number,
  minute: number,
  meridiem: Meridiem,
  base: Date = new Date(),
): string {
  const hour24 = (hour % 12) + (meridiem === "PM" ? 12 : 0);
  const date = new Date(base);
  date.setHours(hour24, minute, 0, 0);
  return date.toISOString();
}

export function clockFromTimestamp(iso: string): { hour: number; minute: number; meridiem: Meridiem } {
  const date = new Date(iso);
  const hours24 = date.getHours();
  const meridiem: Meridiem = hours24 >= 12 ? "PM" : "AM";
  const hour = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hour, minute: date.getMinutes(), meridiem };
}

export function formatCallTitle(kind: CallKind, phase: CallPhase): string {
  if (kind === "audio") return phase === "started" ? "Audio call" : "Audio call ended";
  return phase === "started" ? "Video call" : "Video call ended";
}

export function formatCallTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// Fills up to maxChars; if the username is longer, cuts 3 extra characters
// before the ellipsis rather than truncating right at the boundary.
export function truncateUsername(username: string, maxChars = 13): string {
  if (username.length <= maxChars) return username;
  return `${username.slice(0, Math.max(0, maxChars - 3))}...`;
}

export function formatVoiceDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  return new Date(iso).toLocaleDateString();
}
