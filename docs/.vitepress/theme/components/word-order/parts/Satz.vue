<script setup>
// Ein Satz als Zug: Waggons mit Kupplungen, optional mit Lok vorne und ✓/✗ links.
// teile: [{ t, k, lab?, q?, dim?, mark?, strike? }] – oder schon gelegt (mit x, w) über :r
import { computed } from 'vue'
import Wagen from './Wagen.vue'
import { H, zug } from '../layout.js'

const p = defineProps({
  teile: { type: Array, default: () => [] },
  r: Array,
  x: { type: Number, default: 0 },
  y: { type: Number, required: true },
  ok: { type: Boolean, default: null },
  lok: Boolean,
  tag: String,
})
const LOK = 50
const reihe = computed(() => p.r ?? zug(p.teile, p.x + (p.lok ? LOK + 14 : 0)))
const lx = computed(() => reihe.value[0].x - LOK - 14)
</script>

<template>
  <g :class="['wo-row', { 'is-bad': ok === false }]">
    <text v-if="ok === true" class="wo-ok" :x="reihe[0].x - 12" :y="y + H / 2" dy="0.35em" text-anchor="end">✓</text>
    <text v-if="ok === false" class="wo-bad" :x="reihe[0].x - 12" :y="y + H / 2" dy="0.35em" text-anchor="end">✗</text>
    <g v-if="tag" class="wo-tag">
      <rect :x="reihe[0].x - 44" :y="y + 7" width="32" height="20" rx="5" />
      <text :x="reihe[0].x - 28" :y="y + 17" dy="0.35em" text-anchor="middle">{{ tag }}</text>
    </g>
    <g v-if="lok" class="wo-loco">
      <rect :x="lx" :y="y + 4" width="18" :height="H - 4" rx="3" />
      <rect :x="lx + 14" :y="y + 14" :width="LOK - 14" :height="H - 14" rx="4" />
      <rect :x="lx + LOK - 14" :y="y + 4" width="8" height="12" rx="2" />
      <path :d="`M${lx + LOK} ${y + H - 6} l8 6 h-8 z`" />
      <circle :cx="lx + 10" :cy="y + H + 1" r="5" />
      <circle :cx="lx + 30" :cy="y + H + 1" r="5" />
      <circle :cx="lx + 44" :cy="y + H + 1" r="4" />
    </g>
    <line v-if="lok" class="wo-kupplung" :x1="lx + LOK + 2" :y1="y + H / 2 + 4" :x2="reihe[0].x" :y2="y + H / 2 + 4" />
    <line
      v-for="i in reihe.length - 1"
      :key="'k' + i"
      class="wo-kupplung"
      :x1="reihe[i - 1].r"
      :y1="y + H / 2 + 4"
      :x2="reihe[i].x"
      :y2="y + H / 2 + 4"
    />
    <Wagen v-for="(w, i) in reihe" :key="i" v-bind="w" :y="y" />
  </g>
</template>
