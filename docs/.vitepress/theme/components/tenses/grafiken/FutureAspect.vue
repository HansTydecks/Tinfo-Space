<script setup>
// Aspekt auch in der Zukunft: future progressive (läuft gerade, zu einem späteren Zeitpunkt)
// und future perfect (ist zu einem späteren Zeitpunkt schon fertig).
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Welle from '../parts/Welle.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'

const NOW = 110
</script>

<template>
  <svg viewBox="0 0 640 300" role="img" aria-label="Aspect in the future. Top: future progressive – This time tomorrow I will be sitting on the plane. A wavy line goes on around a time tomorrow. Bottom: future perfect – By Friday I will have finished my project. The project is finished before Friday; an arrow looks back from Friday.">
    <rect class="te-card" x="8" y="8" width="624" height="136" rx="12" />
    <text class="rs-label" x="22" y="30">future progressive: in the middle of it – later</text>
    <Bezug :x="NOW" :y1="56" :y2="100" />
    <Bezug :x="420" :y1="56" :y2="100" t="THIS TIME TOMORROW" k="fut" />
    <Welle :x1="360" :x2="480" :y="88" />
    <text class="te-c k-prog" x="420" y="118" text-anchor="middle" font-size="13">✈️ will be sitting</text>
    <Achse :x1="22" :x2="618" :y="88" />
    <text class="rs-title" x="22" y="136">This time tomorrow I <tspan class="te-c k-fut">will</tspan> <tspan class="te-c k-prog">be sitting</tspan> on the plane.</text>

    <rect class="te-card" x="8" y="158" width="624" height="136" rx="12" />
    <text class="rs-label" x="22" y="180">future perfect: already finished – by then</text>
    <Bezug :x="NOW" :y1="206" :y2="250" />
    <Bezug :x="500" :y1="206" :y2="250" t="FRIDAY" k="fut" />
    <Punkt :x="380" :y="238" k="perf" :r="8" />
    <text class="te-c k-perf" x="380" y="268" text-anchor="middle" font-size="13">✅ will have finished</text>
    <Arrow :x1="388" :y1="232" :x2="496" :y2="232" :qx="442" :qy="212" k="perf" />
    <Achse :x1="22" :x2="618" :y="238" :labels="false" />
    <text class="rs-title" x="22" y="288">By Friday I <tspan class="te-c k-fut">will</tspan> <tspan class="te-c k-perf">have finished</tspan> my project.</text>
  </svg>
</template>
