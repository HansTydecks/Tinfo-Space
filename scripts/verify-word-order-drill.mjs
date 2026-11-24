// Prüft alle Aufgaben des Spiels „Word Order Express" (Word order).
//
//   npm run test:word-order            alle Level, 300 Karten je Aufgabe
//   npm run test:word-order -- --runs 50 --zeige 3
//
// Geprüft wird pro Karte:
//   - Art bekannt, Briefing, Tipp, Regel, Seite + Anker existieren im Kapitel
//   - keine leeren Waggons, keine doppelten Leerzeichen
//   - bau: erste Lösung = Reihenfolge der Teile, alle Alternativen sind echte Umstellungen, Bahnhof gemischt
//   - slot / fix: Indizes im Bereich, fix: richtiger Zug unterscheidet sich vom falschen
//   - wahl: genau eine richtige Option, alle Optionen verschieden

import { dirname, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'docs', '.vitepress', 'theme', 'components', 'word-order', 'drill')
const kapitel = join(root, 'docs', 'students', 'english', 'grammar', 'word-order')
const load = (p) => import(pathToFileURL(join(dir, p)).href)

const { default: AUFGABEN } = await load('aufgaben.js')
const { LEVELS } = await load('levels.js')
const { naechsteKarte, norm, anzeige, pruefeBau } = await load('engine.js')

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? Number(args[i + 1]) : def
}
const RUNS = opt('--runs', 300)
const ZEIGE = opt('--zeige', 0)

const fehler = []
const melde = (wo, text) => fehler.push(`${wo}: ${text}`)

const anker = {}
function ankerDa(seite, a) {
  const datei = join(kapitel, (seite || 'index') + '.md')
  if (!existsSync(datei)) return false
  anker[datei] ??= readFileSync(datei, 'utf8')
  return !a || anker[datei].includes(`{#${a}}`)
}

const text = (teile, ende = '') => anzeige(teile, ende).map((w) => w.t).join(' ')
function waggons(wo, teile) {
  for (const w of teile) {
    if (!w || typeof w.t !== 'string' || !w.t.trim()) melde(wo, `leerer Waggon ${JSON.stringify(w)}`)
    else if (/\s\s|^\s|\s$/.test(w.t)) melde(wo, `Leerzeichen in „${w.t}“`)
    if (!['s', 'v', 'o', 'adv', 'qw', 'n'].includes(w?.k)) melde(wo, `unbekannte Farbe ${w?.k}`)
  }
}

if (AUFGABEN.length !== LEVELS.length) melde('Level', `${AUFGABEN.length} Aufgabenlisten, ${LEVELS.length} Level`)
for (const [i, l] of LEVELS.entries()) if (!ankerDa(l.seite, l.anker)) melde(`Level ${i + 1}`, `Anker ${l.seite}#${l.anker} fehlt`)

let karten = 0
for (const [li, liste] of AUFGABEN.entries()) {
  const verschieden = new Set()
  for (const f of liste) {
    for (let r = 0; r < RUNS; r++) {
      const k = naechsteKarte([f], [], { punkte: 0, gezeigt: 1 })
      const wo = `Level ${li + 1} ${f.name}`
      karten++
      if (!k.briefing || !k.tipp || !k.regel?.t || !k.regel?.bau) melde(wo, 'Briefing, Tipp oder Regel fehlt')
      if (!ankerDa(k.seite, k.anker)) melde(wo, `Anker ${k.seite}#${k.anker} fehlt`)
      let zeig = ''
      if (k.art === 'bau') {
        waggons(wo, [...k.teile, ...k.vor, ...k.nach])
        if (k.loesungen[0] !== norm(k.teile)) melde(wo, 'erste Lösung passt nicht')
        for (const reihe of k.reihen) {
          if ([...reihe].sort().join() !== k.teile.map((_, i) => i).join()) melde(wo, `keine Umstellung: ${reihe}`)
        }
        if (k.hof.length !== k.teile.length) melde(wo, 'Bahnhof unvollständig')
        if (!pruefeBau(k, k.teile).ok) melde(wo, 'Lösung wird nicht erkannt')
        for (const reihe of k.reihen) if (!pruefeBau(k, reihe.map((i) => k.teile[i])).ok) melde(wo, 'Alternative wird nicht erkannt')
        zeig = text([...k.vor, ...k.teile, ...k.nach], k.ende)
      } else if (k.art === 'slot') {
        waggons(wo, [...k.satz, k.wort])
        if (!k.ok.length || k.ok.some((g) => g < 0 || g > k.satz.length)) melde(wo, `Lücke außerhalb: ${k.ok}`)
        zeig = `${k.wort.t} → ` + text([...k.satz.slice(0, k.ok[0]), k.wort, ...k.satz.slice(k.ok[0])], k.ende)
      } else if (k.art === 'fix') {
        waggons(wo, [...k.teile, ...k.richtig])
        if (!k.falsch.length || k.falsch.some((i) => i < 0 || i >= k.teile.length)) melde(wo, `falscher Index: ${k.falsch}`)
        if (norm(k.teile) === norm(k.richtig)) melde(wo, 'richtig = falsch')
        zeig = text(k.teile, k.ende) + ' ⇒ ' + text(k.richtig, k.ende)
      } else if (k.art === 'wahl') {
        k.optionen.forEach((o) => waggons(wo, o.teile))
        if (k.optionen.filter((o) => o.ok).length !== 1) melde(wo, 'nicht genau eine richtige Option')
        if (new Set(k.optionen.map((o) => norm(o.teile))).size !== k.optionen.length) melde(wo, 'Optionen doppelt')
        zeig = k.optionen.map((o) => (o.ok ? '✓ ' : '✗ ') + text(o.teile, o.ende)).join(' | ')
      } else melde(wo, `unbekannte Art ${k.art}`)
      if (/\s\s/.test(zeig)) melde(wo, `doppelte Leerzeichen: ${zeig}`)
      verschieden.add(zeig)
      if (r < ZEIGE) console.log(`  ${wo} [${k.art}] ${zeig}`)
    }
  }
  console.log(`Level ${li + 1}: ${liste.length} Aufgaben, ${verschieden.size} verschiedene Karten`)
}

const einzig = [...new Set(fehler)]
if (einzig.length) {
  console.error(`\n✗ ${einzig.length} Fehler:`)
  for (const f of einzig.slice(0, 40)) console.error('  ' + f)
  process.exit(1)
}
console.log(`\n✓ ${karten} Karten geprüft – alles in Ordnung.`)
