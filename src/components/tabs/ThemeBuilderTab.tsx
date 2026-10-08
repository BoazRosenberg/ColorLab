import React, { useState } from 'react';
import {
  Sparkles,
  Type,
  Maximize2,
  Grid,
  Columns,
  Compass,
  RotateCcw,
} from 'lucide-react';
import {
  ThemeSettings,
  BaseThemeName,
  FontFamily,
  TitleFace,
  GridLinetype,
  LegendPosition,
  ScaleFormatting,
} from '../../types/palette';
import { BASE_THEMES, DEFAULT_THEME_SETTINGS } from '../../utils/themes';

interface ThemeBuilderTabProps {
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  showFacetPreview: boolean;
  setShowFacetPreview: (val: boolean) => void;
}

export const ThemeBuilderTab: React.FC<ThemeBuilderTabProps> = ({
  themeSettings,
  setThemeSettings,
  showFacetPreview,
  setShowFacetPreview,
}) => {
  const [activeSection, setActiveSection] = useState<
    'canvas' | 'typography' | 'grid' | 'facets' | 'legend'
  >('canvas');

  // Select base starting theme
  const handleSelectBaseTheme = (themeId: BaseThemeName) => {
    const selected = BASE_THEMES.find(t => t.id === themeId);
    if (!selected) return;

    setThemeSettings(prev => ({
      ...prev,
      baseTheme: themeId,
      ...selected.settings,
    }));
  };

  const handleReset = () => {
    setThemeSettings(DEFAULT_THEME_SETTINGS);
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Base Starting Theme Selector Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Sparkles size={12} className="text-blue-600" />
            <span>Starting Theme</span>
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
            title="Reset theme to default minimal"
          >
            <RotateCcw size={10} />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
          {BASE_THEMES.map((theme) => {
            const isActive = themeSettings.baseTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectBaseTheme(theme.id)}
                className={`py-1 px-1 rounded text-[11px] font-medium transition-all cursor-pointer truncate ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={theme.description}
              >
                {theme.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-section Tabs */}
      <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
        <button
          onClick={() => setActiveSection('canvas')}
          className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeSection === 'canvas'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Maximize2 size={11} />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setActiveSection('typography')}
          className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeSection === 'typography'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Type size={11} />
          <span>Font</span>
        </button>

        <button
          onClick={() => setActiveSection('grid')}
          className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeSection === 'grid'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid size={11} />
          <span>Grid/Ticks</span>
        </button>

        <button
          onClick={() => setActiveSection('facets')}
          className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeSection === 'facets'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Columns size={11} />
          <span>Facets</span>
        </button>

        <button
          onClick={() => setActiveSection('legend')}
          className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeSection === 'legend'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass size={11} />
          <span>Legend</span>
        </button>
      </div>

      {/* 3. Section Content Panels */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2 text-xs">
        {/* SECTION: Canvas & Backgrounds */}
        {activeSection === 'canvas' && (
          <div className="space-y-2.5">
            {/* Transparent background toggle */}
            <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded">
              <div>
                <div className="font-semibold text-slate-800 text-[11px]">
                  Transparent Background
                </div>
                <div className="text-[10px] text-slate-500">
                  Ideal for exporting PNGs without white boxes
                </div>
              </div>
              <input
                type="checkbox"
                checked={themeSettings.isTransparentBackground}
                onChange={(e) =>
                  setThemeSettings(prev => ({
                    ...prev,
                    isTransparentBackground: e.target.checked,
                  }))
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-0 h-4 w-4 cursor-pointer"
              />
            </div>

            {/* Background colors */}
            {!themeSettings.isTransparentBackground && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Plot Background
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={themeSettings.plotBackground}
                      onChange={(e) =>
                        setThemeSettings(prev => ({ ...prev, plotBackground: e.target.value }))
                      }
                      className="w-5 h-5 rounded border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={themeSettings.plotBackground}
                      onChange={(e) =>
                        setThemeSettings(prev => ({ ...prev, plotBackground: e.target.value }))
                      }
                      className="w-16 text-[10px] font-mono px-1 py-0.5 border border-slate-200 rounded text-center uppercase"
                    />
                  </div>
                </div>

                <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Panel (Data Area)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={themeSettings.panelBackground}
                      onChange={(e) =>
                        setThemeSettings(prev => ({ ...prev, panelBackground: e.target.value }))
                      }
                      className="w-5 h-5 rounded border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={themeSettings.panelBackground}
                      onChange={(e) =>
                        setThemeSettings(prev => ({ ...prev, panelBackground: e.target.value }))
                      }
                      className="w-16 text-[10px] font-mono px-1 py-0.5 border border-slate-200 rounded text-center uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Outlines: Panel Border & Axis Lines */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Panel Box Border
                  </span>
                  <span className="text-[10px] text-slate-400">Enclose plot</span>
                </div>
                <div className="flex items-center gap-1">
                  {themeSettings.hasPanelBorder && (
                    <input
                      type="color"
                      value={themeSettings.panelBorderColor}
                      onChange={(e) =>
                        setThemeSettings(prev => ({ ...prev, panelBorderColor: e.target.value }))
                      }
                      className="w-4 h-4 rounded border-0 cursor-pointer p-0"
                    />
                  )}
                  <input
                    type="checkbox"
                    checked={themeSettings.hasPanelBorder}
                    onChange={(e) =>
                      setThemeSettings(prev => ({ ...prev, hasPanelBorder: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Axis Lines (L-shape)
                  </span>
                  <span className="text-[10px] text-slate-400">Classic X/Y</span>
                </div>
                <div className="flex items-center gap-1">
                  {themeSettings.hasAxisLine && (
                    <input
                      type="color"
                      value={themeSettings.axisLineColor}
                      onChange={(e) =>
                        setThemeSettings(prev => ({ ...prev, axisLineColor: e.target.value }))
                      }
                      className="w-4 h-4 rounded border-0 cursor-pointer p-0"
                    />
                  )}
                  <input
                    type="checkbox"
                    checked={themeSettings.hasAxisLine}
                    onChange={(e) =>
                      setThemeSettings(prev => ({ ...prev, hasAxisLine: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Typography */}
        {activeSection === 'typography' && (
          <div className="space-y-2.5">
            {/* Font family */}
            <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Base Font Family
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['sans', 'serif', 'mono'] as FontFamily[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setThemeSettings(prev => ({ ...prev, fontFamily: f }))}
                    className={`py-1 rounded text-[11px] font-medium capitalize cursor-pointer border ${
                      themeSettings.fontFamily === f
                        ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Base font size */}
            <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-500 uppercase">
                  Base Font Size (base_size)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {themeSettings.baseSize} pt
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={18}
                step={1}
                value={themeSettings.baseSize}
                onChange={(e) =>
                  setThemeSettings(prev => ({ ...prev, baseSize: Number(e.target.value) }))
                }
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
              />
            </div>

            {/* Title font face */}
            <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Plot Title Face
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['plain', 'bold', 'italic'] as TitleFace[]).map((face) => (
                  <button
                    key={face}
                    onClick={() => setThemeSettings(prev => ({ ...prev, titleFace: face }))}
                    className={`py-1 rounded text-[11px] font-medium capitalize cursor-pointer border ${
                      themeSettings.titleFace === face
                        ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {face}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Gridlines & Ticks & Special Scales */}
        {activeSection === 'grid' && (
          <div className="space-y-2.5">
            {/* Major grid */}
            <div className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Major Gridlines
                </span>
                <span className="text-[10px] text-slate-400">Primary tick marks</span>
              </div>
              <div className="flex items-center gap-1.5">
                {themeSettings.showMajorGrid && (
                  <>
                    <input
                      type="color"
                      value={themeSettings.majorGridColor}
                      onChange={(e) =>
                        setThemeSettings(prev => ({ ...prev, majorGridColor: e.target.value }))
                      }
                      className="w-4 h-4 rounded border-0 cursor-pointer p-0"
                    />
                    <select
                      value={themeSettings.majorGridLinetype}
                      onChange={(e) =>
                        setThemeSettings(prev => ({
                          ...prev,
                          majorGridLinetype: e.target.value as GridLinetype,
                        }))
                      }
                      className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </>
                )}
                <input
                  type="checkbox"
                  checked={themeSettings.showMajorGrid}
                  onChange={(e) =>
                    setThemeSettings(prev => ({ ...prev, showMajorGrid: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
                />
              </div>
            </div>

            {/* Minor grid */}
            <div className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Minor Gridlines
                </span>
                <span className="text-[10px] text-slate-400">Sub-intervals</span>
              </div>
              <div className="flex items-center gap-1.5">
                {themeSettings.showMinorGrid && (
                  <input
                    type="color"
                    value={themeSettings.minorGridColor}
                    onChange={(e) =>
                      setThemeSettings(prev => ({ ...prev, minorGridColor: e.target.value }))
                    }
                    className="w-4 h-4 rounded border-0 cursor-pointer p-0"
                  />
                )}
                <input
                  type="checkbox"
                  checked={themeSettings.showMinorGrid}
                  onChange={(e) =>
                    setThemeSettings(prev => ({ ...prev, showMinorGrid: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
                />
              </div>
            </div>

            {/* Axis Ticks */}
            <div className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Axis Ticks
                </span>
                <span className="text-[10px] text-slate-400">Tick notches along axis</span>
              </div>
              <div className="flex items-center gap-1.5">
                {themeSettings.showTicks && (
                  <input
                    type="color"
                    value={themeSettings.ticksColor}
                    onChange={(e) =>
                      setThemeSettings(prev => ({ ...prev, ticksColor: e.target.value }))
                    }
                    className="w-4 h-4 rounded border-0 cursor-pointer p-0"
                  />
                )}
                <input
                  type="checkbox"
                  checked={themeSettings.showTicks}
                  onChange={(e) =>
                    setThemeSettings(prev => ({ ...prev, showTicks: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
                />
              </div>
            </div>

            {/* Special Scales Formatting */}
            <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Scale Formatter (scales::...)
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { id: 'normal', label: 'Linear' },
                    { id: 'percent', label: 'Percent %' },
                    { id: 'log10', label: 'Log10' },
                    { id: 'comma', label: 'Comma ,' },
                  ] as Array<{ id: ScaleFormatting; label: string }>
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() =>
                      setThemeSettings(prev => ({ ...prev, scaleFormatting: fmt.id }))
                    }
                    className={`py-1 rounded text-[10px] font-medium cursor-pointer border ${
                      themeSettings.scaleFormatting === fmt.id
                        ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Facets & Strips */}
        {activeSection === 'facets' && (
          <div className="space-y-2.5">
            {/* Toggle to preview facets in live plot */}
            <div className="flex items-center justify-between p-1.5 bg-blue-50/60 border border-blue-200 rounded">
              <div>
                <div className="font-semibold text-blue-900 text-[11px]">
                  Preview Faceted Plot
                </div>
                <div className="text-[10px] text-blue-700">
                  Splits live preview into two facet panels (Group A / B)
                </div>
              </div>
              <input
                type="checkbox"
                checked={showFacetPreview}
                onChange={(e) => setShowFacetPreview(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-0 h-4 w-4 cursor-pointer"
              />
            </div>

            {/* Facet Names Inputs */}
            <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Facet Panel Labels
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Facet 1 Name</span>
                  <input
                    type="text"
                    value={themeSettings.facet1Name ?? 'Group A'}
                    onChange={(e) =>
                      setThemeSettings(prev => ({ ...prev, facet1Name: e.target.value }))
                    }
                    placeholder="Group A"
                    className="w-full text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Facet 2 Name</span>
                  <input
                    type="text"
                    value={themeSettings.facet2Name ?? 'Group B'}
                    onChange={(e) =>
                      setThemeSettings(prev => ({ ...prev, facet2Name: e.target.value }))
                    }
                    placeholder="Group B"
                    className="w-full text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Preset Pairs */}
              <div>
                <span className="text-[9.5px] text-slate-400 block mb-1">Quick Presets:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    ['Group A', 'Group B'],
                    ['Treatment', 'Control'],
                    ['2025', '2026'],
                    ['Before', 'After'],
                    ['Cohort 1', 'Cohort 2'],
                  ].map(([f1, f2]) => (
                    <button
                      key={`${f1}-${f2}`}
                      type="button"
                      onClick={() =>
                        setThemeSettings(prev => ({
                          ...prev,
                          facet1Name: f1,
                          facet2Name: f2,
                        }))
                      }
                      className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {f1} / {f2}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Facet strip background */}
            <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Strip Background Color
                </span>
                <label className="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={themeSettings.isFacetStripTransparent}
                    onChange={(e) =>
                      setThemeSettings(prev => ({
                        ...prev,
                        isFacetStripTransparent: e.target.checked,
                      }))
                    }
                    className="rounded h-3 w-3"
                  />
                  <span>Transparent</span>
                </label>
              </div>

              {!themeSettings.isFacetStripTransparent && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeSettings.facetStripBackground}
                    onChange={(e) =>
                      setThemeSettings(prev => ({
                        ...prev,
                        facetStripBackground: e.target.value,
                      }))
                    }
                    className="w-5 h-5 rounded border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={themeSettings.facetStripBackground}
                    onChange={(e) =>
                      setThemeSettings(prev => ({
                        ...prev,
                        facetStripBackground: e.target.value,
                      }))
                    }
                    className="w-20 text-[10px] font-mono px-1 py-0.5 border border-slate-200 rounded text-center uppercase"
                  />
                </div>
              )}
            </div>

            {/* Strip text color & styling */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Strip Text Color
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={themeSettings.facetStripTextColor}
                    onChange={(e) =>
                      setThemeSettings(prev => ({
                        ...prev,
                        facetStripTextColor: e.target.value,
                      }))
                    }
                    className="w-5 h-5 rounded border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={themeSettings.facetStripTextColor}
                    onChange={(e) =>
                      setThemeSettings(prev => ({
                        ...prev,
                        facetStripTextColor: e.target.value,
                      }))
                    }
                    className="w-16 text-[10px] font-mono px-1 py-0.5 border border-slate-200 rounded text-center uppercase"
                  />
                </div>
              </div>

              <div className="p-1.5 bg-white border border-slate-200 rounded flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Strip Options
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.facetStripTextBold}
                      onChange={(e) =>
                        setThemeSettings(prev => ({
                          ...prev,
                          facetStripTextBold: e.target.checked,
                        }))
                      }
                      className="rounded h-3.5 w-3.5 text-blue-600"
                    />
                    <span>Bold</span>
                  </label>
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.facetStripBorder}
                      onChange={(e) =>
                        setThemeSettings(prev => ({
                          ...prev,
                          facetStripBorder: e.target.checked,
                        }))
                      }
                      className="rounded h-3.5 w-3.5 text-blue-600"
                    />
                    <span>Border</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Legend */}
        {activeSection === 'legend' && (
          <div className="space-y-2.5">
            {/* Legend position */}
            <div className="p-1.5 bg-white border border-slate-200 rounded space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Legend Position (legend.position)
              </span>
              <div className="grid grid-cols-5 gap-1">
                {(['right', 'bottom', 'top', 'left', 'none'] as LegendPosition[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() =>
                      setThemeSettings(prev => ({ ...prev, legendPosition: pos }))
                    }
                    className={`py-1 rounded text-[11px] font-medium capitalize cursor-pointer border ${
                      themeSettings.legendPosition === pos
                        ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend background */}
            {themeSettings.legendPosition !== 'none' && (
              <div className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Legend Box Fill
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Transparent or solid background
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!themeSettings.isLegendTransparent && (
                    <input
                      type="color"
                      value={themeSettings.legendBackground}
                      onChange={(e) =>
                        setThemeSettings(prev => ({
                          ...prev,
                          legendBackground: e.target.value,
                        }))
                      }
                      className="w-4 h-4 rounded border-0 cursor-pointer p-0"
                    />
                  )}
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.isLegendTransparent}
                      onChange={(e) =>
                        setThemeSettings(prev => ({
                          ...prev,
                          isLegendTransparent: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>Transparent</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
