"use client";

import { Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Meridiem } from "@/schemas/conversation-item";

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function TimePicker({
  hour,
  minute,
  meridiem,
  showMeridiem = true,
  onChangeHour,
  onChangeMinute,
  onChangeMeridiem,
  onChangeShowMeridiem,
}: {
  hour: number;
  minute: number;
  meridiem: Meridiem;
  showMeridiem?: boolean;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
  onChangeMeridiem: (meridiem: Meridiem) => void;
  onChangeShowMeridiem?: (show: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-8 items-center gap-0.5 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-1.5">
        <input
          type="number"
          value={hour}
          min={1}
          max={12}
          onChange={(e) => onChangeHour(clamp(Number(e.target.value), 1, 12))}
          className="w-6 bg-transparent text-center text-[13px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[13px] text-foreground-subtle">:</span>
        <input
          type="number"
          value={String(minute).padStart(2, "0")}
          min={0}
          max={59}
          onChange={(e) => onChangeMinute(clamp(Number(e.target.value), 0, 59))}
          className="w-6 bg-transparent text-center text-[13px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="flex h-8 shrink-0 items-center rounded-md border border-border p-0.5">
        {(["AM", "PM"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChangeMeridiem(opt);
              onChangeShowMeridiem?.(true);
            }}
            className={cn(
              "rounded px-1.5 py-1 text-[11px] font-medium transition-colors",
              showMeridiem && meridiem === opt
                ? "bg-accent/15 text-accent"
                : "text-foreground-subtle hover:text-foreground-muted",
            )}
          >
            {opt}
          </button>
        ))}
        {onChangeShowMeridiem && (
          <button
            type="button"
            onClick={() => onChangeShowMeridiem(false)}
            aria-label="No AM/PM"
            className={cn(
              "flex items-center rounded px-1.5 py-1 transition-colors",
              !showMeridiem
                ? "bg-accent/15 text-accent"
                : "text-foreground-subtle hover:text-foreground-muted",
            )}
          >
            <Ban className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
