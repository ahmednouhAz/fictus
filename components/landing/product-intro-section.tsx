"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/landing/glass-panel";

// Illustrative quotes covering the range of what people actually make with
// the editor — not attributed to real, verifiable people. Kept in the same
// generic "first name + role" register as the rest of the page's copy.
type Review = { quote: string; name: string; role: string };

const ROW_ONE: Review[] = [
  {
    quote:
      "I storyboard entire scenes as DMs before a single line of dialogue is shot. Directors get it instantly.",
    name: "Priya",
    role: "screenwriter",
  },
  {
    quote:
      "Sent my group chat a screenshot of my ex apologizing. Held up for four days before someone noticed the timestamp.",
    name: "Dani",
    role: "chaos enjoyer",
  },
  {
    quote:
      "We use it for every UX case study now. Client conversations, support flows, all the little blurred-out chats — this replaced actual screenshots entirely.",
    name: "Owen",
    role: "UX lead",
  },
  {
    quote:
      "Built a fake convo where my roommate 'confesses' to eating my leftovers. Framed the export. It's on the fridge.",
    name: "Leah",
    role: "professional menace",
  },
];

const ROW_TWO: Review[] = [
  {
    quote:
      "Mocked up a whole onboarding flow as a fake conversation for the investor deck. Nobody asked if it was real — they asked when we ship.",
    name: "Marcus",
    role: "product designer",
  },
  {
    quote:
      "Used it to prototype notification copy for our app before engineering touched anything. Saved us a full sprint of back-and-forth.",
    name: "Sofia",
    role: "founder",
  },
  {
    quote:
      "Faked a text from my landlord saying rent's cancelled this month. Kept it up for a full ten minutes in the house group chat.",
    name: "Theo",
    role: "menace, off duty",
  },
  {
    quote:
      "Every course module now opens with a realistic DM scenario instead of a slide of bullet points. Completion rates went up immediately.",
    name: "Amara",
    role: "course creator",
  },
];

export function ProductIntroSection() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="mx-auto max-w-xl text-center text-2xl font-light leading-[1.3] tracking-[0.03em] text-[#F5F5F5] sm:text-3xl"
        >
          Everything you need to make it believable.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0, 0, 1] }}
          className="relative mt-16 flex flex-col gap-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        >
          <ReviewRow reviews={ROW_ONE} direction="left" durationSeconds={46} />
          <ReviewRow reviews={ROW_TWO} direction="right" durationSeconds={52} />
        </motion.div>
      </div>
    </section>
  );
}

function ReviewRow({
  reviews,
  direction,
  durationSeconds,
}: {
  reviews: Review[];
  direction: "left" | "right";
  durationSeconds: number;
}) {
  // The track renders the row twice back to back, then animates exactly
  // 0 → -50% (or the reverse), so the seam between the two copies is
  // where the loop restarts — invisible to the eye. The second copy is
  // aria-hidden since it's a purely visual duplicate.
  return (
    <div className="marquee-row overflow-hidden">
      <div
        className="marquee-track flex w-max gap-4"
        style={{ animation: `marquee-${direction} ${durationSeconds}s linear infinite` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-4">
            {reviews.map((review, i) => (
              <GlassPanel
                key={`${review.name}-${i}`}
                className="flex w-[320px] shrink-0 flex-col justify-between gap-6 p-6"
              >
                <p className="text-[13px] leading-[1.6] tracking-[0.01em] text-white/75">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2 text-[12px] tracking-[0.02em] text-white/40">
                  <span className="text-white/70">{review.name}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>{review.role}</span>
                </div>
              </GlassPanel>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
