<script setup lang="ts">
import type { Block, BlockContent } from '../../types';
import { BlockType, defaultContentForType } from '../../types';
import { useDocumentsStore } from '../../stores/documents';
import BlockWrapper from './BlockWrapper.vue';
import BlockToolbar from './BlockToolbar.vue';

const props = defineProps<{
  blocks: Block[];
  documentId: number;
}>();

const store = useDocumentsStore();

async function handleAdd(type: BlockType) {
  const content = defaultContentForType(type);
  await store.addBlock(props.documentId, {
    block_type: type,
    content,
  });
}

async function handleUpdate(blockId: number, content: BlockContent) {
  await store.updateBlock(blockId, content);
}

async function handleDelete(blockId: number) {
  if (!confirm('Delete this block?')) return;
  await store.deleteBlock(blockId);
}

async function handleMoveUp(index: number) {
  if (index <= 0) return;
  const ids = props.blocks.map(b => b.id);
  [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
  await store.reorderBlocks(props.documentId, ids);
}

async function handleMoveDown(index: number) {
  if (index >= props.blocks.length - 1) return;
  const ids = props.blocks.map(b => b.id);
  [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
  await store.reorderBlocks(props.documentId, ids);
}
</script>

<template>
  <div class="block-list">
    <BlockWrapper
      v-for="(block, i) in blocks"
      :key="block.id"
      :block="block"
      :is-first="i === 0"
      :is-last="i === blocks.length - 1"
      @update="(c) => handleUpdate(block.id, c)"
      @delete="handleDelete(block.id)"
      @move-up="handleMoveUp(i)"
      @move-down="handleMoveDown(i)"
    />
    <BlockToolbar @add="handleAdd" />
  </div>
</template>

<style scoped>
.block-list {
  max-width: 900px;
}
</style>
