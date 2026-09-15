import { z } from "zod";

// Validated lazily (call site, not module scope) so importing this file —
// or anything that transitively imports it — never crashes before
// DATABASE_URL exists yet; the error only surfaces when a query actually
// runs. Polar's own env vars (POLAR_ACCESS_TOKEN/POLAR_WEBHOOK_SECRET/
// POLAR_ENV/NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID) are read directly via
// process.env at their call sites instead of through this validator —
// Checkout()/Webhooks() from @polar-sh/nextjs are called at module scope
// to produce the exported route handler, so a throwing validator there
// would crash the whole route on import, not just fail the request that
// actually needed the missing value.
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
  });
}
