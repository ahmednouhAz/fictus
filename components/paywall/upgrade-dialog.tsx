"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Lock } from "lucide-react";
import { PolarCheckoutLink } from "@/components/landing/polar-checkout-link";

const POLAR_PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;

// One shared dialog for every paywall trigger (exports exhausted, a
// locked Reel/Story/Voice/play-button) — only the copy differs, same
// visual treatment every time. Matches the app's existing dark-glass
// popup language (see [cmdk-overlay]/[cmdk-root] in app/globals.css,
// the command palette's own modal).
export function UpgradeDialog({
  open,
  onOpenChange,
  title = "Upgrade to Pro",
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Lock className="h-4 w-4" />
          </div>
          <Dialog.Title className="mt-4 text-[15px] font-semibold text-foreground">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-[13px] leading-relaxed text-foreground-muted">
            {description}
          </Dialog.Description>
          <div className="mt-5 flex items-center gap-2">
            {POLAR_PRO_PRODUCT_ID ? (
              <PolarCheckoutLink
                productId={POLAR_PRO_PRODUCT_ID}
                className="flex flex-1 items-center justify-center rounded-md bg-accent py-2 text-[13px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                Upgrade to Pro
              </PolarCheckoutLink>
            ) : (
              <span className="flex-1 rounded-md border border-border py-2 text-center text-[13px] text-foreground-subtle">
                Upgrades aren&apos;t set up yet
              </span>
            )}
            <Dialog.Close className="rounded-md border border-border px-3 py-2 text-[13px] text-foreground-muted transition-colors hover:bg-surface-hover">
              Not now
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
