<script setup lang="ts">
defineProps<{
  fretCount: 12 | 24;
  markerCount: number;
}>();

const emit = defineEmits<{
  (e: 'set-fret-count', count: 12 | 24): void;
  (e: 'clear'): void;
}>();
</script>

<template>
  <div class="fretboard-controls">
    <div class="fret-toggle">
      <button
        :class="{ active: fretCount === 12 }"
        @click="emit('set-fret-count', 12)"
      >12 Frets</button>
      <button
        :class="{ active: fretCount === 24 }"
        @click="emit('set-fret-count', 24)"
      >24 Frets</button>
    </div>
    <button
      v-if="markerCount > 0"
      class="btn-clear"
      @click="emit('clear')"
    >Clear All ({{ markerCount }})</button>
  </div>
</template>

<style scoped>
.fretboard-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
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
}

.btn-clear:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
