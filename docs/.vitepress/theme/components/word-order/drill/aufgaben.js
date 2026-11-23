// Word Order Express: Aufgaben je Level (= je Kapitel), von leicht nach schwer.
// Jede Aufgabe ist eine Funktion ohne Parameter, die eine zufällige Karte liefert.
// Kartenarten:
//   bau  – Waggons in die richtige Reihenfolge kuppeln   { teile, loesungen, vor, nach, ende }
//   slot – Wohin gehört dieser Waggon?                   { satz, wort, ok: [Lücken-Index], ende }
//   fix  – Welcher Waggon steht falsch?                  { teile, falsch: [Index], richtig, ende }
//   wahl – Welcher Zug fährt richtig?                    { optionen: [{ teile, ok, ende }] }
// Alle Karten: crew, briefing, kontext, tipp, regel { t, bau }, seite, anker

import {
  pick, sample, coin, S, W, norm, gross, klein, LEUTE, EINZELN, FRAGE_LEUTE, ist3, tu, tuNicht, sei, hab,
  TUN, GEWOHNHEIT, VORBEI, HAEUFIG,
} from './grammatik.js'

// ---------------------------------------------------------------------------
// Crew
// ---------------------------------------------------------------------------
const ADA = { e: '👷‍♀️', n: 'Conductor Ada', rolle: 'conductor' }
const SAM = { e: '🧑‍🔧', n: 'Sam', rolle: 'shunting yard' }
const LOU = { e: '🧑‍✈️', n: 'Lou', rolle: 'train driver' }

const BAU = [
  'Couple the wagons in the right order!',
  'The wagons got mixed up in the yard. Put them in order!',
  'This train can only leave in the right order. Go!',
]
const FIX = [
  'One wagon is in the wrong place. Which one?',
  'Something is wrong with this train. Find the wagon!',
  'This train won’t move. Which wagon is in the wrong place?',
]
const WAHL = ['Only one of these trains is allowed to leave. Which one?', 'Which train is coupled correctly?']

/** alternative Reihenfolgen als Index-Listen → Lösungstexte */
const umgestellt = (teile, alt) => alt.map((ix) => norm(ix.map((i) => teile[i])))

function bau({ crew = ADA, briefing = pick(BAU), kontext = [], teile, alt = [], vor = [], nach = [], ende = '.', tipp, regel, seite, anker }) {
  return {
    art: 'bau', crew, briefing, kontext, teile, vor, nach, ende, tipp, regel, seite, anker,
    reihen: [teile.map((_, i) => i), ...alt],
    loesungen: [norm(teile), ...umgestellt(teile, alt)],
  }
}
function slot({ crew = SAM, briefing, kontext = [], satz, wort, ok, ende = '.', tipp, regel, seite, anker }) {
  return { art: 'slot', crew, briefing: briefing ?? `Where does the “${wort.t}” wagon go?`, kontext, satz, wort, ok, ende, tipp, regel, seite, anker }
}
function fix({ crew = LOU, briefing = pick(FIX), kontext = [], teile, falsch, richtig, ende = '.', tipp, regel, seite, anker }) {
  return { art: 'fix', crew, briefing, kontext, teile, falsch, richtig, ende, tipp, regel, seite, anker }
}
function wahl({ crew = ADA, briefing = pick(WAHL), kontext = [], richtig, falsch, ende = '.', tipp, regel, seite, anker }) {
  const optionen = [{ teile: richtig, ok: true, ende }, ...falsch.map((f) => ({ teile: f, ok: false, ende }))]
  return { art: 'wahl', crew, briefing, kontext, optionen, tipp, regel, seite, anker }
}

const R = (t, bau) => ({ t, bau })

// Verbform im simple present
const vPres = (s, v) => (ist3(s) ? v.s : v.b)
const subj = (s) => W(s.t, 's')

// ===========================================================================
// Level 1 · Subject – verb – object
// ===========================================================================
const L1 = { seite: 'basics' }

function svo() {
  const s = pick(LEUTE)
  const v = pick(TUN)
  const t = pick(GEWOHNHEIT)
  const teile = [subj(s), W(vPres(s, v), 'v'), W(pick(v.o), 'o'), W(t, 'adv')]
  return bau({
    teile, alt: [[3, 0, 1, 2]],
    tipp: 'Start with the subject, then the verb, then the object: S – V – O. The time goes at the end (or at the start).',
    regel: R('S – V – O', 'subject – verb – object, time at the end'), ...L1, anker: 'svo',
  })
}

function zeitVorne() {
  const s = pick(LEUTE)
  const v = pick(TUN)
  const t = pick(VORBEI)
  const teile = [W(t, 'adv'), subj(s), W(v.ed, 'v'), W(pick(v.o), 'o')]
  return bau({
    crew: SAM,
    briefing: 'Put the time wagon at the front this time. And then?',
    kontext: [`Start with: ${t} …`],
    teile, alt: [[1, 2, 3, 0]],
    tipp: `After “${t}” at the start, English keeps S – V: “${t} ${klein(s.t)} ${v.ed} …” – not “${t} ${v.ed} ${klein(s.t)} …”.`,
    regel: R('time + S – V – O', 'the subject still comes before the verb'), ...L1, anker: 'time-first',
  })
}

function zeitVorneFix() {
  const s = pick(LEUTE)
  const v = pick(TUN)
  const t = pick(VORBEI)
  const o = pick(v.o)
  return fix({
    teile: [W(t, 'adv'), W(v.ed, 'v'), subj(s), W(o, 'o')],
    falsch: [1, 2],
    richtig: [W(t, 'adv'), subj(s), W(v.ed, 'v'), W(o, 'o')],
    tipp: 'German order! “Gestern spielte ich …” – in English the subject comes before the verb: “Yesterday I played …”.',
    regel: R('time + S – V', 'no verb jump after a time word'), ...L1, anker: 'time-first',
  })
}

