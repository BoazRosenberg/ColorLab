import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ColorSwatch, PresetPalette, ShapeAssignment, ActiveTab } from '../types/palette';

interface CodeOutputGeneratorProps {
  activeTab: ActiveTab;
  customSwatches: ColorSwatch[];
  showNaming?: boolean;
  selectedPreset: PresetPalette;
  presetN: number;
  sampledPresetColors: string[];
  isPruned: boolean;
  trimStart: number;
  trimEnd: number;
  gradientAnchors: Array<{ hex: string; stepsToNext: number }>;
  interpolatedGradientColors: string[];
  shapes: ShapeAssignment[];
}

export const CodeOutputGenerator: React.FC<CodeOutputGeneratorProps> = ({
  activeTab,
  customSwatches,
  showNaming = false,
  selectedPreset,
  presetN,
  sampledPresetColors,
  isPruned,
  trimStart,
  trimEnd,
  gradientAnchors,
  interpolatedGradientColors,
  shapes,
}) => {
  const [copied, setCopied] = useState(false);
  // Preset mode can toggle between ggplot (default) and vector
  const [presetCodeMode, setPresetCodeMode] = useState<'ggplot' | 'vector'>('ggplot');

  const generateRCode = (): string => {
    // Tab 1: Custom Palette -> Default is clean vector output!
    if (activeTab === 'custom') {
      if (showNaming) {
        const vectorItems = customSwatches.map((s, i) => {
          const cleanName = (s.name && s.name.trim().length > 0)
            ? s.name.trim().replace(/[^a-zA-Z0-9_]/g, '_')
            : `c${i + 1}`;
          return `${cleanName} = "${s.hex}"`;
        });
        return `c(${vectorItems.join(', ')})`;
      }
      return `c(${customSwatches.map(s => `"${s.hex}"`).join(', ')})`;
    }

    // Tab 2: Presets -> Default is ggplot layer code, can toggle to vector
    if (activeTab === 'preset') {
      if (presetCodeMode === 'vector') {
        return `c(${sampledPresetColors.map(c => `"${c}"`).join(', ')})`;
      }

      // Default: ggplot layer
      if (isPruned) {
        return `scale_color_manual(values = c(${sampledPresetColors.map(c => `"${c}"`).join(', ')}))`;
      }
      return selectedPreset.rScaleColor;
    }

    // Tab 3: Gradient Builder -> Default is scale_color_gradientn
    if (activeTab === 'gradient') {
      const anchorHexes = gradientAnchors.map(a => `"${a.hex}"`).join(', ');
      return `scale_color_gradientn(colors = c(${anchorHexes}))`;
    }

    // Tab 4: Shapes -> ggplot shape + color scale layers
    if (activeTab === 'shapes') {
      const pchValues = shapes.map(s => s.pch).join(', ');
      const colorValues = shapes.map(s => `"${s.color}"`).join(', ');
      const hasFill = shapes.some(s => s.fill);

      let code = `scale_shape_manual(values = c(${pchValues})) +\nscale_color_manual(values = c(${colorValues}))`;
      if (hasFill) {
        const fillValues = shapes.map(s => `"${s.fill || s.color}"`).join(', ');
        code += ` +\nscale_fill_manual(values = c(${fillValues}))`;
      }
      return code;
    }

    return '';
  };

  const codeText = generateRCode();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      confetti({
        particleCount: 20,
        spread: 35,
        origin: { y: 0.95 },
        colors: ['#2563EB', '#10B981', '#F59E0B'],
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = codeText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-2.5 shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Terminal size={12} className="text-slate-500" />
          <span>R Code</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Preset tab toggle for vector vs ggplot */}
          {activeTab === 'preset' && (
            <div className="flex bg-slate-100 p-0.5 rounded text-[10px] font-medium border border-slate-200">
              <button
                onClick={() => setPresetCodeMode('ggplot')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  presetCodeMode === 'ggplot' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                ggplot
              </button>
              <button
                onClick={() => setPresetCodeMode('vector')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  presetCodeMode === 'vector' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                vector
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Copy R code"
          >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code preview block */}
      <pre className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] font-mono text-slate-900 overflow-x-auto whitespace-pre leading-relaxed select-all">
        {codeText}
      </pre>
    </div>
  );
};
