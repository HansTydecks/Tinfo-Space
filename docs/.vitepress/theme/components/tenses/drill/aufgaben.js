// Time Travel Agency: Aufgaben je Level (= je Kapitel), von leicht nach schwer.
// Jede Aufgabe ist eine Funktion ohne Parameter, die eine zufällige Karte liefert:
//   { crew, ziel, briefing, kontext, satz: [teile], form, tipp, seite, anker }
// tipp darf eine Liste sein (ein Tipp je Lücke).

import {
  pick, gross, ALLE_PERSONEN, EINZELN, MEHRERE, ICH_DU, VERBEN, REGELMAESSIG, UNREGELMAESSIG, MIT_VERLAUF,
  verb, falschEd, be, war, warFalsch, hat, hatFalsch, tut, tutFalsch, ist3, pron, form, luecke, parse,
} from './grammatik.js'

// ---------------------------------------------------------------------------
// Crew und Ziele
// ---------------------------------------------------------------------------
const TICK = { e: '🤖', n: 'Tick', rolle: 'mentor robot' }
const NOVA = { e: '👩‍🚀', n: 'Captain Nova', rolle: 'pilot' }
const PROF = { e: '🧑‍🔬', n: 'Prof. Hourglass', rolle: 'time lab' }

const NOW = '⏺️ NOW'
const THEN = '⏪ THEN'
const LATER = '⏩ LATER'

function karte({ crew = TICK, ziel, briefing, kontext = [], satz, form: f, tipp, seite, anker }) {
  return { crew, ziel, briefing, kontext, satz: parse(gross(satz)), form: f, tipp, seite, anker }
}

const ohneIch = ALLE_PERSONEN.filter((s) => s.p !== 'I')
const zweiPersonen = () => {
  const a = pick(ALLE_PERSONEN)
  let b = pick(ALLE_PERSONEN)
  while (b.n === a.n || b.p === a.p && ['I', 'you', 'we'].includes(a.p)) b = pick(ALLE_PERSONEN)
  return [a, b]
}

// Signalwörter
const OFT_MITTE = ['always', 'usually', 'often', 'sometimes']
const OFT_ENDE = ['every Saturday', 'every day', 'on Mondays', 'after school', 'twice a week', 'every morning']
const JETZT_ENDE = ['right now', 'at the moment', 'now']
const VORBEI = ['yesterday', 'last Saturday', 'last week', 'two days ago', 'in 2019', 'last summer']

// ===========================================================================
// Level 1 · NOW: simple present vs present progressive
// ===========================================================================
function gewohnheit() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(VERBEN)
  const r = pick(v.rest)
  const mitte = Math.random() < 0.5
  const sig = mitte ? pick(OFT_MITTE) : pick(OFT_ENDE)
  const g = luecke('zeit', form('present simple', s, v), [ist3(s) ? v.b : v.s, `${be(s)} ${v.b}`], v.b)
  return karte({
    ziel: `${NOW} · again and again`,
    briefing: 'Routine scan! This happens again and again – not just now.',
    kontext: [`🔁 ${sig}`],
    satz: mitte ? `${s.n} ${sig} ${g} ${r}.` : `${s.n} ${g} ${r} ${sig}.`,
    form: 'present-simple',
    tipp: 'Again and again (always, every …, on Mondays) → simple present. he / she / it: don’t forget the -s!',
    seite: 'present', anker: 'form-simple',
  })
}

function jetzt() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(MIT_VERLAUF)
  const r = pick(v.rest)
  const vorne = Math.random() < 0.5
  const g = luecke('prog', form('present progressive', s, v), [form('present simple', s, v), `${be(s)} ${v.b}`], v.b)
  const sig = vorne ? 'Look!' : pick(JETZT_ENDE)
  return karte({
    ziel: `${NOW} · right now`,
    briefing: 'Live signal from NOW – it’s happening at this very moment!',
    kontext: [`👀 ${sig}`],
    satz: vorne ? `Look! ${gross(s.n)} ${g} ${r}.` : `${s.n} ${g} ${r} ${sig}.`,
    form: 'present-progressive',
    tipp: 'Right now (Look!, now, at the moment) → present progressive: am / is / are + -ing.',
    seite: 'present', anker: 'form-progressive',
  })
}

const jetztOderImmer = () => (Math.random() < 0.5 ? gewohnheit() : jetzt())

function verneinungFrage() {
  const s = pick(ohneIch)
  const v = pick(VERBEN)
  const r = pick(v.rest)
  const sig = pick(OFT_ENDE)
  if (Math.random() < 0.5) {
    const falsch = ist3(s) ? [`doesn’t ${v.s}`, `don’t ${v.b}`] : [`doesn’t ${v.b}`, `don’t ${v.s}`]
    return karte({
      ziel: `${NOW} · again and again`,
      briefing: 'Glitch alert! Somebody broke the negative.',
      kontext: [`🔁 ${sig}`],
      satz: `${s.n} ${luecke('zeit', form('present simple', s, v, true), falsch, v.b)} ${r} ${sig}.`,
      form: 'present-simple',
      tipp: 'Negative: don’t / doesn’t + infinitive. The -s is already in doesn’t – so: she doesn’t play (not plays).',
      seite: 'present', anker: 'form-simple',
    })
  }
  return karte({
    ziel: `${NOW} · again and again`,
    briefing: 'The question in the time log is broken. Which helping verb?',
    kontext: [`🔁 ${sig}`],
    satz: `${luecke('aux', gross(tut(s)), [gross(tutFalsch(s)), gross(be(s))])} ${s.n} ${v.b} ${r} ${sig}?`,
    form: 'present-simple',
    tipp: 'Questions in the simple present: Do / Does + subject + infinitive. he / she / it → Does.',
    seite: 'present', anker: 'form-simple',
  })
}

