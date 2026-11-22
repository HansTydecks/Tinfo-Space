// Passive voice – Grammatik-Bausteine für das Spiel „Crime Scene" (reine Logik, ohne Vue).
//
// Karten werden wie beim Reporter als Text-Schablonen geschrieben und mit parse() zerlegt:
//   [k:wort]              markiertes Wort (farbig, keine Lücke)
//   [k:richtig|falsch|…]  Lücke mit richtiger Antwort und falschen Antworten (die erste falsche = typischer Fehler)
// Arten (k): obj = Objekt → neues Subjekt · be = Form von be · pp = past participle
//            agent = by-agent / Präposition · verb = aktives Verb · order = Satzbau

import { pick } from '../../silent-teacher/engine.js'

export const NONE = '—'
export const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// ---------------------------------------------------------------------------
// Figuren
// ---------------------------------------------------------------------------
const F = (e, n, g) => ({ e, n, g })
/** Zeugen erzählen, was passiert ist */
export const ZEUGEN = [
  F('👵', 'Mrs Lee', 'f'), F('🧔', 'Mr Patel', 'm'), F('👧', 'Lisa', 'f'), F('👦', 'Tom', 'm'),
  F('👴', 'Grandpa Joe', 'm'), F('👩‍🦰', 'Ms Clark', 'f'), F('🧑‍🍳', 'Chef Marco', 'm'), F('👩‍🎤', 'Jade', 'f'),
  F('🧒', 'Max', 'm'), F('👩', 'Mrs Brown', 'f'),
]
/** Ermittler stellen Fragen und geben Anweisungen */
export const ERMITTLER = [F('🕵️‍♀️', 'Inspector Lane', 'f'), F('🕵️', 'Detective Fox', 'm'), F('👮‍♀️', 'Officer Kim', 'f'), F('👮', 'Sergeant Ray', 'm')]

export const POSS = { m: 'his', f: 'her' }

// ---------------------------------------------------------------------------
// Verben
// ---------------------------------------------------------------------------
// Täter (wer etwas angestellt hat); drop = im Passiv weglassen (unbekannt / unwichtig)
const A = (t, n, drop = false) => ({ t, n, drop })
const TAETER = [
  A('someone', 'sg', true), A('somebody', 'sg', true), A('they', 'pl', true),
  A('the thief', 'sg'), A('a burglar', 'sg'), A('two teenagers', 'pl'), A('a tall man', 'sg'), A('the gang', 'sg'),
]
const POLIZEI = [
  A('the police', 'pl', true), A('someone', 'sg', true), A('they', 'pl', true),
  A('Officer Kim', 'sg'), A('the detectives', 'pl'), A('Detective Fox', 'sg'),
]
const ZEUGE_AGENT = [A('a neighbour', 'sg'), A('the guard', 'sg'), A('a taxi driver', 'sg'), A('someone', 'sg', true)]
const HUND = [A('the dog', 'sg'), A('someone', 'sg', true), A('the twins', 'pl')]
const KAMERA = [A('a security camera', 'sg'), A('a camera', 'sg'), A('someone', 'sg', true)]

/** 'base|s|past|pp|ing' · Objekte ('…:pl' = Plural) · mögliche Täter */
const V = (formen, objekte, taeter) => {
  const [base, s, past, pp, ing] = formen.split('|')
  return {
    base, s, past, pp, ing,
    objekte: objekte.map((o) => {
      const [t, n = 'sg'] = o.split(':')
      return { t, n }
    }),
    taeter,
  }
}

