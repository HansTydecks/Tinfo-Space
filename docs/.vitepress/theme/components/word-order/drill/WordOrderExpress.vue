<script setup>
// „Word Order Express" – Pattern-Drill für Word order (aufgebaut wie Time Travel Agency, Crime Scene und Reporter).
// Wörter sind Waggons: im Rangierbahnhof richtig kuppeln, einen Waggon einsetzen, den falschen finden oder den richtigen Zug wählen.
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { withBase } from 'vitepress'
import AUFGABEN from './aufgaben.js'
import { LEVELS, LEKTION_PFAD, rang, sterneFuer, loadProgress, saveProgress } from './levels.js'
import { ZIEL_PUNKTE, FRAGE, naechsteKarte, kartenSchluessel, anzeige, pruefeBau } from './engine.js'
import '../../reported-speech/rs.css'
import '../wo.css'

const AUTO_WEITER_MS = 1600
const LOB = ['All aboard! 🚂', 'Perfectly coupled! 🔗', 'Right on track! 🛤️', 'Full steam ahead! 💨', 'Spot on! 🎯', 'Ada is impressed! 👷‍♀️']
const KONFETTI_FARBEN = ['#1c64d1', '#c2255c', '#2b8a3e', '#d9480f', '#fcc419']
const ZUEGE = ['IC 205', 'RE 17', 'EX 42', 'S 8', 'IC 731', 'RB 66', 'EX 99', 'ICE 12']

const ansicht = ref('start') // 'start' | 'spiel'
const levelIdx = ref(0)
const punkte = ref(0)
const karte = ref(null)
const phase = ref('frage') // 'frage' | 'fertig' | 'geschafft'
const gebaut = ref([]) // bau: Indizes in karte.hof, in der gekuppelten Reihenfolge
const wahlIdx = ref(-1) // slot: Lücke · fix: Waggon · wahl: Option
const ergebnis = ref(null) // { ok, erster?, reihe? }
const lob = ref(LOB[0])
const zugNr = ref(ZUEGE[0])
const streak = ref(0)
const stat = ref({ karten: 0, perfekt: 0, fehler: 0, besteSerie: 0 })
const abschluss = ref(null) // { sterne, neuerRang }
const progress = ref({})
const weiterBtn = ref(null)
const spielTop = ref(null)

let ziehung = { punkte: 0, gezeigt: 0, letzteKarte: '' }
let timer = null

// ---------------------------------------------------------------------------
// abgeleitete Werte
// ---------------------------------------------------------------------------
const level = computed(() => LEVELS[levelIdx.value])
const sterneVon = (i) => Number(progress.value[i + 1] ?? 0)
const geschafft = computed(() => LEVELS.filter((_, i) => sterneVon(i) > 0).length)
const sterneGesamt = computed(() => LEVELS.reduce((s, _, i) => s + sterneVon(i), 0))
const meinRang = computed(() => rang(geschafft.value))
const naechstesLevel = computed(() => LEVELS.findIndex((_, i) => sterneVon(i) === 0))
const rangFortschritt = computed(() => {
  const r = meinRang.value
  if (!r.naechster) return 100
  return Math.round(((geschafft.value - r.ab) / (r.naechster.ab - r.ab)) * 100)
})
const lektion = (seite = '', anker = '') => withBase(LEKTION_PFAD + seite) + (anker ? `#${anker}` : '')
const fertig = computed(() => phase.value === 'fertig')
const perfekt = computed(() => fertig.value && ergebnis.value?.ok)

const KONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  background: KONFETTI_FARBEN[i % KONFETTI_FARBEN.length],
  animationDelay: `${(i % 12) * 0.09}s`,
  animationDuration: `${1.8 + (i % 5) * 0.25}s`,
  transform: `rotate(${(i * 47) % 360}deg)`,
}))

/** Zug aus vor + Teilen + nach, Großschreibung und Satzzeichen wie im fertigen Satz */
function zug(teile, { vor = [], nach = [], ende = '', ...flags } = {}) {
  const alle = anzeige([...vor, ...teile, ...nach], ende)
  return alle.map((w, i) => ({
    ...w,
    fest: i < vor.length || i >= vor.length + teile.length,
    i: i - vor.length,
    ...(flags[i - vor.length] ?? {}),
  }))
}

// bau: gekuppelter Zug und Bahnhof
const bauZug = computed(() => {
  const k = karte.value
  if (!k || k.art !== 'bau') return []
  const voll = gebaut.value.length === k.hof.length
  const marken = {}
  if (ergebnis.value && !ergebnis.value.ok) marken[ergebnis.value.erster] = { falsch: true }
  return zug(gebaut.value.map((h) => k.hof[h]), { vor: k.vor, nach: k.nach, ende: voll ? k.ende : '', ...marken })
})
const bauGleis = computed(() => {
  const k = karte.value
  if (!k || k.art !== 'bau') return []
  const z = bauZug.value
  const bis = k.vor.length + gebaut.value.length
  const leer = Array.from({ length: offeneSlots.value }, (_, s) => ({ leer: true, naechster: s === 0 }))
  return [...z.slice(0, bis), ...leer, ...z.slice(bis)]
})
const offeneSlots = computed(() => (karte.value?.art === 'bau' ? karte.value.hof.length - gebaut.value.length : 0))
const richtigerZug = computed(() => {
  const k = karte.value
  if (!k || !ergebnis.value || ergebnis.value.ok) return null
  if (k.art === 'bau') return zug(ergebnis.value.reihe.map((i) => k.teile[i]), { vor: k.vor, nach: k.nach, ende: k.ende })
  if (k.art === 'slot') return zug(einsetzen(k, k.ok[0]), { ende: k.ende, [k.ok[0]]: { neu: true } })
  if (k.art === 'fix') return zug(k.richtig, { ende: k.ende })
  if (k.art === 'wahl') return zug(k.optionen.find((o) => o.ok).teile, { ende: k.optionen[0].ende })
  return null
})
const einsetzen = (k, g) => [...k.satz.slice(0, g), k.wort, ...k.satz.slice(g)]
const slotZug = computed(() => {
  const k = karte.value
  if (!k || k.art !== 'slot') return []
  if (wahlIdx.value < 0) return zug(k.satz, { ende: k.ende })
  return zug(einsetzen(k, wahlIdx.value), { ende: k.ende, [wahlIdx.value]: { neu: true, falsch: !ergebnis.value?.ok } })
})
const fixZug = computed(() => {
  const k = karte.value
  if (!k || k.art !== 'fix') return []
  const marken = {}
  if (wahlIdx.value >= 0) marken[wahlIdx.value] = ergebnis.value?.ok ? { gefunden: true } : { falsch: true }
  return zug(k.teile, { ende: k.ende, ...marken })
})

