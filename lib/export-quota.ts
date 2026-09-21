import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { exportUsage } from "@/lib/db/schema";
import { getUserSubscription } from "@/lib/subscription";

export const FREE_EXPORT_LIMIT = 3;

export type ExportQuota = {
  plan: "free" | "pro";
  exportsUsed: number;
  remaining: number | null; // null = unlimited (pro)
  // Free tier limit exceeded — gates Reels/Stories/Voice/the chat-list
  // play-button toggle (those stay hard-locked), and is also what the
  // export flow reads to decide whether to watermark the image (exports
  // themselves are never blocked, just degraded past this point).
  locked: boolean;
  // Raw Polar subscription status (e.g. "past_due") and renewal date —
  // "pro" already covers past_due (see lib/subscription.ts), so the UI
  // needs the raw status to show a payment-failed warning on top of that,
  // and the renewal date for the account page's "Manage subscription" view.
  status: string | null;
  currentPeriodEnd: Date | null;
};

// Shared label for the three places (workspace-view, chat-list-workspace-
// view, the account page) that show the free-tier export count — kept in
// one spot so the wording for "still within the free clean-export count"
// vs. "past it, now watermarked" stays consistent everywhere.
export function formatExportsLeftLabel(quota: ExportQuota): string {
  if (quota.remaining && quota.remaining > 0) {
    return `${quota.remaining} clean export${quota.remaining === 1 ? "" : "s"} left`;
  }
  return "Exports are watermarked — upgrade to remove";
}

// Read-only — used to display "N exports left" and to decide whether
// Reels/Stories/Voice/the play-button toggle are locked. Never writes.
export async function getExportQuota(clerkUserId: string): Promise<ExportQuota> {
  const { plan, status, currentPeriodEnd } = await getUserSubscription(clerkUserId);
  if (plan === "pro") {
    return { plan: "pro", exportsUsed: 0, remaining: null, locked: false, status, currentPeriodEnd };
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
    status,
    currentPeriodEnd,
  };
}

// Called at the moment an export is actually attempted. Pro always
// succeeds without touching the table. Free plan increments atomically
// via the same upsert pattern, unconditionally — exports are never
// blocked (past the free limit they're watermarked instead, decided by
// the caller from `locked` before calling this), so there's nothing left
// to guard against, just a plain atomic +1.
export async function consumeExport(clerkUserId: string): Promise<ExportQuota> {
  const { plan, status, currentPeriodEnd } = await getUserSubscription(clerkUserId);
  if (plan === "pro") {
    return { plan: "pro", exportsUsed: 0, remaining: null, locked: false, status, currentPeriodEnd };
  }

  const [row] = await db
    .insert(exportUsage)
    .values({ clerkUserId, exportsUsed: 1 })
    .onConflictDoUpdate({
      target: exportUsage.clerkUserId,
      set: { exportsUsed: sql`${exportUsage.exportsUsed} + 1`, updatedAt: new Date() },
    })
    .returning();

  const exportsUsed = row.exportsUsed;
  return {
    plan: "free",
    exportsUsed,
    remaining: Math.max(0, FREE_EXPORT_LIMIT - exportsUsed),
    locked: exportsUsed >= FREE_EXPORT_LIMIT,
    status,
    currentPeriodEnd,
  };
}
