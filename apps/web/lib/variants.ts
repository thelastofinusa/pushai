import type { Variants } from "motion/react";

const parentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const workItemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      // Stagger the first 6 items on load/filter.
      // Items below the fold have a 0 delay, so they animate instantly
      // the moment they cross the viewport threshold as you scroll.
      delay: index < 6 ? index * 0.08 : 0,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.35,
      delayChildren: 0.04,
      staggerChildren: 0.06,
    },
  },
};

const menuItemVariants: Variants = {
  closed: { opacity: 0, y: 10, filter: "blur(4px)" },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export {
  itemVariants,
  menuItemVariants,
  menuVariants,
  parentVariants,
  workItemVariants,
};
