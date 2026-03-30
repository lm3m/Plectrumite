<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import MetronomeWidget from '@/components/tools/MetronomeWidget.vue';
import ChordPracticeWidget from '@/components/tools/ChordPracticeWidget.vue';
import PracticeLogModal from '@/components/tools/PracticeLogModal.vue';

const isDarkMode = ref(true);
const menuOpen = ref(false);
const practiceToolsOpen = ref(false);
const practiceLogOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const beatsPerChord = ref(1);

onMounted(() => {
  const saved = localStorage.getItem('theme');
  isDarkMode.value = saved !== 'light';
  applyTheme();
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  applyTheme();
  menuOpen.value = false;
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

function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false;
  }
}
</script>

<template>
  <header class="app-header">
    <router-link to="/" class="app-title">Plectrumite</router-link>
    <span class="app-subtitle">Guitar Practice Schedules</span>

    <div ref="menuRef" class="menu-container">
      <button class="hamburger" :class="{ open: menuOpen }" aria-label="Menu" @click.stop="menuOpen = !menuOpen">
        <span /><span /><span />
      </button>

      <div v-if="menuOpen" class="dropdown">
        <button class="dropdown-item" @click="toggleTheme">
          <span class="item-icon">{{ isDarkMode ? '◑' : '◐' }}</span>
          {{ isDarkMode ? 'Light mode' : 'Dark mode' }}
        </button>
        <button class="dropdown-item" @click="practiceToolsOpen = true; menuOpen = false">
          <span class="item-icon">♩</span>
          Practice tools
        </button>
        <button class="dropdown-item" @click="practiceLogOpen = true; menuOpen = false">
          <span class="item-icon">📋</span>
          Practice log
        </button>
      </div>
    </div>
  </header>

  <!-- Practice Log Modal -->
  <Teleport to="body">
    <div v-if="practiceLogOpen" class="modal-backdrop" @click.self="practiceLogOpen = false">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Practice log">
        <div class="modal-header">
          <h2>Practice Log</h2>
          <button class="modal-close" aria-label="Close" @click="practiceLogOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <PracticeLogModal @close="practiceLogOpen = false" />
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Practice Tools Modal -->
  <Teleport to="body">
    <div v-if="practiceToolsOpen" class="modal-backdrop" @click.self="practiceToolsOpen = false">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Practice tools">
        <div class="modal-header">
          <h2>Practice Tools</h2>
          <button class="modal-close" aria-label="Close" @click="practiceToolsOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <MetronomeWidget :beats-per-chord="beatsPerChord" />
          <hr class="tool-divider" />
          <ChordPracticeWidget v-model:beats-per-chord="beatsPerChord" />
        </div>
      </div>
    </div>
  </Teleport>
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

/* Hamburger */
.menu-container {
  position: relative;
}

.hamburger {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.hamburger:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hamburger span {
  display: block;
  width: 18px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.2s;
}

/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  min-width: 180px;
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: var(--color-surface-alt);
}

.item-icon {
  font-size: 1rem;
  width: 18px;
  text-align: center;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  width: 700px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}

.modal-close:hover {
  background: var(--color-surface-alt);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 120px;
}

.tool-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 8px 0 24px;
}
</style>
