<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { MusicalNotationContent, NotationMeasure } from '../../types';
import { renderNotation } from '../../composables/useVexFlow';

const props = defineProps<{
  content: MusicalNotationContent;
}>();

const emit = defineEmits<{
  (e: 'update', content: MusicalNotationContent): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const editing = ref(false);

// Editable fields
const clef = ref(props.content.clef);
const timeSignature = ref(props.content.timeSignature);
const keySignature = ref(props.content.keySignature);
const measuresText = ref(
  props.content.measures.map(m => m.notes).join('\n')
);

// Sync props → local state only when not editing
watch(() => props.content, (c) => {
  if (!editing.value) {
    clef.value = c.clef;
    timeSignature.value = c.timeSignature;
    keySignature.value = c.keySignature;
    measuresText.value = c.measures.map(m => m.notes).join('\n');
  }
}, { deep: true });

// Build content from local state so the render always reflects current edits
const localContent = computed<MusicalNotationContent>(() => {
  const measures: NotationMeasure[] = measuresText.value
    .split('\n')
    .filter(line => line.trim())
    .map(line => ({ notes: line.trim() }));
  return {
    clef: clef.value,
    timeSignature: timeSignature.value,
    keySignature: keySignature.value,
    measures,
  };
});

function doRender() {
  if (!containerRef.value) return;
  renderNotation(containerRef.value, localContent.value);
}

onMounted(() => {
  nextTick(doRender);
});

// Re-render whenever local content changes (covers both edits and prop syncs)
watch(localContent, () => {
  nextTick(doRender);
}, { deep: true });

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function handleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    emit('update', localContent.value);
  }, 800);
}
</script>

<template>
  <div class="notation-block">
    <div class="notation-toggle">
      <button :class="{ active: !editing }" @click="editing = false">View</button>
      <button :class="{ active: editing }" @click="editing = true">Edit</button>
    </div>

    <div v-if="editing" class="notation-editor">
      <div class="editor-row">
        <label>
          Clef:
          <select v-model="clef" @change="handleSave">
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </label>
        <label>
          Time:
          <input v-model="timeSignature" @input="handleSave" placeholder="4/4" class="small-input" />
        </label>
        <label>
          Key:
          <input v-model="keySignature" @input="handleSave" placeholder="C" class="small-input" />
        </label>
      </div>
      <div class="editor-row">
        <label class="full-width">
          Measures (one per line, VexFlow format: e.g. <code>C4/q, D4/q, E4/h</code>):
          <textarea
            v-model="measuresText"
            @input="handleSave"
            rows="4"
            class="measures-input"
            spellcheck="false"
            placeholder="C4/q, D4/q, E4/q, F4/q"
          ></textarea>
        </label>
      </div>
    </div>

    <div ref="containerRef" class="notation-render"></div>
  </div>
</template>

<style scoped>
.notation-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.notation-toggle button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.notation-toggle button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.notation-editor {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
}

.editor-row {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.editor-row label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.editor-row label.full-width {
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
}

.small-input {
  width: 60px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 0.85rem;
}

select {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 0.85rem;
}

.measures-input {
  width: 100%;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 8px;
  resize: vertical;
  margin-top: 4px;
}

.notation-render {
  overflow-x: auto;
}

code {
  background: #e9ecef;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.8em;
}
</style>
