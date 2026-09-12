"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useEditorStore } from "@/stores/useEditorStore";
import { MessageRow, CallPairRow } from "@/components/editor/message-row";
import { DividerRow } from "@/components/editor/divider-row";
import { SystemRow } from "@/components/editor/system-row";
import { InsertItemMenu } from "@/components/editor/insert-item-menu";
import { MessageComposer } from "@/components/editor/message-composer";
import { BulkActionBar } from "@/components/editor/bulk-action-bar";
import { EmptyState } from "@/components/ui/empty-state";
import type { ConversationItem, MessageItem } from "@/schemas/conversation-item";

export function MessageList({
  items,
  recipientName,
  disableMeSender,
}: {
  items: ConversationItem[];
  recipientName: string;
  // Message requests only ever contain the recipient's own messages.
  disableMeSender?: boolean;
}) {
  const reorderItems = useEditorStore((s) => s.reorderItems);
  const select = useEditorStore((s) => s.select);
  const selectedItemId = useEditorStore((s) => s.selectedItemId);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  React.useEffect(() => {
    if (!selectedItemId) return;
    const container = scrollContainerRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-item-id="${selectedItemId}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedItemId]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderItems(String(active.id), String(over.id));
    }
  }

  // A completed call's started/ended items are one editable unit (see
  // CallPairRow) — the "ended" half isn't independently draggable, so it's
  // left out of the sortable id list; dragging the "started" half moves
  // both together (handled in reorderItems).
  const dragIds = React.useMemo(() => {
    const consumedEndedIds = new Set(
      items
        .filter(
          (item): item is MessageItem =>
            item.kind === "message" &&
            item.type === "call" &&
            item.callPhase === "ended" &&
            !!item.pairId &&
            items.some((i) => i.id === item.pairId),
        )
        .map((item) => item.id),
    );
    return items.filter((item) => !consumedEndedIds.has(item.id)).map((item) => item.id);
  }, [items]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-3"
        onClick={() => select(null)}
      >
        {items.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Use the composer below to add the first message."
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={dragIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col">
                <InsertItemMenu index={0} disableMeSender={disableMeSender} />
                {items.map((item, index) => {
                  const isConsumedEndedCall =
                    item.kind === "message" &&
                    item.type === "call" &&
                    item.callPhase === "ended" &&
                    !!item.pairId &&
                    items.some((i) => i.id === item.pairId);
                  if (isConsumedEndedCall) return null;

                  const pairedEnded: MessageItem | undefined =
                    item.kind === "message" && item.type === "call" && item.callPhase === "started" && item.pairId
                      ? items.find(
                          (i): i is MessageItem =>
                            i.kind === "message" &&
                            i.type === "call" &&
                            i.callPhase === "ended" &&
                            i.id === item.pairId,
                        )
                      : undefined;
                  const afterIndex = pairedEnded
                    ? items.findIndex((i) => i.id === pairedEnded.id)
                    : index;

                  return (
                    <div key={item.id} data-item-id={item.id} className="flex flex-col">
                      {pairedEnded ? (
                        <CallPairRow
                          started={item as MessageItem}
                          ended={pairedEnded}
                          disableMeSender={disableMeSender}
                        />
                      ) : item.kind === "message" ? (
                        <MessageRow message={item} disableMeSender={disableMeSender} />
                      ) : item.kind === "divider" ? (
                        <DividerRow item={item} />
                      ) : (
                        <SystemRow item={item} recipientName={recipientName} />
                      )}
                      <InsertItemMenu index={afterIndex + 1} disableMeSender={disableMeSender} />
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <BulkActionBar disableMeSender={disableMeSender} />
      <MessageComposer disableMeSender={disableMeSender} />
    </div>
  );
}
