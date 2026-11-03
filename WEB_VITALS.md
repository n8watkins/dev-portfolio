# Web Vitals Monitoring

This portfolio includes comprehensive Web Vitals monitoring to track and optimize performance.

## What Are Web Vitals?

Web Vitals are Google's metrics for measuring real-world user experience on the web. They focus on three core aspects:

### Core Web Vitals

1. **LCP (Largest Contentful Paint)** - Loading performance
   - ✅ Good: ≤ 2.5s
   - ⚠️ Needs Improvement: 2.5s - 4.0s
   - ❌ Poor: > 4.0s

2. **INP (Interaction to Next Paint)** - Interactivity
   - ✅ Good: ≤ 200ms
   - ⚠️ Needs Improvement: 200ms - 500ms
   - ❌ Poor: > 500ms

3. **CLS (Cumulative Layout Shift)** - Visual stability
   - ✅ Good: ≤ 0.1
   - ⚠️ Needs Improvement: 0.1 - 0.25
   - ❌ Poor: > 0.25

### Additional Metrics

4. **FCP (First Contentful Paint)** - First render time
   - ✅ Good: ≤ 1.8s
   - ⚠️ Needs Improvement: 1.8s - 3.0s
   - ❌ Poor: > 3.0s

5. **TTFB (Time to First Byte)** - Server response time
   - ✅ Good: ≤ 800ms
   - ⚠️ Needs Improvement: 800ms - 1800ms
   - ❌ Poor: > 1800ms

6. **FID (First Input Delay)** - Legacy interactivity metric
   - ✅ Good: ≤ 100ms
   - ⚠️ Needs Improvement: 100ms - 300ms
   - ❌ Poor: > 300ms

## Features

### 1. Console Logging

All Web Vitals are automatically logged to the browser console with:
- Color-coded output (green for good, yellow for needs improvement, red for poor)
- Emoji indicators (✅, ⚠️, ❌)
- Formatted values with appropriate units
- Detailed tables in development mode

### 2. Google Analytics Integration

All metrics are automatically sent to Google Analytics as custom events:
- Event name: `web_vital`
- Parameters: metric name, value, rating

### 3. Visual HUD (Development Only)

A real-time visual heads-up display shows Web Vitals metrics as they're collected.

**To enable:**
- Press `Alt+Shift+V`
- The HUD appears in the bottom-right corner
- Shows all collected metrics with color-coded ratings
- Auto-updates as new metrics come in

**Features:**
- Real-time metric updates
- Color-coded ratings
- Full metric names and descriptions
- Keyboard shortcut toggle

### 4. Cloudflare Web Analytics

The Cloudflare Web Analytics beacon (`components/WebAnalytics.tsx`) reports real visitors' Core Web Vitals in production.

## Usage

### Viewing Metrics in Console

1. Open your browser's developer tools (F12)
2. Navigate to the Console tab
3. Refresh the page
4. Watch for colored Web Vitals logs

Example console output:
```
✅ LCP: 1234ms (good)
⚠️ INP: 250ms (needs-improvement)
✅ CLS: 0.05 (good)
```

### Using the Visual HUD

1. Run the app in development mode: `npm run dev`
2. Open the app in your browser
3. Press `Alt+Shift+V`
4. The HUD will appear in the bottom-right corner
5. Press the same shortcut again to hide it

### Viewing in Google Analytics

1. Go to your Google Analytics dashboard
2. Navigate to Events
3. Look for the `web_vital` event
4. View custom dimensions for detailed metrics

## Implementation Details

### Files

- `lib/performance.ts` - Core Web Vitals reporting logic
- `app/web-vitals.tsx` - Next.js Web Vitals hook integration
- `components/WebVitalsHUD.tsx` - Visual HUD component
- `app/layout.tsx` - Integration point

### How It Works

1. Next.js automatically measures Web Vitals using the `web-vitals` library
2. The `useReportWebVitals` hook captures these metrics
3. Each metric is:
   - Logged to console with formatting
   - Sent to Google Analytics
   - Broadcast to the HUD component via custom events
4. Thresholds are automatically evaluated based on Google's recommendations

## Optimizing Your Scores

### Improving LCP (Largest Contentful Paint)

- Use Next.js Image optimization
- Implement lazy loading
- Optimize server response time
- Use CDN for static assets
- Preload critical resources

### Improving INP (Interaction to Next Paint)

- Minimize JavaScript execution time
- Use code splitting
- Defer non-critical JavaScript
- Optimize event handlers
- Use Web Workers for heavy tasks

### Improving CLS (Cumulative Layout Shift)

- Set explicit dimensions for images and videos
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS transforms instead of layout-triggering properties

### Improving FCP (First Contentful Paint)

- Minimize render-blocking resources
- Inline critical CSS
- Preconnect to required origins
- Remove unused CSS
- Optimize fonts

### Improving TTFB (Time to First Byte)

- Use edge caching
- Optimize server response time
- Use HTTP/2 or HTTP/3
- Implement service workers
- Optimize database queries

## Best Practices

1. **Monitor regularly** - Check Web Vitals in both development and production
2. **Test on real devices** - Mobile performance often differs from desktop
3. **Use slow network throttling** - Test under realistic conditions
4. **Track over time** - Look for trends and regressions
5. **Set performance budgets** - Define acceptable thresholds for your app

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
