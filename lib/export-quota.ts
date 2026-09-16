import { eq, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { exportUsage } from "@/lib/db/schema";
import { getUserSubscription } from "@/lib/subscription";

export const FREE_EXPORT_LIMIT = 3;

export type ExportQuota = {
  plan: "free" | "pro";
  exportsUsed: number;
  remaining: number | null; // null = unlimited (pro)
  locked: boolean;
};

// Read-only — used to display "N exports left" and to decide whether
// Reels/Stories/Voice/the play-button toggle are locked. Never writes.
export async function getExportQuota(clerkUserId: string): Promise<ExportQuota> {
  const { plan } = await getUserSubscription(clerkUserId);
  if (plan === "pro") {
    return { plan: "pro", exportsUsed: 0, remaining: null, locked: false };
  }

  const [row] = await db
    .select()
    .from(exportUsage)
    .where(eq(exportUsage.clerkUserId, clerkUserId))
    .limit(1);

  const exportsUsed = row?.exportsUsed ?? 0;
  return {
    plan: "free",
    exportsUsed,
    remaining: Math.max(0, FREE_EXPORT_LIMIT - exportsUsed),
    locked: exportsUsed >= FREE_EXPORT_LIMIT,
  };
}

// Called at the moment an export is actually attempted. Pro always
// succeeds without touching the table. Free plan increments atomically —
// the upsert's setWhere guards against a double-click race incrementing
// past the limit: if exportsUsed is already >= FREE_EXPORT_LIMIT, the
// UPDATE branch is skipped entirely (no row returned), so `allowed` comes
// back false without ever exceeding the cap.
export async function consumeExport(
  clerkUserId: string,
): Promise<ExportQuota & { allowed: boolean }> {
  const { plan } = await getUserSubscription(clerkUserId);
  if (plan === "pro") {
    return { plan: "pro", exportsUsed: 0, remaining: null, locked: false, allowed: true };
  }

  const [row] = await db
    .insert(exportUsage)
    .values({ clerkUserId, exportsUsed: 1 })
    .onConflictDoUpdate({
      target: exportUsage.clerkUserId,
      set: { exportsUsed: sql`${exportUsage.exportsUsed} + 1`, updatedAt: new Date() },
      setWhere: lt(exportUsage.exportsUsed, FREE_EXPORT_LIMIT),
    })
    .returning();

  if (!row) {
    // setWhere blocked the update — already at the limit.
    return {
      plan: "free",
      exportsUsed: FREE_EXPORT_LIMIT,
      remaining: 0,
      locked: true,
      allowed: false,
    };
  }

  return {
    plan: "free",
    exportsUsed: row.exportsUsed,
    remaining: Math.max(0, FREE_EXPORT_LIMIT - row.exportsUsed),
    locked: row.exportsUsed >= FREE_EXPORT_LIMIT,
    allowed: true,
  };
}
