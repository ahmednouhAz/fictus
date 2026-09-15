// Restyles Clerk's prebuilt components (sign-in/sign-up modal, UserButton
// popover) to match this app's own glass-popup material — same blurred
// backdrop, border, and card treatment as CommandPalette's [cmdk-*]
// styles and the shared Popover/DropdownMenu/Panel components, plus the
// same Button/Input classes used everywhere else. Applied once, globally,
// via ClerkProvider — every Clerk component inherits it.
export const clerkAppearance = {
  // Clerk's own default styles can otherwise beat Tailwind utility classes
  // passed through `elements` depending on stylesheet load order — this is
  // Clerk's documented fix, scoping their defaults into a named layer so
  // unlayered Tailwind utilities win.
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#5b8cff",
    colorBackground: "#0e1015",
    colorText: "#f2f3f5",
    colorTextSecondary: "#9a9ea8",
    colorInputBackground: "rgba(0, 0, 0, 0.4)",
    colorInputText: "#f2f3f5",
    colorNeutral: "#f2f3f5",
    colorDanger: "#ef6f6f",
    borderRadius: "10px",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    // Inline style objects instead of class strings for these two — the
    // blur is the whole point, so it can't be left to chance against
    // Clerk's own stylesheet; an inline style always wins regardless of
    // cascade/layer order.
    modalBackdrop: {
      backgroundColor: "rgba(5, 6, 9, 0.6)",
      backdropFilter: "blur(2px)",
      WebkitBackdropFilter: "blur(2px)",
    },
    card: {
      borderRadius: "14px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxShadow: "0 8px 24px -8px rgba(0, 0, 0, 0.5)",
    },
    headerTitle: "text-foreground",
    headerSubtitle: "text-foreground-muted",
    socialButtonsBlockButton:
      "rounded-md border border-border bg-surface text-foreground hover:glass-surface hover:border-border-strong transition-colors duration-150",
    socialButtonsBlockButtonText: "text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-foreground-subtle",
    formFieldLabel: "text-foreground-muted",
    formFieldInput:
      "rounded-md border border-white/10 bg-black/40 text-foreground placeholder:text-foreground-subtle backdrop-blur-md transition-colors duration-150 hover:border-white/20 focus:border-accent/60 focus:ring-2 focus:ring-accent/30",
    formButtonPrimary:
      "rounded-md bg-accent text-accent-foreground hover:bg-accent-hover transition-colors duration-150 shadow-none",
    footer: "bg-transparent",
    footerActionLink: "text-accent hover:text-accent-hover",
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-accent hover:text-accent-hover",
    otpCodeFieldInput:
      "border border-white/10 bg-black/40 text-foreground backdrop-blur-md focus:border-accent/60",
    userButtonPopoverCard: {
      borderRadius: "10px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    },
    userButtonPopoverActionButton: "text-foreground-muted hover:glass-surface hover:text-foreground",
    userButtonPopoverActionButtonText: "text-foreground-muted",
    userButtonPopoverFooter: "hidden",
  },
};
