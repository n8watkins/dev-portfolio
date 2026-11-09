# HANDOFF - dev-portfolio

Last updated: 2026-11-08.

## Current state and open work (2026-10-27): start here

### State

- `main` matches n8builds.dev's copy (audit fixes #12) and its dino game files are byte-identical (`npm run check:sync`); dino stats post to `https://n8builds.dev/api/game` (#14).
- **Production is behind `main`.** It's stuck at #10: #11 to #14 merged while Vercel's 100-deployments-per-24-hours limit was hit, so no production deploy was made for them.
- Vercel builds on Node 24.x; `nathansportfolio.vercel.app` and `n8sportfolio.vercel.app` redirect here (#9).
- Echo, Scout and GeminiGPT were retired on 2026-11-08 (owner): their repos went private and archived, and their Render demos came down. One new AI app, not yet named, will replace them; until it ships, an "In progress" card stands in (see "Featured projects").
- OpenPing has a bug: during scheduled off-hours its public feed reports monitors as "operational" (fix tracked in open-ping, `docs/BUG-public-scheduled-off.md`). This site already works around it: a feed older than 30 minutes reads as Asleep (see "Live-demo status" below). Once OpenPing reports `scheduled_off`, check `lib/status.ts` maps it to Asleep.

### Next

1. When the new AI app ships, replace `inProgress` in `data/projects.tsx` with its regular project entry (first in the list), and give it a `statusName` if OpenPing monitors it.
2. Keep the shared files in sync with n8builds-web after any change there (`npm run check:sync`): the dino, the marquee and its tiles, and the tile list `data/stack.tsx` (edit it in n8builds-web, then copy it here).

### Blocked on the owner

The owner's open steps (the rank and trailers subdomains, the resume, Lifeline's certificate, the Sentry button, the parked primeshows.live link) are in [../OWNER-TODO.md](../OWNER-TODO.md); keep that file current instead of listing them here.

## What this is

Nathan Watkins' developer portfolio: the hire-me page, live at https://portfolio.n8builds.dev.
It funnels visitors to the two other sites:

| Site | Job | Repo |
|---|---|---|
| portfolio.n8builds.dev | Developer portfolio (this repo) | `n8watkins/dev-portfolio`, `~/n8builds/dev-portfolio` |
| n8builds.dev | Build-in-public workshop: every build, the build log, notes, streams | `n8watkins/n8builds-web`, `~/n8builds/n8builds-web` |
| techforpros.com | Tech for Pros, my SaaS for service businesses | separate |

- The repo was renamed from `Portfolio2.0` to `dev-portfolio` on 2026-10-25 (GitHub redirects the old URL), and the folder moved from `~/n8builds/portfolio/portfolio2.0` to `~/n8builds/dev-portfolio`.
- Stack: Next.js 16 (App Router, Turbopack for dev, tests and the production build), React 19, TypeScript, Tailwind 4, Motion 14, Sentry, GA4, Cloudflare Web Analytics.
  Dark only (`forcedTheme="dark"`), slate + sky-blue.
- Runs on Cloudflare Workers (the `dev-portfolio` Worker, built by OpenNext; `DEPLOY.md`), deploying from `main`, at https://portfolio.n8builds.dev (owner, 2026-11-03: Vercel is dropped entirely).
  The Vercel project `portfolio` no longer deploys (`vercel.json`) and stays a week as a rollback.

## Running and testing

- `npm run dev` serves http://localhost:4829.
- `npm test` runs Playwright against a production build on port 4829 (it builds first, or reuses a server already running there locally).
  `E2E_PORT=4839 npm test` uses another port, so a running `npm run dev` on 4829 is not mistaken for the test build.
  No retries: a flaky test gets fixed.
