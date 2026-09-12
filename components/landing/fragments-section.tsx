"use client";

import { motion } from "framer-motion";
import {
  PostFragment,
  DmFragment,
  NotificationFragment,
  ProfileFragment,
  VoiceMessageFragment,
} from "@/components/landing/mock-ui-fragments";

// Floating positions for each fragment relative to the centered headline —
// deliberately irregular and overlapping rather than a tidy grid, so it
// reads as "pieces of an interface floating in space" instead of cards.
const LAYOUT: {
  Comp: React.ComponentType<{ className?: string }>;
  className: string;
  delay: number;
  duration: number;
}[] = [
  {
    Comp: PostFragment,
    className: "left-[2%] top-[6%] rotate-[-6deg] hidden lg:block",
    delay: 0,
    duration: 7,
  },
  {
    Comp: DmFragment,
    className: "right-[4%] top-[10%] rotate-[4deg] hidden md:block",
    delay: 0.6,
    duration: 8,
  },
  {
    Comp: NotificationFragment,
    className: "left-[8%] bottom-[10%] rotate-[3deg] hidden lg:block",
    delay: 1.1,
    duration: 6.5,
  },
  {
    Comp: ProfileFragment,
    className: "right-[8%] bottom-[6%] rotate-[-4deg] hidden md:block",
    delay: 0.3,
    duration: 7.5,
  },
  {
    Comp: VoiceMessageFragment,
    className: "left-[26%] bottom-[2%] rotate-[-2deg] hidden xl:block",
    delay: 1.6,
    duration: 6,
  },
];

export function FragmentsSection() {
  return (
    <section className="relative overflow-hidden py-40">
      <div className="relative mx-auto min-h-[520px] max-w-5xl px-6">
        {LAYOUT.map(({ Comp, className, delay, duration }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: delay * 0.35, ease: [0.2, 0, 0, 1] }}
            className={`absolute z-0 ${className}`}
          >
            {/* Continuous float lives on its own wrapper, separate from the
                entrance transform above — both animate `transform`, and
                sharing one element would let the CSS keyframe permanently
                override framer-motion's inline style. */}
            <div style={{ animation: `landing-float ${duration}s ease-in-out ${delay}s infinite` }}>
              <Comp />
            </div>
          </motion.div>
        ))}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="relative z-10 mx-auto max-w-2xl text-center text-2xl font-light leading-[1.3] tracking-[0.03em] text-[#F5F5F5] sm:text-3xl md:text-4xl"
        >
          You imagine it.
          <br />
          <span className="text-white/40">We make it look real.</span>
        </motion.h2>
      </div>
    </section>
  );
}
