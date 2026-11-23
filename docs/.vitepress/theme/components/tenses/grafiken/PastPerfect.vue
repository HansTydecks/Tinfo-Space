<script setup>
// Past perfect: „Vorvergangenheit" – etwas war schon vorher passiert (vor THEN).
// Unten: past perfect progressive – etwas lief schon eine Zeit lang bis THEN.
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Welle from '../parts/Welle.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'

const THEN = 400
const NOW = 540
</script>

<template>
  <svg viewBox="0 0 640 306" role="img" aria-label="Past perfect. Top: When Anna arrived at the cinema, the film had already started. Two actions in the past: first the film started, shown as a green dot, then Anna arrived, shown as a blue dot at THEN. The past perfect looks back from THEN. Bottom: past perfect progressive. Tom had been waiting for an hour when the bus finally came. A wavy line goes from one hour before until THEN.">
    <!-- oben: past perfect simple -->
    <rect class="te-card" x="8" y="8" width="624" height="144" rx="12" />
    <text class="rs-label" x="22" y="30">past perfect: the past before the past</text>
    <Bezug :x="THEN" :y1="56" :y2="100" t="THEN" k="zeit" />
    <Bezug :x="NOW" :y1="56" :y2="100" />
    <Punkt :x="230" :y="88" k="perf" :r="8" />
    <text class="te-c k-perf" x="230" y="66" text-anchor="middle" font-size="13">① had started 🎬</text>
    <Arrow :x1="238" :y1="82" :x2="THEN - 10" :y2="82" :qx="315" :qy="62" k="perf" />
    <Punkt :x="THEN" :y="88" k="zeit" :r="8" />
    <text class="te-c k-zeit" :x="THEN + 12" y="116" font-size="13">② arrived</text>
    <Achse :x1="22" :x2="618" :y="88" />
    <text class="rs-title" x="22" y="140">When Anna <tspan class="te-c k-zeit">arrived</tspan>, the film <tspan class="te-c k-perf">had</tspan> already <tspan class="te-c k-perf">started</tspan>.</text>

    <!-- unten: past perfect progressive -->
    <rect class="te-card" x="8" y="166" width="624" height="132" rx="12" />
    <text class="rs-label" x="22" y="188">past perfect progressive: how long – until then</text>
    <Bezug :x="THEN" :y1="210" :y2="250" t="THEN" k="zeit" />
    <Welle :x1="200" :x2="THEN" :y="238" pfeil />
    <text class="te-c k-prog" x="290" y="222" text-anchor="middle" font-size="13">had been waiting ⏳</text>
    <text class="te-c k-zeit" x="290" y="262" text-anchor="middle" font-size="12.5">for an hour</text>
    <Punkt :x="THEN" :y="238" k="zeit" :r="8" />
    <text class="te-c k-zeit" :x="THEN + 14" y="226" font-size="13">🚌 came</text>
    <Achse :x1="22" :x2="618" :y="238" :labels="false" />
    <text class="rs-title" x="22" y="284">Tom <tspan class="te-c k-perf">had</tspan> <tspan class="te-c k-prog">been waiting</tspan> for an hour when the bus finally <tspan class="te-c k-zeit">came</tspan>.</text>
  </svg>
</template>
