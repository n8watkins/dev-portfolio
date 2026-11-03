# Deploying portfolio.n8builds.dev

The site runs on Cloudflare Workers as the `dev-portfolio` Worker in the owner's Cloudflare account, built by the OpenNext adapter (`@opennextjs/cloudflare`), at https://portfolio.n8builds.dev.
The hostname is a Workers custom domain (`routes` in `wrangler.jsonc`), so Cloudflare creates and manages its DNS record itself; the `workers.dev` address is turned off.

## How it fits together

- `npm run build:worker` runs `next build` (Turbopack) and turns its output into `.open-next/`: the server bundle (`.open-next/worker.js`) and the static assets (`.open-next/assets`).
- `worker/index.js` is the Worker's entry point (`main` in `wrangler.jsonc`).
  It wraps the OpenNext handler with Sentry (`withSentry` from `@sentry/cloudflare`), and sends browsers `max-age=0, must-revalidate` for pages instead of Next's CDN `s-maxage`.
- Files in `public/` and `/_next/static` are served straight from Workers static assets, without the worker.
  `public/_headers` gives them HSTS and the basic security headers, and makes `/_next/static` immutable.
  Pages and API routes get the full set (CSP included) from `lib/security/headers.mjs`.
- `next/image` resizes through the Cloudflare Images binding (`IMAGES`).
- `/api/status` revalidates every minute (ISR), kept in the R2 bucket `dev-portfolio-opennext-cache` with a regional Cache API layer and a Durable Object queue (`DOQueueHandler`) for background revalidation (`open-next.config.ts`).
- The share card (`app/opengraph-image.tsx`) reads its fonts and photo from `public/` through the ASSETS binding (`lib/publicFile.ts`), so it renders on Workers too.
- Cloudflare Web Analytics replaces Vercel Speed Insights (`components/WebAnalytics.tsx`), once `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` is set at build time.

The Worker has no secrets.
The Sentry DSN is public and lives in `lib/sentryDsn.mjs`.
After changing bindings in `wrangler.jsonc`, run `npm run cf-typegen` to update `cloudflare-env.d.ts`.

## Automatic deploys

`.github/workflows/deploy.yml` builds and deploys on every push to `main` (except docs-only changes), and on demand from the Actions tab.
It needs a `CLOUDFLARE_API_TOKEN` repository secret: a Cloudflare API token made from the "Edit Cloudflare Workers" template, limited to the owner's account.
Until that secret exists, the workflow builds and then skips the deploy with a notice.
The Web Analytics token comes from the `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` repository variable.

## Deploy by hand

Log in once with `npx wrangler login` (check with `npx wrangler whoami`).
Run `NEXT_PUBLIC_GA_ID=G-JZQGKY9Q37 npm run deploy` (GA's ID is public and set at build time, as the deploy workflow does), which builds and runs `opennextjs-cloudflare deploy` (it uploads the prerendered pages to R2, then runs `wrangler deploy`).
To check the Worker locally first, run `npm run preview` and open http://localhost:8787.
CI runs `npm run check:deploy` (`wrangler deploy --dry-run`) after an OpenNext build.

## Roll back

Run `npx wrangler deployments list` to see recent deployments, or `npx wrangler versions list` to see versions.
Run `npx wrangler rollback` to return to the previous version, or `npx wrangler rollback <version-id>` for a specific one.
Static assets are versioned with the Worker, so a rollback restores the old pages too.
Fix forward afterwards by reverting the commit and deploying again, so the repository matches what is live.

## Moving portfolio.n8builds.dev over

Attaching the custom domain needed the old Vercel record gone first: `wrangler deploy` refuses a hostname that already has DNS records it doesn't manage.
The owner deleted `portfolio CNAME cname.vercel-dns.com` in the Cloudflare dashboard, then this config was deployed.
The Vercel project stays for a week as a rollback (remove the `routes`, deploy, and re-add the record to point the domain back at it), then is deleted.
The old `nathansportfolio.vercel.app` and `n8sportfolio.vercel.app` addresses go away with the Vercel project.

## Taking it down

Run `npx wrangler delete dev-portfolio`, which also removes any custom domain and its DNS record.
The R2 bucket stays until `npx wrangler r2 bucket delete dev-portfolio-opennext-cache`.