const MAG = [
  ['like', 'likes', ['pizza', 'chocolate', 'horror films', 'jazz', 'cats', 'my new school']],
  ['love', 'loves', ['pizza', 'summer', 'football', 'this song']],
  ['enjoy', 'enjoys', ['swimming', 'the holidays', 'this game']],
]
function verbObjektFix() {
  const s = pick(LEUTE)
  const [b, s3, objekte] = pick(MAG)
  const v = ist3(s) ? s3 : b
  const o = pick(objekte)
  const m = pick(['very much', 'a lot'])
  return fix({
    teile: [subj(s), W(v, 'v'), W(m, 'adv'), W(o, 'o')],
    falsch: [2, 3],
    richtig: [subj(s), W(v, 'v'), W(o, 'o'), W(m, 'adv')],
    tipp: `Verb + object stay together: “${v} ${o} ${m}” – nothing between “${v}” and “${o}”.`,
    regel: R('V + O', 'never split the verb and the object'), ...L1, anker: 'verb-object',
  })
}

function verbObjekt() {
  const s = pick(LEUTE)
  const [b, s3, objekte] = pick(MAG)
  const v = ist3(s) ? s3 : b
  const teile = [subj(s), W(v, 'v'), W(pick(objekte), 'o'), W(pick(['very much', 'a lot']), 'adv')]
  return bau({
    teile,
    tipp: 'Verb + object stay together. “very much” and “a lot” go after the object.',
    regel: R('V + O', 'never split the verb and the object'), ...L1, anker: 'verb-object',
  })
}

const GIBT = [
  ['is', 'a cinema', 'in our town'], ['are', 'two cats', 'in the garden'], ['is', 'a new pool', 'near our school'],
  ['are', 'a lot of shops', 'in the city centre'], ['is', 'a spider', 'in the bathroom'], ['is', 'a café', 'at the station'],
]
const WETTER = [['is', 'cold', 'today'], ['is', 'very hot', 'in summer'], ['is', 'windy', 'at the beach'], ['is', 'dark', 'at 5 o’clock']]
function esGibt() {
  if (coin()) {
    const [v, x, p] = pick(GIBT)
    return bau({
      crew: SAM,
      briefing: 'Es gibt … – how do you say that? Couple the wagons!',
      teile: [W('there', 's'), W(v, 'v'), W(x, 'o'), W(p, 'adv')],
      alt: [[3, 0, 1, 2]],
      tipp: '“Es gibt …” = “There is / There are …” – there is the subject wagon. ✗ “It gives …”',
      regel: R('There is / are …', 'English always needs a subject'), ...L1, anker: 'subject',
    })
  }
  const [v, a, t] = pick(WETTER)
  return bau({
    crew: SAM,
    briefing: 'Es ist … – the subject wagon must not be empty!',
    teile: [W('it', 's'), W(v, 'v'), W(a, 'n'), W(t, 'adv')],
    alt: [[3, 0, 1, 2]],
    tipp: 'English always needs a subject: “It is cold.” – ✗ “Is cold.”',
    regel: R('It is …', 'English always needs a subject'), ...L1, anker: 'subject',
  })
}

function verneinung() {
  const s = pick(LEUTE)
  const v = pick(TUN)
  const teile = [subj(s), W(tuNicht(s), 'v'), W(v.b, 'v'), W(pick(v.o), 'o'), W(pick(GEWOHNHEIT), 'adv')]
  return bau({
    crew: LOU,
    briefing: 'A “no” train: couple the wagons!',
    teile, alt: [[4, 0, 1, 2, 3]],
    tipp: `Negative: subject + ${tuNicht(s)} + verb: “${gross(s.t)} ${tuNicht(s)} ${v.b} …”. ✗ “${gross(s.t)} ${vPres(s, v)} not …”`,
    regel: R('S – don’t / doesn’t – V', 'not comes after the helping verb'), ...L1, anker: 'negatives',
  })
}

// ===========================================================================
// Level 2 · Manner, place, time
// ===========================================================================
const L2 = { seite: 'place-time' }

function ortZeit() {
  const s = pick(LEUTE)
  const v = pick(TUN.filter((x) => x.p.length))
  const teile = [subj(s), W(vPres(s, v), 'v'), W(pick(v.o), 'o'), W(pick(v.p), 'adv'), W(pick(GEWOHNHEIT), 'adv')]
  return bau({
    teile, alt: [[4, 0, 1, 2, 3]],
    tipp: 'Place before time: “… in the park on Saturdays” – like a Pizza Tonight 🍕 (P before T).',
    regel: R('S – V – O – P – T', 'place before time'), ...L2, anker: 'mpt',
  })
}

function ortZeitFix() {
  const s = pick(LEUTE)
  const v = pick(TUN.filter((x) => x.p.length))
  const o = pick(v.o)
  const p = pick(v.p)
  const t = pick(GEWOHNHEIT)
  const vv = vPres(s, v)
  return fix({
    teile: [subj(s), W(vv, 'v'), W(o, 'o'), W(t, 'adv'), W(p, 'adv')],
    falsch: [3, 4],
    richtig: [subj(s), W(vv, 'v'), W(o, 'o'), W(p, 'adv'), W(t, 'adv')],
    tipp: 'Time before place is German order. English: place first, then time – “in the park on Saturdays”.',
    regel: R('P – T', 'place before time'), ...L2, anker: 'mpt',
  })
}

const ORTE = ['at the cinema', 'at school', 'at home', 'in London', 'at the doctor’s', 'at Mia’s party']
function warGesternFix() {
  const s = pick(LEUTE)
  const p = pick(ORTE)
  const t = pick(VORBEI)
  const v = sei(s, true)
  return fix({
    teile: [subj(s), W(v, 'v'), W(t, 'adv'), W(p, 'adv')],
    falsch: [2, 3],
    richtig: [subj(s), W(v, 'v'), W(p, 'adv'), W(t, 'adv')],
    tipp: `“Ich war gestern im Kino” – in English the place comes first: “${gross(s.t)} ${v} ${p} ${t}”.`,
    regel: R('P – T', 'place before time'), ...L2, anker: 'mpt',
  })
}

function mpt() {
  const s = pick(LEUTE)
  const v = pick(TUN.filter((x) => x.p.length && x.m.length))
  const teile = [subj(s), W(v.ed, 'v'), W(pick(v.o), 'o'), W(pick(v.m), 'adv'), W(pick(v.p), 'adv'), W(pick(VORBEI), 'adv')]
  return bau({
    crew: SAM,
    briefing: 'A long train! How? Where? When? Couple them all.',
    teile, alt: [[5, 0, 1, 2, 3, 4]],
    tipp: 'After S – V – O: manner (how?) – place (where?) – time (when?).',
    regel: R('M – P – T', 'how? – where? – when?'), ...L2, anker: 'mpt',
  })
}

