<script setup>
// Modalverben: modal + be + past participle
import Chip from '../../reported-speech/parts/Chip.vue'
import { reihe } from '../../reported-speech/layout.js'

const formel = reihe([{ t: 'modal verb', k: 'n' }, { t: '+ be', k: 'be' }, { t: '+ past participle', k: 'pp' }], 150, 10)
const zeilen = [
  ['can', 'We can open the safe.'],
  ['can’t', 'We can’t open the safe.'],
  ['must', 'You must open the safe.'],
  ['should', 'You should open the safe.'],
  ['might', 'They might open the safe.'],
  ['has to', 'Someone has to open the safe.'],
]
const top = (i) => 92 + i * 42
</script>

<template>
  <svg viewBox="0 0 640 420" role="img" aria-label="Modal verbs in the passive: modal verb plus be plus past participle. The safe can be opened, can’t be opened, must be opened, should be opened, might be opened, has to be opened. Wrong: must been opened, can opened.">
    <Chip v-for="c in formel" :key="c.t" v-bind="c" :y="16" />
    <text class="rs-label" x="16" y="78">active</text>
    <text class="rs-label" x="290" y="78">passive</text>
    <g v-for="(z, i) in zeilen" :key="z[0]">
      <text class="rs-small" x="16" :y="top(i) + 16" dy="0.35em">{{ z[1] }}</text>
      <text x="290" :y="top(i) + 16" dy="0.35em" font-size="15">The safe</text>
      <Chip :t="z[0]" :x="362" :y="top(i)" :w="70" k="be" />
      <Chip t="be" k="be" :x="438" :y="top(i)" :w="42" />
      <Chip t="opened" k="pp" :x="486" :y="top(i)" :w="80" />
      <text x="570" :y="top(i) + 16" dy="0.35em" font-size="15">.</text>
    </g>
    <rect x="16" y="352" width="608" height="50" rx="10" class="rs-band" style="stroke: var(--rs-tense); stroke-dasharray: 4 3" />
    <text class="rs-al k-be" x="32" y="382">✗ must been opened · ✗ can opened · ✗ has to opened</text>
    <text class="rs-al k-pp" x="608" y="382" text-anchor="end">✓ must be opened</text>
  </svg>
</template>
