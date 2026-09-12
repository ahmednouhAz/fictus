"use client";

import { ArrowLeftRight, Trash2, X } from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";

// Appears once one or more rows are checked (see the checkbox in
// ItemRowShell) — lets several items be deleted or flipped to the other
// sender in a single action instead of one at a time.
export function BulkActionBar({ disableMeSender }: { disableMeSender?: boolean }) {
  const checkedIds = useEditorStore((s) => s.checkedIds);
  const clearChecked = useEditorStore((s) => s.clearChecked);
  const deleteCheckedItems = useEditorStore((s) => s.deleteCheckedItems);
  const switchSenderForCheckedItems = useEditorStore((s) => s.switchSenderForCheckedItems);

  if (checkedIds.length === 0) return null;

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-bg-elevated px-3 py-2">
      <span className="text-[12px] text-foreground-muted">
        {checkedIds.length} selected
      </span>
      <div className="flex items-center gap-1">
        {!disableMeSender && (
          <button
            type="button"
            onClick={switchSenderForCheckedItems}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-foreground-subtle hover:glass-surface hover:text-foreground"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Switch side
          </button>
        )}
        <button
          type="button"
          onClick={deleteCheckedItems}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-foreground-subtle hover:glass-surface hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
        <button
          type="button"
          onClick={clearChecked}
          aria-label="Clear selection"
          className="flex h-6 w-6 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