const WEGE = [['to school', 'by bike'], ['home', 'on foot'], ['to the cinema', 'by bus'], ['to London', 'by train'], ['to the lake', 'by car']]
function bewegung() {
  const s = pick(LEUTE)
  const [p, m] = pick(WEGE)
  const teile = [subj(s), W('went', 'v'), W(p, 'adv'), W(m, 'adv'), W(pick(VORBEI), 'adv')]
  return bau({
    crew: LOU,
    briefing: 'All aboard! Where did they go – and how?',
    teile, alt: [[4, 0, 1, 2, 3]],
    tipp: 'With go, come, drive …, the place comes straight after the verb: “went to school by bike”. And: go home – without to!',
    regel: R('go + place', 'the goal comes straight after the verb'), ...L2, anker: 'movement',
  })
}

const TERMINE = [
  [['the lesson', 's'], ['starts', 'v'], ['at 8 o’clock', 'adv'], ['on Monday', 'adv']],
  [['the party', 's'], ['starts', 'v'], ['at 7 pm', 'adv'], ['on Saturday', 'adv']],
  [['my train', 's'], ['leaves', 'v'], ['at 6:15', 'adv'], ['on Friday morning', 'adv']],
  [['we', 's'], ['are meeting', 'v'], ['at 4', 'adv'], ['on Sunday', 'adv']],
]
function kleinGross() {
  const teile = pick(TERMINE).map(([t, k]) => W(t, k))
  return bau({
    crew: LOU,
    briefing: 'Two time wagons – which one goes first?',
    teile, alt: [[3, 0, 1, 2]],
    tipp: 'Two times: the small one first, then the big one – “at 8 o’clock on Monday”.',
    regel: R('small → big', 'at 8 o’clock on Monday'), ...L2, anker: 'small-big',
  })
}

function nachHause() {
  const paare = [
    [S('let’s:v go:v home:adv'), [S('let’s:v go:v to_home:adv'), S('let’s:v home:adv go:v')], '.'],
    [S('come:v here:adv quickly:adv'), [S('come:v to_here:adv quickly:adv'), S('quickly:adv come:v to_here:adv')], '!'],
    [S('I:s went:v home:adv early:adv'), [S('I:s went:v to_home:adv early:adv'), S('I:s went:v early:adv to_home:adv')], '.'],
  ]
  const [richtig, falsch, ende] = pick(paare)
  return wahl({
    richtig, falsch, ende,
    tipp: 'home, here and there don’t need “to”: go home, come here, go there.',
    regel: R('go home', 'no “to” before home, here, there'), ...L2, anker: 'movement',
  })
}

// ===========================================================================
// Level 3 · always, never & co.
// ===========================================================================
const L3 = { seite: 'adverbs' }
const VORNE_OK = ['usually', 'often', 'sometimes']

function haeufigVollverb() {
  const s = pick(LEUTE)
  const v = pick(TUN)
  const a = pick(HAEUFIG)
  return slot({
    satz: [subj(s), W(vPres(s, v), 'v'), W(pick(v.o), 'o')],
    wort: W(a, 'adv'),
    ok: VORNE_OK.includes(a) ? [1, 0] : [1],
    tipp: `“${a}” goes before the main verb: “${gross(s.t)} ${a} ${vPres(s, v)} …”.`,
    regel: R('S – always – V', 'before the main verb'), ...L3, anker: 'rules',
  })
}

const ZUSTAND = ['late', 'tired', 'hungry', 'happy', 'at home', 'in a hurry']
function haeufigBe() {
  const s = pick(LEUTE)
  const a = pick(HAEUFIG)
  return slot({
    satz: [subj(s), W(sei(s), 'v'), W(pick(ZUSTAND), 'n')],
    wort: W(a, 'adv'),
    ok: VORNE_OK.includes(a) ? [2, 0] : [2],
    tipp: `After am / is / are: “${gross(s.t)} ${sei(s)} ${a} …”.`,
    regel: R('be – always', 'after am / is / are'), ...L3, anker: 'rules',
  })
}

const MIT_HILFSVERB = [
  (s) => [[subj(s), W(hab(s), 'v'), W('been', 'v'), W('to Paris', 'adv')], 'never'],
  (s) => [[subj(s), W(hab(s), 'v'), W('finished', 'v'), W('the test', 'o')], 'already'],
  (s) => [[subj(s), W(hab(s), 'v'), W('eaten', 'v'), W('lunch', 'o')], 'just'],
  (s) => [[subj(s), W('can', 'v'), W('find', 'v'), W('a parking space', 'o')], 'never'],
  (s) => [[subj(s), W('will', 'v'), W('remember', 'v'), W('this day', 'o')], 'always'],
]
function haeufigHilfsverb() {
  const s = pick(LEUTE)
  const [satz, a] = pick(MIT_HILFSVERB)(s)
  return slot({
    satz,
    wort: W(a, 'adv'),
    ok: [2],
    tipp: `After the first helping verb: “${gross(s.t)} ${satz[1].t} ${a} ${satz[2].t} …”.`,
    regel: R('A – never – V', 'after the first helping verb'), ...L3, anker: 'rules',
  })
}

function haeufigFrage() {
  const s = pick(FRAGE_LEUTE)
  const v = pick(TUN)
  const a = pick(['usually', 'often', 'always'])
  return slot({
    satz: [W(tu(s), 'v'), W(klein(s.t), 's'), W(v.b, 'v'), W(pick(v.o), 'o')],
    wort: W(a, 'adv'),
    ok: [2],
    ende: '?',
    tipp: `In questions, “${a}” comes after the subject: “${tu(s)} ${klein(s.t)} ${a} ${v.b} …?”`,
    regel: R('Do – S – often – V?', 'after the subject in questions'), ...L3, anker: 'questions',
  })
}