- Specs: `tests/consent.spec.ts` (the analytics consent banner), `tests/dino.spec.ts` (the dino game on /stack: n8builds.dev's dino tests, kept in step with its `tests/e2e/ai-kit.spec.ts`), `tests/dino-music.spec.ts` (the dino game's music toggle and its sound checked offline, never out loud: n8builds.dev's `tests/e2e/dino-music.spec.ts`), `tests/home.spec.ts` (the footer cards, the n8builds.dev card's links, the map arcs, Experience), `tests/about.spec.ts` (the About page, the nav from subpages, the sitemap), `tests/stack.spec.ts` (the stack card's link, /stack and its play area), `tests/projects.spec.ts` (the project cards, /projects and the project pages, the in-progress card, the retired apps' redirects, the status API), `tests/seo.spec.ts` (titles, share cards, no em dashes, no Sentry example routes), `tests/web-vitals.spec.ts` (Web Vitals budgets and axe accessibility).
- The site scrolls smoothly (`scroll-smooth` on every element), so a test that scrolls must wait for the scroll to stop before hovering or clicking.
- GitHub Actions (`.github/workflows/ci.yml`): lint, types and build, then the Playwright suite on the same five browsers as n8builds.dev (chromium, firefox, webkit, mobile-chrome, mobile-safari) inside Playwright's Docker image (its version read from `package-lock.json`).
  WebKit and mobile Safari each run as two shards with one worker: they have no GPU in CI, so their frames come slowly (about 10 fps on this page), and competing workers make that worse.
  Docs-only changes skip both.
  "CI result" is the single summary check for branch protection.
- To kill a local test server, find it by port (`ss -ltnp | grep :4829`) and kill that PID: `lsof` can miss it, and `pkill -f` matches its own shell.

## Decisions (do not re-ask)

- **Turbopack everywhere** (owner, 2026-11-01): `next dev`, the Playwright build and the production build all run on Turbopack; see AGENTS.md for the rules and why nothing here needs webpack.

- **Separate from n8builds.dev, on purpose** (confirmed 2026-10-25): different readers (people hiring vs. people following the work), and a repo people can be sent to on its own.
  It is not a page of n8builds.dev.
- **Featured projects** (owner, 2026-11-08): the new AI app's "In progress" card first, then Net-Trailer and Portfolio Rank, then the n8builds.dev teaser.
  The "In progress" card (`inProgress` in `data/projects.tsx`, `components/Projects/InProgressCard.tsx`) has a neutral label ("New AI app - in progress"), one sentence on what it will do, three chips, and no name, links or screenshots; the real project row replaces it when the app ships.
  Echo, Scout and GeminiGPT were retired that day: their pages, screenshots and status wiring are gone, and `/projects/echo|scout|geminigpt` redirect (308) to `/#projects` (`next.config.mjs`), since n8builds.dev and old shares link them.
  Portfolio Rank moved here from n8builds.dev's featured rows: its card credits Emma Bostian's developer-portfolios list, and its page credits her and Ali Spittel and invites visitors to vote and add their portfolio.
  On the home page each is one big, full-width card (see "The layout" below); `/projects` shows every project at full size; `/projects/<slug>` tells its full story. Colours per app in `lib/accents.ts`.
- **No "Message me" in the top bar** (owner, 2026-11-08, after trying it): contact is in the nav and the footer; the top right is the resume only.
- **Titles and share cards** live in `lib/seo.ts`: "Nathan Watkins | Full-Stack Developer" for the home page (the headline dropped "AI" on 2026-10-26), "<project> - <subtitle> | Nathan Watkins" for project pages, share descriptions of at most 120 characters.
  The share image is generated from `app/opengraph-image.tsx`; there is no saved screenshot to go stale.
- **The site's address is fixed** in `lib/seo.ts` (`https://portfolio.n8builds.dev`), not read from `NEXT_PUBLIC_SITE_URL`: a stale local value once pointed the share cards at an old vercel.app address.
- **No em dashes** in visible copy (`tests/seo.spec.ts` checks), as on n8builds.dev.
- **Inter is bundled** (`app/fonts/`); the share card uses `public/og/*.ttf`, read through `lib/publicFile.ts`.
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
- **Tailwind 4, as n8builds.dev** (2026-10-28): the theme lives in `app/globals.css` (`@theme`; there is no `tailwind.config.ts`), with `tailwindcss-animated` imported and `tailwindcss-animate` as a `@plugin`.
  Animations whose value reads an element's own variable (`--duration`) sit in `@theme inline`, or the marquees stop.
  Tailwind 4 lets `leading-*` win over a responsive `md:text-*`, so where both are set the size carries its v3 line height (`md:text-lg/7`).
  It also brought Tailwind 4's OKLCH colours (slightly more vivid), oklab gradients and its `font-sans` stack, the same as n8builds.dev.
