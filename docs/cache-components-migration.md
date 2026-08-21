# Migrating to Cache Components (`use cache` + `cacheLife`)

Done on 2026-08-21. This was scoped out during the architecture review the day
before and deferred so that a regression in either piece of work would be
attributable to one of them. This file is now the record of what the migration
found, not a plan.

## The question the handoff could not answer

Whether route-segment `revalidate` is rejected, ignored, or honoured once
`cacheComponents` is on. It is **rejected**, as a hard build error:

```
Route segment config "revalidate" is not compatible with `nextConfig.cacheComponents`. Please remove it.
```

`export const runtime` is rejected the same way, which the handoff did not
anticipate. `app/api/og/[slug]/route.tsx` was pinning `'nodejs'`, which is the
default anyway.

So this was the larger of the two outcomes the handoff described: a rewrite of
how both blog routes declare freshness, not a config change plus two edits.

## Does `use cache` store a rejection?

No, and the failure policy in `lib/views.ts` ported over unchanged.

`use-cache-wrapper.js` closes the entry's stream as errored and still calls
`cacheHandler.set`. The default handler in
`server/lib/cache-handlers/default.js` drains that stream inside a `try` and
only reaches `memoryCache.set` if it drains cleanly, so an errored entry is
never stored. That is the same property `unstable_cache` had, which is what the
catch placement in `lib/views.ts` depends on.

Verified by moving the catch inside the boundary and confirming
`retries after a failed read instead of caching the failure` fails.

## Where the 60-second window went

`lib/views-cache.ts` is a new module holding the one `use cache` function, with
`cacheLife({ stale: 300, revalidate: 60, expire: 3600 })`. Those are Next's
built-in `'minutes'` profile written out, so the window is readable at the point
that owns it.

It is a separate module from `lib/views.ts` for a testing reason. `use cache` is
a compiler directive and vitest does not honour it, so a directive written
in-place would mean no caching at all under test: the retry test and the
"caches a successful read" test would both stop proving anything, exactly the
trap the handoff warned about. With the boundary at a module edge,
`tests/views.test.ts` wraps the real export in a fake that memoises resolutions
only, and both tests still bite.

Confirmed with a stubbed query and a non-empty `DATABASE_URL`, since the local
`.env.local` has `DATABASE_URL=""` and the counter never runs without it:

```
├ ○ /blog                          1m      1h
├ ◐ /blog/[slug]                   1m      1h
```

That is the same freshness `export const revalidate = 60` used to give, now
sourced from the read itself.

## Three latent bugs this surfaced

`cacheComponents` refuses to prerender a wall-clock read, because the value gets
baked into the static shell and never moves again. All three of these were
already doing that; the build just started saying so.

`lib/date.ts` — `formatRelativeDate` read `new Date()` itself. On `/blog` and
`/blog/[slug]` that was covered by the 60s ISR window, so it was fine in
practice, but it is why the routes could not simply drop their segment config.
It now takes the clock as an argument and gets it from `lib/current-date.ts`, a
`use cache` function with an hourly window. The visible cost is that "Today" can
take up to an hour to become "1d ago" after midnight.

`lib/bio.ts` — `getYearsOfExperience` read the clock on `/`, which has no
revalidate window and never did. The number was frozen at build. Same fix.

`app/privacy/page.tsx` — rendered `new Date()` as the policy's "Last updated"
date, so the page claimed it had been updated today, every day, however long it
had actually sat unchanged. That is a false statement on a legal page rather
than a stale one. It is now a constant, `10 August 2025`, the date of 373e5d0,
the last commit that changed what the policy says. The 2026-08-05 humanizer pass
reworded the page without changing its substance.

`e2e/visual/pages.spec.ts` had been masking that date with a comment explaining
that it "changes daily". The mask stays, because the paragraph's layout is still
worth comparing, but the comment no longer claims a bug.

## What is deliberately unchanged

`app/layout.tsx` builds its `siteDescription` from `getYearsOfExperience` at
module scope, and still evaluates it at build time. Static `metadata` has no
request to hang a cached read off, the number moves at most once a year, and the
site redeploys far more often than that. It is passed `new Date()` explicitly so
the build-time evaluation is visible rather than hidden inside the function.

`app/sitemap.ts` and `components/footer.tsx` also read the clock at module scope
and were not flagged by the build. Neither was touched.

## Tests

- `tests/views-cache.test.ts` (new) pins the 60s window, the query, and the
  numeric coercion of the driver's count.
- `tests/blog-revalidate.test.ts` no longer asserts `export const revalidate`.
  It asserts `cacheComponents` is still on, which is the thing that would now
  silently refreeze the counts if it were turned off.
- `tests/date.test.ts` (new) covers `formatRelativeDate` against fixed clocks,
  which only became possible once it stopped reading its own.
- `tests/privacy-page.test.tsx` (new) renders the page under two different fake
  system times and asserts the date does not move.
- `tests/bio.test.ts` asserts exact years across the anniversary boundary
  instead of a one-year range.
