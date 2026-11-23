// Time Travel Agency: Grammatik-Bausteine – Personen, Verben und alle Formen aus dem Raster
// (tense × aspect) plus will und going to, jeweils mit typischen Fehlformen.

export { pick } from '../../silent-teacher/engine.js'

export const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// ---------------------------------------------------------------------------
// Personen: p = I · you · 3sg · we · they, g = Geschlecht (für Pronomen)
// ---------------------------------------------------------------------------
const P = (n, p, g = 'n') => ({ n, p, g })
export const EINZELN = [
  P('Tom', '3sg', 'm'), P('Anna', '3sg', 'f'), P('Lisa', '3sg', 'f'), P('Ben', '3sg', 'm'),
  P('Mia', '3sg', 'f'), P('Max', '3sg', 'm'), P('my sister', '3sg', 'f'), P('my dad', '3sg', 'm'),
]
export const MEHRERE = [P('the twins', 'they'), P('my friends', 'they'), P('Tom and Anna', 'they'), P('we', 'we'), P('they', 'they')]
export const ICH_DU = [P('I', 'I'), P('you', 'you')]
export const ALLE_PERSONEN = [...EINZELN, ...EINZELN, ...MEHRERE, ...ICH_DU]

export const PRONOMEN = { m: 'he', f: 'she', n: 'it', I: 'I', you: 'you', we: 'we', they: 'they' }
export const pron = (s) => (s.p === '3sg' ? PRONOMEN[s.g] : PRONOMEN[s.p])
export const ist3 = (s) => s.p === '3sg'

// ---------------------------------------------------------------------------
// Verben: [Grundform, s-Form, simple past, 3rd form, -ing, Ergänzungen, Optionen]
// prog: false → klingt in der Verlaufsform seltsam
// ---------------------------------------------------------------------------
const V = (b, s, past, pp, ing, rest, o = {}) => ({ b, s, past, pp, ing, rest, regel: past === b + 'ed' || past === b + 'd' || o.regel, ...o })
export const VERBEN = [
  V('play', 'plays', 'played', 'played', 'playing', ['football', 'tennis', 'computer games', 'the guitar']),
  V('watch', 'watches', 'watched', 'watched', 'watching', ['TV', 'a film', 'a football match']),
  V('visit', 'visits', 'visited', 'visited', 'visiting', ['Grandma', 'London', 'the museum']),
  V('clean', 'cleans', 'cleaned', 'cleaned', 'cleaning', ['the kitchen', 'the car', 'the windows']),
  V('cook', 'cooks', 'cooked', 'cooked', 'cooking', ['dinner', 'spaghetti', 'soup']),
  V('paint', 'paints', 'painted', 'painted', 'painting', ['a picture', 'the fence']),
  V('listen', 'listens', 'listened', 'listened', 'listening', ['to music', 'to the radio']),
  V('study', 'studies', 'studied', 'studied', 'studying', ['for a test', 'maths'], { regel: true }),
  V('dance', 'dances', 'danced', 'danced', 'dancing', ['salsa', 'at the party']),
  V('wash', 'washes', 'washed', 'washed', 'washing', ['the dishes', 'the dog']),
  V('help', 'helps', 'helped', 'helped', 'helping', ['in the garden', 'at the café']),
  V('read', 'reads', 'read', 'read', 'reading', ['a book', 'a comic', 'the newspaper'], { regel: false }),
  V('write', 'writes', 'wrote', 'written', 'writing', ['an email', 'a letter', 'a story']),
  V('eat', 'eats', 'ate', 'eaten', 'eating', ['pizza', 'an apple', 'breakfast']),
  V('drink', 'drinks', 'drank', 'drunk', 'drinking', ['tea', 'orange juice']),
  V('go', 'goes', 'went', 'gone', 'going', ['to school', 'to the cinema', 'to the park', 'swimming']),
  V('ride', 'rides', 'rode', 'ridden', 'riding', ['a bike', 'a horse']),
  V('swim', 'swims', 'swam', 'swum', 'swimming', ['in the lake', 'in the sea']),
  V('make', 'makes', 'made', 'made', 'making', ['a cake', 'pancakes']),
  V('do', 'does', 'did', 'done', 'doing', ['homework', 'the shopping', 'yoga']),
  V('buy', 'buys', 'bought', 'bought', 'buying', ['a new bike', 'some bread', 'a present']),
  V('take', 'takes', 'took', 'taken', 'taking', ['photos', 'the bus']),
  V('sing', 'sings', 'sang', 'sung', 'singing', ['a song', 'in the choir']),
  V('run', 'runs', 'ran', 'run', 'running', ['in the park', 'to school']),
  V('fly', 'flies', 'flew', 'flown', 'flying', ['to Spain', 'to London']),
  V('build', 'builds', 'built', 'built', 'building', ['a treehouse', 'a sandcastle']),
  V('draw', 'draws', 'drew', 'drawn', 'drawing', ['a dragon', 'a map']),
  V('see', 'sees', 'saw', 'seen', 'seeing', ['the new film', 'a fox'], { prog: false }),
  V('meet', 'meets', 'met', 'met', 'meeting', ['our new neighbours', 'friends']),
]
export const REGELMAESSIG = VERBEN.filter((v) => v.regel)
export const UNREGELMAESSIG = VERBEN.filter((v) => !v.regel)
export const MIT_VERLAUF = VERBEN.filter((v) => v.prog !== false)
export const verb = (b) => VERBEN.find((v) => v.b === b)

