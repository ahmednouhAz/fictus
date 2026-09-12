"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { LayoutGrid, FolderClosed, Plus, PanelLeftClose } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useProjectStore } from "@/stores/useProjectStore";

export function CommandPalette() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggleCommandPalette]);

  function run(fn: () => void) {
    fn();
    setOpen(false);
  }

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette">
      <Command.Input placeholder="Type a command or search…" />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Actions">
          <Command.Item
            onSelect={() =>
              run(() => {
                const project = createProject("instagram");
                router.push(`/projects/${project.id}`);
              })
            }
          >
            <Plus className="h-3.5 w-3.5" /> New Instagram project
          </Command.Item>
          <Command.Item onSelect={() => run(() => router.push("/dashboard"))}>
            <LayoutGrid className="h-3.5 w-3.5" /> Go to Dashboard
          </Command.Item>
          <Command.Item onSelect={() => run(() => router.push("/projects"))}>
            <FolderClosed className="h-3.5 w-3.5" /> Go to Projects
          </Command.Item>
          <Command.Item onSelect={() => run(toggleSidebar)}>
            <PanelLeftClose className="h-3.5 w-3.5" /> Toggle sidebar
          </Command.Item>
        </Command.Group>

        {projects.length > 0 && (
          <Command.Group heading="Projects">
            {projects.map((project) => (
              <Command.Item
                key={project.id}
                value={project.name}
                onSelect={() => run(() => router.push(`/projects/${project.id}`))}
              >
                {project.name}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Coming soon">
          <Command.Item disabled>Export</Command.Item>
          <Command.Item disabled>Switch device</Command.Item>
          <Command.Item disabled>Settings</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
