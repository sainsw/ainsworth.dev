# AI SEO audit: ainsworth.dev

Audited 2026-08-25 against the `ai-seo` skill from
[coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/main/skills/ai-seo)
(v2.4.0), including its `agent-readiness` reference.

Everything below was checked against `SKIP_CV=1 npm run build-only` output rather
than the source, so "404" means the route genuinely is not in the build's served
surface.

One caveat that turned out to matter more than expected: the build output is not
the served response. Cloudflare rewrites `robots.txt` in front of the app, and a
first pass that read only `app/robots.ts` and the build reached the exact
opposite conclusion to the truth. The served file is quoted below and is the
authority. Where this document describes `robots.txt`, it describes production.

## Where the site stands

| Layer | Verdict |
|---|---|
| Access (can an agent see real content?) | Strong. Every route prerenders, content is in the initial HTML. |
| Discovery (do your files say what's here?) | Mixed. Crawler policy is explicit and well judged, but lives in Cloudflare, not the repo. `llms.txt` 404s and there is no feed. |
| Parseability (can an agent tell what the page is?) | Mixed. Valid JSON-LD, but thin, and one field points at a 404. |
| Authority (is it worth citing?) | Weakest. 8 of 15 posts cite nothing external. |

Access is the layer most sites fail and this one passes outright. The gaps are
all in the three layers above that, and the cheapest wins are in Discovery.

The crawler policy deserves saying up front, because it is the finding most
likely to be misread: nine crawlers are blocked in production, and that is
mostly the right call, not a mistake. The detail is in the next section.

## The robots.txt you serve is not the one in your repo

This is the finding most likely to be misread in either direction, so it goes
first. Nine crawlers are blocked in production. That is mostly the right call.
The problem is that nothing in the codebase says so.

`app/robots.ts` emits a `User-Agent: *` group with no rules under it, and the
build confirms that is what Next produces. It is not what visitors get.
Cloudflare's Managed robots.txt feature prepends its own block and serves the
two concatenated, so production carries a full content-signal preamble, nine
`Disallow: /` rules, and then the app's own output appended underneath.

Two things follow, and they pull in opposite directions.

The policy is real, and mostly well judged. My first pass concluded the site
expressed no stance and blocked nothing. Production blocks Amazonbot,
Applebot-Extended, Bytespider, CCBot, ClaudeBot,
CloudflareBrowserRenderingCrawler, Google-Extended, GPTBot and
meta-externalagent. Read as a list of names that looks alarming for a site that
wants AI citations. Read by what each token actually governs, it is close to the
middle ground the skill recommends: block the training crawlers, keep the
citation crawlers.

| Blocked | What it governs | Citation cost |
|---|---|---|
| `GPTBot` | OpenAI model training | None. ChatGPT search uses `OAI-SearchBot`, which is not blocked. |
| `ClaudeBot` | Anthropic model training | None. Claude search uses `Claude-SearchBot`, which is not blocked. |
| `Google-Extended` | Gemini training and Gemini-app grounding | Real, but narrow. See below. |
| `CCBot` | Common Crawl dataset | None. Dataset collection only. |
| `Applebot-Extended` | Apple Intelligence training | None. `Applebot` handles search and is not blocked. |
| `Amazonbot`, `Bytespider`, `meta-externalagent` | Amazon, ByteDance and Meta assistants | Those assistants only. |

The crawlers that actually produce citations are all still allowed: `Googlebot`,
`Bingbot`, `PerplexityBot`, `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`,
`Claude-User` and `Applebot`. So ChatGPT, Claude, Perplexity and Copilot can all
still reach, index and cite the site.

`Google-Extended` is the one block with a genuine cost, and it is smaller than it
looks. It is not a crawler at all: Googlebot still does the fetching, and the
token only governs downstream use. Google states it does not affect AI Overviews
or AI Mode, which run on the Search index. What it does cost is grounding in the
Gemini app and Vertex generative APIs. Worth knowing that is the trade, rather
than discovering it later.

The policy is also invisible from the codebase, and that is the actual problem.
`app/robots.ts` reads as the source of truth and is not. Anyone auditing this
repo, including a future agent following CLAUDE.md, will read that file, see an
empty permissive group, and conclude the opposite of what is served. I did.

The risk that follows is not hypothetical. The blocklist is *managed*, meaning
Cloudflare curates it. If Cloudflare adds `OAI-SearchBot` or `Claude-SearchBot`
to the managed set, the site loses AI citation on a config change it never made,
with no commit, no deploy, and nothing in the repo to notice. The current
configuration is good. Nothing in the repo pins it there.

Two fixes, both small. Put the real policy in `app/robots.ts` so it is version
controlled and reviewable, which also means the site keeps a stance if the
Cloudflare toggle is ever turned off. And leave a comment in `app/robots.ts`
saying Cloudflare prepends to it, so the next reader does not repeat the mistake
this audit made.

### The appended group is redundant, and slightly untidy

Because Cloudflare prepends rather than replaces, the served file contains two
`User-agent: *` groups: Cloudflare's, carrying the content signal and `Allow: /`,
and then the app's, carrying nothing. Parsers that follow RFC 9309 merge groups
with identical tokens, so this is very unlikely to change behaviour. `Host:` and
`Sitemap:` are non-group directives and are read wherever they appear, so the
sitemap is found correctly.

It is not a bug. It is worth cleaning up only because a robots.txt with two `*`
groups invites exactly the kind of misreading described above.

## Three things that are broken

These are bugs, not recommendations. Each one is a file that exists and does not
do what it looks like it does.

### 1. `/llms.txt` returns 404

`llms.txt` sits at the repo root. Next only serves static files from `public/`,
and there is no route handler or rewrite for it. The build's static route list is
`/`, `/blog`, `/contact`, `/privacy`, `/work`, `/favicon.ico`, `/robots.txt`,
`/sitemap.xml`. No `llms.txt`.

So the file has never been readable by anything it was written for. CLAUDE.md
lists it alongside `README.md` as prose that ships on the site, which suggests
the 404 was never the intent. Moving it to `public/llms.txt` fixes it.

### 2. The sitewide `Person` schema points its image at a 404

`app/layout.tsx` sets `image: ${SITE_URL}/placeholder.jpg`. That file is
`app/placeholder.jpg`, and `app/` is not a static-serving directory. Only the
special file conventions (`favicon.ico` and friends) are routable from there, and
`placeholder.jpg` is not one of them. It is absent from the build output.

Every page on the site therefore carries a `Person` entity whose image is a dead
URL. The real avatar is already built and hashed at
`/images/home/avatar-0bc31196.webp`, exported from `lib/avatar.ts` as
`AVATAR_SRC`.

### 3. The email obfuscation is defeated by the site's own JSON-LD

`components/email-link.tsx` builds the address on click instead of putting it in
an `href`, with a `biome-ignore` comment saying this is "to avoid exposing the
address to scrapers in the href". Meanwhile the `Person` block in
`app/layout.tsx` publishes `"email": "mailto:s@ainsworth.dev"` in plain text, in
a `<script>` tag, on every single page.

Worth deciding which one is the intended policy, because right now the site pays
the usability cost of obfuscation (the `<noscript>` fallback tells people to
enable JavaScript) and gets none of the benefit. Both positions are defensible.
Publishing it is better for entity recognition and for agents trying to contact
you. Removing it from the JSON-LD makes the obfuscation real. Doing both at once
is the only option that has no upside.

## Discovery: the cheapest wins on the site

With the crawler policy set aside, what is left in this layer is small, mostly
config, and genuinely cheap.

### Neither content signal declares `ai-input`

Two content signals ship, and they disagree with each other.

Cloudflare's robots.txt line, which is the one that follows the published policy:

```
Content-Signal: search=yes,ai-train=no,use=reference
```

And an HTTP header set in `next.config.ts` on every response:

```
Content-Signals: search=yes, ai-train=no
```

The policy defines the directive as `Content-Signal`, singular, in robots.txt.
The header in `next.config.ts` is plural, omits `use=reference`, and duplicates
in a weaker form something Cloudflare is already emitting correctly one block
earlier in the same response. It should go, or be brought into line.

More useful than either: both omit `ai-input`, the signal covering real-time use
of a page to ground a generative answer. That is the behaviour that produces a
citation, and by the policy's own terms an omitted signal grants and restricts
nothing. The site has said a clear no to training and stayed silent on the one
use it presumably wants.

Declaring `ai-input=yes` would state the position the rest of the configuration
already implies, and it sits consistently beside `ai-train=no` and the unblocked
search crawlers: read my work to answer questions, don't train on it.

### There is no feed

No RSS, no Atom, no JSON Feed. `grep` across `app/`, `lib/` and `components/`
finds no feed route at all. For a technical blog this is the most conventional
discovery surface there is, and it is the one route where the content is already
in the right shape: `getBlogPosts()` returns everything a feed needs.

### No `llms-full.txt`

The companion to `llms.txt`: the whole site's content in one file so an agent
gets it in a single request instead of crawling 15 post URLs. The skill scores it
as a bonus signal. Posts are already plain HTML read at request time, so
generating it is a loop over `getBlogPosts()`.

## Authority: the biggest content gap

The Princeton GEO study the skill cites (KDD 2024) ranks citing sources as the
single strongest lever, at +40% visibility, with statistics at +37%. This is
where the site has the most room.

Outbound links per post:

| Post | External links |
|---|---:|
| burnrate | 3 |
| ios-shortcuts | 3 |
| avatar-fetcher-first-package | 2 |
| building-framemoji | 2 |
| github-image-sync | 1 |
| prerendered-mermaid-diagrams | 1 |
| ai-coding-tools | 0 |
| api-design | 0 |
| cv-sync-latex | 0 |
| hello-world | 0 |
| htmldocsforai | 0 |
| og-images | 0 |
| seasonal-avatar-borders | 0 |
| ship-fast-with-ai-upgrades | 0 |

Eight of fifteen posts reference nothing outside themselves.

`htmldocsforai` is the sharpest example. It argues that models handle HTML better
than Markdown, which is a claim about model behaviour that other people have
studied and measured, and it currently supports that with zero references. It is
also the post most likely to be retrieved for a query an AI system is answering,
because it is about how AI systems read documents. A version that cites its
sources is a different piece of work in retrieval terms.

`api-design` is the other one worth attention: twelve H2 sections on OpenAPI,
idempotency, pagination and OAuth scopes, and no link to a spec, an RFC, or a
tool it names. Those links exist and are stable. Adding them is not a rewrite.

To be explicit about what this recommendation is not: it is not an instruction to
pad posts with statistics or to write to a citation formula. The skill is blunt
that keyword stuffing actively reduces AI visibility, at -10%. The ask is
narrower. Where a post already makes a factual claim about something external,
link to the thing.

### Freshness cannot currently be expressed

`postJsonLd()` sets `dateModified` to `post.metadata.publishedAt`, always. It has
no other option, because `lib/content/blog.ts` validates metadata against a
closed set (`title`, `publishedAt`, `summary`, `image`) and throws on anything
else. Adding `updatedAt` to a post today fails the build.

Three posts date from 2024 and the newest is 2026-07-23. The skill weights
recency heavily and flags undated or stale-looking content as an
underperformer. The fix is small: allow an optional `updatedAt`, fall back to
`publishedAt` when it is absent, and surface it on the page as well as in the
schema.

### No visible author, and no about page

Post pages render the title, the date and the view count. The author's name
appears in the JSON-LD and nowhere a reader can see it. The routes are `/`,
`/blog`, `/work`, `/contact`, `/privacy`, so `/work` is doing about-page duty
while being titled and described as career history.

For a single-author personal site this feels redundant from the inside, but
E-E-A-T signals and entity resolution both want a visible, linked author identity
attached to the writing.

## Parseability

### Canonical tags are missing on four of six pages

| Page | Canonical |
|---|---|
| `/` | present |
| `/blog/[slug]` | present |
| `/blog` | missing |
| `/work` | missing |
| `/contact` | missing |
| `/privacy` | missing |

`app/page.tsx` and `lib/content/post-links.ts` both set `alternates.canonical`.
The four layout-level `metadata` exports do not.

### The schema is valid but thin

`BlogPosting` currently carries `headline`, `datePublished`, `dateModified`,
`description`, `image`, `url` and `author`. Missing: `mainEntityOfPage`,
`publisher`, `keywords`, `articleSection`, `wordCount`. `mainEntityOfPage` in
particular is the field that ties the schema to the page it describes.

The blog index has no schema at all. A `Blog` or `ItemList` node listing the 15
posts is the structure a retrieval system uses to understand what the archive
contains without crawling each URL.

### `/work` has rich entity data rendered as HTML only

`data/resume.json` holds four roles (each with a company URL), three education
entries (each with an institution URL), two skill categories, and a location.
That renders as 648 words of clean HTML on `/work`, and none of it reaches the
`Person` schema, which currently gets only `jobTitle`, `worksFor` and `address`.

`alumniOf`, `knowsAbout` and `hasOccupation` are the natural additions, and they
answer exactly the "who is Sam Ainsworth, and what does he know" question that
entity-based retrieval asks. This one is generated from data that already exists,
so it changes no prose and does not touch `data/resume.json`, which CLAUDE.md
puts out of bounds.

### No Markdown representation

The newest technique in the skill's stack: serve compact Markdown at the same
canonical URL under `Accept: text/markdown` with a `Vary` header, or advertise a
parallel Markdown URL via a `Link` header. Given that posts are authored as
standalone HTML files with a metadata block, either is tractable. This is
genuinely emerging rather than established, so it belongs at the bottom of the
list, but it is worth knowing the site is well placed to do it.

## What is already right

Worth saying plainly, because the audit above is a list of gaps and the
foundations are better than most sites this skill gets pointed at.

Every route prerenders to static HTML or PPR, so the content is in the initial
response. That is the check both agent-readiness scorers weight most heavily, and
the one that JavaScript-heavy sites fail outright.

Heading structure is correct throughout: one H1 per page from the route, H2 and
H3 inside the post body, no skipped levels. No post contains an unaltered image
tag, because no post contains an image tag at all. Diagrams are pre-rendered SVG,
inlined server-side, so they are in the HTML rather than drawn by client
JavaScript.

Post metadata is complete and consistent: title, description, canonical,
OpenGraph with `publishedTime`, Twitter card, and valid `BlogPosting` JSON-LD,
all agreeing on the same URL and image because `post-links.ts` derives them from
one place.

The CV is available as HTML on `/work` and not only as the linked PDF. The skill
lists PDF-only content as a citation underperformer, and the site already avoids
that.

The contact form is gated behind JavaScript and Turnstile, which an agent cannot
complete. That is the correct trade for a personal site, and it is the only
JavaScript-dependent path on the site.

The production crawler policy blocks training and keeps citation, which is the
configuration this skill argues for. It is worth listing as a strength because
the naive reading of that blocklist is that the site has locked itself out of AI
search, and it has not.

## Worklist, in the order I would do it

Discovery fixes first: they are small, they are mostly config, and they are the
layer where the site is furthest from where it should be.

1. Move `llms.txt` into `public/`. One file move, fixes an outright 404.
2. Point `Person.image` at `AVATAR_SRC` instead of the unserved `placeholder.jpg`.
3. Decide the email policy and make the DOM and the JSON-LD agree.
4. Declare `ai-input=yes`, and drop or rename the plural `Content-Signals` header in `next.config.ts`.
5. Move the real crawler policy into `app/robots.ts` so it is version controlled, and comment that Cloudflare prepends to it.
6. Add `alternates.canonical` to the four layouts missing it.
7. Add an RSS feed.
8. Add `alumniOf`, `knowsAbout` and `hasOccupation` to the `Person` graph from `resume.json`.
9. Allow an optional `updatedAt` in post metadata, and use it for `dateModified` and a visible "last updated".
10. Add `mainEntityOfPage` and `publisher` to `BlogPosting`, and `Blog`/`ItemList` schema to the blog index.
11. Add a visible author byline to post pages.
12. Generate `llms-full.txt`.
13. Backfill outbound citations, starting with `htmldocsforai` and `api-design`.
14. Markdown content negotiation, if and when it stops being emerging.

Items 1 through 12 are code and config, and none of them touch a word of the
site's prose. Item 13 is the one that needs writing, and it is also the one with
the largest measured effect.

## One caution on applying this skill here

The skill asks for H2 and H3 headings phrased the way people phrase queries. This
site's headings are narrative instead: "Why bother?", "Notes from the trenches",
"A few bugs I enjoyed fixing", "Markdown looks simple. That's the problem."

I would leave them alone. CLAUDE.md routes every prose edit through the humanizer
skill, whose whole purpose is stopping exactly the kind of flattening that
"rewrite your headings to match search queries" produces. The posts read as
someone writing up what they built, which is the voice the repo is explicitly
protecting, and the skill itself says content that reads like it was written to
game an algorithm will not get cited.

The retrieval benefit that heading rewrites are supposed to buy is available
more cheaply from the schema and citation work above, none of which costs a
sentence.
