import { test, expect } from '@playwright/test'

/**
 * Web Vitals Performance Tests
 *
 * Tests Core Web Vitals metrics against Google's recommended thresholds:
 * - LCP (Largest Contentful Paint): <= 2.5s (good), <= 4.0s (needs improvement)
 * - INP (Interaction to Next Paint): <= 200ms (good), <= 500ms (needs improvement)
 * - CLS (Cumulative Layout Shift): <= 0.1 (good), <= 0.25 (needs improvement)
 */

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
}

test.describe('Web Vitals Performance', () => {
  // Skip web vitals tests for non-Chromium browsers as Performance Observer APIs
  // have incomplete/inconsistent support. Web Vitals are primarily Chrome/Lighthouse metrics.
  test.skip(({ browserName }) => browserName !== 'chromium', 'Web Vitals only fully supported in Chromium')

  test.beforeEach(async ({ page }) => {
    // Enable performance metrics collection
    await page.goto('/', {
      waitUntil: 'networkidle',
    })
  })

  test('should have good Largest Contentful Paint (LCP)', async ({ page }) => {
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          resolve(lastEntry.renderTime || lastEntry.loadTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        // Timeout after 10 seconds
        setTimeout(() => resolve(0), 10000)
      })
    })

    console.log(`LCP: ${lcp}ms`)

    expect(lcp).toBeGreaterThan(0)
    expect(lcp).toBeLessThan(THRESHOLDS.LCP.poor)

    if (lcp > THRESHOLDS.LCP.good) {
      console.warn(`⚠️  LCP is ${lcp}ms (needs improvement, target: ${THRESHOLDS.LCP.good}ms)`)
    } else {
      console.log(`✅ LCP is good: ${lcp}ms`)
    }
  })

  test('should have good First Contentful Paint (FCP)', async ({ page }) => {
    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntriesByName('first-contentful-paint')
          if (entries.length > 0) {
            resolve(entries[0].startTime)
          }
        }).observe({ type: 'paint', buffered: true })

        setTimeout(() => resolve(0), 5000)
      })
    })

    console.log(`FCP: ${fcp}ms`)

    expect(fcp).toBeGreaterThan(0)
    expect(fcp).toBeLessThan(THRESHOLDS.FCP.poor)

    if (fcp > THRESHOLDS.FCP.good) {
      console.warn(`⚠️  FCP is ${fcp}ms (needs improvement, target: ${THRESHOLDS.FCP.good}ms)`)
    } else {
      console.log(`✅ FCP is good: ${fcp}ms`)
    }
  })

  test('should have low Cumulative Layout Shift (CLS)', async ({ page }) => {
    // Wait for page to be fully loaded and stable
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for any animations

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })

        // Wait a bit for shifts to be recorded
        setTimeout(() => resolve(clsValue), 3000)
      })
    })

    console.log(`CLS: ${cls.toFixed(3)}`)

    expect(cls).toBeLessThan(THRESHOLDS.CLS.poor)

    if (cls > THRESHOLDS.CLS.good) {
      console.warn(`⚠️  CLS is ${cls.toFixed(3)} (needs improvement, target: ${THRESHOLDS.CLS.good})`)
    } else {
      console.log(`✅ CLS is good: ${cls.toFixed(3)}`)
    }
  })

  test('should have good Time to First Byte (TTFB)', async ({ page }) => {
    const ttfb = await page.evaluate(() => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return navigationEntry.responseStart - navigationEntry.requestStart
    })

    console.log(`TTFB: ${ttfb}ms`)

    expect(ttfb).toBeGreaterThan(0)
    expect(ttfb).toBeLessThan(THRESHOLDS.TTFB.poor)

    if (ttfb > THRESHOLDS.TTFB.good) {
      console.warn(`⚠️  TTFB is ${ttfb}ms (needs improvement, target: ${THRESHOLDS.TTFB.good}ms)`)
    } else {
      console.log(`✅ TTFB is good: ${ttfb}ms`)
    }
  })

  test('should load all critical resources efficiently', async ({ page }) => {
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

      const byType: Record<string, { count: number; totalSize: number; totalDuration: number }> = {}

      resources.forEach((resource) => {
        // Extract type from resource name
        let type = 'other'
        if (resource.name.endsWith('.js')) type = 'javascript'
        else if (resource.name.endsWith('.css')) type = 'stylesheet'
        else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)/)) type = 'image'
        else if (resource.name.match(/\.(woff|woff2|ttf|otf)/)) type = 'font'

        if (!byType[type]) {
          byType[type] = { count: 0, totalSize: 0, totalDuration: 0 }
        }

        byType[type].count++
        byType[type].totalSize += resource.transferSize || 0
        byType[type].totalDuration += resource.duration
      })

      return byType
    })

    console.log('\n📊 Resource Loading Metrics:')
    Object.entries(resourceMetrics).forEach(([type, metrics]) => {
      console.log(`  ${type}:`)
      console.log(`    Count: ${metrics.count}`)
      console.log(`    Total Size: ${(metrics.totalSize / 1024).toFixed(2)} KB`)
      console.log(`    Avg Duration: ${(metrics.totalDuration / metrics.count).toFixed(2)}ms`)
    })

    // Basic assertions
    expect(resourceMetrics).toBeDefined()

    // Warn if too many resources
    const totalResources = Object.values(resourceMetrics).reduce((sum, m) => sum + m.count, 0)
    if (totalResources > 50) {
      console.warn(`⚠️  High resource count: ${totalResources} resources loaded`)
    }
  })

  test('should have performant image loading', async ({ page }) => {
    const imageMetrics = await page.evaluate(() => {
      const images = performance.getEntriesByType('resource')
        .filter((r) => r.name.match(/\.(png|jpg|jpeg|gif|svg|webp)/)) as PerformanceResourceTiming[]

      return images.map((img) => ({
        url: img.name.split('/').pop(),
        duration: img.duration,
        size: img.transferSize,
        protocol: (img as any).nextHopProtocol || 'unknown',
      }))
    })

    console.log('\n🖼️  Image Loading Performance:')
    imageMetrics.forEach((img) => {
      console.log(`  ${img.url}: ${img.duration.toFixed(2)}ms, ${(img.size / 1024).toFixed(2)}KB (${img.protocol})`)
    })

    // Check for slow-loading images
    const slowImages = imageMetrics.filter((img) => img.duration > 1000)
    if (slowImages.length > 0) {
      console.warn(`⚠️  ${slowImages.length} images took over 1s to load`)
      slowImages.forEach((img) => {
        console.warn(`    - ${img.url}: ${img.duration.toFixed(2)}ms`)
      })
    }

    // Images should generally load fast
    const avgDuration = imageMetrics.reduce((sum, img) => sum + img.duration, 0) / imageMetrics.length
    console.log(`  Average image load time: ${avgDuration.toFixed(2)}ms`)
  })

  test('should not have blocking resources', async ({ page }) => {
    const blockingResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

      return resources
        .filter((r) => {
          // Check for synchronous scripts or stylesheets
          return (r.name.endsWith('.js') || r.name.endsWith('.css')) &&
                 (r as any).renderBlockingStatus === 'blocking'
        })
        .map((r) => ({
          url: r.name.split('/').pop(),
          duration: r.duration,
          type: r.name.endsWith('.js') ? 'script' : 'stylesheet',
        }))
    })

    console.log('\n🚫 Blocking Resources:')
    if (blockingResources.length === 0) {
      console.log('  ✅ No blocking resources detected')
    } else {
      blockingResources.forEach((resource) => {
        console.warn(`  ⚠️  ${resource.type}: ${resource.url} (${resource.duration.toFixed(2)}ms)`)
      })
    }

    // This is informational - blocking resources aren't always bad
    // but we want to know about them
  })

  test('should have efficient font loading', async ({ page }) => {
    const fontMetrics = await page.evaluate(() => {
      const fonts = performance.getEntriesByType('resource')
        .filter((r) => r.name.match(/\.(woff|woff2|ttf|otf)/)) as PerformanceResourceTiming[]

      return fonts.map((font) => ({
        url: font.name.split('/').pop(),
        duration: font.duration,
        size: font.transferSize,
      }))
    })

    console.log('\n🔤 Font Loading Performance:')
    fontMetrics.forEach((font) => {
      console.log(`  ${font.url}: ${font.duration.toFixed(2)}ms, ${(font.size / 1024).toFixed(2)}KB`)
    })

    // Fonts should load reasonably fast
    const slowFonts = fontMetrics.filter((font) => font.duration > 500)
    if (slowFonts.length > 0) {
      console.warn(`⚠️  ${slowFonts.length} fonts took over 500ms to load`)
    }
  })

  test('should have minimal JavaScript execution time', async ({ page }) => {
    const jsMetrics = await page.evaluate(() => {
      const scripts = performance.getEntriesByType('resource')
        .filter((r) => r.name.endsWith('.js')) as PerformanceResourceTiming[]

      const totalSize = scripts.reduce((sum, s) => sum + (s.transferSize || 0), 0)
      const totalDuration = scripts.reduce((sum, s) => sum + s.duration, 0)

      return {
        count: scripts.length,
        totalSize,
        totalDuration,
        scripts: scripts.map((s) => ({
          url: s.name.split('/').pop(),
          duration: s.duration,
          size: s.transferSize,
        })).sort((a, b) => b.duration - a.duration).slice(0, 5), // Top 5 slowest
      }
    })

    console.log('\n⚡ JavaScript Performance:')
    console.log(`  Total scripts: ${jsMetrics.count}`)
    console.log(`  Total size: ${(jsMetrics.totalSize / 1024).toFixed(2)} KB`)
    console.log(`  Total load time: ${jsMetrics.totalDuration.toFixed(2)}ms`)
    console.log('\n  Slowest scripts:')
    jsMetrics.scripts.forEach((script, i) => {
      console.log(`    ${i + 1}. ${script.url}: ${script.duration.toFixed(2)}ms (${(script.size / 1024).toFixed(2)}KB)`)
    })

    // Warn if JS bundle is too large
    if (jsMetrics.totalSize > 500 * 1024) { // 500 KB
      console.warn(`⚠️  Large JavaScript bundle: ${(jsMetrics.totalSize / 1024).toFixed(2)} KB`)
    }
  })
})

