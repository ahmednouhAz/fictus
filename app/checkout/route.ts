import { Checkout } from "@polar-sh/nextjs";

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
  successUrl: "/dashboard",
  server: process.env.POLAR_ENV === "production" ? "production" : "sandbox",
});
