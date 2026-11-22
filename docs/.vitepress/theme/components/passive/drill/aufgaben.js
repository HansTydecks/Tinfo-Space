// Crime Scene: Aufgaben je Level, von leicht nach schwer (wie beim Reporter / Silent Teacher).
// Jede Aufgabe ist eine Funktion ohne Parameter, die eine zufällige Karte liefert:
//   { sprecher: { e, n }, rolle, kontext, direkt: [teile], bericht: [teile], label?, tipp?, anker? }
// tipp / anker dürfen ein Objekt je Lückenart sein ({ be: '…' }).

import {
  NONE, ZEUGEN, ERMITTLER, POSS, VERBEN, UNREGELMAESSIG, ZEITANGABE,
  aktiv, beForm, beFalsch, ppFalsch, parse, luecke, taeterFuer, gross, verb, pick,
} from './grammatik.js'

const ohne = (liste, x) => liste.filter((y) => y !== x)

function karte({ sp, rolle = 'witness', d, r, kontext = [], label, tipp, anker }) {
  return {
    sprecher: { e: sp.e, n: sp.n },
    rolle,
    kontext,
    direkt: parse(gross(d)),
    bericht: parse(gross(r)),
    label,
    tipp,
    anker,
  }
}

const EINFACH = ['present simple', 'past simple']
const ALLE = ['present simple', 'past simple', 'present progressive', 'past progressive', 'present perfect', 'past perfect', 'will', 'going to']
const OHNE_VERLAUF = ['find', 'see']
const ankerBe = (t) => (EINFACH.includes(t) ? 'form' : 'tenses')

// ---------------------------------------------------------------------------
// Aussagen: Täter × Verb × Objekt × Zeitform (× Zeitangabe)
// ---------------------------------------------------------------------------
/**
 * @param o.tenses  Zeitformen
 * @param o.luecken Lücken: obj · chunk (be + pp als eine Lücke) · be · pp · agent
 * @param o.verben  Verbliste (Standard: alle)
 * @param o.agent   'drop' | 'keep' – nur Täter, die man weglässt / nennt
 */
function aussage(o) {
  const L = new Set(o.luecken)
  return () => {
    const t = pick(o.tenses)
    // find / see klingen in der Verlaufsform seltsam („is finding the jewels")
    const v = pick((o.verben ?? VERBEN).filter((x) => !(t.includes('progressive') && OHNE_VERLAUF.includes(x.base))))
    const obj = pick(v.objekte)
    let a = taeterFuer(v, o.agent)
    // „by the police" ist Geschmackssache – als by-agent-Lücke zu unklar
    while (L.has('agent') && a.t === 'the police') a = taeterFuer(v, o.agent)
    const z = pick(ZEITANGABE[t] ?? [''])
    const zeit = z ? ` ${z}` : ''
    const aktivForm = aktiv(t, a.n, v)
    const be = beForm(t, obj.n)

    const d = `[agent:${gross(a.t)}] [verb:${aktivForm}] [obj:${obj.t}]${zeit}.`

    const subj = gross(obj.t)
    const andere = gross(pick(ohne(v.objekte, obj)).t)
    const objTeil = L.has('obj') ? luecke('obj', subj, [gross(a.t), andere]) : `[obj:${subj}]`
    let verbTeil
    if (L.has('chunk')) {
      const falschesPP = v.past !== v.pp ? v.past : v.base
      verbTeil = luecke('verb', `${be} ${v.pp}`, [aktivForm, `${be} ${falschesPP}`, `${be} ${v.ing}`])
    } else {
      const beTeil = L.has('be') ? luecke('be', be, beFalsch(t, obj.n)) : `[be:${be}]`
      const ppTeil = L.has('pp') ? luecke('pp', v.pp, ppFalsch(v)) : `[pp:${v.pp}]`
      verbTeil = `${beTeil} ${ppTeil}`
    }
    let agentTeil = ''
    if (L.has('agent')) {
      if (a.drop) {
        const obj3 = a.t === 'they' ? 'them' : a.t
        agentTeil = ' ' + luecke('agent', NONE, [`by ${obj3}`, a.t === 'they' ? 'by they' : `from ${a.t}`])
      } else {
        agentTeil = ' ' + luecke('agent', `by ${a.t}`, [NONE, `from ${a.t}`, `of ${a.t}`])
      }
    } else if (!a.drop) {
      agentTeil = ` [agent:by ${a.t}]`
    }
    const r = `${objTeil} ${verbTeil}${agentTeil}${zeit}.`

    const kontext = [`⏱️ ${t}`]
    if (L.has('agent')) kontext.push(a.drop ? '🤷 the doer is not important / unknown' : '🔎 the doer is important')
    return karte({ sp: pick(ZEUGEN), d, r, kontext, anker: { be: ankerBe(t) } })
  }
}

