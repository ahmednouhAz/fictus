"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { GlassPanel } from "@/components/landing/glass-panel";
import { EnterAppLink } from "@/components/shell/enter-app-link";

export function LandingNavbar() {
  return (
    <div className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <GlassPanel
        as="nav"
        noGradient
        className="flex h-14 w-full max-w-[880px] items-center justify-between rounded-full px-3 sm:px-5"
      >
        <Link href="/" className="px-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG wordmark, no optimization needed */}
          <img src="/icons/fictus.svg" alt="fictus" className="h-4 w-auto" />
        </Link>

        <div className="flex items-center gap-1">
          <a
            href="#pricing"
            className="hidden rounded-full px-3.5 py-1.5 text-[12px] tracking-[0.02em] text-white/60 transition-colors hover:text-white sm:block"
          >
            Pricing
          </a>
          <a
            href="#examples"
            className="hidden rounded-full px-3.5 py-1.5 text-[12px] tracking-[0.02em] text-white/60 transition-colors hover:text-white sm:block"
          >
            Examples
          </a>
          <a
            href="#faq"
            className="hidden rounded-full px-3.5 py-1.5 text-[12px] tracking-[0.02em] text-white/60 transition-colors hover:text-white sm:block"
          >
            FAQ
          </a>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="hidden rounded-full px-3.5 py-1.5 text-[12px] tracking-[0.02em] text-white/60 transition-colors hover:text-white sm:block"
              >
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <EnterAppLink
            href="/dashboard"
            className="group ml-2 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-normal tracking-[0.02em] text-black transition-colors hover:bg-white/90"
          >
            Create
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </EnterAppLink>
        </div>
      </GlassPanel>
    </div>
  );
}
