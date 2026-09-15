import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

// Keyed by Clerk user id rather than a local users table — Clerk is the
// sole identity provider in this app, so mirroring a full users table here
// would just be unnecessary duplication for a single-plan billing feature.
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  paddleCustomerId: text("paddle_customer_id"),
  paddleSubscriptionId: text("paddle_subscription_id").unique(),
  // Stored as plain text mirroring Paddle's own status strings (active,
  // trialing, past_due, canceled, paused) rather than a Postgres enum, so
  // a new status Paddle introduces never needs a migration here.
  status: text("status").notNull(),
  priceId: text("price_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
