<script setup lang="ts">
import { ref, computed, watch, onUnmounted, type Component } from 'vue';
import { BlockType, BLOCK_TYPE_LABELS } from '../../types';
import type { Block, BlockContent } from '../../types';
import { usePracticeLog } from '../../composables/usePracticeLog';
import TabBlock from '../blocks/TabBlock.vue';
import FretboardBlock from '../blocks/FretboardBlock.vue';
import NotationBlock from '../blocks/NotationBlock.vue';
import CombinedBlock from '../blocks/CombinedBlock.vue';
import MarkdownBlock from '../blocks/MarkdownBlock.vue';
import ImageBlock from '../blocks/ImageBlock.vue';

const props = defineProps<{
  block: Block;
  isFirst: boolean;
  isLast: boolean;
  documentId: number;
  documentTitle: string;
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

// ── Practice log ──────────────────────────────────────────────────────────────
const { addEntry } = usePracticeLog();

const justLogged = ref(false);  // brief visual feedback after logging

function logSession() {
  addEntry({
    documentId: props.documentId,
    documentTitle: props.documentTitle,
    blockId: props.block.id,
    blockType: props.block.block_type,
    durationMinutes: (props.block.content as { practiceMinutes?: number }).practiceMinutes,
  });
  justLogged.value = true;
  setTimeout(() => { justLogged.value = false; }, 2000);
}

// ── Practice timer ────────────────────────────────────────────────────────────
type TimerState = 'idle' | 'running' | 'paused' | 'done';

const timerState = ref<TimerState>('idle');
const timeLeft = ref(0);  // seconds
let intervalId: ReturnType<typeof setInterval> | null = null;

const targetSeconds = computed(() =>
  ((props.block.content as { practiceMinutes?: number }).practiceMinutes ?? 0) * 60
);

const displayTime = computed(() => {
  const secs = timerState.value === 'idle' ? targetSeconds.value : timeLeft.value;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

function clearTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function startTimer() {
  if (timerState.value === 'idle') timeLeft.value = targetSeconds.value;
  timerState.value = 'running';
  intervalId = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      timeLeft.value = 0;
      timerState.value = 'done';
      clearTimer();
      logSession();  // auto-log on timer completion
    }
  }, 1000);
}

function pauseTimer() {
  timerState.value = 'paused';
  clearTimer();
}

function resetTimer() {
  clearTimer();
  timerState.value = 'idle';
  timeLeft.value = 0;
}

function toggleTimer() {
  if (timerState.value === 'running') {
    pauseTimer();
  } else if (timerState.value === 'idle' || timerState.value === 'paused') {
    startTimer();
  }
}

function saveMinutes(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  const minutes = isNaN(val) || val < 1 ? undefined : Math.min(val, 99);
  resetTimer();
  emit('update', { ...props.block.content, practiceMinutes: minutes });
}

// Reset timer if the saved duration changes externally
watch(targetSeconds, () => { resetTimer(); });

onUnmounted(() => { clearTimer(); });
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

    <!-- Practice timer + complete footer -->
    <div class="timer-footer">
      <span class="timer-icon">⏱</span>
      <input
        type="number"
        class="timer-input"
        :value="(block.content as { practiceMinutes?: number }).practiceMinutes ?? ''"
        min="1"
        max="99"
        placeholder="min"
        title="Practice duration in minutes"
        @change="saveMinutes"
      />
      <template v-if="targetSeconds > 0">
        <span
          class="timer-display"
          :class="{
            'timer-running': timerState === 'running',
            'timer-done': timerState === 'done',
          }"
        >{{ timerState === 'done' ? 'Done!' : displayTime }}</span>
        <button
          v-if="timerState !== 'done'"
          class="timer-btn"
          :title="timerState === 'running' ? 'Pause' : 'Start'"
          @click="toggleTimer"
        >
          {{ timerState === 'running' ? '⏸' : '▶' }}
        </button>
        <button class="timer-btn" title="Reset" @click="resetTimer">↺</button>
      </template>

      <span class="footer-sep" />

      <button
        class="complete-btn"
        :class="{ logged: justLogged }"
        title="Mark this block as completed and log the session"
        @click="logSession"
      >
        {{ justLogged ? '✓ Logged' : '✓ Complete' }}
      </button>
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
  cursor: pointer;
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

/* Timer + complete footer */
.timer-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  border-radius: 0 0 var(--radius) var(--radius);
}

.timer-icon {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.timer-input {
  width: 48px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.8rem;
  padding: 2px 6px;
  text-align: center;
  appearance: textfield;
}

.timer-input::-webkit-outer-spin-button,
.timer-input::-webkit-inner-spin-button {
  appearance: none;
}

.timer-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.timer-display {
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  min-width: 36px;
}

.timer-display.timer-running {
  color: var(--color-primary);
}

.timer-display.timer-done {
  color: #16a34a;
}

.timer-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  padding: 2px 7px;
  cursor: pointer;
  transition: all 0.15s;
}

.timer-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.footer-sep {
  flex: 1;
}

.complete-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.complete-btn:hover {
  border-color: #16a34a;
  color: #16a34a;
}

.complete-btn.logged {
  border-color: #16a34a;
  color: #16a34a;
  background: rgba(22, 163, 74, 0.08);
}
</style>
