<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue';
</script>

<template>
  <div id="app-root">
    <AppHeader />
    <router-view />
  </div>
</template>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
