/**
 * The bold map's engine: the lit grid of the site raised into the country's
 * real terrain (one column per cell, its height from real elevation), lit from
 * the west by a low sun and by the end of each route.
 *
 * Nothing is fired by the visitor. The map traces its own routes from Los
 * Angeles, one every half second, each a thin low line drawn with a soft ease,
 * a small light on arrival, then a fade. One label at a time names a place
 * (the one pointed at, else a recent arrival). A visitor in the lower 48 gets
 * a line of their own, drawn first and kept.
 *
 * Hand-written WebGL2, no library. Without WebGL2 (or after the context is
 * lost for good) the same scene is drawn once, still, on a 2D canvas.
 *
 * Ported from the owner's chosen lab sketch (preview/feel/map-bold.html on the
 * local preview/toys branch, 2026-11-11), with its layout, colours and timing.
 */
import { fitCamera, clip, type Camera, type Vec3 } from './camera'
import { cellOf, formatMiles, placeLabel, type Visitor } from './geo'
import { scene, type Cell, type ScenePlace } from './scene'
import { BOX_FS, BOX_VS, GLOW_FS, GLOW_VS, RIB_FS, RIB_VS, SEA_FS, SEA_VS } from './shaders'

export type MapElements = {
  /** The card: sized by the page; the map fills it. */
  card: HTMLElement
  canvas: HTMLCanvasElement
  /** His portrait, out over the Pacific west of Los Angeles. */
  pin: HTMLElement
  /** The short line from Los Angeles to the portrait. */
  leader: HTMLElement
  /** The Los Angeles chip, under the city. */
  chip: HTMLElement
  /** The visitor's label. */
  you: HTMLElement
  /** The one place label. */
  label: HTMLElement
}

export type MapOptions = {
  visitor: Visitor | null
  /** Reduced motion: the map is drawn once, fully, and holds still. */
  still: boolean
}

export type MapEngine = {
  /** Re-fit to the card's size and redraw. */
  resize(): void
  /** Run (on screen, tab visible) or pause. A still map ignores it. */
  setActive(active: boolean): void
  /** The visitor became known (or not): their line is drawn from now. */
  setVisitor(visitor: Visitor | null): void
  destroy(): void
  /** 'webgl2' or '2d' (the still fallback). */
  readonly mode: 'webgl2' | '2d'
}

// Timing, as the owner picked it (2026-11-11): a route every 0.5 s, drawn in
// 2.4 s, held 1.6 s, faded in 2 s, so about twelve are alive at once; the line
// to the visitor is drawn in 2 s.
/** The avatar's grown size over its size at rest (BoldMap.tsx: 36 to 50px on a card, 44 to 60px large). */
const GROWN_RATIO = 50 / 36
const EVERY = 0.5
const DRAW = 2.4
const HOLD = 1.6
const FADE = 2.0
const YOU_DRAW = 2.0
const LABEL_FOR = 2.6
const LINGER = 2.2

type Arc = { p: ScenePlace; end: Vec3; t0: number; landed: boolean; still?: boolean }

