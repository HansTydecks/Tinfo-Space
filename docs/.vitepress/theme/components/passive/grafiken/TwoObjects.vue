<script setup>
// Verben mit zwei Objekten: Person oder Sache wird Subjekt.
import Chip from '../../reported-speech/parts/Chip.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'
import { reihe, ende } from '../../reported-speech/layout.js'

const aktiv = reihe([{ t: 'Someone', k: 'agent' }, { t: 'gave', k: 'be' }, { t: 'the guard', k: 'obj' }, { t: 'a note', k: 'obj' }, { t: '.', k: 'n' }], 200, 8)
const [, , guard, note] = aktiv
const p1 = reihe([{ t: 'The guard', k: 'obj' }, { t: 'was', k: 'be' }, { t: 'given', k: 'pp' }, { t: 'a note', k: 'n' }, { t: '.', k: 'n' }], 30, 6)
const p2 = reihe([{ t: 'A note', k: 'obj' }, { t: 'was', k: 'be' }, { t: 'given', k: 'pp' }, { t: 'to', k: 'agent' }, { t: 'the guard', k: 'n' }, { t: '.', k: 'n' }], 340, 6)
</script>

<template>
  <svg viewBox="0 0 640 260" role="img" aria-label="Verbs with two objects like give, send, show, offer. Active: Someone gave the guard a note. Passive with the person first (more common): The guard was given a note. Passive with the thing first: A note was given to the guard – here you need to.">
    <text class="rs-label" x="16" y="50">active</text>
    <rect class="rs-band" x="186" y="22" :width="ende(aktiv) + 14 - 186" height="44" rx="12" />
    <Chip v-for="c in aktiv" :key="c.t" v-bind="c" :y="28" />
    <text class="rs-sub k-obj" :x="guard.cx" y="82" text-anchor="middle">person</text>
    <text class="rs-sub k-obj" :x="note.cx" y="82" text-anchor="middle">thing</text>

    <Arrow :x1="guard.cx" :y1="88" :x2="p1[0].cx" :y2="150" k="obj" />
    <Arrow :x1="note.cx" :y1="88" :x2="p2[0].cx" :y2="150" k="obj" />

    <text class="rs-title" x="30" y="142">① person first (more common)</text>
    <Chip v-for="c in p1" :key="c.t" v-bind="c" :y="156" />
    <text class="rs-title" x="340" y="142">② thing first</text>
    <Chip v-for="c in p2" :key="c.t" v-bind="c" :y="156" />
    <text class="rs-al k-agent" :x="p2[3].cx" y="210" text-anchor="middle">+ to</text>
    <text class="rs-small" x="320" y="246" text-anchor="middle">also: send · show · offer · tell · promise · hand · teach</text>
  </svg>
</template>
