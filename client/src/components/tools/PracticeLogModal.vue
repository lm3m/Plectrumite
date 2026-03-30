<script setup lang="ts">
import { computed } from 'vue';
import { usePracticeLog } from '@/composables/usePracticeLog';

defineEmits<{ (e: 'close'): void }>();

const { entries, clearLog } = usePracticeLog();

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

// Group entries by calendar date label
const grouped = computed(() => {
  const groups: Array<{ label: string; items: typeof entries.value }> = [];
  for (const entry of entries.value) {
    const label = formatDate(entry.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  }
  return groups;
});
</script>

<template>
  <div class="log-modal">
    <div class="log-header">
      <div class="log-title-row">
        <h3>Practice Log</h3>
        <span class="log-count">{{ entries.length }} session{{ entries.length !== 1 ? 's' : '' }}</span>
      </div>
      <button
        v-if="entries.length > 0"
        class="clear-btn"
        @click="clearLog"
      >
        Clear all
      </button>
    </div>

    <div v-if="entries.length === 0" class="log-empty">
      No sessions logged yet. Complete a block to start tracking your practice.
    </div>

    <div v-else class="log-groups">
      <div v-for="group in grouped" :key="group.label" class="log-group">
        <div class="group-label">{{ group.label }}</div>
        <div
          v-for="entry in group.items"
          :key="entry.id"
          class="log-entry"
        >
          <span class="entry-time">{{ formatTime(entry.timestamp) }}</span>
          <div class="entry-info">
            <span class="entry-doc">{{ entry.documentTitle }}</span>
            <span class="entry-block">{{ entry.blockLabel }}</span>
          </div>
          <span v-if="entry.durationMinutes" class="entry-duration">
            {{ entry.durationMinutes }} min
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.log-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.log-title-row h3 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.log-count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.clear-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  padding: 3px 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.clear-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.log-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: 24px 0;
  font-style: italic;
}

.log-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 4px;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--color-surface-alt);
}

.entry-time {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 42px;
}

.entry-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.entry-doc {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.entry-block {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.entry-duration {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}
</style>
