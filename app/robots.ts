import { SITE_URL } from '@/lib/site';

/**
 * NOT the whole robots.txt. Cloudflare's Managed robots.txt feature prepends a
 * block of its own to this file and serves the two concatenated, so production
 * carries a content-signal preamble and ~9 `Disallow: /` rules that appear
 * nowhere in this repo. Read the served response, not this file, before
 * concluding anything about what is blocked.
 *
 * Cloudflare's managed list blocks the *training* crawlers (GPTBot, ClaudeBot,
 * CCBot, Google-Extended and friends) and leaves the *citation* crawlers alone.
 * That split is the whole policy, and it is worth keeping: blocking GPTBot does
 * not stop ChatGPT citing the site, because ChatGPT search runs on
 * OAI-SearchBot, which is a separate token.
 *
 * The groups below name those citation crawlers explicitly. Two reasons, both
 * about the list above being managed by someone else:
 *
 *  - If the Cloudflare toggle is ever turned off, the site still states a
 *    stance instead of falling back to an empty `User-agent: *`.
 *  - If Cloudflare later adds one of these tokens to its managed blocklist, the
 *    same token appears in two groups. RFC 9309 merges groups sharing a token,
 *    and for two equally specific rules the least restrictive wins, so an
 *    explicit `Allow: /` here survives a `Disallow: /` added upstream.
 */

/** Crawlers that build the indexes AI answers cite from. */
const CITATION_CRAWLERS = [
  'Googlebot', // Search, and therefore AI Overviews and AI Mode
  'Bingbot', // Bing, and therefore Copilot
  'OAI-SearchBot', // ChatGPT search index
  'ChatGPT-User', // ChatGPT fetching a page a user asked about
  'Claude-SearchBot', // Claude search index
  'Claude-User', // Claude fetching a page a user asked about
  'PerplexityBot', // Perplexity
  'Applebot', // Apple search (Applebot-Extended, the training token, stays blocked)
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...CITATION_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
