"use client";

import * as React from "react";
import { Check, SmilePlus } from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const REACTION_PRESETS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

export function MessageReactionPicker({
  messageId,
  reaction,
}: {
  messageId: string;
  reaction?: string;
}) {
  const setMessageReaction = useEditorStore((s) => s.setMessageReaction);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(reaction ?? "");

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setDraft(reaction ?? "");
  }

  function selectPreset(emoji: string) {
    setMessageReaction(messageId, emoji);
    setOpen(false);
  }

  function confirmCustom() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMessageReaction(messageId, trimmed);
    setOpen(false);
  }

  function removeReaction() {
    setMessageReaction(messageId, null);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={reaction ? "Edit reaction" : "Add reaction"}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] transition-opacity",
            reaction
              ? "bg-surface-hover"
              : "text-foreground-subtle opacity-0 hover:glass-surface group-hover:opacity-100",
          )}
        >
          {reaction ?? <SmilePlus className="h-3.5 w-3.5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent onClick={(e) => e.stopPropagation()} className="w-64">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            {REACTION_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => selectPreset(emoji)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-[18px] hover:glass-surface",
                  reaction === emoji && "bg-accent/10",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border-t border-border pt-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmCustom();
                }
              }}
              placeholder="Paste any emoji"
              maxLength={8}
              className="h-8 w-full rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 text-[14px] text-foreground outline-none focus-visible:border-accent/60"
            />
            <button
              type="button"
              onClick={confirmCustom}
              aria-label="Confirm"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-accent/10"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          {reaction && (
            <button
              type="button"
              onClick={removeReaction}
              className="self-start text-[12px] text-foreground-subtle hover:text-danger"
            >
              Remove reaction
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
