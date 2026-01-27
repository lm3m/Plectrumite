<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDarkMode = ref(true);

onMounted(() => {
  const saved = localStorage.getItem('theme');
  isDarkMode.value = saved !== 'light';
  applyTheme();
});

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  applyTheme();
}

function applyTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  }
}
</script>

<template>
  <header class="app-header">
    <router-link to="/" class="app-title">Plectrumite</router-link>
    <span class="app-subtitle">Guitar Practice Schedules</span>
    <button class="theme-toggle" :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
      <span v-if="isDarkMode">◐</span>
      <span v-else>◑</span>
    </button>
  </header>
</template>

<style scoped>
.app-header {
  height: var(--header-height);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.app-title:hover {
  text-decoration: none;
  opacity: 0.9;
}

.app-subtitle {
  font-size: 0.85rem;
  opacity: 0.8;
  flex: 1;
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 1.2rem;
  color: white;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
