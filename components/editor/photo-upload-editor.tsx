"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Upload, X } from "lucide-react";
import { resizeImageToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { PhotoItem } from "@/schemas/conversation-item";

function SortableThumb({ photo, onRemove }: { photo: PhotoItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border",
        isDragging && "z-10 opacity-50",
      )}
    >
      <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute inset-x-0 top-0 flex h-4 cursor-grab items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

export function PhotoUploadEditor({
  photos,
  onChangePhotos,
}: {
  photos: PhotoItem[];
  onChangePhotos: (photos: PhotoItem[]) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
      const resized = await Promise.all(files.map((file) => resizeImageToDataUrl(file)));
      const next: PhotoItem[] = resized.map((r) => ({ id: crypto.randomUUID(), ...r }));
      onChangePhotos([...photos, ...next]);
    } finally {
      setUploading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const from = photos.findIndex((p) => p.id === active.id);
      const to = photos.findIndex((p) => p.id === over.id);
      if (from !== -1 && to !== -1) {
        onChangePhotos(arrayMove(photos, from, to));
      }
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-1.5">
            {photos.map((photo) => (
              <SortableThumb
                key={photo.id}
                photo={photo}
                onRemove={() => onChangePhotos(photos.filter((p) => p.id !== photo.id))}
              />
            ))}
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              aria-label="Upload photos"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-foreground-subtle transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </SortableContext>
      </DndContext>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <span className="text-[11px] text-foreground-subtle">
        Drag thumbnails to reorder. First photo shows in front.
      </span>
    </div>
  );
}
