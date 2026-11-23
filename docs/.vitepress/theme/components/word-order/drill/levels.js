// Word Order Express: Metadaten und Fortschritt – klein, damit der Button auf den Lernseiten
// nicht alle Aufgaben laden muss.

export const LEKTION_PFAD = '/students/english/grammar/word-order/'
export const SPIEL_PFAD = '/students/english/grammar/word-order/express'

// seite = Unterseite des Kapitels ('' = Übersicht), anker = Abschnitt
export const LEVELS = [
  { icon: '🚃', titel: 'Subject – verb – object', de: 'Yesterday I went … · I like pizza very much · It is raining', seite: 'basics', anker: 'traps' },
  { icon: '🗺️', titel: 'Manner, place, time', de: 'in the park on Saturdays · go home by bus', seite: 'place-time', anker: 'mpt' },
  { icon: '🔁', titel: 'always, never & co.', de: 'She always gets up … · is always late · has never been', seite: 'adverbs', anker: 'rules' },
  { icon: '❓', titel: 'Questions & negatives', de: 'Do you …? Where does …? Who called / did you call?', seite: 'questions', anker: 'formula' },
  { icon: '🎁', titel: 'Two objects & phrasal verbs', de: 'give it to me · explain it to me · turn it off', seite: 'objects', anker: 'overview' },
  { icon: '🔗', titel: 'Clauses & indirect questions', de: 'because I was tired · where the station is', seite: 'clauses', anker: 'svo' },
  { icon: '🔄', titel: 'Inversion & emphasis', de: 'So do I · Never have I … · It was Tom who …', seite: 'special', anker: 'overview' },
  { icon: '🌀', titel: 'Rush hour', de: 'alles gemischt – jeder Waggon an seinen Platz', seite: '', anker: 'golden-rules' },
]

export const RAENGE = [
  { ab: 0, icon: '🎒', titel: 'Trainee' },
  { ab: 1, icon: '🔧', titel: 'Shunter' },
  { ab: 3, icon: '🚦', titel: 'Signal Operator' },
  { ab: 5, icon: '🚂', titel: 'Train Driver' },
  { ab: 7, icon: '🎫', titel: 'Conductor' },
  { ab: 8, icon: '👑', titel: 'Station Master' },
]

/** Rang und nächster Rang nach Anzahl geschaffter Level */
export function rang(geschafft) {
  let i = 0
  while (i + 1 < RAENGE.length && geschafft >= RAENGE[i + 1].ab) i++
  return { ...RAENGE[i], naechster: RAENGE[i + 1] ?? null }
}

/** Sterne nach Fehlern im Level */
export const sterneFuer = (fehler) => (fehler <= 1 ? 3 : fehler <= 4 ? 2 : 1)

const STORAGE_KEY = 'word-order-express-v1'

/** { "1": 3, "2": 2 } = Level-Nummer → beste Sterne */
export function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // privater Modus o. Ä.
  }
}
