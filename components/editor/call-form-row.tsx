"use client";

import { Check, Phone, Video, X } from "lucide-react";
import { TimePicker } from "@/components/editor/time-picker";
import { ToggleButton } from "@/components/editor/toggle-button";
import type { CallKind, Meridiem, MessageSender } from "@/schemas/conversation-item";

export type CallTime = { hour: number; minute: number; meridiem: Meridiem };

export function CallFormRow({
  sender,
  callKind,
  phase,
  startTime,
  endTime,
  onChangeSender,
  onChangeCallKind,
  onChangePhase,
  onChangeStartTime,
  onChangeEndTime,
  onConfirm,
  onCancel,
  disableMeSender,
}: {
  sender: MessageSender;
  callKind: CallKind;
  phase: "ongoing" | "completed";
  startTime: CallTime;
  endTime: CallTime;
  onChangeSender: (sender: MessageSender) => void;
  onChangeCallKind: (kind: CallKind) => void;
  onChangePhase: (phase: "ongoing" | "completed") => void;
  onChangeStartTime: (time: CallTime) => void;
  onChangeEndTime: (time: CallTime) => void;
  onConfirm: () => void;
  onCancel: () => void;
  disableMeSender?: boolean;
}) {
  return (
    <div className="flex w-64 flex-col gap-2">
      {!disableMeSender && (
        <div className="flex items-center gap-1.5">
          <ToggleButton label="Me" active={sender === "me"} onClick={() => onChangeSender("me")} />
          <ToggleButton
            label="Recipient"
            active={sender === "recipient"}
            onClick={() => onChangeSender("recipient")}
          />
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <ToggleButton
          label="Audio"
          icon={<Phone className="h-3.5 w-3.5" />}
          active={callKind === "audio"}
          onClick={() => onChangeCallKind("audio")}
        />
        <ToggleButton
          label="Video"
          icon={<Video className="h-3.5 w-3.5" />}
          active={callKind === "video"}
          onClick={() => onChangeCallKind("video")}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <ToggleButton
          label="Ongoing"
          active={phase === "ongoing"}
          onClick={() => onChangePhase("ongoing")}
        />
        <ToggleButton
          label="Previous"
          active={phase === "completed"}
          onClick={() => onChangePhase("completed")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-foreground-subtle">
          {phase === "completed" ? "Started" : "Time"}
        </span>
        <TimePicker
          hour={startTime.hour}
          minute={startTime.minute}
          meridiem={startTime.meridiem}
          onChangeHour={(hour) => onChangeStartTime({ ...startTime, hour })}
          onChangeMinute={(minute) => onChangeStartTime({ ...startTime, minute })}
          onChangeMeridiem={(meridiem) => onChangeStartTime({ ...startTime, meridiem })}
        />
      </div>

      {phase === "completed" && (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-foreground-subtle">Ended</span>
          <TimePicker
            hour={endTime.hour}
            minute={endTime.minute}
            meridiem={endTime.meridiem}
            onChangeHour={(hour) => onChangeEndTime({ ...endTime, hour })}
            onChangeMinute={(minute) => onChangeEndTime({ ...endTime, minute })}
            onChangeMeridiem={(meridiem) => onChangeEndTime({ ...endTime, meridiem })}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-0.5">
        <button
          type="button"
          onClick={onConfirm}
          aria-label="Confirm"
          className="flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-danger"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
