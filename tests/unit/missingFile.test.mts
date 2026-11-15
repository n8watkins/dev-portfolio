// Unit tests for worker/missing-file.js (node --test).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isMissingFile, missingFile } from '../../worker/missing-file.js'

const at = (path: string, init?: RequestInit) => new Request(`https://portfolio.n8builds.dev${path}`, init)

test('every real route and static file passes through', () => {
  for (const path of [
    '/',
    '/projects',
    '/projects/net-trailers',
    '/about',
    '/stack',
    '/api/health',
    '/api/status',
    '/api/build-log',
    '/healthz',
    '/_next/image',
    '/opengraph-image',
    '/does-not-exist',
    '/sitemap.xml',
    '/robots.txt',
    '/.well-known/security.txt',
    '/blog/old-post.html',
    '/portfolio/old/page.html',
  ]) {
    assert.equal(isMissingFile(path), false, path)
  }
})

test('file-like paths that are not routes are refused', () => {
  for (const path of [
    '/config.json',
    '/.s3cfg',
    '/secrets.json',
    '/www.zip',
    '/terraform.tfvars',
    '/vercel.json',
    '/.env',
    '/.git/config',
    '/wp-login.php',
    '/backup.sql',
    '/api/config.json',
    '/_next/static/chunks/gone.js',
    '/projects/x.zip',
    '/sitemap.xml.bak',
  ]) {
    assert.equal(isMissingFile(path), true, path)
  }
})

test('the 404 is small, cookie-free and briefly cached, whatever the method', async () => {
  for (const method of ['GET', 'HEAD', 'POST']) {
    const response = missingFile(at('/config.json', { method }))
    assert.equal(response?.status, 404)
    assert.equal(response?.headers.get('Content-Type'), 'text/plain; charset=utf-8')
    assert.equal(response?.headers.get('Cache-Control'), 'public, max-age=60, s-maxage=300')
    assert.equal(response?.headers.get('Set-Cookie'), null)
  }
  assert.equal(await missingFile(at('/.s3cfg'))?.text(), 'Not found')
})

test('everything else is left to Next, including its own 404 page', () => {
  assert.equal(missingFile(at('/nope')), null)
  assert.equal(missingFile(at('/sitemap.xml')), null)
})
