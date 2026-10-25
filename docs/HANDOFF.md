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
  No retries: a flaky test gets fixed.
- Specs: `tests/icon-cycle.spec.ts` (the tech-stack cycler), `tests/seo.spec.ts` (titles, share cards, no em dashes, the Scribe card, no Sentry example routes), `tests/web-vitals.spec.ts` (Web Vitals budgets and axe accessibility).
- The site scrolls smoothly (`scroll-smooth` on every element), so a test that scrolls must wait for the scroll to stop before hovering or clicking (`settleScroll` in `icon-cycle.spec.ts`).
- GitHub Actions (`.github/workflows/ci.yml`): lint, types and build, then the Playwright suite in Chromium inside Playwright's Docker image (its version read from `package-lock.json`).
  Docs-only changes skip both.
  "CI result" is the single summary check for branch protection.

## Decisions (do not re-ask)

- **Separate from n8builds.dev, on purpose** (confirmed 2026-10-25): different readers (people hiring vs. people following the work), and a repo people can be sent to on its own.
  It is not a page of n8builds.dev.
- **Featured projects** are Echo, Scout, GeminiGPT and Net-Trailer.
  Scribe and Solara are not featured here (2026-10-25); the "Building in public" card and links send visitors to n8builds.dev for everything else.
- **Titles and share cards** live in `lib/seo.ts`: "Nathan Watkins | AI Full-Stack Developer" for the home page, "<project> - <subtitle> | Nathan Watkins" for project pages, share descriptions of at most 120 characters.
  The share image is generated from `app/opengraph-image.tsx`; there is no saved screenshot to go stale.
- **The site's address is fixed** in `lib/seo.ts` (`https://portfolio.n8builds.dev`), not read from `NEXT_PUBLIC_SITE_URL`: a stale local value once pointed the share cards at an old vercel.app address.
- **No em dashes** in visible copy (`tests/seo.spec.ts` checks), as on n8builds.dev.
- **Inter is bundled** (`app/fonts/`); the share card uses `assets/fonts/*.ttf`.
- **One GA4 property** (`G-JZQGKY9Q37`) covers this site and n8builds.dev; segment by hostname.
  Production only.
- **No reCAPTCHA and no contact form backend**: reCAPTCHA was purged in 2026-06; the contact section links out and shows an email address.

## Live-demo status (OpenPing)

- Echo, Scout and GeminiGPT show a status pill on their cards and pages: Online, Slow, Down, Maintenance or Asleep, with 90-day uptime, linking to https://openping.n8builds.dev/status.
- `app/api/status` reads OpenPing's public feed on the server (it sends no CORS headers) and caches it a minute; `lib/status.ts` maps it; `components/Projects/StatusPill.tsx` shows it.
- A project opts in with `statusName` in `data/projects.tsx` (its monitor's name on the status page).
- OpenPing checks the Render demos on weekdays only. Its feed keeps the last state through off-hours, so a feed older than 30 minutes reads as Asleep (the demos sleep when nothing keeps them awake); a real outage still shows as Down.
- The pill shows nothing until the status arrives or if it can't be read, and its row is reserved so it moves nothing.
- Tests use fixed statuses (`STATUS_FIXTURE=1`, set by `playwright.config.ts`); `npm run test:unit` covers the mapping.

## More builds

A strip under the projects links TubeVault, Piper TTS and OpenPing to their n8builds.dev pages (`components/Projects/MoreBuilds.tsx`); Scribe, TL;DW and Portfolio Rank are already in the "Building in public" card.

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
3. **Sentry's feedback button** (the white megaphone, bottom left) clashes with the dark design; theme it or remove it.
4. **Streaming links** once streaming starts (see Conventions).
5. **Branch protection** on `main` requiring "CI result", once CI has run green on `main`.
6. GeminiGPT placeholder screenshots; the Appturnity "A" monogram; the resume PDF's old portfolio URL (owner).
7. Deferred dependency majors: Tailwind 4, TypeScript 6, `@types/node` 25.

## File map

- `lib/seo.ts`: site address, titles, descriptions, `shareSummary`.
- `app/layout.tsx`: metadata, fonts, GA snippet. `app/opengraph-image.tsx` (+ `twitter-image.tsx`): the share card.
- `components/Projects/ProjectCard.tsx`, `CardImageCarousel.tsx`: alternating project cards.
- `components/Projects/ProjectDetail.tsx`, `app/projects/[slug]/page.tsx`: project detail pages.
- `components/ui/ProjectComponents/iconCycle.tsx`: the tech-stack cycler.
- `components/ui/BentoComponents/CurrentBuildsCarousel.tsx`, `data/grid/items/gridItem6.tsx`: "Building in public".
- `components/sections/Grid.tsx` (About and the bento), `AppturnityCard.tsx`, `Experience.tsx`, `Hero.tsx`.
- `data/projects.tsx`: project copy.
- `components/ErrorBoundary.tsx`, `SectionErrorBoundary.tsx` report to `app/api/health/error`.
