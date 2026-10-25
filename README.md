# dev-portfolio

Nathan Watkins' developer portfolio, live at **https://portfolio.n8builds.dev**.

It is the hire-me page: selected projects with their own detail pages, client work, and experience.
The build-in-public workshop (every build, the build log, notes and streams) is a separate site, [n8builds.dev](https://n8builds.dev), and consulting is [Appturnity](https://appturnity.com); this site links to both.

## What's on it

- **Projects:** Echo, Scout, GeminiGPT and Net-Trailer, each as an alternating card with an auto-cycling screenshot and an interactive tech-stack cycler, and a blog-style detail page at `/projects/<slug>`.
- **Building in public:** a bento card that cycles through builds from n8builds.dev (Scribe, TL;DW, Portfolio Rank) with links to their code and live sites.
- **About, experience and contact,** with links out to n8builds.dev and Appturnity.
- **Share cards:** generated at build time (`app/opengraph-image.tsx`), with titles and descriptions kept in one place (`lib/seo.ts`).

## Stack

Next.js 16 (App Router, webpack build), React 19, TypeScript, Tailwind CSS 3.4, Framer Motion 12, Sentry, Google Analytics 4, Vercel Speed Insights.
Dark only.
Inter is bundled (`app/fonts/`), so a build never fetches fonts from Google.

## Run it

```sh
npm ci
npm run dev          # http://localhost:4829
```

| Command | What it does |
|---|---|
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript |
| `npm run build` | Production build |
| `npm test` | Playwright, against a production build on port 4829 (reuses a running server locally) |
| `npm run test:chromium` | The same, Chromium only (what CI runs) |
| `npm run analyze` | Bundle analyzer |

Environment variables are optional for local work; see `.env.local.example`.
The site's address is fixed in `lib/seo.ts`, not read from the environment.

## CI and deploys

- **GitHub Actions** (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`: lint, types and a production build, then the Playwright suite in Chromium inside Playwright's own image.
  Docs-only changes skip the build and the browser tests.
  One job, "CI result", sums it up for branch protection.
- **Vercel** deploys every push to `main` to portfolio.n8builds.dev; pull requests get preview deployments.

## Docs

- [`docs/HANDOFF.md`](docs/HANDOFF.md): current state, decisions, conventions and the backlog.
- [`WEB_VITALS.md`](WEB_VITALS.md): the Web Vitals HUD (Alt+Shift+V in development) and monitoring.
- [`docs/bundle-analysis.md`](docs/bundle-analysis.md): a bundle-size snapshot.

## Use it as a template

The code is MIT licensed (see [LICENSE](LICENSE)): fork it and make it yours.
The photos, screenshots, resume and the copy about me are not covered by the license; replace them with your own.
