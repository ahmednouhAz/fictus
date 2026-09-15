"use client";

import { useUser } from "@clerk/nextjs";

// Polar checkout has no client-side SDK to initialize — it's a plain
// redirect through our own /checkout route (see app/checkout/route.ts),
// which forwards to Polar's hosted checkout page. customerExternalId is
// what lets the webhook associate the resulting subscription with this
// Clerk user, without a separate Polar-customer mapping table.
export function PolarCheckoutLink({
  productId,
  className,
  children,
}: {
  productId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { user } = useUser();

  if (!user) {
    return (
      <span className={className} aria-disabled>
        {children}
      </span>
    );
  }

  const href = `/checkout?products=${encodeURIComponent(productId)}&customerExternalId=${encodeURIComponent(user.id)}`;

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