const STATE = [
  ['like', 'likes', 'liking', ['pizza', 'cats', 'this song']],
  ['love', 'loves', 'loving', ['chocolate', 'horror films']],
  ['hate', 'hates', 'hating', ['spiders', 'Mondays']],
  ['want', 'wants', 'wanting', ['an ice cream', 'a new phone']],
  ['need', 'needs', 'needing', ['help', 'a new pen']],
  ['know', 'knows', 'knowing', ['the answer', 'the way']],
  ['understand', 'understands', 'understanding', ['the question', 'the problem']],
]
function stateVerb() {
  const s = pick(ALLE_PERSONEN)
  const [b, s3, ing, rest] = pick(STATE)
  const r = pick(rest)
  const richtig = ist3(s) ? s3 : b
  const sig = ['like', 'love', 'hate'].includes(b) ? '' : ` ${pick(['now', 'at the moment'])}`
  return karte({
    crew: NOVA,
    ziel: `${NOW}`,
    briefing: 'Careful, Trainee! Some verbs never wear -ing.',
    kontext: sig ? [`👀${sig}`] : ['💭 a feeling / thought'],
    satz: `${s.n} ${luecke('zeit', richtig, [`${be(s)} ${ing}`, ist3(s) ? b : s3], b)} ${r}${sig}.`,
    form: 'present-simple',
    tipp: 'State verbs (like, love, want, need, know, understand …) are not actions – no -ing, even with now.',
    seite: 'present', anker: 'state-verbs',
  })
}

// ===========================================================================
// Level 2 · THEN: simple past
// ===========================================================================
function satzVorbei(s, g, r, t) {
  return Math.random() < 0.4 ? `${t} ${s.n} ${g} ${r}.` : `${s.n} ${g} ${r} ${t}.`
}

function pastRegel() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(REGELMAESSIG)
  const t = pick(VORBEI)
  const g = luecke('zeit', v.past, [form('present perfect', s, v), ist3(s) ? v.s : v.b], v.b)
  return karte({
    crew: NOVA,
    ziel: `${THEN} · ${t}`,
    briefing: 'Jump to THEN! That time is over – finished.',
    kontext: [`📅 ${t}`],
    satz: satzVorbei(s, g, pick(v.rest), t),
    form: 'past-simple',
    tipp: 'A finished time (yesterday, last …, ago, in 2019) → simple past. Regular verbs: + -ed.',
    seite: 'past', anker: 'regular',
  })
}

function pastUnregel() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(UNREGELMAESSIG.filter((x) => x.past !== x.b))
  const t = pick(VORBEI)
  const g = luecke('zeit', v.past, [falschEd(v), form('present perfect', s, v)], v.b)
  return karte({
    crew: NOVA,
    ziel: `${THEN} · ${t}`,
    briefing: 'Irregular verb detected! Don’t just add -ed.',
    kontext: [`📅 ${t}`],
    satz: satzVorbei(s, g, pick(v.rest), t),
    form: 'past-simple',
    tipp: 'Irregular verbs have their own past form: go – went, eat – ate, buy – bought, write – wrote.',
    seite: 'past', anker: 'irregular',
  })
}

function pastNicht() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(VERBEN.filter((x) => x.past !== x.b))
  const t = pick(VORBEI)
  const g = luecke('zeit', `didn’t ${v.b}`, [`didn’t ${v.past}`, `${tut(s)}n’t ${v.b}`], v.b)
  return karte({
    crew: NOVA,
    ziel: `${THEN} · ${t}`,
    briefing: 'Something did NOT happen back then. Fix the log!',
    kontext: [`📅 ${t}`],
    satz: satzVorbei(s, g, pick(v.rest), t),
    form: 'past-simple',
    tipp: 'Negative in the past: didn’t + infinitive. didn’t already shows the past – so: didn’t go (not didn’t went).',
    seite: 'past', anker: 'form',
  })
}

function pastFrage() {
  const s = pick(ohneIch)
  const v = pick(VERBEN.filter((x) => x.past !== x.b))
  const t = pick(VORBEI)
  return karte({
    crew: NOVA,
    ziel: `${THEN} · ${t}`,
    briefing: 'A question about THEN. Two glitches!',
    kontext: [`📅 ${t}`],
    satz: `${luecke('aux', 'Did', ['Do', 'Was'])} ${s.n} ${luecke('zeit', v.b, [v.past, v.ing])} ${pick(v.rest)} ${t}?`,
    form: 'past-simple',
    tipp: ['Questions about the past: Did + subject + infinitive.', 'After did: the infinitive – Did you see …? (not saw)'],
    seite: 'past', anker: 'form',
  })
}

