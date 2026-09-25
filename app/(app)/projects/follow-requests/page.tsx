"use client";

import { ProjectListPage } from "@/components/projects/project-list-page";

export default function FollowRequestsProjectsPage() {
  return (
    <ProjectListPage
      kind="followRequests"
      breadcrumb="Workspace"
      title="Follow Requests"
      newProjectLabel="New follow requests"
      emptyTitle="No follow requests yet"
      emptyDescription="Create your first Instagram Follow Requests screen."
    />
  );
}
