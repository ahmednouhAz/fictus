"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/landing/glass-panel";
import { EnterAppLink } from "@/components/shell/enter-app-link";

const CYCLE_WORDS = ["conversation.", "post.", "story.", "DM list.", "notification."];

type Stage =
  | { type: "static"; text: string }
  | { type: "cycle"; prefix: string; words: string[]; suffix: string };

const STAGES: Stage[] = [
  { type: "static", text: "Got a story to fake?" },
  { type: "cycle", prefix: "Make the ", words: CYCLE_WORDS, suffix: "" },
  { type: "static", text: "Make the screenshot." },
];

// Widest word in the cycle — used to reserve a stable slot (see the
// invisible ghost span below) so "Make the " never has to shift.
const LONGEST_CYCLE_WORD = CYCLE_WORDS.reduce((a, b) => (b.length > a.length ? b : a));

// Total stops the scroll story steps through: the stage lines, then one
// extra stop where the CTA takes over the same spot.
const STOP_COUNT = STAGES.length + 1;

// Auto-cycles through `words` on its own timer (not scroll-driven), each
// swap sliding the old word up and out while the next one slides up into
// place from below — a controlled, moderately-paced vertical roll.
function CyclingWord({ words }: { words: string[] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 1250);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    // No `overflow-hidden` here on purpose: browsers align an
    // `overflow: hidden` inline-block by its bottom margin edge instead of
    // its text baseline, which is exactly what was pushing the word above
    // "Make the "/"." — clipping the vertical slide instead happens one
    // level up, on the absolutely-positioned wrapper, which doesn't
    // participate in the line's baseline at all. `mode="wait"` means only
    // one word is ever in the DOM at a time, so this box just shrink-wraps
    // to whichever word is current.
    <span className="relative inline-block align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="inline-block whitespace-nowrap"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Two ghost copies of the line, offset and colored, that snap in on a
// slight displacement and settle almost immediately — a controlled,
// premium version of an RGB-split glitch rather than an aggressive one.
function GlitchGhosts({ text }: { text: string }) {
  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 text-[#5b8cff] mix-blend-screen"
        initial={{ x: -8, opacity: 0.7, clipPath: "inset(8% 0 62% 0)" }}
        animate={{ x: 0, opacity: 0, clipPath: "inset(0% 0 0% 0)" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {text}
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 text-[#ff4d6d] mix-blend-screen"
        initial={{ x: 8, opacity: 0.7, clipPath: "inset(55% 0 6% 0)" }}
        animate={{ x: 0, opacity: 0, clipPath: "inset(0% 0 0% 0)" }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.03 }}
      >
        {text}
      </motion.span>
    </>
  );
}

export function HeroSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [stop, setStop] = React.useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(STOP_COUNT - 1, Math.floor(v * STOP_COUNT));
    setStop((prev) => (prev === next ? prev : next));
  });

  // The CTA doesn't replace the last line — it appears underneath it, so
  // the line index clamps at the final line instead of disappearing once
  // the extra "CTA" stop is reached.
  const lineIndex = Math.min(stop, STAGES.length - 1);
  const showCta = stop === STAGES.length;
  const stage = STAGES[lineIndex];

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${STOP_COUNT * 55}vh` }}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#080808]">
        {/* Ambient cinematic backdrop — public/background/banner bg.mp4
            plays behind everything; if it fails to load, the slow CSS
            drift underneath carries the same dark/abstract mood on its
            own instead of leaving a blank background. */}
        <div className="absolute inset-0">
          <div
            className="absolute -inset-[10%] opacity-70"
            style={{
              background:
                "radial-gradient(closest-side, rgba(91,140,255,0.16), transparent 60%), radial-gradient(closest-side, rgba(179,50,215,0.14), transparent 55%)",
              backgroundPosition: "20% 30%, 80% 70%",
              backgroundRepeat: "no-repeat",
              animation: "landing-drift 22s ease-in-out infinite",
            }}
          />
          {!videoFailed && (
            <video
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoFailed(true)}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            >
              <source src="/background/banner%20bg.mp4" type="video/mp4" />
            </video>
          )}
          <div className="landing-grain absolute inset-0 opacity-[0.05] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808]" />
        </div>

        <div className="relative flex h-full w-full items-center justify-center px-6">
          {/* The CTA is absolutely positioned below this wrapper rather
              than a flex sibling of it — that way it can appear without
              the wrapper's own size (and therefore the centered text's
              position) changing at all. */}
          <div className="relative flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`line-${lineIndex}`}
                initial={{ opacity: 0, filter: "blur(8px)", y: 4 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(10px)", y: -4 }}
                transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
                className="relative text-center"
              >
                <span className="relative inline-block text-2xl font-light tracking-[0.14em] text-[#F5F5F5] sm:text-3xl md:text-4xl">
                  {stage.type === "static" ? (
                    <>
                      <GlitchGhosts text={stage.text} />
                      {stage.text}
                    </>
                  ) : (
                    <>
                      <GlitchGhosts text={`${stage.prefix}${LONGEST_CYCLE_WORD}${stage.suffix}`} />
                      {/* An invisible, normal-flow ghost (sized to the
                          longest possible word) reserves the box's width
                          *and* gives it a normal text baseline — the real,
                          visible phrase is absolutely positioned directly
                          on top of it, so it lands on that exact same
                          baseline instead of a grid row's own (different)
                          one. "Make the " always starts at the same spot;
                          only the space to its right (the word, then ".")
                          grows or shrinks as shorter/longer words swap in. */}
                      <span className="relative inline-block text-left align-baseline">
                        <span aria-hidden className="invisible whitespace-nowrap">
                          {stage.prefix}
                          {LONGEST_CYCLE_WORD}
                          {stage.suffix}
                        </span>
                        <span className="absolute inset-0 overflow-hidden whitespace-nowrap">
                          {stage.prefix}
                          <CyclingWord words={stage.words} />
                          {stage.suffix}
                        </span>
                      </span>
                    </>
                  )}
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {showCta && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
                  className="absolute left-1/2 top-full mt-5 -translate-x-1/2"
                >
                  <EnterAppLink href="/dashboard">
                    <GlassPanel className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-transform hover:scale-[1.03]">
                      <span className="text-[10px] font-normal tracking-[0.05em] text-white/85">
                        Create for free
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 text-white/85" />
                    </GlassPanel>
                  </EnterAppLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