// ---------------------------------------------------------------------------
// Modalverben: Ermittler geben Anweisungen
// ---------------------------------------------------------------------------
const MODAL_VERBEN = ['find', 'catch', 'arrest', 'question', 'search', 'check', 'lock', 'open', 'film'].map(verb)
const WIR = [{ t: 'we', n: 'pl' }, { t: 'you', n: 'pl' }, { t: 'someone', n: 'sg' }]
const MODAL_ZEIT = ['', ' today', ' at once', ' before tonight']

function modal(o) {
  const L = new Set(o.luecken)
  return () => {
    const v = pick(MODAL_VERBEN)
    const obj = pick(v.objekte)
    const a = pick(WIR)
    const t = pick(o.modale)
    const zeit = pick(MODAL_ZEIT)
    const be = beForm(t, obj.n)
    const d = `[agent:${gross(a.t)}] [verb:${aktiv(t, a.n, v)}] [obj:${obj.t}]${zeit}.`
    const beTeil = L.has('be') ? luecke('be', be, beFalsch(t, obj.n)) : `[be:${be}]`
    const ppTeil = L.has('pp') ? luecke('pp', v.pp, ppFalsch(v)) : `[pp:${v.pp}]`
    const r = `[obj:${gross(obj.t)}] ${beTeil} ${ppTeil}${zeit}.`
    return karte({
      sp: pick(ERMITTLER),
      rolle: 'detective',
      d,
      r,
      kontext: [`🔧 ${t}`],
      anker: { be: 'modals', pp: 'modals' },
      tipp: { be: 'Modal verb + be + past participle: can be opened, must be checked, has to be searched. Never “must been”.' },
    })
  }
}

// ---------------------------------------------------------------------------
// Verneinung und Fragen
// ---------------------------------------------------------------------------
const FRAGE_VERBEN = ['steal', 'break', 'take', 'hide', 'open', 'find', 'search', 'check', 'lock', 'eat', 'write', 'damage'].map(verb)
const nicht = (s) => s.replace(/^(is|are|was|were|has|have)\b/, '$1n’t')

function negation(o) {
  const L = new Set(o.luecken)
  return () => {
    const v = pick(FRAGE_VERBEN)
    const obj = pick(v.objekte)
    const t = pick(o.tenses)
    const aktivNeg = { 'past simple': `didn’t ${v.base}`, 'present perfect': `haven’t ${v.pp}`, 'present simple': `don’t ${v.base}` }[t]
    const be = nicht(beForm(t, obj.n))
    const o2 = obj.n === 'pl' ? 'sg' : 'pl'
    const hilfs = { 'past simple': 'didn’t', 'present perfect': obj.n === 'pl' ? 'haven’t' : 'hasn’t', 'present simple': obj.n === 'pl' ? 'don’t' : 'doesn’t' }[t]
    const falsch = [hilfs, nicht(beForm(t, o2)), t === 'present perfect' ? `${be.split(' ')[0]} being` : beForm(t, obj.n)]
    const d = `[agent:They] [verb:${aktivNeg}] [obj:${obj.t}].`
    const beTeil = L.has('be') ? luecke('be', be, falsch) : `[be:${be}]`
    const ppTeil = L.has('pp') ? luecke('pp', v.pp, ppFalsch(v)) : `[pp:${v.pp}]`
    const r = `[obj:${gross(obj.t)}] ${beTeil} ${ppTeil}.`
    return karte({
      sp: pick(ZEUGEN),
      d,
      r,
      kontext: [`⏱️ ${t} · negative`],
      anker: { be: 'questions', pp: 'questions' },
      tipp: { be: 'Negative passive: be + n’t + past participle – wasn’t stolen, isn’t locked, hasn’t been found. No “didn’t” / “don’t”!' },
    })
  }
}

