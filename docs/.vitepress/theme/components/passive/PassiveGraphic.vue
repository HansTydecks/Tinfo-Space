<script setup>
// Grafiken für die Seite „Passive voice": <PassiveGraphic name="overview" caption="…" />
// Farbcode überall gleich: blau = Objekt → Subjekt, pink = be, grün = past participle, orange = by-agent / Satzbau.
import Overview from './grafiken/Overview.vue'
import Formula from './grafiken/Formula.vue'
import When from './grafiken/When.vue'
import Tenses from './grafiken/Tenses.vue'
import Modals from './grafiken/Modals.vue'
import ByAgent from './grafiken/ByAgent.vue'
import Questions from './grafiken/Questions.vue'
import TwoObjects from './grafiken/TwoObjects.vue'
import HaveDone from './grafiken/HaveDone.vue'
import Got from './grafiken/Got.vue'
import '../reported-speech/rs.css'
import './pv.css'

const GRAFIKEN = {
  overview: Overview,
  formula: Formula,
  when: When,
  tenses: Tenses,
  modals: Modals,
  'by-agent': ByAgent,
  questions: Questions,
  'two-objects': TwoObjects,
  'have-done': HaveDone,
  got: Got,
}

defineProps({
  name: { type: String, required: true },
  caption: String,
  minWidth: { type: Number, default: 520 },
})
</script>

<template>
  <figure class="rs-fig">
    <div class="rs-scroll">
      <component :is="GRAFIKEN[name]" :style="{ minWidth: minWidth + 'px' }" />
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.rs-fig {
  margin: 20px 0;
  padding: 14px 14px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.rs-scroll {
  overflow-x: auto;
}
.rs-scroll :deep(svg) {
  display: block;
  width: 100%;
  max-width: 760px;
  height: auto;
  margin: 0 auto;
}
figcaption {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>
