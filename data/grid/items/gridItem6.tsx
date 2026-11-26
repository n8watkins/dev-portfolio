import BuildLogCard from '@/components/build-log/BuildLogCard'
import BuildLogHighlightSwitch from '@/components/ui/BentoComponents/BuildLogHighlightSwitch'
import { BUILD_LOG_PAGE } from '@/lib/buildLog'
import { N8BUILDS } from '@/lib/sites'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Grid Item 6: the n8builds.dev build log, a month at a glance (owner, round 4
 * of 2026-11-09), beside "Have a project?". Live from n8builds.dev; the arrows
 * cycle the months, the days light up to show their numbers, and two links
 * lead to the site and the full build log. The card is shared with
 * n8builds.dev (components/build-log/); these links are this site's.
 */
export const gridItem6: GridItemConfig = {
  id: 6,
  title: '',
  description: '',
  gridItemContainer:
    'col-span-2 row-span-3 md:col-span-4 md:row-span-2 lg:row-span-2 xl:col-span-4 xl:row-span-3',
  renderForeground: () => (
    // TEMPORARY: ?log=3's stronger highlight, this site only (see the wrapper).
    <BuildLogHighlightSwitch>
      <BuildLogCard
        links={{
          left: {
            label: N8BUILDS.name,
            href: N8BUILDS.url,
            external: true,
            note: 'I post everything here',
          },
          right: {
            label: 'Build log',
            href: BUILD_LOG_PAGE,
            external: true,
            srExtra: ' on n8builds.dev',
          },
        }}
      />
    </BuildLogHighlightSwitch>
  ),
}
