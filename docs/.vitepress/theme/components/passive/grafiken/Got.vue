<script setup>
// Gesprochenes Passiv mit got – und die 4 häufigsten Fehler.
import Chip from '../../reported-speech/parts/Chip.vue'
import { reihe } from '../../reported-speech/layout.js'

const was = reihe([{ t: 'The thief', k: 'obj' }, { t: 'was', k: 'be' }, { t: 'caught', k: 'pp' }, { t: '.', k: 'n' }], 30, 6)
const got = reihe([{ t: 'The thief', k: 'obj' }, { t: 'got', k: 'agent' }, { t: 'caught', k: 'pp' }, { t: '.', k: 'n' }], 350, 6)
const fehler = [
  ['got catch', 'got caught', 'got + 3rd form'],
  ['was got caught', 'was caught / got caught', 'be or got – not both'],
  ['Got he caught? · He gotn’t …', 'Did he get caught?', 'get needs do / did'],
  ['I got fixed my bike.', 'I got my bike fixed.', 'get + thing + 3rd form'],
]
const top = (i) => 132 + i * 54
</script>

<template>
  <svg viewBox="0 0 640 352" role="img" aria-label="Spoken English: The thief was caught – written. The thief got caught – spoken. The four biggest got mistakes: got catch instead of got caught; was got caught instead of was caught or got caught; Got he caught or He gotn’t caught instead of Did he get caught and He didn’t get caught; I got fixed my bike instead of I got my bike fixed.">
    <text class="rs-label" x="30" y="20">📝 written</text>
    <Chip v-for="c in was" :key="'w' + c.t" v-bind="c" :y="30" />
    <text class="rs-label" x="350" y="20">🗣️ spoken</text>
    <Chip v-for="c in got" :key="'g' + c.t" v-bind="c" :y="30" />
    <text class="rs-small" x="320" y="92" text-anchor="middle">same meaning – got: something happens suddenly, often bad news</text>

    <text class="rs-title" x="16" y="120">✗ typical mistake</text>
    <text class="rs-title" x="236" y="120">✓ right</text>
    <text class="rs-title" x="490" y="120">rule</text>
    <g v-for="(f, i) in fehler" :key="f[0]">
      <rect class="rs-band" x="10" :y="top(i)" width="620" height="46" rx="10" />
      <text class="rs-al k-be" x="20" :y="top(i) + 23" dy="0.35em" style="text-decoration: line-through">{{ f[0] }}</text>
      <text class="rs-al k-pp" x="236" :y="top(i) + 23" dy="0.35em">{{ f[1] }}</text>
      <text class="rs-small" x="490" :y="top(i) + 23" dy="0.35em">{{ f[2] }}</text>
    </g>
  </svg>
</template>
