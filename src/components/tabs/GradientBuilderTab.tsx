import React from 'react';
import { Plus, X, ArrowRight, ArrowLeft, ArrowRightLeft, Minus } from 'lucide-react';
import { CVDMode } from '../../types/palette';
import { simulateCVD } from '../../utils/cvd';
import { interpolatePair } from '../../utils/interpolation';

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
    const defaultHexes = ['#440154', '#21908C', '#FDE725', '#F59E0B', '#EF4444', '#7C3AED'];
    const nextHex = defaultHexes[anchors.length % defaultHexes.length] || '#10B981';

    const newAnchor: GradientAnchorItem = {
      id: `anchor-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      hex: nextHex,
      name: `K${anchors.length + 1}`,
      stepsToNext: 2,
    };
    setAnchors([...anchors, newAnchor]);
  };

  const handleDeleteAnchor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (anchors.length <= 2) return;
    setAnchors(anchors.filter(a => a.id !== id));
  };

  const handleUpdateHex = (id: string, hex: string) => {
    setAnchors(
      anchors.map(a => (a.id === id ? { ...a, hex: hex.toUpperCase() } : a))
    );
  };

  const handleStepDelta = (id: string, delta: number) => {
    setAnchors(
      anchors.map(a => {
        if (a.id === id) {
          const nextVal = Math.max(1, Math.min(8, (a.stepsToNext || 2) + delta));
          return { ...a, stepsToNext: nextVal };
        }
        return a;
      })
    );
  };

  const handleReverseAnchors = () => {
    setAnchors([...anchors].reverse());
  };

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800">
          Anchors & Steps ({anchors.length} anchors · {interpolatedColors.length} steps)
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReverseAnchors}
            title="Reverse order"
            className="p-1 rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowRightLeft size={11} />
          </button>

          <button
            onClick={handleAddAnchor}
            disabled={anchors.length >= 7}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer ${
              anchors.length >= 7 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Plus size={12} />
            <span>Add Anchor</span>
          </button>
        </div>
      </div>

      {/* Visual Sequence: Big Anchor Squares with Small Intermediate Step Squares & Numeric Clickers */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {anchors.map((anchor, idx) => {
            const simHex = simulateCVD(anchor.hex, cvdMode);
            const isLast = idx === anchors.length - 1;
            const nextAnchor = !isLast ? anchors[idx + 1] : null;

            // Generate intermediate step colors between this anchor and next
            const stepCount = anchor.stepsToNext || 2;
            const intermediateColors: string[] = [];
            if (nextAnchor) {
              for (let s = 1; s <= stepCount; s++) {
                const t = s / (stepCount + 1);
                intermediateColors.push(interpolatePair(anchor.hex, nextAnchor.hex, t));
              }
            }

            return (
              <React.Fragment key={anchor.id}>
                {/* Big Anchor Square */}
                <div className="group relative flex flex-col items-center">
                  <div
                    style={{ backgroundColor: simHex }}
                    className="w-11 h-11 rounded-md border-2 border-slate-800 shadow-sm relative flex items-center justify-center cursor-pointer overflow-hidden"
                    title={`Anchor K${idx + 1}: ${anchor.hex}`}
                  >
                    <input
                      type="color"
                      value={anchor.hex}
                      onChange={(e) => handleUpdateHex(anchor.id, e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />

                    {anchors.length > 2 && (
                      <button
                        onClick={(e) => handleDeleteAnchor(anchor.id, e)}
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Remove anchor"
                      >
                        <X size={9} />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-700 mt-1">
                    K{idx + 1}
                  </span>
                </div>

                {/* Between adjacent anchors: Numeric Clicker Box & Small Intermediate Squares */}
                {!isLast && (
                  <div className="flex flex-col items-center px-1">
                    {/* Compact Number Clicker */}
                    <div className="flex items-center border border-slate-300 rounded bg-white shadow-2xs">
                      <button
                        onClick={() => handleStepDelta(anchor.id, -1)}
                        disabled={stepCount <= 1}
                        className={`p-1 text-slate-500 hover:text-slate-900 ${stepCount <= 1 ? 'opacity-20' : 'cursor-pointer'}`}
                        title="Decrease steps"
                      >
                        <Minus size={9} />
                      </button>
                      <span className="w-4 text-center font-mono font-semibold text-[10px] text-slate-800 select-none">
                        {stepCount}
                      </span>
                      <button
                        onClick={() => handleStepDelta(anchor.id, 1)}
                        disabled={stepCount >= 6}
                        className={`p-1 text-slate-500 hover:text-slate-900 ${stepCount >= 6 ? 'opacity-20' : 'cursor-pointer'}`}
                        title="Increase steps"
                      >
                        <Plus size={9} />
                      </button>
                    </div>

                    {/* Small interpolated preview squares */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {intermediateColors.map((intHex, sIdx) => (
                        <div
                          key={`step-${idx}-${sIdx}`}
                          style={{ backgroundColor: simulateCVD(intHex, cvdMode) }}
                          className="w-3.5 h-3.5 rounded-xs border border-slate-300 shadow-2xs"
                          title={`Step ${sIdx + 1}: ${intHex}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Continuous Gradient Ribbon */}
      <div
        className="h-6 w-full rounded border border-slate-200 shadow-2xs"
        style={{
          background: `linear-gradient(to right, ${anchors.map(a => simulateCVD(a.hex, cvdMode)).join(', ')})`,
        }}
      />

      {/* Import to Custom Palette Button */}
      <button
        onClick={() => onImportToCustom(interpolatedColors)}
        title="Send interpolated gradient colors into Tab 1 as editable swatches"
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
      >
        <span>Import {interpolatedColors.length} Colors to Custom</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
