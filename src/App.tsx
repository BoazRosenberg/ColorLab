/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Palette, Sparkles, Sliders, Shapes, Paintbrush } from 'lucide-react';
import {
  CVDMode,
  ColorSwatch,
  NamedCustomPalette,
  PresetPalette,
  ShapeAssignment,
  ThemeSettings,
  ActiveTab,
} from './types/palette';
import { PRESET_PALETTES } from './utils/presets';
import { sampleWithEdgePruning, buildAsymmetricRamp } from './utils/interpolation';
import { DEFAULT_THEME_SETTINGS } from './utils/themes';
import { HeaderAccessibilityBar } from './components/HeaderAccessibilityBar';
import { CustomPaletteTab } from './components/tabs/CustomPaletteTab';
import { PresetPalettesTab } from './components/tabs/PresetPalettesTab';
import { GradientBuilderTab, GradientAnchorItem } from './components/tabs/GradientBuilderTab';
import { ShapeSelectorTab } from './components/tabs/ShapeSelectorTab';
import { ThemeBuilderTab } from './components/tabs/ThemeBuilderTab';
import { PlotPreviewer } from './components/PlotPreviewer';
import { CodeOutputGenerator } from './components/CodeOutputGenerator';

export default function App() {
  // Navigation: 5 clean tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('custom');

  // Accessibility State (Default: normal vision)
  const [cvdMode, setCvdMode] = useState<CVDMode>('normal');
  const [colorblindSafeOnly, setColorblindSafeOnly] = useState(false);

  // Tab 1: Multiple Named Custom Palettes State (Default: single palette "my_palette", default no labels)
  const [palettes, setPalettes] = useState<NamedCustomPalette[]>([
    {
      id: 'p1',
      name: 'my_palette',
      swatches: [
        { id: '1', hex: '#2C3E50', name: 'c1' },
        { id: '2', hex: '#E74C3C', name: 'c2' },
        { id: '3', hex: '#F1C40F', name: 'c3' },
        { id: '4', hex: '#27AE60', name: 'c4' },
      ],
    },
  ]);
  const [activePaletteId, setActivePaletteId] = useState<string>('p1');
  const [showNaming, setShowNaming] = useState<boolean>(false);

  const activeCustomPalette = useMemo(() => {
    return palettes.find(p => p.id === activePaletteId) || palettes[0];
  }, [palettes, activePaletteId]);

  // Tab 2: Preset Palettes State (Defaults to Okabe-Ito gold standard)
  const [selectedPreset, setSelectedPreset] = useState<PresetPalette>(
    PRESET_PALETTES.find(p => p.id === 'okabe_ito') || PRESET_PALETTES[0]
  );
  const [presetN, setPresetN] = useState<number>(5);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(100);

  // Tab 3: Multi-Anchor Gradient State
  const [gradientAnchors, setGradientAnchors] = useState<GradientAnchorItem[]>([
    { id: 'a1', hex: '#2C3E50', name: 'K1', stepsToNext: 2 },
    { id: 'a2', hex: '#E74C3C', name: 'K2', stepsToNext: 2 },
    { id: 'a3', hex: '#F1C40F', name: 'K3', stepsToNext: 2 },
  ]);

  // Tab 4: ggplot Shapes State (Default: simple solid shapes, all same color, no labels by default)
  const [shapes, setShapes] = useState<ShapeAssignment[]>([
    { pch: 16, color: '#1E293B', label: 'Class 1' },
    { pch: 17, color: '#1E293B', label: 'Class 2' },
    { pch: 15, color: '#1E293B', label: 'Class 3' },
    { pch: 18, color: '#1E293B', label: 'Class 4' },
  ]);
  const [showShapeLabels, setShowShapeLabels] = useState<boolean>(false);

  // Tab 5: ggplot Theme Builder State
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [showFacetPreview, setShowFacetPreview] = useState<boolean>(false);

  // Multiple palette management actions
  const handleCreatePalette = () => {
    const newId = `p-${Date.now()}`;
    const newPalette: NamedCustomPalette = {
      id: newId,
      name: `palette_${palettes.length + 1}`,
      swatches: [
        { id: `sw-${Date.now()}-1`, hex: '#3B82F6', name: 'c1' },
        { id: `sw-${Date.now()}-2`, hex: '#10B981', name: 'c2' },
        { id: `sw-${Date.now()}-3`, hex: '#F59E0B', name: 'c3' },
      ],
    };
    setPalettes(prev => [...prev, newPalette]);
    setActivePaletteId(newId);
  };

  const handleRenamePalette = (id: string, newName: string) => {
    setPalettes(prev =>
      prev.map(p => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleDeletePalette = (id: string) => {
    if (palettes.length <= 1) return;
    const remaining = palettes.filter(p => p.id !== id);
    setPalettes(remaining);
    if (activePaletteId === id) {
      setActivePaletteId(remaining[0].id);
    }
  };

  const handleDuplicatePalette = (id: string) => {
    const source = palettes.find(p => p.id === id);
    if (!source) return;
    const newId = `p-${Date.now()}`;
    const dup: NamedCustomPalette = {
      id: newId,
      name: `${source.name}_copy`,
      swatches: source.swatches.map((s, idx) => ({
        ...s,
        id: `sw-${Date.now()}-${idx}`,
      })),
    };
    setPalettes(prev => [...prev, dup]);
    setActivePaletteId(newId);
  };

  const handleUpdateSwatches = (newSwatches: ColorSwatch[]) => {
    setPalettes(prev =>
      prev.map(p =>
        p.id === activeCustomPalette.id ? { ...p, swatches: newSwatches } : p
      )
    );
  };

  // Sampled colors for preset tab
  const sampledPresetColors = useMemo(() => {
    return sampleWithEdgePruning(selectedPreset.colors, presetN, trimStart, trimEnd);
  }, [selectedPreset, presetN, trimStart, trimEnd]);

  // Interpolated colors for gradient builder tab
  const interpolatedGradientColors = useMemo(() => {
    return buildAsymmetricRamp(gradientAnchors);
  }, [gradientAnchors]);

  // Current active colors depending on the active tab
  const activePaletteColors = useMemo(() => {
    if (activeTab === 'custom') {
      return activeCustomPalette.swatches.map(s => s.hex);
    }
    if (activeTab === 'preset') {
      return sampledPresetColors;
    }
    if (activeTab === 'gradient') {
      return interpolatedGradientColors;
    }
    if (activeTab === 'shapes') {
      return shapes.map(s => s.color);
    }
    if (activeTab === 'themes') {
      return activeCustomPalette.swatches.map(s => s.hex);
    }
    return ['#2C3E50'];
  }, [activeTab, activeCustomPalette, sampledPresetColors, interpolatedGradientColors, shapes]);

  // Action: Import colors to active custom palette
  const handleImportToCustom = (newColors: string[]) => {
    const newSwatches: ColorSwatch[] = newColors.map((hex, idx) => ({
      id: `swatch-${Date.now()}-${idx}`,
      hex: hex.toUpperCase(),
      name: `c${idx + 1}`,
    }));
    handleUpdateSwatches(newSwatches);
    setActiveTab('custom');
  };

  const isPruned = trimStart > 0 || trimEnd < 100;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800 font-sans antialiased">
      <div className="w-full max-w-[460px] bg-white border-x border-slate-200 shadow-sm flex flex-col min-h-screen">
        {/* 1. Header with ColorLab Title and CVD Simulation */}
        <HeaderAccessibilityBar
          cvdMode={cvdMode}
          setCvdMode={setCvdMode}
          colorblindSafeOnly={colorblindSafeOnly}
          setColorblindSafeOnly={setColorblindSafeOnly}
        />

        {/* 2. Compact Tab Navigation Bar (5 tabs) */}
        <div className="bg-white px-2 pt-2 border-b border-slate-200">
          <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center justify-center gap-1 py-1.5 px-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette size={11} />
              <span className="truncate">Custom</span>
            </button>

            <button
              onClick={() => setActiveTab('preset')}
              className={`flex items-center justify-center gap-1 py-1.5 px-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders size={11} />
              <span className="truncate">Presets</span>
            </button>

            <button
              onClick={() => setActiveTab('gradient')}
              className={`flex items-center justify-center gap-1 py-1.5 px-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'gradient'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={11} />
              <span className="truncate">Gradient</span>
            </button>

            <button
              onClick={() => setActiveTab('shapes')}
              className={`flex items-center justify-center gap-1 py-1.5 px-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'shapes'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shapes size={11} />
              <span className="truncate">Shapes</span>
            </button>

            <button
              onClick={() => setActiveTab('themes')}
              className={`flex items-center justify-center gap-1 py-1.5 px-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'themes'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Paintbrush size={11} />
              <span className="truncate">Themes</span>
            </button>
          </div>
        </div>

        {/* 3. Active Tab Content Area */}
        <div className="p-2.5 flex-1 space-y-2.5">
          {activeTab === 'custom' && (
            <CustomPaletteTab
              palettes={palettes}
              activePaletteId={activePaletteId}
              setActivePaletteId={setActivePaletteId}
              onUpdatePaletteName={handleRenamePalette}
              onCreatePalette={handleCreatePalette}
              onDeletePalette={handleDeletePalette}
              onDuplicatePalette={handleDuplicatePalette}
              swatches={activeCustomPalette.swatches}
              setSwatches={handleUpdateSwatches}
              cvdMode={cvdMode}
              showNaming={showNaming}
              setShowNaming={setShowNaming}
            />
          )}

          {activeTab === 'preset' && (
            <PresetPalettesTab
              selectedPreset={selectedPreset}
              setSelectedPreset={setSelectedPreset}
              presetN={presetN}
              setPresetN={setPresetN}
              sampledColors={sampledPresetColors}
              trimStart={trimStart}
              setTrimStart={setTrimStart}
              trimEnd={trimEnd}
              setTrimEnd={setTrimEnd}
              cvdMode={cvdMode}
              colorblindSafeOnly={colorblindSafeOnly}
              onImportToCustom={handleImportToCustom}
            />
          )}

          {activeTab === 'gradient' && (
            <GradientBuilderTab
              anchors={gradientAnchors}
              setAnchors={setGradientAnchors}
              interpolatedColors={interpolatedGradientColors}
              cvdMode={cvdMode}
              onImportToCustom={handleImportToCustom}
            />
          )}

          {activeTab === 'shapes' && (
            <ShapeSelectorTab
              shapes={shapes}
              setShapes={setShapes}
              customPalettes={palettes}
              cvdMode={cvdMode}
              showShapeLabels={showShapeLabels}
              setShowShapeLabels={setShowShapeLabels}
            />
          )}

          {activeTab === 'themes' && (
            <ThemeBuilderTab
              themeSettings={themeSettings}
              setThemeSettings={setThemeSettings}
              showFacetPreview={showFacetPreview}
              setShowFacetPreview={setShowFacetPreview}
            />
          )}

          {/* 4. Live ggplot2 Plot Previewer with Theme Styling */}
          <PlotPreviewer
            colors={activePaletteColors}
            cvdMode={cvdMode}
            shapes={shapes}
            activeTab={activeTab}
            showShapeLabels={showShapeLabels}
            themeSettings={themeSettings}
            showFacetPreview={showFacetPreview}
            onUpdateFacetName={(facetNum, name) => {
              setThemeSettings(prev => ({
                ...prev,
                [facetNum === 1 ? 'facet1Name' : 'facet2Name']: name,
              }));
            }}
          />
        </div>

        {/* 5. Live Code Output Generator with 1-Click Copy */}
        <CodeOutputGenerator
          activeTab={activeTab}
          activeCustomPalette={activeCustomPalette}
          showNaming={showNaming}
          selectedPreset={selectedPreset}
          presetN={presetN}
          sampledPresetColors={sampledPresetColors}
          isPruned={isPruned}
          trimStart={trimStart}
          trimEnd={trimEnd}
          gradientAnchors={gradientAnchors}
          interpolatedGradientColors={interpolatedGradientColors}
          shapes={shapes}
          showShapeLabels={showShapeLabels}
          themeSettings={themeSettings}
        />
      </div>
    </div>
  );
}
