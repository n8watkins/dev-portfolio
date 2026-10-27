# HANDOFF - dev-portfolio

Last updated: 2026-10-25.

## What this is

Nathan Watkins' developer portfolio: the hire-me page, live at https://portfolio.n8builds.dev.
It funnels visitors to the two other sites:

| Site | Job | Repo |
|---|---|---|
| portfolio.n8builds.dev | Developer portfolio (this repo) | `n8watkins/dev-portfolio`, `~/n8builds/dev-portfolio` |
| n8builds.dev | Build-in-public workshop: every build, the build log, notes, streams | `n8watkins/n8builds-web`, `~/n8builds/n8builds-web` |
| appturnity.com | Consulting | separate |

- The repo was renamed from `Portfolio2.0` to `dev-portfolio` on 2026-10-25 (GitHub redirects the old URL), and the folder moved from `~/n8builds/portfolio/portfolio2.0` to `~/n8builds/dev-portfolio`.
- Stack: Next.js 16 (App Router, webpack build), React 19, TypeScript, Tailwind 3.4, Framer Motion 12, Sentry, GA4, Vercel Speed Insights.
  Dark only (`forcedTheme="dark"`), slate + sky-blue.
- Vercel project `portfolio`, git-connected: every push to `main` deploys; pull requests get previews.

## Running and testing

- `npm run dev` serves http://localhost:4829.
- `npm test` runs Playwright against a production build on port 4829 (it builds first, or reuses a server already running there locally).
  `E2E_PORT=4839 npm test` uses another port, so a running `npm run dev` on 4829 is not mistaken for the test build.
  No retries: a flaky test gets fixed.
