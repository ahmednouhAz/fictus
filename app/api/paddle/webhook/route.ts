import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { getClientEnv, getServerEnv } from "@/lib/env";
import { eq } from "drizzle-orm";

// Paddle retries on any non-2xx response, so unhandled-but-known event
// types must still return 200 — only a bad signature is a real failure.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const serverEnv = getServerEnv();
  const paddle = new Paddle(serverEnv.PADDLE_API_KEY, {
    environment: Environment[getClientEnv().NEXT_PUBLIC_PADDLE_ENV],
  });

  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, serverEnv.PADDLE_WEBHOOK_SECRET, signature);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.eventType) {
    case "subscription.created":
    case "subscription.updated": {
      const clerkUserId = event.data.customData?.clerkUserId;
      if (typeof clerkUserId !== "string") {
        // Nothing we can associate this with — not a retry-worthy failure.
        return new Response(null, { status: 200 });
      }
      await db
        .insert(subscriptions)
        .values({
          clerkUserId,
          paddleCustomerId: event.data.customerId,
          paddleSubscriptionId: event.data.id,
          status: event.data.status,
          priceId: event.data.items[0]?.price?.id ?? null,
          currentPeriodEnd: event.data.currentBillingPeriod?.endsAt
            ? new Date(event.data.currentBillingPeriod.endsAt)
            : null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: subscriptions.clerkUserId,
          set: {
            paddleCustomerId: event.data.customerId,
            paddleSubscriptionId: event.data.id,
            status: event.data.status,
            priceId: event.data.items[0]?.price?.id ?? null,
            currentPeriodEnd: event.data.currentBillingPeriod?.endsAt
              ? new Date(event.data.currentBillingPeriod.endsAt)
              : null,
            updatedAt: new Date(),
          },
        });
      return new Response(null, { status: 200 });
    }
    case "subscription.canceled": {
      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.paddleSubscriptionId, event.data.id));
      return new Response(null, { status: 200 });
    }
    default:
      return new Response(null, { status: 200 });
  }
}
