<script setup>
// Kapitel 5: zwei Objekte (Person – Sache / Sache – to + Person) und phrasal verbs (turn it off).
import Satz from '../parts/Satz.vue'
import { S } from '../layout.js'

const lab = (teile, labs) => teile.map((p, i) => ({ ...p, lab: labs[i] || undefined }))
const L = [
  { r: lab(S('give:v Tom:o the_book:o'), ['', 'person', 'thing']), ok: true },
  { r: lab(S('give:v the_book:o to_Tom:o'), ['', 'thing', 'to + person']), ok: true },
  { r: S('give:v it:o to_him:o'), ok: true },
  { r: S('give:v him:o it:o'), ok: false },
  { r: S('explain:v me:o the_rules:o'), ok: false },
  { r: S('explain:v the_rules:o to_me:o'), ok: true },
]
const R = [
  { r: S('turn:v the_TV:o off:v'), ok: true },
  { r: S('turn_off:v the_TV:o'), ok: true },
  { r: S('turn:v it:o off:v'), ok: true },
  { r: S('turn_off:v it:o'), ok: false },
]
const yl = [44, 100, 160, 208, 268, 316]
const yr = [44, 92, 160, 208]
</script>

<template>
  <svg viewBox="0 0 680 384" role="img" aria-label="Two objects: give Tom the book or give the book to Tom. With pronouns: give it to him, not give him it. explain the rules to me, not explain me the rules. Phrasal verbs: turn the TV off or turn off the TV – but with it only turn it off, not turn off it.">
    <rect class="wo-panel" x="4" y="4" width="380" height="376" rx="10" />
    <text class="wo-h" x="18" y="24">Two objects</text>
    <Satz v-for="(z, i) in L" :key="'l' + i" :teile="z.r" :x="48" :y="yl[i]" :ok="z.ok" />
    <text class="wo-note" x="370" y="250" text-anchor="end"><tspan class="b">it / them</tspan> → thing first</text>
    <text class="wo-note" x="370" y="372" text-anchor="end"><tspan class="b">explain, describe</tspan> → to</text>

    <rect class="wo-panel" x="392" y="4" width="284" height="376" rx="10" />
    <text class="wo-h" x="406" y="24">Phrasal verbs</text>
    <Satz v-for="(z, i) in R" :key="'r' + i" :teile="z.r" :x="436" :y="yr[i]" :ok="z.ok" />
    <text class="wo-note" x="664" y="142" text-anchor="end">noun: <tspan class="b">both are OK</tspan></text>
    <text class="wo-note" x="664" y="262" text-anchor="end">pronoun: <tspan class="b">always in the middle</tspan></text>
    <text class="wo-note" x="664" y="282" text-anchor="end">turn it off · pick them up</text>
  </svg>
</template>
