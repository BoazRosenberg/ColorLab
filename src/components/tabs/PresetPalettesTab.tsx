import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { PresetPalette, CVDMode } from '../../types/palette';
import { PRESET_PALETTES } from '../../utils/presets';
import { simulateCVD } from '../../utils/cvd';

interface PresetPalettesTabProps {
  selectedPreset: PresetPalette;
  setSelectedPreset: (preset: PresetPalette) => void;
  presetN: number;
  setPresetN: (n: number) => void;
  sampledColors: string[];
  trimStart: number;
  setTrimStart: (val: number) => void;
  trimEnd: number;
  setTrimEnd: (val: number) => void;
  cvdMode: CVDMode;
  colorblindSafeOnly: boolean;
  onImportToCustom: (colors: string[]) => void;
}

export const PresetPalettesTab: React.FC<PresetPalettesTabProps> = ({
  selectedPreset,
  setSelectedPreset,
  presetN,
  setPresetN,
  sampledColors,
  trimStart,
  setTrimStart,
  trimEnd,
  setTrimEnd,
  cvdMode,
  colorblindSafeOnly,
  onImportToCustom,
}) => {
  // Sub-tab: qualitative vs sequential vs diverging
  const [subType, setSubType] = useState<'qualitative' | 'sequential' | 'diverging'>(selectedPreset.type);
  const [showPruning, setShowPruning] = useState(false);

  // Palettes filtered by chosen subType and colorblind safe filter
  const filteredPalettes = PRESET_PALETTES.filter(p => {
    if (p.type !== subType) return false;
    if (colorblindSafeOnly && !p.isColorblindSafe) return false;
    return true;
  });

  const handleSubTabChange = (type: 'qualitative' | 'sequential' | 'diverging') => {
    setSubType(type);
    const candidate = PRESET_PALETTES.find(p => p.type === type && (!colorblindSafeOnly || p.isColorblindSafe));
    if (candidate) {
      setSelectedPreset(candidate);
    }
  };

  const isPruned = trimStart > 0 || trimEnd < 100;

  return (
    <div className="space-y-2.5">
      {/* Sub-tab segmented toggle: Qualitative vs Sequential vs Diverging */}
      <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
        <button
          onClick={() => handleSubTabChange('qualitative')}
          className={`py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
            subType === 'qualitative' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Qualitative
        </button>
        <button
          onClick={() => handleSubTabChange('sequential')}
          className={`py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
            subType === 'sequential' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Sequential
        </button>
        <button
          onClick={() => handleSubTabChange('diverging')}
          className={`py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
            subType === 'diverging' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Diverging
        </button>
      </div>

      {/* Palette Dropdown Selector */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">Palette</span>
          {selectedPreset.isColorblindSafe && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <ShieldCheck size={11} />
              CVD Safe
            </span>
          )}
        </div>

        <select
          value={selectedPreset.id}
          onChange={(e) => {
            const found = PRESET_PALETTES.find(p => p.id === e.target.value);
            if (found) setSelectedPreset(found);
          }}
          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
        >
          {filteredPalettes.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.package}) {p.isColorblindSafe ? '✓' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Amount of colors slider ($n$) - clean, no extra button clusters */}
      <div className="bg-white border border-slate-200 rounded p-2 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Colors (n)</span>
          <span className="font-mono font-semibold text-slate-900">{presetN}</span>
        </div>
        <input
          type="range"
          min={2}
          max={12}
          value={presetN}
          onChange={(e) => setPresetN(parseInt(e.target.value, 10))}
          className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
        />
      </div>

      {/* Folded Edge Pruning Option (Hidden by default) */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => setShowPruning(!showPruning)}
          className="w-full px-2.5 py-1.5 flex items-center justify-between text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sliders size={12} className={isPruned ? 'text-amber-500' : 'text-slate-400'} />
            <span className="font-medium">Edge Pruning</span>
            {isPruned && (
              <span className="font-mono text-[10px] text-amber-600 bg-amber-50 px-1 rounded">
                {trimStart}% - {trimEnd}%
              </span>
            )}
          </div>
          {showPruning ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showPruning && (
          <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-100 space-y-2 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>Start</span>
                  <span className="font-mono">{trimStart}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.min(trimEnd - 10, 80)}
                  value={trimStart}
                  onChange={(e) => setTrimStart(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 h-1 bg-slate-200 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>End</span>
                  <span className="font-mono">{trimEnd}%</span>
                </div>
                <input
                  type="range"
                  min={Math.max(trimStart + 10, 20)}
                  max={100}
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 h-1 bg-slate-200 rounded cursor-pointer"
                />
              </div>
            </div>

            {isPruned && (
              <button
                onClick={() => {
                  setTrimStart(0);
                  setTrimEnd(100);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset range
              </button>
            )}
          </div>
        )}
      </div>

      {/* Visual sampled color strip */}
      <div className="space-y-1">
        <div className="h-7 w-full rounded border border-slate-200 overflow-hidden flex shadow-2xs">
          {sampledColors.map((hex, i) => {
            const simHex = simulateCVD(hex, cvdMode);
            return (
              <div
                key={`preset-sample-${i}-${hex}`}
                style={{ backgroundColor: simHex }}
                className="flex-1 h-full cursor-pointer relative group transition-colors"
                title={`Color ${i + 1}: ${hex}`}
              />
            );
          })}
        </div>
      </div>

      {/* Import to Custom Palette Button */}
      <button
        onClick={() => onImportToCustom(sampledColors)}
        title="Copy sampled colors into Tab 1 as individual editable swatches"
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
      >
        <span>Import to Custom</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