const ORTE = ['tired', 'ill', 'late', 'at home', 'at school', 'happy', 'nervous', 'in London']
function warWaren() {
  const s = pick(ALLE_PERSONEN)
  const t = pick(VORBEI)
  const neg = Math.random() < 0.35
  const g = neg
    ? luecke('zeit', `${war(s)}n’t`, [`${warFalsch(s)}n’t`, 'didn’t be'], 'be')
    : luecke('zeit', war(s), [warFalsch(s), be(s)], 'be')
  return karte({
    crew: NOVA,
    ziel: `${THEN} · ${t}`,
    briefing: 'The verb “be” got scrambled. was or were?',
    kontext: [`📅 ${t}`],
    satz: satzVorbei(s, g, pick(ORTE), t),
    form: 'past-simple',
    tipp: 'I / he / she / it → was · you / we / they → were. No did with be: wasn’t, weren’t.',
    seite: 'past', anker: 'was-were',
  })
}

// ===========================================================================
// Level 3 · present perfect vs simple past
// ===========================================================================
const ERFAHRUNG = [
  ['visit', 'London'], ['see', 'a whale'], ['eat', 'sushi'], ['ride', 'a horse'], ['swim', 'in the sea'],
  ['fly', 'in a helicopter'], ['meet', 'a famous person'], ['play', 'golf'], ['write', 'a poem'],
  ['make', 'pancakes'], ['build', 'a snowman'], ['read', 'a comic in English'],
]
const erfahrung = () => {
  const [b, r] = pick(ERFAHRUNG)
  return [verb(b), r]
}
const perfFalsch = (s, v, mitte = '') => (v.past !== v.pp ? `${hat(s)}${mitte} ${v.past}` : `${hatFalsch(s)}${mitte} ${v.pp}`)

function erfahrungKarte() {
  const s = pick(ALLE_PERSONEN)
  const [v, r] = erfahrung()
  if (Math.random() < 0.5) {
    const g = luecke('perf', `${hat(s)} never ${v.pp}`, [`never ${v.past}`, perfFalsch(s, v, ' never')], v.b)
    return karte({
      crew: PROF,
      ziel: `${NOW} · looking back`,
      briefing: 'Experience scanner on: your whole life – up to NOW.',
      kontext: ['🌍 never (in my life)'],
      satz: `${s.n} ${g} ${r}.`,
      form: 'present-perfect',
      tipp: 'Experiences up to now (ever, never, … times) → present perfect: have / has + 3rd form.',
      seite: 'present-perfect', anker: 'use',
    })
  }
  const mal = pick(['twice', 'three times', 'many times'])
  const g = luecke('perf', `${hat(s)} ${v.pp}`, [v.past, perfFalsch(s, v)], v.b)
  return karte({
    crew: PROF,
    ziel: `${NOW} · looking back`,
    briefing: 'Experience scanner on: we count – but we don’t say when.',
    kontext: [`🌍 ${mal} (so far)`],
    satz: `${s.n} ${g} ${r} ${mal}.`,
    form: 'present-perfect',
    tipp: 'How often up to now – no finished time → present perfect: have / has + 3rd form.',
    seite: 'present-perfect', anker: 'use',
  })
}

function justYet() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(VERBEN.filter((x) => x.b !== 'go'))
  const r = pick(v.rest)
  const art = pick(['just', 'already', 'yet'])
  if (art === 'yet') {
    const g = luecke('perf', `${hat(s)}n’t ${v.pp}`, [`didn’t ${v.b}`, v.past !== v.pp ? `${hat(s)}n’t ${v.past}` : `${hatFalsch(s)}n’t ${v.pp}`], v.b)
    return karte({
      crew: PROF,
      ziel: `${NOW} · result`,
      briefing: 'Result check: is it done NOW? Not yet!',
      kontext: ['⏳ yet'],
      satz: `${s.n} ${g} ${r} yet.`,
      form: 'present-perfect',
      tipp: 'yet (negatives and questions) → present perfect: haven’t / hasn’t + 3rd form. yet goes to the end.',
      seite: 'present-perfect', anker: 'just-already-yet',
    })
  }
  const g = luecke('perf', `${hat(s)} ${art} ${v.pp}`, [`${art} ${v.past}`, perfFalsch(s, v, ' ' + art)], v.b)
  return karte({
    crew: PROF,
    ziel: `${NOW} · result`,
    briefing: 'Result check: you can see the result NOW.',
    kontext: [`✅ ${art}`],
    satz: `${s.n} ${g} ${r}.`,
    form: 'present-perfect',
    tipp: `${art} → present perfect. ${art} goes between have / has and the 3rd form.`,
    seite: 'present-perfect', anker: 'just-already-yet',
  })
}

const FUER = ['ten years', 'two weeks', 'a long time', 'three years', 'six months']
const SEIT = ['2015', 'Monday', 'last summer', '2020', 'Christmas']
function forSince() {
  const s = pick(ALLE_PERSONEN)
  const anfang = pick([
    `${hat(s)} lived here`, `${hat(s)} had this bike`, `${hat(s)} been in the choir`,
    `${hat(s)} played the piano`, `${hat(s)} known the Millers`,
  ])
  const istFuer = Math.random() < 0.5
  const g = istFuer ? luecke('prep', 'for', ['since', 'ago']) : luecke('prep', 'since', ['for', 'from'])
  return karte({
    crew: PROF,
    ziel: `${NOW} · still true`,
    briefing: 'It started back then – and it’s still true NOW. for or since?',
    kontext: [istFuer ? '⏳ a length of time' : '🚩 a starting point'],
    satz: `${s.n} ${anfang} ${g} ${istFuer ? pick(FUER) : pick(SEIT)}.`,
    form: 'present-perfect',
    tipp: 'for + a length of time (for ten years) · since + a starting point (since 2015). German „seit“ can be both!',
    seite: 'present-perfect', anker: 'for-since',
  })
}

