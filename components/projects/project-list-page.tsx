"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { useProjectStore } from "@/stores/useProjectStore";
import type { ProjectKind } from "@/schemas/project";

// Each generator category (Conversations, Chat List, ...) gets its own
// project list, filtered by `kind` — projects are never shown across
// categories, and a project only ever comes into existence when the user
// explicitly clicks "New" here (never as a side effect of just navigating
// into a category).
export function ProjectListPage({
  kind,
  breadcrumb,
  title,
  newProjectLabel,
  emptyTitle,
  emptyDescription,
}: {
  kind: ProjectKind;
  breadcrumb: string;
  title: string;
  newProjectLabel: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const [query, setQuery] = useState("");

  const ofKind = projects.filter((p) => (p.kind ?? "conversation") === kind);
  const filtered = ofKind.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  function handleCreate() {
    const project =
      kind === "conversation"
        ? createProject("instagram")
        : createProject("instagram", undefined, undefined, kind);
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] text-foreground-subtle">{breadcrumb}</p>
            <h1 className="mt-1 text-xl font-medium text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CommandPaletteTrigger />
            <Button onClick={handleCreate}>
              <Plus className="h-3.5 w-3.5" />
              {newProjectLabel}
            </Button>
          </div>
        </header>

        {ofKind.length > 0 && (
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="mb-6 max-w-xs"
          />
        )}

        {ofKind.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Button onClick={handleCreate} className="mt-1">
                <Plus className="h-3.5 w-3.5" />
                {newProjectLabel}
              </Button>
            }
          />
        ) : sorted.length === 0 ? (
          <EmptyState title="No matches" description={`Nothing found for "${query}".`} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
