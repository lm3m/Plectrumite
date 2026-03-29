<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  label: string;
  tab: Array<{ string: number; fret: number }>;
  showLabel?: boolean;
  startFret?: number;   // first fret shown in the diagram (default 1 = nut position)
  barreFret?: number;   // absolute fret of the barre bar, if any
}>(), { showLabel: true, startFret: 1, barreFret: undefined });

// Layout constants
const SS    = 28;
const FS    = 34;
const FRETS = 4;
const DOT_R = 10;
const PAD   = { top: 52, bottom: 24, left: 28, right: 28 };
const FRET_LABEL_W = 30; // extra right padding for "Nfr" label

const W = computed(() => PAD.left + 5 * SS + PAD.right + (props.startFret > 1 ? FRET_LABEL_W : 0));
const H = PAD.top + FRETS * FS + PAD.bottom;

function sx(s: number): number {
  return PAD.left + (6 - s) * SS;
}

// y offset from diagram top (fret 0 = top line)
function fy(offset: number): number {
  return PAD.top + offset * FS;
}

// Per-string status (X / O / fretted)
const strings = computed(() => {
  const map = new Map(props.tab.map(p => [p.string, p.fret]));
  return [6, 5, 4, 3, 2, 1].map(s => ({
    s,
    x: sx(s),
    status: !map.has(s) ? 'muted' : map.get(s) === 0 ? 'open' : 'fretted',
  }));
});

// Individual finger dots — exclude fret 0 (open) and barre fret (drawn as bar)
const dots = computed(() =>
  props.tab
    .filter(p => p.fret > 0 && p.fret !== props.barreFret)
    .map(p => ({
      cx: sx(p.string),
      cy: fy(p.fret - props.startFret) + FS / 2,
    }))
);

// Barre bar — spans the strings that are at barreFret
const barreBar = computed(() => {
  if (props.barreFret == null) return null;
  const positions = props.tab.filter(p => p.fret === props.barreFret);
  if (positions.length < 2) return null;
  const xs = positions.map(p => sx(p.string));
  return {
    x1: Math.min(...xs),
    x2: Math.max(...xs),
    cy: fy(props.barreFret - props.startFret) + FS / 2,
  };
});
</script>

<template>
  <svg
    :width="W"
    :height="H"
    :viewBox="`0 0 ${W} ${H}`"
    class="chord-diagram"
    :aria-label="`${label} chord diagram`"
  >
    <!-- Chord name -->
    <text
      v-if="props.showLabel"
      :x="W / 2"
      :y="PAD.top - 32"
      text-anchor="middle"
      class="chord-name"
    >{{ label }}</text>

    <!-- String indicators (X / O) above top line -->
    <text
      v-for="str in strings"
      :key="'ind-' + str.s"
      :x="str.x"
      :y="PAD.top - 12"
      text-anchor="middle"
      class="string-indicator"
      :class="str.status"
    >{{ str.status === 'muted' ? '✕' : str.status === 'open' ? '○' : '' }}</text>

    <!-- Top line: thick nut at fret 1, normal line otherwise -->
    <line
      :x1="sx(6)" :y1="fy(0)"
      :x2="sx(1)" :y2="fy(0)"
      :class="props.startFret === 1 ? 'nut' : 'fret-line'"
    />

    <!-- Fret lines -->
    <line
      v-for="f in FRETS"
      :key="'fret-' + f"
      :x1="sx(6)" :y1="fy(f)"
      :x2="sx(1)" :y2="fy(f)"
      class="fret-line"
    />

    <!-- String lines -->
    <line
      v-for="str in strings"
      :key="'str-' + str.s"
      :x1="str.x" :y1="fy(0)"
      :x2="str.x" :y2="fy(FRETS)"
      class="string-line"
    />

    <!-- Fret position label (e.g. "3fr") when not starting at nut -->
    <text
      v-if="props.startFret > 1"
      :x="sx(1) + 10"
      :y="fy(0) + FS / 2"
      class="fret-label"
    >{{ props.startFret }}fr</text>

    <!-- Barre bar -->
    <rect
      v-if="barreBar"
      :x="barreBar.x1 - DOT_R"
      :y="barreBar.cy - DOT_R"
      :width="barreBar.x2 - barreBar.x1 + 2 * DOT_R"
      :height="2 * DOT_R"
      rx="10"
      class="barre-bar"
    />

    <!-- Individual finger dots -->
    <circle
      v-for="(dot, i) in dots"
      :key="'dot-' + i"
      :cx="dot.cx"
      :cy="dot.cy"
      :r="DOT_R"
      class="dot"
    />
  </svg>
</template>

<style scoped>
.chord-diagram {
  display: block;
}

.chord-name {
  font-size: 18px;
  font-weight: 700;
  fill: var(--color-text);
}

.string-indicator {
  font-size: 11px;
  fill: var(--color-text-muted);
}

.string-indicator.open {
  font-size: 13px;
  fill: var(--color-text);
}

.nut {
  stroke: var(--color-text);
  stroke-width: 4;
  stroke-linecap: square;
}

.fret-line {
  stroke: var(--color-border);
  stroke-width: 1.5;
}

.string-line {
  stroke: var(--color-text-muted);
  stroke-width: 1.5;
}

.fret-label {
  font-size: 14px;
  font-weight: 600;
  fill: var(--color-text);
  dominant-baseline: middle;
}

.barre-bar {
  fill: var(--color-primary);
}

.dot {
  fill: var(--color-primary);
}
</style>
