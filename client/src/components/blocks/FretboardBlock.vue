<script setup lang="ts">
import type { FretboardViewContent } from '../../types';
import { toggleMarker } from '../../composables/useFretboard';
import FretboardSvg from '../fretboard/FretboardSvg.vue';
import FretboardControls from '../fretboard/FretboardControls.vue';

const props = defineProps<{
  content: FretboardViewContent;
}>();

const emit = defineEmits<{
  (e: 'update', content: FretboardViewContent): void;
}>();

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
</script>

<template>
  <div class="fretboard-block">
    <FretboardControls
      :fret-count="content.fretCount"
      :marker-count="content.markers.length"
      @set-fret-count="handleSetFretCount"
      @clear="handleClear"
    />
    <div class="fretboard-scroll">
      <FretboardSvg
        :fret-count="content.fretCount"
        :markers="content.markers"
        :tuning="content.tuning"
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
