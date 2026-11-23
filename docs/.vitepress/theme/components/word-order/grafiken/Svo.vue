<script setup>
// Kapitel 1: keine Inversion nach Zeitangaben; Verb und Objekt nicht trennen.
import { computed } from 'vue'
import Satz from '../parts/Satz.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'
import { S, zug, H } from '../layout.js'

const a1 = zug(S('Yesterday:adv went:v I:s to_the_cinema.:adv'), 60)
const a2 = zug(S('Yesterday,:adv I:s went:v to_the_cinema.:adv'), 60)
const b1 = zug(S('I:s like:v very_much:adv pizza.:o'), 60)
const b2 = zug(S('I:s like:v pizza:o very_much.:adv'), 60)
const Y = { a1: 40, a2: 112, b1: 226, b2: 296 }
const vo = computed(() => [b2[1].x, b2[2].r])
</script>

<template>
  <svg viewBox="0 0 680 386" role="img" aria-label="Rule 1: Yesterday went I to the cinema is wrong – correct: Yesterday, I went to the cinema. The subject I moves in front of the verb. Rule 2: I like very much pizza is wrong – correct: I like pizza very much. Verb and object stay together.">
    <rect class="wo-panel" x="4" y="4" width="672" height="168" rx="10" />
    <text class="wo-h" x="18" y="24">Time at the start? <tspan class="s">The subject still comes before the verb.</tspan></text>
    <Satz :r="a1" :y="Y.a1" :ok="false" />
    <text class="wo-note" x="664" :y="Y.a1 + 22" text-anchor="end">Gestern ging ich ins Kino.</text>
    <g class="k-s">
      <Arrow :x1="a1[2].cx" :y1="Y.a1 + H + 6" :x2="a2[1].cx" :y2="Y.a2 - 6" :qx="(a1[2].cx + a2[1].cx) / 2" :qy="Y.a1 + H + 40" k="s" />
    </g>
    <Satz :r="a2" :y="Y.a2" :ok="true" />
    <text class="wo-note" x="664" :y="Y.a2 + 22" text-anchor="end"><tspan class="b">S + V</tspan> stay together</text>

    <rect class="wo-panel" x="4" y="184" width="672" height="196" rx="10" />
    <text class="wo-h" x="18" y="204">Verb + object: <tspan class="s">never put anything between them.</tspan></text>
    <Satz :r="b1" :y="Y.b1" :ok="false" />
    <text class="wo-note" x="664" :y="Y.b1 + 22" text-anchor="end">Ich mag sehr gern Pizza.</text>
    <Satz :r="b2" :y="Y.b2" :ok="true" />
    <g class="k-o">
      <path class="wo-klammer" :d="`M${vo[0]} ${Y.b2 + H + 10} v8 H${vo[1]} v-8`" />
      <text class="wo-note wo-c" :x="(vo[0] + vo[1]) / 2" :y="Y.b2 + H + 34" text-anchor="middle">V + O</text>
    </g>
    <text class="wo-note" x="664" :y="Y.b2 + 22" text-anchor="end">“very much” goes <tspan class="b">after</tspan> the object</text>
  </svg>
</template>
