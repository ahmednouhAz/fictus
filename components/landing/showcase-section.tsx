"use client";

import { motion } from "framer-motion";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { GlassPanel } from "@/components/landing/glass-panel";
import { DmFragment, PostFragment } from "@/components/landing/mock-ui-fragments";

// A tall phone-shaped fragment standing in for "a screenshot" itself —
// distinct from the flatter DM/post fragments so this last row visually
// reads as "the finished export" rather than another interface snippet.
function ScreenshotFragment() {
  return (
    <GlassPanel className="w-[190px] p-2.5">
      <div className="flex items-center justify-between px-1 pb-2 text-[9px] text-white/40">
        <span>9:41</span>
        <div className="flex gap-1">
          <span className="h-1.5 w-3 rounded-sm bg-white/40" />
          <span className="h-1.5 w-3 rounded-sm bg-white/40" />
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-black/30 p-2.5">
        <div className="flex items-center gap-1.5">
          <InstagramAvatar name="jules" size={18} />
          <span className="text-[10px] font-medium text-white/70">jules_k</span>
        </div>
        <div
          className="max-w-[85%] self-start rounded-2xl rounded-bl-md px-2.5 py-1.5 text-[10px] text-white"
          style={{ background: "linear-gradient(135deg,#B332D7 0%,#B4A1FB 100%)" }}
        >
          wait send proof
        </div>
        <div className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-[#181D21] px-2.5 py-1.5 text-[10px] text-white/90">
          screenshot incoming
        </div>
      </div>
    </GlassPanel>
  );
}

const ROWS: {
  title: string;
  Visual: React.ComponentType;
  reverse?: boolean;
}[] = [
  { title: "A conversation that never happened.", Visual: DmFragment },
  { title: "A post that never existed.", Visual: PostFragment, reverse: true },
  { title: "A screenshot that tells the story.", Visual: ScreenshotFragment },
];

export function ShowcaseSection() {
  return (
    <section id="examples" className="relative py-32">
      <div className="mx-auto flex max-w-4xl flex-col gap-28 px-6">
        {ROWS.map(({ title, Visual, reverse }, i) => (
          <div
            key={i}
            className={`flex flex-col items-center gap-10 md:flex-row md:justify-between ${
              reverse ? "md:flex-row-reverse" : ""
            }`}
          >
            <motion.h3
              initial={{ opacity: 0, x: reverse ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
              className="max-w-[280px] text-center text-lg font-light leading-[1.3] tracking-[0.03em] text-[#F5F5F5] md:text-left md:text-xl"
            >
              {title}
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0, 0, 1] }}
            >
              <Visual />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
