/**
 * The bold map's shaders (WebGL2, GLSL ES 3.0). Colours are the site's navy,
 * sky and cyan; the light comes from a low sun in the west, Los Angeles' side.
 */

export const COMMON = `
uniform float uT; uniform vec3 uRip[8]; uniform vec4 uHead[4]; uniform vec3 uEye; uniform vec2 uFog; uniform vec3 uHov; uniform vec4 uPlane; uniform vec3 uYou;
const vec3 FOG = vec3(0.043, 0.106, 0.212);
const vec3 SEA = vec3(0.028, 0.075, 0.150);
// The world beyond the data fades into the sea instead of ending at a hard edge.
float inside(vec2 xz) { return smoothstep(0., 7., min(min(xz.x - uPlane.x, uPlane.y - xz.x), min(xz.y - uPlane.z, uPlane.w - xz.y))); }
// An arrival: the columns under a place rise gently, hold a while and settle.
// uRip holds the last eight arrivals (x, z, time); uYou is the visitor's place, which stays up.
float arrive(vec2 xz) {
  float r = uYou.z * (1. - smoothstep(0.4, 2.2, distance(xz, uYou.xy)));
  for (int k = 0; k < 8; k++) { float age = uT - uRip[k].z; if (age < 0. || age > 13.) continue; r += (1. - smoothstep(0.4, 2.2, distance(xz, uRip[k].xy))) * smoothstep(0., 1.0, age) * (1. - smoothstep(1.6, 3.6, age)); }
  return min(r, 1.);
}
vec3 heads(vec3 w, vec3 n, float wrap) { vec3 sum = vec3(0.); for (int k = 0; k < 4; k++) { vec3 d = uHead[k].xyz - w; float att = uHead[k].w / (1. + dot(d, d) * 0.085); sum += vec3(0.35, 0.9, 1.) * att * max(dot(n, normalize(d)), wrap); } return sum; }
float fog(vec3 w) { return smoothstep(uFog.x, uFog.y, distance(w, uEye)); }
`

/** The columns: one instanced box per cell, lit per pixel. */
export const BOX_VS = `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec4 aCell; layout(location=3) in vec3 aMore;
uniform mat4 uVP; ${COMMON}
out vec3 vW; out vec3 vN; out vec4 vCell; out vec3 vMore; out vec3 vL; out float vRip;
void main() {
  float rip = arrive(aCell.xy);
  float h = aCell.z + rip * (aCell.w > .5 ? 0.7 : 0.25);
  h += uHov.z * aCell.w * 0.9 * (1. - smoothstep(0.4, 1.9, distance(aCell.xy, uHov.xy)));
  h *= mix(inside(aCell.xy), 1., aCell.w);
  vW = vec3(aCell.x + aPos.x * 0.84, aPos.y * h, aCell.y + aPos.z * 0.84);
  vN = aNor; vCell = aCell; vMore = aMore; vL = aPos; vRip = rip;
  gl_Position = uVP * vec4(vW, 1.);
}`

export const BOX_FS = `
in vec3 vW; in vec3 vN; in vec4 vCell; in vec3 vMore; in vec3 vL; in float vRip; out vec4 o; ${COMMON}
void main() {
  float us = vCell.w, top = step(.5, vN.y), tall = clamp((vCell.z - 0.4) / 3.0, 0., 1.);
  vec3 base = mix(vec3(0.048, 0.132, 0.238), mix(vec3(0.045, 0.200, 0.370), vec3(0.30, 0.58, 0.76), tall), us);
  vec3 sun = normalize(vec3(-0.80, 0.50, 0.34));
  float lit = max(dot(vN, sun), 0.) * (1. - vMore.y * 0.8);
  vec3 col = base * (0.42 + lit * vec3(0.95, 1.25, 1.45));
  if (top < .5) col *= mix(0.34, 0.85, vL.y);
  else col *= 1. - 0.22 * smoothstep(0.36, 0.5, max(abs(vL.x), abs(vL.z)));
  col += (base * 2.2 + 0.03) * heads(vW, vN, 0.12);
  float tw = 0.78 + 0.22 * sin(uT * 1.7 + vMore.z * 40.);
  float city = vMore.x;
  col += top * us * min(city, 1.) * vec3(0.30, 0.78, 0.95) * 0.75 * tw;
  if (city > 1.5) col = mix(col, vec3(0.9, 1., 1.), top * 0.95 + 0.25);
  col += vec3(0.42, 0.86, 1.0) * vRip * top * 0.26;
  col = mix(SEA, col, mix(inside(vCell.xy), 1., us));
  o = vec4(mix(col, FOG, fog(vW)), 1.);
}`

/** The sea: the site's grid, catching the same light. */
export const SEA_VS = `
layout(location=0) in vec2 aPos; uniform mat4 uVP; out vec3 vW;
void main() { vW = vec3(aPos.x, 0., aPos.y); gl_Position = uVP * vec4(vW, 1.); }`

export const SEA_FS = `
in vec3 vW; out vec4 o; ${COMMON}
void main() {
  vec2 g = abs(fract(vW.xz / 4. + .5) - .5) * 4., fw = fwidth(vW.xz) * 1.2;
  float line = max(1. - smoothstep(0., fw.x, g.x), 1. - smoothstep(0., fw.y, g.y));
  vec3 col = vec3(0.028, 0.075, 0.150) + line * vec3(0.022, 0.060, 0.090);
  col += vec3(0.05, 0.16, 0.22) * heads(vW, vec3(0., 1., 0.), 0.);
  o = vec4(mix(col, FOG, fog(vW)), 1.);
}`

/** Routes and the light pillar: ribbons built in clip space on the CPU, added on. */
export const RIB_VS = `
layout(location=0) in vec4 aPos; layout(location=1) in vec2 aSA; out vec2 vSA;
void main() { vSA = aSA; gl_Position = aPos; }`

export const RIB_FS = `
in vec2 vSA; out vec4 o;
void main() { float e = 1. - abs(vSA.x); o = vec4(vec3(0.42, 0.92, 1.) * vSA.y * e * e, 1.); }`

/** Glows: soft points for route ends, the cities and Los Angeles, added on. */
export const GLOW_VS = `
layout(location=0) in vec4 aPos; layout(location=1) in vec2 aSI; uniform mat4 uVP; uniform float uDpr; out float vI; out float vWarm;
void main() { vI = aSI.y; vWarm = aPos.w - 1.; gl_Position = uVP * vec4(aPos.xyz, 1.); gl_PointSize = aSI.x * uDpr; }`

export const GLOW_FS = `
in float vI; in float vWarm; out vec4 o;
void main() { float d = length(gl_PointCoord - .5) * 2.; float a = exp(-d * d * 4.5) - 0.011; vec3 tint = mix(vec3(0.40, 0.90, 1.), vec3(1.0, 0.78, 0.46), vWarm); o = vec4(tint * max(a, 0.) * vI + mix(vec3(1.), vec3(1., 0.93, 0.8), vWarm) * max(exp(-d * d * 30.) - .02, 0.) * vI * 0.6, 1.); }`
