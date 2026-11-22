// Crime Scene: Metadaten und Fortschritt – klein, damit der Button auf der Lernseite
// nicht alle Aufgaben laden muss.

export const LEKTION_PFAD = '/students/english/grammar/passive/'
export const SPIEL_PFAD = '/students/english/grammar/passive/crime-scene'

export const LEVELS = [
  { icon: '🧩', titel: 'Object first', de: 'Das Objekt wird zum Subjekt: The window was broken.', anker: 'big-picture' },
  { icon: '🔎', titel: 'is / are · was / were', de: 'present & past simple: is stolen, were stolen', anker: 'form' },
  { icon: '🧾', titel: 'Irregular participles', de: 'stolen, broken, hidden, found, taken …', anker: 'form' },
  { icon: '⏳', titel: 'More tenses', de: 'is being, has been, had been, will be …', anker: 'tenses' },
  { icon: '🔧', titel: 'Modal verbs', de: 'can be opened, must be checked, has to be …', anker: 'modals' },
  { icon: '👤', titel: 'by … or not?', de: 'by the thief – oder ganz weglassen', anker: 'by-agent' },
  { icon: '❓', titel: 'Negatives & questions', de: 'wasn’t stolen, Was it found? Where was it hidden?', anker: 'questions' },
  { icon: '🗂️', titel: 'Advanced cases & got', de: 'I was given …, He is said to …, got stolen, Did it get caught?', anker: 'advanced' },
  { icon: '🚨', titel: 'The big case', de: 'alles gemischt', anker: 'everything-at-a-glance' },
]

export const RAENGE = [
  { ab: 0, icon: '👮', titel: 'Cadet' },
  { ab: 1, icon: '🔍', titel: 'Constable' },
  { ab: 3, icon: '🕵️', titel: 'Detective' },
  { ab: 5, icon: '🧥', titel: 'Inspector' },
  { ab: 7, icon: '🎖️', titel: 'Chief Inspector' },
  { ab: 9, icon: '🏅', titel: 'Commissioner' },
]

/** Rang und nächster Rang nach Anzahl geschaffter Level */
export function rang(geschafft) {
  let i = 0
  while (i + 1 < RAENGE.length && geschafft >= RAENGE[i + 1].ab) i++
  return { ...RAENGE[i], naechster: RAENGE[i + 1] ?? null }
}

/** Sterne nach Fehlern im Level */
export const sterneFuer = (fehler) => (fehler <= 1 ? 3 : fehler <= 4 ? 2 : 1)

const STORAGE_KEY = 'passive-crime-scene-v1'

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
