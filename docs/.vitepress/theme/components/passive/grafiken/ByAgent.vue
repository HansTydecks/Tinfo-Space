<script setup>
// by-agent: nennen, wenn wichtig – weglassen bei someone, they, people …
import Chip from '../../reported-speech/parts/Chip.vue'
import { reihe } from '../../reported-speech/layout.js'

const keep1 = reihe([{ t: 'The window', k: 'obj' }, { t: 'was broken', k: 'be' }, { t: 'by a tall man', k: 'agent' }, { t: '.', k: 'n' }], 30, 6)
const keep2 = reihe([{ t: 'The thief', k: 'obj' }, { t: 'was filmed', k: 'be' }, { t: 'by a camera', k: 'agent' }, { t: '.', k: 'n' }], 30, 6)
const drop1 = reihe([{ t: 'My bike', k: 'obj' }, { t: 'was stolen', k: 'be' }, { t: 'by someone', k: 'agent', strike: true }, { t: '.', k: 'n' }], 30, 6)
const drop2 = reihe([{ t: 'English', k: 'obj' }, { t: 'is spoken', k: 'be' }, { t: 'by people', k: 'agent', strike: true }, { t: 'here.', k: 'n' }], 30, 6)
const weg = reihe(['someone', 'somebody', 'they', 'people', 'you', 'we'].map((t) => ({ t, k: 'agent', strike: true })), 130, 8)
</script>

<template>
  <svg viewBox="0 0 640 380" role="img" aria-label="The by-agent. Keep by when it is important who did it: The window was broken by a tall man. The thief was filmed by a camera. Leave it out when the doer is someone, somebody, they, people, you or we: My bike was stolen. English is spoken here. After by use object pronouns: by him, by her, by them.">
    <text class="rs-title" x="16" y="22">✓ keep “by …” – it is important who did it</text>
    <Chip v-for="c in keep1" :key="c.t" v-bind="c" :y="36" />
    <Chip v-for="c in keep2" :key="c.t" v-bind="c" :y="80" />

    <text class="rs-title" x="16" y="150">✗ leave it out – the doer is unknown or not important</text>
    <Chip v-for="c in drop1" :key="c.t" v-bind="c" :y="164" />
    <Chip v-for="c in drop2" :key="c.t" v-bind="c" :y="208" />
    <text class="rs-small" x="16" y="272">leave out by …</text>
    <Chip v-for="c in weg" :key="c.t" v-bind="c" :y="254" :h="28" />

    <rect x="16" y="310" width="608" height="54" rx="10" class="rs-band" />
    <text class="rs-al k-agent" x="32" y="342">by + object pronoun:</text>
    <text x="190" y="342" font-size="15">by <tspan font-weight="700">him</tspan> · by <tspan font-weight="700">her</tspan> · by <tspan font-weight="700">them</tspan> · by <tspan font-weight="700">us</tspan>   (✗ by he, ✗ by they)</text>
  </svg>
</template>