- **The brand mark is the lowercase "n8"** (owner, 2026-11-01), as on n8builds.dev: a white "n" flowing into a blue "8", replacing the N8 neon icon.
  The master is `public/brand/n8-mark.png`; `node scripts/gen-brand-icons.mjs` makes the favicon, Apple and 512px icons in `public/tab/` from it (the mark on a dark navy rounded tile).
  The corner link to n8builds.dev shows the mark on its own; the admin dashboard still has the old N8 mark.

## The layout (owner, 2026-11-08)

The owner picked layout B (a work-first home page plus detail pages) over A (one long page) and asked for this rework, bringing in A's visuals.

- **Home** (owner's review, 2026-11-08): the hero, About (the intro, then the bento exactly as before: Ready to relocate, the tech stack card with the dino, the resume card, "Have a project? Let's connect"), Projects, Experience, Contact.
  About on the home page is a short intro (two sentences, owner's round 3) ending in "More about me" (to `/about`), where the full story lives; the tech stack card has "See my stack" (to `/stack`).
  `/projects` and the project pages lead "Back to home" (`components/Projects/BackToHome.tsx`, to the top of `/`).
  The nav (on every page) jumps to these sections; on other pages it goes home first (`subpageNavItems` in `data/navigation.tsx`). The detail pages are reached from the sections.
- **Hero terminal**: two lines, "I build AI products end to end." and "Open to full-time, part-time or contract roles.", with no "$" prompt line; a blinking block cursor stays at the end of the last line, in the typing caret's own box (`.whoami-cursor`).
- **Projects**: the "In progress" card, then each project as a big, full-width card (`components/Projects/ProjectShowcase.tsx`): its looping clip (or first screenshot) across the top, wide and short (16:9 on phones, 21:9 from 768px), then icon, name, a sentence or two, a "What's interesting" line (`highlight`), Live demo and Full story. "Detailed view" (right of the heading) opens `/projects` (`components/ProjectsPage.tsx`, `ProjectFull.tsx`): every screenshot, the whole description, features, tech, and Live demo / Source / Full story.
  The n8builds.dev card comes after them: "n8builds.dev" on top as a heading that is plainly a link (underlined, an arrow, a hover state), "See more of my selected work" under it, then its builds one at a time, its featured ones first.
  OpenPing and Solara show the product in use: n8builds.dev's own build-page clips (`public/builds/<slug>/clip.mp4` and `clip-poster.webp`, recorded by n8builds-web's `scripts/product-clips/`), played by `ProjectClip`; the others keep their screenshots. Re-copy the clips when n8builds-web re-records them.
- **Clips** (from layout A): `clip` in `data/projects.tsx`, files in `public/projects/clips/` (about 7 seconds, about 200 KB, H.264 MP4 and a WebP poster), played by `components/Projects/ProjectClip.tsx`: loaded only near the screen, paused off screen, the poster under reduced motion, a pause button.
  Record one with Playwright's `recordVideo` at 1280x800, then trim, speed up and encode with ffmpeg to 960x600 at 24 fps (`libx264 -crf 30 -preset slow -movflags +faststart`, no audio).
  Net-Trailer's clip predates its rebrand (n8watkins/net_trailers#20) and shows browsing (its AI search answered "API key not valid" on 2026-11-08): re-record it once that lands.
- **Experience** stays on the home page, compact: title, company and dates per role, with "What I did" under them on the left. The whole role header is one button (a stretched `[data-role-toggle]` over it, with a clear hover and focus ring) that opens what I did in place, easing open (row height and opacity, 350ms; instant under reduced motion); "Expand all" on the right opens every role.
  Hovering a role (desktop) fades in a small glimpse of its site on the right (its first `visuals` image), as the old hover image did; it steps aside once the role is open.
  Only Tech for Pros links out (with a link icon); every other company is plain text, and no client sites are linked. A role's small screenshots (`visuals` in `data/experience.tsx`, pictures only) show when it is opened.
- **Stack**: the home page's tech stack card (in the bento, with the dino as before) has "See my stack" to `/stack` (`components/StackPage.tsx`): the dino game as a full-width play area (30rem tall on phones), then every tool by layer with its one-line reason (`data/stackLayers.ts` sorts `data/stack.tsx`'s tiles by name; that file stays byte-identical with n8builds-web).
  The resume stays the header button too.
