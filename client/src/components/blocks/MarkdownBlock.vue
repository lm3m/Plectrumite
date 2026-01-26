<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { MarkdownTextContent } from '../../types';

const props = defineProps<{
  content: MarkdownTextContent;
}>();

const emit = defineEmits<{
  (e: 'update', content: MarkdownTextContent): void;
}>();

const editing = ref(!props.content.markdown);
const markdown = ref(props.content.markdown);

watch(() => props.content.markdown, (v) => { markdown.value = v; });

const rendered = computed(() => {
  const raw = marked.parse(markdown.value || '', { async: false }) as string;
  return DOMPurify.sanitize(raw);
});

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function handleInput() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    emit('update', { markdown: markdown.value });
  }, 800);
}
</script>

<template>
  <div class="markdown-block">
    <div class="md-toggle">
      <button :class="{ active: editing }" @click="editing = true">Edit</button>
      <button :class="{ active: !editing }" @click="editing = false">Preview</button>
    </div>
    <textarea
      v-if="editing"
      v-model="markdown"
      class="md-editor"
      placeholder="Write markdown here..."
      @input="handleInput"
      rows="6"
    ></textarea>
    <div
      v-else
      class="md-preview"
      v-html="rendered"
    ></div>
  </div>
</template>

<style scoped>
.md-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.md-toggle button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.md-toggle button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.md-editor {
  width: 100%;
  min-height: 120px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  resize: vertical;
  line-height: 1.5;
  outline: none;
}

.md-editor:focus {
  border-color: var(--color-primary);
}

.md-preview {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  min-height: 60px;
  line-height: 1.6;
}

.md-preview :deep(h1) { font-size: 1.4rem; margin: 8px 0; }
.md-preview :deep(h2) { font-size: 1.2rem; margin: 8px 0; }
.md-preview :deep(h3) { font-size: 1.05rem; margin: 6px 0; }
.md-preview :deep(p) { margin: 6px 0; }
.md-preview :deep(ul), .md-preview :deep(ol) { padding-left: 20px; margin: 6px 0; }
.md-preview :deep(code) {
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}
.md-preview :deep(pre) {
  background: #f1f3f5;
  padding: 12px;
  border-radius: var(--radius);
  overflow-x: auto;
}
</style>
