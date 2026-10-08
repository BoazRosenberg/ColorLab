import React, { useState } from 'react';
import { Eye, ShieldCheck, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { CVDMode } from '../types/palette';
import { InfoModal } from './InfoModal';

interface HeaderAccessibilityBarProps {
  cvdMode: CVDMode;
  setCvdMode: (mode: CVDMode) => void;
  colorblindSafeOnly: boolean;
  setColorblindSafeOnly: (val: boolean) => void;
}

export const HeaderAccessibilityBar: React.FC<HeaderAccessibilityBarProps> = ({
  cvdMode,
  setCvdMode,
  colorblindSafeOnly,
  setColorblindSafeOnly,
}) => {
  const [showA11yOptions, setShowA11yOptions] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const isCvdActive = cvdMode !== 'normal';

  return (
    <>
      <header className="bg-white border-b border-slate-200 text-slate-800 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Info Button */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
              C
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              ColorLab
            </span>
            <button
              onClick={() => setShowInfoModal(true)}
              title="Package Info & Usage (Boaz Rosenberg © 2026)"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer ml-1"
            >
              <Info size={11} className="text-blue-600" />
              <span>Info</span>
            </button>
          </div>

        {/* Vision / CVD Option Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowA11yOptions(!showA11yOptions)}
            title="Color Vision Deficiency (CVD) Simulation"
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              isCvdActive || colorblindSafeOnly || showA11yOptions
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Eye size={12} className={isCvdActive ? 'text-blue-600' : 'text-slate-500'} />
            <span>
              {isCvdActive ? cvdMode : 'CVD Simulation'}
            </span>
            {showA11yOptions ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      {/* Expandable Accessibility Panel (Folded by default) */}
      {showA11yOptions && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Mode:</span>
            <select
              value={cvdMode}
              onChange={(e) => setCvdMode(e.target.value as CVDMode)}
              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="normal">Normal Vision</option>
              <option value="protanopia">Protanopia (Red-blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-blind)</option>
              <option value="tritanopia">Tritanopia (Blue-blind)</option>
              <option value="grayscale">Grayscale / Mono</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 select-none">
            <input
              type="checkbox"
              checked={colorblindSafeOnly}
              onChange={(e) => setColorblindSafeOnly(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5"
            />
            <ShieldCheck size={12} className={colorblindSafeOnly ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Filter CVD Safe Only</span>
          </label>
        </div>
      )}
    </header>
    <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
  </>
  );
};
