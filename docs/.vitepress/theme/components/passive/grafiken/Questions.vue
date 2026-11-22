<script setup>
// Fragen und Verneinung im Passiv: kein do / does / did – be springt nach vorn bzw. bekommt not.
import Chip from '../../reported-speech/parts/Chip.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'
</script>

<template>
  <svg viewBox="0 0 640 430" role="img" aria-label="Questions and negatives in the passive. Did they find the bag? becomes: Was the bag found? – did disappears and be comes to the front. Where did they hide the money? becomes: Where was the money hidden? They didn’t lock the door. becomes: The door wasn’t locked. – be plus not.">
    <!-- yes / no -->
    <text class="rs-title" x="16" y="20">yes / no question</text>
    <text class="rs-label" x="16" y="53">active</text>
    <rect class="rs-band" x="150" y="26" width="320" height="44" rx="12" />
    <Chip t="Did" k="slot" :cx="190" :y="32" strike />
    <Chip t="they" k="agent" :cx="246" :y="32" strike />
    <Chip t="find" k="be" :cx="300" :y="32" />
    <Chip t="the bag" k="obj" :cx="376" :y="32" />
    <Chip t="?" :cx="446" :y="32" />

    <Arrow :x1="300" :y1="68" :x2="190" :y2="122" k="be" />
    <Arrow :x1="300" :y1="68" :x2="356" :y2="122" k="pp" />
    <Arrow :x1="376" :y1="68" :x2="262" :y2="122" k="obj" />
    <text class="rs-al k-grau" x="140" y="100" text-anchor="end">no did!</text>
    <text class="rs-al k-be" x="404" y="100">be comes first</text>

    <text class="rs-label" x="16" y="149">passive</text>
    <rect class="rs-band" x="150" y="122" width="320" height="44" rx="12" />
    <Chip t="Was" k="be" :cx="190" :y="128" />
    <Chip t="the bag" k="obj" :cx="262" :y="128" />
    <Chip t="found" k="pp" :cx="356" :y="128" />
    <Chip t="?" :cx="446" :y="128" />

    <!-- wh -->
    <text class="rs-title" x="16" y="206">wh-question</text>
    <text class="rs-label" x="16" y="239">passive</text>
    <rect class="rs-band" x="150" y="212" width="360" height="44" rx="12" />
    <Chip t="Where" k="n" :cx="194" :y="218" />
    <Chip t="was" k="be" :cx="248" :y="218" />
    <Chip t="the money" k="obj" :cx="326" :y="218" />
    <Chip t="hidden" k="pp" :cx="418" :y="218" />
    <Chip t="?" :cx="482" :y="218" />
    <text class="rs-small" x="150" y="276">(active: Where did they hide the money?)</text>

    <!-- negative -->
    <text class="rs-title" x="16" y="316">negative</text>
    <text class="rs-label" x="16" y="349">active</text>
    <text x="150" y="349" font-size="15">They <tspan font-weight="700" style="fill: var(--rs-grau); text-decoration: line-through">didn’t</tspan> lock the door.</text>
    <text class="rs-label" x="16" y="397">passive</text>
    <rect class="rs-band" x="150" y="370" width="300" height="44" rx="12" />
    <Chip t="The door" k="obj" :cx="208" :y="376" />
    <Chip t="wasn’t" k="be" :cx="290" :y="376" />
    <Chip t="locked" k="pp" :cx="364" :y="376" />
    <Chip t="." :cx="428" :y="376" />
    <text class="rs-al k-be" x="470" y="398">be + not</text>
  </svg>
</template>
