import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export type UserPlan = {
  plan: "free" | "pro";
  status: string | null;
  currentPeriodEnd: Date | null;
};

// Callers get a Clerk user id via auth()/currentUser() and pass it here —
// no row (or a non-active status, e.g. canceled/past_due) both read as
// "free". This is the hook future feature-gating (e.g. the "clean export"
// promise on the pricing page) will call once that feature exists.
export async function getUserSubscription(clerkUserId: string): Promise<UserPlan> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.clerkUserId, clerkUserId))
    .limit(1);

  if (!row) {
    return { plan: "free", status: null, currentPeriodEnd: null };
  }

  return {
    plan: ACTIVE_STATUSES.has(row.status) ? "pro" : "free",
    status: row.status,
    currentPeriodEnd: row.currentPeriodEnd,
  };
}