function haeufigFix() {
  const s = pick(LEUTE)
  if (coin()) {
    const v = pick(TUN)
    const a = pick(['always', 'often', 'never', 'usually'])
    const vv = vPres(s, v)
    const o = pick(v.o)
    return fix({
      teile: [subj(s), W(vv, 'v'), W(a, 'adv'), W(o, 'o')],
      falsch: [1, 2],
      richtig: [subj(s), W(a, 'adv'), W(vv, 'v'), W(o, 'o')],
      tipp: `German order („spielt immer“). English: “${a}” before the main verb – “${gross(s.t)} ${a} ${vv} …”.`,
      regel: R('S – always – V', 'before the main verb'), ...L3, anker: 'rules',
    })
  }
  const a = pick(['always', 'never', 'often'])
  const z = pick(ZUSTAND)
  return fix({
    teile: [subj(s), W(a, 'adv'), W(sei(s), 'v'), W(z, 'n')],
    falsch: [1, 2],
    richtig: [subj(s), W(sei(s), 'v'), W(a, 'adv'), W(z, 'n')],
    tipp: `With be, the adverb comes after it: “${gross(s.t)} ${sei(s)} ${a} ${z}”.`,
    regel: R('be – always', 'after am / is / are'), ...L3, anker: 'rules',
  })
}

function langeZeit() {
  const s = pick(LEUTE)
  const v = pick(TUN)
  const t = pick(['every day', 'twice a week', 'every weekend', 'once a month'])
  return slot({
    satz: [subj(s), W(vPres(s, v), 'v'), W(pick(v.o), 'o')],
    wort: W(t, 'adv'),
    ok: [3, 0],
    tipp: `“${t}” is a long time phrase – it goes at the end (or at the start), never in the middle.`,
    regel: R('… every day', 'long time phrases at the end'), ...L3, anker: 'start-end',
  })
}

function alsoToo() {
  const s = pick(LEUTE)
  const [b, s3, objekte] = pick(MAG)
  const v = ist3(s) ? s3 : b
  const auch = pick(['also', 'too'])
  return slot({
    satz: [subj(s), W(v, 'v'), W(pick(objekte), 'o')],
    wort: W(auch, 'adv'),
    ok: auch === 'too' ? [3] : [1],
    tipp: auch === 'too' ? '“too” goes at the end: “… pizza, too.”' : '“also” goes in the middle, before the main verb: “I also like …”.',
    regel: auch === 'too' ? R('…, too', 'at the end') : R('S – also – V', 'middle position'), ...L3, anker: 'also-too',
  })
}

// ===========================================================================
// Level 4 · Questions & negatives
// ===========================================================================
const L4 = { seite: 'questions' }

function jaNeinFrage() {
  const s = pick(FRAGE_LEUTE)
  const v = pick(TUN)
  const teile = [W(tu(s), 'v'), W(klein(s.t), 's'), W(v.b, 'v'), W(pick(v.o), 'o')]
  return bau({
    crew: SAM,
    briefing: 'Build a question train!',
    teile, ende: '?',
    tipp: `Question: ${tu(s)} + subject + verb – “${tu(s)} ${klein(s.t)} ${v.b} …?” (no -s after ${tu(s)}).`,
    regel: R('Do / Does – S – V?', 'helping verb before the subject'), ...L4, anker: 'formula',
  })
}

const WFRAGEN = [
  { qw: 'where', v: 'live', rest: null },
  { qw: 'what time', v: 'get up', rest: null },
  { qw: 'how often', v: 'play', rest: 'tennis' },
  { qw: 'what', v: 'do', rest: 'last weekend', past: true },
  { qw: 'where', v: 'go', rest: 'last summer', past: true },
  { qw: 'why', v: 'leave', rest: 'so early', past: true },
  { qw: 'when', v: 'start', rest: 'school', past: true },
]
function wFrage() {
  const s = pick(FRAGE_LEUTE)
  const f = pick(WFRAGEN)
  const a = f.past ? 'did' : tu(s)
  const teile = [W(f.qw, 'qw'), W(a, 'v'), W(klein(s.t), 's'), W(f.v, 'v'), ...(f.rest ? [W(f.rest, f.rest === 'tennis' || f.rest === 'school' ? 'o' : 'adv')] : [])]
  return bau({
    crew: SAM,
    briefing: 'A question with a question word. Couple it!',
    teile, ende: '?',
    tipp: `QW – A – S – V: “${f.qw} ${a} ${klein(s.t)} ${f.v} …?” ✗ “${f.qw} ${f.past ? 'went' : 'lives'} …?”`,
    regel: R('QW – A – S – V', 'question word, helping verb, subject, verb'), ...L4, anker: 'formula',
  })
}

const BE_FRAGEN = [
  S('where:qw is:v my_phone:s'), S('why:qw are:v you:s sad:n'), S('how_old:qw is:v your_sister:s'),
  S('can:v you:s help:v me:o'), S('when:qw will:v the_train:s arrive:v'), S('are:v you:s ready:n'),
  S('what:qw are:v you:s doing:v'), S('where:qw were:v you:s yesterday:adv'),
]
function beFrage() {
  return bau({
    crew: SAM,
    briefing: 'No “do” needed here – why? Couple the train!',
    teile: pick(BE_FRAGEN), ende: '?',
    tipp: 'be, can, will … are already helping verbs – they go before the subject. No do!',
    regel: R('be / can – S …?', 'no do with be, can, will'), ...L4, anker: 'be',
  })
}

