<script setup>
// Simple past: abgeschlossene Zeit in der Vergangenheit – das Zeitfenster ist zu, es reicht nicht bis NOW.
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Chip from '../../reported-speech/parts/Chip.vue'

const SIGNAL = ['yesterday', 'last week', 'two days ago', 'in 2019', 'when I was six']
let x = 24
const chips = SIGNAL.map((t) => {
  const c = { t, x }
  x += t.length * 8.2 + 18 + 8
  return c
})
</script>

<template>
  <svg viewBox="0 0 640 214" role="img" aria-label="Simple past. Last Saturday I went to the zoo, saw the lions and ate an ice cream. The actions are in a closed box in the past. The box does not reach NOW – the time is over. Signal words: yesterday, last week, two days ago, in 2019, when I was six.">
    <rect class="te-area k-zeit" x="90" y="28" width="250" height="98" rx="12" />
    <text class="te-head k-zeit" x="215" y="48" text-anchor="middle">last Saturday 🔒</text>
    <Punkt :x="140" :y="96" k="zeit" />
    <Punkt :x="215" :y="96" k="zeit" />
    <Punkt :x="290" :y="96" k="zeit" />
    <text class="te-c k-zeit" x="140" y="76" text-anchor="middle" font-size="13">went</text>
    <text class="te-c k-zeit" x="215" y="76" text-anchor="middle" font-size="13">saw</text>
    <text class="te-c k-zeit" x="290" y="76" text-anchor="middle" font-size="13">ate</text>

    <Bezug :x="520" :y1="44" :y2="110" />
    <text class="rs-small" x="430" y="60" text-anchor="middle">the time is over</text>
    <text class="rs-small" x="430" y="76" text-anchor="middle">– no link to now</text>
    <Achse :x1="20" :x2="620" :y="96" />

    <text class="rs-title" x="24" y="152">Last Saturday I <tspan class="te-c k-zeit">went</tspan> to the zoo, <tspan class="te-c k-zeit">saw</tspan> the lions and <tspan class="te-c k-zeit">ate</tspan> an ice cream.</text>
    <Chip v-for="c in chips" :key="c.t" :t="c.t" k="rep" :x="c.x" :y="170" />
  </svg>
</template>
