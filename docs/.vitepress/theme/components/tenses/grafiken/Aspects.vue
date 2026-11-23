<script setup>
// Vier Arten, auf eine Handlung zu schauen (aspect) – jeweils mit Bezugspunkt NOW.
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Welle from '../parts/Welle.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'

// Panels: x, y (oben links), Breite 306, Höhe 150
const P = [
  { x: 10, y: 8, t: 'simple', k: 'n', emoji: '📷', how: 'the whole action – a photo', ex: 'I work. · I worked.' },
  { x: 324, y: 8, t: 'progressive', k: 'prog', emoji: '🎥', how: 'in the middle of it – a video', ex: 'I am working.' },
  { x: 10, y: 168, t: 'perfect', k: 'perf', emoji: '↩️', how: 'looking back from now', ex: 'I have worked.' },
  { x: 324, y: 168, t: 'perfect progressive', k: 'perf', emoji: '⏳', how: 'it went on until now', ex: 'I have been working.' },
]
const now = (pn) => pn.x + 210
const ay = (pn) => pn.y + 104
</script>

<template>
  <svg viewBox="0 0 640 328" role="img" aria-label="Four ways to look at an action. Simple: you see the whole action, like a photo – I work, I worked. Progressive: you are in the middle of it, like a video – I am working. Perfect: you look back from now at something that happened before – I have worked. Perfect progressive: something started before and went on until now – I have been working.">
    <g v-for="pn in P" :key="pn.t">
      <rect class="te-card" :x="pn.x" :y="pn.y" width="306" height="150" rx="12" />
      <g :class="'k-' + pn.k">
        <text class="te-emoji" :x="pn.x + 14" :y="pn.y + 28">{{ pn.emoji }}</text>
        <text class="te-head" :x="pn.x + 44" :y="pn.y + 24" font-size="14">{{ pn.t }}</text>
        <text class="te-sub2" :x="pn.x + 44" :y="pn.y + 40">{{ pn.how }}</text>
      </g>
      <Achse :x1="pn.x + 16" :x2="pn.x + 292" :y="ay(pn)" :labels="false" />
      <Bezug :x="now(pn)" :y1="pn.y + 66" :y2="ay(pn) + 12" />
      <text class="rs-title" :x="pn.x + 16" :y="pn.y + 138">{{ pn.ex }}</text>
    </g>

    <!-- simple: ein Punkt -->
    <Punkt :x="110" :y="ay(P[0])" k="zeit" :r="8" />
    <!-- progressive: Welle durch NOW -->
    <Welle :x1="now(P[1]) - 50" :x2="now(P[1]) + 50" :y="ay(P[1])" />
    <!-- perfect: Punkt vorher, Bogen bis NOW -->
    <Punkt :x="110" :y="ay(P[2])" k="perf" :r="8" />
    <g class="k-perf"><Arrow :x1="116" :y1="ay(P[2]) - 8" :x2="now(P[2]) - 4" :y2="ay(P[2]) - 10" :qx="(110 + now(P[2])) / 2" :qy="ay(P[2]) - 36" k="perf" /></g>
    <!-- perfect progressive: Welle bis NOW -->
    <Welle :x1="P[3].x + 90" :x2="now(P[3])" :y="ay(P[3])" pfeil />
  </svg>
</template>
