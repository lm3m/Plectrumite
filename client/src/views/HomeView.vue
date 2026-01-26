<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '../stores/documents';
import AppSidebar from '../components/layout/AppSidebar.vue';

const store = useDocumentsStore();
const router = useRouter();

async function handleCreate() {
  const doc = await store.createDocument({ title: 'Untitled Practice' });
  if (doc) {
    router.push({ name: 'document', params: { id: doc.id } });
  }
}
</script>

<template>
  <div class="home-layout">
    <AppSidebar />
    <main class="home-main">
      <div class="welcome">
        <h1>Welcome to Plectrumite</h1>
        <p>Create and manage your guitar practice schedules.</p>
        <p>Select a document from the sidebar, or create a new one.</p>
        <button class="btn-create" @click="handleCreate">Create Practice Schedule</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-layout {
  display: flex;
  flex: 1;
}

.home-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome {
  text-align: center;
  max-width: 480px;
}

.welcome h1 {
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: var(--color-text);
}

.welcome p {
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.btn-create {
  margin-top: 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.15s;
}

.btn-create:hover {
  background: var(--color-primary-hover);
}
</style>
