<script setup>
// Der Satzzug: S – V – O – M – P – T. mark="p,t" hebt Waggons hervor, die anderen werden blass.
import { computed } from 'vue'
import Satz from '../parts/Satz.vue'
import { zug } from '../layout.js'

const props = defineProps({ mark: { type: String, default: '' } })
const TEILE = [
  { key: 's', t: 'Tom', k: 's', lab: 'S · subject', q: 'who?' },
  { key: 'v', t: 'plays', k: 'v', lab: 'V · verb', q: 'does what?' },
  { key: 'o', t: 'football', k: 'o', lab: 'O · object', q: 'what?' },
  { key: 'm', t: 'well', k: 'adv', lab: 'M', q: 'how?' },
  { key: 'p', t: 'in the park', k: 'adv', lab: 'P · place', q: 'where?' },
  { key: 't', t: 'on Saturdays.', k: 'adv', lab: 'T · time', q: 'when?' },
]
const r = computed(() => {
  const m = props.mark.split(',').map((s) => s.trim()).filter(Boolean)
  return zug(TEILE.map((p) => ({ ...p, mark: m.includes(p.key), dim: m.length > 0 && !m.includes(p.key) })), 84)
})
const mpt = computed(() => [r.value[3].x, r.value[5].r])
</script>

<template>
  <svg :viewBox="`0 0 680 ${mark ? 158 : 178}`" role="img" aria-label="The sentence train: Tom (subject, who?) – plays (verb, does what?) – football (object, what?) – well (manner, how?) – in the park (place, where?) – on Saturdays (time, when?). Subject, verb and object come first; manner, place and time follow at the end.">
    <Satz :r="r" :y="44" lok />
    <g class="k-adv">
      <path class="wo-klammer" :d="`M${mpt[0]} 120 v8 H${mpt[1]} v-8`" />
      <text class="wo-note wo-c" :x="(mpt[0] + mpt[1]) / 2" y="148" text-anchor="middle">adverbials: manner – place – time</text>
    </g>
    <g class="k-v">
      <path class="wo-klammer" :d="`M${r[0].x} 120 v8 H${r[2].r} v-8`" />
      <text class="wo-note" :x="(r[0].x + r[2].r) / 2" y="148" text-anchor="middle"><tspan class="b">S – V – O</tspan>: fixed order</text>
    </g>
    <text v-if="!mark" class="wo-note" x="340" y="170" text-anchor="middle">“Tom spielt samstags gut im Park Fußball.” – in English the wagons always come in this order.</text>
  </svg>
</template>
