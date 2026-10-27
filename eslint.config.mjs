import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'playwright-report/**',
      'test-results/**',
      // Kept byte-identical with n8builds-web, linted there (npm run check:sync).
      'components/magicui/marquee.tsx',
      'components/Projects/TechStackCycle.tsx',
      'components/ui/StackTile.tsx',
      'components/features/dino/DinoEasterEgg.tsx',
      'components/features/dino/DinoGame.tsx',
      'components/features/dino/sprite.ts',
      'hooks/usePrefersReducedMotion.ts',
      'hooks/useHydrated.ts',
      'lib/utils.ts',
    ],
  },
  ...nextCoreWebVitals,
  {
    // eslint-config-next 16 ships the React Compiler-era react-hooks rules as
    // errors. We don't enable the React Compiler yet, so treat these readiness
    // advisories as warnings instead of failing lint on existing, working code.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]

export default config
