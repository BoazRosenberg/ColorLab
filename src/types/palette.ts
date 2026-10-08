export type CVDMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale';

export interface ColorSwatch {
  id: string;
  hex: string;
  name?: string;
}

export interface NamedCustomPalette {
  id: string;
  name: string;
  swatches: ColorSwatch[];
}

export type PaletteCategory = 'viridis' | 'brewer_qual' | 'brewer_seq' | 'brewer_div' | 'base_r';

export interface PresetPalette {
  id: string;
  name: string;
  package?: string;
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

export interface ShapeDefinition {
  pch: number;
  name: string;
  category: 'open' | 'special' | 'solid' | 'fillable' | 'filled_bordered';
  hasBorderAndFill: boolean;
  description: string;
}

export type BaseThemeName =
  | 'minimal'
  | 'classic'
  | 'bw'
  | 'light'
  | 'dark'
  | 'gray'
  | 'void';

export type FontFamily = 'sans' | 'serif' | 'mono';
export type TitleFace = 'plain' | 'bold' | 'italic';
export type GridLinetype = 'solid' | 'dashed' | 'dotted';
export type LegendPosition = 'none' | 'right' | 'bottom' | 'left' | 'top';
export type ScaleFormatting = 'normal' | 'percent' | 'log10' | 'comma';

export interface ThemeSettings {
  baseTheme: BaseThemeName;
  baseSize: number;
  fontFamily: FontFamily;
  titleFace: TitleFace;

  // Background
  isTransparentBackground: boolean;
  plotBackground: string;
  panelBackground: string;
  hasPanelBorder: boolean;
  panelBorderColor: string;
  hasAxisLine: boolean;
  axisLineColor: string;

  // Gridlines & Ticks
  showMajorGrid: boolean;
  majorGridColor: string;
  majorGridLinetype: GridLinetype;
  showMinorGrid: boolean;
  minorGridColor: string;
  showTicks: boolean;
  ticksColor: string;
  scaleFormatting: ScaleFormatting;

  // Faceting
  facetStripBackground: string;
  isFacetStripTransparent: boolean;
  facetStripTextColor: string;
  facetStripTextBold: boolean;
  facetStripBorder: boolean;
  facet1Name?: string;
  facet2Name?: string;

  // Legend
  legendPosition: LegendPosition;
  isLegendTransparent: boolean;
  legendBackground: string;
}

export type ActiveTab = 'custom' | 'preset' | 'gradient' | 'shapes' | 'themes';

export type ViewMode = 'split_ide' | 'narrow_pane' | 'package_inspector';
