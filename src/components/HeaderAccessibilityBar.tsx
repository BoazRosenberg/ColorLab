import React, { useState } from 'react';
import { Eye, ShieldCheck, Download, Columns, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { CVDMode } from '../types/palette';

interface HeaderAccessibilityBarProps {
  cvdMode: CVDMode;
  setCvdMode: (mode: CVDMode) => void;
  colorblindSafeOnly: boolean;
  setColorblindSafeOnly: (val: boolean) => void;
  viewMode: 'split_ide' | 'narrow_pane' | 'package_inspector';
  setViewMode: (mode: 'split_ide' | 'narrow_pane' | 'package_inspector') => void;
  onOpenPackageModal: () => void;
}

export const HeaderAccessibilityBar: React.FC<HeaderAccessibilityBarProps> = ({
  cvdMode,
  setCvdMode,
  colorblindSafeOnly,
  setColorblindSafeOnly,
  viewMode,
  setViewMode,
  onOpenPackageModal,
}) => {
  const [showA11yOptions, setShowA11yOptions] = useState(false);

  const isCvdActive = cvdMode !== 'normal';

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 px-3 py-2 shrink-0">
      <div className="flex items-center justify-between gap-2">
        {/* Brand / Title (Minimal) */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            R
          </div>
          <span className="text-xs font-semibold text-slate-900 tracking-tight">
            Palette Studio
          </span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Toggleable CVD / Accessibility Button (Folded by default) */}
          <button
            onClick={() => setShowA11yOptions(!showA11yOptions)}
            title="Color Vision Deficiency (CVD) Simulation & Filters"
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              isCvdActive || colorblindSafeOnly || showA11yOptions
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Eye size={12} className={isCvdActive ? 'text-blue-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">
              {isCvdActive ? cvdMode : 'Vision'}
            </span>
            {showA11yOptions ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded p-0.5">
            <button
              onClick={() => setViewMode('split_ide')}
              title="RStudio IDE View (Console + Tutorial Pane)"
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'split_ide' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns size={12} />
            </button>
            <button
              onClick={() => setViewMode('narrow_pane')}
              title="Narrow Tutorial Pane (~390px)"
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'narrow_pane' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone size={12} />
            </button>
          </div>

          {/* R Package Exporter Modal Button */}
          <button
            onClick={onOpenPackageModal}
            title="Export installable R package (.zip)"
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Download size={11} />
            <span className="hidden sm:inline">R Package</span>
          </button>
        </div>
      </div>

      {/* Expandable Accessibility Panel (Folded by default) */}
      {showA11yOptions && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-100">
          {/* CVD Mode Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">CVD Simulation:</span>
            <select
              value={cvdMode}
              onChange={(e) => setCvdMode(e.target.value as CVDMode)}
              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="normal">Normal</option>
              <option value="protanopia">Protanopia (Red-blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-blind)</option>
              <option value="tritanopia">Tritanopia (Blue-blind)</option>
              <option value="grayscale">Grayscale / Mono</option>
            </select>
          </div>

          {/* Colorblind Safe Filter Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 select-none">
            <input
              type="checkbox"
              checked={colorblindSafeOnly}
              onChange={(e) => setColorblindSafeOnly(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5"
            />
            <ShieldCheck size={12} className={colorblindSafeOnly ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Filter Safe Only</span>
          </label>
        </div>
      )}
    </header>
  );
};
