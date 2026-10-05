import React from 'react';
import { Plus, X, ArrowRight, ArrowRightLeft, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const defaultHexes = ['#2C3E50', '#E74C3C', '#F1C40F', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const nextHex = defaultHexes[anchors.length % defaultHexes.length] || '#27AE60';

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
          const currentVal = a.stepsToNext ?? 2;
          const nextVal = Math.max(0, Math.min(8, currentVal + delta));
          return { ...a, stepsToNext: nextVal };
        }
        return a;
      })
    );
  };

  const handleStepDirect = (id: string, val: number) => {
    const bounded = Math.max(0, Math.min(8, isNaN(val) ? 0 : val));
    setAnchors(
      anchors.map(a => (a.id === id ? { ...a, stepsToNext: bounded } : a))
    );
  };

  const handleMoveAnchor = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= anchors.length) return;
    const newAnchors = [...anchors];
    const temp = newAnchors[index];
    newAnchors[index] = newAnchors[targetIndex];
    newAnchors[targetIndex] = temp;
    setAnchors(newAnchors);
  };

  const handleReverseAnchors = () => {
    setAnchors([...anchors].reverse());
  };

  // Exact math: Total colors = anchors count + sum of intermediate steps
  const totalIntermediateSteps = anchors
    .slice(0, -1)
    .reduce((sum, a) => sum + (a.stepsToNext || 0), 0);
  const totalColors = anchors.length + totalIntermediateSteps;

  return (
    <div className="space-y-2.5">
      {/* Header with clear (anchors + steps = total colors) breakdown */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800">
          Anchors & Steps ({anchors.length} anchors + {totalIntermediateSteps} steps = {totalColors} colors)
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

      {/* Visual Sequence: Big Anchor Squares with Intermediate Step Squares & Reorder Controls */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {anchors.map((anchor, idx) => {
            const simHex = simulateCVD(anchor.hex, cvdMode);
            const isLast = idx === anchors.length - 1;
            const nextAnchor = !isLast ? anchors[idx + 1] : null;

            // Generate intermediate step colors between this anchor and next
            const stepCount = anchor.stepsToNext ?? 2;
            const intermediateColors: string[] = [];
            if (nextAnchor && stepCount > 0) {
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
                    className="w-11 h-11 rounded-md border-2 border-slate-900 shadow-xs relative flex items-center justify-center cursor-pointer overflow-hidden transition-transform"
                    title={`Anchor K${idx + 1}: ${anchor.hex} (Click to change color)`}
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

                  <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                    K{idx + 1}
                  </span>

                  {/* Reorder Buttons (‹ and ›) */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {idx > 0 && (
                      <button
                        onClick={() => handleMoveAnchor(idx, 'left')}
                        className="p-0.5 text-slate-400 hover:text-slate-800 bg-white border border-slate-200 rounded text-[9px] cursor-pointer"
                        title="Move left"
                      >
                        <ChevronLeft size={10} />
                      </button>
                    )}
                    {idx < anchors.length - 1 && (
                      <button
                        onClick={() => handleMoveAnchor(idx, 'right')}
                        className="p-0.5 text-slate-400 hover:text-slate-800 bg-white border border-slate-200 rounded text-[9px] cursor-pointer"
                        title="Move right"
                      >
                        <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Between adjacent anchors: Numeric Clicker Box & Small Intermediate Squares */}
                {!isLast && (
                  <div className="flex flex-col items-center px-1">
                    {/* Compact Number Clicker */}
                    <div className="flex items-center border border-slate-300 rounded bg-white shadow-2xs">
                      <button
                        onClick={() => handleStepDelta(anchor.id, -1)}
                        disabled={stepCount <= 0}
                        className={`p-1 text-slate-500 hover:text-slate-900 ${stepCount <= 0 ? 'opacity-20' : 'cursor-pointer'}`}
                        title="Decrease steps"
                      >
                        <Minus size={9} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={8}
                        value={stepCount}
                        onChange={(e) => handleStepDirect(anchor.id, parseInt(e.target.value) || 0)}
                        className="w-5 text-center font-mono font-semibold text-[10px] text-slate-800 border-none outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleStepDelta(anchor.id, 1)}
                        disabled={stepCount >= 8}
                        className={`p-1 text-slate-500 hover:text-slate-900 ${stepCount >= 8 ? 'opacity-20' : 'cursor-pointer'}`}
                        title="Increase steps"
                      >
                        <Plus size={9} />
                      </button>
                    </div>

                    {/* Small interpolated preview squares */}
                    <div className="flex items-center gap-1 mt-1.5 min-h-[14px]">
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
        <span>Import {totalColors} Colors to Custom</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
