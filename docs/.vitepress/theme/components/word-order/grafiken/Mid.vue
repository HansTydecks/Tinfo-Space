<script setup>
// Kapitel 3: Häufigkeitsadverbien in der Mitte – vor dem Vollverb, nach be und nach dem 1. Hilfsverb.
import Satz from '../parts/Satz.vue'
import { S } from '../layout.js'

const m = (teile, i) => teile.map((p, j) => (j === i ? { ...p, mark: true } : p))
const ZEILEN = [
  { r: m(S('She:s always:adv gets_up:v early.:n'), 1), n: ['before the ', 'main verb'] },
  { r: m(S('She:s is:v always:adv late.:n'), 2), n: ['after ', 'am / is / are'] },
  { r: m(S('She:s has:v never:adv been:v to_Paris.:adv'), 2), n: ['after the ', '1st helping verb'] },
  { r: m(S('She:s gets_up:v early:n every_day.:adv'), 3), n: ['every day, twice a week: ', 'at the end'] },
]
</script>

<template>
  <svg viewBox="0 0 680 266" role="img" aria-label="Where do always, never, often go? She always gets up early – before the main verb. She is always late – after am, is, are. She has never been to Paris – after the first helping verb. She gets up early every day – longer time phrases go at the end.">
    <rect class="wo-panel" x="4" y="4" width="672" height="258" rx="10" />
    <text class="wo-h" x="18" y="24">always · usually · often · sometimes · never <tspan class="s">– the middle position</tspan></text>
    <g v-for="(z, i) in ZEILEN" :key="i">
      <Satz :teile="z.r" :x="30" :y="48 + i * 54" />
      <text class="wo-note" x="664" :y="70 + i * 54" text-anchor="end">{{ z.n[0] }}<tspan class="b">{{ z.n[1] }}</tspan></text>
    </g>
  </svg>
</template>
