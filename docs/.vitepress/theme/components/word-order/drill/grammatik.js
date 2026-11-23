// Word Order Express: Bausteine – Wörter als Waggons { t, k } und kleine Wortlisten.
// k = Farbe: s (subject) · v (verb, auch Hilfsverb) · o (object) · adv (manner, place, time, always …)
//         qw (Fragewort, Konjunktion) · n (Rest)

export { pick, sample, shuffle, coin } from '../../silent-teacher/engine.js'

/** 'Tom:s plays:v the_book:o' → [{t,k}] – Leerzeichen im Waggon als _ , ohne :k → n */
export function S(str) {
  return str.split(' ').filter(Boolean).map((w) => {
    const i = w.lastIndexOf(':')
    return i < 0 ? { t: w.replace(/_/g, ' '), k: 'n' } : { t: w.slice(0, i).replace(/_/g, ' '), k: w.slice(i + 1) }
  })
}

export const W = (t, k = 'n') => ({ t, k })
export const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/** Vergleichsform eines Satzes: klein, ohne Satzzeichen, einfache Leerzeichen */
export const norm = (teile) =>
  teile.map((x) => (typeof x === 'string' ? x : x.t)).join(' ').toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim()

// ---------------------------------------------------------------------------
// Personen: p = 1 (I) · 2 (you) · 3 (he/she/it) · 9 (we/they)
// ---------------------------------------------------------------------------
const P = (t, p) => ({ t, p })
export const EINZELN = [P('Tom', 3), P('Anna', 3), P('Ben', 3), P('Mia', 3), P('my sister', 3), P('my dad', 3)]
export const MEHRERE = [P('we', 9), P('my friends', 9), P('the twins', 9), P('they', 9)]
export const LEUTE = [...EINZELN, ...EINZELN, ...MEHRERE, P('I', 1), P('I', 1)]
export const FRAGE_LEUTE = [P('you', 2), P('you', 2), ...EINZELN, P('your parents', 9), P('they', 9)]

export const ist3 = (s) => s.p === 3
export const tu = (s) => (ist3(s) ? 'does' : 'do')
export const tuNicht = (s) => (ist3(s) ? 'doesn’t' : 'don’t')
export const sei = (s, past = false) => (past ? (s.p === 1 || s.p === 3 ? 'was' : 'were') : s.p === 1 ? 'am' : s.p === 3 ? 'is' : 'are')
export const hab = (s) => (ist3(s) ? 'has' : 'have')
/** Subjekt in der Satzmitte klein (my sister), Namen und I bleiben */
export const klein = (t) => (/^(I|[A-Z][a-z]+)$/.test(t) && !['We', 'They', 'You'].includes(t) ? t : t.charAt(0).toLowerCase() + t.slice(1))

// ---------------------------------------------------------------------------
// Verben mit passenden Objekten, Orten und Art und Weise
// ---------------------------------------------------------------------------
const V = (b, s, ed, o, p = [], m = []) => ({ b, s, ed, o, p, m })
export const TUN = [
  V('play', 'plays', 'played', ['football', 'tennis', 'basketball'], ['in the park', 'at school', 'in the garden'], ['really well']),
  V('read', 'reads', 'read', ['comics', 'a book', 'the newspaper'], ['in bed', 'on the bus', 'in the library'], ['quietly']),
  V('watch', 'watches', 'watched', ['films', 'TV', 'football'], ['at home', 'at Ben’s house', 'in the living room']),
  V('eat', 'eats', 'ate', ['pizza', 'lunch', 'fruit'], ['in the kitchen', 'at school', 'in the garden'], ['quickly', 'slowly']),
  V('clean', 'cleans', 'cleaned', ['the kitchen', 'the car', 'the windows'], ['at home'], ['carefully']),
  V('write', 'writes', 'wrote', ['emails', 'stories', 'poems'], ['at home', 'in the café'], ['carefully']),
  V('cook', 'cooks', 'cooked', ['dinner', 'pasta', 'soup'], ['in the kitchen', 'at home'], ['quickly']),
  V('buy', 'buys', 'bought', ['bread', 'fresh fruit', 'magazines'], ['in town', 'at the market', 'at the supermarket']),
  V('play', 'plays', 'played', ['the guitar', 'the piano'], ['in a band', 'at home', 'in the music room'], ['beautifully']),
]

export const GEWOHNHEIT = ['every day', 'on Saturdays', 'after school', 'every weekend', 'twice a week', 'in the evening']
export const VORBEI = ['yesterday', 'last week', 'last Saturday', 'two days ago', 'last night', 'last summer']
export const HAEUFIG = ['always', 'usually', 'often', 'sometimes', 'never']
