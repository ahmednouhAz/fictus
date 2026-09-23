import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Refund Policy — fictus",
};

const CONTACT_EMAIL = "hello@fictus.app";

export default function RefundsPage() {
  return (
    <LegalPageShell title="Refund Policy" effectiveDate="September 23, 2026">
      <section>
        <h2>Free plan</h2>
        <p>
          The free plan never charges you, so there&apos;s nothing to refund on it.
        </p>
      </section>

      <section>
        <h2>Pro subscription</h2>
        <p>
          Pro subscriptions are billed on a recurring basis and are <strong>non-refundable</strong>.
          You can cancel anytime from your account&apos;s billing portal — cancelling stops future
          billing, and you keep Pro access through the end of the period you&apos;ve already paid
          for. We don&apos;t issue partial or prorated refunds for unused time in a billing period.
        </p>
      </section>

      <section>
        <h2>Exceptions</h2>
        <p>
          If you were charged in error — a duplicate charge, or a charge after you&apos;d already
          cancelled — email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and
          we&apos;ll fix it.
        </p>
      </section>

      <section>
        <h2>How to cancel</h2>
        <p>
          Go to your <a href="/account">account page</a> and open &quot;Manage subscription&quot;
          to cancel through Polar&apos;s billing portal.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          Reach us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for anything billing
          related.
        </p>
      </section>
    </LegalPageShell>
  );
}
