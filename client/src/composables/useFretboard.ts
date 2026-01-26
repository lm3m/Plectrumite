import type { FretMarker } from '../types';

export const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];
export const STRING_COUNT = 6;
export const FRET_SPACING = 50;
export const STRING_SPACING = 24;
export const PADDING = { top: 36, bottom: 30, left: 44, right: 20 };
export const NUT_WIDTH = 4;
export const MARKER_RADIUS = 9;

// Standard dot inlay positions
export const INLAY_FRETS_12 = [3, 5, 7, 9, 12];
export const INLAY_FRETS_24 = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
export const DOUBLE_INLAY_FRETS = [12, 24];

export function computeViewBox(fretCount: 12 | 24): string {
  const width = PADDING.left + fretCount * FRET_SPACING + PADDING.right;
  const height = PADDING.top + (STRING_COUNT - 1) * STRING_SPACING + PADDING.bottom;
  return `0 0 ${width} ${height}`;
}

export function fretX(fret: number): number {
  return PADDING.left + fret * FRET_SPACING;
}

export function stringY(stringNum: number): number {
  // stringNum: 1 = high E (top), 6 = low E (bottom)
  return PADDING.top + (stringNum - 1) * STRING_SPACING;
}

export function markerCenter(fret: number, stringNum: number): { cx: number; cy: number } {
  // Marker sits between the fret and the previous fret
  const cx = fret === 0 ? PADDING.left - 16 : fretX(fret) - FRET_SPACING / 2;
  const cy = stringY(stringNum);
  return { cx, cy };
}

export function findNearestPosition(
  svgX: number,
  svgY: number,
  fretCount: 12 | 24
): { string: number; fret: number } | null {
  // Find nearest string
  let nearestString = 1;
  let minStringDist = Infinity;
  for (let s = 1; s <= STRING_COUNT; s++) {
    const dist = Math.abs(svgY - stringY(s));
    if (dist < minStringDist) {
      minStringDist = dist;
      nearestString = s;
    }
  }
  if (minStringDist > STRING_SPACING * 0.6) return null;

  // Find nearest fret
  let nearestFret = 0;
  let minFretDist = Infinity;

  // Check open string (fret 0)
  const openDist = Math.abs(svgX - (PADDING.left - 16));
  if (openDist < minFretDist) {
    minFretDist = openDist;
    nearestFret = 0;
  }

  for (let f = 1; f <= fretCount; f++) {
    const centerX = fretX(f) - FRET_SPACING / 2;
    const dist = Math.abs(svgX - centerX);
    if (dist < minFretDist) {
      minFretDist = dist;
      nearestFret = f;
    }
  }

  if (minFretDist > FRET_SPACING * 0.6) return null;

  return { string: nearestString, fret: nearestFret };
}

export function toggleMarker(
  markers: FretMarker[],
  string: number,
  fret: number
): FretMarker[] {
  const idx = markers.findIndex(m => m.string === string && m.fret === fret);
  if (idx !== -1) {
    return markers.filter((_, i) => i !== idx);
  }
  return [...markers, { string, fret }];
}
