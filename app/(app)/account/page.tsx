"use client";

import { AlertTriangle, CreditCard } from "lucide-react";
import { useExportQuota } from "@/components/paywall/export-quota-provider";
import { PolarCheckoutLink } from "@/components/landing/polar-checkout-link";
import { Button } from "@/components/ui/button";

const POLAR_PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;

export default function AccountPage() {
  const { quota, loading } = useExportQuota();
  const isPastDue = quota.status === "past_due";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-12">
        <header className="mb-10">
          <p className="text-[13px] text-foreground-subtle">Account</p>
          <h1 className="mt-1 text-xl font-medium text-foreground">Plan & billing</h1>
        </header>

        {isPastDue && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-foreground">Payment failed</p>
              <p className="mt-0.5 text-[13px] text-foreground-muted">
                Your last payment didn&apos;t go through. Update your payment method to keep your
                Pro access.
              </p>
              <Button asChild variant="destructive" size="sm" className="mt-3">
                <a href="/portal">Update payment method</a>
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-surface/60 p-5">
          {loading ? (
            <p className="text-[13px] text-foreground-subtle">Loading…</p>
          ) : quota.plan === "pro" ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                    Pro
                  </span>
                  <span className="text-[13px] text-foreground-muted">$9/mo</span>
                </div>
                {quota.currentPeriodEnd && (
                  <p className="mt-1.5 text-[13px] text-foreground-subtle">
                    Renews {quota.currentPeriodEnd.toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <Button asChild variant="secondary">
                <a href="/portal">
                  <CreditCard className="h-4 w-4" />
                  Manage subscription
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[11px] font-medium text-foreground-muted">
                  Free
                </span>
                <p className="mt-1.5 text-[13px] text-foreground-subtle">
                  {quota.remaining} export{quota.remaining === 1 ? "" : "s"} left
                </p>
              </div>
              {POLAR_PRO_PRODUCT_ID && (
                <PolarCheckoutLink
                  productId={POLAR_PRO_PRODUCT_ID}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                >
                  Upgrade to Pro
                </PolarCheckoutLink>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
