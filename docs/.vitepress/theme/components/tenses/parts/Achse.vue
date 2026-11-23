<script setup>
// Zeitstrahl: Linie mit Pfeil nach rechts, optional mit „past" / „future" an den Enden.
import { spitze } from '../zeichnen.js'

defineProps({
  x1: Number,
  x2: Number,
  y: Number,
  labels: { type: Boolean, default: true },
})
</script>

<template>
  <g>
    <line class="te-axis" :x1="x1" :y1="y" :x2="x2 - 6" :y2="y" />
    <polygon class="te-axis-head" :points="spitze(x2, y, 10)" />
    <template v-if="labels">
      <text class="te-axis-t" :x="x1" :y="y + 18">past</text>
      <text class="te-axis-t" :x="x2" :y="y + 18" text-anchor="end">future</text>
    </template>
  </g>
</template>
