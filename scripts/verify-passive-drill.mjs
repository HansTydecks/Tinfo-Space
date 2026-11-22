// Prüft alle Aufgaben des Spiels „Crime Scene" (Passive voice).
//
//   npm run test:passive            alle Level, 300 Karten je Aufgabe
//   npm run test:passive -- --runs 50 --zeige 3
//
// Geprüft wird pro Karte:
//   - aktiver Satz hat keine Lücken, Passiv-Satz hat mindestens eine Lücke
//   - jede Lücke: genau 3 verschiedene Antworten, die richtige ist dabei, Tipp und Anker vorhanden
//   - keine übrig gebliebenen Platzhalter, keine doppelten Leerzeichen
//   - Satzanfang groß, Satzende mit . oder ?
// Außerdem: feste Grammatik-Stichproben, Anker auf der Lernseite und Anzahl verschiedener Karten je Level.

import { dirname, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'docs', '.vitepress', 'theme', 'components', 'passive', 'drill')
const load = (p) => import(pathToFileURL(join(dir, p)).href)

const { default: AUFGABEN } = await load('aufgaben.js')
const { LEVELS } = await load('levels.js')
const { naechsteKarte, aenderungen, ARTEN } = await load('engine.js')
const { beForm, aktiv, VERBEN, NONE, verb } = await load('grammatik.js')

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? Number(args[i + 1]) : def
}
const RUNS = opt('--runs', 300)
const ZEIGE = opt('--zeige', 0)

const fehler = []
const melde = (wo, text) => fehler.push(`${wo}: ${text}`)

// ---------------------------------------------------------------------------
// Grammatik-Stichproben
// ---------------------------------------------------------------------------
const steal = verb('steal')
const erwartet = [
  [beForm('present simple', 'sg'), 'is'],
  [beForm('present simple', 'pl'), 'are'],
  [beForm('past simple', 'pl'), 'were'],
  [beForm('present progressive', 'sg'), 'is being'],
  [beForm('past progressive', 'pl'), 'were being'],
  [beForm('present perfect', 'sg'), 'has been'],
  [beForm('present perfect', 'pl'), 'have been'],
  [beForm('past perfect', 'sg'), 'had been'],
  [beForm('will', 'pl'), 'will be'],
  [beForm('going to', 'sg'), 'is going to be'],
  [beForm('have to', 'sg'), 'has to be'],
  [beForm('can’t', 'sg'), 'can’t be'],
  [steal.pp, 'stolen'],
  [verb('find').pp, 'found'],
  [aktiv('present simple', 'sg', steal), 'steals'],
  [aktiv('present perfect', 'pl', steal), 'have stolen'],
]
erwartet.forEach(([ist, soll], i) => ist !== soll && melde(`Grammatik ${i + 1}`, `„${ist}" statt „${soll}"`))
for (const v of VERBEN) {
  if (Object.values(v).some((x) => x === undefined || x === '')) melde(`Verb ${v.base}`, 'Form fehlt')
  if (v.objekte.length < 2) melde(`Verb ${v.base}`, 'weniger als 2 Objekte')
}

// ---------------------------------------------------------------------------
// Aufgaben
// ---------------------------------------------------------------------------
if (AUFGABEN.length !== LEVELS.length) melde('Level', `${AUFGABEN.length} Aufgaben-Level, ${LEVELS.length} in levels.js`)

const lektion = join(root, 'docs', 'students', 'english', 'grammar', 'passive', 'index.md')
const spiel = join(root, 'docs', 'students', 'english', 'grammar', 'passive', 'crime-scene.md')
if (!existsSync(spiel)) melde('Seite', 'crime-scene.md fehlt')
const md = existsSync(lektion) ? readFileSync(lektion, 'utf8') : ''
if (!md) melde('Seite', 'passive/index.md fehlt')
const anker = new Set()

const text = (k, teile) =>
  teile
    .map((t) => (typeof t === 'string' ? t : t.slot !== undefined ? k.slots[t.slot].answer : t.t))
    .join('')
    .replace(new RegExp(`\\s*${NONE}\\s*`, 'g'), ' ')
    .replace(/ ([.?])$/, '$1')

let gesamt = 0
AUFGABEN.forEach((aufgaben, li) => {
  const saetze = new Set()
  anker.add(LEVELS[li].anker)
  aufgaben.forEach((aufgabe, ai) => {
    const wo = `L${li + 1} A${ai + 1}`
    if (typeof aufgabe !== 'function') return melde(wo, 'keine Funktion')
    for (let r = 0; r < RUNS; r++) {
      const k = naechsteKarte([aufgabe], [], { punkte: 8, gezeigt: 1, letzteKarte: '' }, li)
      const d = text(k, k.direkt)
      const b = text(k, k.bericht)
      const w = `${wo} „${d}" → „${b}"`
      if (!k.sprecher?.e || !k.sprecher?.n) melde(w, 'Sprecher fehlt')
      if (k.direkt.some((t) => typeof t === 'object' && t.wrong)) melde(w, 'Lücke im aktiven Satz')
      if (k.slots.length === 0) melde(w, 'keine Lücke')
      for (const s of k.slots) {
        if (new Set(s.choices).size !== 3) melde(w, `Antworten nicht 3 verschiedene: ${s.choices.join(' / ')}`)
        if (!s.choices.includes(s.answer)) melde(w, 'richtige Antwort fehlt')
        if (!s.tipp) melde(w, 'kein Tipp')
        if (!s.anker) melde(w, 'kein Anker')
        anker.add(s.anker)
        if (!ARTEN.includes(s.k)) melde(w, `unbekannte Art ${s.k}`)
      }
      for (const [name, satz] of [['aktiv', d], ['Passiv', b]]) {
        if (/[{}[\]]|undefined|null/.test(satz)) melde(w, `${name}: Platzhalter übrig`)
        if (/ {2}/.test(satz)) melde(w, `${name}: doppeltes Leerzeichen`)
        if (satz !== satz.trim()) melde(w, `${name}: Leerzeichen am Rand`)
        if (!/^[A-Z]/.test(satz)) melde(w, `${name}: Satzanfang klein`)
        if (!/[^ ][.?]$/.test(satz)) melde(w, `${name}: kein Satzzeichen am Ende`)
      }
      if (d.endsWith('?') !== b.endsWith('?')) melde(w, 'Frage ↔ Aussage passt nicht')
      aenderungen(k)
      saetze.add(d + '|' + b)
      if (r < ZEIGE) console.log(`${wo}  ${k.sprecher.n}: „${d}"  →  ${b}`)
    }
  })
  console.log(`Level ${li + 1} (${LEVELS[li].titel}): ${saetze.size} verschiedene Karten`)
  gesamt += saetze.size
})

for (const a of anker) {
  if (md && !md.includes(`{#${a}}`)) melde('Lernseite', `Anker #${a} fehlt`)
}

console.log(`\nInsgesamt: ${gesamt} verschiedene Karten (Stichprobe aus ${RUNS} Ziehungen je Aufgabe)`)
if (fehler.length) {
  const einzeln = [...new Set(fehler)]
  console.error(`\n${einzeln.length} Fehler:`)
  einzeln.slice(0, 60).forEach((f) => console.error(' - ' + f))
  process.exit(1)
}
console.log('Alles in Ordnung.')
