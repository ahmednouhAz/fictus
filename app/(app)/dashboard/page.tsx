"use client";

import { useRouter } from "next/navigation";
import { Camera, MessageCircle } from "lucide-react";
import { useProjectStore } from "@/stores/useProjectStore";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { cn } from "@/lib/utils";

const generators = [
  { id: "instagram", label: "Instagram", icon: Camera, enabled: true },
  { id: "imessage", label: "iMessage", icon: MessageCircle, enabled: false },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, enabled: false },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);

  const recent = [...projects]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 4);
  const favorites = projects.filter((p) => p.favorite).slice(0, 4);

  function handleCreate(enabled: boolean) {
    if (!enabled) return;
    const project = createProject("instagram");
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-foreground-subtle">Dashboard</p>
            <h1 className="mt-1 text-xl font-medium text-foreground">
              Create something.
            </h1>
          </div>
          <CommandPaletteTrigger />
        </header>

        <section className="mb-12">
          <div className="grid grid-cols-3 gap-3">
            {generators.map((g) => (
              <button
                key={g.id}
                onClick={() => handleCreate(g.enabled)}
                disabled={!g.enabled}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-lg border border-border bg-surface/60 p-4 text-left transition-colors",
                  g.enabled
                    ? "hover:border-border-strong hover:bg-surface-hover"
                    : "cursor-not-allowed opacity-40",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-bg-elevated">
                  <g.icon className="h-4 w-4" />
                </span>
                <span className="text-[13px] font-medium text-foreground">
                  {g.label}
                </span>
                {!g.enabled && (
                  <span className="text-[11px] text-foreground-subtle">
                    Coming soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <DashboardSection title="Recent Projects">
          {recent.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create an Instagram conversation to get started."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recent.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Favorites">
          {favorites.length === 0 ? (
            <EmptyState
              title="No favorites yet"
              description="Star a project to pin it here."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Saved Recipients">
          <EmptyState
            title="Recipients arrive in Milestone 6"
            description="Reusable identities aren't available yet."
          />
        </DashboardSection>
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-foreground-subtle">
        {title}
      </p>
      {children}
    </section>
  );
}
