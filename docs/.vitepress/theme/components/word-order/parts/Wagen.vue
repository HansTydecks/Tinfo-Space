<script setup>
// Ein Wort als Waggon: Kasten mit zwei Rädern, darüber optional ein Label (SUBJECT …), darunter eine Frage (who?).
import { computed } from 'vue'
import { H, wagenW } from '../layout.js'

const p = defineProps({
  t: { type: String, default: '' },
  k: { type: String, default: 'n' },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: Number,
  lab: String,
  q: String,
  dim: Boolean,
  mark: Boolean,
  strike: Boolean,
})
const bw = computed(() => p.w ?? wagenW(p.t))
</script>

<template>
  <g :class="['wo-wagen', 'k-' + k, { 'is-dim': dim }]">
    <text v-if="lab" class="wo-lab" :x="x + bw / 2" :y="y - 8" text-anchor="middle">{{ lab }}</text>
    <rect v-if="mark" class="wo-mark" :x="x - 5" :y="y - 5" :width="bw + 10" :height="H + 12" rx="10" />
    <rect class="wo-body" :x="x" :y="y" :width="bw" :height="H" rx="7" />
    <circle :cx="x + 11" :cy="y + H + 1" r="3.6" />
    <circle :cx="x + bw - 11" :cy="y + H + 1" r="3.6" />
    <text class="wo-t" :x="x + bw / 2" :y="y + H / 2" dy="0.35em" text-anchor="middle">{{ t }}</text>
    <line v-if="strike" class="wo-strike" :x1="x + 4" :y1="y + H - 6" :x2="x + bw - 4" :y2="y + 6" />
    <text v-if="q" class="wo-q" :x="x + bw / 2" :y="y + H + 19" text-anchor="middle">{{ q }}</text>
  </g>
</template>
