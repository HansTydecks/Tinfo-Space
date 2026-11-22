<script setup>
// Fortgeschritten: have something done · is said to … · It is said that …
import Chip from '../../reported-speech/parts/Chip.vue'
import { reihe } from '../../reported-speech/layout.js'

const have = reihe([{ t: 'She', k: 'n' }, { t: 'had', k: 'be' }, { t: 'her locks', k: 'obj' }, { t: 'changed', k: 'pp' }, { t: '.', k: 'n' }], 40, 6)
const said = reihe([{ t: 'He', k: 'obj' }, { t: 'is said', k: 'be' }, { t: 'to be', k: 'agent' }, { t: 'very dangerous.', k: 'n' }], 40, 6)
const it = reihe([{ t: 'It', k: 'agent' }, { t: 'is said', k: 'be' }, { t: 'that', k: 'n' }, { t: 'he is very dangerous.', k: 'n' }], 40, 6)
</script>

<template>
  <svg viewBox="0 0 640 330" role="img" aria-label="Advanced passive. have something done: A locksmith changed her locks becomes She had her locks changed – someone did it for her. Personal passive: People say that he is very dangerous becomes He is said to be very dangerous, or It is said that he is very dangerous.">
    <text class="rs-title" x="16" y="22">🛠️ have + object + past participle – someone does it for you</text>
    <text class="rs-small" x="40" y="46">A locksmith changed her locks. →</text>
    <Chip v-for="c in have" :key="c.t" v-bind="c" :y="58" />
    <text class="rs-small" x="380" y="80">✗ She was her locks changed.</text>

    <text class="rs-title" x="16" y="136">🗞️ People say / think / believe that … – two ways</text>
    <text class="rs-small" x="40" y="160">People say that he is very dangerous. →</text>
    <Chip v-for="c in said" :key="c.t" v-bind="c" :y="172" />
    <text class="rs-al k-agent" x="420" y="194">subject + is said + to …</text>
    <Chip v-for="c in it" :key="c.t" v-bind="c" :y="222" />
    <text class="rs-al k-agent" x="420" y="244">It + is said + that …</text>
    <text class="rs-small" x="40" y="300">past: He was thought to live in London. · It was believed that he lived in London.</text>
  </svg>
</template>
