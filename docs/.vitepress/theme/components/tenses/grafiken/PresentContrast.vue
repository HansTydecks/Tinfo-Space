<script setup>
// Simple present (immer wieder: jeden Samstag) vs present progressive (genau jetzt).
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Welle from '../parts/Welle.vue'

const SA = [44, 96, 148, 200, 252]
</script>

<template>
  <svg viewBox="0 0 640 236" role="img" aria-label="Left: simple present. I play football every Saturday – the action happens again and again, shown as dots on every Saturday. Right: present progressive. I am playing football now – the action is going on right now, shown as a wavy line around NOW.">
    <!-- links: simple present -->
    <rect class="te-card" x="8" y="8" width="306" height="218" rx="12" />
    <g class="k-zeit">
      <text class="te-head" x="22" y="32" font-size="14">simple present</text>
      <text class="te-sub2" x="22" y="48">again and again · always true</text>
    </g>
    <Bezug :x="226" :y1="86" :y2="140" />
    <Punkt v-for="x in SA" :key="x" :x="x" :y="126" k="zeit" :r="7" />
    <text v-for="x in SA" :key="'t' + x" class="te-sub2" :x="x" y="106" text-anchor="middle">Sat</text>
    <Achse :x1="22" :x2="298" :y="126" />
    <text class="rs-title" x="22" y="180">I <tspan class="te-c k-zeit">play</tspan> football</text>
    <text class="rs-title" x="22" y="198"><tspan class="te-c k-zeit">every Saturday</tspan>.</text>

    <!-- rechts: present progressive -->
    <rect class="te-card" x="326" y="8" width="306" height="218" rx="12" />
    <g class="k-prog">
      <text class="te-head" x="340" y="32" font-size="14">present progressive</text>
      <text class="te-sub2" x="340" y="48">right now · just for a short time</text>
    </g>
    <Bezug :x="520" :y1="86" :y2="140" />
    <Welle :x1="470" :x2="570" :y="126" />
    <text class="te-sub2" x="520" y="106" text-anchor="middle" dx="-60">⚽</text>
    <Achse :x1="340" :x2="616" :y="126" />
    <text class="rs-title" x="340" y="180">I <tspan class="te-c k-prog">am playing</tspan> football</text>
    <text class="rs-title" x="340" y="198"><tspan class="te-c k-prog">now</tspan>.</text>
  </svg>
</template>
