<script setup>
// Grafiken für das Kapitel „Tense & aspect": <TenseGraphic name="grid" mark="present-perfect" caption="…" />
// Farbcode überall gleich: blau = tense (present/past), pink = progressive, grün = perfect, orange = future.
import Grid from './grafiken/Grid.vue'
import Aspects from './grafiken/Aspects.vue'
import Timeline from './grafiken/Timeline.vue'
import PresentContrast from './grafiken/PresentContrast.vue'
import PastSimple from './grafiken/PastSimple.vue'
import PerfectVsPast from './grafiken/PerfectVsPast.vue'
import PastProgressive from './grafiken/PastProgressive.vue'
import PastPerfect from './grafiken/PastPerfect.vue'
import PerfectProgressive from './grafiken/PerfectProgressive.vue'
import FutureWays from './grafiken/FutureWays.vue'
import FutureAspect from './grafiken/FutureAspect.vue'
import '../reported-speech/rs.css'
import './te.css'

const GRAFIKEN = {
  grid: Grid,
  aspects: Aspects,
  timeline: Timeline,
  present: PresentContrast,
  past: PastSimple,
  'perfect-vs-past': PerfectVsPast,
  'past-progressive': PastProgressive,
  'past-perfect': PastPerfect,
  'perfect-progressive': PerfectProgressive,
  'future-ways': FutureWays,
  'future-aspect': FutureAspect,
}

defineProps({
  name: { type: String, required: true },
  caption: String,
  mark: { type: String, default: '' },
  minWidth: { type: Number, default: 520 },
})
</script>

<template>
  <figure class="rs-fig te-fig">
    <div class="rs-scroll">
      <component :is="GRAFIKEN[name]" :mark="mark" :style="{ minWidth: minWidth + 'px' }" />
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
