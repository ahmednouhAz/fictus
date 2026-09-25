"use client";

import { ProjectListPage } from "@/components/projects/project-list-page";

export default function NotificationProjectsPage() {
  return (
    <ProjectListPage
      kind="notification"
      breadcrumb="Workspace"
      title="Notification Overlay"
      newProjectLabel="New notification"
      emptyTitle="No notifications yet"
      emptyDescription="Create your first notification overlay."
    />
  );
}