const SUBJ_EREIGNIS = [['broke', 'break', 'the window'], ['ate', 'eat', 'my chocolate'], ['called', 'call', 'you'], ['won', 'win', 'the game'], ['took', 'take', 'my bike']]
const OBJ_EREIGNIS = [['Anna', 'met', 'meet', 'at the party'], ['you', 'called', 'call', 'yesterday'], ['Tom', 'invited', 'invite', 'to his party'], ['your dad', 'saw', 'see', 'in town']]
function werFrage() {
  if (coin()) {
    const [ed, b, o] = pick(SUBJ_EREIGNIS)
    return wahl({
      kontext: [`Somebody ${ed} ${o}. You want to know who.`],
      richtig: [W('who', 's'), W(ed, 'v'), W(o, 'o')],
      falsch: [[W('who', 's'), W('did', 'v'), W(b, 'v'), W(o, 'o')], [W('who', 's'), W(o, 'o'), W(ed, 'v')]],
      ende: '?',
      tipp: '“Who” is the subject here (somebody did it) – so no “did”: normal order, like a statement.',
      regel: R('Who – V …?', 'who = subject → no do'), ...L4, anker: 'subject-questions',
    })
  }
  const [s, ed, b, rest] = pick(OBJ_EREIGNIS)
  return wahl({
    kontext: [`${s === 'you' ? 'You' : s} ${ed} somebody ${rest}. You want to know who.`],
    richtig: [W('who', 'o'), W('did', 'v'), W(s, 's'), W(b, 'v'), W(rest, 'adv')],
    falsch: [[W('who', 's'), W(ed, 'v'), W(s, 'o'), W(rest, 'adv')], [W('who', 'o'), W(s, 's'), W(ed, 'v'), W(rest, 'adv')]],
    ende: '?',
    tipp: '“Who” is the object here (they met somebody) – so you need “did”: Who did … meet?',
    regel: R('Who – did – S – V?', 'who = object → did'), ...L4, anker: 'subject-questions',
  })
}

const PRAEP_FRAGEN = [
  S('who:qw are:v you:s talking:v to:n'), S('what:qw are:v you:s looking:v at:n'), S('where:qw do:v you:s come:v from:n'),
  S('what:qw is:v this_book:s about:n'), S('who:qw did:v you:s go:v with:n'), S('what:qw are:v you:s waiting:v for:n'),
]
function praepFrage() {
  return bau({
    crew: LOU,
    briefing: 'Where does the little word go? Couple the question!',
    teile: pick(PRAEP_FRAGEN), ende: '?',
    tipp: 'The preposition goes to the end: “Who are you talking to?” – “Mit wem …?”',
    regel: R('QW … to?', 'preposition at the end'), ...L4, anker: 'prepositions',
  })
}

function frageFix() {
  const s = pick(EINZELN)
  if (coin()) {
    const [qw, v3, b] = pick([['where', 'lives', 'live'], ['where', 'works', 'work'], ['when', 'gets up', 'get up'], ['what', 'eats', 'eat'], ['why', 'cries', 'cry']])
    return fix({
      teile: [W(qw, 'qw'), W(v3, 'v'), W(klein(s.t), 's')],
      falsch: [1, 2],
      richtig: [W(qw, 'qw'), W('does', 'v'), W(klein(s.t), 's'), W(b, 'v')],
      ende: '?',
      tipp: `German order („Wo wohnt …?“). English needs a helping verb: “${qw} does ${klein(s.t)} ${b}?”`,
      regel: R('QW – does – S – V?', 'no main verb before the subject'), ...L4, anker: 'formula',
    })
  }
  const z = pick(['sad', 'late', 'angry', 'so tired'])
  return fix({
    teile: [W('why', 'qw'), W(klein(s.t), 's'), W('is', 'v'), W(z, 'n')],
    falsch: [1, 2],
    richtig: [W('why', 'qw'), W('is', 'v'), W(klein(s.t), 's'), W(z, 'n')],
    ende: '?',
    tipp: 'In a question, the helping verb (is) goes before the subject: “Why is …?”',
    regel: R('QW – A – S', 'question order'), ...L4, anker: 'formula',
  })
}

function verneinungVergangen() {
  const s = pick(LEUTE)
  const v = pick(TUN)
  const teile = [subj(s), W('didn’t', 'v'), W(v.b, 'v'), W(pick(v.o), 'o'), W(pick(VORBEI), 'adv')]
  return bau({
    crew: LOU,
    teile, alt: [[4, 0, 1, 2, 3]],
    tipp: `didn’t + infinitive: “${gross(s.t)} didn’t ${v.b} …” – ✗ “didn’t ${v.ed}”.`,
    regel: R('S – didn’t – V', 'not after the helping verb'), ...L4, anker: 'negatives',
  })
}

const KURZ = [
  ['Do you like pizza?', S('yes,:n I:s do:v'), [S('yes,:n I:s like:v'), S('yes,:n I:s am:v')]],
  ['Does Tom play the guitar?', S('no,:n he:s doesn’t:v'), [S('no,:n he:s doesn’t_play:v'), S('no,:n he:s isn’t:v')]],
  ['Is she your sister?', S('yes,:n she:s is:v'), [S('yes,:n she’s:s'), S('yes,:n she:s does:v')]],
  ['Have you finished?', S('yes,:n I:s have:v'), [S('yes,:n I:s finished:v'), S('yes,:n I:s do:v')]],
  ['Can you swim?', S('no,:n I:s can’t:v'), [S('no,:n I:s don’t:v'), S('no,:n I:s not:v')]],
]
function kurzantwort() {
  const [q, richtig, falsch] = pick(KURZ)
  return wahl({
    briefing: 'Short answer! Which train is right?',
    kontext: [`“${q}”`],
    richtig, falsch,
    tipp: 'Short answers use the same helping verb as the question: Do you …? – Yes, I do.',
    regel: R('Yes, I do.', 'same helping verb as in the question'), ...L4, anker: 'short-answers',
  })
}

// ===========================================================================
// Level 5 · Two objects & phrasal verbs
// ===========================================================================
const L5 = { seite: 'objects' }
const PERSONEN = ['my grandma', 'Tom', 'the teacher', 'a friend', 'my cousin']
const ZU = [['sent', 'a postcard'], ['showed', 'the photos'], ['gave', 'a present'], ['lent', 'some money'], ['wrote', 'a letter']]
const FUER = [['bought', 'a T-shirt'], ['made', 'a cake'], ['cooked', 'dinner'], ['found', 'a new flat']]

function zweiObjekte() {
  const s = pick(LEUTE)
  const p = pick(PERSONEN.filter((x) => x !== s.t))
  const fuer = coin()
  const [v, d] = pick(fuer ? FUER : ZU)
  if (coin()) {
    return bau({
      teile: [subj(s), W(v, 'v'), W(p, 'o'), W(d, 'o')],
      tipp: `Person first, then the thing: “${v} ${p} ${d}”.`,
      regel: R('V – person – thing', `${v} ${p} ${d}`), ...L5, anker: 'two-objects',
    })
  }
  return bau({
    teile: [subj(s), W(v, 'v'), W(d, 'o'), W(`${fuer ? 'for' : 'to'} ${p}`, 'o')],
    tipp: `Thing first, then ${fuer ? 'for' : 'to'} + person: “${v} ${d} ${fuer ? 'for' : 'to'} ${p}”.`,
    regel: R(`V – thing – ${fuer ? 'for' : 'to'} + person`, `${v} ${d} ${fuer ? 'for' : 'to'} ${p}`), ...L5, anker: 'two-objects',
  })
}

