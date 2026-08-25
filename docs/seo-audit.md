# Traditional SEO audit: ainsworth.dev

Run 2026-08-25 with [SEOmator CLI](https://github.com/seo-skills/seo-audit-skill)
v3.0 (251 rules, 20 categories), crawling 19 pages.

**Score: 95, grade A** at the time of the audit. **96 after the fixes in
`44840eb`**, with accessibility 92 to 97, AI/GEO readiness 87 to 94, social 90 to
94, and security 95 to 97.

Everything code-side below is fixed. Two items are deliberately still open and
are marked at the bottom. The findings are kept in place rather than deleted,
because the reasoning is the part worth keeping.

## Read the method before the numbers

The live site could not be reached: this sandbox blocks egress to
`ainsworth.dev`. So the crawl ran against `next start` on `http://localhost:3000`
serving the current production build.

That trade is worth understanding, because it makes roughly a third of the raw
output meaningless:

| Class | Issue records | of which "critical" |
|---|---:|---:|
| Real | 613 | 64 |
| Artefact of auditing localhost | 285 | 152 |
| False positive in the tool | 75 | 16 |
| **Total** | **973** | **232** |

Two thirds of the critical failures are not findings. Auditing `http://localhost`
fails every HTTPS, HSTS and SSL rule by construction, and every canonical points
at `https://ainsworth.dev` while the crawled page is on localhost, so the
protocol and sitemap-domain rules fail too. One of them, `crawl-canonical-redirect`
reporting "Canonical URL returns HTTP 403", is the sandbox's own egress proxy
refusing the request, not anything the site does.

Every finding below was verified by hand against the served HTML rather than
taken from the report.

## The one that matters: every page ships its stylesheet twice

`hello-world` is a 34-word post. It serves 204KB of HTML.

The cause is not the post. `next.config.ts` sets `experimental.inlineCss: true`,
which inlines the compiled CSS into a `<style>` block. The same stylesheet is
then serialised a second time into the RSC flight payload, as a
`self.__next_f.push(...)` script, so the client has it for navigation. Both
copies ship on every page:

```
total HTML         204,717
  <style> block     58,945   the inlined CSS
  RSC payload css   59,656   the same stylesheet, escaped into a script
  everything else   86,116
```

Confirmed identical, not merely similar: the `<style>` block's opening 200
characters appear escaped inside the RSC script.

That is 58% of the page. Compressed it still costs real bytes, because the two
copies are escaped differently and do not fully collapse into one another:

| | raw | gzipped |
|---|---:|---:|
| As shipped | 204,717 | 40,158 |
| With the duplicate copy removed | 85,405 | 17,327 |

About 23KB gzipped, on every page load, for a stylesheet the browser already
has.

I measured the alternative rather than guessing at it. Rebuilding with
`inlineCss: false`:

| Page | raw, inlined | raw, external | gzip, external |
|---|---:|---:|---:|
| `/blog/hello-world` | 204,717 | 26,437 | 6,321 |
| `/` | 217,927 | 39,555 | 7,957 |
| `/blog` | 237,896 | 59,589 | 9,588 |
| `/blog/api-design` | 528,058 | 349,744 | 38,487 |

Gzipped-inlined was measured only for `/blog/hello-world`, in the table above:
40,158 bytes, against 6,321 with an external stylesheet.

The CSS becomes one `<link rel="stylesheet">`, which is cached across every
navigation instead of being re-sent inline each time.

The config was restored after measuring. Nothing was changed.

This is a genuine trade, not a free win, and it is why the flag is presumably
there: an external stylesheet is one render-blocking request on first paint,
which `inlineCss` exists to remove. What is worth weighing is the price. The
current setting pays about 34KB gzipped on every page, uncached, forever, to
save one request that is cached after the first visit. On a site whose largest
page is a blog post, that looks like the wrong side of the trade. Worth
measuring LCP both ways on the real site before deciding, which is exactly the
measurement this sandbox cannot do.

It also fixes the only HTML-size failure: `/blog/api-design` at 528KB breaches
the tool's 500KB limit, and drops to 349KB without the duplicate.

## Social previews are broken on every page that is not a post

`/`, `/blog`, `/work` and `/contact` have no `og:image` at all, and they inherit
the root layout's Open Graph block wholesale, so they also carry the wrong
title, description and URL.

`/work` serves this:

```
og:title        Sam Ainsworth - Senior Software Developer & Cloud Engineer
og:description  Senior Software Developer with 10+ years experience, working in …
og:url          https://ainsworth.dev
canonical       https://ainsworth.dev/work
```

The page-level `description` meta is correct. Only the Open Graph copy is wrong,
because those pages set `metadata.title` and `metadata.description` but never
`metadata.openGraph`, and Next inherits the parent block entire rather than
merging field by field. `og:url` pointing at the homepage while the canonical
points at `/work` is the same cause and is what the tool flags as
`social-og-url-canonical`.

Posts are fine: `postMetadata()` builds a complete per-post Open Graph block
including the generated `/api/og/<slug>` card. The four static pages just never
got the same treatment.

## `/privacy` is orphaned

Nothing on the site links to it. Not the footer, not the nav, not any page:

```
/                  0 links to /privacy
/blog              0
/work              0
/contact           0
/blog/burnrate     0
```

The single reference in the codebase is inside `components/cookie-banner.tsx`,
which returns `null` once consent is recorded. So the only route to the privacy
policy is a banner that disappears permanently after a visitor's first click,
and it is absent from the raw HTML that crawlers read.

The page is in the sitemap, so it will get indexed. It just has no internal
links pointing at it, which is what the tool reports as a missing privacy policy
link on all 19 pages. A footer link would fix both.

## Heading anchors have no accessible name

`components/blog-content.tsx` prepends a permalink anchor to every heading:

```js
const anchor = document.createElement('a');
anchor.setAttribute('href', `#${id}`);
anchor.setAttribute('class', 'anchor');
heading.prepend(anchor);
```

No text, no `aria-label`. A screen reader announces each one as an unnamed link.
`/blog/api-design` has sixteen of them, and twelve post pages fail the rule.
An `aria-label` naming the section it links to is the whole fix.

## Smaller, verified

The blog index carries `Blog` schema whose `blogPost` entries are missing
`image`, `publisher` and `mainEntityOfPage`. That one is mine: I added
`blogIndexJsonLd()` yesterday and gave the nested entries fewer fields than the
per-post `BlogPosting` gets.

No skip link anywhere on the site, and no `<header>` landmark. The layout has
`nav`, `main`, `aside` and `footer`, so this is the one landmark missing.

`app/layout.tsx` emits `<link rel="dns-prefetch" href="//ainsworth.dev">`. The
protocol-relative URL should be explicit `https://`.

`/llms.txt` now exists but nothing advertises it. The rule looks for
`<link rel="llms">`, `<meta name="llms">`, or an anchor to `/llms.txt`. Adding
the link tag next to the RSS one is a two-line change.

No `BreadcrumbList` schema on any non-homepage.

Meta descriptions are inconsistent in length rather than uniformly wrong. Fifteen
pages are under the 120-character floor, eight are long enough to be truncated in
results (one estimated at 1625px against a ~920px budget). Post summaries do
double duty as meta descriptions and were not written to a length budget.

Two pages are genuinely thin: `/contact` at 21 visible words and
`/blog/hello-world` at 34.

## Do not chase these

Four rules fire across nearly every page and are wrong. Worth naming so they do
not turn into work.

`core-nosnippet` reports that `max-snippet:-1` blocks snippets, on all 19 pages.
It is backwards. In Google's robots meta spec `-1` means *no limit*; `0` is the
value that suppresses snippets. The site's directive is correct as written.

`perf-render-blocking` reports one script in `<head>` without `async` or
`defer`. Every real script in the head is already `async`. The one it is
counting is the `application/ld+json` block, which is data and never executes.

`images-modern-format` reports 0% WebP adoption. The site serves WebP through
`<picture><source type="image/webp">`, which the rule does not look at. `/work`
alone carries four such sources.

`perf-lazy-above-fold` reports a lazy-loaded hero image delaying LCP on 18
pages. It is the footer avatar, which is correctly `loading="lazy"`. The rule
assumes the first image in the document is the hero; on these pages it is the
only image, and it is below the fold.

## Worklist

1. **Still open.** Decide the `inlineCss` trade on real-world LCP numbers. It is worth about 34KB gzipped per page, and choosing needs a measurement this sandbox cannot take.
2. ~~Give `/`, `/blog`, `/work` and `/contact` their own `openGraph` blocks.~~ Done, via `lib/page-metadata.ts` and a new `/api/og` site card.
3. ~~Link `/privacy` from the footer.~~ Done.
4. ~~Give the heading anchors an `aria-label`.~~ Done.
5. ~~Add `image`, `publisher` and `mainEntityOfPage` to the blog index's nested entries.~~ Done.
6. ~~Add a skip link and a `<header>` landmark.~~ Done, with before-and-after screenshots byte-identical across four routes at two widths.
7. ~~Make the `dns-prefetch` URL explicitly `https://`.~~ Done.
8. ~~Advertise `/llms.txt` with a `<link rel="llms">`.~~ Done.
9. ~~Add `BreadcrumbList` schema to non-homepage routes.~~ Done.
10. **Still open.** Give post summaries a length budget so they survive as meta descriptions. This is prose, and writing fifteen summaries to a character count is the kind of flattening the humanizer skill exists to prevent. The two descriptions I wrote myself (`/contact`, `/privacy`) were set inside the 120 to 160 window.

One thing the fixes changed about the numbers: linking `/privacy` from the footer
means the crawler now finds it, so the crawl covers 20 pages rather than 19, and
every per-page rule count rises by one. The `perf` category dips a point purely
from that arithmetic rather than from any regression.

A single new item surfaced rather than broke: with `<main>` no longer wrapping
the nav, `perf-lcp-hints` can finally identify an LCP candidate, and flags two
pages whose first image has no `fetchpriority="high"`. The images did not
change; the rule can just see them now.

## Re-running this

```bash
npm install -g @seomator/seo-audit
seomator init -y --preset blog
seomator audit https://ainsworth.dev --crawl -m 30 --format llm --refresh
```

Against the live domain most of the artefact class disappears and the security,
canonical and sitemap categories become meaningful for the first time. That run
is worth doing from a machine that can actually reach the site.
