"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useUIStore } from "@/stores/useUIStore";

// The branded curtain shown while transitioning from the marketing site
// into the app shell — see EnterAppLink for what drives isEnteringApp.
export function EnterAppOverlay() {
  const isEnteringApp = useUIStore((s) => s.isEnteringApp);
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isEnteringApp && (
        <motion.div
          // No fade-in: this has to be fully opaque on the very first paint,
          // or the destination route is briefly visible underneath while it
          // fades up (the "flash" bug). Only the exit (revealing the app)
          // animates.
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#080808]"
        >
          <motion.img
            src="/icons/fictus-mark.svg"
            alt=""
            className="h-8 w-auto"
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: [0.35, 1, 0.35], scale: [0.96, 1, 0.96] }
            }
            transition={{
              duration: 1.8,
              ease: [0.4, 0, 0.6, 1],
              repeat: shouldReduceMotion ? 0 : Infinity,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