function pronomenObjekt() {
  const v = pick(['give', 'show', 'send', 'bring', 'pass'])
  const it = pick(['it', 'them'])
  const p = pick(['me', 'him', 'her', 'us'])
  return wahl({
    crew: SAM,
    kontext: ['Can you …?'],
    richtig: [W('can', 'v'), W('you', 's'), W(v, 'v'), W(it, 'o'), W(`to ${p}`, 'o')],
    falsch: [[W('can', 'v'), W('you', 's'), W(v, 'v'), W(p, 'o'), W(it, 'o')], [W('can', 'v'), W('you', 's'), W(v, 'v'), W(`to ${p}`, 'o'), W(it, 'o')]],
    ende: '?',
    tipp: `With “${it}”, the thing comes first: “${v} ${it} to ${p}” – not “${v} ${p} ${it}”.`,
    regel: R('V – it – to + person', `${v} ${it} to ${p}`), ...L5, anker: 'pronouns',
  })
}

const ERKLAEREN = [['explain', ['the rule', 'the homework', 'the game']], ['describe', ['your house', 'the thief', 'your new school']]]
function erklaeren() {
  const [v, objekte] = pick(ERKLAEREN)
  const o = pick(objekte)
  const p = pick(['me', 'us'])
  return bau({
    crew: LOU,
    briefing: '„Kannst du mir … erklären?“ – careful with this one!',
    teile: [W('can', 'v'), W('you', 's'), W(v, 'v'), W(o, 'o'), W(`to ${p}`, 'o')],
    ende: '?',
    tipp: `${v} + thing + to + person: “${v} ${o} to ${p}”. ✗ “${v} ${p} ${o}”.`,
    regel: R(`${v} sth to sb`, 'always with to'), ...L5, anker: 'explain',
  })
}

const PHRASAL = [
  ['turn', 'off', 'the TV', 'it'], ['pick', 'up', 'your bag', 'it'], ['put', 'on', 'your coat', 'it'],
  ['throw', 'away', 'the old shoes', 'them'], ['fill', 'in', 'the form', 'it'], ['switch', 'on', 'the lights', 'them'],
  ['give', 'back', 'the books', 'them'], ['take', 'off', 'your shoes', 'them'],
]
function phrasalNomen() {
  const [v, x, o] = pick(PHRASAL)
  return bau({
    crew: SAM,
    briefing: 'A phrasal verb train. Couple it!',
    teile: [W('please', 'n'), W(v, 'v'), W(x, 'v'), W(o, 'o')],
    alt: [[0, 1, 3, 2], [1, 2, 3, 0], [1, 3, 2, 0]],
    tipp: `With a noun, both are fine: “${v} ${x} ${o}” or “${v} ${o} ${x}”.`,
    regel: R(`${v} ${x} + noun`, 'noun in the middle or at the end'), ...L5, anker: 'phrasal-verbs',
  })
}

function phrasalPronomen() {
  const [v, x, o, it] = pick(PHRASAL)
  return bau({
    crew: SAM,
    briefing: `Now with “${it}” instead of “${o}”. Couple it!`,
    teile: [W('please', 'n'), W(v, 'v'), W(it, 'o'), W(x, 'v')],
    alt: [[1, 2, 3, 0]],
    tipp: `With a pronoun, it must go in the middle: “${v} ${it} ${x}” – ✗ “${v} ${x} ${it}”.`,
    regel: R(`${v} ${it} ${x}`, 'pronoun always in the middle'), ...L5, anker: 'phrasal-verbs',
  })
}

function phrasalFix() {
  const [v, x, , it] = pick(PHRASAL)
  return fix({
    teile: [W(v, 'v'), W(x, 'v'), W(it, 'o'), W('please', 'n')],
    falsch: [1, 2],
    richtig: [W(v, 'v'), W(it, 'o'), W(x, 'v'), W('please', 'n')],
    tipp: `Pronouns go between the verb and the little word: “${v} ${it} ${x}”.`,
    regel: R(`${v} ${it} ${x}`, 'pronoun always in the middle'), ...L5, anker: 'phrasal-verbs',
  })
}

function nichtTrennbar() {
  const paare = [
    [S('I’m:s looking_for:v my_keys:o'), [S('I’m:s looking:v my_keys:o for:v')]],
    [S('can:v you:s look_after:v them:o'), [S('can:v you:s look:v them:o after:v')], '?'],
    [S('we:s got_on:v the_bus:o'), [S('we:s got:v the_bus:o on:v')]],
    [S('she:s is_listening_to:v music:o'), [S('she:s is_listening:v music:o to:v')]],
  ]
  const [richtig, falsch, ende = '.'] = pick(paare)
  return wahl({
    richtig, falsch, ende,
    tipp: 'look for, look after, get on, listen to can’t be split – the object always comes after the little word.',
    regel: R('look for sth', 'can’t be split'), ...L5, anker: 'phrasal-verbs',
  })
}

// ===========================================================================
// Level 6 · Subordinate clauses & indirect questions
// ===========================================================================
const L6 = { seite: 'clauses' }

const GRUENDE = [
  ['I stayed at home', S('because:qw I:s was:v ill:n')],
  ['we went inside', S('because:qw it:s was:v cold:n')],
  ['Tom was late', S('because:qw he:s missed:v the_bus:o')],
  ['Mia is happy', S('because:qw she:s got:v a_new_bike:o')],
  ['I think', S('that:qw he:s is:v right:n')],
  ['I know', S('that:qw she:s has:v a_dog:o')],
  ['we stayed inside', S('when:qw it:s rained:v')],
  ['call me', S('if:qw you:s need:v help:o')],
]
function weil() {
  const [haupt, teile] = pick(GRUENDE)
  return bau({
    crew: LOU,
    briefing: 'Attach the second train. Careful: this is not German!',
    vor: [W(haupt, 'n')],
    teile,
    tipp: `After “${teile[0].t}”: S – V – O, like a normal sentence. ✗ verb at the end.`,
    regel: R(`${teile[0].t} – S – V`, 'no verb at the end'), ...L6, anker: 'svo',
  })
}

