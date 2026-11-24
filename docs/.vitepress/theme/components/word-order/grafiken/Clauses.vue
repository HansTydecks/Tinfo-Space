<script setup>
// Kapitel 6: Nebensatz = S – V wie im Hauptsatz; indirekte Fragen ohne Frage-Wortstellung.
import Satz from '../parts/Satz.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'
import { S, zug, H } from '../layout.js'

const de = zug(S('…_weil:qw ich:s müde:n war.:v'), 64)
const en = zug(S('…_because:qw I:s was:v tired.:n'), 64)
const q = zug(S('Where:qw is:v the_station?:s'), 64)
const iq = zug(S('Can_you_tell_me:n where:qw the_station:s is?:v'), 64)
</script>

<template>
  <svg viewBox="0 0 680 330" role="img" aria-label="German: weil ich müde war – the verb goes to the end. English: because I was tired – subject and verb stay together like in a main clause. Indirect questions: Where is the station? becomes Can you tell me where the station is? – normal word order, subject before verb.">
    <rect class="wo-panel" x="4" y="4" width="672" height="140" rx="10" />
    <text class="wo-h" x="18" y="24">because, when, if, that … <tspan class="s">– no verb at the end!</tspan></text>
    <Satz :r="de" :y="44" tag="DE" />
    <text class="wo-note" x="664" y="66" text-anchor="end">verb <tspan class="b">at the end</tspan></text>
    <Satz :r="en" :y="96" tag="EN" />
    <text class="wo-note" x="664" y="118" text-anchor="end"><tspan class="b">S – V</tspan> like a main clause</text>

    <rect class="wo-panel" x="4" y="154" width="672" height="172" rx="10" />
    <text class="wo-h" x="18" y="174">Indirect questions <tspan class="s">– no question order</tspan></text>
    <Satz :r="q" :y="194" />
    <text class="wo-note" x="664" y="216" text-anchor="end">direct question</text>
    <Arrow :x1="q[1].cx" :y1="194 + H + 6" :x2="iq[3].cx" :y2="272 - 6" :qx="iq[3].cx - 20" :qy="232" k="v" />
    <Satz :r="iq" :y="272" />
    <text class="wo-note" x="664" y="320" text-anchor="end">the verb goes <tspan class="b">after the subject</tspan></text>
  </svg>
</template>
