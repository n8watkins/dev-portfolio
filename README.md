# dev-portfolio

Nathan Watkins' developer portfolio, live at **https://portfolio.n8builds.dev**.

It is the hire-me page: selected projects with their own detail pages, client work, and experience.
The build-in-public workshop (every build, the build log, notes and streams) is a separate site, [n8builds.dev](https://n8builds.dev), and my company is Tech for Pros, a SaaS for service businesses at [techforpros.com](https://techforpros.com); this site leads to both (`lib/sites.ts`).

## What's on it

- **Projects:** an "In progress" card for the AI app I'm building now, then Net-Trailer and Portfolio Rank as big cards with a looping clip of each demo, `/projects` with every project in detail, and a blog-style page per project at `/projects/<slug>`.
- **Building in public:** a teaser under the projects that shows n8builds.dev's builds one at a time, each linking to its live site and its page there.
- **Pages:** the home page (the hero, About with the bento, then projects, experience and contact), `/projects` (every project in detail), `/stack` (the stack by layer, and the dino game) and `/about` (the story in photos).
- **Share cards:** generated at build time (`app/opengraph-image.tsx`), with titles and descriptions kept in one place (`lib/seo.ts`).

## Stack

Next.js 16 (App Router, Turbopack for dev, tests and the production build), React 19, TypeScript, Tailwind CSS 4, Motion 14, Sentry, Google Analytics 4, Cloudflare Web Analytics.
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
| `npm run analyze` | Turbopack bundle analyzer (`next analyze`; no build output) |

Environment variables are optional for local work; see `.env.local.example`.
The site's address is fixed in `lib/seo.ts`, not read from the environment.

## CI and deploys

- **GitHub Actions** (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`: lint, types and a production build, then the Playwright suite in Chromium inside Playwright's own image.
  Docs-only changes skip the build and the browser tests.
  One job, "CI result", sums it up for branch protection.
- **Cloudflare Workers** (through OpenNext) runs the site: `.github/workflows/deploy.yml` deploys every push to `main`; see [`DEPLOY.md`](DEPLOY.md).

## Docs

- [`docs/HANDOFF.md`](docs/HANDOFF.md): current state, decisions, conventions and the backlog.
- [`OWNER-TODO.md`](OWNER-TODO.md): what only the owner can do (DNS, accounts, the resume, decisions).
- [`WEB_VITALS.md`](WEB_VITALS.md): the Web Vitals HUD (Alt+Shift+V in development) and monitoring.
- [`docs/bundle-analysis.md`](docs/bundle-analysis.md): a bundle-size snapshot.

## Use it as a template

The code is MIT licensed (see [LICENSE](LICENSE)): fork it and make it yours.
The photos, screenshots, resume and the copy about me are not covered by the license; replace them with your own.