- **About** (`/about`, `components/AboutPage.tsx`) is only about the owner: one portrait (the photo, until the owner picks), then the story in three photo scenes (at work, Los Angeles, the setup) from `data/about.tsx`, with stickers drifting around them (`components/about/Decals.tsx`, `.decal` in `app/globals.css`: still under reduced motion, paused off screen, absolute so nothing shifts).
  The scene photos are placeholders until the owner sends them (OWNER-TODO item 8): set `src` in `data/about.tsx`.
  It ends with three ways on (owner, round 3): "Continue where you were" (only when the visitor came from the home page: the home page remembers the section at the top of the screen and the offset into it whenever a link to /about is clicked, and restores it; `lib/returnTo.ts`, session storage), "See my experience" (`/#experience`) and "Back to the top of the home page".
  `/about`, `/projects` and `/stack` have the scroll-to-top button too.
- **Footer** on every page (`components/layout/Footer.tsx`): the contact card, whose border carries a slow light around it (`.contact-glow`, still under reduced motion, paused off screen), the hero's two cards (n8builds.dev, Tech for Pros), and a site map (home sections, the pages, Resume, my sites).
- The workshop section (the big Tech for Pros and n8builds.dev pitches) is gone, and so is the compact project-page footer.
- The dino tests run on `/stack` (`STACK_PAGE` in `tests/dino.spec.ts` and `tests/dino-music.spec.ts`); n8builds-web's copies run on its home page.

## Tech for Pros (owner, 2026-11-01)

- Tech for Pros (techforpros.com), my SaaS for service businesses, is where I work now: the hero card ("Where I work"), the footer's card, the Experience entry, About and the footer name techforpros.com and link to it.
- Its mark (a worker in a cap holding a blue gear) is `public/brand/techforpros-icon.webp`, shown on a light tile by `components/ui/SiteIcon.tsx`; `lib/sites.ts` holds both sites' names, URLs and marks.
- Appturnity appears only as a past role in Experience (Full Stack Developer, March 2023 to June 2026, with its client sites' screenshots, no links) and is never linked; About describes those years as building client apps at a consulting firm, without naming it. `tests/home.spec.ts` checks both.
- The footer's site-map column "My sites" lists both sites with their marks, and the footer ends with "Built in public at n8builds.dev" (`components/ui/BuiltInPublic.tsx`).
- Tech for Pros' Experience entry shows the landscaping template until Tech for Pros has its own screenshots.

## The 2026-10-27 refresh (owner's calls)

- The hero's two cards (n8builds.dev, Tech for Pros since 2026-11-01) live in `components/ui/SiteDoors.tsx` and repeat in the footer, beside a site map.
- Projects show four AI features each; Net-Trailer has no payments copy; screenshots glow in the project's colour on hover (no zoom) and their dots are buttons.
- Contact: the address, LinkedIn and X, then "Or message me through n8builds.dev" (its contact form).
- The tech stack panel (now on `/stack`) shows the same tiles as n8builds.dev's AI kit (`data/stack.tsx`, shared byte for byte), in two rows here: the AI kit, then the dev stack (three rows there) (owner, 2026-10-29).
  Hovering a tile shows what it is for, a tap does on phones, and a mouse click does nothing (only hovering pauses a row).
  Row loop times come from the tile count (`rowDuration`), so every row moves at the same pace.
  The dino and its 30-second catch game are byte-identical with n8builds.dev's. So is its optional music ("Desert Run", a toggle in the card's top right corner, off by default, never autoplayed).
- Twitch and YouTube stay hidden until streaming starts (`STREAMING` in `components/layout/Footer.tsx`).

