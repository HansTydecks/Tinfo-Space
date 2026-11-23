<script setup>
// Present perfect progressive: Tätigkeit läuft seit einer Zeit bis jetzt (Welle bis NOW).
// Unten: Kontrast zum present perfect simple – Ergebnis/Menge vs Tätigkeit/Dauer.
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Welle from '../parts/Welle.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'

const NOW = 470
</script>

<template>
  <svg viewBox="0 0 640 318" role="img" aria-label="Present perfect progressive. Top: I have been studying for two hours. A wavy line starts two hours ago and goes on until NOW. Bottom left: present perfect simple – I have written three emails: three dots, the result, how many. Bottom right: present perfect progressive – I have been writing emails all morning: a wavy line, the activity, how long.">
    <rect class="te-card" x="8" y="8" width="624" height="140" rx="12" />
    <text class="rs-label" x="22" y="30">it started before and goes on until now</text>
    <Bezug :x="NOW" :y1="56" :y2="100" />
    <Bezug :x="230" :y1="56" :y2="100" t="2 HOURS AGO" k="zeit" />
    <Welle :x1="230" :x2="NOW" :y="88" pfeil />
    <text class="te-c k-prog" x="350" y="70" text-anchor="middle" font-size="13">have been studying 📚</text>
    <text class="te-c k-zeit" x="350" y="112" text-anchor="middle" font-size="12.5">for two hours · since 4 o’clock</text>
    <Achse :x1="22" :x2="618" :y="88" />
    <text class="rs-title" x="22" y="140">I <tspan class="te-c k-perf">have</tspan> <tspan class="te-c k-prog">been studying</tspan> for two hours. (And I’m still studying!)</text>

    <!-- unten links: simple -->
    <rect class="te-card k-perf" x="8" y="162" width="306" height="148" rx="12" />
    <text class="te-head k-perf" x="22" y="186" font-size="14">present perfect simple</text>
    <text class="te-sub2" x="22" y="202">the result · how many · finished</text>
    <Punkt v-for="x in [60, 120, 180]" :key="x" :x="x" :y="242" k="perf" />
    <text class="te-emoji" x="52" y="232" font-size="14">✉️</text>
    <text class="te-emoji" x="112" y="232" font-size="14">✉️</text>
    <text class="te-emoji" x="172" y="232" font-size="14">✉️</text>
    <Arrow :x1="190" :y1="242" :x2="274" :y2="242" k="perf" />
    <text class="rs-title" x="22" y="288">I <tspan class="te-c k-perf">have written</tspan> three emails.</text>

    <!-- unten rechts: progressive -->
    <rect class="te-card k-prog" x="326" y="162" width="306" height="148" rx="12" />
    <text class="te-head k-prog" x="340" y="186" font-size="14">present perfect progressive</text>
    <text class="te-sub2" x="340" y="202">the activity · how long · maybe not finished</text>
    <Welle :x1="360" :x2="592" :y="242" pfeil />
    <text class="rs-title" x="340" y="280">I <tspan class="te-c k-perf">have</tspan> <tspan class="te-c k-prog">been writing</tspan> emails</text>
    <text class="rs-title" x="340" y="298">all morning.</text>
  </svg>
</template>
