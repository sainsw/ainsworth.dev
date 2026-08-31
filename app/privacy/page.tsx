import { EmailLink } from '@/components/email-link';
import { breadcrumbJsonLd } from '@/lib/content/post-links';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How ainsworth.dev handles cookies, analytics and anything you send through the contact form, including what is stored, for how long, and who processes it.',
  path: '/privacy',
});

// The date the policy's substance last changed, not the date this file was
// last touched: the 2026-08-05 humanizer pass reworded the page without
// changing what it says. Update this by hand when the policy does. It used to
// render `new Date()`, so the page claimed it had been updated today no matter
// how long it had actually sat unchanged.
// 2026-08-22: dropped Cloudflare Zaraz and Cloudflare Web Analytics, which are
// both switched off at the edge and no longer load.
const LAST_UPDATED = '22 August 2026';

export default function PrivacyPage() {
  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: 'Privacy Policy', path: '/privacy' }]),
          ),
        }}
      />
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        Privacy Policy
      </h1>

      <div className="prose dark:prose-invert">
        <p className="text-muted-foreground mb-6">
          Last updated: {LAST_UPDATED}
        </p>

        <h2>Who I am</h2>
        <p>
          This site is operated by Sam Ainsworth. For privacy questions or
          requests, please{' '}
          <EmailLink
            user="privacy"
            domain="ainsworth.dev"
            label="email me"
            className="underline underline-offset-2 text-foreground hover:opacity-80"
          />{' '}
          or use the contact form.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          I use a small number of tools to understand performance and usage.
          Optional analytics only run with your consent. Performance
          measurements (Vercel Speed Insights) do not use cookies and run
          without consent.
        </p>

        <h3>What I collect</h3>
        <ul>
          <li>
            Analytics (consent): Page views, session duration, device and
            browser info via Vercel Analytics (aggregated; runs only after
            consent).
          </li>
          <li>
            Performance (no cookies): Core Web Vitals (e.g. LCP, CLS, INP, TTFB)
            via Vercel Speed Insights. These measurements are collected without
            cookies or local storage and are reported in an anonymised,
            aggregate form to help improve site performance.
          </li>
          <li>
            View counts: Aggregate counts per blog post slug in my database (no
            IPs or identifiers).
          </li>
        </ul>

        <h3>What I don't collect</h3>
        <ul>
          <li>
            Personal information unless you explicitly provide it (e.g., the
            contact form).
          </li>
          <li>Sensitive categories of data or payment information.</li>
          <li>Optional analytics data if you decline cookie consent.</li>
          <li>
            Any cookies for performance measurements (Vercel Speed Insights uses
            none).
          </li>
        </ul>

        <h2>Your choices</h2>
        <p>
          You can accept or decline cookies when you first visit the site. If
          you decline, only essential functionality is used and optional
          analytics are disabled. To change your choice, clear your cookies for
          this site and revisit.
        </p>

        <h2>Contact form</h2>
        <p>
          If you submit the contact form, your message and (optionally) your
          email address are sent to me via Resend (email delivery provider) and
          delivered to my inbox. This information is used only to respond to
          your enquiry. It is not added to marketing lists. The form uses
          Cloudflare Turnstile to prevent abuse. Cloudflare describes how
          Turnstile processes data in its{' '}
          <a href="https://www.cloudflare.com/policies/privacy/#18-turnstile-privacy-addendum">
            Turnstile Privacy Addendum
          </a>
          .
        </p>

        <h2>Data retention</h2>
        <p>Retention periods:</p>
        <ul>
          <li>Vercel Analytics: 90 days (per Vercel policy).</li>
          <li>
            Vercel Speed Insights: Web Vitals metrics without identifiers;
            reported in aggregate for performance monitoring.
          </li>
          <li>
            Contact form emails: retained in my email account as part of
            correspondence.
          </li>
          <li>
            View counts: stored as aggregated counters without personal data.
          </li>
        </ul>

        <h2>Service providers</h2>
        <ul>
          <li>Hosting & CDN: Vercel (hosting, Analytics, Speed Insights).</li>
          <li>
            Bot protection: Cloudflare Turnstile (contact form abuse
            prevention).
          </li>
          <li>Email delivery: Resend (contact form notifications).</li>
          <li>
            External data: Google YouTube API for public subscriber counts (no
            personal data).
          </li>
        </ul>

        <h2>Legal basis</h2>
        <ul>
          <li>Consent: Optional analytics via cookie banner.</li>
          <li>
            Legitimate interests: Operating the site, preventing abuse,
            measuring aggregate interest (view counters), and
            measuring/improving site performance (Vercel Speed Insights; no
            cookies).
          </li>
          <li>Contract/consent: Responding to contact requests you submit.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You may request access to, correction or deletion of personal data you
          have provided (e.g., contact messages). Please{' '}
          <EmailLink
            user="privacy"
            domain="ainsworth.dev"
            label="email me"
            className="underline underline-offset-2 text-foreground hover:opacity-80"
          />{' '}
          with your request.
        </p>

        <h2>Contact</h2>
        <p>
          For any privacy questions, please{' '}
          <EmailLink
            user="privacy"
            domain="ainsworth.dev"
            label="email me"
            className="underline underline-offset-2 text-foreground hover:opacity-80"
          />
          .
        </p>
      </div>
    </section>
  );
}
