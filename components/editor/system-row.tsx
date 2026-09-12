"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/useEditorStore";
import { ItemRowShell } from "@/components/editor/item-row-shell";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SystemPresetButtons } from "@/components/editor/system-message-presets";
import { parseSystemTemplate } from "@/lib/system-template";
import type { SystemItem } from "@/schemas/conversation-item";

export function SystemRow({ item, recipientName }: { item: SystemItem; recipientName: string }) {
  const selectedId = useEditorStore((s) => s.selectedItemId);
  const select = useEditorStore((s) => s.select);
  const updateSystemMessage = useEditorStore((s) => s.updateSystemMessage);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(item.template);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setDraft(item.template);
  }

  function save() {
    updateSystemMessage(item.id, draft);
    setOpen(false);
  }

  function selectPreset(template: string) {
    updateSystemMessage(item.id, template);
    setOpen(false);
  }

  const segments = parseSystemTemplate(item.template, recipientName);

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
            className="w-full rounded-md px-2 py-1.5 text-center text-[12px] italic text-foreground-muted hover:glass-surface"
          >
            {segments.map((seg, i) =>
              seg.bold ? (
                <strong key={i} className="font-semibold not-italic">
                  {seg.text}
                </strong>
              ) : (
                <React.Fragment key={i}>{seg.text}</React.Fragment>
              ),
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <SystemPresetButtons onSelect={selectPreset} />
            <div className="flex flex-col gap-1.5 border-t border-border pt-3">
              <label className="text-[11px] text-foreground-subtle">
                Custom — use <code>{"{name}"}</code> for the recipient&apos;s name and{" "}
                <code>**word**</code> for bold
              </label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="{name} visited your **blend**."
                rows={3}
                className="w-full resize-none rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 py-1.5 text-sm text-foreground outline-none focus-visible:border-accent/60"
              />
            </div>
            <Button size="sm" onClick={save}>
              Save
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </ItemRowShell>
  );
}
