<script setup>
// Das Raster: 2 tenses (present, past) × 4 aspects (simple, progressive, perfect, perfect progressive)
// plus Zukunft mit will. mark="present-perfect" (auch mehrere, mit Komma) hebt Zellen hervor.
import { computed } from 'vue'

const p = defineProps({ mark: { type: String, default: '' } })

const SPALTEN = [
  { key: 'simple', t: 'simple', sub: 'verb (+ -s / -ed)', k: 'n', x: 118, w: 96 },
  { key: 'progressive', t: 'progressive', sub: 'be + -ing', k: 'prog', x: 220, w: 122 },
  { key: 'perfect', t: 'perfect', sub: 'have + 3rd form', k: 'perf', x: 348, w: 122 },
  { key: 'perfect-progressive', t: 'perfect progressive', sub: 'have been + -ing', k: 'perf', x: 476, w: 158 },
]
const ZEILEN = [
  {
    key: 'present', t: 'present', sub: 'now', k: 'zeit', y: 58,
    zellen: [
      [['work(s)', 'n']],
      [['am/is/are working', 'prog']],
      [['have/has worked', 'perf']],
      [['have/has ', 'perf'], ['been working', 'prog']],
    ],
  },
  {
    key: 'past', t: 'past', sub: 'then', k: 'zeit', y: 106,
    zellen: [
      [['worked', 'n']],
      [['was/were working', 'prog']],
      [['had worked', 'perf']],
      [['had ', 'perf'], ['been working', 'prog']],
    ],
  },
  {
    key: 'future', t: 'future', sub: 'with will', k: 'fut', y: 170,
    zellen: [
      [['will ', 'fut'], ['work', 'n']],
      [['will ', 'fut'], ['be working', 'prog']],
      [['will ', 'fut'], ['have worked', 'perf']],
      [['will ', 'fut'], ['have ', 'perf'], ['been working', 'prog']],
    ],
  },
]
const H = 42

const markiert = computed(() => new Set(p.mark.split(',').map((s) => s.trim()).filter(Boolean)))
const istMarkiert = (z, s) => markiert.value.has(`${z.key}-${s.key}`) || markiert.value.has(z.key)
const gedimmt = (z, s) => markiert.value.size > 0 && !istMarkiert(z, s)
</script>

<template>
  <svg viewBox="0 0 640 252" role="img" aria-label="The grid of English verb forms. Two tenses, present and past, combine with four aspects: simple, progressive (be plus -ing), perfect (have plus third form) and perfect progressive (have been plus -ing). Present: work, am working, have worked, have been working. Past: worked, was working, had worked, had been working. With will you can build the same four forms for the future: will work, will be working, will have worked, will have been working.">
    <text class="rs-label" x="10" y="20">tense ↓ · aspect →</text>
    <g v-for="s in SPALTEN" :key="s.key" :class="'k-' + s.k">
      <text class="te-head" :x="s.x + s.w / 2" y="22" text-anchor="middle">{{ s.t }}</text>
      <text class="te-sub2" :x="s.x + s.w / 2" y="38" text-anchor="middle">{{ s.sub }}</text>
    </g>

    <line class="rs-dots" x1="10" y1="161" x2="634" y2="161" />

    <g v-for="z in ZEILEN" :key="z.key">
      <g :class="'k-' + z.k">
        <rect class="te-card" :class="'k-' + z.k" x="10" :y="z.y" width="102" :height="H" rx="8" />
        <text class="te-head" x="61" :y="z.y + 17" text-anchor="middle">{{ z.t }}</text>
        <text class="te-sub2" x="61" :y="z.y + 32" text-anchor="middle">{{ z.sub }}</text>
      </g>
      <g v-for="(s, i) in SPALTEN" :key="s.key">
        <rect class="te-cell" :class="{ 'is-dim': gedimmt(z, s) }" :x="s.x" :y="z.y" :width="s.w" :height="H" rx="8" />
        <text :x="s.x + s.w / 2" :y="z.y + H / 2" dy="0.35em" text-anchor="middle" font-size="13" :opacity="gedimmt(z, s) ? 0.45 : 1">
          <tspan v-for="(teil, j) in z.zellen[i]" :key="j" :class="teil[1] === 'n' ? '' : ['te-c', 'k-' + teil[1]]">{{ teil[0] }}</tspan>
        </text>
        <rect v-if="istMarkiert(z, s)" class="te-cell-mark" :x="s.x - 2" :y="z.y - 2" :width="s.w + 4" :height="H + 4" rx="10" />
      </g>
    </g>

    <text class="rs-small" x="320" y="236" text-anchor="middle">The future has no tense of its own: will, going to, present progressive … are ways to talk about it.</text>
  </svg>
</template>
