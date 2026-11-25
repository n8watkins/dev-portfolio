// Checks that the files shared with n8builds-web are still byte-identical to
// its origin/main. Usage: npm run check:sync [path to an n8builds-web checkout]
// (default ../n8builds-web). See "Kept in sync with n8builds-web" in docs/HANDOFF.md.
//
// It compares against origin/main of that checkout after a fetch, never against
// its local main branch (which nobody updates) or its working tree. If the
// fetch fails (offline), it compares against the last fetched origin/main and says so.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Only files that exist in both repos. A file used by this site alone
// (components/Projects/TechStackCycle.tsx) does not belong here.
export const SHARED = [
  'components/magicui/marquee.tsx',
  'data/stack.tsx',
  'components/ui/StackTile.tsx',
  'components/features/dino/DinoEasterEgg.tsx',
  'components/features/dino/DinoGame.tsx',
  'components/features/dino/DinoMusic.tsx',
  'components/features/dino/music.ts',
  'components/features/dino/sprite.ts',
  'hooks/usePrefersReducedMotion.ts',
  'hooks/useHydrated.ts',
  'lib/utils.ts',
  'lib/intersection.ts',
]

const REF = 'origin/main'
const repo = resolve(process.argv[2] ?? '../n8builds-web')

const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: ['ignore', 'pipe', 'pipe'] })

if (!existsSync(repo)) {
  console.error(`No n8builds-web checkout at ${repo}.`)
  console.error('Clone n8watkins/n8builds-web next to this repo, or pass its path: npm run check:sync -- <path>')
  process.exit(2)
}
try {
  git('rev-parse', '--verify', '--quiet', `${REF}^{commit}`)
} catch {
  console.error(`${repo} has no ${REF}. Is it a clone of n8watkins/n8builds-web?`)
  process.exit(2)
}

try {
  git('fetch', '--quiet', 'origin', 'main')
} catch {
  console.warn(`warning: could not fetch ${repo}; comparing against its last fetched ${REF}, which may be stale`)
}
const sha = git('rev-parse', '--short', REF).toString().trim()

let drift = 0
for (const file of SHARED) {
  let theirs
  try {
    theirs = git('show', `${REF}:${file}`)
  } catch {
    drift++
    console.log(`missing from n8builds-web ${REF}: ${file}`)
    continue
  }
  if (!existsSync(file)) {
    drift++
    console.log(`missing here: ${file}`)
    continue
  }
  if (!theirs.equals(readFileSync(file))) {
    drift++
    console.log(`differs from n8builds-web ${REF}: ${file}`)
  }
}
console.log(
  drift
    ? `${drift} file(s) out of sync with n8builds-web ${REF} (${sha})`
    : `all ${SHARED.length} shared files match n8builds-web ${REF} (${sha})`,
)
process.exit(drift ? 1 : 0)
