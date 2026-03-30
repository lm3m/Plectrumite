<script setup lang="ts">
import { ref, computed } from 'vue';
import ChordDiagram from '@/components/tools/ChordDiagram.vue';

// ── Open chord definitions ────────────────────────────────────────────────────
interface ChordDef {
  label: string;
  noteKeys: string;
  tab: Array<{ string: number; fret: number }>;
}

const OPEN_CHORDS: Record<string, ChordDef> = {
  A:  { label: 'A',  noteKeys: 'A2 E3 A3 C#4 E4',    tab: [{string:5,fret:0},{string:4,fret:2},{string:3,fret:2},{string:2,fret:2},{string:1,fret:0}] },
  Am: { label: 'Am', noteKeys: 'A2 E3 A3 C4 E4',      tab: [{string:5,fret:0},{string:4,fret:2},{string:3,fret:2},{string:2,fret:1},{string:1,fret:0}] },
  C:  { label: 'C',  noteKeys: 'C3 E3 G3 C4 E4',      tab: [{string:5,fret:3},{string:4,fret:2},{string:3,fret:0},{string:2,fret:1},{string:1,fret:0}] },
  D:  { label: 'D',  noteKeys: 'D3 A3 D4 F#4',        tab: [{string:4,fret:0},{string:3,fret:2},{string:2,fret:3},{string:1,fret:2}] },
  Dm: { label: 'Dm', noteKeys: 'D3 A3 D4 F4',         tab: [{string:4,fret:0},{string:3,fret:2},{string:2,fret:3},{string:1,fret:1}] },
  E:  { label: 'E',  noteKeys: 'E2 B2 E3 G#3 B3 E4',  tab: [{string:6,fret:0},{string:5,fret:2},{string:4,fret:2},{string:3,fret:1},{string:2,fret:0},{string:1,fret:0}] },
  Em: { label: 'Em', noteKeys: 'E2 B2 E3 G3 B3 E4',   tab: [{string:6,fret:0},{string:5,fret:2},{string:4,fret:2},{string:3,fret:0},{string:2,fret:0},{string:1,fret:0}] },
  F:  { label: 'F',  noteKeys: 'F3 A3 C4 F4',         tab: [{string:4,fret:3},{string:3,fret:2},{string:2,fret:1},{string:1,fret:1}] },
  G:  { label: 'G',  noteKeys: 'G2 B2 D3 G3 D4 G4',   tab: [{string:6,fret:3},{string:5,fret:2},{string:4,fret:0},{string:3,fret:0},{string:2,fret:3},{string:1,fret:3}] },
};

const OPEN_CHORD_KEYS = Object.keys(OPEN_CHORDS);

// ── Barre chord logic ─────────────────────────────────────────────────────────
type BarreShape = 'E' | 'A';
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface DiagramData {
  label: string;
  tab: Array<{ string: number; fret: number }>;
  startFret: number;
  barreFret?: number;
}

function barreChordData(shape: BarreShape, root: string): DiagramData {
  const rootIdx = NOTES.indexOf(root);
  if (shape === 'E') {
    // Root on string 6, open E = index 4
    const n = (rootIdx - 4 + 12) % 12;
    return {
      label: root,
      startFret: n === 0 ? 1 : n,
      barreFret: n === 0 ? undefined : n,
      tab: [
        { string: 6, fret: n },
        { string: 5, fret: n + 2 },
        { string: 4, fret: n + 2 },
        { string: 3, fret: n + 1 },
        { string: 2, fret: n },
        { string: 1, fret: n },
      ],
    };
  } else {
    // Root on string 5, open A = index 9
    const n = (rootIdx - 9 + 12) % 12;
    return {
      label: root,
      startFret: n === 0 ? 1 : n,
      barreFret: n === 0 ? undefined : n,
      tab: [
        { string: 5, fret: n },
        { string: 4, fret: n + 2 },
        { string: 3, fret: n + 2 },
        { string: 2, fret: n + 2 },
        { string: 1, fret: n },
      ],
    };
  }
}

// Em-shape minor barre chord (root on string 6)
function barreMinorChordData(root: string): DiagramData {
  const rootIdx = NOTES.indexOf(root);
  const n = (rootIdx - 4 + 12) % 12;
  return {
    label: root + 'm',
    startFret: n === 0 ? 1 : n,
    barreFret: n === 0 ? undefined : n,
    tab: [
      { string: 6, fret: n },
      { string: 5, fret: n + 2 },
      { string: 4, fret: n + 2 },
      { string: 3, fret: n },
      { string: 2, fret: n },
      { string: 1, fret: n },
    ],
  };
}