function nebensatzFix() {
  const [haupt, t] = pick(GRUENDE.filter(([, x]) => x.length === 4))
  return fix({
    teile: [W(haupt, 'n'), t[0], t[1], t[3], t[2]],
    falsch: [3, 4],
    richtig: [W(haupt, 'n'), ...t],
    tipp: `German order („weil ich krank war“). English: “${t[0].t} ${t[1].t} ${t[2].t} ${t[3].t}”.`,
    regel: R('conj. – S – V', 'no verb at the end'), ...L6, anker: 'svo',
  })
}

function vorneFix() {
  const paare = [
    [S('when:qw I:s home:adv came:v'), S('I_ate_something:n'), 3],
    [S('if:qw you:s time:o have:v'), S('call_me:n'), 3],
    [S('because:qw it:s cold:n was:v'), S('we_stayed_inside:n'), 3],
  ]
  const [ns, hs] = pick(paare)
  const richtig = [ns[0], ns[1], ns[3], ns[2]]
  return fix({
    teile: [...ns.slice(0, 3), W(ns[3].t + ',', ns[3].k), ...hs],
    falsch: [2, 3],
    richtig: [...richtig.slice(0, 3), W(richtig[3].t + ',', richtig[3].k), ...hs],
    tipp: 'Even when the clause comes first: S – V inside it, then a comma and the main clause.',
    regel: R('When I came home, I …', 'S – V in both parts'), ...L6, anker: 'position',
  })
}

const INDIREKT = [
  S('where:qw the_station:s is:v'), S('what_time:qw the_film:s starts:v'), S('where:qw Tom:s lives:v'),
  S('how_much:qw this_jacket:s costs:v'), S('when:qw the_next_bus:s leaves:v'), S('why:qw Anna:s is:v sad:n'),
  S('where:qw the_toilets:s are:v'),
]
function indirekt() {
  const vor = pick(['Can you tell me', 'Do you know', 'Could you tell me'])
  const teile = pick(INDIREKT)
  return bau({
    crew: SAM,
    briefing: 'A polite question. Couple the rest of the train!',
    vor: [W(vor, 'n')],
    teile, ende: '?',
    tipp: `Indirect question: question word + S + V – “${teile.map((x) => x.t).join(' ')}”. No question order!`,
    regel: R('… where S – V', 'normal order after the question word'), ...L6, anker: 'indirect-questions',
  })
}

function indirektWahl() {
  const [qw, s, v] = pick([['where', 'the bank', 'is'], ['what time', 'the shop', 'opens'], ['where', 'the museum', 'is'], ['how far', 'the beach', 'is']])
  const direkt = v === 'opens' ? [W(qw, 'qw'), W('does', 'v'), W(s, 's'), W('open', 'v')] : [W(qw, 'qw'), W(v, 'v'), W(s, 's')]
  return wahl({
    richtig: [W('do you know', 'n'), W(qw, 'qw'), W(s, 's'), W(v, 'v')],
    falsch: [[W('do you know', 'n'), ...direkt]],
    ende: '?',
    tipp: 'After “Do you know …”, use normal order: question word + subject + verb.',
    regel: R('Do you know where S – V?', 'no question order'), ...L6, anker: 'indirect-questions',
  })
}

const RELATIV = [
  ['The girl', S('who:qw sits:v next_to_me:adv'), 'is from Italy'],
  ['The man', S('who:qw lives:v next_door:adv'), 'is a pilot'],
  ['The film', S('that:qw we:s saw:v'), 'was great'],
  ['The bike', S('which:qw I:s bought:v'), 'was cheap'],
  ['The friend', S('I:s went:v to_Spain:adv with:n'), 'is called Ben'],
]
function relativ() {
  const [vor, teile, nach] = pick(RELATIV)
  return bau({
    crew: LOU,
    briefing: 'Put the relative clause in the middle of the train!',
    vor: [W(vor, 'n')], nach: [W(nach, 'n')],
    teile,
    tipp: 'In a relative clause, the verb doesn’t go to the end either. Prepositions do: “the friend I went to Spain with”.',
    regel: R('the man who lives …', 'relative clause: S – V'), ...L6, anker: 'relative',
  })
}

// ===========================================================================
// Level 7 · Inversion & emphasis
// ===========================================================================
const L7 = { seite: 'special' }

const AUSSAGEN = [
  ['I like jazz.', 'so', 'do'], ['I’m tired.', 'so', 'am'], ['I can’t swim.', 'neither', 'can'], ['I didn’t do my homework.', 'neither', 'did'],
  ['I went to the party.', 'so', 'did'], ['I haven’t finished.', 'neither', 'have'], ['I don’t like spiders.', 'neither', 'do'],
  ['I can play the guitar.', 'so', 'can'], ['I was at home.', 'so', 'was'], ['I won’t go.', 'neither', 'will'],
]
function soNeither() {
  const [satz, w, a] = pick(AUSSAGEN)
  const wer = pick([['I', 1], ['Tom', 3], ['we', 9]])
  // Hilfsverb an die Person anpassen
  let aux = a
  if (wer[1] === 3 && a === 'do') aux = 'does'
  if (a === 'am') aux = wer[1] === 3 ? 'is' : wer[1] === 9 ? 'are' : 'am'
  if (a === 'have' && wer[1] === 3) aux = 'has'
  if (a === 'was' && wer[1] === 9) aux = 'were'
  return bau({
    crew: SAM,
    briefing: `Anna says: “${satz}” – ${wer[0] === 'I' ? 'you' : wer[0]} too! Couple the answer.`,
    teile: [W(w, 'adv'), W(aux, 'v'), W(wer[0], 's')],
    tipp: `${w === 'so' ? 'So' : 'Neither'} + helping verb + subject: “${w} ${aux} ${wer[0]}” – the helping verb comes from Anna’s sentence.`,
    regel: R(`${w === 'so' ? 'So' : 'Neither'} + A + S`, w === 'so' ? 'me too' : 'me neither'), ...L7, anker: 'so-neither',
  })
}

