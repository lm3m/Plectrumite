<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
}>();

const emit = defineEmits<{
  (e: 'update:title', value: string): void;
  (e: 'update:description', value: string): void;
  (e: 'delete'): void;
}>();

const editingTitle = ref(false);
const editingDesc = ref(false);
const titleInput = ref(props.title);
const descInput = ref(props.description);

watch(() => props.title, (v) => { titleInput.value = v; });
watch(() => props.description, (v) => { descInput.value = v; });

function saveTitle() {
  editingTitle.value = false;
  if (titleInput.value !== props.title) {
    emit('update:title', titleInput.value);
  }
}

function saveDesc() {
  editingDesc.value = false;
  if (descInput.value !== props.description) {
    emit('update:description', descInput.value);
  }
}
</script>

<template>
  <div class="doc-header">
    <div class="title-row">
      <input
        v-if="editingTitle"
        v-model="titleInput"
        class="title-input"
        @blur="saveTitle"
        @keydown.enter="saveTitle"
        ref="titleRef"
        autofocus
      />
      <h1 v-else class="title" @click="editingTitle = true">{{ title }}</h1>
      <button class="btn-delete" @click="$emit('delete')">Delete</button>
    </div>
    <div class="desc-row">
      <input
        v-if="editingDesc"
        v-model="descInput"
        class="desc-input"
        placeholder="Add a description..."
        @blur="saveDesc"
        @keydown.enter="saveDesc"
        autofocus
      />
      <p
        v-else
        class="description"
        :class="{ placeholder: !description }"
        @click="editingDesc = true"
      >
        {{ description || 'Click to add a description...' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.doc-header {
  margin-bottom: 24px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.title {
  font-size: 1.6rem;
  font-weight: 700;
  cursor: text;
  padding: 4px 0;
  flex: 1;
}

.title-input {
  font-size: 1.6rem;
  font-weight: 700;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius);
  padding: 4px 8px;
  flex: 1;
  outline: none;
}

.description {
  color: var(--color-text-muted);
  cursor: text;
  padding: 4px 0;
}

.description.placeholder {
  font-style: italic;
  opacity: 0.6;
}

.desc-input {
  width: 100%;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius);
  padding: 4px 8px;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  outline: none;
}

.btn-delete {
  background: none;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: var(--radius);
  padding: 6px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.15s;
  flex-shrink: 0;
}

.btn-delete:hover {
  background: var(--color-danger);
  color: white;
}
</style>
