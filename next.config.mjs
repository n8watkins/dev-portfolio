import { withSentryConfig } from '@sentry/nextjs/config'
import { securityHeaders } from './lib/security/headers.mjs'
import { SENTRY_DSN } from './lib/sentryDsn.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours for better caching
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    dangerouslyAllowSVG: true, // Enable SVG support for icons
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Ensure optimization is enabled
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  compiler: {
    // Tree-shake the Sentry SDK's debug logging out of every bundle. Sentry's own
    // option for this (webpack.treeshake.removeDebugLogging) reaches webpack
    // builds only; Turbopack and webpack both inline this define.
    define: { __SENTRY_DEBUG__: false },
  },
  // Resource optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'motion/react',
      'react-icons',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-icons',
    ],
  },
  // Redirect common routes to home page
  async redirects() {
    return [
      // The old vercel.app addresses → the real domain (keeps the path). Only
      // fires for those hosts; portfolio.n8builds.dev and preview deploys are
      // unaffected.
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?:n8s|nathans)portfolio\\.vercel\\.app' }],
        destination: 'https://portfolio.n8builds.dev/:path*',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/',
        permanent: false,
      },
      // Echo, Scout and GeminiGPT were retired on 2026-11-08; Wren replaces
      // them, so their old pages land on Wren's instead of a 404.
      {
        source: '/projects/:slug(echo|scout|geminigpt)',
        destination: '/projects/wren',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/portfolio/:path*',
        destination: '/',
        permanent: false,
      },
    ]
  },
  // Security headers, including the CSP (lib/security/headers.mjs)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({
          dev: process.env.NODE_ENV !== 'production',
          sentryDsn: SENTRY_DSN,
        }),
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'nathan-watkins',
  project: 'portfolio',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Disable telemetry to reduce build warnings
  telemetry: false,

  // Auth token from environment variable (optional - only needed for source map uploads)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: '/monitoring',

  // Delete source maps after upload to prevent serving them to users
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
})
