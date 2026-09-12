import Link from "next/link";
import { Mail, X } from "lucide-react";

// lucide-react dropped brand marks a while back — the X icon (a plain "X"
// glyph) doubles as the X/Twitter logo since that's literally the app's
// current mark. Instagram has no lucide equivalent, so it's hand-drawn
// here in the same 24x24 stroke style as the rest of the icon set.
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const PRODUCT_LINKS = [
  { label: "Examples", href: "#examples" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const COMPANY_LINKS = [
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  { label: "X (Twitter)", href: "#", icon: X },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "Email", href: "mailto:hello@fictus.app", icon: Mail },
];

export function FooterSection() {
  return (
    <footer className="relative border-t border-white/10 px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-12 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG wordmark, no optimization needed */}
          <img src="/icons/fictus.svg" alt="fictus" className="h-4 w-auto" />
          <p className="max-w-[220px] text-[12px] leading-[1.6] text-white/40">
            A creative studio for editable, believable social interface mockups.
          </p>
          <div className="mt-2 flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
              >
                <social.icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] tracking-[0.08em] text-white/35 uppercase">
              Product
            </span>
            {PRODUCT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] tracking-[0.01em] text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] tracking-[0.08em] text-white/35 uppercase">
              Company
            </span>
            {COMPANY_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] tracking-[0.01em] text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-4xl flex-col-reverse items-center gap-2 border-t border-white/5 pt-6 text-[12px] text-white/25 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} fictus.</span>
        <span>Mockups only — not affiliated with Instagram or Meta.</span>
      </div>
    </footer>
  );
}