const smooth = (u: number) => {
  u = Math.max(0, Math.min(1, u))
  return u * u * (3 - 2 * u)
}
// Eases in and out so gently that a line never seems to leave or to hit.
const smoother = (u: number) => {
  u = Math.max(0, Math.min(1, u))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** Fills a label with plain text and styled parts, never HTML. */
function setText(el: HTMLElement, parts: (string | [tag: 'b' | 'em', text: string])[]) {
  el.replaceChildren(
    ...parts.map((part) => {
      if (typeof part === 'string') return document.createTextNode(part)
      const node = document.createElement(part[0])
      node.textContent = part[1]
      return node
    })
  )
}

export function createMapEngine(el: MapElements, opts: MapOptions): MapEngine {
  const S = scene()
  const gl = el.canvas.getContext('webgl2', {
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: false,
  })
  const mode: 'webgl2' | '2d' = gl ? 'webgl2' : '2d'
  // The 2D fallback is drawn once: it does not animate.
  const still = opts.still || !gl
  let W = 0
  let H = 0
  let DPR = 1
  let cam: Camera
  let T = 0
  let frames = 0

  // ---- places and the timeline
  const endOf = (c: Cell): Vec3 => [c.X, c.Hh + 0.15, c.Z]
  const laTop = (): Vec3 => [S.la.X, S.la.Hh + 0.2, S.la.Z]

  // The visitor: known at the start (the lab page's ?from=), or later, when the
  // home page's location request answers (setVisitor). Their line is then drawn
  // from that moment.
  let visitor: Visitor | null = null
  let youCell: Cell | null = null
  let youArc: { end: Vec3; t0: number } | null = null
  function applyVisitor(v: Visitor | null, startAt: number) {
    visitor = v
    youCell = null
    if (v?.kind === 'us') {
      const [x, y] = cellOf(v.at)
      youCell = S.nearestUs(x - S.cx, y - S.cz)
    }
    youArc = youCell ? { end: endOf(youCell), t0: still ? -99 : startAt } : null
    if (v?.kind === 'us') {
      setText(el.you, [
        ['b', 'You'],
        v.near ? ` · near ${v.near} ` : ' ',
        ['em', `· ${formatMiles(v.mi)} mi`],
      ])
    } else {
      // In the LA area (or unknown) there is no visitor label: the Los Angeles
      // chip greets a neighbour itself (BoldMap.tsx), so LA is never said twice.
      el.you.replaceChildren()
    }
    el.you.toggleAttribute('data-on', false)
    youPlaced = false
    el.card.dataset.visitor = v ? v.kind : 'none'
  }
  let youPlaced = false
  applyVisitor(opts.visitor, 0.8)

  // Routes go to the curated tech hubs in their order (techCities.ts), round and
  // round; the visitor's own city is skipped, since their line is already there.
  let nextCity = 0
  const pick = () => {
    for (let k = 0; k < S.targets.length; k++) {
      const p = S.targets[nextCity++ % S.targets.length]
      if (p.cell !== youCell) return p
    }
    return S.targets[0]
  }
  const arcs: Arc[] = []
  const arrivals: [number, number, number][] = []
  const screenOf = (p: ScenePlace) => px.get(p) ?? cam.toPx(endOf(p.cell))
  let nextAuto = youArc ? 0.8 + YOU_DRAW + 0.6 : 0.6

  // Only the tech hubs answer the pointer (owner, 2026-11-25: the map naming
  // whatever small place was under it read as "random spots"). Near a hub its
  // label shows and its line brightens; anywhere else nothing is named and the
  // routes' own label carries on. The visitor's own city is left to their label.
  const pickable = S.targets
  const px = new Map<ScenePlace, [number, number, number, number]>()
  /** How near a hub the pointer must be, in card pixels: a finger gets more room. */
  const REACH = { mouse: 30, touch: 44 }
  const nearestPlace = (x: number, y: number, reach: number) => {
    let best: ScenePlace | null = null
    let bd = reach * reach
    for (const p of pickable) {
      if (p.cell === youCell) continue
      const q = px.get(p)!
      const d = (q[0] - x) ** 2 + (q[1] - y) ** 2
      if (d <= bd) {
        bd = d
        best = p
      }
    }
    return best
  }

  // ---- pointing (information only; the flow carries on underneath)
  let hover: ScenePlace | null = null
  let touching = false
  let leaveAt = -1
  let hovAmt = 0
  let hovPlace: ScenePlace | null = null
  let hovAt: [number, number] = [0, 0]
  const at = (e: PointerEvent) => {
    const r = el.card.getBoundingClientRect()
    const reach = e.pointerType === 'touch' ? REACH.touch : REACH.mouse
    return nearestPlace(e.clientX - r.left, e.clientY - r.top, reach)
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'touch' || touching) {
      leaveAt = -1
      hover = at(e)
    }
  }
  const onLeave = () => {
    hover = null
    touching = false
  }
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touching = true
      leaveAt = -1
      hover = at(e)
    }
  }
  const onUp = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touching = false
      leaveAt = T + LINGER // a lifted finger's label lingers a moment
    }
  }
  const listeners: [string, (e: PointerEvent) => void][] = [
    ['pointermove', onMove],
    ['pointerleave', onLeave],
    ['pointerdown', onDown],
    ['pointerup', onUp],
    ['pointercancel', onLeave], // a vertical swipe is the page scrolling (touch-action: pan-y)
  ]
  if (!still)
    for (const [type, fn] of listeners) el.card.addEventListener(type, fn as EventListener)

  // ---- labels
  const rectOf = (node: HTMLElement) => {
    const a = node.getBoundingClientRect()
    const b = el.card.getBoundingClientRect()
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }
  }
  // The avatar as drawn (its picture grows on hover), not its fixed hit box.
  const pinRect = () => rectOf((el.pin.firstElementChild as HTMLElement | null) ?? el.pin)
  type Rect = ReturnType<typeof rectOf>
  const clear = (rects: Rect[], lx: number, ly: number, w: number, h: number, bottom: number) =>
    lx >= 6 &&
    lx + w <= W - 6 &&
    ly >= cam.top - 8 &&
    ly + h <= bottom &&
    !rects.some(
      (r) => lx < r.x + r.w + 4 && lx + w > r.x - 4 && ly < r.y + r.h + 4 && ly + h > r.y - 4
    )

  /**
   * His avatar sits out over the Pacific, west of Los Angeles, joined to the
   * city by a short leader, so it never covers the land, the routes' origin or
   * a label (owner, 2026-11-25: "it should be more off to the side in the
   * ocean"). Placed for its grown size, so growing never pushes it onto land
   * or off the card. `fx, fy` is Los Angeles on the card.
   */
  function placeAvatar(fx: number, fy: number) {
    const box = el.pin.offsetWidth // at rest: 36px on a card, 44px on a large map
    const grownR = (box * GROWN_RATIO) / 2
    const margin = 6
    // Left of the city and a little above it, clear of the chip hanging below.
    let cx = fx - grownR - Math.max(14, box * 0.55)
    let cy = fy - grownR * 0.55 - 6
    cx = Math.max(margin + grownR, cx)
    cy = Math.max(cam.top + grownR, cy)
    // Too little sea on a narrow card: rise until the circle clears the city.
    const clearance = grownR + 10
    if (Math.hypot(fx - cx, fy - cy) < clearance) {
      cy = Math.max(cam.top + grownR, fy - Math.sqrt(Math.max(0, clearance ** 2 - (fx - cx) ** 2)))
    }
    el.pin.style.transform = `translate(${cx - box / 2}px, ${cy - box / 2}px)`
    // The leader: from the city to the avatar's edge at rest.
    const dx = cx - fx
    const dy = cy - fy
    const len = Math.max(0, Math.hypot(dx, dy) - box / 2)
    el.leader.style.width = `${len}px`
    el.leader.style.transform = `translate(${fx}px, ${fy}px) rotate(${Math.atan2(dy, dx)}rad)`
  }

  function placeYou() {
    // Only a visitor with a line has a label; in the LA area the chip greets them.
    if (!youArc) return
    const rects = [pinRect(), rectOf(el.chip)]
    const w = el.you.offsetWidth
    const h = el.you.offsetHeight
    const [x, y] = cam.toPx(youArc.end)
    const spots: [number, number][] = [
      [x + 12, y - h / 2],
      [x - w / 2, y + 12],
      [x - 12 - w, y - h / 2],
      [x - w / 2, y - 14 - h],
      [x - w - 6, y + 10],
      [x - w, y - h - 12],
    ]
    const s = spots.find(([lx, ly]) => clear(rects, lx, ly, w, h, cam.labelMax + H * 0.02)) ?? [
      Math.max(6, Math.min(W - w - 6, x - w / 2)),
      Math.max(cam.top - 8, Math.min(cam.labelMax - h, y + 12)),
    ]
    el.you.style.transform = `translate(${Math.round(s[0])}px, ${Math.round(s[1])}px)`
  }

  let named: Arc | null = null
  let namedAt = -9
  let labelFor: ScenePlace | null = null
  function placeLabelEl() {
    // The arrival that holds the label keeps it LABEL_FOR seconds, then hands it to the newest.
    if (!named || T - namedAt >= LABEL_FOR) {
      const arrived = arcs.filter((r) => !r.still && T - r.t0 >= DRAW && T - r.t0 < DRAW + 0.6)
      const r = arrived[arrived.length - 1]
      if (r && r !== named) {
        named = r
        namedAt = T
      } else if (named && T - named.t0 > DRAW + HOLD + FADE * 0.6) named = null
    }
    let p = hover
    const isHover = !!p
    if (!p && named) p = named.p
    if (!p) {
      el.label.toggleAttribute('data-on', false)
      el.label.toggleAttribute('data-hover', false)
      labelFor = null
      return
    }
    if (labelFor !== p) {
      labelFor = p
      setText(el.label, [`${placeLabel(p)} `, ['em', `· ${formatMiles(p.mi)} mi`]])
    }
    el.label.toggleAttribute('data-hover', isHover)
    const [x, y] = screenOf(p)
    const w = el.label.offsetWidth
    const h = el.label.offsetHeight
    const rects = [pinRect(), rectOf(el.chip)]
    if (el.you.hasAttribute('data-on')) rects.push(rectOf(el.you))
    const spots: [number, number][] = [
      [x + 12, y - h / 2],
      [x - 12 - w, y - h / 2],
      [x - w / 2, y + 12],
      [x - w / 2, y - 12 - h],
      [x + 12, y + 10],
      [x - 12 - w, y + 10],
      [x + 12, y - h - 10],
      [x - 12 - w, y - h - 10],
    ]
    const spot = spots.find(([lx, ly]) => clear(rects, lx, ly, w, h, cam.labelMax)) ?? [
      Math.max(6, Math.min(W - w - 6, x + 12)),
      Math.max(cam.top - 8, y - h - 12),
    ]
    el.label.style.transform = `translate(${Math.round(spot[0])}px, ${Math.round(spot[1])}px)`
    el.label.toggleAttribute('data-on', true)
  }

  // ---- one step of the timeline
  function step(dt: number) {
    T += dt
    if (leaveAt >= 0 && T >= leaveAt) {
      leaveAt = -1
      hover = null
    }
    if (T >= nextAuto) {
      arcs.push({ p: pick(), end: [0, 0, 0], t0: T, landed: false })
      const a = arcs[arcs.length - 1]
      a.end = endOf(a.p.cell)
      nextAuto = Math.max(nextAuto + EVERY, T + EVERY * 0.5)
    }
    for (const a of arcs) {
      if (!a.landed && T - a.t0 >= DRAW) {
        a.landed = true
        arrivals.push([a.p.cell.X, a.p.cell.Z, T])
        if (arrivals.length > 8) arrivals.shift()
      }
    }
    for (let k = arcs.length - 1; k >= 0; k--)
      if (!arcs[k].still && T - arcs[k].t0 > DRAW + HOLD + FADE) arcs.splice(k, 1)
    // The place pointed at comes up softly (a quarter of a second) and goes down slower.
    if (hover) {
      if (hover !== hovPlace) {
        hovPlace = hover
        hovAmt = Math.min(hovAmt, 0.35)
      }
      hovAt = [hovPlace.cell.X, hovPlace.cell.Z]
      hovAmt = Math.min(1, hovAmt + dt * 4)
    } else hovAmt = Math.max(0, hovAmt - dt * 2)
  }

  if (still) {
    // The still map shows every hub's line at once, quietly.
    for (const p of S.targets)
      arcs.push({ p, end: endOf(p.cell), t0: -99, landed: true, still: true })
  }

  // ---- what to draw this frame, shared by both renderers
  type Ribbon = { pts: Vec3[]; width: number; alpha: (u: number) => number }
  type Glow = { p: Vec3; size: number; alpha: number }
  function frameContent() {
    const ribbons: Ribbon[] = []
    const glows: Glow[] = []
    const heads = new Float32Array(16)
    const la = laTop()
    const arcPoint = (end: Vec3, u: number): Vec3 => {
      // A route lies low over the land, like a line drawn on a map, not a lobbed trajectory.
      const len = Math.hypot(end[0] - la[0], end[2] - la[2])
      const v = 1 - u
      return [
        la[0] * v + end[0] * u,
        la[1] * v + end[1] * u + (len * 0.06 + 0.7) * 4 * u * v,
        la[2] * v + end[2] * u,
      ]
    }
    const line = (end: Vec3, upTo: number, alpha: number, width: number) => {
      const pts: Vec3[] = []
      for (let k = 0; k <= 36; k++) pts.push(arcPoint(end, (k / 36) * upTo))
      ribbons.push({ pts, width, alpha: () => alpha })
    }
    // A quiet arrival: a small marker eases up from the place and a soft light comes on.
    const settle = (end: Vec3, on: number, life: number, strong: boolean) => {
      const k = smooth(on) * life
      if (k <= 0) return
      const tip: Vec3 = [end[0], end[1] + 1.5 * smooth(on), end[2]]
      ribbons.push({ pts: [end, tip], width: 1.3, alpha: (u) => 0.5 * k * (0.5 + 0.5 * u) })
      glows.push({ p: tip, size: strong ? 15 : 12, alpha: (strong ? 0.8 : 0.6) * k })
      glows.push({
        p: [end[0], end[1] + 0.2, end[2]],
        size: strong ? 30 : 24,
        alpha: (strong ? 0.3 : 0.22) * k,
      })
    }
    // A short beacon of light over Los Angeles (his face is beside it, over the sea).
    ribbons.push({
      pts: [la, [la[0], la[1] + 1.2, la[2]], [la[0], la[1] + 2.4, la[2]]],
      width: 3.2,
      alpha: (u) => 0.75 * (1 - u * 0.75),
    })
    glows.push({ p: la, size: 46, alpha: still ? 0.8 : 0.74 + 0.08 * Math.sin(T * 1.1) })
    // The line to the visitor: drawn first, then held for good.
    let youOn = 0
    if (youArc) {
      const age = T - youArc.t0
      const upTo = smoother(age / YOU_DRAW)
      if (upTo > 0) {
        line(youArc.end, upTo, 1.0, 2.3)
        line(youArc.end, upTo, 0.2, 6)
      }
      youOn = still ? 1 : smooth((age - YOU_DRAW) / 2)
      settle(youArc.end, (age - YOU_DRAW) / 2, 1, true)
      el.you.toggleAttribute('data-on', age >= YOU_DRAW * 0.95)
    }
    // The routes: drawn slowly, held, then faded.
    for (const a of arcs) {
      const age = a.still ? 99 : T - a.t0
      const upTo = a.still ? 1 : smoother(age / DRAW)
      const life = a.still ? 0.55 : 1 - smooth((age - DRAW - HOLD) / FADE)
      if (upTo > 0) line(a.end, upTo, 0.72 * life, 1.4)
      settle(a.end, a.still ? 1 : (age - DRAW) / 1.0, life, false)
    }
    // Pointing at a hub: it lights, the columns round it rise a little, and its
    // line comes up bright along its whole length at once.
    if (hovAmt > 0 && hovPlace) {
      const e = endOf(hovPlace.cell)
      const k = smooth(hovAmt)
      line(e, 1, 0.9 * k, 1.8)
      line(e, 1, 0.18 * k, 5)
      glows.push({ p: [e[0], e[1] + 0.9, e[2]], size: 18, alpha: 0.55 * k })
      heads.set([e[0], e[1] + 1.8, e[2], 0.7 * k], 12)
    }
    for (const p of S.lights) {
      if (p.cell.city < 1.5)
        glows.push({
          p: [p.cell.X, p.cell.Hh + 0.1, p.cell.Z],
          size: 9 + 8 * p.cell.city,
          alpha: 0.2 + 0.25 * p.cell.city,
        })
    }
    return { ribbons, glows, heads, youOn, la }
  }

  // ---- WebGL2
  type GLState = {
    box: WebGLProgram
    sea: WebGLProgram
    rib: WebGLProgram
    glow: WebGLProgram
    boxVao: WebGLVertexArrayObject
    seaVao: WebGLVertexArrayObject
    ribVao: WebGLVertexArrayObject
    ribBuf: WebGLBuffer
    glowVao: WebGLVertexArrayObject
    glowBuf: WebGLBuffer
    u: Map<string, WebGLUniformLocation | null>
  }
  let G: GLState | null = null
  let lost = false

  function setupGL(g: WebGL2RenderingContext): GLState {
    const prog = (vs: string, fs: string) => {
      const p = g.createProgram()!
      for (const [type, src] of [
        [g.VERTEX_SHADER, vs],
        [g.FRAGMENT_SHADER, fs],
      ] as const) {
        const s = g.createShader(type)!
        g.shaderSource(s, '#version 300 es\nprecision highp float;\n' + src)
        g.compileShader(s)
        if (!g.getShaderParameter(s, g.COMPILE_STATUS) && !g.isContextLost())
          throw new Error(g.getShaderInfoLog(s) ?? 'shader')
        g.attachShader(p, s)
      }
      g.linkProgram(p)
      if (!g.getProgramParameter(p, g.LINK_STATUS) && !g.isContextLost())
        throw new Error(g.getProgramInfoLog(p) ?? 'link')
      return p
    }
    const box = prog(BOX_VS, BOX_FS)
    const sea = prog(SEA_VS, SEA_FS)
    const rib = prog(RIB_VS, RIB_FS)
    const glow = prog(GLOW_VS, GLOW_FS)
    const face = (n: number[], pts: number[][]) => pts.flatMap((p) => [...p, ...n])
    const quad = (a: number[], b: number[], c: number[], d: number[]) => [a, b, c, a, c, d]
    const boxData = new Float32Array([
      ...face([0, 1, 0], quad([-0.5, 1, -0.5], [-0.5, 1, 0.5], [0.5, 1, 0.5], [0.5, 1, -0.5])),
      ...face([0, 0, 1], quad([-0.5, 0, 0.5], [0.5, 0, 0.5], [0.5, 1, 0.5], [-0.5, 1, 0.5])),
      ...face([-1, 0, 0], quad([-0.5, 0, -0.5], [-0.5, 0, 0.5], [-0.5, 1, 0.5], [-0.5, 1, -0.5])),
      ...face([1, 0, 0], quad([0.5, 0, 0.5], [0.5, 0, -0.5], [0.5, 1, -0.5], [0.5, 1, 0.5])),
    ])
    const boxVao = g.createVertexArray()!
    g.bindVertexArray(boxVao)
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer())
    g.bufferData(g.ARRAY_BUFFER, boxData, g.STATIC_DRAW)
    g.enableVertexAttribArray(0)
    g.vertexAttribPointer(0, 3, g.FLOAT, false, 24, 0)
    g.enableVertexAttribArray(1)
    g.vertexAttribPointer(1, 3, g.FLOAT, false, 24, 12)
    const inst = new Float32Array(S.cells.length * 7)
    S.cells.forEach((c, k) =>
      inst.set([c.X, c.Z, c.Hh, c.us ? 1 : 0, c.city, c.shadow, c.rand], k * 7)
    )
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer())
    g.bufferData(g.ARRAY_BUFFER, inst, g.STATIC_DRAW)
    g.enableVertexAttribArray(2)
    g.vertexAttribPointer(2, 4, g.FLOAT, false, 28, 0)
    g.vertexAttribDivisor(2, 1)
    g.enableVertexAttribArray(3)
    g.vertexAttribPointer(3, 3, g.FLOAT, false, 28, 16)
    g.vertexAttribDivisor(3, 1)
    const seaVao = g.createVertexArray()!
    g.bindVertexArray(seaVao)
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer())
    g.bufferData(
      g.ARRAY_BUFFER,
      new Float32Array([-260, -260, 260, -260, 260, 200, -260, -260, 260, 200, -260, 200]),
      g.STATIC_DRAW
    )
    g.enableVertexAttribArray(0)
    g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0)
    const dyn = () => {
      const vao = g.createVertexArray()!
      const buf = g.createBuffer()!
      g.bindVertexArray(vao)
      g.bindBuffer(g.ARRAY_BUFFER, buf)
      g.enableVertexAttribArray(0)
      g.vertexAttribPointer(0, 4, g.FLOAT, false, 24, 0)
      g.enableVertexAttribArray(1)
      g.vertexAttribPointer(1, 2, g.FLOAT, false, 24, 16)
      return { vao, buf }
    }
    const r = dyn()
    const gw = dyn()
    g.bindVertexArray(null)
    const u = new Map<string, WebGLUniformLocation | null>()
    for (const [name, p] of [
      ['box', box],
      ['sea', sea],
      ['glow', glow],
    ] as const) {
      for (const k of [
        'uVP',
        'uT',
        'uRip',
        'uHead',
        'uEye',
        'uFog',
        'uHov',
        'uPlane',
        'uYou',
        'uDpr',
      ])
        u.set(`${name}.${k}`, g.getUniformLocation(p, k))
    }
    return {
      box,
      sea,
      rib,
      glow,
      boxVao,
      seaVao,
      ribVao: r.vao,
      ribBuf: r.buf,
      glowVao: gw.vao,
      glowBuf: gw.buf,
      u,
    }
  }

  function ribbonVerts(out: number[], pts: Vec3[], width: number, alphaAt: (u: number) => number) {
    // A polyline as a soft quad strip, in clip space.
    const c = pts.map((p) => clip(cam.vp, p))
    for (let k = 0; k < c.length - 1; k++) {
      const a = c[k]
      const b = c[k + 1]
      if (a[3] <= 0 || b[3] <= 0) continue
      const ax = a[0] / a[3]
      const ay = a[1] / a[3]
      const bx = b[0] / b[3]
      const by = b[1] / b[3]
      let dx = (bx - ax) * W
      let dy = (by - ay) * H
      const l = Math.hypot(dx, dy) || 1
      dx /= l
      dy /= l
      // Widths are for the 450px card; a larger map gets a little bolder lines.
      const wpx = width * Math.max(1, Math.sqrt(W / 450))
      const nx = (-dy * wpx) / W
      const ny = (dx * wpx) / H
      const a0 = alphaAt(k / (c.length - 1))
      const a1 = alphaAt((k + 1) / (c.length - 1))
      const v = (p: number[], x: number, y: number, s: number, al: number) =>
        out.push(x, y, p[2] / p[3], 1, s, al)
      v(a, ax + nx, ay + ny, 1, a0)
      v(a, ax - nx, ay - ny, -1, a0)
      v(b, bx + nx, by + ny, 1, a1)
      v(a, ax - nx, ay - ny, -1, a0)
      v(b, bx - nx, by - ny, -1, a1)
      v(b, bx + nx, by + ny, 1, a1)
    }
  }

  function drawGL(g: WebGL2RenderingContext) {
    if (!G || lost) return
    const { ribbons, glows, heads, youOn } = frameContent()
    const ribV: number[] = []
    for (const r of ribbons) ribbonVerts(ribV, r.pts, r.width, r.alpha)
    const glowV: number[] = []
    for (const gl0 of glows) glowV.push(gl0.p[0], gl0.p[1], gl0.p[2], 1, gl0.size, gl0.alpha)
    const arrU = new Float32Array(24).fill(-99)
    arrivals.forEach((r, k) => arrU.set(r, k * 3))
    // Depth writes must be on before the clear: gl.clear obeys the depth mask,
    // and the glow passes turn it off.
    g.depthMask(true)
    g.enable(g.DEPTH_TEST)
    g.disable(g.BLEND)
    g.viewport(0, 0, el.canvas.width, el.canvas.height)
    g.clearColor(0.043, 0.106, 0.212, 1)
    g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT)
    // The visitor's columns rise as their line lands, and stay up.
    const you = youCell ? [youCell.X, youCell.Z, youOn] : [0, 0, 0]
    for (const [name, p] of [
      ['sea', G.sea],
      ['box', G.box],
    ] as const) {
      const U = (k: string) => G!.u.get(`${name}.${k}`) ?? null
      g.useProgram(p)
      g.uniformMatrix4fv(U('uVP'), false, cam.vp)
      g.uniform1f(U('uT'), T)
      g.uniform3fv(U('uRip'), arrU)
      g.uniform4fv(U('uHead'), heads)
      g.uniform3fv(U('uEye'), cam.eye)
      g.uniform2f(U('uFog'), cam.dist + 40, cam.dist + 110)
      g.uniform3f(U('uHov'), hovAt[0], hovAt[1], smooth(hovAmt))
      g.uniform4f(U('uPlane'), -S.cx, S.cx, -S.cz, S.cz)
      g.uniform3f(U('uYou'), you[0], you[1], you[2])
    }
    g.useProgram(G.sea)
    g.bindVertexArray(G.seaVao)
    g.drawArrays(g.TRIANGLES, 0, 6)
    g.useProgram(G.box)
    g.bindVertexArray(G.boxVao)
    g.drawArraysInstanced(g.TRIANGLES, 0, 24, S.cells.length)
    g.depthMask(false)
    g.enable(g.BLEND)
    g.blendFunc(g.ONE, g.ONE)
    g.useProgram(G.rib)
    g.bindVertexArray(G.ribVao)
    g.bindBuffer(g.ARRAY_BUFFER, G.ribBuf)
    g.bufferData(g.ARRAY_BUFFER, new Float32Array(ribV), g.DYNAMIC_DRAW)
    g.drawArrays(g.TRIANGLES, 0, ribV.length / 6)
    g.useProgram(G.glow)
    g.uniformMatrix4fv(G.u.get('glow.uVP') ?? null, false, cam.vp)
    g.uniform1f(G.u.get('glow.uDpr') ?? null, DPR * (W / 450))
    g.bindVertexArray(G.glowVao)
    g.bindBuffer(g.ARRAY_BUFFER, G.glowBuf)
    g.bufferData(g.ARRAY_BUFFER, new Float32Array(glowV), g.DYNAMIC_DRAW)
    g.drawArrays(g.POINTS, 0, glowV.length / 6)
    g.bindVertexArray(null)
  }

  // ---- the 2D fallback: the same scene, still, painted back to front
  function draw2D(ctx: CanvasRenderingContext2D) {
    const { ribbons, glows } = frameContent()
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx.fillStyle = '#0b1b36'
    ctx.fillRect(0, 0, W, H)
    const midX = (S.bounds.x0 + S.bounds.x1) / 2
    const order = [...S.cells].sort(
      (a, b) => a.Z - b.Z || Math.abs(b.X - midX) - Math.abs(a.X - midX)
    )
    const shade = (base: number[], light: number[]) =>
      `rgb(${base.map((v, i) => Math.round(Math.min(1, v * light[i]) * 255)).join(',')})`
    const poly = (pts: Vec3[], fill: string) => {
      ctx.beginPath()
      pts.forEach((p, i) => {
        const [x, y] = cam.toPx(p)
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      })
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
    }
    for (const c of order) {
      const tall = Math.max(0, Math.min(1, (c.Hh - 0.4) / 3))
      const base = c.us
        ? [0.045 + (0.3 - 0.045) * tall, 0.2 + (0.58 - 0.2) * tall, 0.37 + (0.76 - 0.37) * tall]
        : [0.048, 0.132, 0.238]
      const h = c.Hh
      const s = 0.42
      const [x0, x1, z0, z1] = [c.X - s, c.X + s, c.Z - s, c.Z + s]
      const litTop = 0.5 * (1 - c.shadow * 0.8)
      const light = (l: number) => [0.42 + l * 0.95, 0.42 + l * 1.25, 0.42 + l * 1.45]
      // The side facing the camera, then the front, then the top.
      if (c.X < midX)
        poly(
          [
            [x1, 0, z0],
            [x1, 0, z1],
            [x1, h, z1],
            [x1, h, z0],
          ],
          shade(
            base,
            light(0).map((v) => v * 0.6)
          )
        )
      else
        poly(
          [
            [x0, 0, z1],
            [x0, 0, z0],
            [x0, h, z0],
            [x0, h, z1],
          ],
          shade(
            base,
            light(0.8).map((v) => v * 0.6)
          )
        )
      poly(
        [
          [x0, 0, z1],
          [x1, 0, z1],
          [x1, h, z1],
          [x0, h, z1],
        ],
        shade(
          base,
          light(0.34).map((v) => v * 0.6)
        )
      )
      let top = shade(base, light(litTop))
      if (c.city > 1.5) top = 'rgb(230,255,255)'
      else if (c.us && c.city > 0)
        top = shade(
          base.map((v, i) => v + [0.3, 0.78, 0.95][i] * 0.75 * c.city * 0.5),
          light(litTop)
        )
      poly(
        [
          [x0, h, z0],
          [x1, h, z0],
          [x1, h, z1],
          [x0, h, z1],
        ],
        top
      )
    }
    ctx.globalCompositeOperation = 'lighter'
    for (const r of ribbons) {
      // A ribbon in WebGL fades to its edges; a stroke does not, so it is thinner and fainter.
      ctx.lineWidth = r.width * 0.8
      ctx.lineCap = 'round'
      ctx.strokeStyle = `rgba(107,235,255,${Math.min(1, r.alpha(0.5) * 0.6)})`
      ctx.beginPath()
      r.pts.forEach((p, i) => {
        const [x, y] = cam.toPx(p)
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      })
      ctx.stroke()
    }
    const scale = W / 450
    for (const g0 of glows) {
      const [x, y] = cam.toPx(g0.p)
      const r = (g0.size * scale) / 2
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, `rgba(170,240,255,${g0.alpha})`)
      grad.addColorStop(1, 'rgba(102,230,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  const ctx2d = gl ? null : el.canvas.getContext('2d')

  function render() {
    if (gl) drawGL(gl)
    else if (ctx2d) draw2D(ctx2d)
    // His face rides the top of the pillar; the label hangs under Los Angeles.
    const la = laTop()
    const foot = cam.toPx(la)
    placeAvatar(foot[0], foot[1])
    el.chip.style.transform = `translate(${Math.max(8, foot[0] - el.chip.offsetWidth / 2)}px, ${foot[1] + 12}px)`
    if (visitor && !youPlaced && el.you.hasAttribute('data-on')) {
      youPlaced = true
      placeYou()
    }
    if (!still) placeLabelEl()
    frames++
    el.card.dataset.frames = String(frames)
  }

  function resize() {
    const w = el.card.clientWidth
    const h = el.card.clientHeight
    if (!w || !h) return
    W = w
    H = h
    DPR = Math.min(window.devicePixelRatio || 1, W < 400 ? 1.5 : 2)
    el.canvas.width = Math.round(W * DPR)
    el.canvas.height = Math.round(H * DPR)
    cam = fitCamera(S, W, H)
    for (const p of pickable) px.set(p, cam.toPx(endOf(p.cell)))
    // Where each hub is on the card, for the tests (public names and card pixels only).
    el.card.dataset.hubs = JSON.stringify(
      pickable.map((p) => [placeLabel(p), Math.round(px.get(p)![0]), Math.round(px.get(p)![1])])
    )
    youPlaced = false
    render()
  }

  // ---- the loop: real time, so a slow device drops frames instead of running in slow motion
  let raf = 0
  let last: number | null = null
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.25)
    last = now
    step(dt)
    render()
  }
  let wantActive = false
  function setActive(active: boolean) {
    wantActive = active
    if (still || lost) return
    if (active && !raf) {
      last = null
      raf = requestAnimationFrame(loop)
    } else if (!active && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
    el.card.dataset.running = String(!!raf)
  }

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    G = null
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    el.card.dataset.running = 'false'
  }
  const onRestored = () => {
    if (!gl) return
    lost = false
    G = setupGL(gl)
    render()
    setActive(wantActive)
  }

  if (gl) {
    G = setupGL(gl)
    el.canvas.addEventListener('webglcontextlost', onLost)
    el.canvas.addEventListener('webglcontextrestored', onRestored)
  }
  el.card.dataset.mode = still ? 'still' : 'moving'
  el.card.dataset.renderer = mode
  el.card.dataset.running = 'false'
  resize()

  return {
    mode,
    resize,
    setActive,
    setVisitor(v) {
      applyVisitor(v, T + 0.2)
      // Routes already on their way stay; the next one waits for the line to land.
      if (!still) nextAuto = Math.max(nextAuto, T + 0.2 + YOU_DRAW + 0.4)
      render()
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      for (const [type, fn] of listeners) el.card.removeEventListener(type, fn as EventListener)
      el.canvas.removeEventListener('webglcontextlost', onLost)
      el.canvas.removeEventListener('webglcontextrestored', onRestored)
      // Free the GPU now rather than when the canvas is collected.
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