function kontrast() {
  if (Math.random() < 0.5) return erfahrungKarte()
  const s = pick(ALLE_PERSONEN)
  const [v, r] = erfahrung()
  const t = pick(VORBEI)
  const g = luecke('zeit', v.past, [form('present perfect', s, v), perfFalsch(s, v)], v.b)
  return karte({
    crew: NOVA,
    ziel: `${THEN} · ${t}`,
    briefing: 'We know WHEN it happened – and that time is over.',
    kontext: [`📅 ${t}`],
    satz: satzVorbei(s, g, r, t),
    form: 'past-simple',
    tipp: 'A finished time (yesterday, last …, ago, in 2019) → simple past – never present perfect!',
    seite: 'present-perfect', anker: 'contrast',
  })
}

function wannFrage() {
  const s = pick(ohneIch)
  const [v, r] = erfahrung()
  return karte({
    crew: NOVA,
    ziel: `${THEN}`,
    briefing: '“When” asks for a time in the past. Which helping verb?',
    kontext: ['❓ When …?'],
    satz: `When ${luecke('aux', 'did', [hat(s), 'were'])} ${s.n} ${v.b} ${r}?`,
    form: 'past-simple',
    tipp: 'When …? asks for a finished time → simple past: When did you …? (not When have you …?)',
    seite: 'present-perfect', anker: 'mistakes',
  })
}

// ===========================================================================
// Level 4 · past progressive
// ===========================================================================
const ZEITPUNKT = ['At 8 o’clock yesterday', 'At this time last week', 'Yesterday at 6 pm', 'At midnight', 'At 7:30 this morning']
const progFalsch = (s, v) => [v.past, `${warFalsch(s)} ${v.ing}`]

function zeitpunkt() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(MIT_VERLAUF)
  const t = pick(ZEITPUNKT)
  return karte({
    ziel: `${THEN} · ${t.toLowerCase()}`,
    briefing: 'Zoom in on THEN: what was going on at that moment?',
    kontext: [`🕗 ${t.toLowerCase()}`],
    satz: `${t}, ${s.n} ${luecke('prog', form('past progressive', s, v), progFalsch(s, v), v.b)} ${pick(v.rest)}.`,
    form: 'past-progressive',
    tipp: 'In the middle of an action at a time in the past → past progressive: was / were + -ing.',
    seite: 'past-progressive', anker: 'form',
  })
}

const EREIGNIS = [
  ['the phone', 'rang', ['was ringing', 'ringed'], 'ring', ''],
  ['somebody', 'knocked', ['was knocking', 'knocks'], 'knock', ' at the door'],
  ['the lights', 'went', ['were going', 'goed'], 'go', ' out'],
  ['it', 'started', ['was starting', 'starts'], 'start', ' to rain'],
  ['the cat', 'jumped', ['was jumping', 'jumps'], 'jump', ' on the table'],
  ['Dad', 'came', ['was coming', 'comed'], 'come', ' home'],
  ['a dog', 'ran', ['was running', 'runned'], 'run', ' into the room'],
]
function unterbrechung() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(MIT_VERLAUF)
  const [es, ev, ef, eb, er] = pick(EREIGNIS)
  return karte({
    ziel: `${THEN}`,
    briefing: 'Two signals from THEN: a long one in the background – and a short one that interrupts it.',
    kontext: ['〰️ long action', '⚡ short action'],
    satz: `${s.n} ${luecke('prog', form('past progressive', s, v), progFalsch(s, v), v.b)} ${pick(v.rest)} when ${es} ${luecke('zeit', ev, ef, eb)}${er}.`,
    form: 'past-progressive',
    tipp: ['The long action in the background → past progressive (was / were + -ing).', 'The short action that interrupts → simple past.'],
    seite: 'past-progressive', anker: 'when-while',
  })
}

function waehrend() {
  const [s1, s2] = zweiPersonen()
  const v1 = pick(MIT_VERLAUF)
  let v2 = pick(MIT_VERLAUF)
  while (v2.b === v1.b) v2 = pick(MIT_VERLAUF)
  const f = (s, v) => [v.past, form('present simple', s, v), `${warFalsch(s)} ${v.ing}`]
  return karte({
    ziel: `${THEN}`,
    briefing: 'Two things were going on at the same time. Repair both!',
    kontext: ['〰️ + 〰️ at the same time'],
    satz: `While ${s1.n} ${luecke('prog', form('past progressive', s1, v1), f(s1, v1), v1.b)} ${pick(v1.rest)}, ${s2.n} ${luecke('prog', form('past progressive', s2, v2), f(s2, v2), v2.b)} ${pick(v2.rest)}.`,
    form: 'past-progressive',
    tipp: 'while + two long actions at the same time → past progressive in both parts.',
    seite: 'past-progressive', anker: 'when-while',
  })
}