export const VERBEN = [
  V('steal|steals|stole|stolen|stealing', ['the jewels:pl', 'the painting', 'the money', 'two laptops:pl', 'the diamond', 'the red car'], TAETER),
  V('break|breaks|broke|broken|breaking', ['the window', 'the lock', 'the vase', 'two windows:pl', 'the camera'], TAETER),
  V('take|takes|took|taken|taking', ['the keys:pl', 'the money', 'the laptop', 'the gold coins:pl'], TAETER),
  V('hide|hides|hid|hidden|hiding', ['the money', 'the jewels:pl', 'the key', 'the stolen phones:pl'], TAETER),
  V('open|opens|opened|opened|opening', ['the safe', 'the back door', 'the letters:pl', 'the garage'], TAETER),
  V('damage|damages|damaged|damaged|damaging', ['the car', 'the fence', 'the cameras:pl', 'the alarm'], TAETER),
  V('smash|smashes|smashed|smashed|smashing', ['the shop window', 'the lights:pl', 'the mirror'], TAETER),
  V('rob|robs|robbed|robbed|robbing', ['the bank', 'the jewellery shop', 'the petrol station', 'two shops:pl'], TAETER),
  V('eat|eats|ate|eaten|eating', ['the cake', 'the cookies:pl', 'the sandwiches:pl', 'the birthday cake'], HUND),
  V('leave|leaves|left|left|leaving', ['a note', 'footprints:pl', 'fingerprints:pl', 'a strange message'], TAETER),
  V('write|writes|wrote|written|writing', ['the note', 'the letter', 'the secret message', 'the threats:pl'], TAETER),
  V('find|finds|found|found|finding', ['the bag', 'the fingerprints:pl', 'the stolen car', 'the jewels:pl'], POLIZEI),
  V('catch|catches|caught|caught|catching', ['the thief', 'the burglars:pl', 'the robber'], POLIZEI),
  V('arrest|arrests|arrested|arrested|arresting', ['the thief', 'two men:pl', 'the robber'], POLIZEI),
  V('question|questions|questioned|questioned|questioning', ['the witnesses:pl', 'the neighbour', 'the guard'], POLIZEI),
  V('search|searches|searched|searched|searching', ['the house', 'the garden', 'the cars:pl'], POLIZEI),
  V('check|checks|checked|checked|checking', ['the cameras:pl', 'the footprints:pl', 'the alarm'], POLIZEI),
  V('see|sees|saw|seen|seeing', ['a tall man', 'the thief', 'two boys:pl', 'the getaway car'], ZEUGE_AGENT),
  V('film|films|filmed|filmed|filming', ['the thief', 'the robbers:pl', 'the getaway car'], KAMERA),
  V('lock|locks|locked|locked|locking', ['the door', 'the windows:pl', 'the gate'], POLIZEI),
]
/** unregelmäßige Verben (past simple endet nicht auf -ed) */
export const UNREGELMAESSIG = VERBEN.filter((v) => !v.past.endsWith('ed'))
export const verb = (base) => VERBEN.find((v) => v.base === base)

// ---------------------------------------------------------------------------
// Zeitformen
// ---------------------------------------------------------------------------
const bePres = (n) => (n === 'pl' ? 'are' : 'is')
const bePast = (n) => (n === 'pl' ? 'were' : 'was')
const has = (n) => (n === 'pl' ? 'have' : 'has')
export const MODALE = ['can', 'can’t', 'must', 'should', 'might', 'could', 'will']

/** Aktive Verbform. n = Numerus des Täters ('sg' | 'pl') */
export function aktiv(tense, n, v) {
  switch (tense) {
    case 'present simple': return n === 'pl' ? v.base : v.s
    case 'past simple': return v.past
    case 'present progressive': return `${bePres(n)} ${v.ing}`
    case 'past progressive': return `${bePast(n)} ${v.ing}`
    case 'present perfect': return `${has(n)} ${v.pp}`
    case 'past perfect': return `had ${v.pp}`
    case 'going to': return `${bePres(n)} going to ${v.base}`
    case 'have to': return `${has(n)} to ${v.base}`
  }
  if (MODALE.includes(tense)) return `${tense} ${v.base}`
  throw new Error(`aktiv: unbekannte Zeitform ${tense}`)
}

