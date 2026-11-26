/**
 * The bold map's one fixed camera: looking north from the south, 58 degrees
 * down, fitted so the lower 48 fill the card's width and sit centred above the
 * title. Column-major 4x4 matrices, as WebGL takes them.
 */
import type { Scene } from './scene'

export type Mat4 = Float32Array
export type Vec3 = readonly [number, number, number]

const rad = Math.PI / 180

/** Room kept above the map, in card pixels (it was 44 under the old caption). */
export const MAP_TOP = 18

function mul(a: Mat4, b: Mat4): Mat4 {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3]
  return o
}

function persp(fovy: number, asp: number, near: number, far: number): Mat4 {
  const t = 1 / Math.tan(fovy / 2)
  const o = new Float32Array(16)
  o[0] = t / asp
  o[5] = t
  o[10] = (far + near) / (near - far)
  o[11] = -1
  o[14] = (2 * far * near) / (near - far)
  return o
}

const norm = (v: number[]) => {
  const l = Math.hypot(...v)
  return v.map((x) => x / l)
}
const cross = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

function lookAt(e: number[], t: number[]): Mat4 {
  const f = norm([t[0] - e[0], t[1] - e[1], t[2] - e[2]])
  const s = norm(cross(f, [0, 1, 0]))
  const u = cross(s, f)
  // prettier-ignore
  return new Float32Array([
    s[0], u[0], -f[0], 0,
    s[1], u[1], -f[1], 0,
    s[2], u[2], -f[2], 0,
    -(s[0] * e[0] + s[1] * e[1] + s[2] * e[2]),
    -(u[0] * e[0] + u[1] * e[1] + u[2] * e[2]),
    f[0] * e[0] + f[1] * e[1] + f[2] * e[2],
    1,
  ])
}

export function clip(m: Mat4, p: Vec3): [number, number, number, number] {
  return [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
    m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15],
  ]
}

export type Camera = {
  vp: Mat4
  eye: [number, number, number]
  dist: number
  /** A world point in card pixels: [x, y, depth, w]. */
  toPx: (p: Vec3) => [number, number, number, number]
  /** The lowest a label may reach, in card pixels (the title is below it). */
  labelMax: number
  /** The top of the map's room, in card pixels: labels and the avatar stay below it. */
  top: number
}

export function fitCamera(s: Scene, W: number, H: number): Camera {
  const { x0, x1, z0, z1 } = s.bounds
  // A card taller than it is wide (the bento card from 768 to 1023px is 351 by
  // 478) square on would leave a band of empty sea between the country and the
  // title: there the camera turns and looks more steeply down, and the country
  // fills the height between the caption and the title.
  const tall = Math.max(0, Math.min(1, (H / W - 1.05) / 0.3))
  // The top of the room the country fits in. There is no caption above it any
  // more (owner, 2026-11-25: "dont need those captions"), so the map uses the
  // space it held (44px) and sits higher.
  const top = MAP_TOP
  const elev = (58 + 14 * tall) * rad
  // Turned to look from the south-east, the country runs corner to corner (Los
  // Angeles up on the left, the east coast nearer, lower right) and fills a
  // portrait card far better than square on.
  const yaw = 28 * tall * rad
  const bottom = H * 0.73 + tall * (H - 92 - H * 0.73)
  const tgt = [(x0 + x1) / 2, 0, (z0 + z1) / 2]
  const P = persp(30 * rad, W / H, 1, 600)
  let eye: [number, number, number] = [0, 0, 0]
  const build = (dist: number) => {
    eye = [
      tgt[0] + dist * Math.sin(yaw) * Math.cos(elev),
      dist * Math.sin(elev),
      tgt[2] + dist * Math.cos(yaw) * Math.cos(elev),
    ]
    return mul(P, lookAt(eye, tgt))
  }
  // What has to fit: the box round the lower 48 (as the lab sketch fitted it),
  // or, turned, the country itself, since a turned box's corners are open sea.
  const corners: Vec3[] =
    tall > 0
      ? s.cells.filter((c) => c.us).map((c): Vec3 => [c.X, 0, c.Z])
      : [
          [x0, 0, z0],
          [x1, 0, z0],
          [x0, 0, z1],
          [x1, 0, z1],
        ]
  const extent = (m: Mat4) => {
    let a = Infinity
    let b = -Infinity
    let c = Infinity
    let d = -Infinity
    for (const p of corners) {
      const q = clip(m, p)
      a = Math.min(a, q[0] / q[3])
      b = Math.max(b, q[0] / q[3])
      c = Math.min(c, q[1] / q[3])
      d = Math.max(d, q[1] / q[3])
    }
    return [a, b, c, d]
  }
  // Fit the width (a little more room on the left, where Los Angeles' pin is),
  // then centre the country between the caption and the title.
  // Room on the left for his avatar over the sea, west of Los Angeles; the
  // turned view brings California nearer the edge, so it needs a little more.
  const padL = W * (0.11 + 0.06 * tall)
  const padR = W * (0.035 - 0.025 * tall)
  const want = ((W - padL - padR) / W) * 2
  // On a wide card the height is the limit instead: the country stays between
  // the caption and the top of the title.
  const wantV = ((bottom - top) / H) * 2
  let lo = 20
  let hi = 500
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) / 2
    const e = extent(build(mid))
    if (e[1] - e[0] > want || e[3] - e[2] > wantV) lo = mid
    else hi = mid
  }
  const fit = extent(build(hi))
  const m = build(hi)
  const ox = ((padL + (W - padL - padR) / 2) / W) * 2 - 1 - (fit[0] + fit[1]) / 2
  // Centred between the caption and the title.
  const oy = 1 - ((top + bottom) / 2 / H) * 2 - (fit[2] + fit[3]) / 2
  for (let c = 0; c < 4; c++) {
    m[c * 4] += ox * m[c * 4 + 3]
    m[c * 4 + 1] += oy * m[c * 4 + 3]
  }
  const toPx = (p: Vec3): [number, number, number, number] => {
    const q = clip(m, p)
    return [((q[0] / q[3]) * 0.5 + 0.5) * W, (0.5 - (q[1] / q[3]) * 0.5) * H, q[2] / q[3], q[3]]
  }
  // Labels stay above the title: 76% of the card, lower on a tall card.
  const labelMax = H * 0.76 + tall * (H - 96 - H * 0.76)
  return { vp: m, eye, dist: hi, toPx, labelMax, top }
}
