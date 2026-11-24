<script setup>
// Kapitel 2: manner – place – time am Ende; im Deutschen oft umgekehrt (Zeit vor Ort).
import Satz from '../parts/Satz.vue'
import { S } from '../layout.js'

const lab = (teile, labs) => teile.map((p, i) => ({ ...p, lab: labs[i] || undefined }))
const en = lab(S('She:s sings:v beautifully:adv at_the_concert:adv tonight.:adv'), ['S', 'V', 'M · how?', 'P · where?', 'T · when?'])
const de = lab(S('Sie:s singt:v heute_Abend:adv im_Konzert:adv wunderschön.:adv'), ['', '', 'T', 'P', 'M'])
const vorn = lab(S('Tonight,:adv she:s sings:v at_the_concert.:adv'), ['T', 'S', 'V', 'P'])
</script>

<template>
  <svg viewBox="0 0 680 286" role="img" aria-label="English: She sings beautifully at the concert tonight – manner, place, time. German: Sie singt heute Abend im Konzert wunderschön – time, place, manner: the other way round. Time can also go to the front: Tonight, she sings at the concert.">
    <rect class="wo-panel" x="4" y="4" width="672" height="186" rx="10" />
    <text class="wo-h" x="18" y="24">At the end: <tspan class="s">manner → place → time. German often goes the other way round.</tspan></text>
    <Satz :teile="en" :x="64" :y="58" tag="EN" />
    <text class="wo-note" x="664" y="80" text-anchor="end"><tspan class="b">M – P – T</tspan></text>
    <Satz :teile="de" :x="64" :y="134" tag="DE" />
    <text class="wo-note" x="664" y="156" text-anchor="end"><tspan class="b">T – P – M</tspan></text>

    <rect class="wo-panel" x="4" y="200" width="672" height="82" rx="10" />
    <text class="wo-h" x="18" y="220">Or time at the start: <tspan class="s">then comma + S – V as usual</tspan></text>
    <Satz :teile="vorn" :x="64" :y="242" />
  </svg>
</template>
