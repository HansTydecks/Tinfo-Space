// Kleine Zeichenhilfen für die Zeitstrahl-Grafiken im Kapitel „Tense & aspect".

/** Wellenlinie (= progressive: etwas läuft gerade) von x1 bis x2 auf Höhe y. */
export function welle(x1, x2, y, a = 4.5, l = 12) {
  let d = `M${x1} ${y}`
  let x = x1
  let hoch = true
  while (x < x2 - 0.5) {
    const nx = Math.min(x + l, x2)
    d += ` Q${(x + nx) / 2} ${y + (hoch ? -2 * a : 2 * a)} ${nx} ${y}`
    x = nx
    hoch = !hoch
  }
  return d
}

/** Pfeilspitze nach rechts, Spitze bei (x, y). */
export const spitze = (x, y, h = 9) => `${x},${y} ${x - h},${y - h * 0.55} ${x - h},${y + h * 0.55}`
