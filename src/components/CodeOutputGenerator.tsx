import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ColorSwatch, PresetPalette, ActiveTab, ShapeAssignment } from '../types/palette';

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
  shapes?: ShapeAssignment[];
}

export const CodeOutputGenerator: React.FC<CodeOutputGeneratorProps> = ({
  activeTab,
  customSwatches,
  showNaming = false,
  selectedPreset,
  presetN,
  sampledPresetColors,
  isPruned,
  gradientAnchors,
  interpolatedGradientColors,
  shapes = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [presetCodeMode, setPresetCodeMode] = useState<'ggplot' | 'vector'>('ggplot');
  const [gradientCodeMode, setGradientCodeMode] = useState<'discrete' | 'vector' | 'continuous'>('discrete');

  const generateRCode = (): string => {
    // Tab 1: Custom Palette -> Default is clean vector output
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

    // Tab 2: Presets -> Uses native R preset functions (palette.colors, brewer, viridis) instead of raw hexes
    if (activeTab === 'preset') {
      if (presetCodeMode === 'vector') {
        if (!isPruned) {
          if (selectedPreset.id === 'okabe_ito') {
            return `palette.colors(n = ${presetN}, palette = "Okabe-Ito")`;
          }
          if (selectedPreset.id === 'tableau10') {
            return `palette.colors(n = ${presetN}, palette = "Tableau 10")`;
          }
          if (selectedPreset.category === 'viridis') {
            const func = selectedPreset.id === 'viridis' ? 'viridis' : selectedPreset.id;
            return `viridis::${func}(${presetN})`;
          }
          if (selectedPreset.category.startsWith('brewer')) {
            return `RColorBrewer::brewer.pal(n = ${presetN}, name = "${selectedPreset.name}")`;
          }
        }
        return `c(${sampledPresetColors.map(c => `"${c}"`).join(', ')})`;
      }

      // Default: ggplot layer
      if (isPruned) {
        return `scale_color_manual(values = c(${sampledPresetColors.map(c => `"${c}"`).join(', ')}))`;
      }
      return selectedPreset.rScaleColor;
    }

    // Tab 3: Gradient Builder -> Recognizes ALL colors (anchors + steps)
    if (activeTab === 'gradient') {
      if (gradientCodeMode === 'discrete') {
        return `scale_color_manual(values = c(${interpolatedGradientColors.map(c => `"${c}"`).join(', ')}))`;
      }
      if (gradientCodeMode === 'vector') {
        return `c(${interpolatedGradientColors.map(c => `"${c}"`).join(', ')})`;
      }
      if (gradientCodeMode === 'continuous') {
        const anchorHexes = gradientAnchors.map(a => `"${a.hex}"`).join(', ');
        return `scale_color_gradientn(colors = c(${anchorHexes}))`;
      }
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

          {/* Gradient tab toggle for discrete (all colors) vs vector vs continuous */}
          {activeTab === 'gradient' && (
            <div className="flex bg-slate-100 p-0.5 rounded text-[10px] font-medium border border-slate-200">
              <button
                onClick={() => setGradientCodeMode('discrete')}
                title={`Discrete scale using all ${interpolatedGradientColors.length} interpolated colors`}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  gradientCodeMode === 'discrete' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                manual ({interpolatedGradientColors.length})
              </button>
              <button
                onClick={() => setGradientCodeMode('vector')}
                title={`R vector c(...) of all ${interpolatedGradientColors.length} colors`}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  gradientCodeMode === 'vector' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                vector
              </button>
              <button
                onClick={() => setGradientCodeMode('continuous')}
                title="Continuous scale_color_gradientn using anchor keypoints"
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  gradientCodeMode === 'continuous' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                gradientn
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

      <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-2 rounded-md overflow-x-auto select-all leading-relaxed whitespace-pre-wrap break-all shadow-inner">
        <code>{codeText}</code>
      </div>
    </div>
  );
};