const W = ['When', 'Where', 'How', 'Why']
function frage(o) {
  const L = new Set(o.luecken)
  return () => {
    const v = pick(FRAGE_VERBEN)
    const obj = pick(v.objekte)
    const t = pick(o.tenses)
    const wh = o.wh === 'mix' ? Math.random() < 0.5 : o.wh
    const w = wh ? pick(W) : ''
    const vorn = w ? `[order:${w}] ` : ''
    const vornR = w ? `${w} ` : ''
    const o2 = obj.n === 'pl' ? 'sg' : 'pl'
    const an = (s) => (w ? s : gross(s))
    let d, beAntwort, falsch, rest
    if (t === 'present perfect') {
      d = `${vorn}[verb:${an('have')}] [agent:they] [verb:${v.pp}] [obj:${obj.t}]?`
      beAntwort = obj.n === 'pl' ? 'have' : 'has'
      falsch = [obj.n === 'pl' ? 'are' : 'is', obj.n === 'pl' ? 'has' : 'have']
      rest = '[be:been] '
    } else {
      const hilfs = t === 'past simple' ? 'did' : 'do'
      d = `${vorn}[verb:${an(hilfs)}] [agent:they] [verb:${v.base}] [obj:${obj.t}]?`
      beAntwort = beForm(t, obj.n)
      falsch = [t === 'past simple' ? 'did' : obj.n === 'pl' ? 'do' : 'does', beForm(t, o2)]
      rest = ''
    }
    const beTeil = L.has('be') ? luecke('be', an(beAntwort), falsch.map(an)) : `[be:${an(beAntwort)}]`
    const ppTeil = L.has('pp') ? luecke('pp', v.pp, ppFalsch(v)) : `[pp:${v.pp}]`
    const r = `${vornR}${beTeil} [obj:${obj.t}] ${rest}${ppTeil}?`
    return karte({
      sp: pick(ERMITTLER),
      rolle: 'detective',
      d,
      r,
      label: '📝 Your question for the case file',
      kontext: [`⏱️ ${t} · ${w ? 'wh-question' : 'yes/no question'}`],
      anker: { be: 'questions', pp: 'questions' },
      tipp: { be: 'Passive question: (question word) + be + subject + past participle – Was the car stolen? Where was the money hidden? No “did”!' },
    })
  }
}

// ---------------------------------------------------------------------------
// Verben mit zwei Objekten
// ---------------------------------------------------------------------------
const ZWEI = [
  ['give', 'gave', 'given', 'giving'], ['send', 'sent', 'sent', 'sending'], ['show', 'showed', 'shown', 'showing'],
  ['offer', 'offered', 'offered', 'offering'], ['hand', 'handed', 'handed', 'handing'], ['promise', 'promised', 'promised', 'promising'],
]
const PERSONEN = [['the guard', 'sg'], ['the witness', 'sg'], ['Inspector Lane', 'sg'], ['the shop owner', 'sg'], ['the victims', 'pl']]
const DINGE = [['a note', 'sg'], ['a photo', 'sg'], ['a reward', 'sg'], ['the keys', 'pl'], ['a strange letter', 'sg'], ['two tickets', 'pl']]
const passt = (v, ding) => !['promise', 'offer'].includes(v) || ['a reward', 'two tickets'].includes(ding)

function zweiObjekte(o) {
  return () => {
    const dingZuerst = o.dingZuerst === 'mix' ? Math.random() < 0.5 : o.dingZuerst
    let z, ding
    do {
      z = pick(ZWEI)
      ding = pick(DINGE)
    } while (!passt(z[0], ding[0]))
    const [p, pn] = pick(PERSONEN)
    const [base, past, pp, ing] = z
    const d = `[agent:Someone] [verb:${past}] [obj:${p}] [obj:${ding[0]}].`
    let r
    if (dingZuerst) {
      const be = beForm('past simple', ding[1])
      r = `[obj:${gross(ding[0])}] [be:${be}] [pp:${pp}] ${luecke('agent', 'to', [NONE, 'by', 'from'])} ${p}.`
    } else {
      const be = beForm('past simple', pn)
      const falschBe = ['did', beForm('past simple', pn === 'pl' ? 'sg' : 'pl')]
      r = `[obj:${gross(p)}] ${luecke('be', be, falschBe)} ${luecke('pp', pp, [past !== pp ? past : base, base, ing])} ${ding[0]}.`
    }
    return karte({
      sp: pick(ZEUGEN),
      d,
      r,
      kontext: [dingZuerst ? '📦 the thing comes first' : '🙋 the person comes first'],
      anker: { be: 'two-objects', pp: 'two-objects', agent: 'two-objects' },
      tipp: dingZuerst
        ? 'When the thing comes first, the person needs “to”: A note was given to the guard.'
        : 'Two objects: the person usually becomes the subject – The guard was given a note.',
    })
  }
}

