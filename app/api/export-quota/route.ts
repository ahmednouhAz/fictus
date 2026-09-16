import { auth } from "@clerk/nextjs/server";
import { getExportQuota, consumeExport } from "@/lib/export-quota";

// Peek — no side effect. Used to display "N exports left" and to compute
// the locked state for Reels/Stories/Voice/the play-button toggle.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const quota = await getExportQuota(userId);
  return Response.json(quota);
}

// Consume — called at the moment an export is actually attempted.
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const quota = await consumeExport(userId);
  return Response.json(quota);
}
