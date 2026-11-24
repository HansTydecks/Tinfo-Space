// Word Order Express: Karten ziehen – gleiche Auswahl-Logik wie Time Travel Agency, Crime Scene und Reporter
// (Aufgabentypen werden mit den Punkten freigeschaltet, 20 % Wiederholung früherer Level).

import { pick, shuffle, freigeschaltet, ZIEL_PUNKTE } from '../../silent-teacher/engine.js'
import { norm, gross } from './grammatik.js'

export { ZIEL_PUNKTE, norm }

const WIEDERHOLUNG = 0.2
const WIEDERHOLUNG_AB_PUNKTEN = 3
const NEUESTER_TYP = 0.5

/** Frage über dem Spielfeld, je nach Kartenart */
export const FRAGE = {
  bau: 'Tap the wagons in the right order.',
  slot: 'Tap the gap where the wagon belongs.',
  fix: 'Tap the wagon that is in the wrong place.',
  wahl: 'Which train is right?',
}

export function kartenSchluessel(k) {
  const teile = k.teile ?? k.satz ?? k.optionen?.[0].teile ?? []
  return k.art + ':' + norm([...(k.vor ?? []), ...teile, ...(k.wort ? [k.wort] : [])])
}

/**
 * Satz zum Anzeigen: erster Waggon groß, Satzzeichen am letzten.
 * @returns {{ t: string, k: string }[]}
 */
export function anzeige(teile, ende = '') {
  return teile.map((x, i) => {
    let t = i === 0 ? gross(x.t) : x.t
    if (i === teile.length - 1 && ende && !/[.!?]$/.test(t)) t += ende
    return { ...x, t }
  })
}

/** Index der ersten Abweichung des gebauten Zugs von der nächstgelegenen Lösung */
export function pruefeBau(k, gebaut) {
  const text = norm(gebaut)
  if (k.loesungen.includes(text)) return { ok: true }
  const woerter = (s) => s.split(' ')
  const g = gebaut.map((x) => norm([x]))
  let beste = null
  for (const l of k.loesungen) {
    // Waggon für Waggon gegen die Lösung legen
    let rest = woerter(l)
    let i = 0
    for (; i < g.length; i++) {
      const w = woerter(g[i])
      if (rest.slice(0, w.length).join(' ') !== w.join(' ')) break
      rest = rest.slice(w.length)
    }
    if (!beste || i > beste.i) beste = { i, l }
  }
  return { ok: false, erster: beste.i, reihe: k.reihen[k.loesungen.indexOf(beste.l)] }
}

/** Karte spielbereit machen: Waggons im Bahnhof mischen, Optionen mischen */
function vorbereiten(k) {
  if (k.art === 'bau') {
    let hof = k.teile.map((x, i) => ({ ...x, id: i }))
    for (let v = 0; v < 8; v++) {
      hof = shuffle(hof)
      if (!k.loesungen.includes(norm(hof))) break
    }
    return { ...k, hof }
  }
  if (k.art === 'wahl') return { ...k, optionen: shuffle(k.optionen) }
  return k
}

/**
 * Nächste Karte.
 * @param {Function[]} neu   Aufgaben des Levels, leicht → schwer
 * @param {Function[]} alt   Aufgaben früherer Level (Wiederholung)
 * @param {{ punkte: number, gezeigt: number, letzteKarte: string }} verlauf
 */
export function naechsteKarte(neu, alt, verlauf) {
  const punkte = verlauf.punkte ?? 0
  const offen = freigeschaltet(neu.length, punkte)
  const gezeigt = verlauf.gezeigt ?? 0
  let pool
  if (offen > gezeigt) {
    pool = [neu[gezeigt]]
    verlauf.gezeigt = gezeigt + 1
  } else if (alt.length > 0 && punkte >= WIEDERHOLUNG_AB_PUNKTEN && Math.random() < WIEDERHOLUNG) {
    pool = alt
  } else if (Math.random() < NEUESTER_TYP) {
    pool = [neu[offen - 1]]
  } else {
    pool = neu.slice(0, offen)
  }
  let k
  for (let versuch = 0; versuch < 12; versuch++) {
    k = pick(pool)()
    if (kartenSchluessel(k) !== verlauf.letzteKarte) break
  }
  return vorbereiten(k)
}
