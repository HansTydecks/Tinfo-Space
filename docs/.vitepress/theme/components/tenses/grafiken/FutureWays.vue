<script setup>
// Vier Wege, über die Zukunft zu sprechen – je eine Karte mit Wann-benutze-ich-das und Beispiel.
const KARTEN = [
  {
    x: 8, y: 8, emoji: '🔮', t: 'will', when: 'prediction · decision now · promise',
    ex: [[['It ', ''], ['will rain', 'fut'], [' tomorrow.', '']], [['Wait, I', ''], ['’ll help', 'fut'], [' you!', '']]],
  },
  {
    x: 326, y: 8, emoji: '📋', t: 'going to', when: 'plan · you can see it coming',
    ex: [[['I', ''], ['’m going to visit', 'fut'], [' Grandma.', '']], [['Look! It', ''], ['’s going to rain', 'fut'], ['.', '']]],
  },
  {
    x: 8, y: 150, emoji: '📅', t: 'present progressive', when: 'fixed arrangement – it’s in my diary',
    ex: [[['I', ''], ['’m meeting', 'prog'], [' Tom at 4 tomorrow.', '']], [['We', ''], ['’re flying', 'prog'], [' to Rome on Friday.', '']]],
  },
  {
    x: 326, y: 150, emoji: '🚆', t: 'simple present', when: 'timetable · fixed programme',
    ex: [[['The train ', ''], ['leaves', 'zeit'], [' at 8:15.', '']], [['The film ', ''], ['starts', 'zeit'], [' at 7 pm.', '']]],
  },
]
const kopfK = ['fut', 'fut', 'prog', 'zeit']
</script>

<template>
  <svg viewBox="0 0 640 292" role="img" aria-label="Four ways to talk about the future. Will: predictions, decisions you make now, promises – It will rain tomorrow. Wait, I'll help you! Going to: plans, or you can see it coming – I'm going to visit Grandma. Look! It's going to rain. Present progressive: fixed arrangements, it's in your diary – I'm meeting Tom at 4 tomorrow. Simple present: timetables – The train leaves at 8:15.">
    <g v-for="(c, i) in KARTEN" :key="c.t">
      <rect class="te-card" :class="'k-' + kopfK[i]" :x="c.x" :y="c.y" width="306" height="134" rx="12" />
      <text class="te-emoji" :x="c.x + 14" :y="c.y + 30" font-size="22">{{ c.emoji }}</text>
      <text class="te-head" :class="'k-' + kopfK[i]" :x="c.x + 50" :y="c.y + 26" font-size="15">{{ c.t }}</text>
      <text class="te-sub2" :x="c.x + 50" :y="c.y + 43">{{ c.when }}</text>
      <text v-for="(zeile, j) in c.ex" :key="j" :x="c.x + 16" :y="c.y + 82 + j * 26" font-size="14">
        <tspan v-for="(teil, k) in zeile" :key="k" :class="teil[1] ? ['te-c', 'k-' + teil[1]] : ''">{{ teil[0] }}</tspan>
      </text>
    </g>
  </svg>
</template>
