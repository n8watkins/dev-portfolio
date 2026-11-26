// The rate limit on /api/where (lib/whereLimit.ts), as n8builds-web counts its
// own (its worker/rate-limit-counter.js): one Durable Object per key (a hash
// of the connection's address, IPv6 per /64), so every request for that key
// is counted in one place, in order, however many Worker instances serve the
// site. It keeps only the times of the allowed requests, and forgets the key
// entirely once they are all out of the window.
import { DurableObject } from 'cloudflare:workers'
import { slide } from './sliding-window.js'

export class RateLimitCounter extends DurableObject {
  /**
   * Counts one request; false when the limit is reached.
   * @param {number} max
   * @param {number} windowMs
   */
  async limit(max, windowMs) {
    const now = Date.now()
    const { allowed, hits } = slide((await this.ctx.storage.get('hits')) ?? [], now, max, windowMs)
    if (allowed) {
      await this.ctx.storage.put('hits', hits)
      // Every hit is out of the window by then: forget the key entirely.
      await this.ctx.storage.setAlarm(now + windowMs)
    }
    return allowed
  }

  async alarm() {
    await this.ctx.storage.deleteAll()
  }
}
