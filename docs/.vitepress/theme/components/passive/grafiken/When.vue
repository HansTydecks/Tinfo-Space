<script setup>
// Wann benutzt man das Passiv?
import Box from '../../reported-speech/parts/Box.vue'

const boxen = [
  { cx: 165, y: 14, k: 'obj', lines: ['🤷 The doer is unknown', 'My bike was stolen.', '(We don’t know who did it.)'] },
  { cx: 475, y: 14, k: 'be', lines: ['👮 The doer is obvious', 'The thief was arrested.', '(by the police – of course!)'] },
  { cx: 165, y: 130, k: 'pp', lines: ['📰 The action is more important', 'The bank was robbed at 9 am.', 'news, police reports'] },
  { cx: 475, y: 130, k: 'agent', lines: ['🧪 Processes and facts', 'Fingerprints are checked first.', 'science, instructions, history'] },
]
</script>

<template>
  <svg viewBox="0 0 640 236" role="img" aria-label="When to use the passive: when the doer is unknown – My bike was stolen. When the doer is obvious – The thief was arrested. When the action is more important than the doer, for example in news and police reports – The bank was robbed at 9 am. For processes and facts in science, instructions and history – Fingerprints are checked first.">
    <Box v-for="b in boxen" :key="b.lines[0]" v-bind="b" :w="296" :h="100" />
  </svg>
</template>
