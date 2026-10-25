import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { ROLE, SITE_NAME } from '@/lib/seo'

/**
 * The share card for the site (Open Graph and Twitter): name, role and photo
 * in the site's own colours, generated at build time so it can't drift from
 * the design the way a saved screenshot did.
 */

export const alt = `${SITE_NAME}, ${ROLE}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const file = (path: string) => readFile(join(process.cwd(), path))

export default async function Image() {
  const [medium, extraBold, portrait, icon] = await Promise.all([
    file('assets/fonts/Inter-Medium.ttf'),
    file('assets/fonts/Inter-ExtraBold.ttf'),
    file('public/hero/portrait.jpg'),
    file('public/tab/n8-icon.png'),
  ])
  const dataUrl = (bytes: Buffer, type: string) => `data:${type};base64,${bytes.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: '72px 80px',
          background: 'radial-gradient(circle at 78% 40%, #0c3a5c 0%, #0f172a 48%, #0b1120 100%)',
          fontFamily: 'Inter',
          color: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: '#7dd3fc', textTransform: 'uppercase' }}>Developer portfolio</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginTop: 20 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#38bdf8', marginTop: 12 }}>{ROLE}</div>
          <div style={{ fontSize: 28, color: '#cbd5e1', marginTop: 28, maxWidth: 600, lineHeight: 1.4 }}>
            Voice agents, research agents and client sites, built with React, Next.js and AI.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', fontSize: 26, color: '#94a3b8' }}>
            <img src={dataUrl(icon, 'image/png')} width={44} height={44} alt="" style={{ marginRight: 16, borderRadius: 10 }} />
            portfolio.n8builds.dev
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={dataUrl(portrait, 'image/jpeg')}
            width={360}
            height={360}
            alt=""
            style={{ borderRadius: 180, objectFit: 'cover', border: '6px solid rgba(56, 189, 248, 0.35)' }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: medium, weight: 500, style: 'normal' },
        { name: 'Inter', data: extraBold, weight: 800, style: 'normal' },
      ],
    },
  )
}
