// Builds an absolute URL for the current deployment from Vercel's
// auto-provided env vars (VERCEL_PROJECT_PRODUCTION_URL/VERCEL_URL) — no
// manual env var setup needed, works correctly on localhost too. Needed
// because Polar's Checkout()/CustomerPortal() adapters both require a
// full absolute URL for successUrl/returnUrl (confirmed by testing: a
// relative path throws ERR_INVALID_URL inside the SDK).
export function absoluteUrl(path: string) {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const origin = vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";
  return `${origin}${path}`;
}
