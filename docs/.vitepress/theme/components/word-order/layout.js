// Maße für die Word-order-Grafiken: Wörter als Waggons eines Zuges (Schrift 15px).
import { CHAR } from '../reported-speech/layout.js'

export const H = 34
export const GAP = 14

export const wagenW = (t) => Math.max(42, Math.round(t.length * CHAR + 22))

/** Legt Waggons nebeneinander: liefert x (links), w, cx (Mitte), r (rechts). */
export function zug(teile, x = 0, gap = GAP) {
  let cx = x
  return teile.map((p) => {
    const w = p.w ?? wagenW(p.t)
    const r = { ...p, x: cx, w, cx: cx + w / 2, r: cx + w }
    cx += w + gap
    return r
  })
}

export const ende = (r) => r[r.length - 1].r

/** Kurzschreibweise: 'Tom:s plays:v football.:o' → [{t,k}] ; Leerzeichen im Wort als _ */
export function S(str) {
  return str.split(' ').map((w) => {
    const i = w.lastIndexOf(':')
    return { t: w.slice(0, i).replace(/_/g, ' '), k: w.slice(i + 1) }
  })
}
