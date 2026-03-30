<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '../stores/documents';
import AppSidebar from '../components/layout/AppSidebar.vue';
import DocumentHeader from '../components/document/DocumentHeader.vue';
import BlockList from '../components/document/BlockList.vue';

const props = defineProps<{ id: string }>();
const store = useDocumentsStore();
const router = useRouter();

watch(
  () => props.id,
  (id) => {
    store.fetchDocument(Number(id));
  },
  { immediate: true }
);

async function handleUpdateTitle(title: string) {
  await store.updateDocument(Number(props.id), { title });
}

async function handleUpdateDescription(description: string) {
  await store.updateDocument(Number(props.id), { description });
}

async function handleDelete() {
  if (!confirm('Delete this document and all its blocks?')) return;
  await store.deleteDocument(Number(props.id));
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="doc-layout">
    <AppSidebar :current-id="Number(id)" />
    <main class="doc-main">
      <div v-if="store.loading" class="loading">Loading...</div>
      <div v-else-if="store.currentDocument" class="doc-content">
        <DocumentHeader
          :title="store.currentDocument.title"
          :description="store.currentDocument.description"
          @update:title="handleUpdateTitle"
          @update:description="handleUpdateDescription"
          @delete="handleDelete"
        />
        <BlockList
          :blocks="store.currentDocument.blocks"
          :document-id="store.currentDocument.id"
          :document-title="store.currentDocument.title"
        />
      </div>
      <div v-else class="error">Document not found</div>
    </main>
  </div>
</template>

<style scoped>
.doc-layout {
  display: flex;
  flex: 1;
}

.doc-main {
  flex: 1;
  padding: 24px 20px;
  overflow-y: auto;
  height: calc(100vh - var(--header-height));
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}
</style>
