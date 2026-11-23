// Time Travel Agency: Karten ziehen – gleiche Auswahl-Logik wie Crime Scene, Reporter und Silent Teacher
// (Aufgabentypen werden mit den Punkten freigeschaltet, 20 % Wiederholung früherer Level).

import { pick, sample, shuffle, freigeschaltet, ZIEL_PUNKTE } from '../../silent-teacher/engine.js'

export { ZIEL_PUNKTE }
export const ARTEN = ['zeit', 'prog', 'perf', 'fut', 'aux', 'prep']

const WIEDERHOLUNG = 0.2
const WIEDERHOLUNG_AB_PUNKTEN = 3
const NEUESTER_TYP = 0.5

/** Frage über den Antwortknöpfen, je nach Art der Lücke */
export const FRAGE = {
  zeit: 'Which verb form fits?',
  prog: 'Which progressive form? (in the middle of it)',
  perf: 'Which perfect form? (looking back)',
  fut: 'Which future form?',
  aux: 'Which helping verb?',
  prep: 'Which little word?',
}

/** Name und Bauplan der Form – wird nach der Antwort angezeigt (k = Farbe) */
export const FORMEN = {
  'present-simple': { t: 'simple present', bau: 'verb (+ -s for he / she / it)', k: 'zeit' },
  'present-progressive': { t: 'present progressive', bau: 'am / is / are + -ing', k: 'prog' },
  'past-simple': { t: 'simple past', bau: 'verb + -ed / 2nd form · didn’t + verb', k: 'zeit' },
  'past-progressive': { t: 'past progressive', bau: 'was / were + -ing', k: 'prog' },
  'present-perfect': { t: 'present perfect', bau: 'have / has + 3rd form', k: 'perf' },
  'past-perfect': { t: 'past perfect', bau: 'had + 3rd form', k: 'perf' },
  'present-perfect-progressive': { t: 'present perfect progressive', bau: 'have / has been + -ing', k: 'perf' },
  'past-perfect-progressive': { t: 'past perfect progressive', bau: 'had been + -ing', k: 'perf' },
  will: { t: 'will-future', bau: 'will + infinitive', k: 'fut' },
  'going-to': { t: 'going to', bau: 'am / is / are going to + infinitive', k: 'fut' },
  'future-progressive': { t: 'future progressive', bau: 'will be + -ing', k: 'fut' },
  'future-perfect': { t: 'future perfect', bau: 'will have + 3rd form', k: 'fut' },
}

export function kartenSchluessel(k) {
  return k.satz.map((t) => (typeof t === 'string' ? t : t.t ?? t.answer)).join('')
}

/** Lücken der Karte mit gemischten Antworten (richtig + die typische + eine weitere falsche) */
function mitAntworten(k) {
  const slots = []
  const satz = k.satz.map((t) => {
    if (typeof t === 'string' || !t.wrong) return t
    const [typisch, ...rest] = [...new Set(t.wrong)].filter((w) => w !== t.answer)
    const falsch = [typisch, ...sample(rest, 1)].filter(Boolean)
    const i = slots.length
    slots.push({
      k: t.k,
      answer: t.answer,
      hint: t.hint ?? '',
      choices: shuffle([t.answer, ...falsch]),
      tipp: Array.isArray(k.tipp) ? k.tipp[i] ?? k.tipp[0] : k.tipp,
    })
    return { slot: i, k: t.k, hint: t.hint ?? '' }
  })
  return { ...k, satz, slots }
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
  return mitAntworten(k)
}
