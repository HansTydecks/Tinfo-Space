<script setup>
// Zeitformen-Leiter: nur „be" ändert sich, das past participle bleibt immer gleich.
import Chip from '../../reported-speech/parts/Chip.vue'

const zeilen = [
  ['present simple', 'break(s)', 'is'],
  ['present progressive', 'is breaking', 'is being'],
  ['present perfect', 'has broken', 'has been'],
  ['past simple', 'broke', 'was'],
  ['past progressive', 'was breaking', 'was being'],
  ['past perfect', 'had broken', 'had been'],
  ['will-future', 'will break', 'will be'],
  ['going to', 'is going to break', 'is going to be'],
]
const top = (i) => 58 + i * 44
</script>

<template>
  <svg viewBox="0 0 640 420" role="img" aria-label="Passive in all tenses with the window. Present simple: is broken. Present progressive: is being broken. Present perfect: has been broken. Past simple: was broken. Past progressive: was being broken. Past perfect: had been broken. Will-future: will be broken. Going to: is going to be broken. Only be changes, broken always stays the same.">
    <text class="rs-label" x="16" y="30">tense</text>
    <text class="rs-label" x="176" y="30">active: someone …</text>
    <text class="rs-label" x="346" y="30">passive: the window …</text>
    <text class="rs-al k-be" x="346" y="46">only be changes</text>
    <text class="rs-al k-pp" x="636" y="46" text-anchor="end">stays the same</text>

    <g v-for="(z, i) in zeilen" :key="z[0]">
      <rect class="rs-band" x="10" :y="top(i) - 4" width="620" height="40" rx="8" />
      <text x="20" :y="top(i) + 16" dy="0.35em" font-size="14" font-weight="600">{{ z[0] }}</text>
      <text class="rs-small" x="176" :y="top(i) + 16" dy="0.35em">{{ z[1] }}</text>
      <Chip :t="z[2]" k="be" :x="346" :y="top(i)" :w="150" />
      <Chip t="broken" k="pp" :x="540" :y="top(i)" :w="84" />
    </g>
  </svg>
</template>