// ===========================================================================
// Level 5 · past perfect
// ===========================================================================
const SCHON_WEG = [
  ['the station', 'the train', 'leave', 'left', 'left', ''],
  ['the cinema', 'the film', 'start', 'started', 'started', ''],
  ['the party', 'most guests', 'go', 'went', 'gone', ' home'],
  ['school', 'the lesson', 'begin', 'began', 'begun', ''],
  ['the shop', 'it', 'close', 'closed', 'closed', ''],
  ['the bus stop', 'the bus', 'leave', 'left', 'left', ''],
]
function schonPassiert() {
  const s = pick(ALLE_PERSONEN)
  const [ort, was, b, past, pp, rest] = pick(SCHON_WEG)
  const falsch = [`already ${past}`, `${['most guests'].includes(was) ? 'have' : 'has'} already ${pp}`]
  return karte({
    crew: NOVA,
    ziel: `${THEN} · and even earlier`,
    briefing: 'Double jump! Something happened BEFORE another thing in the past.',
    kontext: ['① first', '② arrived'],
    satz: `When ${s.n} arrived at ${ort}, ${was} ${luecke('perf', `had already ${pp}`, falsch, b)}${rest}.`,
    form: 'past-perfect',
    tipp: 'What happened first (before then) → past perfect: had + 3rd form.',
    seite: 'past-perfect', anker: 'simple',
  })
}

const GRUND = [
  ['tired', 'run', 'ran', 'run', 'ten kilometres'],
  ['happy', 'win', 'won', 'won', 'the match'],
  ['sad', 'lose', 'lost', 'lost', 'the key'],
  ['proud', 'pass', 'passed', 'passed', 'the test'],
  ['full', 'eat', 'ate', 'eaten', 'three pizzas'],
  ['excited', 'see', 'saw', 'seen', 'a whale'],
]
function weil() {
  const s = pick(ALLE_PERSONEN)
  const [adj, b, past, pp, rest] = pick(GRUND)
  return karte({
    crew: NOVA,
    ziel: `${THEN} · and even earlier`,
    briefing: 'Why was it like that THEN? The reason happened before.',
    kontext: ['🧩 because …'],
    satz: `${s.n} ${war(s)} ${adj} because ${pron(s)} ${luecke('perf', `had ${pp}`, [past, `${hat(s)} ${pp}`], b)} ${rest}.`,
    form: 'past-perfect',
    tipp: 'The reason happened earlier → past perfect: had + 3rd form.',
    seite: 'past-perfect', anker: 'simple',
  })
}

const DAUER_VORHER = [
  ['wait', 'waiting', 'for the bus', 'for an hour'],
  ['play', 'playing', 'football', 'for two hours'],
  ['study', 'studying', 'maths', 'all evening'],
  ['read', 'reading', 'a book', 'for hours'],
  ['swim', 'swimming', 'in the lake', 'for an hour'],
  ['clean', 'cleaning', 'the kitchen', 'for 30 minutes'],
]
const DANN = ['the bus finally came', 'it started to rain', 'the lights went out', 'the teacher came in', 'the phone rang']
function hatteGewartet() {
  const s = pick(ALLE_PERSONEN)
  const [b, ing, obj, dauer] = pick(DAUER_VORHER)
  return karte({
    crew: NOVA,
    ziel: `${THEN} · how long until then`,
    briefing: 'Measure the time: how long had it been going on – until THEN?',
    kontext: [`⏳ ${dauer}`, `⚡ when …`],
    satz: `${s.n} ${luecke('perf', `had been ${ing}`, [`${hat(s)} been ${ing}`, `had been ${b}`], b)} ${obj} ${dauer} when ${pick(DANN)}.`,
    form: 'past-perfect-progressive',
    tipp: 'How long – until a point in the past → past perfect progressive: had been + -ing.',
    seite: 'past-perfect', anker: 'progressive',
  })
}

function nachdem() {
  const s = pick(ALLE_PERSONEN)
  const v = pick(VERBEN.filter((x) => x.past !== x.pp))
  return karte({
    crew: NOVA,
    ziel: `${THEN} · and even earlier`,
    briefing: 'First this, then that. Which one happened first?',
    kontext: ['① after …', '② went home'],
    satz: `After ${s.n} ${luecke('perf', `had ${v.pp}`, [`${hat(s)} ${v.pp}`, `had ${v.past}`], v.b)} ${pick(v.rest)}, ${pron(s)} went home.`,
    form: 'past-perfect',
    tipp: 'The earlier action → past perfect: had + 3rd form (had written, not had wrote).',
    seite: 'past-perfect', anker: 'simple',
  })
}

// ===========================================================================
// Level 6 · present perfect progressive
// ===========================================================================
const TAETIG = [
  ['wait', 'waits', 'waiting', 'for the bus'],
  ['learn', 'learns', 'learning', 'English'],
  ['play', 'plays', 'playing', 'the guitar'],
  ['read', 'reads', 'reading', 'this book'],
  ['study', 'studies', 'studying', 'for the test'],
  ['build', 'builds', 'building', 'a treehouse'],
]
const DAUER = ['for 20 minutes', 'for two hours', 'since 9 o’clock', 'since Monday', 'for three years', 'since 2020']
function seitWann() {
  const s = pick(ALLE_PERSONEN)
  const [b, s3, ing, rest] = pick(TAETIG)
  const d = pick(DAUER)
  return karte({
    crew: PROF,
    ziel: `${NOW} · since then until now`,
    briefing: 'It started before – and it’s still going on NOW. Measure it!',
    kontext: [`⏳ ${d}`],
    satz: `${s.n} ${luecke('perf', `${hat(s)} been ${ing}`, [`${be(s)} ${ing}`, ist3(s) ? s3 : b], b)} ${rest} ${d}.`,
    form: 'present-perfect-progressive',
    tipp: 'German „seit“ + present → English present perfect progressive: have / has been + -ing (+ for / since).',
    seite: 'perfect-progressive', anker: 'use',
  })
}

