"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryCard({
  title,
  description,
  icon: Icon,
  image,
  soon,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  // Path under /public (e.g. "/generators/instagram/chat-list.png"). Falls
  // back to the icon placeholder when omitted or the file doesn't exist.
  image?: string;
  soon?: boolean;
  onClick: () => void;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const showImage = image && !imageFailed;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={soon}
      className={cn(
        "group flex flex-col gap-4 overflow-hidden rounded-lg bg-transparent text-left opacity-75 transition-opacity",
        soon ? "cursor-default opacity-60" : "hover:opacity-100",
      )}
    >
      {/* Portrait image slot, matching the category images' own 773x1633
          ratio exactly. Sized off the card's (row-stretched) height rather
          than width, so the whole row fits the viewport instead of growing
          off-screen. */}
      <div className="aspect-[773/1633] min-h-0 flex-1 overflow-hidden">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-8 w-8 text-foreground-subtle" strokeWidth={1.5} />
          </div>
        )}
      </div>
      {/* Fixed height (not shrink-to-content) so every card's text block —
          and therefore every image slot above it — is exactly the same
          size regardless of how long each title/description happens to be.
          The description is narrower than the card so it wraps onto more,
          shorter lines instead of running edge to edge; the block is tall
          enough for that wrapped text in full, nothing gets truncated. */}
      <div className="flex h-36 shrink-0 flex-col items-center gap-1 p-4 text-center">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-medium text-foreground transition-colors group-hover:text-accent">
            {title}
          </h3>
          {soon && (
            <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] leading-none text-foreground-subtle">
              Soon
            </span>
          )}
        </div>
        <p className="max-w-[75%] text-[12px] text-foreground-subtle transition-colors group-hover:text-accent">
          {description}
        </p>
      </div>
    </button>
  );
}
