<script setup lang="ts">
</script>

<template>
  <header class="app-header">
    <router-link to="/" class="app-title">Plectrumite</router-link>
    <span class="app-subtitle">Guitar Practice Schedules</span>
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
}
</style>
