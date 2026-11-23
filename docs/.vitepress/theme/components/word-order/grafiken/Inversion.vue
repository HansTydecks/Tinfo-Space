<script setup>
// Kapitel 7: Inversion nach Never / Not only …, So do I, Had I known.
import Satz from '../parts/Satz.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'
import { S, zug, H } from '../layout.js'

const n1 = zug(S('I:s have:v never:adv seen:v such_a_mess.:o'), 30)
const n2 = zug(S('Never:adv have:v I:s seen:v such_a_mess!:o'), 30)
const so1 = zug(S('I_like_pizza.:n'), 30)
const so2 = zug(S('So:adv do:v I.:s'), 168)
const ne1 = zug(S('I_don’t_like_spiders.:n'), 30)
const ne2 = zug(S('Neither:adv do:v I.:s'), 230)
const c1 = zug(S('If:qw I:s had:v known,:v'), 30)
const c2 = zug(S('Had:v I:s known,:v'), 330)
</script>

<template>
  <svg viewBox="0 0 680 390" role="img" aria-label="Inversion: I have never seen such a mess becomes Never have I seen such a mess – the helping verb goes before the subject, like in a question. I like pizza – So do I. I don’t like spiders – Neither do I. If I had known becomes Had I known.">
    <rect class="wo-panel" x="4" y="4" width="672" height="148" rx="10" />
    <text class="wo-h" x="18" y="24">Never, Not only, Hardly … at the start <tspan class="s">→ question order</tspan></text>
    <Satz :r="n1" :y="40" />
    <text class="wo-note" x="664" y="62" text-anchor="end">normal</text>
    <Arrow :x1="n1[2].cx" :y1="40 + H + 6" :x2="n2[0].cx + 10" :y2="106 - 6" :qx="n1[2].cx - 40" :qy="96" k="adv" />
    <Satz :r="n2" :y="106" />
    <text class="wo-note" x="664" y="128" text-anchor="end"><tspan class="b">A + S</tspan> like in a question</text>

    <rect class="wo-panel" x="4" y="162" width="672" height="122" rx="10" />
    <text class="wo-h" x="18" y="182">Me too! <tspan class="s">So / Neither + helping verb + subject</tspan></text>
    <Satz :r="so1" :y="194" />
    <Satz :r="so2" :y="194" />
    <Satz :r="ne1" :y="246" />
    <Satz :r="ne2" :y="246" />
    <text class="wo-note" x="664" y="216" text-anchor="end">= Ich auch.</text>
    <text class="wo-note" x="664" y="268" text-anchor="end">= Ich auch nicht.</text>

    <rect class="wo-panel" x="4" y="294" width="672" height="92" rx="10" />
    <text class="wo-h" x="18" y="314">Without <tspan class="s">if</tspan> <tspan class="s">(formal)</tspan></text>
    <Satz :r="c1" :y="330" />
    <text class="wo-note" x="300" y="352" text-anchor="middle">=</text>
    <Satz :r="c2" :y="330" />
  </svg>
</template>