// ---------------------------------------------------------------------------
// Fortgeschritten: is said to … · It is said that … · have something done
// ---------------------------------------------------------------------------
const MEINEN = [
  { base: 'say', s: 'says', past: 'said', pp: 'said', ing: 'saying' },
  { base: 'believe', s: 'believes', past: 'believed', pp: 'believed', ing: 'believing' },
  { base: 'think', s: 'thinks', past: 'thought', pp: 'thought', ing: 'thinking' },
  { base: 'know', s: 'knows', past: 'knew', pp: 'known', ing: 'knowing' },
  { base: 'report', s: 'reports', past: 'reported', pp: 'reported', ing: 'reporting' },
]
const C = (praes, praet, inf, falsch) => ({ praes, praet, inf, falsch })
const AUSSAGEN = [
  C('is very dangerous', 'was very dangerous', 'to be very dangerous', ['being very dangerous', 'to is very dangerous']),
  C('lives in London', 'lived in London', 'to live in London', ['living in London', 'to lives in London']),
  C('has a fast boat', 'had a fast boat', 'to have a fast boat', ['having a fast boat', 'to has a fast boat']),
  C('is hiding in the forest', 'was hiding in the forest', 'to be hiding in the forest', ['hiding in the forest', 'to is hiding in the forest']),
  C('knows the guard', 'knew the guard', 'to know the guard', ['knowing the guard', 'to knows the guard']),
]
const VERDAECHTIGE = ['the thief', 'the gang leader', 'the robber', 'the mystery man']

function personal({ it }) {
  return () => {
    const m = pick(MEINEN)
    const c = pick(AUSSAGEN)
    const wer = pick(VERDAECHTIGE)
    const vergangen = Math.random() < 0.4
    const akt = vergangen ? m.past : m.base
    const inhalt = vergangen ? c.praet : c.praes
    const be = vergangen ? 'was' : 'is'
    const d = `[agent:People] [verb:${akt}] that [obj:${wer}] ${inhalt}.`
    const verbL = luecke('verb', `${be} ${m.pp}`, [vergangen ? m.past : m.s, `${be} ${m.ing}`])
    const r = it
      ? `${luecke('order', 'It', ['People', 'There'])} ${verbL} that ${wer} ${inhalt}.`
      : `[obj:${gross(wer)}] ${verbL} ${luecke('order', c.inf, c.falsch)}.`
    return karte({
      sp: pick(ERMITTLER),
      rolle: 'detective',
      d,
      r,
      kontext: [it ? '🗞️ start with “It”' : `🗞️ start with “${gross(wer)}”`],
      anker: { verb: 'advanced', order: 'advanced' },
      tipp: it
        ? 'It + is / was + said / believed / thought + that … – People say that … → It is said that …'
        : 'Personal passive: subject + is / was + said / believed / thought + to + infinitive – He is said to be dangerous.',
    })
  }
}

const SERVICE = [
  ['a locksmith', 'change', 'changed', 'changing', 'locks'],
  ['a builder', 'repair', 'repaired', 'repairing', 'window'],
  ['a mechanic', 'fix', 'fixed', 'fixing', 'car'],
  ['a painter', 'paint', 'painted', 'painting', 'front door'],
  ['an engineer', 'check', 'checked', 'checking', 'cameras'],
]
function haveDone() {
  return () => {
    const owner = pick(ZEUGEN)
    const sp = pick(ZEUGEN.filter((z) => z !== owner))
    const [wer, base, pp, ing, ding] = pick(SERVICE)
    const goingTo = Math.random() < 0.4
    const zeit = goingTo ? pick(['tomorrow', 'next week']) : pick(['yesterday', 'last week', 'on Monday'])
    const d = goingTo
      ? `[agent:${gross(wer)}] [verb:is going to ${base}] [obj:${owner.n}’s ${ding}] ${zeit}.`
      : `[agent:${gross(wer)}] [verb:${pp}] [obj:${owner.n}’s ${ding}] ${zeit}.`
    const have = goingTo
      ? luecke('be', 'is going to have', ['is going to be', 'is going to had'])
      : luecke('be', 'had', ['was', 'has'])
    const r = `${owner.n} ${have} [obj:${POSS[owner.g]} ${ding}] ${luecke('pp', pp, [base, ing])} ${zeit}.`
    return karte({
      sp,
      d,
      r,
      kontext: ['🛠️ someone did it for them'],
      anker: { be: 'advanced', pp: 'advanced' },
      tipp: 'have + object + past participle: someone does it for you – She had her locks changed. (not: She was her locks changed)',
    })
  }
}

