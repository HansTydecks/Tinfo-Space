// Prüft alle Aufgaben des Spiels „Time Travel Agency" (Tense & aspect).
//
//   npm run test:tenses            alle Level, 300 Karten je Aufgabe
//   npm run test:tenses -- --runs 50 --zeige 3
//
// Geprüft wird pro Karte:
//   - mindestens eine Lücke; jede Lücke: genau 3 verschiedene Antworten, die richtige ist dabei, Tipp vorhanden
//   - Form bekannt, Seite + Anker existieren im Kapitel
//   - keine übrig gebliebenen Platzhalter, keine doppelten Leerzeichen
//   - Satzanfang groß, Satzende mit . ? oder !
// Außerdem: feste Grammatik-Stichproben und Anzahl verschiedener Karten je Level.

import { dirname, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'docs', '.vitepress', 'theme', 'components', 'tenses', 'drill')
const kapitel = join(root, 'docs', 'students', 'english', 'grammar', 'tenses')
const load = (p) => import(pathToFileURL(join(dir, p)).href)

const { default: AUFGABEN } = await load('aufgaben.js')
const { LEVELS } = await load('levels.js')
const { naechsteKarte, FORMEN, ARTEN } = await load('engine.js')
const { form, verb, VERBEN } = await load('grammatik.js')

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
const tom = { n: 'Tom', p: '3sg', g: 'm' }
const ich = { n: 'I', p: 'I' }
const wir = { n: 'we', p: 'we' }
const erwartet = [
  [form('present simple', tom, verb('play')), 'plays'],
  [form('present simple', tom, verb('study')), 'studies'],
  [form('present simple', wir, verb('go')), 'go'],
  [form('present simple', tom, verb('watch'), true), 'doesn’t watch'],
  [form('present progressive', ich, verb('run')), 'am running'],
  [form('present progressive', tom, verb('swim')), 'is swimming'],
  [form('past simple', tom, verb('go')), 'went'],
  [form('past simple', wir, verb('buy'), true), 'didn’t buy'],
  [form('past progressive', wir, verb('read')), 'were reading'],
  [form('present perfect', tom, verb('go')), 'has gone'],
  [form('present perfect', ich, verb('write')), 'have written'],
  [form('past perfect', wir, verb('eat')), 'had eaten'],
  [form('present perfect progressive', tom, verb('play')), 'has been playing'],
  [form('will', ich, verb('help')), 'will help'],
  [form('going to', tom, verb('visit')), 'is going to visit'],
  [form('future perfect', wir, verb('build')), 'will have built'],
]
erwartet.forEach(([ist, soll], i) => ist !== soll && melde(`Grammatik ${i + 1}`, `„${ist}" statt „${soll}"`))
for (const v of VERBEN) {
  for (const key of ['b', 's', 'past', 'pp', 'ing']) if (!v[key]) melde(`Verb ${v.b}`, `${key} fehlt`)
  if (!v.rest?.length) melde(`Verb ${v.b}`, 'keine Ergänzungen')
}

// ---------------------------------------------------------------------------
// Anker auf den Seiten des Kapitels
// ---------------------------------------------------------------------------
const ankerCache = {}
function anker(seite) {
  if (ankerCache[seite]) return ankerCache[seite]
  const datei = join(kapitel, (seite || 'index') + '.md')
  const ids = new Set()
  if (existsSync(datei)) for (const m of readFileSync(datei, 'utf8').matchAll(/\{#([\w-]+)\}/g)) ids.add(m[1])
  else ids.add('__fehlt__')
  ankerCache[seite] = ids
  return ids
}
if (AUFGABEN.length !== LEVELS.length) melde('Level', `${AUFGABEN.length} Aufgabenlisten für ${LEVELS.length} Level`)
LEVELS.forEach((l, i) => !anker(l.seite).has(l.anker) && melde(`Level ${i + 1}`, `Anker #${l.anker} fehlt auf ${l.seite || 'index'}`))

// ---------------------------------------------------------------------------
// Karten
// ---------------------------------------------------------------------------
const text = (k) =>
  k.satz.map((t) => (typeof t === 'string' ? t : t.slot !== undefined ? k.slots[t.slot].answer : t.t)).join('')

function pruefe(k, wo) {
  if (!k.slots.length) melde(wo, 'keine Lücke')
  for (const [i, s] of k.slots.entries()) {
    if (!ARTEN.includes(s.k)) melde(wo, `Lücke ${i + 1}: unbekannte Art ${s.k}`)
    if (s.choices.length !== 3) melde(wo, `Lücke ${i + 1}: ${s.choices.length} Antworten (${s.choices.join(' / ')})`)
    if (new Set(s.choices).size !== s.choices.length) melde(wo, `Lücke ${i + 1}: doppelte Antworten`)
    if (!s.choices.includes(s.answer)) melde(wo, `Lücke ${i + 1}: richtige Antwort fehlt`)
    if (!s.tipp) melde(wo, `Lücke ${i + 1}: kein Tipp`)
    if (s.choices.some((c) => !c || /undefined|null/.test(c))) melde(wo, `Lücke ${i + 1}: leere Antwort`)
  }
  if (!FORMEN[k.form]) melde(wo, `unbekannte Form ${k.form}`)
  if (!anker(k.seite).has(k.anker)) melde(wo, `Anker #${k.anker} fehlt auf ${k.seite || 'index'}`)
  if (!k.crew?.n || !k.ziel || !k.briefing) melde(wo, 'Crew, Ziel oder Briefing fehlt')
  const t = text(k)
  if (/[[\]{}@]|undefined/.test(t)) melde(wo, `Platzhalter übrig: ${t}`)
  if (/ {2}| [,.?!]/.test(t)) melde(wo, `Leerzeichen: „${t}"`)
  if (!/^[A-Z–]/.test(t)) melde(wo, `kleiner Anfang: ${t}`)
  if (!/[.?!]$/.test(t)) melde(wo, `kein Satzende: ${t}`)
}

let gesamt = 0
for (const [li, liste] of AUFGABEN.entries()) {
  const verschieden = new Set()
  for (const [ai, aufgabe] of liste.entries()) {
    for (let r = 0; r < RUNS; r++) {
      const k = naechsteKarte([aufgabe], [], { punkte: 0, gezeigt: 1, letzteKarte: '' })
      pruefe(k, `Level ${li + 1}, Aufgabe ${ai + 1}`)
      verschieden.add(text(k))
      if (r < ZEIGE) console.log(`L${li + 1}.${ai + 1}  ${text(k)}   [${k.slots.map((s) => s.choices.join(' / ')).join(' | ')}]`)
    }
  }
  gesamt += verschieden.size
  console.log(`Level ${li + 1} (${LEVELS[li].titel}): ${verschieden.size} verschiedene Sätze`)
  if (verschieden.size < 40) melde(`Level ${li + 1}`, `nur ${verschieden.size} verschiedene Sätze`)
}

if (fehler.length) {
  const einzeln = [...new Set(fehler)]
  console.error(`\n✗ ${einzeln.length} Fehler:`)
  einzeln.slice(0, 40).forEach((f) => console.error('  ' + f))
  process.exit(1)
}
console.log(`\n✓ ${gesamt} verschiedene Sätze – alles in Ordnung.`)
