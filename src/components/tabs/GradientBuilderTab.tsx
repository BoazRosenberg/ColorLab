import React from 'react';
import { Plus, Trash2, ArrowRight, ArrowUp, ArrowDown, ArrowRightLeft } from 'lucide-react';
import { CVDMode } from '../../types/palette';
import { simulateCVD } from '../../utils/cvd';

export interface GradientAnchorItem {
  id: string;
  hex: string;
  name: string;
  stepsToNext: number;
}

interface GradientBuilderTabProps {
  anchors: GradientAnchorItem[];
  setAnchors: React.Dispatch<React.SetStateAction<GradientAnchorItem[]>>;
  interpolatedColors: string[];
  cvdMode: CVDMode;
  onImportToCustom: (colors: string[]) => void;
}

export const GradientBuilderTab: React.FC<GradientBuilderTabProps> = ({
  anchors,
  setAnchors,
  interpolatedColors,
  cvdMode,
  onImportToCustom,
}) => {
  const handleAddAnchor = () => {
    const defaultHexes = ['#1E3A8A', '#0284C7', '#10B981', '#F59E0B', '#EF4444', '#7C3AED'];
    const nextHex = defaultHexes[anchors.length % defaultHexes.length] || '#059669';

    const newAnchor: GradientAnchorItem = {
      id: `anchor-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      hex: nextHex,
      name: `K${anchors.length + 1}`,
      stepsToNext: 2,
    };
    setAnchors([...anchors, newAnchor]);
  };

  const handleDeleteAnchor = (id: string) => {
    if (anchors.length <= 2) return;
    setAnchors(anchors.filter(a => a.id !== id));
  };

  const handleUpdateHex = (id: string, hex: string) => {
    setAnchors(
      anchors.map(a => (a.id === id ? { ...a, hex: hex.toUpperCase() } : a))
    );
  };

  const handleUpdateSteps = (id: string, steps: number) => {
    const safeSteps = Math.max(1, Math.min(8, steps));
    setAnchors(
      anchors.map(a => (a.id === id ? { ...a, stepsToNext: safeSteps } : a))
    );
  };

  // Reorder functions: Move Up / Move Down
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const copy = [...anchors];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setAnchors(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index >= anchors.length - 1) return;
    const copy = [...anchors];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setAnchors(copy);
  };

  const handleReverseAnchors = () => {
    setAnchors([...anchors].reverse());
  };

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          Anchors ({anchors.length}) · Steps ({interpolatedColors.length})
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReverseAnchors}
            title="Reverse anchor order"
            className="p-1 rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowRightLeft size={12} />
          </button>

          <button
            onClick={handleAddAnchor}
            disabled={anchors.length >= 8}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer ${
              anchors.length >= 8 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Plus size={12} />
            <span>Add Anchor</span>
          </button>
        </div>
      </div>

      {/* Continuous gradient strip */}
      <div
        className="h-6 w-full rounded border border-slate-200 shadow-2xs"
        style={{
          background: `linear-gradient(to right, ${anchors.map(a => simulateCVD(a.hex, cvdMode)).join(', ')})`,
        }}
      />

      {/* Discrete Interpolated Steps preview */}
      <div className="h-6 w-full rounded border border-slate-200 overflow-hidden flex shadow-2xs">
        {interpolatedColors.map((hex, i) => {
          const simHex = simulateCVD(hex, cvdMode);
          return (
            <div
              key={`interp-bar-${i}-${hex}`}
              style={{ backgroundColor: simHex }}
              className="flex-1 h-full cursor-pointer relative group transition-colors"
              title={`Step ${i + 1}: ${hex}`}
            />
          );
        })}
      </div>

      {/* Anchor List with Reordering (Up/Down) & Asymmetric steps */}
      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5">
        {anchors.map((anchor, idx) => {
          const simHex = simulateCVD(anchor.hex, cvdMode);
          const isFirst = idx === 0;
          const isLast = idx === anchors.length - 1;

          return (
            <div key={anchor.id} className="space-y-1">
              <div className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 text-xs">
                {/* Reorder controls: Up / Down arrows */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={isFirst}
                    className={`p-0.5 rounded hover:bg-slate-100 text-slate-500 ${isFirst ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                    title="Move anchor earlier"
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={isLast}
                    className={`p-0.5 rounded hover:bg-slate-100 text-slate-500 ${isLast ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                    title="Move anchor later"
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>

                {/* Color preview square & picker */}
                <div className="relative shrink-0 flex items-center">
                  <div
                    style={{ backgroundColor: simHex }}
                    className="w-6 h-6 rounded border border-slate-300 shadow-2xs"
                  />
                  <input
                    type="color"
                    value={anchor.hex}
                    onChange={(e) => handleUpdateHex(anchor.id, e.target.value)}
                    className="w-5 h-5 ml-1 p-0 border-0 bg-transparent rounded cursor-pointer"
                    title="Change color"
                  />
                </div>

                {/* Hex input */}
                <input
                  type="text"
                  value={anchor.hex}
                  onChange={(e) => handleUpdateHex(anchor.id, e.target.value)}
                  maxLength={7}
                  className="w-20 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-900 uppercase"
                />

                <span className="flex-1 font-mono text-[10px] text-slate-400">
                  K{idx + 1}
                </span>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteAnchor(anchor.id)}
                  disabled={anchors.length <= 2}
                  className={`p-1 rounded text-slate-400 hover:text-red-500 ${
                    anchors.length <= 2 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  title="Remove anchor"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Asymmetric step connector */}
              {!isLast && (
                <div className="ml-6 pl-3 border-l border-slate-200 py-0.5 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>Steps to K{idx + 2}:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {anchor.stepsToNext}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={anchor.stepsToNext}
                    onChange={(e) => handleUpdateSteps(anchor.id, parseInt(e.target.value, 10))}
                    className="w-20 accent-blue-600 h-1 bg-slate-200 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Import to Custom Palette Button */}
      <button
        onClick={() => onImportToCustom(interpolatedColors)}
        title="Send interpolated gradient colors into Tab 1 as editable swatches"
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
      >
        <span>Import {interpolatedColors.length} Steps to Custom</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
