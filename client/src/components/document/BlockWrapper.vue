<script setup lang="ts">
import type { Component } from 'vue';
import { BlockType, BLOCK_TYPE_LABELS } from '../../types';
import type { Block, BlockContent } from '../../types';
import TabBlock from '../blocks/TabBlock.vue';
import FretboardBlock from '../blocks/FretboardBlock.vue';
import NotationBlock from '../blocks/NotationBlock.vue';
import CombinedBlock from '../blocks/CombinedBlock.vue';
import MarkdownBlock from '../blocks/MarkdownBlock.vue';
import ImageBlock from '../blocks/ImageBlock.vue';

defineProps<{
  block: Block;
  isFirst: boolean;
  isLast: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', content: BlockContent): void;
  (e: 'delete'): void;
  (e: 'move-up'): void;
  (e: 'move-down'): void;
}>();

const componentMap: Record<BlockType, Component> = {
  [BlockType.GuitarTab]: TabBlock,
  [BlockType.FretboardView]: FretboardBlock,
  [BlockType.MusicalNotation]: NotationBlock,
  [BlockType.CombinedTabNotation]: CombinedBlock,
  [BlockType.MarkdownText]: MarkdownBlock,
  [BlockType.Image]: ImageBlock,
};
</script>

<template>
  <div class="block-wrapper" :data-block-type="block.block_type">
    <div class="block-header">
      <span class="block-type-label">{{ BLOCK_TYPE_LABELS[block.block_type] }}</span>
      <div class="block-actions">
        <button :disabled="isFirst" title="Move up" @click="emit('move-up')">&#9650;</button>
        <button :disabled="isLast" title="Move down" @click="emit('move-down')">&#9660;</button>
        <button class="danger" title="Delete block" @click="emit('delete')">&#10005;</button>
      </div>
    </div>
    <div class="block-content">
      <component
        :is="componentMap[block.block_type]"
        :content="block.content"
        @update="(c: BlockContent) => emit('update', c)"
      />
    </div>
  </div>
</template>

<style scoped>
.block-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  margin-bottom: 16px;
  box-shadow: var(--shadow);
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  border-radius: var(--radius) var(--radius) 0 0;
}

.block-type-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.block-content {
  padding: 16px;
}

.block-actions {
  display: flex;
  gap: 4px;
}

.block-actions button {
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.block-actions button:hover:not(:disabled) {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

.block-actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.block-actions button.danger:hover:not(:disabled) {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
</style>
