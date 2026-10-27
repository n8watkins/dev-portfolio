// Checks that the files shared with n8builds-web are still byte-identical to
// its main branch. Usage: npm run check:sync [path to an n8builds-web checkout]
// (default ../n8builds-web). See "Kept in sync with n8builds-web" in docs/HANDOFF.md.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const SHARED = [
  'components/magicui/marquee.tsx',
  'components/Projects/TechStackCycle.tsx',
  'components/ui/StackTile.tsx',
  'components/features/dino/DinoEasterEgg.tsx',
  'components/features/dino/DinoGame.tsx',
  'components/features/dino/sprite.ts',
  'hooks/usePrefersReducedMotion.ts',
  'hooks/useHydrated.ts',
  'lib/utils.ts',
]

const repo = resolve(process.argv[2] ?? '../n8builds-web')
let drift = 0
for (const file of SHARED) {
  const theirs = execFileSync('git', ['-C', repo, 'show', `main:${file}`])
  const ours = readFileSync(file)
  if (!theirs.equals(ours)) {
    drift++
    console.log(`differs from n8builds-web main: ${file}`)
  }
}
console.log(drift ? `${drift} file(s) out of sync` : `all ${SHARED.length} shared files match n8builds-web main`)
process.exit(drift ? 1 : 0)
