import Script from 'next/script'

/**
 * Cloudflare Web Analytics: a cookie-free page view and page speed count
 * (Core Web Vitals), as Speed Insights measured it on Vercel. It keeps no
 * visitor identifier, so it loads outside the consent banner.
 * https://developers.cloudflare.com/web-analytics/
 *
 * The site's token (public, it ships in the page) comes from the Web
 * Analytics site in the Cloudflare dashboard and is set at build time by the
 * deploy (DEPLOY.md). Builds without it (local, CI, tests) load nothing.
 */
export function WebAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN
  if (!token) return null
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  )
}
