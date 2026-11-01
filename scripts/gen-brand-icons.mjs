// Generates the site's tab and app icons from the brand mark.
// Run: node scripts/gen-brand-icons.mjs
//
// The master is public/brand/n8-mark.png: the lowercase "n8" (white "n",
// blue "8") on a transparent background, trimmed to its edges. The corner
// link to n8builds.dev shows it as it is; every square icon puts it on the
// dark navy rounded tile below. A copy of n8builds-web's script with this
// site's icons in ICONS, so both sites' icons come out the same.
import sharp from 'sharp'

const MASTER = 'public/brand/n8-mark.png'

// [path, size, style]: 'tile' is the rounded tile with a faint sky edge
// (tabs, Android, cards); 'full' fills the square edge to edge, for Apple's
// touch icon (iOS rounds the corners itself, so a tile would get a black rim).
const ICONS = [
  ['public/tab/n8-icon.png', 512, 'tile'],
  ['public/tab/n8-icon-96.png', 96, 'tile'],
  ['public/tab/apple-icon.png', 180, 'full'],
]

// The mark's width as a share of the icon: large enough to read at 16px,
// clear of the tile's rounded corners.
const MARK = { tile: 0.86, full: 0.78 }

const background = (size, style) => {
  const edge = style === 'tile' ? Math.max(1, size / 64) : 0
  const inset = edge / 2
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1a33"/>
      <stop offset="1" stop-color="#060b18"/>
    </linearGradient>
  </defs>
  <rect x="${inset}" y="${inset}" width="${size - edge}" height="${size - edge}"
    rx="${style === 'tile' ? size * 0.22 : 0}" fill="url(#g)"
    ${edge ? `stroke="rgba(56,189,248,0.35)" stroke-width="${edge}"` : ''}/>
</svg>`)
}

for (const [path, size, style] of ICONS) {
  const mark = await sharp(MASTER)
    .resize({ width: Math.round(size * MARK[style]), kernel: 'lanczos3' })
    .toBuffer({ resolveWithObject: true })
  await sharp(background(size, style))
    .composite([
      {
        input: mark.data,
        left: Math.round((size - mark.info.width) / 2),
        top: Math.round((size - mark.info.height) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path)
  console.log(`wrote ${path} (${size}px, ${style})`)
}
