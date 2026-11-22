<script setup>
// Die Form: be (in der passenden Zeitform) + past participle (3. Form)
import Chip from '../../reported-speech/parts/Chip.vue'

const beFormen = ['am · is · are', 'was · were', 'has been · have been', 'will be · can be']
const regel = ['opened', 'checked', 'arrested']
const unregel = [
  ['steal', 'stole', 'stolen'], ['break', 'broke', 'broken'], ['take', 'took', 'taken'],
  ['write', 'wrote', 'written'], ['find', 'found', 'found'], ['see', 'saw', 'seen'],
]
</script>

<template>
  <svg viewBox="0 0 640 400" role="img" aria-label="The passive form: be in the right tense plus the past participle, the third form. Forms of be: am, is, are, was, were, has been, will be. Regular verbs: opened, checked, arrested. Irregular verbs: steal stole stolen, break broke broken, take took taken, write wrote written, find found found, see saw seen. Wrong: were stole, was lock. Right: were stolen, was locked.">
    <Chip t="be" k="be" :x="150" :y="18" :w="110" :h="40" />
    <text class="rs-big" x="282" y="46">+</text>
    <Chip t="past participle" k="pp" :x="312" :y="18" :w="180" :h="40" />
    <text class="rs-small" x="205" y="76" text-anchor="middle">shows the tense</text>
    <text class="rs-small" x="402" y="76" text-anchor="middle">3rd form – never changes</text>

    <!-- be -->
    <text class="rs-title" x="20" y="116">forms of be</text>
    <Chip v-for="(b, i) in beFormen" :key="b" :t="b" k="be" :x="20" :y="128 + i * 42" :w="200" />

    <!-- participles -->
    <text class="rs-title" x="250" y="116">regular: + ed</text>
    <Chip v-for="(r, i) in regel" :key="r" :t="r" k="pp" :x="250" :y="128 + i * 42" :w="104" />

    <text class="rs-title" x="380" y="116">irregular: learn the 3rd form!</text>
    <g v-for="(v, i) in unregel" :key="v[0]">
      <text class="rs-small" :x="380" :y="140 + i * 34">{{ v[0] }} – {{ v[1] }} –</text>
      <Chip :t="v[2]" k="pp" :x="500" :y="122 + i * 34" :h="28" :w="90" />
    </g>

    <rect x="20" y="336" width="600" height="50" rx="10" class="rs-band" style="stroke: var(--rs-tense); stroke-dasharray: 4 3" />
    <text class="rs-al k-be" x="36" y="366">✗ The jewels were stole.</text>
    <text class="rs-al k-be" x="236" y="366">✗ The door was lock.</text>
    <text class="rs-al k-pp" x="436" y="366">✓ were stolen · was locked</text>
  </svg>
</template>