// ── Chord progression library ─────────────────────────────────────────────────
interface ProgressionChord {
  interval: number;   // semitones from key root
  quality: 'M' | 'm';
}

interface ProgressionDef {
  label: string;
  chords: ProgressionChord[];
}

const PROGRESSIONS: Record<string, ProgressionDef> = {
  'I-IV-V':      { label: 'I – IV – V',        chords: [{interval:0,quality:'M'},{interval:5,quality:'M'},{interval:7,quality:'M'}] },
  'I-IV-V-I':    { label: 'I – IV – V – I',    chords: [{interval:0,quality:'M'},{interval:5,quality:'M'},{interval:7,quality:'M'},{interval:0,quality:'M'}] },
  'I-V-vi-IV':   { label: 'I – V – vi – IV',   chords: [{interval:0,quality:'M'},{interval:7,quality:'M'},{interval:9,quality:'m'},{interval:5,quality:'M'}] },
  'I-vi-IV-V':   { label: 'I – vi – IV – V',   chords: [{interval:0,quality:'M'},{interval:9,quality:'m'},{interval:5,quality:'M'},{interval:7,quality:'M'}] },
  'ii-V-I':      { label: 'ii – V – I',         chords: [{interval:2,quality:'m'},{interval:7,quality:'M'},{interval:0,quality:'M'}] },
  'i-VII-VI-VII':{ label: 'i – VII – VI – VII', chords: [{interval:0,quality:'m'},{interval:10,quality:'M'},{interval:8,quality:'M'},{interval:10,quality:'M'}] },
  '12-bar-blues':{ label: '12-Bar Blues',        chords: [
    {interval:0,quality:'M'},{interval:0,quality:'M'},{interval:0,quality:'M'},{interval:0,quality:'M'},
    {interval:5,quality:'M'},{interval:5,quality:'M'},{interval:0,quality:'M'},{interval:0,quality:'M'},
    {interval:7,quality:'M'},{interval:5,quality:'M'},{interval:0,quality:'M'},{interval:7,quality:'M'},
  ]},
};

const PROGRESSION_KEYS = Object.keys(PROGRESSIONS);

// ── State ─────────────────────────────────────────────────────────────────────
const chordType = ref<'open' | 'barre' | 'progression'>('open');

// Open chord slots
const chord1Key = ref('G');
const chord2Key = ref('C');

// Barre chord slots
const barre1Shape = ref<BarreShape>('E');
const barre1Root  = ref('G');
const barre2Shape = ref<BarreShape>('A');
const barre2Root  = ref('C');

// Progression slots
const progressionKey  = ref('G');
const progressionName = ref('I-IV-V');

const beatsPerChord = defineModel<number>('beatsPerChord', { default: 1 });

// ── Current diagram data ──────────────────────────────────────────────────────
const slot1 = computed<DiagramData>(() =>
  chordType.value === 'open'
    ? { label: OPEN_CHORDS[chord1Key.value].label, tab: OPEN_CHORDS[chord1Key.value].tab, startFret: 1 }
    : barreChordData(barre1Shape.value, barre1Root.value)
);

const slot2 = computed<DiagramData>(() =>
  chordType.value === 'open'
    ? { label: OPEN_CHORDS[chord2Key.value].label, tab: OPEN_CHORDS[chord2Key.value].tab, startFret: 1 }
    : barreChordData(barre2Shape.value, barre2Root.value)
);

const progressionDiagrams = computed<DiagramData[]>(() => {
  const prog = PROGRESSIONS[progressionName.value];
  if (!prog) return [];
  const keyIdx = NOTES.indexOf(progressionKey.value);
  return prog.chords.map(c => {
    const chordRoot = NOTES[(keyIdx + c.interval) % 12];
    return c.quality === 'M' ? barreChordData('E', chordRoot) : barreMinorChordData(chordRoot);
  });
});

// ── Randomise ─────────────────────────────────────────────────────────────────
function randomise() {
  if (chordType.value === 'open') {
    const keys = [...OPEN_CHORD_KEYS];
    const i = Math.floor(Math.random() * keys.length);
    chord1Key.value = keys[i];
    keys.splice(i, 1);
    chord2Key.value = keys[Math.floor(Math.random() * keys.length)];
  } else {
    const shapes: BarreShape[] = ['E', 'A'];
    barre1Shape.value = shapes[Math.floor(Math.random() * 2)];
    barre1Root.value  = NOTES[Math.floor(Math.random() * 12)];
    barre2Shape.value = shapes[Math.floor(Math.random() * 2)];
    barre2Root.value  = NOTES[Math.floor(Math.random() * 12)];
  }
}
</script>

