import React, { useState, useEffect, useMemo } from 'react';
import { Columns } from 'lucide-react';
import { CVDMode, ShapeAssignment, ThemeSettings } from '../types/palette';
import { simulateCVD } from '../utils/cvd';
import { ShapeIcon } from './ShapeIcon';

interface PlotPreviewerProps {
  colors: string[];
  cvdMode: CVDMode;
  shapes?: ShapeAssignment[];
  activeTab: string;
  showShapeLabels?: boolean;
  themeSettings?: ThemeSettings;
  showFacetPreview?: boolean;
  onUpdateFacetName?: (facetNum: 1 | 2, name: string) => void;
}

export const PlotPreviewer: React.FC<PlotPreviewerProps> = ({
  colors,
  cvdMode,
  shapes,
  activeTab,
  showShapeLabels = false,
  themeSettings,
  showFacetPreview = false,
  onUpdateFacetName,
}) => {
  const [plotType, setPlotType] = useState<'bars' | 'scatter'>('bars');

  // Automatically switch to scatter plot when viewing shapes
  useEffect(() => {
    if (activeTab === 'shapes') {
      setPlotType('scatter');
    }
  }, [activeTab]);

  const safeColors = colors.length > 0 ? colors : ['#3B82F6'];
  const simulatedColors = safeColors.map(c => simulateCVD(c, cvdMode));

  // Determine legend position & layout
  const legPos = themeSettings?.legendPosition ?? 'right';
  const hasLegend = legPos !== 'none';

  // Canvas dimensions
  const width = 380;
  const height = 180;

  const padLeft = legPos === 'left' ? 70 : 36;
  const padRight =
    legPos === 'right'
      ? (shapes && shapes.length > 0) || simulatedColors.length > 6
        ? 84
        : 64
      : 18;
  const padTop = legPos === 'top' ? 26 : 14;
  const padBottom = legPos === 'bottom' ? 36 : 24;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const minX = 1.0;
  const maxX = 7.0;
  const minY = 0.0;
  const maxY = 2.8;

  const mapX = (val: number) => padLeft + ((val - minX) / (maxX - minX)) * plotWidth;
  const mapY = (val: number) => padTop + plotHeight - ((val - minY) / (maxY - minY)) * plotHeight;

  // Font family mapping
  const fontFamily =
    themeSettings?.fontFamily === 'serif'
      ? 'Georgia, serif'
      : themeSettings?.fontFamily === 'mono'
      ? 'ui-monospace, monospace'
      : 'system-ui, -apple-system, sans-serif';

  // Generate deterministic scatter points
  const groupCount =
    activeTab === 'shapes' && shapes && shapes.length > 0 ? shapes.length : safeColors.length;

  const scatterPoints = useMemo(() => {
    const pts: Array<{ x: number; y: number; group: number }> = [];
    for (let g = 0; g < groupCount; g++) {
      const frac = groupCount > 1 ? g / (groupCount - 1) : 0.5;
      const centerX = 1.5 + frac * 4.6;
      const centerY = 0.4 + frac * 1.8 + (g % 2 === 0 ? 0.2 : -0.2);

      const offsets = [
        { dx: -0.18, dy: -0.14 },
        { dx: 0.14, dy: 0.16 },
        { dx: -0.09, dy: 0.22 },
        { dx: 0.19, dy: -0.12 },
      ];

      offsets.forEach(off => {
        pts.push({
          x: Math.max(1.1, Math.min(6.8, centerX + off.dx)),
          y: Math.max(0.1, Math.min(2.7, centerY + off.dy)),
          group: g,
        });
      });
    }
    return pts;
  }, [groupCount]);

  // Dash array for major grid
  const getDashArray = () => {
    if (themeSettings?.majorGridLinetype === 'dashed') return '4 3';
    if (themeSettings?.majorGridLinetype === 'dotted') return '1.5 2.5';
    return undefined;
  };

  // Y tick formatting
  const getYLabel = (val: number) => {
    const fmt = themeSettings?.scaleFormatting ?? 'normal';
    if (fmt === 'percent') return `${Math.round((val / 2.5) * 100)}%`;
    if (fmt === 'log10') {
      if (val === 0.5) return '10⁰';
      if (val === 1.5) return '10¹';
      if (val === 2.5) return '10²';
      return `${val}`;
    }
    if (fmt === 'comma') return `${Math.round(val * 1000)}`;
    return `${val.toFixed(1)}`;
  };

  const isFaceted = showFacetPreview;
  const facetGap = 8;
  const singleW = (plotWidth - facetGap) / 2;
  const stripH = 14;
  const panelY = padTop + stripH;
  const panelH = plotHeight - stripH;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-xs">
        <span className="font-medium text-slate-700">
          Live Plot Preview{' '}
          {activeTab === 'themes'
            ? `(Theme: ${themeSettings?.baseTheme || 'minimal'}${isFaceted ? ', faceted' : ''})`
            : activeTab === 'shapes'
            ? '(Scatter with shapes)'
            : `(${safeColors.length} colors)`}
        </span>

        <div className="flex bg-slate-100 rounded p-0.5 text-[10px]">
          {activeTab !== 'shapes' && (
            <button
              onClick={() => setPlotType('bars')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                plotType === 'bars'
                  ? 'bg-white text-slate-900 font-medium shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Bars
            </button>
          )}
          <button
            onClick={() => setPlotType('scatter')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              plotType === 'scatter'
                ? 'bg-white text-slate-900 font-medium shadow-2xs'
                : 'text-slate-500'
            }`}
          >
            Scatter
          </button>
        </div>
      </div>

      {/* Inline Facet Names Editor Bar when Faceted */}
      {isFaceted && (
        <div className="flex items-center justify-between gap-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md mb-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px] shrink-0">
            <Columns size={12} className="text-blue-600" />
            <span>Facet Names:</span>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end max-w-[280px]">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-medium">1:</span>
              <input
                type="text"
                value={themeSettings?.facet1Name ?? 'Group A'}
                onChange={(e) => onUpdateFacetName?.(1, e.target.value)}
                placeholder="Group A"
                className="w-24 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-medium">2:</span>
              <input
                type="text"
                value={themeSettings?.facet2Name ?? 'Group B'}
                onChange={(e) => onUpdateFacetName?.(2, e.target.value)}
                placeholder="Group B"
                className="w-24 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="w-full flex justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-full rounded select-none"
          style={{
            height: 'auto',
            maxHeight: '185px',
            fontFamily,
          }}
        >
          <defs>
            {/* Checkerboard pattern for transparent background */}
            <pattern id="theme-checkerboard" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#F8FAFC" />
              <rect x="4" width="4" height="4" fill="#E2E8F0" />
              <rect y="4" width="4" height="4" fill="#E2E8F0" />
              <rect x="4" y="4" width="4" height="4" fill="#F8FAFC" />
            </pattern>
          </defs>

          {/* Plot Canvas Background */}
          {themeSettings?.isTransparentBackground ? (
            <rect width={width} height={height} fill="url(#theme-checkerboard)" rx="4" />
          ) : (
            <rect
              width={width}
              height={height}
              fill={themeSettings?.plotBackground || '#FFFFFF'}
              rx="4"
            />
          )}

          {/* FACETED MODE vs SINGLE PANEL MODE */}
          {isFaceted ? (
            // ==================== FACETED 2-PANEL RENDERING ====================
            <g>
              {[0, 1].map((facetIdx) => {
                const fx = padLeft + facetIdx * (singleW + facetGap);
                const facetTitle =
                  facetIdx === 0
                    ? themeSettings?.facet1Name || 'Group A'
                    : themeSettings?.facet2Name || 'Group B';

                return (
                  <g key={`facet-panel-${facetIdx}`}>
                    {/* Facet Strip Header */}
                    <rect
                      x={fx}
                      y={padTop}
                      width={singleW}
                      height={stripH}
                      fill={
                        themeSettings?.isFacetStripTransparent
                          ? 'none'
                          : themeSettings?.facetStripBackground || '#E2E8F0'
                      }
                      stroke={
                        themeSettings?.facetStripBorder
                          ? themeSettings?.panelBorderColor || '#0F172A'
                          : '#CBD5E1'
                      }
                      strokeWidth="0.8"
                    />
                    <text
                      x={fx + singleW / 2}
                      y={padTop + 10}
                      textAnchor="middle"
                      fill={themeSettings?.facetStripTextColor || '#1E293B'}
                      fontSize="8"
                      fontWeight={themeSettings?.facetStripTextBold !== false ? 'bold' : 'normal'}
                      fontFamily={fontFamily}
                    >
                      {facetTitle}
                    </text>

                    {/* Facet Panel Box (Data Area) */}
                    <rect
                      x={fx}
                      y={panelY}
                      width={singleW}
                      height={panelH}
                      fill={
                        themeSettings?.isTransparentBackground
                          ? 'none'
                          : themeSettings?.panelBackground || '#FFFFFF'
                      }
                      stroke={
                        themeSettings?.hasPanelBorder
                          ? themeSettings.panelBorderColor || '#0F172A'
                          : '#CBD5E1'
                      }
                      strokeWidth="1"
                    />

                    {/* Facet Internal Gridlines */}
                    {themeSettings?.showMajorGrid !== false && (
                      <g>
                        {[0.25, 0.5, 0.75].map(frac => (
                          <line
                            key={`fgx-${facetIdx}-${frac}`}
                            x1={fx + frac * singleW}
                            y1={panelY}
                            x2={fx + frac * singleW}
                            y2={panelY + panelH}
                            stroke={themeSettings?.majorGridColor || '#F1F5F9'}
                            strokeWidth="0.8"
                            strokeDasharray={getDashArray()}
                          />
                        ))}
                        {[0.25, 0.5, 0.75].map(frac => (
                          <line
                            key={`fgy-${facetIdx}-${frac}`}
                            x1={fx}
                            y1={panelY + frac * panelH}
                            x2={fx + singleW}
                            y2={panelY + frac * panelH}
                            stroke={themeSettings?.majorGridColor || '#F1F5F9'}
                            strokeWidth="0.8"
                            strokeDasharray={getDashArray()}
                          />
                        ))}
                      </g>
                    )}

                    {/* Axis Lines if enabled */}
                    {themeSettings?.hasAxisLine && (
                      <line
                        x1={fx}
                        y1={panelY + panelH}
                        x2={fx + singleW}
                        y2={panelY + panelH}
                        stroke={themeSettings.axisLineColor || '#0F172A'}
                        strokeWidth="1"
                      />
                    )}

                    {/* BARS: Separated cleanly inside each facet */}
                    {plotType === 'bars' && (() => {
                      const splitIndex = Math.ceil(simulatedColors.length / 2);
                      const facetBars = simulatedColors
                        .map((col, originalIdx) => ({
                          col,
                          originalIdx,
                          label: `C${originalIdx + 1}`,
                        }))
                        .filter(({ originalIdx }) => {
                          if (simulatedColors.length <= 1) return true;
                          return facetIdx === 0
                            ? originalIdx < splitIndex
                            : originalIdx >= splitIndex;
                        });

                      const barCount = facetBars.length;
                      const innerMargin = 7;
                      const availableW = singleW - innerMargin * 2;
                      const gap = barCount > 3 ? 3 : 5;
                      const barW = Math.max(
                        6,
                        Math.min(
                          22,
                          (availableW - Math.max(0, barCount - 1) * gap) / Math.max(1, barCount)
                        )
                      );
                      const totalBarSpan = barCount * barW + Math.max(0, barCount - 1) * gap;
                      const startX = fx + (singleW - totalBarSpan) / 2;

                      return (
                        <g>
                          {facetBars.map(({ col, originalIdx, label }, localIdx) => {
                            const barX = startX + localIdx * (barW + gap);
                            const baseRatios = [0.5, 0.85, 0.65, 0.95, 0.45, 0.75, 0.6, 0.9, 0.4, 0.8];
                            const base = baseRatios[originalIdx % baseRatios.length];
                            const r =
                              facetIdx === 0
                                ? base * 0.85
                                : Math.max(
                                    0.25,
                                    Math.min(
                                      0.95,
                                      base * 1.1 + (originalIdx % 2 === 0 ? 0.08 : -0.1)
                                    )
                                  );

                            const barH = panelH * r * 0.82;
                            const barY = panelY + panelH - barH;

                            return (
                              <g key={`fbar-${facetIdx}-${originalIdx}`}>
                                <rect
                                  x={barX}
                                  y={barY}
                                  width={barW}
                                  height={barH}
                                  fill={col}
                                  stroke="#E2E8F0"
                                  strokeWidth="0.5"
                                  rx="1"
                                >
                                  <title>{`${label}: ${col}`}</title>
                                </rect>
                                <text
                                  x={barX + barW / 2}
                                  y={panelY + panelH + 8}
                                  textAnchor="middle"
                                  fill="#64748B"
                                  fontSize="7"
                                  fontFamily={fontFamily}
                                >
                                  {label}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}

                    {/* SCATTER POINTS: Separated cleanly inside each facet */}
                    {plotType === 'scatter' && (() => {
                      const splitIndex = Math.ceil(groupCount / 2);
                      const facetPts = scatterPoints.filter(pt => {
                        if (groupCount <= 1) return true;
                        return facetIdx === 0
                          ? pt.group < splitIndex
                          : pt.group >= splitIndex;
                      });

                      return (
                        <g>
                          {facetPts.map((pt, idx) => {
                            const groupIdx = pt.group;
                            const shapeAssigned = shapes && shapes[groupIdx];
                            const pch = shapeAssigned ? shapeAssigned.pch : 16;
                            const rawColor = shapeAssigned
                              ? shapeAssigned.color
                              : safeColors[groupIdx % safeColors.length];
                            const pointColor = simulateCVD(rawColor, cvdMode);
                            const fillCol = shapeAssigned?.fill
                              ? simulateCVD(shapeAssigned.fill, cvdMode)
                              : pointColor;

                            const normX = (pt.x - minX) / (maxX - minX);
                            const normY = (pt.y - minY) / (maxY - minY);
                            const cx = fx + 7 + normX * (singleW - 14);
                            const cy = panelY + panelH - (6 + normY * (panelH - 12));

                            if (shapeAssigned || activeTab === 'shapes') {
                              return (
                                <g
                                  key={`fpt-${facetIdx}-${idx}`}
                                  transform={`translate(${cx - 7}, ${cy - 7})`}
                                >
                                  <ShapeIcon
                                    pch={pch}
                                    size={13}
                                    color={pointColor}
                                    fill={fillCol}
                                    strokeWidth={1.4}
                                  />
                                </g>
                              );
                            }

                            return (
                              <circle
                                key={`fpt-${facetIdx}-${idx}`}
                                cx={cx}
                                cy={cy}
                                r={3}
                                fill={pointColor}
                                stroke="#FFFFFF"
                                strokeWidth={0.7}
                                opacity={0.9}
                              />
                            );
                          })}
                        </g>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          ) : (
            // ==================== SINGLE PANEL RENDERING ====================
            <g>
              {/* Panel Background (Data Area) */}
              <rect
                x={padLeft}
                y={padTop}
                width={plotWidth}
                height={plotHeight}
                fill={
                  themeSettings?.isTransparentBackground
                    ? 'none'
                    : themeSettings?.panelBackground || '#FFFFFF'
                }
              />

              {/* Minor Gridlines */}
              {themeSettings?.showMinorGrid && (
                <g>
                  {[1.5, 2.5, 3.5, 4.5, 5.5, 6.5].map(xVal => (
                    <line
                      key={`gmin-x-${xVal}`}
                      x1={mapX(xVal)}
                      y1={padTop}
                      x2={mapX(xVal)}
                      y2={padTop + plotHeight}
                      stroke={themeSettings?.minorGridColor || '#F8FAFC'}
                      strokeWidth="0.6"
                    />
                  ))}
                  {[0.25, 0.75, 1.25, 1.75, 2.25].map(yVal => (
                    <line
                      key={`gmin-y-${yVal}`}
                      x1={padLeft}
                      y1={mapY(yVal)}
                      x2={padLeft + plotWidth}
                      y2={mapY(yVal)}
                      stroke={themeSettings?.minorGridColor || '#F8FAFC'}
                      strokeWidth="0.6"
                    />
                  ))}
                </g>
              )}

              {/* Major Gridlines */}
              {themeSettings?.showMajorGrid !== false && (
                <g>
                  {[2, 3, 4, 5, 6].map(xVal => (
                    <line
                      key={`gx-${xVal}`}
                      x1={mapX(xVal)}
                      y1={padTop}
                      x2={mapX(xVal)}
                      y2={padTop + plotHeight}
                      stroke={themeSettings?.majorGridColor || '#F1F5F9'}
                      strokeWidth="1"
                      strokeDasharray={getDashArray()}
                    />
                  ))}
                  {[0.5, 1.0, 1.5, 2.0, 2.5].map(yVal => (
                    <line
                      key={`gy-${yVal}`}
                      x1={padLeft}
                      y1={mapY(yVal)}
                      x2={padLeft + plotWidth}
                      y2={mapY(yVal)}
                      stroke={themeSettings?.majorGridColor || '#F1F5F9'}
                      strokeWidth="1"
                      strokeDasharray={getDashArray()}
                    />
                  ))}
                </g>
              )}

              {/* Panel Border Box */}
              {themeSettings?.hasPanelBorder && (
                <rect
                  x={padLeft}
                  y={padTop}
                  width={plotWidth}
                  height={plotHeight}
                  fill="none"
                  stroke={themeSettings.panelBorderColor || '#0F172A'}
                  strokeWidth="1"
                />
              )}

              {/* Axis Lines (L-shape) */}
              {themeSettings?.hasAxisLine && (
                <>
                  <line
                    x1={padLeft}
                    y1={padTop + plotHeight}
                    x2={padLeft + plotWidth}
                    y2={padTop + plotHeight}
                    stroke={themeSettings.axisLineColor || '#0F172A'}
                    strokeWidth="1"
                  />
                  <line
                    x1={padLeft}
                    y1={padTop}
                    x2={padLeft}
                    y2={padTop + plotHeight}
                    stroke={themeSettings.axisLineColor || '#0F172A'}
                    strokeWidth="1"
                  />
                </>
              )}

              {/* Axis Ticks */}
              {themeSettings?.showTicks && (
                <g>
                  {[2, 3, 4, 5, 6].map(xVal => (
                    <line
                      key={`tick-x-${xVal}`}
                      x1={mapX(xVal)}
                      y1={padTop + plotHeight}
                      x2={mapX(xVal)}
                      y2={padTop + plotHeight + 3}
                      stroke={themeSettings.ticksColor || '#0F172A'}
                      strokeWidth="1"
                    />
                  ))}
                  {[0.5, 1.0, 1.5, 2.0, 2.5].map(yVal => (
                    <line
                      key={`tick-y-${yVal}`}
                      x1={padLeft - 3}
                      y1={mapY(yVal)}
                      x2={padLeft}
                      y2={mapY(yVal)}
                      stroke={themeSettings.ticksColor || '#0F172A'}
                      strokeWidth="1"
                    />
                  ))}
                </g>
              )}

              {/* Scatter Plot: Single Panel */}
              {plotType === 'scatter' && (
                <g>
                  {scatterPoints.map((pt, idx) => {
                    const groupIdx = pt.group;
                    const shapeAssigned = shapes && shapes[groupIdx];
                    const pch = shapeAssigned ? shapeAssigned.pch : 16;
                    const rawColor = shapeAssigned
                      ? shapeAssigned.color
                      : safeColors[groupIdx % safeColors.length];
                    const pointColor = simulateCVD(rawColor, cvdMode);
                    const fillCol = shapeAssigned?.fill
                      ? simulateCVD(shapeAssigned.fill, cvdMode)
                      : pointColor;

                    const cx = mapX(pt.x);
                    const cy = mapY(pt.y);

                    if (shapeAssigned || activeTab === 'shapes') {
                      return (
                        <g key={`pt-${idx}`} transform={`translate(${cx - 7}, ${cy - 7})`}>
                          <ShapeIcon
                            pch={pch}
                            size={14}
                            color={pointColor}
                            fill={fillCol}
                            strokeWidth={1.5}
                          />
                        </g>
                      );
                    }

                    return (
                      <circle
                        key={`pt-${idx}`}
                        cx={cx}
                        cy={cy}
                        r={3.5}
                        fill={pointColor}
                        stroke="#FFFFFF"
                        strokeWidth={0.8}
                        opacity={0.9}
                      />
                    );
                  })}
                </g>
              )}

              {/* Bar Chart: Single Panel */}
              {plotType === 'bars' && (
                <g>
                  {simulatedColors.map((col, idx) => {
                    const barCount = simulatedColors.length;
                    const gap = barCount > 10 ? 1.5 : 3;
                    const totalGaps = (barCount - 1) * gap;
                    const availableW = plotWidth - 8;
                    const barW = Math.max(2.5, Math.min(26, (availableW - totalGaps) / barCount));
                    const totalBarSpan = barCount * barW + totalGaps;
                    const startOffset = padLeft + (plotWidth - totalBarSpan) / 2;

                    const barX = startOffset + idx * (barW + gap);
                    const ratios = [
                      0.45, 0.85, 0.65, 0.95, 0.55, 0.75, 0.4, 0.9, 0.6, 0.8, 0.5, 0.7,
                    ];
                    const r = ratios[idx % ratios.length];
                    const barH = plotHeight * r * 0.9;
                    const barY = padTop + plotHeight - barH;

                    return (
                      <rect
                        key={`bar-${idx}`}
                        x={barX}
                        y={barY}
                        width={barW}
                        height={barH}
                        fill={col}
                        stroke="#E2E8F0"
                        strokeWidth="0.5"
                        rx="1"
                      />
                    );
                  })}
                </g>
              )}
            </g>
          )}

          {/* Y Axis tick labels with scale formatting */}
          <g>
            {[0.5, 1.5, 2.5].map(yVal => (
              <text
                key={`lbl-y-${yVal}`}
                x={padLeft - 5}
                y={mapY(yVal) + 3}
                fill="#64748B"
                fontSize="7.5"
                textAnchor="end"
                fontFamily={fontFamily}
              >
                {getYLabel(yVal)}
              </text>
            ))}
          </g>

          {/* Axis Labels */}
          <text
            x={padLeft + plotWidth / 2}
            y={height - (legPos === 'bottom' ? 18 : 6)}
            fill="#475569"
            fontSize="8.5"
            textAnchor="middle"
            fontWeight={themeSettings?.titleFace === 'bold' ? 'bold' : 'normal'}
            fontStyle={themeSettings?.titleFace === 'italic' ? 'italic' : 'normal'}
            fontFamily={fontFamily}
          >
            {plotType === 'bars' ? 'Category' : 'Petal.Length'}
          </text>
          <text
            x={legPos === 'left' ? 14 : 11}
            y={padTop + plotHeight / 2}
            fill="#475569"
            fontSize="8.5"
            textAnchor="middle"
            transform={`rotate(-90 ${legPos === 'left' ? 14 : 11} ${padTop + plotHeight / 2})`}
            fontWeight={themeSettings?.titleFace === 'bold' ? 'bold' : 'normal'}
            fontStyle={themeSettings?.titleFace === 'italic' ? 'italic' : 'normal'}
            fontFamily={fontFamily}
          >
            {plotType === 'bars' ? 'Value' : 'Petal.Width'}
          </text>

          {/* Legend Area (Supports right, bottom, left, top, or none) */}
          {hasLegend && (
            <g
              transform={
                legPos === 'bottom'
                  ? `translate(${padLeft + 10}, ${height - 12})`
                  : legPos === 'top'
                  ? `translate(${padLeft + 10}, 10)`
                  : legPos === 'left'
                  ? `translate(6, ${padTop + 4})`
                  : `translate(${padLeft + plotWidth + 6}, ${padTop + 2})`
              }
            >
              {/* Optional legend box background */}
              {!themeSettings?.isLegendTransparent && (
                <rect
                  x="-3"
                  y="-3"
                  width={legPos === 'bottom' || legPos === 'top' ? plotWidth : 62}
                  height={legPos === 'bottom' || legPos === 'top' ? 16 : 80}
                  fill={themeSettings?.legendBackground || '#FFFFFF'}
                  stroke="#E2E8F0"
                  strokeWidth="0.5"
                  rx="2"
                />
              )}

              {activeTab === 'shapes' && shapes
                ? shapes.map((s, i) => {
                    const isHoriz = legPos === 'bottom' || legPos === 'top';
                    const xPos = isHoriz ? i * 42 : 0;
                    const yPos = isHoriz ? 4 : 6 + i * 15;
                    const pointColor = simulateCVD(s.color, cvdMode);
                    const fillCol = s.fill ? simulateCVD(s.fill, cvdMode) : pointColor;

                    return (
                      <g key={`leg-s-${i}`} transform={`translate(${xPos}, ${yPos})`}>
                        <ShapeIcon
                          pch={s.pch}
                          size={11}
                          color={pointColor}
                          fill={fillCol}
                          strokeWidth={1.2}
                        />
                        <text
                          x={14}
                          y={8}
                          fill="#475569"
                          fontSize="7.5"
                          fontFamily={fontFamily}
                        >
                          {showShapeLabels && s.label ? s.label : `Shape ${i + 1}`}
                        </text>
                      </g>
                    );
                  })
                : simulatedColors.slice(0, 8).map((col, i) => {
                    const isHoriz = legPos === 'bottom' || legPos === 'top';
                    const xPos = isHoriz ? i * 36 : 0;
                    const yPos = isHoriz ? 4 : 6 + i * 13;

                    return (
                      <g key={`leg-${i}`} transform={`translate(${xPos}, ${yPos})`}>
                        <rect
                          x={0}
                          y={0}
                          width={7.5}
                          height={7.5}
                          rx={1.5}
                          fill={col}
                          stroke="#CBD5E1"
                          strokeWidth={0.5}
                        />
                        <text
                          x={11}
                          y={6.5}
                          fill="#475569"
                          fontSize="7"
                          fontFamily={fontFamily}
                        >
                          {`g${i + 1}`}
                        </text>
                      </g>
                    );
                  })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