function wieLange() {
  const s = pick(ohneIch)
  const [, , ing, rest] = pick(TAETIG)
  return karte({
    crew: PROF,
    ziel: `${NOW} · since then until now`,
    briefing: 'The question “How long …?” is broken. Which helping verb?',
    kontext: ['❓ How long …?'],
    satz: `How long ${luecke('aux', hat(s), [be(s), tut(s)])} ${s.n} been ${ing} ${rest}?`,
    form: 'present-perfect-progressive',
    tipp: 'How long …? up to now → How long have / has … been + -ing? (not How long is …)',
    seite: 'perfect-progressive', anker: 'form',
  })
}

const SPUR = [
  ['Anna’s eyes are red.', 'She', 'has', 'crying', 'cry', 'cried', 'is', ''],
  ['Tom is out of breath.', 'He', 'has', 'running', 'run', 'ran', 'is', ''],
  ['The street is wet.', 'It', 'has', 'raining', 'rain', 'rained', 'is', ''],
  ['Ben’s hands are dirty.', 'He', 'has', 'working', 'work', 'worked', 'is', ' in the garden'],
  ['Your face is red.', 'You', 'have', 'sitting', 'sit', 'sat', 'are', ' in the sun'],
  ['The twins are so tired.', 'They', 'have', 'playing', 'play', 'played', 'are', ' football all day'],
  ['Mia is covered in paint.', 'She', 'has', 'painting', 'paint', 'painted', 'is', ' the fence'],
  ['There’s flour everywhere.', 'Dad', 'has', 'baking', 'bake', 'baked', 'is', ' a cake'],
]
function spur() {
  const [sit, wer, h, ing, b, past, ist, rest] = pick(SPUR)
  return karte({
    crew: PROF,
    ziel: `${NOW} · traces`,
    briefing: 'Trace detector: you can still SEE what has been going on.',
    kontext: ['🔍 visible result'],
    satz: `${sit} ${wer} ${luecke('perf', `${h} been ${ing}`, [`${ist} ${ing}`, past], b)}${rest}.`,
    form: 'present-perfect-progressive',
    tipp: 'An activity that has just stopped – you can see the result → have / has been + -ing.',
    seite: 'perfect-progressive', anker: 'use',
  })
}

const MENGE = [
  ['write', 'written', 'writing', 'writes', 'three emails', 'emails', 'all morning'],
  ['read', 'read', 'reading', 'reads', 'two books', 'comics', 'all afternoon'],
  ['eat', 'eaten', 'eating', 'eats', 'five pancakes', 'pancakes', 'since breakfast'],
  ['paint', 'painted', 'painting', 'paints', 'two pictures', 'pictures', 'all day'],
  ['make', 'made', 'making', 'makes', 'ten sandwiches', 'sandwiches', 'since lunch'],
  ['bake', 'baked', 'baking', 'bakes', 'four cakes', 'cakes', 'all day'],
]
function mengeOderDauer() {
  const s = pick(ALLE_PERSONEN)
  const [b, pp, ing, s3, menge, obj, dauer] = pick(MENGE)
  if (Math.random() < 0.5) {
    return karte({
      crew: PROF,
      ziel: `${NOW} · result`,
      briefing: 'Counter on: how many are finished NOW?',
      kontext: ['🔢 how many'],
      satz: `${s.n} ${luecke('perf', `${hat(s)} ${pp}`, [`${hat(s)} been ${ing}`, `${be(s)} ${ing}`], b)} ${menge}.`,
      form: 'present-perfect',
      tipp: 'How many? A number, a result → present perfect simple: have / has + 3rd form.',
      seite: 'perfect-progressive', anker: 'simple-or-progressive',
    })
  }
  return karte({
    crew: PROF,
    ziel: `${NOW} · since then until now`,
    briefing: 'Timer on: how long has the activity been going on?',
    kontext: [`⏳ ${dauer}`],
    satz: `${s.n} ${luecke('perf', `${hat(s)} been ${ing}`, [`${be(s)} ${ing}`, ist3(s) ? s3 : b], b)} ${obj} ${dauer}.`,
    form: 'present-perfect-progressive',
    tipp: 'How long? The activity → present perfect progressive: have / has been + -ing.',
    seite: 'perfect-progressive', anker: 'simple-or-progressive',
  })
}

const ZUSTAND = [
  ['know', 'known', 'knowing', 'the Millers', 'for years'],
  ['have', 'had', 'having', 'this bike', 'since 2020'],
  ['like', 'liked', 'liking', 'this band', 'for a long time'],
  ['want', 'wanted', 'wanting', 'a dog', 'since Christmas'],
]
function zustandVerb() {
  const s = pick(ALLE_PERSONEN)
  const [b, pp, ing, obj, d] = pick(ZUSTAND)
  return karte({
    crew: NOVA,
    ziel: `${NOW} · still true`,
    briefing: 'Careful! State verbs refuse to wear -ing – even here.',
    kontext: [`⏳ ${d}`],
    satz: `${s.n} ${luecke('perf', `${hat(s)} ${pp}`, [`${hat(s)} been ${ing}`, `${be(s)} ${ing}`], b)} ${obj} ${d}.`,
    form: 'present-perfect',
    tipp: 'State verbs (know, have = own, like, want) → present perfect SIMPLE, even with for / since.',
    seite: 'perfect-progressive', anker: 'simple-or-progressive',
  })
}