/** Form von be im Passiv. n = Numerus des neuen Subjekts */
export function beForm(tense, n) {
  switch (tense) {
    case 'present simple': return bePres(n)
    case 'past simple': return bePast(n)
    case 'present progressive': return `${bePres(n)} being`
    case 'past progressive': return `${bePast(n)} being`
    case 'present perfect': return `${has(n)} been`
    case 'past perfect': return 'had been'
    case 'going to': return `${bePres(n)} going to be`
    case 'have to': return `${has(n)} to be`
  }
  if (MODALE.includes(tense)) return `${tense} be`
  throw new Error(`beForm: unbekannte Zeitform ${tense}`)
}

/** Typische falsche be-Formen (die erste ist der häufigste Fehler) */
export function beFalsch(tense, n) {
  const o = n === 'pl' ? 'sg' : 'pl'
  switch (tense) {
    case 'present simple': return [bePres(o), bePast(n), has(n)]
    case 'past simple': return [bePast(o), bePres(n), 'did']
    case 'present progressive': return [bePres(n), `${bePast(n)} being`, `${bePres(o)} being`]
    case 'past progressive': return [bePast(n), `${bePres(n)} being`, `${bePast(o)} being`]
    case 'present perfect': return [has(n), `${has(o)} been`, `${bePres(n)} being`]
    case 'past perfect': return ['had', `${has(n)} been`, `${bePast(n)} being`]
    case 'going to': return [`${bePres(n)} going to`, `${bePres(o)} going to be`, `${bePres(n)} going to been`]
    case 'have to': return [`${has(n)} to`, `${has(o)} to be`, `${has(n)} to been`]
  }
  if (MODALE.includes(tense)) return [tense, `${tense} been`, `${tense} being`]
  throw new Error(`beFalsch: unbekannte Zeitform ${tense}`)
}

/** Typische falsche Partizipien: past simple statt 3. Form, Grundform, -ing */
export function ppFalsch(v) {
  return [v.past !== v.pp ? v.past : v.base, v.base, v.ing, v.s]
}

// Zeitangaben passend zur Zeitform ('' = keine)
export const ZEITANGABE = {
  'present simple': ['every night', 'every weekend', 'almost every day', ''],
  'past simple': ['last night', 'yesterday', 'two days ago', 'on Monday', ''],
  'present progressive': ['right now', 'at the moment'],
  'past progressive': ['when I arrived', 'at ten o’clock last night'],
  'present perfect': ['', 'this week', 'twice this month'],
  'past perfect': ['before the police arrived', 'before midnight'],
  'will': ['tomorrow', 'next week', 'soon'],
  'going to': ['tomorrow', 'tonight', 'next week'],
}

// ---------------------------------------------------------------------------
// Schablonen → Karte
// ---------------------------------------------------------------------------
const MARKE = /\[(\w+):([^\]]+)\]/g

/** Text mit Marken/Lücken in Teile zerlegen: 'text' | { t, k } | { k, answer, wrong } */
export function parse(text) {
  const teile = []
  let pos = 0
  for (const m of text.matchAll(MARKE)) {
    if (m.index > pos) teile.push(text.slice(pos, m.index))
    const [answer, ...wrong] = m[2].split('|')
    teile.push(wrong.length ? { k: m[1], answer, wrong } : { t: answer, k: m[1] })
    pos = m.index + m[0].length
  }
  if (pos < text.length) teile.push(text.slice(pos))
  return teile
}

const ohneDoppelte = (liste, answer) => [...new Set(liste)].filter((w) => w && w !== answer)
/** Lücke als Schablonen-Text */
export const luecke = (k, answer, falsch) => `[${k}:${[answer, ...ohneDoppelte(falsch, answer)].join('|')}]`

/** zufälliger Täter für ein Verb; nur: 'drop' | 'keep' | undefined */
export function taeterFuer(v, nur) {
  let liste = v.taeter
  if (nur === 'drop') liste = liste.filter((a) => a.drop)
  if (nur === 'keep') liste = liste.filter((a) => !a.drop)
  return pick(liste)
}

/** by-agent als Text ('' wenn weggelassen) */
export const byAgent = (a) => (a.drop ? '' : `by ${a.t}`)

export { pick }