## Live-demo status (OpenPing)

- The pill shows the state, not the uptime number: the demos are monitored on weekdays only, on purpose (2026-10-26); a note says they sleep on weekends.
- No project on the site is monitored since Echo, Scout and GeminiGPT were retired (2026-11-08); the wiring stays for the new AI app.
  A project with a `statusName` shows a status pill on its card and page: "Live demo" and Online, Slow, Down, Maintenance or Asleep, linking to https://openping.n8builds.dev/status, and the projects intro shows the weekday note.
- `app/api/status` reads OpenPing's public feed on the server (it sends no CORS headers) and caches it a minute; `lib/status.ts` maps it; `components/Projects/StatusPill.tsx` shows it.
- A project opts in with `statusName` in `data/projects.tsx` (its monitor's name on the status page).
- OpenPing checks the Render demos on weekdays only. Its feed keeps the last state through off-hours, so a feed older than 30 minutes reads as Asleep (the demos sleep when nothing keeps them awake); a real outage still shows as Down.
- The pill shows nothing until the status arrives or if it can't be read, and its row is reserved so it moves nothing.
- Tests use fixed statuses (`STATUS_FIXTURE=1`, set by `playwright.config.ts`, named "Demo Up", "Demo Asleep" and "Demo Down"); `npm run test:unit` covers the mapping.

## The n8builds.dev teaser

Under the projects, `components/Projects/BuildsTeaser.tsx` shows n8builds.dev's builds one at a time (Scribe, OpenPing, Solara, TubeVault, Piper TTS, TL;DW; Portfolio Rank left it for the project rows on 2026-11-08), each with its real icon (`public/builds/<slug>/`), its accent, a Live site link when it has one and "See the build" on n8builds.dev (owner, 2026-10-26; it replaced the "Building in public" bento card and the More builds strip).

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`...).
  Never add an agent co-author trailer.
- Work on a branch and open a pull request, so CI runs before `main` deploys.
- Dev server: kill by port (`lsof -t -i:4829 | xargs -r kill`); `pkill -f <pattern>` matches its own shell.
- Social handles: GitHub, X and LinkedIn are `n8watkins`.
  Streaming links (Twitch, YouTube) get settled when streaming starts; n8builds.dev links `twitch.tv/n8watkins` while this site links `twitch.tv/n8builds` and `youtube.com/@n8builds`.

## Backlog

1. **Sentry's feedback button** is dark and hidden below 768px; decide whether to keep it at all.
2. **Streaming links** once streaming starts (see Conventions).
3. Tech for Pros' own screenshots (its Experience entry shows the landscaping template for now); the About page's photos and portrait choice; the resume PDF's old portfolio URL (owner).
4. Deferred dependency major: TypeScript 6.

## File map

- `lib/seo.ts`: site address, titles, descriptions, `shareSummary`.
- `app/layout.tsx`: metadata, fonts, GA snippet. `app/opengraph-image.tsx` (+ `twitter-image.tsx`): the share card.
- `components/Projects/ProjectShowcase.tsx` (home cards), `ProjectFull.tsx` (/projects), `ProjectClip.tsx`, `ProjectGallery.tsx`, `InProgressCard.tsx`, `lib/accents.ts`.
- `components/Projects/ProjectDetail.tsx`, `app/projects/[slug]/page.tsx`: project detail pages.
- `components/Projects/BuildsTeaser.tsx`: the n8builds.dev teaser. `components/sections/HeroGrid.tsx`: the hero grid (from n8builds.dev).
- `components/sections/AboutTeaser.tsx`, `StackRow.tsx`, `Experience.tsx`, `Hero.tsx`; the pages `components/ProjectsPage.tsx`, `StackPage.tsx`, `AboutPage.tsx` (with `components/about/Decals.tsx`).
- `data/projects.tsx`, `data/experience.tsx`, `data/about.tsx`, `data/stackLayers.ts`, `data/navigation.tsx`.
- `data/projects.tsx`: project copy.
- `components/ErrorBoundary.tsx`, `SectionErrorBoundary.tsx` report to Sentry.
