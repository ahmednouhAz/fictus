"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";

// Minimum time the branded curtain stays up before revealing the app,
// so the transition reads as an intentional beat rather than a flash.
const MIN_VISIBLE_MS = 900;

export function EnterAppLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setIsEnteringApp = useUIStore((s) => s.setIsEnteringApp);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEnteringApp(true);
    router.push(href);
    window.setTimeout(() => setIsEnteringApp(false), MIN_VISIBLE_MS);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
