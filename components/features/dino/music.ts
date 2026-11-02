/**
 * The dino game's optional arcade music: "Desert Run", a 4-bar chiptune loop
 * (148 bpm, A minor) played by a tiny Web Audio synth. No audio files: a
 * pulse-wave lead (an NES-style 25% duty cycle, from createPeriodicWave), a
 * triangle bass, and drums made on the spot (a sine kick, noise hats and
 * snare). A lookahead scheduler queues each 16th note a moment ahead of time,
 * so the beat stays steady even when the page's timers are late.
 *
 * Loaded lazily by DinoMusic.tsx, which creates the AudioContext in the
 * visitor's click (browsers only let sound start from one) and hands it over.
 * tests/e2e/dino-music.spec.ts renders it offline (an OfflineAudioContext,
 * driven by queue()) and checks the sound by the numbers, never out loud.
 */

// One token per 16th step: a note starts, "-" holds it, "." is a rest.
// Drums: k kick, s snare, h hat.
const LEAD = [
  'A4 - C5 - E5 - D5 C5 D5 - E5 - G5 - E5 -',
  'D5 - C5 - A4 - - - G4 - A4 - C5 - . .',
  'A4 - C5 - E5 - D5 C5 D5 - E5 - A5 - G5 -',
  'E5 - D5 - C5 - D5 - A4 - - - . . . .',
]
const BASS = [
  'A2 - A2 - A3 - A2 - A2 - A2 - A3 - G2 -',
  'F2 - F2 - F3 - F2 - F2 - F2 - F3 - E2 -',
  'G2 - G2 - G3 - G2 - G2 - G2 - G3 - G2 -',
  'A2 - A2 - A3 - A2 - E2 - E2 - G2 - G#2 -',
]
const DRUMS = 'k . h . s . h . k k h . s . h h'.split(' ')
const BPM = 148
const SIXTEENTH = 60 / BPM / 4 // s
/** One time round the loop, s: 4 bars of 16 steps. */
export const LOOP = 64 * SIXTEENTH

/** The master volume while playing: about 35% of full. */
export const VOLUME = 0.32
const FADE_IN = 0.4 // s
const FADE_OUT = 0.25 // s
const LOOKAHEAD = 0.12 // s of notes queued ahead
const TICK = 25 // ms between scheduler runs

type Voice = 'lead' | 'bass'
interface Note {
  voice: Voice
  freq: number
  /** Length in 16th steps. */
  len: number
}

