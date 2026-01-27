<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { CombinedTabNotationContent, CombinedMeasure } from '../../types';
import { renderCombined } from '../../composables/useVexFlow';

const props = defineProps<{
  content: CombinedTabNotationContent;
}>();

const emit = defineEmits<{
  (e: 'update', content: CombinedTabNotationContent): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const editing = ref(false);

const clef = ref(props.content.clef);
const timeSignature = ref(props.content.timeSignature);
const keySignature = ref(props.content.keySignature);

// Serialize measures for editing
// Format per measure line: notes | tabPositions
// tabPositions format: string:fret string:fret, string:fret string:fret, ...
function serializeMeasures(measures: CombinedMeasure[]): string {
  return measures.map(m => {
    const tabStr = (m.tabPositions || [])
      .map(positions => positions.map(p => `${p.string}:${p.fret}`).join(' '))
      .join(', ');
    return `${m.notes} | ${tabStr}`;
  }).join('\n');
}

function parseMeasures(text: string): CombinedMeasure[] {
  console.log('parseMeasures input:', text);
  const measures = text.split('\n').filter(l => l.trim()).map(line => {
    const [notesStr, tabStr] = line.split('|').map(s => s.trim());
    const tabPositions = tabStr
      ? tabStr.split(',').map(group =>
          group.trim().split(/\s+/).map(pos => {
            const [s, f] = pos.split(':').map(Number);
            return { string: s, fret: f };
          }).filter(p => !isNaN(p.string) && !isNaN(p.fret))
        )
      : [];
    return { notes: notesStr || '', tabPositions };
  });
  console.log('parseMeasures output:', measures);
  return measures;
}

const measuresText = ref(serializeMeasures(props.content.measures || []));

// Sync props → local state only when not editing
watch(() => props.content, (c) => {
  if (!editing.value) {
    clef.value = c.clef;
    timeSignature.value = c.timeSignature;
    keySignature.value = c.keySignature;
    measuresText.value = serializeMeasures(c.measures || []);
  }
}, { deep: true });

// Build content from local state so the render always reflects current edits
const localContent = computed<CombinedTabNotationContent>(() => ({
  clef: clef.value,
  timeSignature: timeSignature.value,
  keySignature: keySignature.value,
  measures: parseMeasures(measuresText.value),
}));

function doRender() {
  if (!containerRef.value) return;
  console.log('doRender called with:', localContent.value);
  try {
    renderCombined(containerRef.value, localContent.value);
  } catch (error) {
    console.error('Error rendering combined block:', error);
  }
}

onMounted(() => {
  nextTick(doRender);
});

// Re-render whenever local content changes (covers both edits and prop syncs)
watch(localContent, () => {
  nextTick(doRender);
}, { deep: true });

// Also watch individual reactive values to ensure render updates
watch([measuresText, clef, timeSignature, keySignature], () => {
  nextTick(doRender);
});

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function handleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    emit('update', localContent.value);
  }, 800);
}
</script>

<template>
  <div class="combined-block">
    <div class="combined-toggle">
      <button :class="{ active: !editing }" @click="editing = false">View</button>
      <button :class="{ active: editing }" @click="editing = true">Edit</button>
    </div>

    <div v-if="editing" class="combined-editor">
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
          Measures (one per line): <code>notes | tab positions</code><br/>
          Notes: <code>C4/q, D4/q, E4/h</code><br/>
          Tab positions (per note, comma-separated): <code>2:1, 3:2, 4:2, 4:3</code> where <code>string:fret</code>
          <textarea
            v-model="measuresText"
            @input="handleSave"
            rows="5"
            class="measures-input"
            spellcheck="false"
            placeholder="C4/q, D4/q, E4/q, F4/q | 2:1, 3:2, 4:2, 4:3"
          ></textarea>
        </label>
      </div>
    </div>

    <div ref="containerRef" class="combined-render"></div>
  </div>
</template>

<style scoped>
.combined-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.combined-toggle button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.combined-toggle button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.combined-editor {
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.15);
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
  line-height: 1.6;
}

.small-input {
  width: 60px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 0.85rem;
  background: var(--color-surface);
  color: var(--color-text);
}

select {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 0.85rem;
  background: var(--color-surface);
  color: var(--color-text);
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
  background: var(--color-surface);
  color: var(--color-text);
}

.combined-render {
  overflow-x: auto;
}

code {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.8em;
}
</style>
