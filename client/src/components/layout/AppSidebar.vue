<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '../../stores/documents';

defineProps<{ currentId?: number }>();

const store = useDocumentsStore();
const router = useRouter();

onMounted(() => {
  store.fetchDocuments();
});

async function handleCreate() {
  const doc = await store.createDocument({ title: 'Untitled Practice' });
  if (doc) {
    router.push({ name: 'document', params: { id: doc.id } });
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'Z');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Documents</h2>
      <button class="btn-new" @click="handleCreate">+ New</button>
    </div>
    <nav class="doc-list">
      <router-link
        v-for="doc in store.sortedDocuments"
        :key="doc.id"
        :to="{ name: 'document', params: { id: doc.id } }"
        class="doc-item"
        :class="{ active: doc.id === currentId }"
      >
        <span class="doc-title">{{ doc.title }}</span>
        <span class="doc-date">{{ formatDate(doc.updated_at) }}</span>
      </router-link>
      <p v-if="store.sortedDocuments.length === 0 && !store.loading" class="empty">
        No documents yet
      </p>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header h2 {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.btn-new {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.15s;
}

.btn-new:hover {
  background: var(--color-primary-hover);
}

.doc-list {
  display: flex;
  flex-direction: column;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s;
}

.doc-item:hover {
  background: var(--color-item-hover);
  text-decoration: none;
}

.doc-item.active {
  background: var(--color-item-active);
  border-left: 3px solid var(--color-primary);
}

.doc-title {
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.doc-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  margin-left: 8px;
}

.empty {
  padding: 24px 16px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: center;
}
</style>
