# ainsworth.dev

My personal site — portfolio, blog, and CV. Live at **[ainsworth.dev](https://ainsworth.dev)**.

Originally forked from [leerob.io](https://github.com/leerob/leerob.io) — thanks to [leerob](https://github.com/leerob) for the starting point. It has since diverged substantially (Ship of Theseus under construction).

## Tech stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router) + [React](https://react.dev/) 19
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Database**: [Postgres](https://www.postgresql.org/) (blog view counts and redirects)
- **Lint/format**: [Biome](https://biomejs.dev/)
- **Tests**: [Vitest](https://vitest.dev/) (unit) and [Playwright](https://playwright.dev/) (E2E)
- **Email**: [Resend](https://resend.com/) (contact form), with [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) bot protection
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) + Speed Insights, and Cloudflare (loaded with consent)
- **Hosting**: [Vercel](https://vercel.com)

## Running locally

Requires Node.js 22 (see [`.nvmrc`](.nvmrc)).

```bash
git clone https://github.com/sainsw/ainsworth.dev.git
cd ainsworth.dev
npm install
npm run dev
```

The `predev` hook runs [`scripts/ensure-env.js`](scripts/ensure-env.js), which creates a `.env.local` with safe placeholder values on first run. Fill in real values for the features you want to exercise — see [`.env.example`](.env.example):

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` / `DATABASE_URL_NON_POOLING` | Postgres (blog views, redirects). Left empty, DB-backed routes no-op. |
| `RESEND_SECRET` | Sending the contact form email via Resend |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile on the contact form |
| `NEXT_PUBLIC_GET_IN_TOUCH` | Contact link |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (fetches avatar, generates version + CV, runs `next build`) |
| `npm run lint` | Biome lint |
| `npm run format` | Biome format (`format:check` to verify only) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:run` | Vitest (watch / single run) |
| `npm run e2e` | Playwright E2E |
| `npm run update-cv` | Regenerate LaTeX from `data/resume.json`, rebuild the CV PDF |

## Testing & CI

- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint → format check → typecheck → unit tests on every push and PR to `main`.
- **E2E** ([`.github/workflows/e2e.yml`](.github/workflows/e2e.yml)) runs Playwright against a Vercel preview deployment on PRs.
- The **Vercel build** ([`scripts/vercel-build.sh`](scripts/vercel-build.sh)) runs the unit tests before `next build`, so a failing test blocks the deploy.

## Database schema

```sql
CREATE TABLE redirects (
  id SERIAL PRIMARY KEY,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  permanent BOOLEAN NOT NULL
);

CREATE TABLE views (
  slug VARCHAR(255) PRIMARY KEY,
  count INT NOT NULL
);
```

## CV

The CV is written in LaTeX under [`cv-source/`](cv-source/), generated from [`data/resume.json`](data/resume.json). The compiled PDF is committed (Vercel doesn't run LaTeX); run `npm run update-cv` locally after editing the source and commit the result.

## License

1. You are free to use this code as inspiration.
2. Please do not copy it directly.
3. Crediting the author is appreciated.
