"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";
import { GlassPanel } from "@/components/landing/glass-panel";
import { EnterAppLink } from "@/components/shell/enter-app-link";
import { PolarCheckoutLink } from "@/components/landing/polar-checkout-link";

const POLAR_PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;

const PLANS: {
  name: string;
  price: string;
  period?: string;
  points: string[];
  featured?: boolean;
  polarProductId?: string;
}[] = [
  {
    name: "Free",
    price: "$0",
    points: ["Full editor", "Watermarked export"],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    points: ["Full editor", "Clean export", "Unlimited saves"],
    featured: true,
    polarProductId: POLAR_PRO_PRODUCT_ID,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="text-center text-2xl font-light tracking-[0.03em] text-[#F5F5F5] sm:text-3xl"
        >
          Simple pricing.
        </motion.h2>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
            >
              <GlassPanel
                className={`flex h-full flex-col p-7 ${
                  plan.featured ? "border-white/25 bg-white/[0.08]" : ""
                }`}
              >
                <span className="text-[12px] tracking-[0.03em] text-white/50">{plan.name}</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-light tracking-tight text-white">
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-[13px] text-white/40">{plan.period}</span>}
                </div>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-[13px] tracking-[0.01em] text-white/65">
                      <Check className="h-3.5 w-3.5 shrink-0 text-white/40" />
                      {point}
                    </li>
                  ))}
                </ul>
                {plan.polarProductId ? (
                  <>
                    <Show when="signed-out">
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          className="mt-8 flex items-center justify-center rounded-full bg-white py-2.5 text-[12px] font-normal tracking-[0.03em] text-black transition-colors hover:bg-white/90"
                        >
                          Get started
                        </button>
                      </SignInButton>
                    </Show>
                    <Show when="signed-in">
                      <PolarCheckoutLink
                        productId={plan.polarProductId}
                        className="mt-8 flex items-center justify-center rounded-full bg-white py-2.5 text-[12px] font-normal tracking-[0.03em] text-black transition-colors hover:bg-white/90"
                      >
                        Get started
                      </PolarCheckoutLink>
                    </Show>
                  </>
                ) : (
                  <EnterAppLink
                    href="/dashboard"
                    className={`mt-8 flex items-center justify-center rounded-full py-2.5 text-[12px] font-normal tracking-[0.03em] transition-colors ${
                      plan.featured
                        ? "bg-white text-black hover:bg-white/90"
                        : "border border-white/15 text-white/80 hover:bg-white/5"
                    }`}
                  >
                    Get started
                  </EnterAppLink>
                )}
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
