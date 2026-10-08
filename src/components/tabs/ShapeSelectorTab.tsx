import React, { useState } from 'react';
import { Plus, Trash2, Palette, ChevronDown } from 'lucide-react';
import { ShapeAssignment, CVDMode, NamedCustomPalette } from '../../types/palette';
import { PCH_SHAPES } from '../../utils/shapes';
import { ShapeIcon } from '../ShapeIcon';
import { simulateCVD } from '../../utils/cvd';

interface ShapeSelectorTabProps {
  shapes: ShapeAssignment[];
  setShapes: React.Dispatch<React.SetStateAction<ShapeAssignment[]>>;
  customPalettes: NamedCustomPalette[];
  cvdMode: CVDMode;
  showShapeLabels: boolean;
  setShowShapeLabels: (val: boolean) => void;
}

export const ShapeSelectorTab: React.FC<ShapeSelectorTabProps> = ({
  shapes,
  setShapes,
  customPalettes,
  cvdMode,
  showShapeLabels,
  setShowShapeLabels,
}) => {
  const [activeShapeIndex, setActiveShapeIndex] = useState<number | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(
    customPalettes[0]?.id || ''
  );

  // Simple solid shapes (one solid color only: 16=circle, 17=triangle, 15=square, 18=diamond, 3=plus, 8=star, 4=cross)
  const SIMPLE_PCHS = [16, 17, 15, 18, 3, 8, 4, 1];

  // Default color of the shapes (all shapes default to the same color)
  const defaultBaseColor = shapes[0]?.color || '#1E293B';

  const handleAddShape = () => {
    const nextIdx = shapes.length;
    const nextPch = SIMPLE_PCHS[nextIdx % SIMPLE_PCHS.length];
    // Default to the same color as the first shape
    const baseColor = defaultBaseColor;

    const newShape: ShapeAssignment = {
      pch: nextPch,
      color: baseColor,
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

  // Color shapes by selected custom palette and copy variable names if assigned
  const handleColorByPalette = () => {
    const targetPalette =
      customPalettes.find(p => p.id === selectedPaletteId) || customPalettes[0];
    if (!targetPalette || targetPalette.swatches.length === 0) return;

    const swatches = targetPalette.swatches;
    setShapes(
      shapes.map((s, idx) => {
        const sw = swatches[idx % swatches.length];
        const assignedName = sw.name && sw.name.trim().length > 0 ? sw.name.trim() : undefined;
        return {
          ...s,
          color: sw.hex,
          fill: s.pch >= 21 && s.pch <= 25 ? sw.hex : undefined,
          // If swatch has assigned name, use it as default label
          label: assignedName || s.label || `Class ${idx + 1}`,
        };
      })
    );
  };

  // Unify all shapes to have the same solid color
  const handleUnifyColor = () => {
    const unifiedColor = shapes[0]?.color || '#1E293B';
    setShapes(
      shapes.map(s => ({
        ...s,
        color: unifiedColor,
        fill: s.pch >= 21 && s.pch <= 25 ? unifiedColor : undefined,
      }))
    );
  };

  const allSameColor = shapes.every(s => s.color === shapes[0]?.color);

  return (
    <div className="space-y-2">
      {/* 1. Top Header with Shape Count, Unify Color & Add Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800">
          Shape Scale ({shapes.length} shapes)
        </span>

        <div className="flex items-center gap-1">
          {!allSameColor && (
            <button
              onClick={handleUnifyColor}
              title="Set all shapes to the same single color"
              className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            >
              Single Color
            </button>
          )}

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

      {/* 2. Color By Palette Bar (Allows importing any custom palette) */}
      <div className="flex items-center justify-between gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-md">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Palette size={12} className="text-blue-600 shrink-0" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Color by:
          </span>
          <select
            value={selectedPaletteId}
            onChange={(e) => setSelectedPaletteId(e.target.value)}
            className="flex-1 min-w-0 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
          >
            {customPalettes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.swatches.length} colors)
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleColorByPalette}
          className="px-2 py-0.5 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-300 rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Color shapes using this custom palette"
        >
          Apply Palette
        </button>
      </div>

      {/* 3. Add Labels Toggle Row */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-0.5 pt-0.5">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showShapeLabels}
            onChange={(e) => setShowShapeLabels(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
          />
          <span className="text-[11px] font-medium text-slate-700">Add labels</span>
        </label>

        <span className="text-[10px] text-slate-500">
          {allSameColor ? 'Single color shapes' : 'Colored by palette'}
        </span>
      </div>

      {/* 4. Shapes List (Compact, Simple Shapes with Single Solid Color & Inline Labels if Toggled) */}
      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5">
        {shapes.map((item, index) => {
          const simColor = simulateCVD(item.color, cvdMode);
          const simFill = item.fill ? simulateCVD(item.fill, cvdMode) : simColor;
          const isFillable = item.pch >= 21 && item.pch <= 25;
          const shapeMeta = PCH_SHAPES.find(p => p.pch === item.pch);

          return (
            <div
              key={`shape-${index}`}
              className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 text-xs shadow-2xs"
            >
              {/* Shape Symbol Selector Trigger */}
              <button
                type="button"
                onClick={() => setActiveShapeIndex(activeShapeIndex === index ? null : index)}
                className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-blue-400 rounded px-1.5 py-0.5 cursor-pointer shrink-0"
                title={`pch ${item.pch}: Click to change symbol`}
              >
                <ShapeIcon
                  pch={item.pch}
                  size={15}
                  color={simColor}
                  fill={simFill}
                  strokeWidth={1.5}
                />
                <span className="font-mono text-[10px] text-slate-600 font-semibold">
                  {item.pch}
                </span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>

              {/* Single Color Picker for simple shapes (or border+fill for 21-25) */}
              <div className="relative shrink-0 flex items-center">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => handleUpdateColor(index, e.target.value)}
                  className="w-5 h-5 p-0 border-0 bg-transparent rounded cursor-pointer"
                  title="Shape color"
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

              {/* Middle Area: Label input if "Add labels" is toggled, else clean shape descriptor */}
              {showShapeLabels ? (
                <input
                  type="text"
                  value={item.label || ''}
                  onChange={(e) => handleUpdateLabel(index, e.target.value)}
                  placeholder={`Class ${index + 1}`}
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              ) : (
                <span className="flex-1 min-w-0 text-[11px] text-slate-500 truncate select-none">
                  {shapeMeta?.name || `Shape ${index + 1}`}
                </span>
              )}

              {/* Delete button */}
              <button
                onClick={() => handleDeleteShape(index)}
                disabled={shapes.length <= 1}
                className={`p-1 rounded text-slate-400 hover:text-red-500 ${
                  shapes.length <= 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title="Remove shape"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* 5. Shape PCH Picker Grid (Pop-up inside tab) */}
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
                      ? 'bg-blue-50 border-blue-400 shadow-xs'
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
