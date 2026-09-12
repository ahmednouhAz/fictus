"use client";

import { ProjectListPage } from "@/components/projects/project-list-page";

export default function ProjectsPage() {
  return (
    <ProjectListPage
      kind="conversation"
      breadcrumb="Workspace"
      title="Projects"
      newProjectLabel="New project"
      emptyTitle="No projects yet"
      emptyDescription="Create your first Instagram conversation."
    />
  );
}