<template>
  <div class="chord-practice">
    <div class="section-label">Chord Practice</div>

    <!-- Chord type radio -->
    <div class="type-radio">
      <label class="radio-label">
        <input v-model="chordType" type="radio" value="open" />
        Open chords
      </label>
      <label class="radio-label">
        <input v-model="chordType" type="radio" value="barre" />
        Barre chords
      </label>
      <label class="radio-label">
        <input v-model="chordType" type="radio" value="progression" />
        Progressions
      </label>
    </div>

    <!-- Controls row -->
    <div class="controls">
      <button v-if="chordType !== 'progression'" class="randomise-btn" @click="randomise">&#x21ba; Randomise</button>

      <!-- Progression selectors -->
      <template v-if="chordType === 'progression'">
        <label class="beats-label">
          Key
          <select v-model="progressionKey" class="beats-select">
            <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
          </select>
        </label>
        <label class="beats-label">
          Progression
          <select v-model="progressionName" class="progression-select">
            <option v-for="key in PROGRESSION_KEYS" :key="key" :value="key">
              {{ PROGRESSIONS[key].label }}
            </option>
          </select>
        </label>
      </template>

      <label class="beats-label">
        Beats per chord
        <select v-model.number="beatsPerChord" class="beats-select">
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
        </select>
      </label>
    </div>

    <!-- Open / Barre: two-slot diagrams -->
    <div v-if="chordType !== 'progression'" class="diagrams">
      <!-- Slot 1 -->
      <div class="diagram-col">
        <select v-if="chordType === 'open'" v-model="chord1Key" class="chord-select">
          <option v-for="key in OPEN_CHORD_KEYS" :key="key" :value="key">{{ OPEN_CHORDS[key].label }}</option>
        </select>
        <template v-else>
          <select v-model="barre1Shape" class="chord-select">
            <option value="E">E shape</option>
            <option value="A">A shape</option>
          </select>
          <select v-model="barre1Root" class="chord-select">
            <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
          </select>
        </template>
        <ChordDiagram
          :label="slot1.label"
          :tab="slot1.tab"
          :show-label="false"
          :start-fret="slot1.startFret"
          :barre-fret="slot1.barreFret"
        />
      </div>

      <div class="diagram-arrow">→</div>

      <!-- Slot 2 -->
      <div class="diagram-col">
        <select v-if="chordType === 'open'" v-model="chord2Key" class="chord-select">
          <option v-for="key in OPEN_CHORD_KEYS" :key="key" :value="key">{{ OPEN_CHORDS[key].label }}</option>
        </select>
        <template v-else>
          <select v-model="barre2Shape" class="chord-select">
            <option value="E">E shape</option>
            <option value="A">A shape</option>
          </select>
          <select v-model="barre2Root" class="chord-select">
            <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
          </select>
        </template>
        <ChordDiagram
          :label="slot2.label"
          :tab="slot2.tab"
          :show-label="false"
          :start-fret="slot2.startFret"
          :barre-fret="slot2.barreFret"
        />
      </div>
    </div>

    <!-- Progression: all chords in a wrapping grid -->
    <div v-else class="progression-diagrams">
      <div
        v-for="(diag, i) in progressionDiagrams"
        :key="i"
        class="prog-diagram-col"
      >
        <div class="prog-chord-name">{{ diag.label }}</div>
        <div class="prog-bar-num">{{ i + 1 }}</div>
        <ChordDiagram
          :label="diag.label"
          :tab="diag.tab"
          :show-label="false"
          :start-fret="diag.startFret"
          :barre-fret="diag.barreFret"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chord-practice {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  text-align: center;
}

/* Chord type radio */
.type-radio {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
}

.radio-label input {
  accent-color: var(--color-primary);
  cursor: pointer;
}

/* Controls row */
.controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}

.randomise-btn {
  background: var(--color-primary);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 7px 16px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.randomise-btn:hover {
  opacity: 0.85;
}

.beats-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.beats-select {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.85rem;
  padding: 4px 8px;
}

.progression-select {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.85rem;
  padding: 4px 8px;
}

/* Two-slot chord diagrams */
.diagrams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.diagram-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.chord-select {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 4px 10px;
  cursor: pointer;
  width: 100%;
  text-align: center;
}

.diagram-arrow {
  font-size: 1.4rem;
  color: var(--color-text-muted);
  padding-top: 8px;
}

/* Progression grid */
.progression-diagrams {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.prog-diagram-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.prog-chord-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.prog-bar-num {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 600;
  letter-spacing: 0.04em;
}
</style>