const SEMITONE: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }
const freq = (note: string) => {
  const [, name, octave] = note.match(/^([A-G]#?)(\d)$/)!
  return 440 * 2 ** ((SEMITONE[name] + (Number(octave) + 1) * 12 - 69) / 12)
}

// The loop as a list of steps, each with the notes that start on it.
function score() {
  const steps: Note[][] = []
  for (const [voice, bars] of [['lead', LEAD], ['bass', BASS]] as const) {
    const tokens = bars.join(' ').split(/\s+/)
    tokens.forEach((token, i) => {
      steps[i] ??= []
      if (token === '-' || token === '.') return
      let len = 1
      while (tokens[i + len] === '-') len++
      steps[i].push({ voice, freq: freq(token), len })
    })
  }
  return steps
}

export interface Music {
  /** Fades the loop in, from where it paused (or from the top). */
  play(fromTop?: boolean): void
  /** Fades it out, then stops scheduling and suspends the context. */
  pause(): void
  /** Stops for good and closes the context. */
  dispose(): void
  /** Queues every note that starts before `until` (context time, s), as the
   * live scheduler does while time passes: for an offline render. */
  queue(until: number): void
}

/**
 * The loop on a context: a live AudioContext (scheduled as time passes, and
 * suspended while paused) or an OfflineAudioContext (the tests call queue()
 * and render it). `volume` is the playing level: VOLUME unless a test asks.
 */
export function createMusic(ctx: BaseAudioContext, volume = VOLUME): Music {
  const live = typeof AudioContext !== 'undefined' && ctx instanceof AudioContext ? ctx : null
  const steps = score()
  const sixteenth = SIXTEENTH
  const levels: Record<Voice, number> = { lead: 0.16, bass: 0.3 }

  // Notes -> master (the fades and volume) -> compressor -> speakers.
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.createDynamicsCompressor()).connect(ctx.destination)

  // An NES pulse wave, 25% duty cycle, from its Fourier series.
  const n = 64
  const real = new Float32Array(n)
  const imag = new Float32Array(n)
  for (let k = 1; k < n; k++) {
    real[k] = (2 / (k * Math.PI)) * Math.sin(2 * Math.PI * k * 0.25)
    imag[k] = (2 / (k * Math.PI)) * (1 - Math.cos(2 * Math.PI * k * 0.25))
  }
  const pulse = ctx.createPeriodicWave(real, imag)

  // One second of white noise for the hats and snare.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const tone = (t: number, dur: number, note: Note) => {
    const level = levels[note.voice]
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    if (note.voice === 'bass') osc.type = 'triangle'
    else osc.setPeriodicWave(pulse)
    osc.frequency.value = note.freq
    // A quick attack, a little decay, and a short release (no clicks).
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(level, t + 0.006)
    env.gain.linearRampToValueAtTime(level * 0.7, t + Math.min(0.08, dur * 0.5))
    env.gain.setValueAtTime(level * 0.7, t + dur - 0.02)
    env.gain.linearRampToValueAtTime(0, t + dur)
    osc.connect(env).connect(master)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  const drum = (t: number, kind: string) => {
    const env = ctx.createGain()
    env.connect(master)
    if (kind === 'k') {
      // A sine that drops fast in pitch.
      const osc = ctx.createOscillator()
      osc.frequency.setValueAtTime(140, t)
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.12)
      env.gain.setValueAtTime(0.55, t)
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
      osc.connect(env)
      osc.start(t)
      osc.stop(t + 0.18)
      return
    }
    // Filtered noise: high for the hat, a band for the snare.
    const hat = kind === 'h'
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    src.buffer = noise
    filter.type = hat ? 'highpass' : 'bandpass'
    filter.frequency.value = hat ? 7000 : 1800
    const len = hat ? 0.04 : 0.12
    env.gain.setValueAtTime(hat ? 0.12 : 0.3, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + len)
    src.connect(filter).connect(env)
    src.start(t)
    src.stop(t + len + 0.01)
  }

  let timer: ReturnType<typeof setInterval> | undefined
  let halt: ReturnType<typeof setTimeout> | undefined
  let step = 0
  let nextTime = 0

  // Queue every step that starts before `until`.
  const queue = (until: number) => {
    while (nextTime < until) {
      const s = step % steps.length
      for (const note of steps[s]) tone(nextTime, note.len * sixteenth * 0.95, note)
      const hit = DRUMS[s % DRUMS.length]
      if (hit !== '.') drum(nextTime, hit)
      nextTime += sixteenth
      step++
    }
  }

  // The live scheduler: the next LOOKAHEAD seconds, every TICK.
  const schedule = () => queue(ctx.currentTime + LOOKAHEAD)

  // Ramps the volume from wherever it is now, so a fade never jumps.
  const fade = (to: number, over: number) => {
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(to, now + over)
  }

  return {
    play(fromTop = false) {
      clearTimeout(halt)
      halt = undefined
      if (live && live.state !== 'running') void live.resume().catch(() => {})
      if (fromTop && !timer) step = 0
      if (!timer) {
        nextTime = ctx.currentTime + 0.06
        timer = setInterval(schedule, TICK)
        schedule()
      }
      fade(volume, FADE_IN)
    },
    pause() {
      if (!timer || halt) return
      fade(0, FADE_OUT)
      halt = setTimeout(() => {
        halt = undefined
        clearInterval(timer)
        timer = undefined
        if (live?.state === 'running') void live.suspend().catch(() => {})
      }, FADE_OUT * 1000 + 50)
    },
    dispose() {
      clearInterval(timer)
      clearTimeout(halt)
      timer = halt = undefined
      void live?.close().catch(() => {})
    },
    queue,
  }
}
