/**
 * "Continue where you were" (owner, 2026-11-08): when a visitor leaves the
 * home page for /about, the home page remembers how far down it was; /about
 * offers to go back there, and the home page restores it. Session storage
 * only (this tab), and every access is guarded: blocked storage just means
 * the button doesn't show.
 */
const LEFT_HOME_AT = 'portfolio-left-home-at'
const RESTORE_TO = 'portfolio-restore-to'

/**
 * A spot on the home page: the section at the top of the screen and how far
 * into it, so it lands right even if something above loads at another height.
 */
export interface HomeSpot {
  section: string
  offset: number
}

const read = (key: string): HomeSpot | null => {
  try {
    const raw = sessionStorage.getItem(key)
    if (raw === null) return null
    const spot = JSON.parse(raw) as HomeSpot
    return typeof spot?.section === 'string' && Number.isFinite(spot.offset) ? spot : null
  } catch {
    return null
  }
}
const write = (key: string, spot: HomeSpot | null) => {
  try {
    if (spot === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, JSON.stringify(spot))
  } catch {
    // Storage blocked: nothing to return to.
  }
}

/** The home page, on its way to /about: remember where it was. */
export const rememberHomeSpot = () => {
  // The last section whose top is at or above the screen's top (the hero when none is).
  const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')]
  const current = sections.filter((el) => el.getBoundingClientRect().top <= 1).pop()
  write(
    LEFT_HOME_AT,
    current
      ? { section: current.id, offset: Math.round(-current.getBoundingClientRect().top) }
      : { section: '', offset: Math.round(window.scrollY) }
  )
}
/** The home page, on load: any earlier spot is stale now. */
export const forgetHomeSpot = () => write(LEFT_HOME_AT, null)
/** /about: where the visitor left the home page, if they came from it. */
export const homeSpot = () => read(LEFT_HOME_AT)
/** /about's button: hand that spot to the home page to restore. */
export const returnToHomeSpot = () => {
  write(RESTORE_TO, homeSpot())
  write(LEFT_HOME_AT, null)
}
/** The home page, on load: the spot to restore, once (it is cleared as it is read). */
export const takeRestoreSpot = () => {
  const y = read(RESTORE_TO)
  write(RESTORE_TO, null)
  return y
}
