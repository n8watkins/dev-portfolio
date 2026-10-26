import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from './provider'
import Script from 'next/script'
import ErrorBoundary from '@/components/ErrorBoundary'
import { WebVitals } from './web-vitals'
import { WebVitalsHUD } from '@/components/WebVitalsHUD'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SITE_DESCRIPTION, SITE_NAME, SITE_SHARE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/seo'

// Inter, bundled (variable weight, Latin subset, from @fontsource-variable/inter
// 5.3.0; OFL, see app/fonts/Inter-OFL.txt) instead of next/font/google, so a
// build never depends on Google Fonts answering (as on n8builds.dev).
const inter = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

// One title and description, shared by search results and share cards. The
// share image is app/opengraph-image.tsx (and twitter-image.tsx).
export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ['AI Developer', 'Full-Stack Developer', 'Portfolio', 'Next.js', 'React', 'Nathan Watkins', 'AI Integration', 'Automation'],
  robots: 'index, follow',
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_SHARE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_SHARE_DESCRIPTION,
    creator: '@n8watkins',
  },
  icons: {
    // A small favicon: the 512px one (89 KB) was fetched early and slowed the portrait on phones.
    icon: [{ url: '/tab/n8-icon-96.png', sizes: '96x96', type: 'image/png' }],
    apple: '/tab/apple-icon.png',
  },
  metadataBase: new URL(SITE_URL),
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="UaCoLg9YeNobXjRaOb59YzQxzc8RDb1yiOZEKdmNECU" />

        {/* Preconnect and DNS prefetching for external domains */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Project external links */}
        <link rel="dns-prefetch" href="//github.com" />
        <link rel="dns-prefetch" href="//web.app" />
        <link rel="dns-prefetch" href="//vercel.app" />
        <link rel="dns-prefetch" href="//firebase.google.com" />

        {/* Only where an ID is set (production); otherwise it would load gtag.js?id=undefined. */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-sky-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <WebVitals />
          <WebVitalsHUD />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
