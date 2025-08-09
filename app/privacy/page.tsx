export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and cookie information for ainsworth.dev',
}

export default function PrivacyPage() {
  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        Privacy Policy
      </h1>
      
      <div className="prose prose-neutral dark:prose-invert">
        <p className="text-neutral-700 dark:text-neutral-300 mb-6">
          Last updated: {new Date().toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <h2>Who I am</h2>
        <p>
          This site is operated by Sam Ainsworth. You can contact me at
          {' '}<a href="mailto:s@ainsworth.dev">s@ainsworth.dev</a> for any privacy questions or requests.
        </p>

        <h2>Cookies and Analytics</h2>
        <p>
          I use cookies and analytics tools to understand how visitors interact with the site and to improve
          the user experience. Optional analytics only run with your consent.
        </p>

        <h3>What I collect</h3>
        <ul>
          <li><strong>Analytics:</strong> Page views, session duration, device and browser info via Vercel Analytics (aggregated).</li>
          <li><strong>Performance:</strong> Core Web Vitals and page performance via Vercel Speed Insights.</li>
          <li><strong>Optional tools:</strong> Cloudflare Zaraz may load analytics tools when consent is given.</li>
          <li><strong>View counts:</strong> Aggregate counts per blog post slug in my database (no IPs or identifiers).</li>
        </ul>

        <h3>What I don't collect</h3>
        <ul>
          <li>Personal information unless you explicitly provide it (e.g., guestbook or contact form).</li>
          <li>Sensitive categories of data or payment information.</li>
          <li>Optional analytics data if you decline cookie consent.</li>
        </ul>

        <h2>Your choices</h2>
        <p>
          You can accept or decline cookies when you first visit the site. If you decline, only essential
          functionality is used and optional analytics are disabled. To change your choice, clear your cookies
          for this site and revisit.
        </p>

        <h2>Guestbook</h2>
        <p>
          The guestbook requires sign-in with GitHub (via NextAuth) to prevent spam. When you post an entry,
          I store your name (or GitHub display name), email address, message content, and timestamps in my
          database. Entries are public on the site. You can request removal at any time by contacting me.
        </p>

        <h2>Contact form</h2>
        <p>
          If you submit the contact form, your message and (optionally) your email address are sent to me via
          Resend (email delivery provider) and delivered to my inbox. This information is used only to respond
          to your enquiry. It is not added to marketing lists.
        </p>

        <h2>Data retention</h2>
        <p>
          Retention periods:
        </p>
        <ul>
          <li>Vercel Analytics: 90 days (per Vercel policy).</li>
          <li>Cloudflare Analytics (if enabled via Zaraz): up to 6 months (per Cloudflare policy).</li>
          <li>Guestbook entries: until you request deletion or I remove spam/abuse.</li>
          <li>Contact form emails: retained in my email account as part of correspondence.</li>
          <li>View counts: stored as aggregated counters without personal data.</li>
        </ul>

        <h2>Service providers</h2>
        <ul>
          <li><strong>Hosting & CDN:</strong> Vercel (hosting, Analytics, Speed Insights).</li>
          <li><strong>Tag management:</strong> Cloudflare Zaraz (loads optional analytics with consent).</li>
          <li><strong>Email delivery:</strong> Resend (contact and guestbook notifications).</li>
          <li><strong>Authentication:</strong> GitHub (sign-in for guestbook via NextAuth).</li>
          <li><strong>External data:</strong> Google YouTube API for public subscriber counts (no personal data).</li>
        </ul>

        <h2>Legal basis</h2>
        <ul>
          <li><strong>Consent:</strong> Optional analytics via cookie banner.</li>
          <li><strong>Legitimate interests:</strong> Operating the site, preventing abuse, measuring aggregate interest (view counters).</li>
          <li><strong>Contract/consent:</strong> Responding to contact requests you submit.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You may request access to, correction or deletion of personal data you have provided (e.g., guestbook entries
          or contact messages). Email <a href="mailto:s@ainsworth.dev">s@ainsworth.dev</a> with your request.
        </p>

        <h2>Contact</h2>
        <p>
          For any privacy questions, contact me at <a href="mailto:s@ainsworth.dev">s@ainsworth.dev</a>.
        </p>
      </div>
    </section>
  )
}