// ---------------------------------------------------------------------------
// Spielablauf
// ---------------------------------------------------------------------------
const wiederholung = (idx) => AUFGABEN.slice(0, Math.min(idx, 7)).flat()

function starte(idx, { url = 'push' } = {}) {
  clearTimeout(timer)
  levelIdx.value = Math.min(Math.max(idx, 0), LEVELS.length - 1)
  punkte.value = 0
  streak.value = 0
  stat.value = { karten: 0, perfekt: 0, fehler: 0, besteSerie: 0 }
  abschluss.value = null
  ziehung = { punkte: 0, gezeigt: 0, letzteKarte: '' }
  ansicht.value = 'spiel'
  neueKarte()
  if (url) setzeUrl(url)
  nextTick(() => spielTop.value?.scrollIntoView({ block: 'start' }))
}

function neueKarte() {
  ziehung.punkte = punkte.value
  const k = naechsteKarte(AUFGABEN[levelIdx.value], wiederholung(levelIdx.value), ziehung)
  ziehung.letzteKarte = kartenSchluessel(k)
  karte.value = k
  zugNr.value = ZUEGE[(stat.value.karten + levelIdx.value * 3) % ZUEGE.length]
  gebaut.value = []
  wahlIdx.value = -1
  ergebnis.value = null
  phase.value = 'frage'
}

// bau
function kuppeln(h) {
  if (phase.value !== 'frage' || gebaut.value.includes(h)) return
  gebaut.value = [...gebaut.value, h]
  if (gebaut.value.length === karte.value.hof.length) {
    const r = pruefeBau(karte.value, gebaut.value.map((x) => karte.value.hof[x]))
    kartenEnde(r)
  }
}
function abkuppeln(pos) {
  if (phase.value !== 'frage' || pos < 0) return
  gebaut.value = gebaut.value.filter((_, i) => i !== pos)
}

// slot · fix · wahl
function waehle(i) {
  if (phase.value !== 'frage') return
  const k = karte.value
  wahlIdx.value = i
  const ok = k.art === 'slot' ? k.ok.includes(i) : k.art === 'fix' ? k.falsch.includes(i) : k.optionen[i].ok
  kartenEnde({ ok })
}

function kartenEnde(r) {
  ergebnis.value = r
  stat.value.karten++
  if (!r.ok) {
    stat.value.fehler++
    punkte.value = Math.max(0, punkte.value - 1)
    streak.value = 0
  } else {
    punkte.value++
    streak.value++
    stat.value.perfekt++
    stat.value.besteSerie = Math.max(stat.value.besteSerie, streak.value)
    lob.value = LOB[stat.value.perfekt % LOB.length]
  }
  phase.value = 'fertig'
  if (r.ok) timer = setTimeout(weiter, AUTO_WEITER_MS)
  else nextTick(() => weiterBtn.value?.focus({ preventScroll: true }))
}

function weiter() {
  if (phase.value !== 'fertig') return
  clearTimeout(timer)
  if (punkte.value >= ZIEL_PUNKTE) levelGeschafft()
  else neueKarte()
}

