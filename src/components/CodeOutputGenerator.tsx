import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PresetPalette,
  ActiveTab,
  ShapeAssignment,
  NamedCustomPalette,
  ThemeSettings,
} from '../types/palette';

interface CodeOutputGeneratorProps {
  activeTab: ActiveTab;
  activeCustomPalette: NamedCustomPalette;
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
  showShapeLabels?: boolean;
  themeSettings?: ThemeSettings;
}

export const CodeOutputGenerator: React.FC<CodeOutputGeneratorProps> = ({
  activeTab,
  activeCustomPalette,
  showNaming = false,
  selectedPreset,
  presetN,
  sampledPresetColors,
  isPruned,
  gradientAnchors,
  interpolatedGradientColors,
  shapes = [],
  showShapeLabels = false,
  themeSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [customCodeMode, setCustomCodeMode] = useState<'vector' | 'ggplot'>('vector');
  const [presetCodeMode, setPresetCodeMode] = useState<'ggplot' | 'vector'>('ggplot');
  const [gradientCodeMode, setGradientCodeMode] = useState<'discrete' | 'vector' | 'continuous'>('discrete');
  const [themeCodeMode, setThemeCodeMode] = useState<'standalone' | 'applied'>('standalone');

  const generateRCode = (): string => {
    // Tab 1: Custom Palette -> Uses the user's custom palette name as vector variable name!
    if (activeTab === 'custom') {
      const varName = (activeCustomPalette.name || 'my_palette')
        .trim()
        .replace(/[^a-zA-Z0-9_.]/g, '_') || 'my_palette';

      let vectorCode = '';
      if (showNaming) {
        const vectorItems = activeCustomPalette.swatches.map((s, i) => {
          const cleanName = (s.name && s.name.trim().length > 0)
            ? s.name.trim().replace(/[^a-zA-Z0-9_.]/g, '_')
            : `c${i + 1}`;
          return `${cleanName} = "${s.hex}"`;
        });
        vectorCode = `${varName} <- c(${vectorItems.join(', ')})`;
      } else {
        vectorCode = `${varName} <- c(${activeCustomPalette.swatches.map(s => `"${s.hex}"`).join(', ')})`;
      }

      if (customCodeMode === 'ggplot') {
        return `${vectorCode}\nscale_color_manual(values = ${varName})`;
      }
      return vectorCode;
    }

    // Tab 2: Presets -> Uses native R preset functions (palette.colors, brewer, viridis)
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

    // Tab 3: Gradient Builder
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
      const hasMultipleColors = shapes.some(s => s.color !== shapes[0]?.color);
      const hasFill = shapes.some(s => s.fill && s.pch >= 21 && s.pch <= 25);

      if (showShapeLabels) {
        const shapeItems = shapes.map((s, i) => {
          const cleanLabel = (s.label && s.label.trim().length > 0)
            ? s.label.trim().replace(/[^a-zA-Z0-9_.]/g, '_')
            : `Class_${i + 1}`;
          return `${cleanLabel} = ${s.pch}`;
        });

        let code = `scale_shape_manual(values = c(${shapeItems.join(', ')}))`;

        if (hasMultipleColors) {
          const colorItems = shapes.map((s, i) => {
            const cleanLabel = (s.label && s.label.trim().length > 0)
              ? s.label.trim().replace(/[^a-zA-Z0-9_.]/g, '_')
              : `Class_${i + 1}`;
            return `${cleanLabel} = "${s.color}"`;
          });
          code += ` +\nscale_color_manual(values = c(${colorItems.join(', ')}))`;
        }

        if (hasFill) {
          const fillItems = shapes.map((s, i) => {
            const cleanLabel = (s.label && s.label.trim().length > 0)
              ? s.label.trim().replace(/[^a-zA-Z0-9_.]/g, '_')
              : `Class_${i + 1}`;
            return `${cleanLabel} = "${s.fill || s.color}"`;
          });
          code += ` +\nscale_fill_manual(values = c(${fillItems.join(', ')}))`;
        }

        return code;
      }

      // Default without labels
      const pchValues = shapes.map(s => s.pch).join(', ');
      let code = `scale_shape_manual(values = c(${pchValues}))`;

      if (hasMultipleColors) {
        const colorValues = shapes.map(s => `"${s.color}"`).join(', ');
        code += ` +\nscale_color_manual(values = c(${colorValues}))`;
      }

      if (hasFill) {
        const fillValues = shapes.map(s => `"${s.fill || s.color}"`).join(', ');
        code += ` +\nscale_fill_manual(values = c(${fillValues}))`;
      }

      return code;
    }

    // Tab 5: Themes Builder -> Generates custom ggplot theme function & layer
    if (activeTab === 'themes' && themeSettings) {
      const themeLines: string[] = [];
      const baseFn = `theme_${themeSettings.baseTheme}`;
      const baseArgs = [];
      if (themeSettings.baseSize !== 11) baseArgs.push(`base_size = ${themeSettings.baseSize}`);
      if (themeSettings.fontFamily !== 'sans') baseArgs.push(`base_family = "${themeSettings.fontFamily}"`);

      // Backgrounds
      if (themeSettings.isTransparentBackground) {
        themeLines.push('    plot.background = element_rect(fill = "transparent", colour = NA)');
        themeLines.push('    panel.background = element_rect(fill = "transparent", colour = NA)');
      } else {
        if (themeSettings.plotBackground !== '#FFFFFF') {
          themeLines.push(`    plot.background = element_rect(fill = "${themeSettings.plotBackground}", colour = NA)`);
        }
        if (themeSettings.panelBackground !== '#FFFFFF') {
          themeLines.push(`    panel.background = element_rect(fill = "${themeSettings.panelBackground}", colour = NA)`);
        }
      }

      // Panel border
      if (themeSettings.hasPanelBorder) {
        themeLines.push(`    panel.border = element_rect(colour = "${themeSettings.panelBorderColor}", fill = NA, linewidth = 0.8)`);
      } else if (['bw', 'light'].includes(themeSettings.baseTheme)) {
        themeLines.push('    panel.border = element_blank()');
      }

      // Axis lines
      if (themeSettings.hasAxisLine) {
        themeLines.push(`    axis.line = element_line(colour = "${themeSettings.axisLineColor}")`);
      }

      // Major grid
      if (!themeSettings.showMajorGrid) {
        themeLines.push('    panel.grid.major = element_blank()');
      } else {
        const gridParts = [`colour = "${themeSettings.majorGridColor}"`];
        if (themeSettings.majorGridLinetype !== 'solid') {
          gridParts.push(`linetype = "${themeSettings.majorGridLinetype}"`);
        }
        themeLines.push(`    panel.grid.major = element_line(${gridParts.join(', ')})`);
      }

      // Minor grid
      if (!themeSettings.showMinorGrid) {
        themeLines.push('    panel.grid.minor = element_blank()');
      } else if (themeSettings.minorGridColor !== '#F8FAFC') {
        themeLines.push(`    panel.grid.minor = element_line(colour = "${themeSettings.minorGridColor}")`);
      }

      // Ticks
      if (!themeSettings.showTicks) {
        themeLines.push('    axis.ticks = element_blank()');
      } else {
        themeLines.push(`    axis.ticks = element_line(colour = "${themeSettings.ticksColor}")`);
      }

      // Facet strips
      if (themeSettings.isFacetStripTransparent) {
        themeLines.push('    strip.background = element_blank()');
      } else if (themeSettings.facetStripBackground !== '#E2E8F0' || themeSettings.facetStripBorder) {
        const stripCol = themeSettings.facetStripBorder ? ', colour = "#0F172A"' : ', colour = NA';
        themeLines.push(`    strip.background = element_rect(fill = "${themeSettings.facetStripBackground}"${stripCol})`);
      }

      if (themeSettings.facetStripTextColor !== '#1E293B' || !themeSettings.facetStripTextBold) {
        const textParts = [`colour = "${themeSettings.facetStripTextColor}"`];
        if (themeSettings.facetStripTextBold) textParts.push('face = "bold"');
        themeLines.push(`    strip.text = element_text(${textParts.join(', ')})`);
      }

      // Legend
      if (themeSettings.legendPosition !== 'right') {
        themeLines.push(`    legend.position = "${themeSettings.legendPosition}"`);
      }
      if (themeSettings.isLegendTransparent) {
        themeLines.push('    legend.background = element_rect(fill = "transparent", colour = NA)');
      } else if (themeSettings.legendBackground !== '#FFFFFF') {
        themeLines.push(`    legend.background = element_rect(fill = "${themeSettings.legendBackground}")`);
      }

      // Title face
      if (themeSettings.titleFace !== 'bold') {
        themeLines.push(`    plot.title = element_text(face = "${themeSettings.titleFace}")`);
      }

      let code = `custom_theme <- ${baseFn}(${baseArgs.join(', ')})`;
      if (themeLines.length > 0) {
        code += ` +\n  theme(\n${themeLines.join(',\n')}\n  )`;
      }

      if (themeCodeMode === 'applied') {
        let applied = `p + custom_theme`;
        const f1 = themeSettings.facet1Name || 'Group A';
        const f2 = themeSettings.facet2Name || 'Group B';
        applied += ` +\n  facet_wrap(~ group, labeller = as_labeller(c("1" = "${f1}", "2" = "${f2}")))`;

        if (themeSettings.scaleFormatting === 'percent') {
          applied += ` +\n  scale_y_continuous(labels = scales::percent)`;
        } else if (themeSettings.scaleFormatting === 'log10') {
          applied += ` +\n  scale_y_log10(labels = scales::label_log())`;
        } else if (themeSettings.scaleFormatting === 'comma') {
          applied += ` +\n  scale_y_continuous(labels = scales::label_comma())`;
        }
        return `${code}\n\n# Applied to faceted ggplot object:\n${applied}`;
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
          {/* Custom tab toggle for vector vs ggplot */}
          {activeTab === 'custom' && (
            <div className="flex bg-slate-100 p-0.5 rounded text-[10px] font-medium border border-slate-200">
              <button
                onClick={() => setCustomCodeMode('vector')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  customCodeMode === 'vector' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                vector
              </button>
              <button
                onClick={() => setCustomCodeMode('ggplot')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  customCodeMode === 'ggplot' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                ggplot
              </button>
            </div>
          )}

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

          {/* Gradient tab toggle: manual, vector, continuous */}
          {activeTab === 'gradient' && (
            <div className="flex bg-slate-100 p-0.5 rounded text-[10px] font-medium border border-slate-200">
              <button
                onClick={() => setGradientCodeMode('discrete')}
                title="Discrete manual scale using interpolated colors"
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  gradientCodeMode === 'discrete' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                manual
              </button>
              <button
                onClick={() => setGradientCodeMode('vector')}
                title="R vector c(...) of interpolated colors"
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  gradientCodeMode === 'vector' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                vector
              </button>
              <button
                onClick={() => setGradientCodeMode('continuous')}
                title="Continuous scale_color_gradientn using anchor keypoints"
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  gradientCodeMode === 'continuous' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                gradientn
              </button>
            </div>
          )}

          {/* Theme tab toggle: standalone theme definition vs applied */}
          {activeTab === 'themes' && (
            <div className="flex bg-slate-100 p-0.5 rounded text-[10px] font-medium border border-slate-200">
              <button
                onClick={() => setThemeCodeMode('standalone')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  themeCodeMode === 'standalone' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                theme
              </button>
              <button
                onClick={() => setThemeCodeMode('applied')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  themeCodeMode === 'applied' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                + plot
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
