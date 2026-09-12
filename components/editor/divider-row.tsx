"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";
import { ItemRowShell } from "@/components/editor/item-row-shell";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DividerTimeRow } from "@/components/editor/divider-time-row";
import { formatDividerLabel } from "@/lib/format";
import type { DividerDay, DividerItem, Meridiem } from "@/schemas/conversation-item";

export function DividerRow({ item }: { item: DividerItem }) {
  const selectedId = useEditorStore((s) => s.selectedItemId);
  const select = useEditorStore((s) => s.select);
  const updateDivider = useEditorStore((s) => s.updateDivider);

  const [open, setOpen] = React.useState(false);
  const [day, setDay] = React.useState<DividerDay>(item.day);
  const [hour, setHour] = React.useState(item.hour);
  const [minute, setMinute] = React.useState(item.minute);
  const [meridiem, setMeridiem] = React.useState<Meridiem>(item.meridiem);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDay(item.day);
      setHour(item.hour);
      setMinute(item.minute);
      setMeridiem(item.meridiem);
    }
  }

  function save() {
    updateDivider(item.id, { day, hour, minute, meridiem });
    setOpen(false);
  }

  return (
    <ItemRowShell
      id={item.id}
      selected={selectedId === item.id}
      onSelect={() => select(item.id)}
    >
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-foreground-muted hover:glass-surface"
          >
            <Clock className="h-3 w-3" />
            {formatDividerLabel(item.day, item.hour, item.minute, item.meridiem)}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" onClick={(e) => e.stopPropagation()}>
          <DividerTimeRow
            day={day}
            hour={hour}
            minute={minute}
            meridiem={meridiem}
            onChangeDay={setDay}
            onChangeHour={setHour}
            onChangeMinute={setMinute}
            onChangeMeridiem={setMeridiem}
            onConfirm={save}
            onCancel={() => onOpenChange(false)}
          />
        </PopoverContent>
      </Popover>
    </ItemRowShell>
  );
}
