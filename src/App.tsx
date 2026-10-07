/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Palette, Sparkles, Sliders, Shapes } from 'lucide-react';
import { CVDMode, ColorSwatch, PresetPalette, ShapeAssignment, ActiveTab, ViewMode } from './types/palette';
import { PRESET_PALETTES } from './utils/presets';
import { sampleWithEdgePruning, buildAsymmetricRamp } from './utils/interpolation';
import { RStudioShell } from './components/RStudioShell';
import { HeaderAccessibilityBar } from './components/HeaderAccessibilityBar';
import { CustomPaletteTab } from './components/tabs/CustomPaletteTab';
import { PresetPalettesTab } from './components/tabs/PresetPalettesTab';
import { GradientBuilderTab, GradientAnchorItem } from './components/tabs/GradientBuilderTab';
import { ShapeSelectorTab } from './components/tabs/ShapeSelectorTab';
import { PlotPreviewer } from './components/PlotPreviewer';
import { CodeOutputGenerator } from './components/CodeOutputGenerator';
import { LearnrExercise } from './components/LearnrExercise';
import { RPackageViewerModal } from './components/RPackageViewerModal';

export default function App() {
  // Navigation: 4 clean tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('custom');

  // RStudio Pane view mode (Split IDE vs Standalone Window)
  const [viewMode, setViewMode] = useState<ViewMode>('split_ide');

  // Accessibility State (Default: normal vision)
  const [cvdMode, setCvdMode] = useState<CVDMode>('normal');
  const [colorblindSafeOnly, setColorblindSafeOnly] = useState(false);

  // Tab 1: Custom Palette State (non-destructive, default no names)
  const [customSwatches, setCustomSwatches] = useState<ColorSwatch[]>([
    { id: '1', hex: '#2C3E50', name: 'c1' },
    { id: '2', hex: '#E74C3C', name: 'c2' },
    { id: '3', hex: '#F1C40F', name: 'c3' },
    { id: '4', hex: '#27AE60', name: 'c4' },
  ]);
  const [showNaming, setShowNaming] = useState(false);

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

  // Tab 4: ggplot Shapes State
  const [shapes, setShapes] = useState<ShapeAssignment[]>([
    { pch: 21, color: '#0F172A', fill: '#3B82F6', label: 'g1' },
    { pch: 22, color: '#0F172A', fill: '#10B981', label: 'g2' },
    { pch: 24, color: '#0F172A', fill: '#F59E0B', label: 'g3' },
    { pch: 25, color: '#0F172A', fill: '#8B5CF6', label: 'g4' },
  ]);

  // Modal: R Package Source Inspector & Zip Download
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  // Sampled colors for preset tab
  const sampledPresetColors = useMemo(() => {
    return sampleWithEdgePruning(selectedPreset.colors, presetN, trimStart, trimEnd);
  }, [selectedPreset, presetN, trimStart, trimEnd]);

  // Interpolated colors for gradient builder tab (EXACTLY anchors + intermediate steps)
  const interpolatedGradientColors = useMemo(() => {
    return buildAsymmetricRamp(gradientAnchors);
  }, [gradientAnchors]);

  // Current active colors depending on the active tab
  const activePaletteColors = useMemo(() => {
    if (activeTab === 'custom') {
      return customSwatches.map(s => s.hex);
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
    return ['#2C3E50'];
  }, [activeTab, customSwatches, sampledPresetColors, interpolatedGradientColors, shapes]);

  // Action: Import colors to Custom Palette Tab (Tab 1)
  const handleImportToCustom = (newColors: string[]) => {
    const newSwatches: ColorSwatch[] = newColors.map((hex, idx) => ({
      id: `swatch-${Date.now()}-${idx}`,
      hex: hex.toUpperCase(),
      name: `c${idx + 1}`,
    }));
    setCustomSwatches(newSwatches);
    setActiveTab('custom');
  };

  const isPruned = trimStart > 0 || trimEnd < 100;

  const tabLabels: Record<ActiveTab, string> = {
    custom: 'Custom Palette',
    preset: 'Preset Palettes',
    gradient: 'Gradient Builder',
    shapes: 'ggplot Shapes',
  };

  return (
    <RStudioShell
      viewMode={viewMode}
      setViewMode={setViewMode}
      onOpenPackageModal={() => setIsPackageModalOpen(true)}
      activeTabLabel={tabLabels[activeTab]}
    >
      {/* 1. Global Accessibility Bar */}
      <HeaderAccessibilityBar
        cvdMode={cvdMode}
        setCvdMode={setCvdMode}
        colorblindSafeOnly={colorblindSafeOnly}
        setColorblindSafeOnly={setColorblindSafeOnly}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenPackageModal={() => setIsPackageModalOpen(true)}
      />

      {/* 2. Compact Tab Navigation Bar */}
      <div className="bg-white px-2 pt-2 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette size={12} />
            <span className="truncate">Custom</span>
          </button>

          <button
            onClick={() => setActiveTab('preset')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'preset'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={12} />
            <span className="truncate">Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'gradient'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={12} />
            <span className="truncate">Gradient</span>
          </button>

          <button
            onClick={() => setActiveTab('shapes')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'shapes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shapes size={12} />
            <span className="truncate">Shapes</span>
          </button>
        </div>
      </div>

      {/* 3. Active Tab Content Area */}
      <div className="p-2.5">
        {activeTab === 'custom' && (
          <CustomPaletteTab
            swatches={customSwatches}
            setSwatches={setCustomSwatches}
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
            availableColors={activePaletteColors}
            cvdMode={cvdMode}
          />
        )}
      </div>

      {/* 4. Live ggplot2 Plot Previewer (Automatically switches to scatter for shapes!) */}
      <div className="px-2.5 pb-2">
        <PlotPreviewer
          colors={activePaletteColors}
          cvdMode={cvdMode}
          shapes={shapes}
          activeTab={activeTab}
        />
      </div>

      {/* 5. Live Code Output Generator */}
      <CodeOutputGenerator
        activeTab={activeTab}
        customSwatches={customSwatches}
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
      />

      {/* 6. Learnr Interactive Practice Chunk */}
      <div className="px-2.5 pb-2.5">
        <LearnrExercise
          currentPaletteCode={
            activeTab === 'custom'
              ? (showNaming
                  ? `c(${customSwatches.map(s => `${s.name || 'c'} = "${s.hex}"`).join(', ')})`
                  : `c(${customSwatches.map(s => `"${s.hex}"`).join(', ')})`)
              : activeTab === 'preset'
              ? (isPruned
                  ? `scale_color_manual(values = c(${sampledPresetColors.map(c => `"${c}"`).join(', ')}))`
                  : selectedPreset.rScaleColor)
              : activeTab === 'gradient'
              ? `scale_color_manual(values = c(${interpolatedGradientColors.map(c => `"${c}"`).join(', ')}))`
              : `scale_shape_manual(values = c(${shapes.map(s => s.pch).join(', ')})) + scale_color_manual(values = c(${shapes.map(s => `"${s.color}"`).join(', ')}))`
          }
        />
      </div>

      {/* R Package Source Inspector & Zip Exporter Modal */}
      <RPackageViewerModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />
    </RStudioShell>
  );
}