- Specs: `tests/consent.spec.ts` (the analytics consent banner), `tests/home.spec.ts` (the n8builds card, and the n8builds.dev teaser's links), `tests/projects.spec.ts` (status pills, project rows and pages), `tests/seo.spec.ts` (titles, share cards, no em dashes, no Sentry example routes), `tests/web-vitals.spec.ts` (Web Vitals budgets and axe accessibility).
- The site scrolls smoothly (`scroll-smooth` on every element), so a test that scrolls must wait for the scroll to stop before hovering or clicking.
- GitHub Actions (`.github/workflows/ci.yml`): lint, types and build, then the Playwright suite in Chromium inside Playwright's Docker image (its version read from `package-lock.json`).
  Docs-only changes skip both.
  "CI result" is the single summary check for branch protection.

## Decisions (do not re-ask)

- **Separate from n8builds.dev, on purpose** (confirmed 2026-10-25): different readers (people hiring vs. people following the work), and a repo people can be sent to on its own.
  It is not a page of n8builds.dev.
- **Featured projects** are Echo, Scout, GeminiGPT and Net-Trailer.
  Each is a row after n8builds.dev's Lab (2026-10-26): screenshots with left/right, its icon, tech pills, feature checks, Live demo / Source / Details, all in the app's own colour (`lib/accents.ts`).
  Everything else is in the n8builds.dev teaser under them (see below).
- **Titles and share cards** live in `lib/seo.ts`: "Nathan Watkins | Full-Stack Developer" for the home page (the headline dropped "AI" on 2026-10-26), "<project> - <subtitle> | Nathan Watkins" for project pages, share descriptions of at most 120 characters.
  The share image is generated from `app/opengraph-image.tsx`; there is no saved screenshot to go stale.
- **The site's address is fixed** in `lib/seo.ts` (`https://portfolio.n8builds.dev`), not read from `NEXT_PUBLIC_SITE_URL`: a stale local value once pointed the share cards at an old vercel.app address.
- **No em dashes** in visible copy (`tests/seo.spec.ts` checks), as on n8builds.dev.
- **Inter is bundled** (`app/fonts/`); the share card uses `assets/fonts/*.ttf`.
- **One GA4 property** (`G-JZQGKY9Q37`) covers this site and n8builds.dev; segment by hostname.
  Production only.
- **Analytics consent, the same as n8builds.dev** (2026-10-26): `lib/consent.ts` is a copy of n8builds-web's (keep the two in sync) and `components/consent/` holds the banner.
  Visitors in a European or Quebec time zone are asked first (GA doesn't load until they accept); everyone else gets analytics by default; Global Privacy Control counts as a decline; Consent Mode v2 region defaults (EEA, UK, CH, CA-QC denied) are the backstop.
  The bar's look matches n8builds.dev (owner's call, 2026-10-26): up to 62rem wide, a cookie icon inline with the "Cookies" title, a larger brand-gradient Accept with a check icon on the right, and a smaller but solid, readable Decline (at least 40px tall) on its left; choosing plays a short fade-and-slide exit (instant under reduced motion) and moves focus to the main content or back to "Cookie settings".
  The choice is the `n8-consent` cookie on `.n8builds.dev`, shared with n8builds.dev both ways. "Cookie settings" in the footer reopens the banner; its Privacy link goes to https://n8builds.dev/privacy#cookies (this site has no privacy page).
  Tests use a made-up GA ID (`G-E2ETEST000`) and the America/Los_Angeles time zone (`playwright.config.ts`); `tests/consent.spec.ts` and `tests/unit/consent.test.mts` cover it.
- **The n8builds.dev card sells how the work is built** (2026-10-25): every pull request tested on five browsers, an hourly build log, weekly releases, both sites open source; it links to the case study at n8builds.dev/builds/n8builds.
- **MIT for the code, not the personal content** (2026-10-25): see `LICENSE`; photos, screenshots, the resume and the copy about Nathan stay his.
- **No reCAPTCHA and no contact form backend**: reCAPTCHA was purged in 2026-06; the contact section links out and shows an email address.

## Live-demo status (OpenPing)

- The pill shows the state, not the uptime number: the demos are monitored on weekdays only, on purpose (2026-10-26); a note says they sleep on weekends.
- Echo, Scout and GeminiGPT show a status pill on their cards and pages: "Live demo" and Online, Slow, Down, Maintenance or Asleep, linking to https://openping.n8builds.dev/status.
- `app/api/status` reads OpenPing's public feed on the server (it sends no CORS headers) and caches it a minute; `lib/status.ts` maps it; `components/Projects/StatusPill.tsx` shows it.
- A project opts in with `statusName` in `data/projects.tsx` (its monitor's name on the status page).
- OpenPing checks the Render demos on weekdays only. Its feed keeps the last state through off-hours, so a feed older than 30 minutes reads as Asleep (the demos sleep when nothing keeps them awake); a real outage still shows as Down.
- The pill shows nothing until the status arrives or if it can't be read, and its row is reserved so it moves nothing.
- Tests use fixed statuses (`STATUS_FIXTURE=1`, set by `playwright.config.ts`); `npm run test:unit` covers the mapping.

## The n8builds.dev teaser

Under the projects, `components/Projects/BuildsTeaser.tsx` shows n8builds.dev's builds one at a time (Scribe, OpenPing, Solara, Portfolio Rank, TubeVault, Piper TTS, TL;DW), each with its real icon (`public/builds/<slug>/`), its accent, a Live site link when it has one and "See the build" on n8builds.dev (owner, 2026-10-26; it replaced the "Building in public" bento card and the More builds strip).

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`...).
  Never add an agent co-author trailer.
- Work on a branch and open a pull request, so CI runs before `main` deploys.
- Dev server: kill by port (`lsof -t -i:4829 | xargs -r kill`); `pkill -f <pattern>` matches its own shell.
- Social handles: GitHub, X and LinkedIn are `n8watkins`.
  Streaming links (Twitch, YouTube) get settled when streaming starts; n8builds.dev links `twitch.tv/n8watkins` while this site links `twitch.tv/n8builds` and `youtube.com/@n8builds`.

## Backlog

1. **Adopt release-kit** (https://github.com/n8watkins/release-kit) for commit checks and releases; the owner applies it.
2. **Lint warnings:** 9 React Compiler warnings in `FloatingNav.tsx`, `grid-pattern.tsx`, `MapAnimations.tsx`, `BentoGrid.tsx` and `background-gradient-animation.tsx` (refs read during render, setState in effects, variables used before declaration).
   Then make CI fail on warnings.
3. **Sentry's feedback button** is dark and hidden below 768px; decide whether to keep it at all.
4. **Streaming links** once streaming starts (see Conventions).
5. **Branch protection** on `main` requiring "CI result", once CI has run green on `main`.
6. GeminiGPT placeholder screenshots; the Appturnity "A" monogram; the resume PDF's old portfolio URL (owner).
7. Deferred dependency majors: Tailwind 4, TypeScript 6, `@types/node` 25.

## File map

- `lib/seo.ts`: site address, titles, descriptions, `shareSummary`.
- `app/layout.tsx`: metadata, fonts, GA snippet. `app/opengraph-image.tsx` (+ `twitter-image.tsx`): the share card.
- `components/Projects/ProjectCard.tsx`, `ProjectGallery.tsx`, `lib/accents.ts`: the project rows.
- `components/Projects/ProjectDetail.tsx`, `app/projects/[slug]/page.tsx`: project detail pages.
- `components/Projects/BuildsTeaser.tsx`: the n8builds.dev teaser. `components/sections/HeroGrid.tsx`: the hero grid (from n8builds.dev).
- `components/sections/Grid.tsx` (About and the bento), `AppturnityCard.tsx`, `Experience.tsx`, `Hero.tsx`.
- `data/projects.tsx`: project copy.
- `components/ErrorBoundary.tsx`, `SectionErrorBoundary.tsx` report to `app/api/health/error`.
