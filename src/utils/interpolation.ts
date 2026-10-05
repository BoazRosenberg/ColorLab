import { hexToRgb, rgbToHex } from './cvd';

/**
 * Linearly interpolates between two colors in sRGB space (just like R's colorRamp / colorRampPalette).
 */
export function interpolatePair(hex1: string, hex2: string, factor: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);

  const t = Math.max(0, Math.min(1, factor));
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return rgbToHex(r, g, b);
}

/**
 * Emulates R's colorRampPalette(colors)(n).
 * Generates n discrete evenly spaced hex colors across an array of anchor colors.
 */
export function colorRampPalette(colors: string[], n: number): string[] {
  if (n <= 0) return [];
  if (n === 1) return [colors[0] || '#000000'];
  if (colors.length === 1) return Array(n).fill(colors[0]);

  const numSegments = colors.length - 1;
  const result: string[] = [];

  for (let i = 0; i < n; i++) {
    const globalT = i / (n - 1); // 0 to 1
    const scaledT = globalT * numSegments; // 0 to numSegments
    const segIndex = Math.min(Math.floor(scaledT), numSegments - 1);
    const localT = scaledT - segIndex;

    const c1 = colors[segIndex];
    const c2 = colors[segIndex + 1];
    result.push(interpolatePair(c1, c2, localT));
  }

  return result;
}

/**
 * Samples a continuous or discrete palette with sequential edge pruning.
 * @param colors Array of base colors
 * @param n Number of samples requested
 * @param trimStart 0 to 100 percentage
 * @param trimEnd 0 to 100 percentage
 */
export function sampleWithEdgePruning(
  colors: string[],
  n: number,
  trimStart: number = 0,
  trimEnd: number = 100
): string[] {
  if (n <= 0) return [];
  const startFrac = Math.max(0, Math.min(0.99, trimStart / 100));
  const endFrac = Math.max(startFrac + 0.01, Math.min(1, trimEnd / 100));

  // High-resolution internal sampling (256 samples)
  const fullRamp = colorRampPalette(colors, 256);

  if (n === 1) {
    const midIndex = Math.round(((startFrac + endFrac) / 2) * (fullRamp.length - 1));
    return [fullRamp[midIndex]];
  }

  const result: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const mappedFrac = startFrac + t * (endFrac - startFrac);
    const index = Math.round(mappedFrac * (fullRamp.length - 1));
    result.push(fullRamp[Math.max(0, Math.min(fullRamp.length - 1, index))]);
  }
  return result;
}

/**
 * Builds asymmetric gradient: allows custom number of steps between each pair of adjacent anchors.
 */
export interface AsymmetricAnchor {
  hex: string;
  stepsToNext: number; // steps between this anchor and the next
}

export function buildAsymmetricRamp(anchors: AsymmetricAnchor[]): string[] {
  if (anchors.length === 0) return [];
  if (anchors.length === 1) return [anchors[0].hex];

  const palette: string[] = [];

  for (let i = 0; i < anchors.length - 1; i++) {
    const current = anchors[i];
    const next = anchors[i + 1];
    const steps = Math.max(0, current.stepsToNext ?? 2);

    // Add current anchor if first segment
    if (i === 0) {
      palette.push(current.hex);
    }

    // Add exact number of intermediate step colors
    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      palette.push(interpolatePair(current.hex, next.hex, t));
    }

    // Add next anchor
    palette.push(next.hex);
  }

  return palette;
}
