import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";

// Raw wire-format shape (snake_case, as Polar actually sends it) — we
// verify with standardwebhooks directly rather than @polar-sh/sdk's
// validateEvent(), so there's no Zod schema parsing/camelCase transform
// step doing this for us anymore. Only the fields actually used are named.
interface PolarWebhookEvent {
  type: string;
  data: {
    id: string;
    status: string;
    customer_id: string;
    product_id: string;
    current_period_end: string;
    customer?: { external_id?: string | null };
  };
}

const SUBSCRIPTION_EVENT_TYPES = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.revoked",
]);

// One shared handler for every subscription event — Polar's `status`
// field is authoritative on each payload, so there's no need to special-
// case behavior per event name. customerExternalId at checkout time
// becomes `data.customer.external_id` here, which is how this gets tied
// back to a Clerk user without a separate mapping table.
async function upsertFromSubscription(data: PolarWebhookEvent["data"]) {
  const clerkUserId = data.customer?.external_id;
  if (!clerkUserId) return;

  const values = {
    clerkUserId,
    polarCustomerId: data.customer_id,
    polarSubscriptionId: data.id,
    status: data.status,
    productId: data.product_id,
    currentPeriodEnd: new Date(data.current_period_end),
    updatedAt: new Date(),
  };

  await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({ target: subscriptions.clerkUserId, set: values });
}

// Verifies with `standardwebhooks` directly instead of @polar-sh/sdk's
// validateEvent() — confirmed by direct testing that validateEvent()
// mishandles the "whsec_"-prefixed secret format Polar's own dashboard
// gives you (it re-encodes the whole prefixed string as if it were plain
// text instead of stripping the prefix and base64-decoding the
// remainder), so it can never verify a real signature from Polar's
// server no matter how correct the secret value is. The underlying
// standardwebhooks library (which Polar's SDK itself depends on)
// handles the "whsec_" format correctly out of the box.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };
  const secret = (process.env.POLAR_WEBHOOK_SECRET ?? "").trim();

  let event: PolarWebhookEvent;
  try {
    event = new Webhook(secret).verify(rawBody, headers) as PolarWebhookEvent;
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const headerTimestamp = Number(headers["webhook-timestamp"]);
      console.error("Polar webhook verification failed", {
        reason: error.message,
        webhookId: headers["webhook-id"],
        ageSeconds: Number.isFinite(headerTimestamp) ? nowSeconds - headerTimestamp : null,
      });
      return Response.json({ received: false }, { status: 403 });
    }
    throw error;
  }

  if (SUBSCRIPTION_EVENT_TYPES.has(event.type)) {
    await upsertFromSubscription(event.data);
  }

  return Response.json({ received: true });
}
