import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — fictus",
};

const CONTACT_EMAIL = "hello@fictus.app";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" effectiveDate="September 23, 2026">
      <section>
        <p>
          This policy explains what data fictus (&quot;we,&quot; &quot;us&quot;) collects, why, and
          how it&apos;s handled. fictus is currently operated by an individual,{" "}
          <strong>[YOUR LEGAL NAME]</strong>, as a sole proprietorship.
        </p>
      </section>

      <section>
        <h2>1. Your project content stays on your device</h2>
        <p>
          The conversations, chat lists, profile details, and images you build in the fictus editor
          are stored in your browser&apos;s local storage. They are never uploaded to or stored on
          our servers, and we have no access to them. This is the most sensitive data you create in
          fictus, and it simply doesn&apos;t leave your browser.
        </p>
      </section>

      <section>
        <h2>2. What we do collect</h2>
        <p>
          <strong>Account data.</strong> Authentication is handled by Clerk. When you sign up, Clerk
          collects and stores identifiers like your email address and name on our behalf. See{" "}
          <a href="https://clerk.com/legal/privacy" target="_blank" rel="noreferrer">
            Clerk&apos;s Privacy Policy
          </a>
          .
        </p>
        <p>
          <strong>Billing data.</strong> If you subscribe to Pro, payment is handled by Polar
          Software, Inc. (&quot;Polar&quot;), our payment processor and merchant of record. Polar
          collects your payment details directly — we never see or store your card number. We
          receive and store only your subscription status, plan, Polar customer/subscription IDs,
          and renewal date, tied to your account. See{" "}
          <a href="https://polar.sh/legal/privacy" target="_blank" rel="noreferrer">
            Polar&apos;s Privacy Policy
          </a>
          .
        </p>
        <p>
          <strong>Usage data.</strong> We store how many exports your account has used in the
          current calendar month, so we can apply the free plan&apos;s limit. This is just a
          counter tied to your account id — not the exported images themselves.
        </p>
      </section>

      <section>
        <h2>3. Cookies</h2>
        <p>
          We use the session cookies Clerk sets to keep you signed in. We don&apos;t currently run
          any third-party analytics or advertising trackers. If that changes, we&apos;ll update
          this policy first.
        </p>
      </section>

      <section>
        <h2>4. How we use this data</h2>
        <ul>
          <li>To operate your account and keep you signed in</li>
          <li>To process and manage your subscription</li>
          <li>To enforce the free plan&apos;s monthly export limit</li>
          <li>To respond if you contact us for support</li>
        </ul>
        <p>We don&apos;t sell your data, and we don&apos;t use it for advertising.</p>
      </section>

      <section>
        <h2>5. Who we share it with</h2>
        <p>We share the minimum data needed with the service providers that run fictus:</p>
        <ul>
          <li>
            <strong>Clerk</strong> — authentication and account management
          </li>
          <li>
            <strong>Polar</strong> — subscription billing and payment processing (merchant of
            record)
          </li>
          <li>
            <strong>Vercel</strong> — application hosting
          </li>
          <li>
            <strong>Neon</strong> — database hosting for the account/subscription data described
            above
          </li>
        </ul>
        <p>
          We don&apos;t share your data with anyone else, except where required by law.
        </p>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          We keep your account, subscription, and usage records for as long as your account is
          active, plus a reasonable period afterward for billing and legal record-keeping. Contact
          us to request deletion of your account data.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          You can ask us to access, correct, or delete the account data we hold about you at any
          time by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Since your
          project content never reaches our servers, deleting your browser data deletes that
          content directly — we don&apos;t hold a copy to remove.
        </p>
      </section>

      <section>
        <h2>8. Children&apos;s privacy</h2>
        <p>
          fictus is not directed at children under 13, and we don&apos;t knowingly collect data
          from them.
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          We rely on our providers&apos; (Clerk, Polar, Vercel, Neon) security practices and use
          reasonable measures to protect the account data we hold. No method of transmission or
          storage is 100% secure.
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          If we make material changes to this policy, we&apos;ll update the effective date above.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about this policy? Reach us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPageShell>
  );
}
