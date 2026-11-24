<script setup>
// Deutsch: das Verb wandert (2. Stelle, Ende). Englisch: S – V – O bleibt immer gleich.
import Satz from '../parts/Satz.vue'
import { S } from '../layout.js'

const BLOECKE = [
  {
    h: 'Normal sentence', s: '',
    de: S('Tom:s spielt:v am_Samstag:adv Fußball.:o'), deN: ['verb in ', '2nd place'],
    en: S('Tom:s plays:v football:o on_Saturday.:adv'), enN: ['S – V – O', ''],
  },
  {
    h: 'Time at the start', s: '',
    de: S('Am_Samstag:adv spielt:v Tom:s Fußball.:o'), deN: ['verb 2nd – ', 'subject moves!'],
    en: S('On_Saturday,:adv Tom:s plays:v football.:o'), enN: ['S – V – O', ''],
  },
  {
    h: 'After because / weil', s: '',
    de: S('…_weil:qw Tom:s am_Samstag:adv Fußball:o spielt.:v'), deN: ['verb ', 'at the end'],
    en: S('…_because:qw Tom:s plays:v football:o on_Saturday.:adv'), enN: ['S – V – O', ''],
  },
]
const Y0 = 22
const BH = 134
</script>

<template>
  <svg viewBox="0 0 680 408" role="img" aria-label="German versus English word order. Normal sentence: Tom spielt am Samstag Fußball – Tom plays football on Saturday. Time at the start: Am Samstag spielt Tom Fußball – the German subject moves behind the verb; English: On Saturday, Tom plays football. After weil the German verb goes to the end: weil Tom am Samstag Fußball spielt; English: because Tom plays football on Saturday. In English the order subject – verb – object never changes.">
    <g v-for="(b, i) in BLOECKE" :key="i">
      <rect class="wo-panel" x="4" :y="Y0 + i * BH - 18" width="672" :height="BH - 8" rx="10" />
      <text class="wo-h" x="18" :y="Y0 + i * BH">{{ b.h }}</text>
      <Satz :teile="b.de" :x="64" :y="Y0 + i * BH + 14" tag="DE" />
      <Satz :teile="b.en" :x="64" :y="Y0 + i * BH + 62" tag="EN" />
      <text class="wo-note" x="664" :y="Y0 + i * BH + 36" text-anchor="end">{{ b.deN[0] }}<tspan class="b">{{ b.deN[1] }}</tspan></text>
      <text class="wo-note" x="664" :y="Y0 + i * BH + 84" text-anchor="end"><tspan class="b">{{ b.enN[0] }}</tspan></text>
    </g>
  </svg>
</template>
