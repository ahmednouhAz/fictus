import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

// Keyed by Clerk user id rather than a local users table — Clerk is the
// sole identity provider in this app, so mirroring a full users table here
// would just be unnecessary duplication for a single-plan billing feature.
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  polarCustomerId: text("polar_customer_id"),
  polarSubscriptionId: text("polar_subscription_id").unique(),
  // Stored as plain text mirroring Polar's own status strings (incomplete,
  // incomplete_expired, trialing, active, past_due, canceled, unpaid,
  // paused) rather than a Postgres enum, so a new status Polar introduces
  // never needs a migration here.
  status: text("status").notNull(),
  // Polar's catalog is product-centric — checkout keys off a product id,
  // not a price id.
  productId: text("product_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
