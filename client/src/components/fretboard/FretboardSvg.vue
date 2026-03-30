<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FretMarker } from '../../types';
import {
  STANDARD_TUNING,
  STRING_COUNT,
  FRET_SPACING,
  STRING_SPACING,
  NUT_WIDTH,
  MARKER_RADIUS,
  INLAY_FRETS_12,
  INLAY_FRETS_24,
  DOUBLE_INLAY_FRETS,
  computeViewBox,
  fretX,
  stringY,
  markerCenter,
  findNearestPosition,
  type ScaleNote,
} from '../../composables/useFretboard';

const props = defineProps<{
  fretCount: 12 | 24;
  markers: FretMarker[];
  tuning?: string[];
  scaleOverlay?: ScaleNote[];
  scaleLabelMode?: 'note' | 'degree';
}>();

const emit = defineEmits<{
  (e: 'toggle-marker', string: number, fret: number): void;
}>();

const svgRef = ref<SVGSVGElement | null>(null);

const viewBox = computed(() => computeViewBox(props.fretCount));
const tuning = computed(() => props.tuning || STANDARD_TUNING);
const inlayFrets = computed(() =>
  props.fretCount === 24 ? INLAY_FRETS_24 : INLAY_FRETS_12
);

// Generate fret lines
const fretLines = computed(() => {
  const lines = [];
  for (let f = 0; f <= props.fretCount; f++) {
    lines.push({
      x: fretX(f),
      y1: stringY(1),
      y2: stringY(STRING_COUNT),
      isNut: f === 0,
    });
  }
  return lines;
});

// Generate string lines
const stringLines = computed(() => {
  const lines = [];
  for (let s = 1; s <= STRING_COUNT; s++) {
    lines.push({
      string: s,
      y: stringY(s),
      x1: fretX(0),
      x2: fretX(props.fretCount),
      label: tuning.value[s - 1],
    });
  }
  return lines;
});

// Fret number labels
const fretLabels = computed(() => {
  const labels = [];
  for (let f = 1; f <= props.fretCount; f++) {
    if (f % 2 === 1 || f === props.fretCount || inlayFrets.value.includes(f)) {
      labels.push({ fret: f, x: fretX(f) - FRET_SPACING / 2 });
    }
  }
  return labels;
});

// Inlay dots
const inlayDots = computed(() => {
  const dots: Array<{ cx: number; cy: number }> = [];
  const midY = (stringY(1) + stringY(STRING_COUNT)) / 2;
  const offset = STRING_SPACING * 0.8;
  for (const f of inlayFrets.value) {
    const cx = fretX(f) - FRET_SPACING / 2;
    if (DOUBLE_INLAY_FRETS.includes(f)) {
      dots.push({ cx, cy: midY - offset });
      dots.push({ cx, cy: midY + offset });
    } else {
      dots.push({ cx, cy: midY });
    }
  }
  return dots;
});

// Marker positions
const markerPositions = computed(() =>
  props.markers.map(m => ({
    ...m,
    ...markerCenter(m.fret, m.string),
  }))
);

function handleClick(event: MouseEvent) {
  const svg = svgRef.value;
  if (!svg) return;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
  const pos = findNearestPosition(svgPt.x, svgPt.y, props.fretCount);
  if (pos) {
    emit('toggle-marker', pos.string, pos.fret);
  }
}
</script>

<template>
  <svg
    ref="svgRef"
    :viewBox="viewBox"
    class="fretboard-svg"
    @click="handleClick"
  >
    <!-- Inlay dots -->
    <circle
      v-for="(dot, i) in inlayDots"
      :key="'inlay-' + i"
      :cx="dot.cx"
      :cy="dot.cy"
      r="4"
      fill="#d0d0d0"
    />

    <!-- Fret lines -->
    <line
      v-for="(fl, i) in fretLines"
      :key="'fret-' + i"
      :x1="fl.x"
      :y1="fl.y1"
      :x2="fl.x"
      :y2="fl.y2"
      :stroke="fl.isNut ? '#333' : '#999'"
      :stroke-width="fl.isNut ? NUT_WIDTH : 1.5"
    />

    <!-- String lines -->
    <line
      v-for="sl in stringLines"
      :key="'str-' + sl.string"
      :x1="sl.x1"
      :y1="sl.y"
      :x2="sl.x2"
      :y2="sl.y"
      stroke="#666"
      :stroke-width="0.8 + (sl.string - 1) * 0.2"
    />

    <!-- String labels -->
    <text
      v-for="sl in stringLines"
      :key="'label-' + sl.string"
      :x="sl.x1 - 12"
      :y="sl.y + 4"
      text-anchor="end"
      font-size="12"
      font-weight="600"
      fill="#666"
    >{{ sl.label }}</text>

    <!-- Fret numbers -->
    <text
      v-for="fl in fretLabels"
      :key="'fnum-' + fl.fret"
      :x="fl.x"
      :y="stringY(STRING_COUNT) + 20"
      text-anchor="middle"
      font-size="10"
      fill="#999"
    >{{ fl.fret }}</text>

    <!-- Scale overlay -->
    <g v-for="(sn, i) in scaleOverlay" :key="'scale-' + i">
      <circle
        :cx="sn.cx"
        :cy="sn.cy"
        :r="MARKER_RADIUS - 1"
        :class="sn.isRoot ? 'scale-root' : 'scale-tone'"
      />
      <text
        :x="sn.cx"
        :y="sn.cy + 4"
        text-anchor="middle"
        font-size="8"
        font-weight="700"
        class="scale-label"
      >{{ scaleLabelMode === 'degree' ? sn.degree : sn.noteName }}</text>
    </g>

    <!-- Markers -->
    <g v-for="(m, i) in markerPositions" :key="'marker-' + i">
      <circle
        :cx="m.cx"
        :cy="m.cy"
        :r="MARKER_RADIUS"
        :fill="m.color || '#4a6fa5'"
        stroke="white"
        stroke-width="1.5"
        class="marker"
      />
      <text
        v-if="m.label"
        :x="m.cx"
        :y="m.cy + 4"
        text-anchor="middle"
        font-size="10"
        font-weight="700"
        fill="white"
      >{{ m.label }}</text>
    </g>
  </svg>
</template>

<style scoped>
.fretboard-svg {
  cursor: crosshair;
  width: 100%;
  height: auto;
  display: block;
}

.scale-tone {
  fill: var(--color-primary);
  opacity: 0.25;
}

.scale-root {
  fill: #e67e22;
  opacity: 0.5;
}

.scale-label {
  fill: var(--color-text);
  opacity: 0.7;
  pointer-events: none;
}

.marker {
  cursor: pointer;
  transition: opacity 0.15s;
}

.marker:hover {
  opacity: 0.8;
}
</style>
