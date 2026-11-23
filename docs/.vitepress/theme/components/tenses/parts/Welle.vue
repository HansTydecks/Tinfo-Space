<script setup>
// Progressive: Wellenlinie von x1 bis x2, optional mit Pfeilspitze am Ende (… bis zum Bezugspunkt).
import { computed } from 'vue'
import { welle, spitze } from '../zeichnen.js'

const p = defineProps({
  x1: Number,
  x2: Number,
  y: Number,
  k: { type: String, default: 'prog' },
  pfeil: Boolean,
})
const d = computed(() => welle(p.x1, p.pfeil ? p.x2 - 8 : p.x2, p.y))
</script>

<template>
  <g :class="'k-' + k">
    <path class="te-wave" :d="d" />
    <polygon v-if="pfeil" class="te-wave-head" :points="spitze(x2, y, 10)" />
  </g>
</template>