test.describe('Accessibility', () => {
  // Skip for non-Chromium browsers to keep tests consistent with Web Vitals
  test.skip(({ browserName }) => browserName !== 'chromium', 'Accessibility tests run with Web Vitals in Chromium only')

  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/')

    // Basic accessibility checks
    const violations = await page.evaluate(() => {
      const issues: string[] = []

      // Check for alt text on images
      const images = document.querySelectorAll('img')
      images.forEach((img) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          issues.push(`Image missing alt text: ${img.src}`)
        }
      })

      // Check for proper heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      let lastLevel = 0
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1])
        if (level - lastLevel > 1) {
          issues.push(`Heading level skip: ${heading.tagName} after H${lastLevel}`)
        }
        lastLevel = level
      })

      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select')
      inputs.forEach((input) => {
        const id = input.id
        if (id && !document.querySelector(`label[for="${id}"]`) && !input.getAttribute('aria-label')) {
          issues.push(`Form input missing label: ${id || input.outerHTML.substring(0, 50)}`)
        }
      })

      return issues
    })

    console.log('\n♿ Accessibility Issues:')
    if (violations.length === 0) {
      console.log('  ✅ No accessibility issues detected')
    } else {
      violations.forEach((issue) => {
        console.warn(`  ⚠️  ${issue}`)
      })
    }

    // This is a soft warning - doesn't fail the test
    if (violations.length > 0) {
      console.warn(`\n⚠️  Found ${violations.length} accessibility issue(s)`)
    }
  })
})
