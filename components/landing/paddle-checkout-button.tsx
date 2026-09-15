"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { getPaddleInstance } from "@/lib/paddle-client";

export function PaddleCheckoutButton({
  priceId,
  className,
  children,
}: {
  priceId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { user } = useUser();

  const handleClick = async () => {
    if (!user) return;
    const paddle = await getPaddleInstance();
    // customData is echoed back on every Paddle webhook event for this
    // subscription — this is what lets the webhook associate it with a
    // Clerk user without a separate Paddle-customer mapping table.
    paddle?.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { clerkUserId: user.id },
      settings: { displayMode: "overlay" },
    });
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
