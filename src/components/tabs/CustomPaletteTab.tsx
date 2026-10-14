import React, { useState } from 'react';
import { Plus, Trash2, ArrowRightLeft, Copy, GripVertical, Pipette } from 'lucide-react';
import { ColorSwatch, CVDMode, NamedCustomPalette } from '../../types/palette';
import { simulateCVD, shouldUseDarkText } from '../../utils/cvd';

interface CustomPaletteTabProps {
  palettes: NamedCustomPalette[];
  activePaletteId: string;
  setActivePaletteId: (id: string) => void;
  onUpdatePaletteName: (id: string, newName: string) => void;
  onCreatePalette: () => void;
  onDeletePalette: (id: string) => void;
  onDuplicatePalette: (id: string) => void;
  swatches: ColorSwatch[];
  setSwatches: (swatches: ColorSwatch[]) => void;
  cvdMode: CVDMode;
  showNaming: boolean;
  setShowNaming: (val: boolean) => void;
}

export const CustomPaletteTab: React.FC<CustomPaletteTabProps> = ({
  palettes,
  activePaletteId,
  setActivePaletteId,
  onUpdatePaletteName,
  onCreatePalette,
  onDeletePalette,
  onDuplicatePalette,
  swatches,
  setSwatches,
  cvdMode,
  showNaming,
  setShowNaming,
}) => {
  const activePalette = palettes.find(p => p.id === activePaletteId) || palettes[0];
  const [selectedId, setSelectedId] = useState<string>(swatches[0]?.id || '');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Active selected swatch
  const activeSwatch = swatches.find(s => s.id === selectedId) || swatches[0];
  const activeIndex = swatches.findIndex(s => s.id === (activeSwatch?.id || ''));

  // Update color of a specific swatch (strictly immutable, preserves all other swatches)
  const handleUpdateHex = (id: string, newHex: string) => {
    const formatted = newHex.trim().toUpperCase();
    setSwatches(
      swatches.map(s => (s.id === id ? { ...s, hex: formatted } : s))
    );
  };

  // Update label/name of a specific swatch inline
  const handleUpdateName = (id: string, newName: string) => {
    setSwatches(
      swatches.map(s => (s.id === id ? { ...s, name: newName } : s))
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
    setSwatches([...swatches, newSwatch]);
    setSelectedId(newId);
  };

  // Delete selected swatch
  const handleDeleteSelected = () => {
    if (swatches.length <= 1) return;
    const currentIdx = swatches.findIndex(s => s.id === selectedId);
    const newSwatches = swatches.filter(s => s.id !== selectedId);
    setSwatches(newSwatches);
    const nextIdx = Math.max(0, Math.min(currentIdx, newSwatches.length - 1));
    if (newSwatches[nextIdx]) {
      setSelectedId(newSwatches[nextIdx].id);
    }
  };

  // Delete a specific swatch by id
  const handleDeleteById = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (swatches.length <= 1) return;
    const newSwatches = swatches.filter(s => s.id !== id);
    setSwatches(newSwatches);
    if (selectedId === id && newSwatches[0]) {
      setSelectedId(newSwatches[0].id);
    }
  };

  // Reverse swatches
  const handleReverseOrder = () => {
    setSwatches([...swatches].reverse());
  };

  // Drag and drop reordering
  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newSwatches = [...swatches];
    const [moved] = newSwatches.splice(draggedIndex, 1);
    newSwatches.splice(targetIndex, 0, moved);
    setSwatches(newSwatches);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Multiple Palettes Bar: Selector Tabs & Add Palette */}
      <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-[350px]">
          {palettes.map((p) => {
            const isActive = p.id === activePalette?.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePaletteId(p.id);
                  if (p.swatches[0]) setSelectedId(p.swatches[0].id);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={`Switch to ${p.name}`}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={onCreatePalette}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer shrink-0 border border-slate-200"
          title="Create a new palette"
        >
          <Plus size={11} />
          <span>New</span>
        </button>
      </div>

      {/* 2. Active Palette Name Editor & Actions */}
      <div className="flex items-center justify-between gap-2 p-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Palette:
          </span>
          <input
            type="text"
            value={activePalette?.name || 'my_palette'}
            onChange={(e) => {
              const clean = e.target.value.replace(/[^a-zA-Z0-9_]/g, '_');
              if (activePalette) {
                onUpdatePaletteName(activePalette.id, clean);
              }
            }}
            placeholder="palette_name"
            className="w-36 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
            title="Custom palette variable name (used in R code output)"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => activePalette && onDuplicatePalette(activePalette.id)}
            className="p-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded transition-colors cursor-pointer"
            title="Duplicate this palette"
          >
            <Copy size={11} />
          </button>

          {palettes.length > 1 && (
            <button
              onClick={() => activePalette && onDeletePalette(activePalette.id)}
              className="p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded transition-colors cursor-pointer"
              title="Delete this palette"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Selected Color Controller */}
      {activeSwatch && (
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700">
              Color:
            </span>

            {/* Selected Color Box Picker */}
            <div
              style={{ backgroundColor: simulateCVD(activeSwatch.hex, cvdMode) }}
              className="w-7 h-7 rounded-md border-2 border-slate-900 shadow-xs relative flex items-center justify-center cursor-pointer overflow-hidden transition-transform"
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
              className="w-20 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-bold text-slate-900 text-center uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddSwatch}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-xs"
              title="Add a new color square"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>

            {swatches.length > 1 && (
              <button
                onClick={handleDeleteSelected}
                className="p-1 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 rounded transition-colors cursor-pointer"
                title="Remove selected square"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Squares Container: Color Boxes (Draggable to Reorder) */}
      <div className="flex flex-wrap gap-2.5 py-1 items-start justify-start">
        {swatches.map((swatch, index) => {
          const isSelected = swatch.id === (activeSwatch?.id || '');
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;
          const simmedHex = simulateCVD(swatch.hex, cvdMode);
          const darkText = shouldUseDarkText(simmedHex);
          const textColor = darkText ? '#0F172A' : '#FFFFFF';

          return (
            <div
              key={swatch.id}
              className="flex flex-col items-center"
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', `${index}`);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverIndex !== index) {
                  setDragOverIndex(index);
                }
              }}
              onDragLeave={() => {
                if (dragOverIndex === index) {
                  setDragOverIndex(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(index);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
            >
              {/* Color Box */}
              <div
                onClick={() => setSelectedId(swatch.id)}
                style={{ backgroundColor: simmedHex }}
                className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all relative select-none shadow-2xs group ${
                  isDragging
                    ? 'opacity-40 scale-95 border-2 border-dashed border-blue-500 ring-2 ring-blue-300'
                    : isDragOver
                    ? 'ring-3 ring-blue-500 ring-offset-2 scale-105 z-20 shadow-md'
                    : isSelected
                    ? 'ring-3 ring-slate-900 shadow-md scale-105 z-10'
                    : 'border border-slate-300 hover:border-slate-400 hover:scale-102'
                }`}
                title={`Color: ${swatch.hex} (Click to select, drag to reorder)`}
              >
                {/* Drag Handle in top-left */}
                <div
                  className="absolute top-1 left-1 opacity-35 group-hover:opacity-80 transition-opacity pointer-events-none"
                  style={{ color: textColor }}
                  title="Drag to reorder"
                >
                  <GripVertical size={11} />
                </div>

                {/* Hex Label with Contrast Color */}
                <span
                  style={{ color: textColor }}
                  className="font-mono font-bold text-[10.5px] tracking-tight pointer-events-none drop-shadow-2xs select-none"
                >
                  {swatch.hex}
                </span>

                {/* Quick color picker button in bottom-right */}
                <label
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-1 right-1 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-90 hover:!opacity-100 transition-opacity cursor-pointer shadow-2xs"
                  style={{
                    backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)',
                    color: textColor,
                  }}
                  title="Change color"
                >
                  <Pipette size={9} />
                  <input
                    type="color"
                    value={swatch.hex.startsWith('#') && swatch.hex.length === 7 ? swatch.hex : '#000000'}
                    onChange={(e) => handleUpdateHex(swatch.id, e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>

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

              {/* Direct Inline Variable Name Underneath Square when "Add labels" is toggled */}
              {showNaming && (
                <input
                  type="text"
                  value={swatch.name ?? `c${index + 1}`}
                  onChange={(e) => handleUpdateName(swatch.id, e.target.value)}
                  placeholder={`c${index + 1}`}
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-16 mt-1 text-center bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  title="Variable name"
                />
              )}
            </div>
          );
        })}

        {/* Add Square Button in grid */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleAddSwatch}
            className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-400 hover:text-blue-600 flex flex-col items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Add another color square"
          >
            <Plus size={16} />
            <span className="text-[9px] font-medium mt-0.5">Add</span>
          </button>
          {showNaming && <div className="h-5 mt-1" />}
        </div>
      </div>

      {/* 5. Options Bar: Renamed toggle "Add labels", Drag hint & Reverse Order */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showNaming}
              onChange={(e) => setShowNaming(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer"
            />
            <span className="text-[11px] font-medium text-slate-700">Add labels</span>
          </label>
          <span className="text-[10px] text-slate-400 hidden sm:inline">· Drag squares to reorder</span>
        </div>

        <button
          onClick={handleReverseOrder}
          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
          title="Reverse current color order"
        >
          <ArrowRightLeft size={11} />
          <span>Reverse Order</span>
        </button>
      </div>
    </div>
  );
};
