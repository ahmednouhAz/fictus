import { z } from "zod";

// Validated once at import time so a missing/misnamed var fails fast with a
// readable message, instead of a cryptic crash deep inside the Paddle SDK
// or the DB client the first time it's actually used.
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PADDLE_API_KEY: z.string().min(1, "PADDLE_API_KEY is required"),
  PADDLE_WEBHOOK_SECRET: z.string().min(1, "PADDLE_WEBHOOK_SECRET is required"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: z.string().min(1, "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is required"),
  NEXT_PUBLIC_PADDLE_ENV: z.enum(["sandbox", "production"]),
  NEXT_PUBLIC_PADDLE_PRO_PRICE_ID: z.string().min(1, "NEXT_PUBLIC_PADDLE_PRO_PRICE_ID is required"),
});

// Both accessors parse lazily (call site, not module scope) so importing
// this file never crashes a render before Paddle/DB env vars exist yet —
// the error only surfaces when billing code actually runs (checkout click,
// webhook delivery), not just from loading the landing page.
export function getClientEnv() {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    NEXT_PUBLIC_PADDLE_ENV: process.env.NEXT_PUBLIC_PADDLE_ENV,
    NEXT_PUBLIC_PADDLE_PRO_PRICE_ID: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    PADDLE_API_KEY: process.env.PADDLE_API_KEY,
    PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET,
  });
}
