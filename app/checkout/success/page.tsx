import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Landed on after a successful Polar checkout (see app/checkout/route.ts's
// successUrl). No need to re-verify the checkout here — the webhook
// (app/api/polar/webhook/route.ts) is already the source of truth and
// will have written the subscriptions row by the time someone reads this.
export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h1 className="text-[18px] font-semibold text-foreground">You&apos;re on Pro</h1>
      <p className="max-w-sm text-[13px] text-foreground-muted">
        Unlimited exports and full access to Reels, Stories, and Voice messages are unlocked.
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/dashboard">Continue to Dashboard</Link>
      </Button>
    </div>
  );
}
