export const easeStandard = [0.2, 0, 0, 1] as const;

export const transitionFast = { duration: 0.15, ease: easeStandard };
export const transitionBase = { duration: 0.22, ease: easeStandard };

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transitionBase,
};

export const fadeInUp = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: transitionBase,
};
