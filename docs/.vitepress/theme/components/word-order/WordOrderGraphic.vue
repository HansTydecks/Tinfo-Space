<script setup>
// Grafiken für das Kapitel „Word order": <WordOrderGraphic name="train" mark="p,t" caption="…" />
// Farbcode überall gleich: blau = subject, pink = verb, grün = object, orange = manner / place / time, grau = Fragewort, Konjunktion.
import Train from './grafiken/Train.vue'
import DeVsEn from './grafiken/DeVsEn.vue'
import Svo from './grafiken/Svo.vue'
import Mpt from './grafiken/Mpt.vue'
import Mid from './grafiken/Mid.vue'
import Question from './grafiken/Question.vue'
import Objects from './grafiken/Objects.vue'
import Clauses from './grafiken/Clauses.vue'
import Inversion from './grafiken/Inversion.vue'
import '../reported-speech/rs.css'
import './wo.css'

const GRAFIKEN = {
  train: Train,
  'de-vs-en': DeVsEn,
  svo: Svo,
  mpt: Mpt,
  mid: Mid,
  question: Question,
  objects: Objects,
  clauses: Clauses,
  inversion: Inversion,
}

defineProps({
  name: { type: String, required: true },
  caption: String,
  mark: { type: String, default: '' },
  minWidth: { type: Number, default: 560 },
})
</script>

<template>
  <figure class="rs-fig wo-fig">
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
  max-width: 780px;
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
