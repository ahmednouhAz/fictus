import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@clerk/nextjs/server";
import { absoluteUrl } from "@/lib/site-url";

// Requires the POLAR_ACCESS_TOKEN to have customer_sessions:write scope
// in addition to the checkouts scope /checkout already needs — Polar's
// customer portal is a separate API call from checkout creation.
export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  returnUrl: absoluteUrl("/account"),
  server: process.env.POLAR_ENV === "production" ? "production" : "sandbox",
  getExternalCustomerId: async () => {
    const { userId } = await auth();
    return userId ?? "";
  },
});
