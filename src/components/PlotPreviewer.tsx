import React, { useState, useEffect, useMemo } from 'react';
import { CVDMode, ShapeAssignment } from '../types/palette';
import { simulateCVD } from '../utils/cvd';
import { ShapeIcon } from './ShapeIcon';

interface PlotPreviewerProps {
  colors: string[];
  cvdMode: CVDMode;
  shapes?: ShapeAssignment[];
  activeTab: string;
}

export const PlotPreviewer: React.FC<PlotPreviewerProps> = ({
  colors,
  cvdMode,
  shapes,
  activeTab,
}) => {
  const [plotType, setPlotType] = useState<'bars' | 'scatter'>('bars');

  // Automatically switch to scatter plot when viewing shapes, because bar plots cannot show point shapes
  useEffect(() => {
    if (activeTab === 'shapes') {
      setPlotType('scatter');
    }
  }, [activeTab]);

  const safeColors = colors.length > 0 ? colors : ['#3B82F6'];
  const simulatedColors = safeColors.map(c => simulateCVD(c, cvdMode));

  // Canvas dimensions
  const width = 380;
  const height = 180;
  const padLeft = 32;
  const padRight = (shapes && shapes.length > 0) || simulatedColors.length > 6 ? 84 : 64;
  const padTop = 14;
  const padBottom = 24;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const minX = 1.0;
  const maxX = 7.0;
  const minY = 0.0;
  const maxY = 2.8;

  const mapX = (val: number) => padLeft + ((val - minX) / (maxX - minX)) * plotWidth;
  const mapY = (val: number) => padTop + plotHeight - ((val - minY) / (maxY - minY)) * plotHeight;

  // Generate deterministic, realistic scatter points for every single group
  const groupCount = activeTab === 'shapes' && shapes && shapes.length > 0
    ? shapes.length
    : safeColors.length;

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

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-xs">
        <span className="font-medium text-slate-700">
          Live Plot Preview {activeTab === 'shapes' ? '(Scatter with shapes)' : `(${safeColors.length} colors)`}
        </span>

        <div className="flex bg-slate-100 rounded p-0.5 text-[10px]">
          {activeTab !== 'shapes' && (
            <button
              onClick={() => setPlotType('bars')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                plotType === 'bars' ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'text-slate-500'
              }`}
            >
              Bars
            </button>
          )}
          <button
            onClick={() => setPlotType('scatter')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              plotType === 'scatter' ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'text-slate-500'
            }`}
          >
            Scatter
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full flex justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-full rounded select-none bg-white"
          style={{ height: 'auto', maxHeight: '185px' }}
        >
          {/* Subtle Gridlines (ggplot2 theme_minimal light) */}
          <g>
            {[2, 3, 4, 5, 6].map(xVal => (
              <line
                key={`gx-${xVal}`}
                x1={mapX(xVal)}
                y1={padTop}
                x2={mapX(xVal)}
                y2={padTop + plotHeight}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            ))}
            {[0.5, 1.0, 1.5, 2.0, 2.5].map(yVal => (
              <line
                key={`gy-${yVal}`}
                x1={padLeft}
                y1={mapY(yVal)}
                x2={padLeft + plotWidth}
                y2={mapY(yVal)}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Axes */}
          <line
            x1={padLeft}
            y1={padTop + plotHeight}
            x2={padLeft + plotWidth}
            y2={padTop + plotHeight}
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + plotHeight}
            stroke="#CBD5E1"
            strokeWidth="1"
          />

          {/* Axis Labels */}
          <text
            x={padLeft + plotWidth / 2}
            y={height - 6}
            fill="#64748B"
            fontSize="8.5"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            {plotType === 'bars' ? 'Category' : 'Petal.Length'}
          </text>
          <text
            x={11}
            y={padTop + plotHeight / 2}
            fill="#64748B"
            fontSize="8.5"
            textAnchor="middle"
            transform={`rotate(-90 11 ${padTop + plotHeight / 2})`}
            fontFamily="system-ui, sans-serif"
          >
            {plotType === 'bars' ? 'Value' : 'Petal.Width'}
          </text>

          {/* Scatter Plot: Renders shapes (pch) when on shapes tab or when assigned */}
          {plotType === 'scatter' && (
            <g>
              {scatterPoints.map((pt, idx) => {
                const groupIdx = pt.group;
                const shapeAssigned = shapes && shapes[groupIdx];
                const pch = shapeAssigned ? shapeAssigned.pch : 16;
                const rawColor = shapeAssigned ? shapeAssigned.color : safeColors[groupIdx % safeColors.length];
                const pointColor = simulateCVD(rawColor, cvdMode);
                const fillCol = shapeAssigned?.fill ? simulateCVD(shapeAssigned.fill, cvdMode) : pointColor;

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

          {/* Bar Chart: Only for non-shapes tabs */}
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
                const ratios = [0.45, 0.85, 0.65, 0.95, 0.55, 0.75, 0.4, 0.9, 0.6, 0.8, 0.5, 0.7];
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

          {/* Legend: Displays shapes and colors */}
          <g transform={`translate(${padLeft + plotWidth + 6}, ${padTop + 2})`}>
            {activeTab === 'shapes' && shapes
              ? shapes.map((s, i) => {
                  const yPos = 6 + i * 15;
                  const pointColor = simulateCVD(s.color, cvdMode);
                  const fillCol = s.fill ? simulateCVD(s.fill, cvdMode) : pointColor;

                  return (
                    <g key={`leg-s-${i}`} transform={`translate(0, ${yPos})`}>
                      <ShapeIcon
                        pch={s.pch}
                        size={11}
                        color={pointColor}
                        fill={fillCol}
                        strokeWidth={1.2}
                      />
                      <text
                        x={15}
                        y={8}
                        fill="#475569"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {s.label || `pch ${s.pch}`}
                      </text>
                    </g>
                  );
                })
              : simulatedColors.map((col, i) => {
                  const maxRows = 10;
                  const colIdx = Math.floor(i / maxRows);
                  const rowIdx = i % maxRows;
                  const xPos = colIdx * 38;
                  const yPos = 6 + rowIdx * 13;

                  return (
                    <g key={`leg-${i}`} transform={`translate(${xPos}, ${yPos})`}>
                      <rect
                        x={0}
                        y={0}
                        width={8}
                        height={8}
                        rx={1.5}
                        fill={col}
                        stroke="#CBD5E1"
                        strokeWidth={0.5}
                      />
                      <text
                        x={12}
                        y={7}
                        fill="#475569"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        {`g${i + 1}`}
                      </text>
                    </g>
                  );
                })}
          </g>
        </svg>
      </div>
    </div>
  );
};
