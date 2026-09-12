import { WorkspaceView } from "@/components/projects/workspace-view";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceView projectId={id} />;
}
