import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Shared chrome for the three legal pages (Terms/Privacy/Refunds) —
// mirrors app/contact/page.tsx's dark, prose-first styling so these read
// as part of the same site rather than a bolted-on legal template.
export function LegalPageShell({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#080808] px-6 py-24 text-[#F5F5F5]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-10 flex items-center gap-1.5 text-[12px] tracking-[0.02em] text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <h1 className="text-2xl font-light tracking-[0.03em] text-[#F5F5F5] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-[12px] tracking-[0.01em] text-white/35">
          Effective {effectiveDate}
        </p>

        <div className="mt-10 flex flex-col gap-8 text-[13px] leading-[1.7] text-white/60 [&_h2]:text-[15px] [&_h2]:font-medium [&_h2]:tracking-[0.01em] [&_h2]:text-white/90 [&_a]:text-white/80 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_strong]:text-white/80 [&_strong]:font-medium">
          {children}
        </div>
      </div>
    </div>
  );
}
