export type CVDMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale';

export interface ColorSwatch {
  id: string;
  hex: string;
  name?: string;
}

export type PaletteCategory = 'viridis' | 'brewer_qual' | 'brewer_seq' | 'brewer_div' | 'base_r';

export interface PresetPalette {
  id: string;
  name: string;
  category: PaletteCategory;
  type: 'qualitative' | 'sequential' | 'diverging';
  isColorblindSafe: boolean;
  colors: string[];
  maxColors?: number;
  rScaleColor: string;
  rScaleFill: string;
  description: string;
}

export interface ShapeAssignment {
  pch: number;
  color: string;
  fill?: string;
  label?: string;
}

export type ActiveTab = 'custom' | 'preset' | 'gradient' | 'shapes';