const INVERSION = [
  { vor: 'Never', teile: S('have:v I:s seen:v such_a_mess:o'), ende: '!' },
  { vor: 'Hardly', teile: S('had:v we:s arrived:v'), nach: 'when it started to rain' },
  { vor: 'Only then', teile: S('did:v I:s understand:v the_problem:o') },
  { vor: 'Under no circumstances', teile: S('must:v you:s open:v this_door:o') },
  { vor: 'Not only', teile: S('does:v she:s sing:v'), nach: '– she also dances' },
  { vor: 'Rarely', teile: S('have:v we:s had:v so_much_fun:o'), ende: '!' },
]
function inversion() {
  const x = pick(INVERSION)
  return bau({
    crew: LOU,
    briefing: `The sentence starts with “${x.vor}”. What happens next?`,
    vor: [W(x.vor, 'adv')], nach: x.nach ? [W(x.nach, 'n')] : [],
    teile: x.teile, ende: x.ende ?? '.',
    tipp: `After “${x.vor}” at the start: question order – helping verb + subject (“${x.teile[0].t} ${x.teile[1].t} …”).`,
    regel: R(`${x.vor} + A + S`, 'like in a question'), ...L7, anker: 'negative-adverbs',
  })
}

function inversionFix() {
  const x = pick(INVERSION.filter((i) => !i.nach))
  const t = x.teile
  return fix({
    teile: [W(x.vor, 'adv'), t[1], t[0], ...t.slice(2)],
    falsch: [1, 2],
    richtig: [W(x.vor, 'adv'), ...t],
    ende: x.ende ?? '.',
    tipp: `After “${x.vor}” at the start, the helping verb comes before the subject: “${x.vor} ${t[0].t} ${t[1].t} …”.`,
    regel: R(`${x.vor} + A + S`, 'like in a question'), ...L7, anker: 'negative-adverbs',
  })
}

function hierKommt() {
  const [n, p] = pick([['the bus', 'it'], ['my mum', 'she'], ['the teacher', 'he'], ['our pizza', 'it']])
  if (coin()) {
    return wahl({
      kontext: [`Look – ${n}!`],
      richtig: [W('here', 'adv'), W('comes', 'v'), W(n, 's')],
      falsch: [[W('here', 'adv'), W(n, 's'), W('come', 'v')], [W(n, 's'), W('here', 'adv'), W('comes', 'v')]],
      ende: '!',
      tipp: 'Here + verb + noun: “Here comes the bus!”',
      regel: R('Here comes the bus!', 'noun after the verb'), ...L7, anker: 'here-there',
    })
  }
  return wahl({
    kontext: [`Look – ${n}! (use “${p}”)`],
    richtig: [W('here', 'adv'), W(p, 's'), W('comes', 'v')],
    falsch: [[W('here', 'adv'), W('comes', 'v'), W(p, 's')], [W('comes', 'v'), W(p, 's'), W('here', 'adv')]],
    ende: '!',
    tipp: `With a pronoun, no inversion: “Here ${p} comes!” – ✗ “Here comes ${p}!”`,
    regel: R(`Here ${p} comes!`, 'pronoun before the verb'), ...L7, anker: 'here-there',
  })
}

function ohneIf() {
  const [a, s, v, rest] = pick([
    ['had', 'I', 'known', 'I would have helped'], ['had', 'we', 'left earlier', 'we would have caught the bus'],
    ['should', 'you', 'need help', 'call us'], ['were', 'I', 'you', 'I’d take the job'],
  ])
  return wahl({
    kontext: ['Formal English – without “if”:'],
    richtig: [W(a, 'v'), W(s, 's'), W(v + ',', a === 'were' ? 's' : 'v'), W(rest, 'n')],
    falsch: [[W(s, 's'), W(a, 'v'), W(v + ',', 'v'), W(rest, 'n')], [W(a, 'v'), W(v, 'v'), W(s + ',', 's'), W(rest, 'n')]],
    tipp: 'Without if, the helping verb goes first: “Had I known, …” = “If I had known, …”.',
    regel: R('Had I known, …', '= If I had known'), ...L7, anker: 'conditional',
  })
}

const CLEFT = [
  S('it_was:n Mia:s who:qw found:v the_key:o'), S('it_was:n Tom:s who:qw broke:v the_window:o'),
  S('it_was:n my_dad:s who:qw made:v the_cake:o'), S('it_was:n in_Paris:adv that:qw I:s met:v her:o'),
  S('what:qw I:s need:v is:v a_holiday:o'), S('what:qw she:s hates:v is:v the_noise:o'),
]
function cleft() {
  return bau({
    crew: ADA,
    briefing: 'Put the important part in the spotlight! Couple the train.',
    teile: pick(CLEFT),
    tipp: 'Cleft sentence: “It was … who / that …” or “What I need is …” – this way the important part stands out.',
    regel: R('It was X who …', 'emphasis with a split sentence'), ...L7, anker: 'cleft',
  })
}

// ===========================================================================
// Export: je Level die Aufgaben, leicht → schwer
// ===========================================================================
const AUFGABEN = [
  [svo, verbObjekt, zeitVorne, zeitVorneFix, verbObjektFix, esGibt, verneinung],
  [ortZeit, warGesternFix, ortZeitFix, bewegung, nachHause, mpt, kleinGross],
  [haeufigVollverb, haeufigBe, haeufigFix, haeufigHilfsverb, langeZeit, haeufigFrage, alsoToo],
  [jaNeinFrage, wFrage, beFrage, frageFix, verneinungVergangen, praepFrage, kurzantwort, werFrage],
  [zweiObjekte, pronomenObjekt, erklaeren, phrasalNomen, phrasalPronomen, phrasalFix, nichtTrennbar],
  [weil, nebensatzFix, indirekt, indirektWahl, vorneFix, relativ],
  [soNeither, inversion, inversionFix, hierKommt, ohneIf, cleft],
  [zeitVorneFix, ortZeit, haeufigFix, wFrage, werFrage, phrasalPronomen, erklaeren, nebensatzFix, indirekt, soNeither, inversion],
]

export default AUFGABEN
