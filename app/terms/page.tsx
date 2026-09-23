import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service — fictus",
};

const CONTACT_EMAIL = "hello@fictus.app";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" effectiveDate="September 23, 2026">
      <section>
        <p>
          fictus (&quot;fictus,&quot; &quot;we,&quot; &quot;us&quot;) is currently operated by an
          individual, <strong>[YOUR LEGAL NAME]</strong>, as a sole proprietorship — no separate
          company has been registered yet. These Terms of Service (&quot;Terms&quot;) govern your
          use of fictus.app and the fictus application (the &quot;Service&quot;). By creating an
          account or using the Service, you agree to these Terms.
        </p>
      </section>

      <section>
        <h2>1. What fictus is</h2>
        <p>
          fictus is a creative tool for designing and exporting mockups of social-app interfaces —
          conversation screens, chat lists, and related UI — for entertainment, creative,
          educational, prototyping, and satirical purposes.
        </p>
        <p>
          fictus is an independent tool and is <strong>not affiliated with, endorsed by, or
          connected to Instagram, Meta Platforms, Inc., or any other platform</strong> whose visual
          style it may reference. All trademarks belong to their respective owners.
        </p>
      </section>

      <section>
        <h2>2. Acceptable use</h2>
        <p>You may not use fictus to create, export, publish, or share content that:</p>
        <ul>
          <li>
            Impersonates a real, identifiable person, or falsely attributes statements to them,
            without their consent
          </li>
          <li>
            Is intended to deceive, defraud, harass, bully, blackmail, or intimidate anyone
          </li>
          <li>Is used as fabricated evidence in any dispute, proceeding, or accusation</li>
          <li>Depicts a real minor in a sexual or exploitative context, in any form</li>
          <li>Infringes someone else&apos;s intellectual property or privacy rights</li>
          <li>Violates any applicable law</li>
        </ul>
        <p>
          You are solely responsible for the content you create with fictus and how you use or
          share it. We may suspend or terminate accounts we reasonably believe are being used to
          violate this section.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          Accounts are authenticated through Clerk. You&apos;re responsible for keeping your login
          credentials secure and for all activity under your account. Let us know at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you suspect unauthorized
          access.
        </p>
      </section>

      <section>
        <h2>4. Plans, billing, and cancellation</h2>
        <p>
          fictus offers a free plan and a paid Pro subscription. The free plan includes a limited
          number of clean (unwatermarked) exports per calendar month; exports beyond that limit are
          watermarked rather than blocked. Pro removes the watermark and unlocks Pro-only features,
          billed on a recurring basis at the price shown at checkout.
        </p>
        <p>
          Subscription payments are processed by <strong>Polar Software, Inc.</strong>
          (&quot;Polar&quot;), acting as our payment processor and merchant of record. Polar
          handles payment collection, applicable taxes, and invoicing. We never see or store your
          full card details.
        </p>
        <p>
          You can cancel anytime from your account&apos;s billing portal. Cancelling stops future
          billing; you keep Pro access through the end of the period you&apos;ve already paid for,
          then your account reverts to the free plan. See our{" "}
          <a href="/refunds">Refund Policy</a> for details on refunds.
        </p>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          The conversations, chat lists, profiles, and images you build in the editor are stored
          locally in your browser, not on our servers — see our{" "}
          <a href="/privacy">Privacy Policy</a> for details. You retain all rights to the content
          you create. We don&apos;t claim ownership over it, and we don&apos;t access it, since we
          never receive it.
        </p>
        <p>
          Because your projects live in your browser&apos;s local storage, clearing your browser
          data, switching browsers or devices, or using private/incognito mode can permanently
          delete them. Export anything you want to keep.
        </p>
      </section>

      <section>
        <h2>6. Our intellectual property</h2>
        <p>
          The fictus application itself — its code, design, and branding — belongs to us. These
          Terms don&apos;t grant you any rights to it beyond what&apos;s needed to use the Service
          as intended.
        </p>
      </section>

      <section>
        <h2>7. Disclaimers</h2>
        <p>
          The Service is provided &quot;as is,&quot; without warranties of any kind. We don&apos;t
          guarantee uninterrupted or error-free operation, and we&apos;re not responsible for
          content you create, export, or share using fictus.
        </p>
      </section>

      <section>
        <h2>8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, fictus and its operator won&apos;t be liable for
          any indirect, incidental, or consequential damages arising from your use of the Service.
          Our total liability for any claim relating to the Service is limited to the amount you
          paid us in the twelve months before the claim arose.
        </p>
      </section>

      <section>
        <h2>9. Termination</h2>
        <p>
          You can stop using fictus and delete your account at any time by contacting us. We may
          suspend or terminate access to the Service for anyone who violates these Terms.
        </p>
      </section>

      <section>
        <h2>10. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. If we make material changes, we&apos;ll
          update the effective date above. Continuing to use fictus after changes take effect means
          you accept the updated Terms.
        </p>
      </section>

      <section>
        <h2>11. Governing law</h2>
        <p>
          These Terms are governed by the laws of the United States, without regard to conflict-of-
          law principles.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these Terms? Reach us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPageShell>
  );
}
