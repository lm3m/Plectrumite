<script setup lang="ts">
import { ref, watch } from 'vue';
import type { GuitarTabContent } from '../../types';

const props = defineProps<{
  content: GuitarTabContent;
}>();

const emit = defineEmits<{
  (e: 'update', content: GuitarTabContent): void;
}>();

const editing = ref(!props.content.text || props.content.text === defaultTab());
const text = ref(props.content.text);

watch(() => props.content.text, (v) => { text.value = v; });

function defaultTab(): string {
  return 'e|------|\nB|------|\nG|------|\nD|------|\nA|------|\nE|------|';
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function handleInput() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    emit('update', { ...props.content, text: text.value });
  }, 800);
}
</script>

<template>
  <div class="tab-block">
    <div class="tab-toggle">
      <button :class="{ active: editing }" @click="editing = true">Edit</button>
      <button :class="{ active: !editing }" @click="editing = false">View</button>
    </div>
    <textarea
      v-if="editing"
      v-model="text"
      class="tab-editor"
      rows="8"
      spellcheck="false"
      @input="handleInput"
    ></textarea>
    <pre v-else class="tab-view">{{ text }}</pre>
  </div>
</template>

<style scoped>
.tab-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.tab-toggle button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.tab-toggle button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.tab-editor {
  width: 100%;
  min-height: 140px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.4;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  resize: vertical;
  white-space: pre;
  overflow-x: auto;
  outline: none;
  tab-size: 4;
}

.tab-editor:focus {
  border-color: var(--color-primary);
}

.tab-view {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.4;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  background: #fafbfc;
  overflow-x: auto;
  margin: 0;
}
</style>
