"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FragmentsSection } from "@/components/landing/fragments-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { ProductIntroSection } from "@/components/landing/product-intro-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FooterSection } from "@/components/landing/footer-section";

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#080808] text-[#F5F5F5]">
      <LandingNavbar />
      <HeroSection />
      <FragmentsSection />
      <ShowcaseSection />
      <ProductIntroSection />
      <PricingSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