// ---------------------------------------------------------------------------
// Alle Level: je ein Array von Aufgaben, von leicht nach schwer
// ---------------------------------------------------------------------------
const L1 = [
  aussage({ tenses: ['past simple'], luecken: ['obj'] }),
  aussage({ tenses: ['past simple'], luecken: ['obj', 'chunk'] }),
  aussage({ tenses: EINFACH, luecken: ['obj', 'chunk'] }),
]
const L2 = [
  aussage({ tenses: ['past simple'], luecken: ['be'] }),
  aussage({ tenses: ['present simple'], luecken: ['be'] }),
  aussage({ tenses: EINFACH, luecken: ['be'] }),
  aussage({ tenses: EINFACH, luecken: ['be', 'pp'] }),
]
const L3 = [
  aussage({ tenses: ['past simple'], luecken: ['pp'], verben: UNREGELMAESSIG }),
  aussage({ tenses: EINFACH, luecken: ['pp'], verben: UNREGELMAESSIG }),
  aussage({ tenses: EINFACH, luecken: ['be', 'pp'], verben: UNREGELMAESSIG }),
]
const L4 = [
  aussage({ tenses: ['present progressive', 'past progressive'], luecken: ['be'] }),
  aussage({ tenses: ['present perfect', 'past perfect'], luecken: ['be'] }),
  aussage({ tenses: ['will', 'going to'], luecken: ['be'] }),
  aussage({ tenses: ALLE, luecken: ['be', 'pp'] }),
]
const L5 = [
  modal({ modale: ['can', 'must', 'should'], luecken: ['be'] }),
  modal({ modale: ['can’t', 'might', 'could', 'will'], luecken: ['be'] }),
  modal({ modale: ['have to'], luecken: ['be'] }),
  modal({ modale: ['can', 'can’t', 'must', 'should', 'might', 'have to'], luecken: ['be', 'pp'] }),
]
const L6 = [
  aussage({ tenses: ['past simple'], luecken: ['agent'] }),
  aussage({ tenses: ['past simple', 'present perfect', 'present simple'], luecken: ['agent'] }),
  aussage({ tenses: ['past simple', 'present perfect'], luecken: ['be', 'agent'] }),
]
const L7 = [
  negation({ tenses: ['past simple'], luecken: ['be'] }),
  frage({ tenses: ['past simple'], luecken: ['be'] }),
  frage({ tenses: ['past simple'], luecken: ['be'], wh: true }),
  negation({ tenses: ['past simple', 'present perfect', 'present simple'], luecken: ['be', 'pp'] }),
  frage({ tenses: ['past simple', 'present perfect', 'present simple'], luecken: ['be', 'pp'], wh: 'mix' }),
]
const L8 = [
  zweiObjekte({ dingZuerst: false }),
  zweiObjekte({ dingZuerst: true }),
  personal({ it: true }),
  personal({ it: false }),
  haveDone(),
]
const L9 = [
  aussage({ tenses: ALLE, luecken: ['be', 'pp'] }),
  aussage({ tenses: ALLE, luecken: ['be', 'agent'] }),
  modal({ modale: ['can', 'can’t', 'must', 'should', 'might', 'have to', 'will'], luecken: ['be', 'pp'] }),
  negation({ tenses: ['past simple', 'present perfect', 'present simple'], luecken: ['be', 'pp'] }),
  frage({ tenses: ['past simple', 'present perfect', 'present simple'], luecken: ['be', 'pp'], wh: true }),
  frage({ tenses: ['past simple', 'present perfect'], luecken: ['be', 'pp'] }),
  zweiObjekte({ dingZuerst: 'mix' }),
  personal({ it: false }),
  haveDone(),
]

export default [L1, L2, L3, L4, L5, L6, L7, L8, L9]
