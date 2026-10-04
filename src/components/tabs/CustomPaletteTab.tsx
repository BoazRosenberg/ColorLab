import React, { useState } from 'react';
import { Plus, Trash2, ArrowRightLeft, Tag, Check, Palette } from 'lucide-react';
import { ColorSwatch, CVDMode } from '../../types/palette';
import { simulateCVD, shouldUseDarkText } from '../../utils/cvd';

interface CustomPaletteTabProps {
  swatches: ColorSwatch[];
  setSwatches: React.Dispatch<React.SetStateAction<ColorSwatch[]>>;
  cvdMode: CVDMode;
  showNaming: boolean;
  setShowNaming: (val: boolean) => void;
}

export const CustomPaletteTab: React.FC<CustomPaletteTabProps> = ({
  swatches,
  setSwatches,
  cvdMode,
  showNaming,
  setShowNaming,
}) => {
  const [selectedId, setSelectedId] = useState<string>(swatches[0]?.id || '');

  // Active selected swatch
  const activeSwatch = swatches.find(s => s.id === selectedId) || swatches[0];
  const activeIndex = swatches.findIndex(s => s.id === (activeSwatch?.id || ''));

  // Update color of a specific swatch (strictly immutable, preserves all other swatches)
  const handleUpdateHex = (id: string, newHex: string) => {
    const formatted = newHex.trim().toUpperCase();
    setSwatches(prev =>
      prev.map(s => (s.id === id ? { ...s, hex: formatted } : s))
    );
  };

  // Update label/name of a specific swatch
  const handleUpdateName = (id: string, newName: string) => {
    setSwatches(prev =>
      prev.map(s => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  // Add swatch: Appends a new color without modifying any other swatch
  const handleAddSwatch = () => {
    const pool = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const nextHex = pool[swatches.length % pool.length];
    const newId = `swatch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newSwatch: ColorSwatch = {
      id: newId,
      hex: nextHex,
      name: `c${swatches.length + 1}`,
    };
    setSwatches(prev => [...prev, newSwatch]);
    setSelectedId(newId);
  };

  // Delete selected swatch
  const handleDeleteSelected = () => {
    if (swatches.length <= 1) return;
    const currentIdx = swatches.findIndex(s => s.id === selectedId);
    const newSwatches = swatches.filter(s => s.id !== selectedId);
    setSwatches(newSwatches);
    const nextIdx = Math.max(0, Math.min(currentIdx, newSwatches.length - 1));
    setSelectedId(newSwatches[nextIdx].id);
  };

  // Delete a specific swatch by id
  const handleDeleteById = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (swatches.length <= 1) return;
    const newSwatches = swatches.filter(s => s.id !== id);
    setSwatches(newSwatches);
    if (selectedId === id) {
      setSelectedId(newSwatches[0].id);
    }
  };

  // Reverse swatches
  const handleReverseOrder = () => {
    setSwatches(prev => [...prev].reverse());
  };

  return (
    <div className="space-y-3">
      {/* Top Controller: Adjust Selected Square (Inspired by colorTools) */}
      {activeSwatch && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-700">
              Square #{activeIndex + 1}:
            </span>

            {/* Selected Color Box Picker */}
            <div
              style={{ backgroundColor: simulateCVD(activeSwatch.hex, cvdMode) }}
              className="w-8 h-8 rounded-md border-2 border-slate-900 shadow-xs relative flex items-center justify-center cursor-pointer overflow-hidden transition-transform"
              title="Click to change color"
            >
              <input
                type="color"
                value={activeSwatch.hex.startsWith('#') && activeSwatch.hex.length === 7 ? activeSwatch.hex : '#000000'}
                onChange={(e) => handleUpdateHex(activeSwatch.id, e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </div>

            {/* Hex Input */}
            <input
              type="text"
              value={activeSwatch.hex}
              onChange={(e) => handleUpdateHex(activeSwatch.id, e.target.value)}
              maxLength={7}
              className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 text-center uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddSwatch}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-xs"
              title="Add a new color square (keeps all existing colors)"
            >
              <Plus size={13} />
              <span>Add Square</span>
            </button>

            {swatches.length > 1 && (
              <button
                onClick={handleDeleteSelected}
                className="p-1.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 rounded transition-colors cursor-pointer"
                title="Remove selected square"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Squares Container: Clickable Color Boxes (Exact colorTools styling) */}
      <div className="flex flex-wrap gap-2 py-1 items-center justify-start">
        {swatches.map((swatch, index) => {
          const isSelected = swatch.id === (activeSwatch?.id || '');
          const simmedHex = simulateCVD(swatch.hex, cvdMode);
          const darkText = shouldUseDarkText(simmedHex);
          const textColor = darkText ? '#0F172A' : '#FFFFFF';

          return (
            <div
              key={swatch.id}
              onClick={() => setSelectedId(swatch.id)}
              style={{ backgroundColor: simmedHex }}
              className={`w-18 h-18 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative select-none shadow-2xs ${
                isSelected
                  ? 'ring-3 ring-slate-900 shadow-md scale-105 z-10'
                  : 'border border-slate-300 hover:border-slate-400 hover:scale-102'
              }`}
              title={`Square #${index + 1}: ${swatch.hex} (Click to select & edit)`}
            >
              {/* Native color picker overlaid */}
              <input
                type="color"
                value={swatch.hex.startsWith('#') && swatch.hex.length === 7 ? swatch.hex : '#000000'}
                onChange={(e) => handleUpdateHex(swatch.id, e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(swatch.id);
                }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />

              {/* Hex Label with Contrast Color */}
              <span
                style={{ color: textColor }}
                className="font-mono font-bold text-[11px] tracking-tight pointer-events-none drop-shadow-2xs"
              >
                {swatch.hex}
              </span>

              {/* Index indicator */}
              <span
                style={{ color: textColor, opacity: 0.75 }}
                className="text-[9px] font-semibold mt-0.5 pointer-events-none"
              >
                #{index + 1}
              </span>

              {/* Remove button icon on top right if > 1 */}
              {swatches.length > 1 && (
                <button
                  onClick={(e) => handleDeleteById(swatch.id, e)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                  title="Remove square"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Big Add Button in grid */}
        <button
          onClick={handleAddSwatch}
          className="w-18 h-18 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-400 hover:text-blue-600 flex flex-col items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Add another color square"
        >
          <Plus size={18} />
          <span className="text-[10px] font-medium mt-1">Add</span>
        </button>
      </div>

      {/* Options Bar: Labels Toggle & Reverse Order */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-600">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showNaming}
            onChange={(e) => setShowNaming(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5"
          />
          <span className="text-[11px] font-medium text-slate-700">Include Variable Names</span>
        </label>

        <button
          onClick={handleReverseOrder}
          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
          title="Reverse current color order"
        >
          <ArrowRightLeft size={11} />
          <span>Reverse Order</span>
        </button>
      </div>

      {/* Optional Named Labels inputs when naming is toggled */}
      {showNaming && (
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 animate-in fade-in duration-150">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Color Names:
          </div>
          <div className="flex flex-wrap gap-2">
            {swatches.map((swatch, idx) => (
              <div key={`name-${swatch.id}`} className="flex items-center gap-1">
                <div
                  style={{ backgroundColor: swatch.hex }}
                  className="w-3.5 h-3.5 rounded-xs border border-slate-300"
                />
                <input
                  type="text"
                  value={swatch.name || `c${idx + 1}`}
                  onChange={(e) => handleUpdateName(swatch.id, e.target.value)}
                  placeholder={`c${idx + 1}`}
                  className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
