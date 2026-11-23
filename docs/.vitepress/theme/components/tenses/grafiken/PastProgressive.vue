<script setup>
// Past progressive: lange Hintergrund-Handlung (Welle), die von einer kurzen Handlung (simple past, Blitz) unterbrochen wird.
// Unten: zwei Handlungen gleichzeitig (while).
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Welle from '../parts/Welle.vue'
</script>

<template>
  <svg viewBox="0 0 640 314" role="img" aria-label="Past progressive. Top: I was reading when the phone rang. Reading is a long action in the background, shown as a wavy line; the phone rang is a short action in the simple past, shown as a dot with a flash, which interrupts it. Bottom: While Tom was cooking, Anna was doing her homework. Two long actions happen at the same time, shown as two wavy lines.">
    <!-- oben: Unterbrechung -->
    <rect class="te-card" x="8" y="8" width="624" height="140" rx="12" />
    <text class="rs-label" x="22" y="30">background + interruption</text>
    <Welle :x1="120" :x2="440" :y="84" />
    <text class="te-c k-prog" x="200" y="66" text-anchor="middle" font-size="13">was reading 📖</text>
    <Punkt :x="330" :y="84" k="zeit" :r="8" />
    <text class="te-c k-zeit" x="330" y="62" text-anchor="middle" font-size="13">⚡ rang</text>
    <Bezug :x="560" :y1="60" :y2="96" />
    <Achse :x1="22" :x2="618" :y="84" />
    <text class="rs-title" x="22" y="132">I <tspan class="te-c k-prog">was reading</tspan> when the phone <tspan class="te-c k-zeit">rang</tspan>.</text>
    <text class="te-sub2" x="618" y="132" text-anchor="end">long action: past progressive · short action: simple past</text>

    <!-- unten: gleichzeitig -->
    <rect class="te-card" x="8" y="162" width="624" height="144" rx="12" />
    <text class="rs-label" x="22" y="184">two things at the same time</text>
    <Welle :x1="120" :x2="390" :y="212" />
    <text class="te-c k-prog" x="416" y="212" dy="0.35em" font-size="13">Tom: was cooking 🍳</text>
    <Welle :x1="120" :x2="390" :y="240" />
    <text class="te-c k-prog" x="416" y="240" dy="0.35em" font-size="13">Anna: was doing homework ✏️</text>
    <Achse :x1="22" :x2="618" :y="262" :labels="false" />
    <text class="rs-title" x="22" y="292"><tspan class="te-c k-zeit">While</tspan> Tom <tspan class="te-c k-prog">was cooking</tspan>, Anna <tspan class="te-c k-prog">was doing</tspan> her homework.</text>
  </svg>
</template>
