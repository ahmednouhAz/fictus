"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Check } from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";
import { cn } from "@/lib/utils";

export function ItemRowShell({
  id,
  selected,
  onSelect,
  extraAction,
  children,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  // Slot for a row-kind-specific action (e.g. MessageRow's reply picker)
  // rendered alongside Duplicate/Delete — dividers/system rows omit it.
  extraAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const duplicateItem = useEditorStore((s) => s.duplicateItem);
  const deleteItem = useEditorStore((s) => s.deleteItem);
  const checkedIds = useEditorStore((s) => s.checkedIds);
  const toggleChecked = useEditorStore((s) => s.toggleChecked);
  const checked = checkedIds.includes(id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={cn(
        "group flex items-start gap-2 rounded-md border border-transparent px-2 py-2 transition-colors",
        selected ? "border-accent/40 bg-accent/5" : "hover:glass-surface",
        isDragging && "opacity-50",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleChecked(id);
        }}
        aria-label={checked ? "Deselect" : "Select"}
        className={cn(
          "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-accent bg-accent text-accent-foreground opacity-100"
            : "border-border text-transparent opacity-0 group-hover:opacity-100 hover:border-accent/60",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>
      <button
        {...attributes}
        {...listeners}
        className="mt-1 flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className="min-w-0 flex-1">{children}</div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {extraAction}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            duplicateItem(id);
          }}
          aria-label="Duplicate"
          className="flex h-6 w-6 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-foreground"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteItem(id);
          }}
          aria-label="Delete"
          className="flex h-6 w-6 items-center justify-center rounded-md text-foreground-subtle hover:glass-surface hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
