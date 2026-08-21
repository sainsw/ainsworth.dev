# Migrating to Cache Components (`use cache` + `cacheLife`)

Handoff document. This work was scoped out during an architecture review on
2026-08-21 and deliberately deferred: the review's refactors kept
`unstable_cache` so that a regression in either piece of work would be
attributable to one of them. This is the deferred half.

## Why this was not done inline

`lib/views.ts` caches its read with `unstable_cache`, which is legacy API. The
modern replacement is the `use cache` directive plus `cacheLife`, but that
requires `cacheComponents: true` in `next.config.ts`, which changes rendering
semantics for **every** route, not just the one being migrated. Bundling that
into a refactor of the view counter would have made a rendering regression
indistinguishable from a counter regression.

## Verified facts (checked against next@16.2.10 in this repo)

- `cacheComponents` is a **top-level** `next.config.ts` key. The
  `experimental.cacheComponents` form is deprecated, and `experimental.ppr` is
  deprecated with a note that Partial Prerendering is now reached through
  `cacheComponents`.
- `next/cache` exports `cacheLife` and `cacheTag` **unprefixed**, alongside
  `unstable_cacheLife` / `unstable_cacheTag` aliases. It also exports
  `updateTag` and `refresh`.
- `cacheLife` takes either a named profile (`'seconds'`, `'minutes'`, `'hours'`,
  `'days'`, `'weeks'`, `'max'`, `'default'`) or a custom
  `{ stale?, revalidate?, expire? }` object in seconds. Custom named profiles
  can be declared in `next.config.ts`.
- The built-in `'minutes'` profile is `stale: 300, revalidate: 60,
  expire: 3600`.

## Unverified — determine this first

The current code sets `export const revalidate = 60` on both
`app/blog/page.tsx` and `app/blog/[slug]/page.tsx`. I could not confirm from the
installed package whether route-segment `revalidate` is rejected, ignored, or
honoured once `cacheComponents` is on. **Establish this before planning the rest
of the migration**, because it decides whether this is a config change plus two
file edits or a rewrite of how both blog routes declare freshness.

Cheapest way to find out: set `cacheComponents: true`, run
`SKIP_CV=1 npm run build-only`, and read what the build says.

## What needs migrating

There is exactly one `unstable_cache` call site in the repo:

- `lib/views.ts` — `cachedRows`, wrapping `SELECT slug, count FROM views`,
  with `{ revalidate: 60 }`, deliberately aligned to the pages' ISR window.

Everything else that caches is either static generation or HTTP `Cache-Control`
headers in `next.config.ts`, and is out of scope.

## Constraint that must survive the migration

`lib/views.ts` catches read failures **outside** the cache wrapper, on purpose.
A rejection thrown through the cache is not stored, so the next request retries.
Catching inside would cache the failure and pin every count at "unavailable" for
the whole window even after the database recovered.

`tests/views.test.ts` has a test named
`retries after a failed read instead of caching the failure` that guards this.
It fakes the cache with a helper that memoises resolutions only. **If you change
how caching is wired, that fake has to keep modelling "resolutions cached,
rejections not", or the test silently stops proving anything.**

Whatever `use cache` does with a throwing function needs checking against this.
If `use cache` turns out to cache rejections, the current structure is not
expressible and the failure policy has to be reconsidered rather than
mechanically ported.

## Suggested sequence

1. Set `cacheComponents: true`, build, and record what breaks. Do not fix
   anything yet.
2. Resolve the `export const revalidate` question above.
3. Migrate `lib/views.ts`'s `cachedRows` to a `use cache` function with
   `cacheLife({ revalidate: 60 })` or the `'minutes'` profile if its
   stale/expire values are acceptable.
4. Re-run `tests/views.test.ts` and confirm the retry test still fails when you
   deliberately move the catch inside the cache. If it passes with the catch in
   the wrong place, the test fake needs updating before you trust it.
5. Audit Suspense boundaries. `app/blog/page.tsx` already wraps its view counts;
   `app/blog/[slug]/page.tsx` wraps both the date and the count.
6. Check bfcache and the CDN behaviour are unchanged. There is a comment in
   `app/blog/[slug]/page.tsx` explaining that `connection()` was removed
   specifically to keep bfcache intact — do not reintroduce anything that opts
   the route into fully dynamic rendering.

## Gates

Run all six, in this order, as `CLAUDE.md` requires:

```bash
npm run lint && npm run format:check && npm run typecheck && npm run typecheck:tests && npm run test:run && SKIP_CV=1 npm run build-only
```

`lint` and `format:check` are separate Biome commands and neither implies the
other.

Then run the e2e suite, which is the only thing that exercises the counter
against a real database:

```bash
npm run e2e
```

`e2e/api/views.spec.ts` and `e2e/view-tracking.spec.ts` are the relevant specs.
The ones that write real counts are localhost-gated on purpose.
