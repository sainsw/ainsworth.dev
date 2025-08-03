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
            day: 'numeric' 
          })}
        </p>

        <h2>Cookies and Analytics</h2>
        <p>
          This website uses cookies and analytics tools to understand how visitors interact with the site. 
          These tools help me improve the user experience and content.
        </p>

        <h3>What we collect:</h3>
        <ul>
          <li><strong>Analytics data:</strong> Page views, session duration, and general usage patterns through Vercel Analytics</li>
          <li><strong>Performance data:</strong> Page load times and Core Web Vitals through Vercel Speed Insights</li>
          <li><strong>Optional tracking:</strong> Enhanced analytics through Cloudflare Zaraz (if you consent)</li>
        </ul>

        <h3>What we don't collect:</h3>
        <ul>
          <li>Personal information unless you explicitly provide it (e.g., guestbook entries)</li>
          <li>Sensitive data or financial information</li>
          <li>Data from users who decline cookie consent</li>
        </ul>

        <h2>Your choices</h2>
        <p>
          You can accept or decline cookies when you first visit the site. If you decline, 
          only essential functionality cookies will be used. You can change your preferences 
          by clearing your browser cookies and revisiting the site.
        </p>

        <h2>Data retention</h2>
        <p>
          Analytics data is retained according to the respective service providers' policies:
        </p>
        <ul>
          <li>Vercel Analytics: 90 days</li>
          <li>Cloudflare Analytics: 6 months</li>
        </ul>

        <h2>Contact</h2>
        <p>
          If you have questions about this privacy policy, please contact me through the 
          guestbook or via social media links on the main page.
        </p>
      </div>
    </section>
  )
}