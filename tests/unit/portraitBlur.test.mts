// Every hero portrait needs its own generated blur placeholder (data/portraitBlur.ts, made by
// scripts/gen-portrait-blur.mjs), or its circle shows empty while the photo loads.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { heroPortraits } from '../../data/portraits.ts'
import { PORTRAIT_BLUR } from '../../data/portraitBlur.ts'

test('every rotating hero portrait has a generated JPEG placeholder', () => {
  for (const src of heroPortraits) {
    assert.match(PORTRAIT_BLUR[src] ?? '', /^data:image\/jpeg;base64,\/9j\//, `${src} has no placeholder: run node scripts/gen-portrait-blur.mjs`)
  }
})

test('the placeholders differ, each made from its own portrait', () => {
  const all = heroPortraits.map((src) => PORTRAIT_BLUR[src])
  assert.equal(new Set(all).size, all.length)
})
