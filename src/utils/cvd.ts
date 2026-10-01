import { CVDMode } from '../types/palette';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parses a hex color string into 0-255 RGB components.
 */
export function hexToRgb(hex: string): RGB {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts 0-255 RGB components to an uppercase 6-character hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (c: number) => clamp(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Gamma expand (sRGB [0..255] to linear [0..1])
 */
function sRgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Gamma compress (linear [0..1] to sRGB [0..255])
 */
function linearToSRgb(v: number): number {
  const clamped = Math.max(0, Math.min(1, v));
  const c = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

/**
 * Simulates Color Vision Deficiency (CVD) using Brettel/Vienot/Machado LMS matrices.
 * Matches R's colorspace::protan(), colorspace::deutan(), colorspace::tritan(), colorspace::desaturate().
 */
export function simulateCVD(hex: string, mode: CVDMode): string {
  if (mode === 'normal') return hex;

  const rgb = hexToRgb(hex);

  if (mode === 'grayscale') {
    // Rec. 709 luminance weights
    const gray = Math.round(0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b);
    return rgbToHex(gray, gray, gray);
  }

  // Linear RGB
  const lr = sRgbToLinear(rgb.r);
  const lg = sRgbToLinear(rgb.g);
  const lb = sRgbToLinear(rgb.b);

  // Linear RGB to LMS
  const L = 0.31399022 * lr + 0.63951294 * lg + 0.04649755 * lb;
  const M = 0.15537241 * lr + 0.75789446 * lg + 0.08670142 * lb;
  const S = 0.01775239 * lr + 0.10944209 * lg + 0.87256922 * lb;

  let simL = L;
  let simM = M;
  let simS = S;

  if (mode === 'protanopia') {
    // Missing L-cones: project along dichromatic line
    simL = 1.05118294 * M - 0.05116099 * S;
    simM = M;
    simS = S;
  } else if (mode === 'deuteranopia') {
    // Missing M-cones
    simL = L;
    simM = 0.9513092 * L + 0.04866992 * S;
    simS = S;
  } else if (mode === 'tritanopia') {
    // Missing S-cones
    simL = L;
    simM = M;
    simS = -0.86744736 * L + 1.86727089 * M;
  }

  // LMS to Linear RGB
  const outLr = 5.47221206 * simL - 4.6419601 * simM + 0.16963708 * simS;
  const outLg = -1.1252419 * simL + 2.29317094 * simM - 0.1678952 * simS;
  const outLb = 0.02980165 * simL - 0.19318073 * simM + 1.16364789 * simS;

  return rgbToHex(
    linearToSRgb(outLr),
    linearToSRgb(outLg),
    linearToSRgb(outLb)
  );
}

/**
 * Computes relative luminance according to WCAG 2.1 specifications.
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

/**
 * Computes contrast ratio between two hex colors.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns true if text on this background should be dark for optimal legibility.
 */
export function shouldUseDarkText(backgroundHex: string): boolean {
  return getRelativeLuminance(backgroundHex) > 0.35;
}