/** falsch „regelmäßig" gemachte Vergangenheit: goed, eated, buyed … */
export const falschEd = (v) => (v.b.endsWith('e') ? v.b + 'd' : v.b + 'ed')

// ---------------------------------------------------------------------------
// be / have / do in der richtigen Person
// ---------------------------------------------------------------------------
export const be = (s) => (s.p === 'I' ? 'am' : ist3(s) ? 'is' : 'are')
export const beNicht = (s) => (s.p === 'I' ? 'am not' : ist3(s) ? 'isn’t' : 'aren’t')
export const war = (s) => (s.p === 'I' || ist3(s) ? 'was' : 'were')
export const warFalsch = (s) => (s.p === 'I' || ist3(s) ? 'were' : 'was')
export const hat = (s) => (ist3(s) ? 'has' : 'have')
export const hatFalsch = (s) => (ist3(s) ? 'have' : 'has')
export const tut = (s) => (ist3(s) ? 'does' : 'do')
export const tutFalsch = (s) => (ist3(s) ? 'do' : 'does')

/**
 * Verbform im Raster.
 * f: present simple · present progressive · past simple · past progressive · present perfect ·
 *    past perfect · present perfect progressive · past perfect progressive ·
 *    will · going to · future progressive · future perfect
 */
export function form(f, s, v, neg = false) {
  switch (f) {
    case 'present simple': return neg ? `${tut(s)}n’t ${v.b}` : ist3(s) ? v.s : v.b
    case 'present progressive': return neg ? `${beNicht(s)} ${v.ing}` : `${be(s)} ${v.ing}`
    case 'past simple': return neg ? `didn’t ${v.b}` : v.past
    case 'past progressive': return `${war(s)}${neg ? 'n’t' : ''} ${v.ing}`
    case 'present perfect': return `${hat(s)}${neg ? 'n’t' : ''} ${v.pp}`
    case 'past perfect': return `had${neg ? 'n’t' : ''} ${v.pp}`
    case 'present perfect progressive': return `${hat(s)}${neg ? 'n’t' : ''} been ${v.ing}`
    case 'past perfect progressive': return `had${neg ? 'n’t' : ''} been ${v.ing}`
    case 'will': return `${neg ? 'won’t' : 'will'} ${v.b}`
    case 'going to': return `${neg ? beNicht(s) : be(s)} going to ${v.b}`
    case 'future progressive': return `will be ${v.ing}`
    case 'future perfect': return `will have ${v.pp}`
    default: throw new Error('unbekannte Form: ' + f)
  }
}

// ---------------------------------------------------------------------------
// Lücken: [k:answer|falsch|falsch@hinweis] – k = Farbe/Art der Lücke
// ---------------------------------------------------------------------------
export const luecke = (k, answer, falsch, hinweis = '') =>
  `[${k}:${[answer, ...[...new Set(falsch)].filter((w) => w && w !== answer)].join('|')}${hinweis ? '@' + hinweis : ''}]`

const MARKE = /\[(\w+):([^\]]+)\]/g

/** Satz → Teile: Text oder { k, answer, wrong, hint } (Lücke) bzw. { k, t } (Markierung) */
export function parse(text) {
  const teile = []
  let pos = 0
  for (const m of text.matchAll(MARKE)) {
    if (m.index > pos) teile.push(text.slice(pos, m.index))
    const [inhalt, hint] = m[2].split('@')
    const [answer, ...wrong] = inhalt.split('|')
    teile.push(wrong.length ? { k: m[1], answer, wrong, hint } : { t: answer, k: m[1] })
    pos = m.index + m[0].length
  }
  if (pos < text.length) teile.push(text.slice(pos))
  return teile
}
