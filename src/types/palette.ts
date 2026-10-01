export type CVDMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale';

export interface ColorSwatch {
  id: string;
  hex: string;
  name?: string;
}

export type PaletteCategory = 'viridis' | 'brewer_qual' | 'brewer_seq' | 'brewer_div' | 'base_r' | 'ggplot2' | 'accessible';

export interface PresetPalette {
  id: string;
  name: string;
  package: string;
  category: PaletteCategory;
  type: 'qualitative' | 'sequential' | 'diverging';
  isColorblindSafe: boolean;
  colors: string[]; // Reference colors or generator base
  description: string;
  rScaleColor: string; // e.g. 'scale_color_viridis_d()'
  rScaleFill: string;  // e.g. 'scale_fill_viridis_d()'
}

export interface GradientAnchor {
  id: string;
  hex: string;
  name: string;
  stepsToNext: number; // Individual steps to the next adjacent anchor
}

export interface ShapeDefinition {
  pch: number;
  name: string;
  category: 'open' | 'special' | 'solid' | 'filled_bordered';
  hasBorderAndFill: boolean;
  description: string;
}

export interface ShapeAssignment {
  pch: number;
  color: string;
  fill?: string;
  label: string;
}

export type ActiveTab = 'custom' | 'preset' | 'gradient' | 'shapes';

export type PlotType = 'scatter' | 'bar' | 'heatmap' | 'density';

export type GGTheme = 'theme_minimal' | 'theme_bw' | 'theme_classic' | 'theme_dark' | 'theme_light';
