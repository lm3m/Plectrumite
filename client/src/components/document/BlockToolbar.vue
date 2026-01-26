<script setup lang="ts">
import { BlockType, BLOCK_TYPE_LABELS } from '../../types';

defineEmits<{
  (e: 'add', type: BlockType): void;
}>();

const blockTypes = Object.values(BlockType);
</script>

<template>
  <div class="block-toolbar">
    <span class="toolbar-label">Add block:</span>
    <button
      v-for="type in blockTypes"
      :key="type"
      class="toolbar-btn"
      @click="$emit('add', type)"
    >
      {{ BLOCK_TYPE_LABELS[type] }}
    </button>
  </div>
</template>

<style scoped>
.block-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.toolbar-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.toolbar-btn {
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  padding: 8px 14px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.toolbar-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #f0f4fa;
}
</style>
