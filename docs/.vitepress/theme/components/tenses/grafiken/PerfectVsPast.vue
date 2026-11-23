<script setup>
// Simple past (Zeitpunkt vorbei, abgeschlossen) vs present perfect (Erfahrung bis jetzt, Verbindung zu NOW).
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'

const NOW = 500
</script>

<template>
  <svg viewBox="0 0 640 300" role="img" aria-label="Top: simple past. I visited London last year – one action in a finished time, last year. Bottom: present perfect. I have visited London three times – three visits at some time in my life before now; we don't say when, and an arrow links them to NOW: it's my experience up to now.">
    <!-- oben: simple past -->
    <rect class="te-card" x="8" y="8" width="624" height="130" rx="12" />
    <g class="k-zeit">
      <text class="te-head" x="22" y="32" font-size="14">simple past</text>
      <text class="te-sub2" x="22" y="48">When? A finished time.</text>
    </g>
    <rect class="te-area k-zeit" x="200" y="60" width="140" height="48" rx="10" />
    <text class="te-head k-zeit" x="270" y="76" text-anchor="middle" font-size="12">last year 🔒</text>
    <Punkt :x="270" :y="96" k="zeit" />
    <Bezug :x="NOW" :y1="70" :y2="108" />
    <Achse :x1="22" :x2="618" :y="96" :labels="false" />
    <text class="rs-title" x="22" y="128">I <tspan class="te-c k-zeit">visited</tspan> London <tspan class="te-c k-zeit">last year</tspan>.</text>

    <!-- unten: present perfect -->
    <rect class="te-card" x="8" y="152" width="624" height="140" rx="12" />
    <g class="k-perf">
      <text class="te-head" x="22" y="176" font-size="14">present perfect</text>
      <text class="te-sub2" x="22" y="192">Not when – the result or experience NOW.</text>
    </g>
    <text class="te-sub2" x="260" y="214" text-anchor="middle">in my life up to now – we don’t say when</text>
    <Punkt v-for="x in [130, 260, 390]" :key="x" :x="x" :y="246" k="perf" />
    <Arrow :x1="396" :y1="240" :x2="NOW - 4" :y2="238" :qx="450" :qy="214" k="perf" />
    <Bezug :x="NOW" :y1="220" :y2="258" />
    <text class="te-c k-perf" x="566" y="216" text-anchor="middle" font-size="13">3 visits</text>
    <text class="te-c k-perf" x="566" y="232" text-anchor="middle" font-size="13">so far</text>
    <Achse :x1="22" :x2="618" :y="246" :labels="false" />
    <text class="rs-title" x="22" y="280">I <tspan class="te-c k-perf">have visited</tspan> London <tspan class="te-c k-perf">three times</tspan>.</text>
  </svg>
</template>