function levelGeschafft() {
  const rangVorher = meinRang.value.titel
  const sterne = sterneFuer(stat.value.fehler)
  const nr = levelIdx.value + 1
  progress.value = { ...progress.value, [nr]: Math.max(sterne, sterneVon(levelIdx.value)) }
  saveProgress(progress.value)
  const neu = meinRang.value
  abschluss.value = { sterne, neuerRang: neu.titel !== rangVorher ? neu : null }
  phase.value = 'geschafft'
  nextTick(() => spielTop.value?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
}

function zurUebersicht() {
  clearTimeout(timer)
  ansicht.value = 'start'
  karte.value = null
  setzeUrl('push')
  nextTick(() => window.scrollTo({ top: 0 }))
}

// ---------------------------------------------------------------------------
// Tastatur: Ziffern wählen, Rücktaste kuppelt ab, Enter geht weiter
// ---------------------------------------------------------------------------
function onKeydown(e) {
  if (ansicht.value !== 'spiel' || !karte.value || e.ctrlKey || e.metaKey || e.altKey) return
  if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
  const k = karte.value
  if (phase.value === 'frage' && /^[1-9]$/.test(e.key)) {
    const n = Number(e.key) - 1
    const max = k.art === 'bau' ? k.hof.length : k.art === 'slot' ? k.satz.length + 1 : k.art === 'fix' ? k.teile.length : k.optionen.length
    if (n >= max) return
    e.preventDefault()
    if (k.art === 'bau') kuppeln(n)
    else waehle(n)
  } else if (phase.value === 'frage' && e.key === 'Backspace' && k.art === 'bau') {
    e.preventDefault()
    abkuppeln(gebaut.value.length - 1)
  } else if (e.key === 'Enter' && phase.value === 'fertig') {
    if (e.target instanceof HTMLElement && e.target.closest('button, a')) return
    e.preventDefault()
    weiter()
  }
}

// ---------------------------------------------------------------------------
// Adresse: ?level=<n>
// ---------------------------------------------------------------------------
function setzeUrl(art) {
  const url = new URL(window.location.href)
  if (ansicht.value === 'spiel') url.searchParams.set('level', String(levelIdx.value + 1))
  else url.searchParams.delete('level')
  if (url.href === window.location.href) return
  if (art === 'replace') window.history.replaceState(window.history.state, '', url)
  else window.history.pushState(null, '', url)
}

function ausUrl() {
  const n = Number.parseInt(new URLSearchParams(window.location.search).get('level') ?? '', 10)
  if (!Number.isInteger(n) || n < 1 || n > LEVELS.length) {
    clearTimeout(timer)
    ansicht.value = 'start'
    karte.value = null
    return
  }
  if (ansicht.value === 'spiel' && levelIdx.value === n - 1) return
  starte(n - 1, { url: 'replace' })
}

onMounted(() => {
  progress.value = loadProgress()
  ausUrl()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('popstate', ausUrl)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('popstate', ausUrl)
})
</script>

<template>
  <div class="rr rs-fig wo-fig woe">
    <!-- ============================================================ Start -->
    <section v-if="ansicht === 'start'">
      <header class="rr-hero">
        <div class="rr-hero__mic" aria-hidden="true">🚂</div>
        <div>
          <p class="rr-kicker">English Grammar · Word order</p>
          <h1 class="rr-hero__titel">Word Order Express</h1>
          <p class="rr-hero__text">
            Welcome to the station, Trainee! Every sentence is a train – and the wagons got mixed up in the yard.
            Couple them in the right order, find the wagon in the wrong place – and become Station Master!
          </p>
          <p class="rr-de">
            Jedes Wort ist ein Waggon. Kupple die Waggons in der richtigen Reihenfolge – nur dann darf der Zug abfahren.
          </p>
        </div>
      </header>

      <div class="rr-rang">
        <span class="rr-rang__icon" aria-hidden="true">{{ meinRang.icon }}</span>
        <div class="rr-rang__text">
          <small>Your rank</small>
          <strong>{{ meinRang.titel }}</strong>
          <span>{{ geschafft }}/{{ LEVELS.length }} levels · ⭐ {{ sterneGesamt }}/{{ LEVELS.length * 3 }}</span>
        </div>
        <div v-if="meinRang.naechster" class="rr-rang__weg">
          <div class="rr-rang__balken"><span :style="{ width: rangFortschritt + '%' }" /></div>
          <small>next: {{ meinRang.naechster.icon }} {{ meinRang.naechster.titel }}</small>
        </div>
      </div>

      <ul class="rr-regeln">
        <li><b class="rr-regeln__plus">+1</b> train without mistakes</li>
        <li><b class="rr-regeln__minus">−1</b> train with a mistake</li>
        <li><b>{{ ZIEL_PUNKTE }}</b> points finish a level</li>
        <li><b>⌨️</b> keys 1 – 9, ⌫ and Enter</li>
      </ul>

      <div class="rr-farben" aria-label="Colour code">
        <span class="woe-w woe-w--klein k-s">subject</span>
        <span class="woe-w woe-w--klein k-v">verb</span>
        <span class="woe-w woe-w--klein k-o">object</span>
        <span class="woe-w woe-w--klein k-adv">how · where · when</span>
        <span class="woe-w woe-w--klein k-qw">question word · linking word</span>
      </div>

      <div class="rr-kacheln">
        <button
          v-for="(l, i) in LEVELS"
          :key="l.titel"
          class="rr-kachel"
          :class="{ 'is-done': sterneVon(i) > 0, 'is-next': i === naechstesLevel }"
          @click="starte(i)"
        >
          <span class="rr-kachel__icon" aria-hidden="true">{{ l.icon }}</span>
          <span class="rr-kachel__nr">Level {{ i + 1 }}</span>
          <strong class="rr-kachel__titel">{{ l.titel }}</strong>
          <span class="rr-kachel__de">{{ l.de }}</span>
          <span v-if="sterneVon(i)" class="rr-sterne" :aria-label="`${sterneVon(i)} of 3 stars`">
            <span v-for="s in 3" :key="s" :class="{ 'is-an': s <= sterneVon(i) }">★</span>
          </span>
          <span v-else-if="i === naechstesLevel" class="rr-kachel__los">▶ Start here</span>
        </button>
      </div>

      <p class="rr-fuss">
        Your progress is only saved in this browser.
        <a :href="lektion()">📖 Word order – all the rules</a>
      </p>
    </section>

    <!-- ============================================================ Spiel -->
    <section v-else-if="karte" ref="spielTop" class="rr-spiel">
      <nav class="rr-nav">
        <a :href="lektion(level.seite, level.anker)">📖 Rules: {{ level.titel }}</a>
        <button @click="zurUebersicht">All levels</button>
      </nav>

      <header class="rr-kopf">
        <p class="rr-kicker">🚂 Word Order Express · Level {{ levelIdx + 1 }} of {{ LEVELS.length }}</p>
        <h1 class="rr-kopf__titel">{{ level.icon }} {{ level.titel }}</h1>
        <div class="rr-levelwahl" aria-label="Choose a level">
          <button
            v-for="(l, i) in LEVELS"
            :key="l.titel"
            :class="{ 'is-aktiv': i === levelIdx, 'is-done': sterneVon(i) > 0 }"
            :title="`Level ${i + 1}: ${l.titel}`"
            :aria-current="i === levelIdx ? 'step' : undefined"
            @click="i !== levelIdx && starte(i)"
          >{{ sterneVon(i) > 0 ? '✓' : i + 1 }}</button>
        </div>
      </header>

      <div class="rr-status">
        <div class="rr-balken" role="progressbar" aria-label="Points" :aria-valuenow="punkte" aria-valuemin="0" :aria-valuemax="ZIEL_PUNKTE">
          <span v-for="i in ZIEL_PUNKTE" :key="i" :class="{ 'is-voll': i <= punkte }" />
        </div>
        <span class="rr-punkte">{{ punkte }}/{{ ZIEL_PUNKTE }}</span>
        <span class="rr-streak" :class="{ 'is-sichtbar': streak >= 2, 'is-heiss': streak >= 5 }" aria-live="polite">
          🔥 {{ streak }} in a row
        </span>
      </div>

      <template v-if="phase !== 'geschafft'">
        <div class="rr-szene" :class="{ 'is-fertig': fertig }">
          <div class="rr-person">
            <span class="rr-avatar" aria-hidden="true">{{ karte.crew.e }}</span>
            <span class="rr-person__name">{{ karte.crew.n }}</span>
            <span class="rr-person__an">{{ karte.crew.rolle }}</span>
          </div>
          <blockquote class="rr-blase">{{ karte.briefing }}</blockquote>
        </div>
        <ul v-if="karte.kontext.length" class="rr-kontext">
          <li v-for="c in karte.kontext" :key="c">{{ c }}</li>
        </ul>

        <!-- Gleis -->
        <div class="rr-block woe-gleis" :class="{ 'is-perfekt': perfekt, 'is-falsch': fertig && !ergebnis.ok }">
          <p class="rr-block__label"><span>🛤️ Platform {{ levelIdx + 1 }}</span><span class="woe-nr">{{ zugNr }}</span></p>
          <p class="woe-frage">{{ FRAGE[karte.art] }}</p>

          <!-- bau: gekuppelter Zug -->
          <div v-if="karte.art === 'bau'" class="woe-zug" :class="{ 'is-ok': perfekt }" aria-live="polite">
            <span class="woe-lok" aria-hidden="true">🚂</span>
            <template v-for="(w, n) in bauGleis" :key="'b' + n">
              <span class="woe-k" aria-hidden="true" />
              <span v-if="w.leer" class="woe-leer" :class="{ 'is-naechster': w.naechster }" aria-hidden="true">{{ w.naechster ? '?' : '' }}</span>
              <span v-else-if="w.fest" class="woe-w is-fest" :class="`k-${w.k}`">{{ w.t }}</span>
              <button
                v-else
                class="woe-w"
                :class="[`k-${w.k}`, { 'is-falsch': w.falsch }]"
                :disabled="phase !== 'frage'"
                :title="phase === 'frage' ? 'Tap to uncouple' : undefined"
                @click="abkuppeln(w.i)"
              >{{ w.t }}</button>
            </template>
          </div>

          <!-- slot: Satz mit Lücken -->
          <div v-else-if="karte.art === 'slot'" class="woe-slot">
            <p class="woe-einsetzen">
              <span class="woe-w woe-w--neu" :class="`k-${karte.wort.k}`">{{ karte.wort.t }}</span>
              <span>← where does this wagon go?</span>
            </p>
            <div class="woe-zug" :class="{ 'is-ok': perfekt }">
              <span class="woe-lok" aria-hidden="true">🚂</span>
              <template v-if="phase === 'frage'">
                <template v-for="(w, n) in slotZug" :key="'sl' + n">
                  <button class="woe-gap" :aria-label="`Gap ${n + 1}`" @click="waehle(n)"><kbd>{{ n + 1 }}</kbd></button>
                  <span class="woe-w" :class="`k-${w.k}`">{{ w.t }}</span>
                </template>
                <button class="woe-gap" :aria-label="`Gap ${slotZug.length + 1}`" @click="waehle(slotZug.length)"><kbd>{{ slotZug.length + 1 }}</kbd></button>
              </template>
              <template v-else>
                <template v-for="(w, n) in slotZug" :key="'sl' + n">
                  <span class="woe-k" aria-hidden="true" />
                  <span class="woe-w" :class="[`k-${w.k}`, { 'is-neu': w.neu, 'is-falsch': w.falsch }]">{{ w.t }}</span>
                </template>
              </template>
            </div>
          </div>

          <!-- fix: falschen Waggon antippen -->
          <div v-else-if="karte.art === 'fix'" class="woe-zug">
            <span class="woe-lok" aria-hidden="true">🚂</span>
            <template v-for="(w, n) in fixZug" :key="'f' + n">
              <span class="woe-k" aria-hidden="true" />
              <button
                class="woe-w"
                :class="[`k-${w.k}`, { 'is-falsch': w.falsch, 'is-gefunden': w.gefunden }]"
                :disabled="phase !== 'frage'"
                @click="waehle(n)"
              ><kbd v-if="phase === 'frage'">{{ n + 1 }}</kbd>{{ w.t }}</button>
            </template>
          </div>

          <!-- wahl: richtigen Zug wählen -->
          <div v-else-if="karte.art === 'wahl'" class="woe-optionen">
            <button
              v-for="(o, n) in karte.optionen"
              :key="'o' + n"
              class="woe-option"
              :class="{ 'is-ok': fertig && o.ok, 'is-falsch': fertig && n === wahlIdx && !o.ok }"
              :disabled="phase !== 'frage'"
              @click="waehle(n)"
            >
              <kbd>{{ n + 1 }}</kbd>
              <span class="woe-zug woe-zug--klein">
                <template v-for="(w, m) in zug(o.teile, { ende: o.ende })" :key="m">
                  <span v-if="m" class="woe-k" aria-hidden="true" />
                  <span class="woe-w" :class="`k-${w.k}`">{{ w.t }}</span>
                </template>
              </span>
            </button>
          </div>

          <!-- Auswertung -->
          <div v-if="fertig && !ergebnis.ok" class="rr-tipp">
            <span aria-hidden="true">💡</span>
            <span>{{ karte.tipp }} <a :href="lektion(karte.seite, karte.anker)" target="_blank">📖 Read more</a></span>
          </div>
          <div v-if="fertig && richtigerZug && karte.art !== 'wahl'" class="woe-loesung">
            <span class="woe-loesung__label">✓ Correct train</span>
            <span class="woe-zug woe-zug--klein">
              <template v-for="(w, m) in richtigerZug" :key="m">
                <span v-if="m" class="woe-k" aria-hidden="true" />
                <span class="woe-w" :class="[`k-${w.k}`, { 'is-neu': w.neu }]">{{ w.t }}</span>
              </template>
            </span>
          </div>
          <div v-if="fertig" class="rr-fertig">
            <p class="rr-fertig__titel">{{ ergebnis.ok ? lob : 'Almost! Remember the pattern:' }}</p>
            <p v-if="karte.regel" class="woe-regel">
              <span aria-hidden="true">📍</span>
              <span class="woe-regel__muster">{{ karte.regel.t }}</span>
              <span class="woe-regel__bau">= {{ karte.regel.bau }}</span>
              <a :href="lektion(karte.seite, karte.anker)" target="_blank">📖 Rule</a>
            </p>
          </div>
        </div>

        <!-- bau: Rangierbahnhof -->
        <div v-if="karte.art === 'bau' && phase === 'frage'" class="woe-hof">
          <p class="rr-frage">
            <span aria-hidden="true">🔀</span> Shunting yard
            <span class="rr-frage__nr">⌫ uncouples the last wagon</span>
          </p>
          <div class="woe-hof__gleis">
            <button
              v-for="(w, h) in karte.hof"
              :key="w.id"
              class="woe-w woe-w--hof"
              :class="[`k-${w.k}`, { 'is-weg': gebaut.includes(h) }]"
              :disabled="gebaut.includes(h)"
              @click="kuppeln(h)"
            ><kbd>{{ h + 1 }}</kbd>{{ w.t }}</button>
          </div>
        </div>

        <div v-if="fertig" class="rr-aktion">
          <button ref="weiterBtn" class="rr-weiter" :class="{ 'is-auto': ergebnis.ok }" @click="weiter">
            {{ ergebnis.ok ? 'Next ⏎' : 'Next train ⏎' }}
          </button>
        </div>
      </template>

      <!-- Level geschafft -->
      <div v-else class="rr-geschafft">
        <div class="rr-konfetti" aria-hidden="true">
          <span v-for="(k, i) in KONFETTI" :key="i" :style="k" />
        </div>
        <div class="woe-stempel" aria-hidden="true">ALL ABOARD!</div>
        <p class="rr-geschafft__titel" role="heading" aria-level="2">Level {{ levelIdx + 1 }} complete!</p>
        <p class="rr-sterne rr-sterne--gross" :aria-label="`${abschluss.sterne} of 3 stars`">
          <span v-for="s in 3" :key="s" :class="{ 'is-an': s <= abschluss.sterne }" :style="{ animationDelay: `${0.25 * s}s` }">★</span>
        </p>
        <p v-if="abschluss.neuerRang" class="rr-befoerdert">
          🎉 Promotion! You are now <strong>{{ abschluss.neuerRang.icon }} {{ abschluss.neuerRang.titel }}</strong>.
        </p>
        <ul class="rr-stats">
          <li><strong>{{ stat.karten }}</strong> trains</li>
          <li><strong>{{ stat.perfekt }}</strong> perfect</li>
          <li><strong>{{ stat.besteSerie }}</strong> best streak</li>
        </ul>
        <p v-if="abschluss.sterne < 3" class="rr-hinweis">3 stars: finish the level with at most one mistake.</p>
        <div class="rr-geschafft__knoepfe">
          <button v-if="levelIdx + 1 < LEVELS.length" class="rr-weiter" @click="starte(levelIdx + 1)">
            Next level: {{ LEVELS[levelIdx + 1].icon }} {{ LEVELS[levelIdx + 1].titel }} →
          </button>
          <button class="rr-zweit" @click="starte(levelIdx)">↻ Play again</button>
          <button class="rr-zweit" @click="zurUebersicht">All levels</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rr {
  max-width: 880px;
  margin: 0 auto;
  padding: 28px 16px 48px;
}
.rr-kicker {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}
.rr-de {
  margin: 6px 0 0;
  font-size: 14px;
  font-style: italic;
  color: var(--vp-c-text-2);
}

/* ---------- Start ---------- */
.rr-hero {
  display: flex;
  gap: 20px;
  align-items: center;
}
.rr-hero__mic {
  flex: none;
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border-radius: 24px;
  font-size: 48px;
  background: linear-gradient(135deg, var(--rs-pron-bg), var(--rs-tense-bg));
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}
.rr-hero__titel {
  margin: 2px 0 6px;
  font-size: 40px;
  line-height: 1.1;
  font-weight: 800;
}
.rr-hero__text {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
}

.rr-rang {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 18px;
  margin: 24px 0 16px;
  padding: 14px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}
.rr-rang__icon {
  font-size: 38px;
}
.rr-rang__text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.rr-rang__text small,
.rr-rang__weg small {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.rr-rang__text strong {
  font-size: 20px;
}
.rr-rang__text span {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.rr-rang__weg {
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rr-rang__balken {
  height: 10px;
  border-radius: 99px;
  background: var(--vp-c-default-soft);
  overflow: hidden;
}
.rr-rang__balken span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--rs-pron), var(--rs-tense));
}

.rr-regeln {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.rr-regeln b {
  display: inline-grid;
  place-items: center;
  min-width: 28px;
  height: 24px;
  margin-right: 4px;
  padding: 0 6px;
  border-radius: 8px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
}
.rr-regeln__plus { background: var(--rs-time-bg) !important; color: var(--rs-time) !important; }
.rr-regeln__minus { background: var(--rs-tense-bg) !important; color: var(--rs-tense) !important; }

.rr-farben {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
  font-size: 13px;
}

.rr-kacheln {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.rr-kachel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 14px 16px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}
.rr-kachel:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.rr-kachel.is-next {
  border: 2px solid var(--vp-c-brand-1);
}
.rr-kachel.is-done {
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--rs-time-bg));
}
.rr-kachel__icon {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 26px;
}
.rr-kachel__nr {
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rr-kachel__titel {
  padding-right: 34px;
  font-size: 17px;
  line-height: 1.3;
}
.rr-kachel__de {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.rr-kachel__los {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}
.rr-sterne {
  margin-top: 4px;
  font-size: 18px;
  letter-spacing: 2px;
  color: var(--vp-c-text-3);
}
.rr-sterne .is-an {
  color: #f5b301;
}
.rr-fuss {
  margin-top: 24px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.rr-fuss a {
  margin-left: 6px;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* ---------- Marken & Farben ---------- */
.rr-mark {
  padding: 0 1px;
  border-radius: 6px;
  color: var(--c);
  font-weight: 700;
  box-shadow: inset 0 -2px 0 var(--c);
}
.rr-mark.is-voll,
.rr-szene.is-fertig .rr-mark,
.rr-block.is-fertig .rr-mark {
  padding: 1px 7px;
  background: var(--bg);
  box-shadow: inset 0 0 0 1.5px var(--c);
}
.rs-fig .k-rep { --c: var(--vp-c-text-1); --bg: var(--vp-c-default-soft); }

/* ---------- Spiel ---------- */
.rr-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 14px;
}
.rr-nav a,
.rr-nav button {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}
.rr-kopf__titel {
  margin: 4px 0 10px;
  font-size: 26px;
  line-height: 1.25;
  font-weight: 800;
}
.rr-levelwahl {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rr-levelwahl button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.rr-levelwahl button.is-done {
  background: var(--rs-time-bg);
  color: var(--rs-time);
  border-color: var(--rs-time);
}
.rr-levelwahl button.is-aktiv {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.rr-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin: 18px 0 16px;
}
.rr-balken {
  flex: 1 1 200px;
  display: flex;
  gap: 4px;
}
.rr-balken span {
  flex: 1;
  height: 12px;
  border-radius: 99px;
  background: var(--vp-c-default-soft);
  transition: background 0.3s ease;
}
.rr-balken span.is-voll {
  background: linear-gradient(90deg, var(--rs-time), #51cf66);
}
.rr-punkte {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rr-streak {
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--rs-order-bg);
  color: var(--rs-order);
  font-size: 14px;
  font-weight: 700;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.rr-streak.is-sichtbar {
  opacity: 1;
  transform: scale(1);
}
.rr-streak.is-heiss {
  animation: rr-flackern 0.9s ease-in-out infinite alternate;
}

/* Szene: Person + Sprechblase */
.rr-szene {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.rr-person {
  flex: none;
  width: 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 1.25;
}
.rr-avatar {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-size: 38px;
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
}
.rr-person__name {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 700;
}
.rr-person__an {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.rr-blase {
  position: relative;
  flex: 1;
  margin: 8px 0 0;
  padding: 14px 18px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 18px;
  background: var(--vp-c-bg);
  font-size: 20px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}
.rr-blase::before {
  content: '';
  position: absolute;
  left: -11px;
  top: 18px;
  width: 18px;
  height: 18px;
  background: var(--vp-c-bg);
  border-left: 2px solid var(--vp-c-divider);
  border-bottom: 2px solid var(--vp-c-divider);
  transform: rotate(45deg);
}
.rr-quote {
  color: var(--vp-c-text-3);
  font-weight: 700;
}
.rr-kontext {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 0 106px;
  padding: 0;
  list-style: none;
}
.rr-kontext li {
  padding: 2px 10px;
  border-radius: 99px;
  background: var(--rs-time-bg);
  color: var(--rs-time);
  font-size: 13px;
  font-weight: 600;
}

/* Notizblock */
.rr-block {
  position: relative;
  margin-top: 18px;
  padding: 14px 18px 16px 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background:
    linear-gradient(90deg, transparent 18px, color-mix(in srgb, var(--rs-tense) 35%, transparent) 18px, color-mix(in srgb, var(--rs-tense) 35%, transparent) 20px, transparent 20px),
    var(--vp-c-bg-soft);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.rr-block.is-perfekt {
  border-color: var(--rs-time);
  box-shadow: 0 0 0 3px var(--rs-time-bg);
}
.rr-block.is-falsch {
  border-color: var(--rs-tense);
}
.rr-block__label {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}
.rr-satz {
  --zeile: 46px;
  margin: 0;
  font-size: 21px;
  line-height: var(--zeile);
  background: repeating-linear-gradient(transparent 0 calc(var(--zeile) - 1px), var(--vp-c-divider) calc(var(--zeile) - 1px) var(--zeile));
}
.rr-luecke {
  display: inline-block;
  min-width: 46px;
  padding: 0 10px;
  border-radius: 10px;
  line-height: 1.55;
  text-align: center;
  font-weight: 700;
  color: var(--c);
  border: 2px dashed var(--c);
  background: transparent;
  vertical-align: baseline;
}
.rr-luecke.is-offen:not(.is-aktiv) {
  opacity: 0.45;
}
.rr-luecke.is-aktiv {
  background: var(--bg);
  animation: rr-puls 1.2s ease-in-out infinite;
}
.rr-luecke.is-ok {
  border-style: solid;
  background: var(--bg);
  animation: rr-plopp 0.35s ease;
}
.rr-luecke.is-falsch {
  border-style: solid;
  background: var(--bg);
  animation: rr-wackeln 0.4s ease;
}
.rr-luecke__falsch {
  margin-right: 4px;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.rr-tipp {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--vp-c-warning-soft);
  font-size: 15px;
  line-height: 1.5;
}
.rr-tipp a {
  margin-left: 4px;
  white-space: nowrap;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.rr-fertig {
  margin-top: 10px;
}
.rr-fertig__titel {
  margin: 0;
  font-weight: 800;
  font-size: 17px;
}
.rr-block.is-perfekt .rr-fertig__titel {
  color: var(--rs-time);
}
.rr-changes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
}
.rr-changes li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.rr-changes__pfeil {
  color: var(--vp-c-text-3);
  font-weight: 700;
}

/* Antworten */
.rr-wahl {
  margin-top: 16px;
}
.rr-frage {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.rr-frage__nr {
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-3);
}
.rr-punkt {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--c);
}
.rr-antworten {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.rr-antwort {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 58px;
  padding: 10px 14px;
  border: 2px solid var(--vp-c-divider);
  border-bottom-width: 4px;
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.08s ease, border-color 0.12s ease, background 0.12s ease;
}
.rr-antwort:hover {
  border-color: var(--c);
  background: var(--bg);
  color: var(--c);
}
.rr-antwort:active {
  transform: translateY(2px);
  border-bottom-width: 2px;
}
.rr-antwort kbd {
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-family: inherit;
  font-size: 12px;
}
.rr-aktion {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.rr-weiter,
.rr-zweit {
  padding: 10px 20px;
  border-radius: 99px;
  border: 0;
  font: inherit;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}
.rr-weiter {
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}
.rr-weiter:hover {
  background: var(--vp-button-brand-hover-bg);
}
.rr-weiter.is-auto {
  background: var(--rs-time);
  color: #fff;
}
.rr-zweit {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

/* Level geschafft */
.rr-geschafft {
  position: relative;
  overflow: hidden;
  margin-top: 8px;
  padding: 30px 20px 26px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: linear-gradient(160deg, var(--rs-time-bg), var(--vp-c-bg-soft) 55%);
  text-align: center;
}
.rr-geschafft__titel {
  position: relative;
  margin: 6px 0 0;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 800;
}
.rr-geschafft__pokal {
  position: relative;
  font-size: 64px;
  line-height: 1.15;
  animation: rr-plopp 0.6s ease;
}
.rr-sterne--gross {
  position: relative;
  margin: 6px 0;
  font-size: 46px;
  line-height: 1.2;
}
.rr-sterne--gross span {
  display: inline-block;
  animation: rr-stern 0.5s ease both;
}
.rr-befoerdert {
  display: inline-block;
  margin: 8px 0;
  padding: 8px 16px;
  border-radius: 99px;
  background: var(--rs-order-bg);
  color: var(--rs-order);
  font-weight: 600;
}
.rr-stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px 26px;
  margin: 14px 0;
  padding: 0;
  list-style: none;
  color: var(--vp-c-text-2);
}
.rr-stats strong {
  display: block;
  font-size: 24px;
  color: var(--vp-c-text-1);
}
.rr-hinweis {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.rr-geschafft__knoepfe {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}
.rr-konfetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.rr-konfetti span {
  position: absolute;
  top: -12px;
  width: 9px;
  height: 14px;
  border-radius: 2px;
  opacity: 0;
  animation-name: rr-fallen;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

@keyframes rr-puls {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 35%, transparent); }
  50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--c) 0%, transparent); }
}
@keyframes rr-plopp {
  0% { transform: scale(0.6); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
@keyframes rr-wackeln {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
@keyframes rr-stern {
  0% { transform: scale(0) rotate(-40deg); }
  70% { transform: scale(1.3) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}
@keyframes rr-fallen {
  0% { opacity: 1; translate: 0 0; }
  100% { opacity: 0.9; translate: 0 460px; rotate: 540deg; }
}
@keyframes rr-flackern {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  .rr *,
  .rr *::before {
    animation: none !important;
    transition: none !important;
  }
  .rr-konfetti { display: none; }
}

/* Handy */
@media (max-width: 600px) {
  .rr { padding-top: 18px; }
  .rr-hero { align-items: flex-start; }
  .rr-hero__mic { width: 64px; height: 64px; font-size: 34px; border-radius: 18px; }
  .rr-hero__titel { font-size: 32px; }
  .rr-person { width: 64px; }
  .rr-avatar { width: 52px; height: 52px; font-size: 30px; }
  .rr-blase { font-size: 18px; padding: 10px 14px; }
  .rr-kontext { margin-left: 0; }
  .rr-block { padding-left: 28px; }
  .rr-satz { --zeile: 40px; font-size: 18px; }
  .rr-antworten { grid-template-columns: 1fr; }
  .rr-antwort { justify-content: flex-start; min-height: 50px; font-size: 17px; }
}
/* ---------- Word-Order-Express-Look: Gleis, Waggons, Rangierbahnhof ---------- */
.woe .rr-hero__mic {
  background: linear-gradient(135deg, var(--rs-pron-bg), var(--rs-tense-bg) 45%, var(--rs-time-bg) 70%, var(--rs-order-bg));
}
.woe .rr-kontext li {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}
.woe-gleis.rr-block {
  margin-top: 22px;
  padding: 16px 18px 16px 18px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 14px;
  background:
    repeating-linear-gradient(90deg, transparent 0 26px, color-mix(in srgb, var(--wo-loco) 9%, transparent) 26px 32px) 0 100% / 100% 12px no-repeat,
    var(--vp-c-bg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
.woe-gleis.rr-block.is-perfekt {
  border-color: var(--rs-time);
  box-shadow: 0 0 0 3px var(--rs-time-bg);
}
.woe-gleis.rr-block.is-falsch {
  border-color: var(--rs-tense);
}
.woe-gleis .rr-block__label {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-family: var(--vp-font-family-mono);
}
.woe-nr {
  color: var(--rs-order);
  letter-spacing: 0.08em;
}
.woe-frage {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

/* Zug */
.woe-zug {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  row-gap: 14px;
  padding: 6px 0 10px;
}
.woe-zug.is-ok {
  animation: woe-abfahrt 1.4s ease-in 0.5s forwards;
}
.woe-lok {
  font-size: 34px;
  line-height: 1;
}
.woe-k {
  width: 12px;
  height: 3px;
  border-radius: 2px;
  background: var(--vp-c-text-3);
}
.woe-zug > .woe-k:first-of-type,
.woe-lok + .woe-k {
  width: 8px;
}
.woe-w {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  padding: 4px 14px 6px;
  border: 2px solid var(--c, var(--vp-c-text-3));
  border-radius: 9px;
  background: var(--bg, var(--vp-c-bg));
  color: var(--c, var(--vp-c-text-1));
  font: inherit;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}
.woe-w::before,
.woe-w::after {
  content: '';
  position: absolute;
  bottom: -6px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--c, var(--vp-c-text-3));
  border: 2px solid var(--vp-c-bg);
}
.woe-w::before { left: 9px; }
.woe-w::after { right: 9px; }
.woe-w.k-n { --c: var(--vp-c-text-3); --bg: var(--vp-c-bg); color: var(--vp-c-text-1); font-weight: 600; }
.woe-w.is-fest { border-style: dashed; opacity: 0.85; }
button.woe-w { cursor: pointer; transition: transform 0.08s ease, box-shadow 0.12s ease; }
button.woe-w:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 4px 10px color-mix(in srgb, var(--c) 30%, transparent); }
button.woe-w:disabled { cursor: default; }
.woe-w kbd {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--c) 14%, var(--vp-c-bg));
  color: var(--c);
  font-family: inherit;
  font-size: 11px;
}
.woe-w.is-falsch {
  outline: 3px solid var(--wo-bad);
  outline-offset: 2px;
  animation: rr-wackeln 0.4s ease;
}
.woe-w.is-gefunden,
.woe-w.is-neu {
  outline: 3px solid var(--wo-mark);
  outline-offset: 2px;
  animation: rr-plopp 0.35s ease;
}
.woe-w.is-neu.is-falsch { outline-color: var(--wo-bad); }
.woe-w--klein {
  min-height: 0;
  padding: 2px 10px 4px;
  font-size: 13px;
  border-width: 1.5px;
}
.woe-w--klein::before, .woe-w--klein::after { width: 6px; height: 6px; bottom: -4px; border-width: 1px; }
.woe-leer {
  display: inline-grid;
  place-items: center;
  min-width: 54px;
  height: 42px;
  border: 2px dashed var(--vp-c-divider);
  border-radius: 9px;
  color: var(--vp-c-text-3);
  font-weight: 800;
}
.woe-leer.is-naechster {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  animation: woe-blinken 1.2s ease-in-out infinite;
}

/* Rangierbahnhof */
.woe-hof {
  margin-top: 16px;
}
.woe-hof__gleis {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 12px;
  padding: 14px 14px 18px;
  border-radius: 14px;
  background:
    repeating-linear-gradient(90deg, transparent 0 26px, color-mix(in srgb, var(--wo-loco) 8%, transparent) 26px 32px),
    var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
.woe-w--hof { min-height: 48px; font-size: 20px; }
.woe-w.is-weg {
  opacity: 0.18;
  border-style: dashed;
}

/* slot */
.woe-einsetzen {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
.woe-w--neu {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--wo-mark) 60%, transparent);
}
.woe-gap {
  display: grid;
  place-items: center;
  width: 36px;
  height: 42px;
  margin: 0 3px;
  border: 2px dashed var(--vp-c-brand-1);
  border-radius: 9px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font: inherit;
  cursor: pointer;
  transition: transform 0.08s ease;
}
.woe-gap:hover { transform: scale(1.1); background: color-mix(in srgb, var(--wo-mark) 35%, var(--vp-c-bg)); }
.woe-gap kbd {
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
}

/* wahl */
.woe-optionen {
  display: grid;
  gap: 10px;
}
.woe-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px 12px;
  border: 2px solid var(--vp-c-divider);
  border-bottom-width: 4px;
  border-radius: 14px;
  background: var(--vp-c-bg);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.08s ease, border-color 0.12s ease;
}
.woe-option:not(:disabled):hover { border-color: var(--vp-c-brand-1); }
.woe-option:disabled { cursor: default; }
.woe-option.is-ok { border-color: var(--rs-time); background: var(--rs-time-bg); }
.woe-option.is-falsch { border-color: var(--wo-bad); animation: rr-wackeln 0.4s ease; }
.woe-option > kbd {
  flex: none;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-family: inherit;
  font-size: 12px;
}
.woe-zug--klein {
  padding: 0 0 4px;
  row-gap: 10px;
}
.woe-zug--klein .woe-w {
  min-height: 34px;
  padding: 2px 11px 5px;
  font-size: 16px;
}
.woe-zug--klein .woe-k { width: 8px; }

/* Lösung und Regel */
.woe-loesung {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--rs-time-bg);
}
.woe-loesung__label {
  font-size: 13px;
  font-weight: 800;
  color: var(--rs-time);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.woe-regel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 8px 0 0;
  font-size: 15px;
}
.woe-regel__muster {
  padding: 1px 8px;
  border-radius: 6px;
  background: var(--rs-order-bg);
  color: var(--rs-order);
  font-weight: 800;
  box-shadow: inset 0 0 0 1.5px var(--rs-order);
}
.woe-regel__bau {
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.woe-regel a {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 14px;
}

/* geschafft */
.woe .rr-geschafft {
  background:
    radial-gradient(circle at 20% 10%, var(--rs-pron-bg), transparent 45%),
    radial-gradient(circle at 85% 90%, var(--rs-order-bg), transparent 45%),
    var(--vp-c-bg);
}
.woe-stempel {
  position: relative;
  display: inline-block;
  margin: 10px 0 22px;
  padding: 6px 18px;
  border: 4px solid var(--rs-time);
  border-radius: 10px;
  color: var(--rs-time);
  font-family: var(--vp-font-family-mono);
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 0.14em;
  line-height: 1.1;
  transform: rotate(-6deg);
  animation: woe-stempeln 0.55s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}
@keyframes woe-stempeln {
  0% { opacity: 0; transform: rotate(-6deg) scale(2.2); }
  100% { opacity: 1; transform: rotate(-6deg) scale(1); }
}
@keyframes woe-blinken {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes woe-abfahrt {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-40px); opacity: 0.35; }
}
@media (max-width: 600px) {
  .woe-stempel { font-size: 22px; }
  .woe-w { font-size: 17px; padding: 4px 11px 6px; }
  .woe-w--hof { font-size: 18px; }
  .woe-lok { font-size: 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .woe-stempel, .woe-zug.is-ok, .woe-leer.is-naechster { animation: none; }
}
</style>
