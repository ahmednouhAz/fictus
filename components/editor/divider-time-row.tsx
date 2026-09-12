"use client";

import { Check, X } from "lucide-react";
import { TimePicker } from "@/components/editor/time-picker";
import type { DividerDay, Meridiem } from "@/schemas/conversation-item";

const DAY_OPTIONS: { value: DividerDay; label: string }[] = [
  { value: "none", label: "No day" },
  { value: "yesterday", label: "Yesterday" },
  { value: "sun", label: "Sun" },
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
];

export function DividerTimeRow({
  day,
  hour,
  minute,
  meridiem,
  onChangeDay,
  onChangeHour,
  onChangeMinute,
  onChangeMeridiem,
  onConfirm,
  onCancel,
}: {
  day: DividerDay;
  hour: number;
  minute: number;
  meridiem: Meridiem;
  onChangeDay: (day: DividerDay) => void;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
  onChangeMeridiem: (meridiem: Meridiem) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={day}
        onChange={(e) => onChangeDay(e.target.value as DividerDay)}
        className="h-8 shrink-0 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-1.5 text-[12px] text-foreground outline-none focus-visible:border-accent/60"
      >
        {DAY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <TimePicker
        hour={hour}
        minute={minute}
        meridiem={meridiem}
        onChangeHour={onChangeHour}
        onChangeMinute={onChangeMinute}
        onChangeMeridiem={onChangeMeridiem}
      />

      <button
        type="button"
        onClick={onConfirm}
        aria-label="Confirm"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-accent/10"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-danger"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
