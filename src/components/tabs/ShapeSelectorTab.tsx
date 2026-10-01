import React, { useState } from 'react';
import { Plus, Trash2, Palette, ChevronDown } from 'lucide-react';
import { ShapeAssignment, CVDMode } from '../../types/palette';
import { PCH_SHAPES } from '../../utils/shapes';
import { ShapeIcon } from '../ShapeIcon';
import { simulateCVD } from '../../utils/cvd';

interface ShapeSelectorTabProps {
  shapes: ShapeAssignment[];
  setShapes: React.Dispatch<React.SetStateAction<ShapeAssignment[]>>;
  availableColors: string[];
  cvdMode: CVDMode;
}

export const ShapeSelectorTab: React.FC<ShapeSelectorTabProps> = ({
  shapes,
  setShapes,
  availableColors,
  cvdMode,
}) => {
  const [activeShapeIndex, setActiveShapeIndex] = useState<number | null>(null);

  const handleAddShape = () => {
    const nextIdx = shapes.length;
    const suggestedPchs = [16, 17, 15, 18, 8, 3, 21, 22, 24, 25];
    const nextPch = suggestedPchs[nextIdx % suggestedPchs.length];
    const nextColor = availableColors[nextIdx % availableColors.length] || '#1F77B4';

    const newShape: ShapeAssignment = {
      pch: nextPch,
      color: nextColor,
      fill: nextPch >= 21 && nextPch <= 25 ? nextColor : undefined,
      label: `Class ${nextIdx + 1}`,
    };

    setShapes([...shapes, newShape]);
  };

  const handleDeleteShape = (index: number) => {
    if (shapes.length <= 1) return;
    setShapes(shapes.filter((_, i) => i !== index));
  };

  const handleUpdatePch = (index: number, newPch: number) => {
    setShapes(
      shapes.map((s, i) => {
        if (i === index) {
          const isFillable = newPch >= 21 && newPch <= 25;
          return {
            ...s,
            pch: newPch,
            fill: isFillable ? (s.fill || s.color) : undefined,
          };
        }
        return s;
      })
    );
    setActiveShapeIndex(null);
  };

  const handleUpdateColor = (index: number, newColor: string) => {
    setShapes(
      shapes.map((s, i) => (i === index ? { ...s, color: newColor } : s))
    );
  };

  const handleUpdateFill = (index: number, newFill: string) => {
    setShapes(
      shapes.map((s, i) => (i === index ? { ...s, fill: newFill } : s))
    );
  };

  const handleUpdateLabel = (index: number, newLabel: string) => {
    setShapes(
      shapes.map((s, i) => (i === index ? { ...s, label: newLabel } : s))
    );
  };

  const handleSyncColors = () => {
    if (availableColors.length === 0) return;
    setShapes(
      shapes.map((s, idx) => ({
        ...s,
        color: availableColors[idx % availableColors.length],
        fill: s.pch >= 21 && s.pch <= 25 ? availableColors[idx % availableColors.length] : undefined,
      }))
    );
  };

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          Shape Scale ({shapes.length})
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleSyncColors}
            title="Sync colors from active palette"
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <Palette size={11} className="text-blue-600" />
            <span>Sync Colors</span>
          </button>

          <button
            onClick={handleAddShape}
            disabled={shapes.length >= 8}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer ${
              shapes.length >= 8 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Shapes list */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
        {shapes.map((item, index) => {
          const simColor = simulateCVD(item.color, cvdMode);
          const simFill = item.fill ? simulateCVD(item.fill, cvdMode) : simColor;
          const isFillable = item.pch >= 21 && item.pch <= 25;
          const shapeDef = PCH_SHAPES.find(p => p.pch === item.pch);

          return (
            <div
              key={`shape-${index}`}
              className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 text-xs"
            >
              {/* Shape Icon Button to toggle pch selector */}
              <button
                type="button"
                onClick={() => setActiveShapeIndex(activeShapeIndex === index ? null : index)}
                className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-blue-400 rounded px-1.5 py-0.5 cursor-pointer shrink-0"
                title={`${shapeDef?.name || `pch ${item.pch}`}: Click to change symbol`}
              >
                <ShapeIcon
                  pch={item.pch}
                  size={15}
                  color={simColor}
                  fill={simFill}
                  strokeWidth={1.5}
                />
                <span className="font-mono text-[10px] text-slate-600">
                  {item.pch}
                </span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>

              {/* Color pickers */}
              <div className="relative shrink-0 flex items-center">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => handleUpdateColor(index, e.target.value)}
                  className="w-5 h-5 p-0 border-0 bg-transparent rounded cursor-pointer"
                  title={isFillable ? 'Border color' : 'Symbol color'}
                />
                {isFillable && (
                  <input
                    type="color"
                    value={item.fill || item.color}
                    onChange={(e) => handleUpdateFill(index, e.target.value)}
                    className="w-5 h-5 ml-1 p-0 border-0 bg-transparent rounded cursor-pointer"
                    title="Fill color"
                  />
                )}
              </div>

              {/* Label */}
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleUpdateLabel(index, e.target.value)}
                placeholder="Label"
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />

              {/* Delete button */}
              <button
                onClick={() => handleDeleteShape(index)}
                disabled={shapes.length <= 1}
                className={`p-1 rounded text-slate-400 hover:text-red-500 ${
                  shapes.length <= 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title="Remove class"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Shape PCH Picker Grid (Pop-up inside tab) */}
      {activeShapeIndex !== null && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1.5 animate-in fade-in duration-100">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Select R Shape Symbol (pch 0-25)</span>
            <button
              onClick={() => setActiveShapeIndex(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 max-h-36 overflow-y-auto p-1">
            {PCH_SHAPES.map((shape) => {
              const isActive = shapes[activeShapeIndex]?.pch === shape.pch;
              const curColor = shapes[activeShapeIndex]?.color || '#1E293B';
              const curFill = shapes[activeShapeIndex]?.fill || curColor;

              return (
                <button
                  key={`pch-${shape.pch}`}
                  onClick={() => handleUpdatePch(activeShapeIndex, shape.pch)}
                  className={`flex flex-col items-center justify-center p-1 rounded border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  title={`pch=${shape.pch}: ${shape.name}`}
                >
                  <ShapeIcon
                    pch={shape.pch}
                    size={14}
                    color={curColor}
                    fill={curFill}
                    strokeWidth={1.5}
                  />
                  <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                    {shape.pch}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
