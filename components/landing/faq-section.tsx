"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { GlassPanel } from "@/components/landing/glass-panel";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Is this legal to use?",
    answer:
      "Yes — it's a creative and prototyping tool. It's built for storyboarding, design mockups, presentations, and jokes among friends, not for impersonating real people or deceiving anyone. Every export carries a visible mockup indicator.",
  },
  {
    question: "Can I remove the watermark?",
    answer:
      "Free exports include a small mockup watermark. Pro removes it for clean exports you can drop into decks, videos, or other creative work.",
  },
  {
    question: "What platforms can I create right now?",
    answer:
      "Instagram DMs today. iMessage, WhatsApp and more are on the roadmap and will use the same editor.",
  },
  {
    question: "Do you store my conversations?",
    answer:
      "Projects autosave to your account so you can come back and keep editing. You can delete any project or recipient at any time.",
  },
  {
    question: "Can I use my own photos for avatars?",
    answer:
      "Yes — upload any image as a recipient avatar, with cropping built into the editor.",
  },
  {
    question: "What can I export to?",
    answer:
      "PNG or JPG, at 1x, 2x or 3x resolution, as screen-only or with the full device frame.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-2xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="text-center text-2xl font-light tracking-[0.03em] text-[#F5F5F5] sm:text-3xl"
        >
          Questions.
        </motion.h2>

        <div className="mt-12 flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.2, 0, 0, 1] }}
              >
                <GlassPanel className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left"
                  >
                    <span className="text-[13px] font-normal tracking-[0.01em] text-white/85">
                      {faq.question}
                    </span>
                    <Plus
                      className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-[13px] leading-[1.6] tracking-[0.01em] text-white/55">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
