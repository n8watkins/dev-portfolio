# Owner to-do

Things only the owner can do for the portfolio: accounts, DNS, the resume and a few decisions.
Agents keep this list current; tick an item by changing `[ ]` to `[x]` and adding the date.
No secrets go in this file: keys live in pass-env (entries `dev-portfolio/<NAME>`) and in Vercel or Render, and this file names only the entries.
The cross-project list of keys to rotate is `SECURITY-TODO.md` in the private [secret-handling-review](https://github.com/n8watkins/secret-handling-review/blob/main/SECURITY-TODO.md) repo.
n8builds.dev's own owner list is Part 1 of `docs/NEXT_STEPS.md` in [n8builds-web](https://github.com/n8watkins/n8builds-web/blob/main/docs/NEXT_STEPS.md).

Last checked: 2026-11-08.

## 1. Subdomains for the demos: rank and trailers

- [ ] `rank.n8builds.dev` and `trailers.n8builds.dev` resolve to their apps.

**What.**
Give Portfolio Rank and Net Trailers addresses on n8builds.dev (Echo was retired on 2026-11-08).

**Steps.**

1. Add each domain to its Vercel project (Settings, Domains).
2. In Cloudflare DNS for `n8builds.dev`, add the CNAME record each host shows (DNS only, not proxied, for Vercel).
3. Tell Claude, who then switches the portfolio's project links to the new addresses.

**Why.**
Claude's Cloudflare login can only read DNS, and none of these names resolved on 2026-11-02.

**Unblocks.**
Shorter, branded demo links on the portfolio and on n8builds.dev.

## 2. Fix Render auto-deploy for Scout and GeminiGPT

- [x] Dropped 2026-11-08: Echo, Scout and GeminiGPT were retired (repos private and archived, Render demos down), to be replaced by one new AI app.

## 3. A Gemini key for GeminiGPT

- [x] Dropped 2026-11-08: GeminiGPT was retired (see 2).

## 4. Update the resume

- [ ] The resume names Tech for Pros and links https://portfolio.n8builds.dev.

**What.**
The resume is a Google Drive file (`lib/resume.ts` links to it for the card, the hero and the navbar).

**Steps.**
Rename SiteForge to Tech for Pros, title the role "Full Stack Engineer and AI Consultant" as the Experience section does, replace the old portfolio address with https://portfolio.n8builds.dev, and upload it over the same Drive file (File, Manage versions) so the links keep working.

**Why.**
Only you can edit the file, and it still shows the old names and address.

**Unblocks.**
A resume that matches the site.

## 5. The clinical lab's link

- [x] Decided (2026-11-09): the site is not linked or named by its domain anywhere; Experience describes the client as a clinical lab.

## 6. Decide: keep Sentry's feedback button?

- [ ] Decision given to Claude.

**What.**
Sentry's feedback button is dark and hidden below 768px.

**Steps.**
Tell Claude: keep it (and Claude restyles it to match the site), or remove it.

**Why.**
It is a product choice about inviting feedback from visitors.

**Unblocks.**
Closing backlog item 1 in [docs/HANDOFF.md](docs/HANDOFF.md).

## 7. The streaming service's link

- [x] Decided (2026-11-09): the site is not linked or named by its domain anywhere; Experience describes the client as a streaming service.

## 8. Photos for the About page

- [ ] Pick the portrait, and send three photos for the About page's scenes.

**What.**
The About page (owner, 2026-11-08) uses one portrait and three photo scenes; until the photos arrive, the scenes show placeholders ("Photo to come").

**Steps.**

1. Pick the portrait: the photo (`public/hero/portrait.jpg`, used for now) or the watercolor (`public/hero/portrait-watercolor.jpg`), or send a new one (4:5 portrait, at least 800x1000).
2. Send three landscape photos, 4:3, at least 1200x900:
   - **At work**: you at your desk, or with a client or team.
   - **Los Angeles**: you outdoors somewhere in LA you like.
   - **The setup**: the desk, screens, keyboard and mic you build and stream from.
3. Tell Claude, who adds them to `public/about/` and sets each scene's `src` in `data/about.tsx`.

**Why.**
Only you have these photos.

**Unblocks.**
A finished About page.