// ===========================================================================
// Level 7 · LATER: the future
// ===========================================================================
const VORHERSAGE = [
  ['it', 'rain', 'rains', 'tomorrow'], ['Tom', 'win', 'wins', 'the match'], ['you', 'like', 'likes', 'the film'],
  ['the test', 'be', 'is', 'easy'], ['Lisa', 'pass', 'passes', 'the exam'], ['it', 'snow', 'snows', 'at the weekend'],
  ['the twins', 'love', 'loves', 'the present'], ['we', 'be', 'are', 'late'],
]
function vorhersage() {
  const [wer, b, s3, rest] = pick(VORHERSAGE)
  const sig = pick(['I think', 'I’m sure', 'Maybe'])
  return karte({
    crew: PROF,
    ziel: `${LATER} · a prediction`,
    briefing: 'Crystal ball mode: what do you think will happen?',
    kontext: [`🔮 ${sig}`],
    satz: `${sig} ${wer} ${luecke('fut', `will ${b}`, [`will ${s3}`, s3], b)} ${rest}.`,
    form: 'will',
    tipp: 'Predictions (I think, I’m sure, maybe) → will + infinitive. No -s after will!',
    seite: 'future', anker: 'will',
  })
}

const SPONTAN = [
  ['The phone is ringing!', 'get', 'getting', 'it'],
  ['I’m cold.', 'close', 'closing', 'the window'],
  ['This bag is so heavy!', 'help', 'helping', 'you'],
  ['I’m thirsty.', 'get', 'getting', 'you some water'],
  ['We haven’t got any milk.', 'buy', 'buying', 'some'],
  ['It’s dark in here.', 'turn on', 'turning on', 'the light'],
]
function spontan() {
  const [sit, b, ing, rest] = pick(SPONTAN)
  return karte({
    crew: NOVA,
    ziel: `${LATER} · decided right now`,
    briefing: 'Quick decision needed – you decide in this second!',
    kontext: [`⚡ ${sit}`],
    satz: `${sit} Wait, I ${luecke('fut', `will ${b}`, [b, `am ${ing}`], b)} ${rest}!`,
    form: 'will',
    tipp: 'A decision you make NOW, while you speak → will (I’ll get it!).',
    seite: 'future', anker: 'will',
  })
}

const ANZEICHEN = [
  ['Look at those black clouds!', 'It', 'is', 'rain', 'raining', ''],
  ['The ladder is shaking!', 'It', 'is', 'fall', 'falling', ''],
  ['Oh no, the vase is wobbling!', 'It', 'is', 'break', 'breaking', ''],
  ['Look at the score: 5 – 0!', 'Our team', 'is', 'win', 'winning', ' the match'],
  ['Be careful on the ice!', 'You', 'are', 'fall', 'falling', ''],
]
function goingTo() {
  if (Math.random() < 0.4) {
    const [sit, wer, ist, b, ing, rest] = pick(ANZEICHEN)
    return karte({
      crew: PROF,
      ziel: `${LATER} · you can see it coming`,
      briefing: 'Warning lights! You can already see what’s going to happen.',
      kontext: ['👀 a sign now'],
      satz: `${sit} ${wer} ${luecke('fut', `${ist} going to ${b}`, [`${ist} going ${b}`, `${ist} ${ing}`], b)}${rest}.`,
      form: 'going-to',
      tipp: 'You can see it coming (Look at …!) → am / is / are going to + infinitive.',
      seite: 'future', anker: 'going-to',
    })
  }
  const s = pick(ALLE_PERSONEN)
  const v = pick(VERBEN)
  const sig = pick(['next weekend', 'this summer', 'after school', 'tomorrow'])
  return karte({
    crew: NOVA,
    ziel: `${LATER} · a plan`,
    briefing: 'The plan was made BEFORE. Log the intention!',
    kontext: ['📋 already planned', `📅 ${sig}`],
    satz: `${s.n} ${luecke('fut', form('going to', s, v), [`${be(s)} going ${v.b}`, `${be(s)} go to ${v.b}`], v.b)} ${pick(v.rest)} ${sig}.`,
    form: 'going-to',
    tipp: 'A plan you made before → am / is / are going to + infinitive.',
    seite: 'future', anker: 'going-to',
  })
}

const TERMINE = [
  ['meet', 'meeting', 'meets', 'Grandma at the station at 7 tonight'],
  ['have', 'having', 'has', 'a party on Saturday'],
  ['fly', 'flying', 'flies', 'to Rome on Friday'],
  ['see', 'seeing', 'sees', 'the dentist at 4 tomorrow'],
  ['play', 'playing', 'plays', 'tennis with Ben tomorrow afternoon'],
]
function termin() {
  const s = pick(ALLE_PERSONEN)
  const [b, ing, s3, rest] = pick(TERMINE)
  return karte({
    crew: NOVA,
    ziel: `${LATER} · fixed arrangement`,
    briefing: 'Checking the diary: it’s arranged with time and place.',
    kontext: ['📅 in the diary'],
    satz: `${s.n} ${luecke('prog', `${be(s)} ${ing}`, [ist3(s) ? s3 : b, `${be(s)} ${b}`], b)} ${rest}.`,
    form: 'present-progressive',
    tipp: 'A fixed arrangement (time + place, it’s in your diary) → present progressive: am / is / are + -ing.',
    seite: 'future', anker: 'present-progressive',
  })
}

