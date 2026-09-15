import { Webhooks } from "@polar-sh/nextjs";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";

// A local structural type instead of importing Polar SDK's own
// `Subscription` type — @polar-sh/nextjs pins its own internal copy of
// @polar-sh/sdk, separate from the one installed directly here, so the
// two `Subscription` types are nominally different even though every
// payload satisfies this shape. Only the fields actually used are named.
interface PolarSubscriptionLike {
  id: string;
  customerId: string;
  status: string;
  productId: string;
  currentPeriodEnd: Date;
  customer: { externalId?: string | null };
}

// One shared handler for every subscription event — Polar's `status`
// field is authoritative on each payload, so there's no need to special-
// case behavior per event name (unlike Paddle, where "canceled" needed
// its own branch). customerExternalId at checkout time becomes
// `data.customer.externalId` here, which is how this gets tied back to a
// Clerk user without a separate mapping table.
async function upsertFromSubscription(subscription: PolarSubscriptionLike) {
  const clerkUserId = subscription.customer.externalId;
  if (!clerkUserId) return;

  const values = {
    clerkUserId,
    polarCustomerId: subscription.customerId,
    polarSubscriptionId: subscription.id,
    status: subscription.status,
    productId: subscription.productId,
    currentPeriodEnd: subscription.currentPeriodEnd,
    updatedAt: new Date(),
  };

  await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({ target: subscriptions.clerkUserId, set: values });
}

// Reads process.env.POLAR_WEBHOOK_SECRET directly (falling back to an
// empty string) rather than through lib/env.ts's throwing validator —
// Webhooks() runs at module scope to build the exported POST handler, so
// a missing secret should make every signature check fail (clean 4xx),
// not crash the route on import.
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onSubscriptionCreated: (payload) => upsertFromSubscription(payload.data),
  onSubscriptionUpdated: (payload) => upsertFromSubscription(payload.data),
  onSubscriptionActive: (payload) => upsertFromSubscription(payload.data),
  onSubscriptionCanceled: (payload) => upsertFromSubscription(payload.data),
  onSubscriptionRevoked: (payload) => upsertFromSubscription(payload.data),
});
