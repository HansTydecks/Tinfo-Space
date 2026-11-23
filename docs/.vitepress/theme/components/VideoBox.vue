<script setup>
// Erklärvideo als kompakter Button, der das Video groß in einem Overlay öffnet.
// <VideoBox title="…" />                                → kleiner Hinweis „Video coming soon“
// <VideoBox title="…" youtube="abc123" duration="4:26" /> → Button; YouTube (nocookie) lädt erst nach Klick
import { ref, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Video' },
  youtube: { type: String, default: '' },
  note: { type: String, default: 'Video coming soon' },
  duration: String,
})

const offen = ref(false)
const ausloeser = ref(null)
const schliessenBtn = ref(null)

function onKey(e) {
  if (e.key === 'Escape') schliessen()
}

async function oeffnen() {
  if (!props.youtube) return
  offen.value = true
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKey)
  await nextTick()
  schliessenBtn.value?.focus()
}

function schliessen() {
  if (!offen.value) return
  offen.value = false
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
  ausloeser.value?.focus()
}

onUnmounted(() => {
  if (offen.value) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKey)
  }
})
</script>

<template>
  <div class="vb">
    <button
      v-if="youtube"
      ref="ausloeser"
      type="button"
      class="vb-btn"
      :aria-label="`Play explainer video: ${title}`"
      @click="oeffnen"
    >
      <span class="vb-icon" aria-hidden="true">▶</span>
      <span><strong>Explainer video:</strong> {{ title }}</span>
      <span v-if="duration" class="vb-dauer">· {{ duration }}</span>
    </button>
    <span v-else class="vb-btn is-bald">🎬 {{ title }} – {{ note }}</span>
    <span v-if="youtube" class="vb-hint">Opens the video from YouTube.</span>

    <Teleport to="body">
      <div v-if="offen" class="vb-overlay" @click.self="schliessen">
        <div class="vb-fenster" role="dialog" aria-modal="true" :aria-label="title">
          <div class="vb-kopf">
            <strong>{{ title }}</strong>
            <button ref="schliessenBtn" type="button" class="vb-zu" aria-label="Close video" @click="schliessen">✕</button>
          </div>
          <div class="vb-frame">
            <iframe
              :src="`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0`"
              :title="title"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.vb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  margin: 14px 0 6px;
}
.vb-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 18px 7px 14px;
  border: 0;
  border-radius: 999px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font: inherit;
  font-size: 15px;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}
.vb-btn:hover {
  background: var(--vp-button-brand-hover-bg);
}
.vb-btn:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.vb-btn.is-bald {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  cursor: default;
}
.vb-icon {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  font-size: 11px;
  padding-left: 2px;
}
.vb-dauer {
  opacity: 0.8;
}
.vb-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.vb-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.75);
}
.vb-fenster {
  width: min(1100px, 100%);
  border-radius: 14px;
  overflow: hidden;
  background: var(--vp-c-bg);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}
.vb-kopf {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 18px;
  font-size: 15px;
  color: var(--vp-c-text-1);
}
.vb-zu {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  font-size: 16px;
  cursor: pointer;
}
.vb-zu:hover {
  background: var(--vp-c-default-3);
}
.vb-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
}
.vb-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