const FAHRPLAN = [
  ['The train', 'leave', 'leaves', 'at 8:15 tomorrow'], ['The film', 'start', 'starts', 'at 7 pm'],
  ['The bus', 'arrive', 'arrives', 'at 10:30'], ['School', 'end', 'ends', 'on 20 July'],
  ['The concert', 'begin', 'begins', 'at 8 o’clock'], ['Our flight', 'leave', 'leaves', 'at 6 am on Sunday'],
]
function fahrplan() {
  const [wer, b, s3, rest] = pick(FAHRPLAN)
  return karte({
    crew: PROF,
    ziel: `${LATER} · timetable`,
    briefing: 'Official timetable! Nobody decides it – it’s fixed.',
    kontext: ['🚆 timetable'],
    satz: `${wer} ${luecke('zeit', s3, [b, `is ${b}`], b)} ${rest}.`,
    form: 'present-simple',
    tipp: 'Timetables and programmes → simple present (The train leaves at 8:15).',
    seite: 'future', anker: 'simple-present',
  })
}

const WENN = [
  ['If it', 'rains', ['will rain', 'rain'], 'rain', 'tomorrow, we will stay at home.'],
  ['When Tom', 'arrives', ['will arrive', 'arrive'], 'arrive', ', we will start the party.'],
  ['If you', 'study', ['will study', 'studies'], 'study', 'hard, you will pass the test.'],
  ['As soon as I', 'finish', ['will finish', 'finishes'], 'finish', 'my homework, I will call you.'],
  ['When we', 'are', ['will be', 'is'], 'be', 'in London, we will visit the museum.'],
  ['If Anna', 'gets', ['will get', 'get'], 'get', 'the tickets, we will go to the concert.'],
]
function wennDann() {
  const [anfang, richtig, falsch, b, rest] = pick(WENN)
  const trenner = rest.startsWith(',') ? '' : ' '
  return karte({
    crew: PROF,
    ziel: `${LATER} · if / when …`,
    briefing: 'Paradox alert! No will after if, when or as soon as.',
    kontext: ['⚠️ if / when + …'],
    satz: `${anfang} ${luecke('zeit', richtig, falsch, b)}${trenner}${rest}`,
    form: 'present-simple',
    tipp: 'After if, when, as soon as … about the future → simple present, not will.',
    seite: 'future', anker: 'simple-present',
  })
}

const ZUKUNFT_ASPEKT = [
  ['This time tomorrow, I', 'will be sitting', ['will sitting', 'will be sit'], 'sit', 'on the plane.', 'future-progressive'],
  ['At 10 o’clock tomorrow, Anna', 'will be writing', ['will writing', 'will be write'], 'write', 'her test.', 'future-progressive'],
  ['This time next week, we', 'will be lying', ['will lying', 'will be lie'], 'lie', 'on the beach.', 'future-progressive'],
  ['By Friday, Tom', 'will have finished', ['will have finish', 'will finished'], 'finish', 'the project.', 'future-perfect'],
  ['By 2030, they', 'will have built', ['will have build', 'will built'], 'build', 'the new bridge.', 'future-perfect'],
  ['By the time you arrive, I', 'will have cooked', ['will have cook', 'will cooked'], 'cook', 'dinner.', 'future-perfect'],
]
function zukunftAspekt() {
  const [anfang, richtig, falsch, b, rest, f] = pick(ZUKUNFT_ASPEKT)
  const prog = f === 'future-progressive'
  return karte({
    crew: PROF,
    ziel: prog ? `${LATER} · in the middle of it` : `${LATER} · already finished by then`,
    briefing: prog ? 'Future camera: what will be going on at that moment?' : 'Future check: what will be finished by then?',
    kontext: [prog ? '〰️ this time tomorrow' : '✅ by Friday / by then'],
    satz: `${anfang} ${luecke(prog ? 'prog' : 'perf', richtig, falsch, b)} ${rest}`,
    form: f,
    tipp: prog
      ? 'In the middle of an action at a time in the future → will be + -ing.'
      : 'Finished before a time in the future (by …) → will have + 3rd form.',
    seite: 'future', anker: 'aspect',
  })
}

// ===========================================================================
// Level-Listen (leicht → schwer)
// ===========================================================================
const L1 = [gewohnheit, jetzt, jetztOderImmer, verneinungFrage, stateVerb]
const L2 = [pastRegel, pastUnregel, pastNicht, pastFrage, warWaren]
const L3 = [erfahrungKarte, justYet, forSince, kontrast, wannFrage]
const L4 = [zeitpunkt, unterbrechung, waehrend]
const L5 = [schonPassiert, weil, nachdem, hatteGewartet]
const L6 = [seitWann, wieLange, spur, mengeOderDauer, zustandVerb]
const L7 = [vorhersage, spontan, goingTo, termin, fahrplan, wennDann, zukunftAspekt]
// Timeline chaos: gemischte Pakete, damit die Freischaltung in 5 Stufen läuft
const aus = (...listen) => () => pick(listen.flat())()
const L8 = [aus(L1, L2), aus(L3, L4), aus(L5, L6), aus(L7), aus(L1, L2, L3, L4, L5, L6, L7)]

export default [L1, L2, L3, L4, L5, L6, L7, L8]
export { EINZELN, MEHRERE, ICH_DU }
