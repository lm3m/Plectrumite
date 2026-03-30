<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

const props = withDefaults(defineProps<{ beatsPerChord?: number }>(), { beatsPerChord: 1 });

const TIME_SIGNATURES = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8'] as const;

const MIN_BPM = 20;
const MAX_BPM = 300;
const STORAGE_KEY = 'metronome-bpm';
const TIMESIG_KEY = 'metronome-timesig';
// How far ahead to schedule audio (seconds)
const LOOKAHEAD = 0.1;
// How often the scheduler runs (ms)
const SCHEDULE_INTERVAL = 25;

const savedBpm = parseInt(localStorage.getItem(STORAGE_KEY) ?? '', 10);
const initialBpm = !isNaN(savedBpm) ? Math.min(MAX_BPM, Math.max(MIN_BPM, savedBpm)) : 100;
const savedTimeSig = localStorage.getItem(TIMESIG_KEY);
const initialTimeSig = (TIME_SIGNATURES as readonly string[]).includes(savedTimeSig ?? '') ? savedTimeSig! : '4/4';

const bpm = ref(initialBpm);
const timeSig = ref(initialTimeSig);
const currentBeat = ref(-1); // -1 = stopped
const running = ref(false);
const bpmInput = ref(String(initialBpm));

const beats = computed(() => parseInt(timeSig.value.split('/')[0]));

let audioCtx: AudioContext | null = null;
let schedulerId: ReturnType<typeof setInterval> | null = null;
let nextBeatTime = 0;   // AudioContext time of the next beat
let nextBeatIndex = 0;  // which beat fires next

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playClick(time: number, beatIndex: number) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const isAccented = beatIndex < props.beatsPerChord;
  osc.frequency.value = beatIndex === 0 ? 1500 : isAccented ? 1000 : 700;
  const gainVal = beatIndex === 0 ? 0.35 : isAccented ? 0.25 : 0.08;
  gain.gain.setValueAtTime(gainVal, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time);
  osc.stop(time + 0.04);
}

function scheduler() {
  const ctx = getAudioCtx();
  while (nextBeatTime < ctx.currentTime + LOOKAHEAD) {
    const beat = nextBeatIndex;
    // Schedule the click sound
    playClick(nextBeatTime, beat);
    // Schedule the visual update to fire at the right moment
    const delayMs = Math.max(0, (nextBeatTime - ctx.currentTime) * 1000);
    setTimeout(() => { currentBeat.value = beat; }, delayMs);
    nextBeatIndex = (nextBeatIndex + 1) % beats.value;
    nextBeatTime += 60 / bpm.value;
  }
}

function start() {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  running.value = true;
  nextBeatTime = ctx.currentTime;
  nextBeatIndex = 0;
  schedulerId = setInterval(scheduler, SCHEDULE_INTERVAL);
  scheduler(); // fire immediately so first beat isn't delayed
}

function stop() {
  running.value = false;
  currentBeat.value = -1;
  if (schedulerId !== null) {
    clearInterval(schedulerId);
    schedulerId = null;
  }
}

function toggle() {
  if (running.value) stop(); else start();
}

function onTimeSigChange(value: string) {
  const wasRunning = running.value;
  if (wasRunning) stop();
  timeSig.value = value;
  localStorage.setItem(TIMESIG_KEY, value);
  if (wasRunning) start();
}

function adjustBpm(delta: number) {
  setBpm(bpm.value + delta);
}

function setBpm(value: number) {
  bpm.value = Math.min(MAX_BPM, Math.max(MIN_BPM, value));
  bpmInput.value = String(bpm.value);
  localStorage.setItem(STORAGE_KEY, String(bpm.value));
  // No need to restart — the scheduler reads bpm.value on each tick
}

function onBpmInput(e: Event) {
  bpmInput.value = (e.target as HTMLInputElement).value;
}

function onBpmCommit() {
  const parsed = parseInt(bpmInput.value, 10);
  if (!isNaN(parsed)) setBpm(parsed);
  else bpmInput.value = String(bpm.value);
}

function onBpmKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
}

onUnmounted(() => {
  stop();
  audioCtx?.close();
});
</script>

<template>
  <div class="metronome">
    <div class="section-label">Metronome</div>

    <!-- Time signature selector -->
    <div class="timesig-row">
      <button
        v-for="ts in TIME_SIGNATURES"
        :key="ts"
        class="timesig-btn"
        :class="{ selected: timeSig === ts }"
        :aria-label="`${ts} time signature`"
        :aria-pressed="timeSig === ts"
        @click="onTimeSigChange(ts)"
      >
        {{ ts }}
      </button>
    </div>

    <!-- Beat pips -->
    <div class="pips" aria-label="Beat indicator">
      <div
        v-for="i in beats"
        :key="i"
        class="pip"
        :class="{
          active: currentBeat === i - 1,
          accented: i - 1 < props.beatsPerChord,
        }"
        :aria-label="`beat ${i}`"
      />
    </div>

    <!-- Tempo controls -->
    <div class="tempo-row">
      <button class="adj-btn" :disabled="bpm <= MIN_BPM" aria-label="Decrease tempo by 5" @click="adjustBpm(-5)">−−</button>
      <button class="adj-btn" :disabled="bpm <= MIN_BPM" aria-label="Decrease tempo" @click="adjustBpm(-1)">−</button>

      <div class="bpm-field">
        <input
          type="number"
          class="bpm-input"
          :value="bpmInput"
          min="20"
          max="300"
          aria-label="Tempo in BPM"
          @input="onBpmInput"
          @blur="onBpmCommit"
          @keydown="onBpmKeydown"
        />
        <span class="bpm-label">BPM</span>
      </div>

      <button class="adj-btn" :disabled="bpm >= MAX_BPM" aria-label="Increase tempo" @click="adjustBpm(1)">+</button>
      <button class="adj-btn" :disabled="bpm >= MAX_BPM" aria-label="Increase tempo by 5" @click="adjustBpm(5)">++</button>
    </div>

    <!-- Play / stop -->
    <button class="play-btn" :class="{ playing: running }" @click="toggle">
      {{ running ? '⏹ Stop' : '▶ Start' }}
    </button>
  </div>
</template>

<style scoped>
.metronome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 8px 0;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

/* Time signature selector */
.timesig-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.timesig-btn {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 5px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  min-width: 40px;
}

.timesig-btn:hover:not(.selected) {
  background: var(--color-border);
}

.timesig-btn.selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Pips */
.pips {
  display: flex;
  gap: 16px;
}

.pip {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  border: 2px solid var(--color-border);
  transition: background 0.05s, border-color 0.05s, transform 0.05s;
}

.pip.accented.active {
  background: #dc2626;
  border-color: #dc2626;
  transform: scale(1.15);
}

.pip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.15);
}

/* Tempo row */
.tempo-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.adj-btn {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 6px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 36px;
}

.adj-btn:hover:not(:disabled) {
  background: var(--color-border);
}

.adj-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.bpm-field {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.bpm-input {
  width: 64px;
  text-align: center;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 1.4rem;
  font-weight: 700;
  padding: 4px 6px;
  /* hide spin buttons */
  appearance: textfield;
}

.bpm-input::-webkit-outer-spin-button,
.bpm-input::-webkit-inner-spin-button {
  appearance: none;
}

.bpm-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.bpm-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Play button */
.play-btn {
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 32px;
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 120px;
}

.play-btn:hover {
  opacity: 0.85;
}

.play-btn.playing {
  background: var(--color-text-muted);
}
</style>
