// Crime Scene: Karten ziehen – gleiche Auswahl-Logik wie Reporter und Silent Teacher
// (Aufgabentypen werden mit den Punkten freigeschaltet, 20 % Wiederholung früherer Level).

import { pick, sample, shuffle, freigeschaltet, ZIEL_PUNKTE } from '../../silent-teacher/engine.js'
import { NONE } from './grammatik.js'
import { LEVELS } from './levels.js'

export { ZIEL_PUNKTE, NONE }
export const ARTEN = ['obj', 'verb', 'be', 'pp', 'agent', 'order']

const WIEDERHOLUNG = 0.2
const WIEDERHOLUNG_AB_PUNKTEN = 3
const NEUESTER_TYP = 0.5

/** Frage über den Antwortknöpfen, je nach Art der Lücke */
export const FRAGE = {
  obj: 'What is the new subject?',
  verb: 'Which verb form fits?',
  be: 'Which form of “be”?',
  pp: 'Which past participle (3rd form)?',
  agent: 'by … – or nothing?',
  order: 'What comes next?',
}

/** Standard-Tipps (eine Karte kann eigene Tipps haben) */
const TIPP = {
  obj: 'The object of the active sentence – the thing something happens to – moves to the front and becomes the new subject.',
  verb: 'Passive = be + past participle (3rd form): is stolen · was stolen · has been stolen.',
  be: '“be” shows the tense and agrees with the NEW subject: the window → was, the windows → were. Progressive → being, perfect → been.',
  pp: 'Always the 3rd form (past participle): steal – stole – stolen, break – broke – broken, find – found – found.',
  agent: 'Keep “by …” only when it matters who did it. Leave out someone, somebody, they, people.',
  order: 'Look at the pattern: subject + is said / believed + to + infinitive.',
}

/** Abschnitt der Lernseite passend zur Lücke */
const ANKER = { obj: 'big-picture', verb: 'form', be: 'tenses', pp: 'form', agent: 'by-agent', order: 'advanced' }

export const label = (w) => (w === NONE ? '— (nothing)' : w)

export function kartenSchluessel(k) {
  const text = (teile) => teile.map((t) => (typeof t === 'string' ? t : t.t ?? t.answer)).join('')
  return text(k.direkt) + '\u0000' + text(k.bericht)
}

const jeArt = (wert, art) => (typeof wert === 'string' ? wert : wert?.[art])

/** Lücken der Karte mit gemischten Antworten (richtig + die typische + eine weitere falsche) */
function mitAntworten(k, levelIdx) {
  const slots = []
  const bericht = k.bericht.map((t) => {
    if (typeof t === 'string' || !t.wrong) return t
    const [typisch, ...rest] = [...new Set(t.wrong)].filter((w) => w !== t.answer)
    const falsch = [typisch, ...sample(rest, 1)].filter(Boolean)
    slots.push({
      k: t.k,
      answer: t.answer,
      choices: shuffle([t.answer, ...falsch]),
      tipp: jeArt(k.tipp, t.k) ?? TIPP[t.k] ?? '',
      anker: jeArt(k.anker, t.k) ?? ANKER[t.k] ?? LEVELS[levelIdx]?.anker ?? '',
    })
    return { slot: slots.length - 1, k: t.k }
  })
  return { ...k, bericht, slots }
}

/**
 * Nächste Karte.
 * @param {Function[]} neu   Aufgaben des Levels, leicht → schwer
 * @param {Function[]} alt   Aufgaben früherer Level (Wiederholung)
 * @param {{ punkte: number, gezeigt: number, letzteKarte: string }} verlauf
 */
export function naechsteKarte(neu, alt, verlauf, levelIdx) {
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
  return mitAntworten(k, levelIdx)
}

/**
 * „What changed?": aktives Verb → Passiv-Verb, Täter → by … / weggelassen.
 * @param {object} k  Karte (nach mitAntworten)
 */
export function aenderungen(k) {
  const wort = (t) => (t.slot !== undefined ? k.slots[t.slot].answer : t.t)
  const marken = (teile, arten) => teile.filter((t) => typeof t === 'object' && arten.includes(t.k)).map(wort)
  const paare = []
  const verbVorher = marken(k.direkt, ['verb'])
  const verbNachher = marken(k.bericht, ['verb', 'be', 'pp'])
  if (verbVorher.length && verbNachher.length) {
    paare.push({ k: 'be', von: verbVorher.join(' … '), zu: verbNachher.join(' ') })
  }
  const agentVorher = marken(k.direkt, ['agent'])
  const agentNachher = marken(k.bericht, ['agent'])
  if (agentVorher.length === 1 && agentNachher.length <= 1 && !k.bericht.some((t) => t.k === 'order')) {
    const zu = agentNachher[0]
    paare.push({ k: 'agent', von: agentVorher[0], zu: zu?.startsWith('by ') ? zu : 'left out' })
  }
  return paare
}
