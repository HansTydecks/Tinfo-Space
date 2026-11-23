<script setup>
// Ein abgeschlossenes Ereignis als Punkt (simple: als Ganzes gesehen).
defineProps({
  x: Number,
  y: Number,
  k: { type: String, default: 'zeit' },
  r: { type: Number, default: 7 },
})
</script>

<template>
  <circle :class="['te-dot', 'k-' + k]" :cx="x" :cy="y" :r="r" />
</template>
