<script setup>
// Kapitel 4: Fragen – QW · A · S · V; Hilfsverb springt nach vorn; Subjekt- vs. Objektfrage.
import Satz from '../parts/Satz.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'
import { S, zug, H } from '../layout.js'

const formel = zug([
  { t: 'question word', k: 'qw', lab: 'QW' },
  { t: 'helping verb', k: 'v', lab: 'A' },
  { t: 'subject', k: 's', lab: 'S' },
  { t: 'verb', k: 'v', lab: 'V' },
  { t: 'rest ?', k: 'o', lab: '…' },
], 30)
const aussage = zug(S('You:s like:v pizza.:o'), 30)
const frage = zug(S('Do:v you:s like:v pizza?:o'), 330)
const wo = zug(S('Where:qw do:v you:s live?:v'), 30)
const be = zug(S('Where:qw is:v Tom?:s'), 330)
const sub = zug(S('Who:s called:v you?:o'), 30)
const obj = zug(S('Who:o did:v you:s call?:v'), 330)
</script>

<template>
  <svg viewBox="0 0 680 400" role="img" aria-label="Questions: question word – helping verb – subject – verb – rest. You like pizza becomes Do you like pizza? Where do you live? With be there is no do: Where is Tom? Subject question: Who called you? – who is the subject, no do. Object question: Who did you call? – who is the object, with did.">
    <rect class="wo-panel" x="4" y="4" width="672" height="84" rx="10" />
    <Satz :r="formel" :y="38" />
    <text class="wo-note" x="664" y="78" text-anchor="end"><tspan class="b">QW · A · S · V</tspan></text>

    <rect class="wo-panel" x="4" y="98" width="672" height="152" rx="10" />
    <text class="wo-h" x="18" y="118">The helping verb <tspan class="s">goes in front of the subject</tspan></text>
    <Satz :r="aussage" :y="132" />
    <Arrow :x1="aussage[2].r + 16" :y1="132 + H / 2" :x2="frage[0].x - 34" :y2="132 + H / 2" k="qw" />
    <Satz :r="frage" :y="132" />
    <Satz :r="wo" :y="190" />
    <Satz :r="be" :y="190" />
    <text class="wo-note" x="330" y="244">be, can, will … <tspan class="b">no do</tspan></text>
    <text class="wo-note" x="30" y="244">no helping verb? → <tspan class="b">do / does / did</tspan></text>

    <rect class="wo-panel" x="4" y="260" width="672" height="136" rx="10" />
    <text class="wo-h" x="18" y="280">Who …? <tspan class="s">Subject or object?</tspan></text>
    <Satz :r="sub" :y="300" />
    <Satz :r="obj" :y="300" />
    <text class="wo-note" x="30" y="362"><tspan class="b">who = subject</tspan> → no do</text>
    <text class="wo-note" x="30" y="380">Somebody called you. Who?</text>
    <text class="wo-note" x="330" y="362"><tspan class="b">who = object</tspan> → did + verb</text>
    <text class="wo-note" x="330" y="380">You called somebody. Who?</text>
  </svg>
</template>
