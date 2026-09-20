import { Checkout } from "@polar-sh/nextjs";

// Checkout() requires successUrl to be a full absolute URL, not a relative
// path — confirmed by testing locally (a bare "/dashboard" throws
// ERR_INVALID_URL inside the SDK). VERCEL_URL/VERCEL_PROJECT_PRODUCTION_URL
// are auto-populated by Vercel at build/runtime, so this needs no manual
// env var setup and still works correctly on localhost.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const successUrl = vercelUrl ? `https://${vercelUrl}/dashboard` : "http://localhost:3000/dashboard";

// Reads process.env directly rather than through lib/env.ts's validator —
// Checkout() runs at module scope to build the exported GET handler, so a
// throwing validator here would crash every request to this route (even
// with a healthy config) the moment the module loads. Missing/bad values
// surface as a Polar API error when a checkout is actually attempted
// instead. Defaults to "sandbox" unless POLAR_ENV is explicitly set to
// "production" — a misconfigured env should fail safe, not accidentally
// hit the live API.
export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl,
  server: process.env.POLAR_ENV === "production" ? "production" : "sandbox",
});
