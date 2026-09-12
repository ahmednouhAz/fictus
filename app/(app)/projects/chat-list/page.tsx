"use client";

import { ProjectListPage } from "@/components/projects/project-list-page";

export default function ChatListProjectsPage() {
  return (
    <ProjectListPage
      kind="chatList"
      breadcrumb="Workspace"
      title="Chat List"
      newProjectLabel="New chat list"
      emptyTitle="No chat lists yet"
      emptyDescription="Create your first Instagram inbox screen."
    />
  );
}
