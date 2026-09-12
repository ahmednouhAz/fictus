"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/landing/glass-panel";

const CONTACT_EMAIL = "hello@fictus.app";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Message from ${name || "the fictus. site"}`,
  )}&body=${encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ""}`)}`;

  return (
    <div className="relative min-h-screen bg-[#080808] px-6 py-24 text-[#F5F5F5]">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="mb-10 flex items-center gap-1.5 text-[12px] tracking-[0.02em] text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <h1 className="text-2xl font-light tracking-[0.03em] text-[#F5F5F5] sm:text-3xl">
          Get in touch.
        </h1>
        <p className="mt-3 text-[13px] tracking-[0.01em] text-white/50">
          Questions, feedback, or something broke — send it over.
        </p>

        <GlassPanel className="mt-10 flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[0.06em] text-white/35 uppercase">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
              placeholder="Your name"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[0.06em] text-white/35 uppercase">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[0.06em] text-white/35 uppercase">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
              placeholder="What's up?"
            />
          </label>

          <a
            href={mailtoHref}
            aria-disabled={!message}
            className={`mt-2 flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-normal tracking-[0.02em] transition-colors ${
              message
                ? "bg-white text-black hover:bg-white/90"
                : "pointer-events-none bg-white/10 text-white/30"
            }`}
          >
            Send message
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <p className="text-center text-[11px] text-white/25">
            Opens your email app, addressed to {CONTACT_EMAIL}.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
