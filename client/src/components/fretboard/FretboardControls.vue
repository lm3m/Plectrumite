<script setup lang="ts">
import { NOTES, SCALES } from '../../composables/useFretboard';

const props = defineProps<{
  fretCount: 12 | 24;
  markerCount: number;
  scaleRoot: string;
  scaleKey: string;
  scaleLabelMode: 'note' | 'degree';
}>();

const emit = defineEmits<{
  (e: 'set-fret-count', count: 12 | 24): void;
  (e: 'clear'): void;
  (e: 'set-scale', root: string, scaleKey: string): void;
  (e: 'set-scale-label-mode', mode: 'note' | 'degree'): void;
}>();
</script>

<template>
  <div class="fretboard-controls">
    <div class="top-row">
      <div class="fret-toggle">
        <button
          :class="{ active: fretCount === 12 }"
          @click="emit('set-fret-count', 12)"
        >
          12 Frets
        </button>
        <button
          :class="{ active: fretCount === 24 }"
          @click="emit('set-fret-count', 24)"
        >
          24 Frets
        </button>
      </div>
      <button
        v-if="markerCount > 0"
        class="btn-clear"
        @click="emit('clear')"
      >
        Clear All ({{ markerCount }})
      </button>
    </div>

    <div class="scale-row">
      <span class="scale-label-text">Scale overlay:</span>
      <select
        class="scale-select"
        :value="scaleRoot"
        aria-label="Root note"
        @change="emit('set-scale', ($event.target as HTMLSelectElement).value, props.scaleKey)"
      >
        <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
      </select>
      <select
        class="scale-select"
        :value="scaleKey"
        aria-label="Scale type"
        @change="emit('set-scale', props.scaleRoot, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">— None —</option>
        <option v-for="(def, key) in SCALES" :key="key" :value="key">{{ def.label }}</option>
      </select>
      <template v-if="scaleKey">
        <button
          class="label-mode-btn"
          :class="{ active: scaleLabelMode === 'note' }"
          title="Show note names"
          @click="emit('set-scale-label-mode', 'note')"
        >
          Note
        </button>
        <button
          class="label-mode-btn"
          :class="{ active: scaleLabelMode === 'degree' }"
          title="Show scale degrees"
          @click="emit('set-scale-label-mode', 'degree')"
        >
          Degree
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.fretboard-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fret-toggle {
  display: flex;
  gap: 4px;
}

.fret-toggle button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
  cursor: pointer;
}

.fret-toggle button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-clear {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
  cursor: pointer;
}

.btn-clear:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.scale-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.scale-label-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.scale-select {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.8rem;
  padding: 3px 8px;
  cursor: pointer;
}

.label-mode-btn {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.label-mode-btn:hover:not(.active) {
  background: var(--color-border);
}

.label-mode-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
</style>
