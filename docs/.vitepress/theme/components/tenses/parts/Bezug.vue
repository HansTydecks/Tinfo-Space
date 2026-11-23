<script setup>
// Bezugspunkt als gestrichelte senkrechte Linie mit Beschriftung oben (NOW, THEN, …).
defineProps({
  x: Number,
  y1: Number,
  y2: Number,
  t: { type: String, default: 'NOW' },
  k: { type: String, default: 'now' },
})
</script>

<template>
  <g :class="['te-ref', 'k-' + k]">
    <line :x1="x" :y1="y1" :x2="x" :y2="y2" />
    <text :x="x" :y="y1 - 6" text-anchor="middle">{{ t }}</text>
  </g>
</template>
