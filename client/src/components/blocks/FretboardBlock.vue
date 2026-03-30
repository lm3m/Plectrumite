<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FretboardViewContent } from '../../types';
import { toggleMarker, computeScaleOverlay } from '../../composables/useFretboard';
import FretboardSvg from '../fretboard/FretboardSvg.vue';
import FretboardControls from '../fretboard/FretboardControls.vue';

const props = defineProps<{
  content: FretboardViewContent;
}>();

const emit = defineEmits<{
  (e: 'update', content: FretboardViewContent): void;
}>();

const scaleRoot = ref('A');
const scaleKey = ref('');
const scaleLabelMode = ref<'note' | 'degree'>('note');

const scaleOverlay = computed(() =>
  scaleKey.value
    ? computeScaleOverlay(scaleRoot.value, scaleKey.value, props.content.fretCount, props.content.tuning)
    : []
);

function handleToggleMarker(string: number, fret: number) {
  const markers = toggleMarker(props.content.markers, string, fret);
  emit('update', { ...props.content, markers });
}

function handleSetFretCount(count: 12 | 24) {
  // Filter out markers beyond the new fret count
  const markers = props.content.markers.filter(m => m.fret <= count);
  emit('update', { ...props.content, fretCount: count, markers });
}

function handleClear() {
  emit('update', { ...props.content, markers: [] });
}

function handleSetScale(root: string, key: string) {
  scaleRoot.value = root;
  scaleKey.value = key;
}

function handleSetScaleLabelMode(mode: 'note' | 'degree') {
  scaleLabelMode.value = mode;
}
</script>

<template>
  <div class="fretboard-block">
    <FretboardControls
      :fret-count="content.fretCount"
      :marker-count="content.markers.length"
      :scale-root="scaleRoot"
      :scale-key="scaleKey"
      :scale-label-mode="scaleLabelMode"
      @set-fret-count="handleSetFretCount"
      @clear="handleClear"
      @set-scale="handleSetScale"
      @set-scale-label-mode="handleSetScaleLabelMode"
    />
    <div class="fretboard-scroll">
      <FretboardSvg
        :fret-count="content.fretCount"
        :markers="content.markers"
        :tuning="content.tuning"
        :scale-overlay="scaleOverlay"
        :scale-label-mode="scaleLabelMode"
        @toggle-marker="handleToggleMarker"
      />
    </div>
    <p class="fretboard-hint">Click on the fretboard to add or remove note markers</p>
  </div>
</template>

<style scoped>
.fretboard-block {
  width: 100%;
}

.fretboard-scroll {
  overflow-x: auto;
  padding: 4px 0;
}

.fretboard-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 8px;
  font-style: italic;
}
</style>
