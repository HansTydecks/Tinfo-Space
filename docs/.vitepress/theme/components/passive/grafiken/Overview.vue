<script setup>
// Überblick: Aus dem Objekt des Aktivsatzes wird das Subjekt des Passivsatzes.
import Chip from '../../reported-speech/parts/Chip.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'
import { reihe, ende } from '../../reported-speech/layout.js'

const aktiv = reihe(
  [{ t: 'Someone', k: 'agent' }, { t: 'stole', k: 'be' }, { t: 'the jewels', k: 'obj' }, { t: 'last night.', k: 'n' }],
  190,
  8,
)
const passiv = reihe(
  [{ t: 'The jewels', k: 'obj' }, { t: 'were', k: 'be' }, { t: 'stolen', k: 'pp' }, { t: '(by someone)', k: 'agent', strike: true }, { t: 'last night.', k: 'n' }],
  166,
  8,
)
const [someone, stole, jewels] = aktiv
const [pJewels, were, stolen, by] = passiv
</script>

<template>
  <svg viewBox="0 0 640 320" role="img" aria-label="Active: Someone stole the jewels last night. Passive: The jewels were stolen last night. The object the jewels moves to the front and becomes the subject. The verb stole becomes were plus stolen: be plus past participle. The doer someone is left out.">
    <text class="rs-label" x="16" y="50">active</text>
    <text class="rs-small" x="16" y="66">who does it?</text>
    <rect class="rs-band" x="176" y="22" :width="ende(aktiv) + 14 - 176" height="44" rx="12" />
    <Chip v-for="c in aktiv" :key="c.t" v-bind="c" :y="28" />

    <!-- Objekt wandert nach vorn -->
    <Arrow :x1="jewels.cx" :y1="64" :x2="pJewels.cx + 8" :y2="226" :qx="jewels.cx - 40" :qy="190" k="obj" />
    <text class="rs-al k-obj" :x="jewels.cx + 14" y="118">the object moves</text>
    <text class="rs-al k-obj" :x="jewels.cx + 14" y="134">to the front →</text>
    <text class="rs-al k-obj" :x="jewels.cx + 14" y="150">new subject</text>

    <!-- Verb -->
    <Arrow :x1="stole.cx - 4" :y1="64" :x2="were.cx" :y2="226" k="be" />
    <Arrow :x1="stole.cx + 6" :y1="64" :x2="stolen.cx" :y2="226" :qx="stolen.cx - 10" :qy="120" k="pp" />
    <text class="rs-al k-be" :x="were.cx - 8" y="168" text-anchor="end">be</text>
    <text class="rs-al k-pp" :x="stolen.cx + 6" y="186">+ 3rd form</text>

    <!-- Täter -->
    <Arrow :x1="someone.cx" :y1="64" :x2="by.cx" :y2="226" :qx="someone.cx - 120" :qy="200" k="agent" dash />
    <text class="rs-al k-agent" x="16" y="160">the doer:</text>
    <text class="rs-al k-agent" x="16" y="176">often left out</text>

    <text class="rs-label" x="16" y="256">passive</text>
    <text class="rs-small" x="16" y="272">what happens to it?</text>
    <rect class="rs-band" x="152" y="226" :width="ende(passiv) + 14 - 152" height="44" rx="12" />
    <Chip v-for="c in passiv" :key="c.t" v-bind="c" :y="232" />
    <text class="rs-small" x="320" y="306" text-anchor="middle">Passive = <tspan class="rs-v">be</tspan> + <tspan font-weight="700" style="fill: var(--rs-time)">past participle</tspan></text>
  </svg>
</template>
