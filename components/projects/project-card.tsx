"use client";

import * as React from "react";
import Link from "next/link";
import { Star, MoreHorizontal, Pencil, Copy, Trash2, List } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { useProjectStore } from "@/stores/useProjectStore";
import type { Project } from "@/schemas/project";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  const renameProject = useProjectStore((s) => s.renameProject);
  const duplicateProject = useProjectStore((s) => s.duplicateProject);
  const toggleFavorite = useProjectStore((s) => s.toggleFavorite);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const [renaming, setRenaming] = React.useState(false);
  const [draftName, setDraftName] = React.useState(project.name);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed) renameProject(project.id, trimmed);
    else setDraftName(project.name);
    setRenaming(false);
  }

  const isChatList = project.kind === "chatList";

  return (
    <Panel className="flex items-start gap-3 border border-border p-4">
      {isChatList ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-hover text-foreground-muted">
          <List className="h-5 w-5" />
        </div>
      ) : (
        <InstagramAvatar
          name={project.recipientName}
          avatarUrl={project.recipientAvatar}
          size={44}
          story={project.recipientStory ?? "none"}
        />
      )}

      <div className="min-w-0 flex-1">
        {/* Same recipient username can recur across many conversations —
            the conversation's own title (below) is what actually tells
            them apart, so it stays the primary editable/clickable line. */}
        <div className="flex items-center gap-1">
          <span className="truncate text-[12px] font-medium text-foreground-muted">
            {isChatList
              ? "Chat List"
              : project.recipientUsername || project.recipientName}
          </span>
          {!isChatList && project.recipientVerified && <VerifiedBadge size={12} />}
        </div>

        {renaming ? (
          <Input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitRename();
              }
              if (e.key === "Escape") {
                setDraftName(project.name);
                setRenaming(false);
              }
            }}
            className="mt-0.5 h-7 text-[13px]"
          />
        ) : (
          <Link
            href={`/projects/${project.id}`}
            className="mt-0.5 block truncate text-[13px] font-medium text-foreground hover:text-accent"
          >
            {project.name}
          </Link>
        )}

        <p className="mt-1 text-[11px] text-foreground-subtle">
          Updated {relativeTime(project.updatedAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          onClick={() => toggleFavorite(project.id)}
          aria-label={project.favorite ? "Remove from favorites" : "Add to favorites"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:glass-surface hover:text-foreground"
        >
          <Star className={cn("h-3.5 w-3.5", project.favorite && "fill-accent text-accent")} />
        </button>

        <DropdownMenu onOpenChange={(open) => !open && setConfirmingDelete(false)}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="More actions">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setDraftName(project.name);
                setRenaming(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => duplicateProject(project.id)}>
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {confirmingDelete ? (
              <DropdownMenuItem
                onSelect={() => deleteProject(project.id)}
                className="text-danger focus:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" /> Confirm delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmingDelete(true);
                }}
                className="text-danger focus:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Panel>
  );
}
