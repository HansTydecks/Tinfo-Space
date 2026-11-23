<script setup>
// Alle Formen auf einem Zeitstrahl, in Bahnen: present · past · future.
// Bezugspunkte: THEN (Vergangenheit), NOW, LATER (Zukunft).
import Achse from '../parts/Achse.vue'
import Bezug from '../parts/Bezug.vue'
import Punkt from '../parts/Punkt.vue'
import Welle from '../parts/Welle.vue'
import Arrow from '../../reported-speech/parts/Arrow.vue'

const THEN = 330
const NOW = 465
const LATER = 585
const LANE = 24

// Bahnen: [Name, Beispiel-Teile, Zeichnung]
const GRUPPEN = [
  {
    t: 'present', k: 'zeit',
    bahnen: [
      ['simple', [['works', 'zeit']], 'p-simple'],
      ['progressive', [['is working', 'prog']], 'p-prog'],
      ['perfect', [['has worked', 'perf']], 'p-perf'],
      ['perfect progr.', [['has ', 'perf'], ['been working', 'prog']], 'p-pp'],
    ],
  },
  {
    t: 'past', k: 'zeit',
    bahnen: [
      ['simple', [['worked', 'zeit']], 'v-simple'],
      ['progressive', [['was working', 'prog']], 'v-prog'],
      ['perfect', [['had worked', 'perf']], 'v-perf'],
      ['perfect progr.', [['had ', 'perf'], ['been working', 'prog']], 'v-pp'],
    ],
  },
  {
    t: 'future', k: 'fut',
    bahnen: [
      ['will-future', [['will ', 'fut'], ['work', 'zeit']], 'f-will'],
      ['going to', [['is going to ', 'fut'], ['work', 'zeit']], 'f-going'],
      ['future progr.', [['will ', 'fut'], ['be working', 'prog']], 'f-prog'],
      ['future perfect', [['will ', 'fut'], ['have worked', 'perf']], 'f-perf'],
    ],
  },
]

// y-Positionen ausrechnen
let y = 40
const zeilen = []
for (const g of GRUPPEN) {
  zeilen.push({ typ: 'kopf', g, y })
  y += 22
  g.bahnen.forEach((b, i) => {
    zeilen.push({ typ: 'bahn', b, y, alt: i % 2 === 1 })
    y += LANE
  })
  y += 8
}
const UNTEN = y + 4
const HOEHE = UNTEN + 46
const mitte = (z) => z.y + LANE / 2
</script>

<template>
  <svg :viewBox="`0 0 640 ${HOEHE}`" role="img" aria-label="All forms on one timeline. Present: works happens again and again, is working is going on around now, has worked happened before now and is linked to now, has been working started before now and goes on until now. Past: worked happened at a time in the past, was working was going on around a time then, had worked happened before then, had been working went on until then. Future: will work and is going to work happen later, will be working is going on around a later time, will have worked is finished before a later time.">
    <!-- Bahnen -->
    <template v-for="(z, i) in zeilen" :key="i">
      <g v-if="z.typ === 'kopf'" :class="'k-' + z.g.k">
        <text class="te-head" x="14" :y="z.y + 15" font-size="12" letter-spacing="0.08em">{{ z.g.t.toUpperCase() }}</text>
      </g>
      <g v-else>
        <rect class="te-lane" :class="{ alt: z.alt }" x="8" :y="z.y" width="624" :height="LANE" rx="5" />
        <text class="rs-small" x="16" :y="mitte(z)" dy="0.35em">{{ z.b[0] }}</text>
        <text x="104" :y="mitte(z)" dy="0.35em" font-size="13">
          <tspan v-for="(teil, j) in z.b[1]" :key="j" :class="['te-c', 'k-' + teil[1]]">{{ teil[0] }}</tspan>
        </text>
      </g>
    </template>

    <!-- Bezugspunkte -->
    <Bezug :x="THEN" :y1="36" :y2="UNTEN" t="THEN" k="zeit" />
    <Bezug :x="NOW" :y1="36" :y2="UNTEN" t="NOW" />
    <Bezug :x="LATER" :y1="36" :y2="UNTEN" t="LATER" k="fut" />

    <!-- Zeichnungen -->
    <template v-for="(z, i) in zeilen" :key="'d' + i">
      <template v-if="z.typ === 'bahn'">
        <template v-if="z.b[2] === 'p-simple'">
          <Punkt v-for="x in [262, 326, 394, 465, 530, 598]" :key="x" :x="x" :y="mitte(z)" k="zeit" :r="4.5" />
        </template>
        <Welle v-else-if="z.b[2] === 'p-prog'" :x1="NOW - 36" :x2="NOW + 36" :y="mitte(z)" />
        <template v-else-if="z.b[2] === 'p-perf'">
          <Punkt :x="392" :y="mitte(z)" k="perf" :r="6" />
          <Arrow :x1="398" :y1="mitte(z)" :x2="NOW - 3" :y2="mitte(z)" k="perf" />
        </template>
        <Welle v-else-if="z.b[2] === 'p-pp'" :x1="392" :x2="NOW" :y="mitte(z)" pfeil />

        <Punkt v-else-if="z.b[2] === 'v-simple'" :x="395" :y="mitte(z)" k="zeit" :r="6" />
        <Welle v-else-if="z.b[2] === 'v-prog'" :x1="THEN - 36" :x2="THEN + 36" :y="mitte(z)" />
        <template v-else-if="z.b[2] === 'v-perf'">
          <Punkt :x="262" :y="mitte(z)" k="perf" :r="6" />
          <Arrow :x1="268" :y1="mitte(z)" :x2="THEN - 3" :y2="mitte(z)" k="perf" />
        </template>
        <Welle v-else-if="z.b[2] === 'v-pp'" :x1="258" :x2="THEN" :y="mitte(z)" pfeil />

        <Punkt v-else-if="z.b[2] === 'f-will'" :x="540" :y="mitte(z)" k="fut" :r="6" />
        <template v-else-if="z.b[2] === 'f-going'">
          <Arrow :x1="NOW + 4" :y1="mitte(z)" :x2="532" :y2="mitte(z)" k="fut" dash />
          <Punkt :x="540" :y="mitte(z)" k="fut" :r="6" />
        </template>
        <Welle v-else-if="z.b[2] === 'f-prog'" :x1="LATER - 36" :x2="LATER + 36" :y="mitte(z)" />
        <template v-else-if="z.b[2] === 'f-perf'">
          <Punkt :x="515" :y="mitte(z)" k="perf" :r="6" />
          <Arrow :x1="521" :y1="mitte(z)" :x2="LATER - 3" :y2="mitte(z)" k="perf" />
        </template>
      </template>
    </template>

    <Achse :x1="240" :x2="632" :y="UNTEN" />
    <text class="te-sub2" x="16" :y="UNTEN + 38">● whole action · 〰 in progress · → linked to a later point</text>
  </svg>
</template>
