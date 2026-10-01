import React, { useState } from 'react';
import { Plus, Trash2, Shuffle, ArrowRightLeft, Tag } from 'lucide-react';
import { ColorSwatch, CVDMode } from '../../types/palette';
import { simulateCVD } from '../../utils/cvd';

interface CustomPaletteTabProps {
  swatches: ColorSwatch[];
  setSwatches: React.Dispatch<React.SetStateAction<ColorSwatch[]>>;
  cvdMode: CVDMode;
}

export const CustomPaletteTab: React.FC<CustomPaletteTabProps> = ({
  swatches,
  setSwatches,
  cvdMode,
}) => {
  const [showNaming, setShowNaming] = useState(false);

  const handleAddSwatch = () => {
    const defaultPool = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'];
    const nextHex = defaultPool[swatches.length % defaultPool.length] || '#4A5568';
    const newSwatch: ColorSwatch = {
      id: `swatch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      hex: nextHex,
      name: `c${swatches.length + 1}`,
    };
    setSwatches([...swatches, newSwatch]);
  };

  const handleDeleteSwatch = (id: string) => {
    if (swatches.length <= 1) return;
    setSwatches(swatches.filter(s => s.id !== id));
  };

  const handleUpdateHex = (id: string, newHex: string) => {
    setSwatches(
      swatches.map(s => (s.id === id ? { ...s, hex: newHex.toUpperCase() } : s))
    );
  };

  const handleUpdateName = (id: string, newName: string) => {
    setSwatches(
      swatches.map(s => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleRandomize = () => {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    setSwatches(
      swatches.map(s => ({
        ...s,
        hex: randomHex(),
      }))
    );
  };

  const handleReverseOrder = () => {
    setSwatches([...swatches].reverse());
  };

  return (
    <div className="space-y-2.5">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          Swatches ({swatches.length})
        </span>

        <div className="flex items-center gap-1">
          {/* Folded naming toggle */}
          <button
            onClick={() => setShowNaming(!showNaming)}
            title="Toggle color naming labels (c(name = '#hex'))"
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              showNaming
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Tag size={11} />
            <span>Labels</span>
          </button>

          <button
            onClick={handleReverseOrder}
            title="Reverse order"
            className="p-1 rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowRightLeft size={12} />
          </button>

          <button
            onClick={handleRandomize}
            title="Randomize colors"
            className="p-1 rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <Shuffle size={12} />
          </button>

          <button
            onClick={handleAddSwatch}
            title="Add color swatch"
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Clean Palette Ribbon */}
      <div className="h-7 w-full rounded border border-slate-200 overflow-hidden flex shadow-xs">
        {swatches.map((swatch, idx) => {
          const displayHex = simulateCVD(swatch.hex, cvdMode);
          return (
            <div
              key={`bar-${swatch.id}`}
              style={{ backgroundColor: displayHex }}
              className="flex-1 h-full cursor-pointer relative group transition-colors"
              title={`${swatch.name || `Color ${idx + 1}`}: ${swatch.hex}`}
            />
          );
        })}
      </div>

      {/* Swatch List */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
        {swatches.map((swatch, index) => {
          const simHex = simulateCVD(swatch.hex, cvdMode);

          return (
            <div
              key={swatch.id}
              className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 hover:border-slate-300 transition-colors text-xs"
            >
              <span className="text-[10px] font-mono text-slate-400 w-3 text-center shrink-0">
                {index + 1}
              </span>

              {/* Native HTML5 Color Picker with Preview Box */}
              <div className="relative shrink-0 flex items-center">
                <div
                  style={{ backgroundColor: simHex }}
                  className="w-6 h-6 rounded border border-slate-300 shadow-2xs"
                />
                <input
                  type="color"
                  value={swatch.hex.startsWith('#') && swatch.hex.length === 7 ? swatch.hex : '#000000'}
                  onChange={(e) => handleUpdateHex(swatch.id, e.target.value)}
                  className="w-5 h-5 ml-1 p-0 border-0 bg-transparent rounded cursor-pointer"
                  title="Pick color"
                />
              </div>

              {/* Hex Input */}
              <input
                type="text"
                value={swatch.hex}
                onChange={(e) => handleUpdateHex(swatch.id, e.target.value)}
                maxLength={7}
                className="w-20 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-900 focus:outline-none focus:border-blue-500 uppercase"
              />

              {/* Optional Name field (Only shown when naming option is active) */}
              {showNaming && (
                <input
                  type="text"
                  value={swatch.name || ''}
                  onChange={(e) => handleUpdateName(swatch.id, e.target.value)}
                  placeholder="label"
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              )}

              {/* Spacer if naming hidden */}
              {!showNaming && <div className="flex-1" />}

              {/* Delete button */}
              <button
                onClick={() => handleDeleteSwatch(swatch.id)}
                disabled={swatches.length <= 1}
                className={`p-1 rounded text-slate-400 hover:text-red-500 transition-colors shrink-0 ${
                  swatches.length <= 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title="Remove swatch"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
