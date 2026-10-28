import { withSentryConfig } from '@sentry/nextjs/config'
import bundleAnalyzer from '@next/bundle-analyzer'
import { securityHeaders } from './lib/security/headers.mjs'
import { SENTRY_DSN } from './lib/sentryDsn.mjs'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

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
  // Bundle analyzer configuration moved to withBundleAnalyzer wrapper below
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
        source: '/about',
        destination: '/',
        permanent: false,
      },
      {
        source: '/contact',
        destination: '/',
        permanent: false,
      },
      {
        source: '/projects',
        destination: '/',
        permanent: false,
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
          preview: process.env.VERCEL_ENV === 'preview',
          sentryDsn: SENTRY_DSN,
        }),
      },
    ]
  },
}

export default withBundleAnalyzer(withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'nathan-watkins',
  project: 'javascript-nextjs',

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

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-specific options (moved under `webpack` in @sentry/nextjs v10).
  webpack: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See: https://docs.sentry.io/product/crons/ and https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },

  // Delete source maps after upload to prevent serving them to users
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
}))
