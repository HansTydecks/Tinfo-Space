// Time Travel Agency: Metadaten und Fortschritt – klein, damit der Button auf den Lernseiten
// nicht alle Aufgaben laden muss.

export const LEKTION_PFAD = '/students/english/grammar/tenses/'
export const SPIEL_PFAD = '/students/english/grammar/tenses/time-agency'

// seite = Unterseite des Kapitels ('' = Übersicht), anker = Abschnitt
export const LEVELS = [
  { icon: '⏺️', titel: 'NOW: simple or progressive?', de: 'plays oder is playing? Gewohnheit oder gerade jetzt', seite: 'present', anker: 'difference' },
  { icon: '⏪', titel: 'THEN: simple past', de: 'played, went, didn’t go, Did you …?, was/were', seite: 'past', anker: 'form' },
  { icon: '↩️', titel: 'Present perfect or past?', de: 'have visited oder visited? ever, never, just, for, since', seite: 'present-perfect', anker: 'contrast' },
  { icon: '〰️', titel: 'Past progressive', de: 'was reading when the phone rang', seite: 'past-progressive', anker: 'use' },
  { icon: '⏮️', titel: 'Past perfect', de: 'had already left, had been waiting', seite: 'past-perfect', anker: 'simple' },
  { icon: '⏳', titel: 'Present perfect progressive', de: 'have been waiting for 20 minutes', seite: 'perfect-progressive', anker: 'use' },
  { icon: '⏩', titel: 'LATER: the future', de: 'will, going to, I’m meeting …, the train leaves …', seite: 'future', anker: 'four-ways' },
  { icon: '🌀', titel: 'Timeline chaos', de: 'alles gemischt – das Signalwort entscheidet', seite: '', anker: 'three-questions' },
]

export const RAENGE = [
  { ab: 0, icon: '🎒', titel: 'Trainee' },
  { ab: 1, icon: '🧭', titel: 'Time Scout' },
  { ab: 3, icon: '🛸', titel: 'Time Pilot' },
  { ab: 5, icon: '⏱️', titel: 'Chrononaut' },
  { ab: 7, icon: '🌀', titel: 'Time Captain' },
  { ab: 8, icon: '👑', titel: 'Time Master' },
]

/** Rang und nächster Rang nach Anzahl geschaffter Level */
export function rang(geschafft) {
  let i = 0
  while (i + 1 < RAENGE.length && geschafft >= RAENGE[i + 1].ab) i++
  return { ...RAENGE[i], naechster: RAENGE[i + 1] ?? null }
}

/** Sterne nach Fehlern im Level */
export const sterneFuer = (fehler) => (fehler <= 1 ? 3 : fehler <= 4 ? 2 : 1)

const STORAGE_KEY = 'tenses-time-agency-v1'

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
