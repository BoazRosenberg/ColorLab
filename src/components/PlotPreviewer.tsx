import React, { useState } from 'react';
import { CVDMode, ShapeAssignment } from '../types/palette';
import { simulateCVD } from '../utils/cvd';
import { ShapeIcon } from './ShapeIcon';

interface PlotPreviewerProps {
  colors: string[];
  cvdMode: CVDMode;
  shapes?: ShapeAssignment[];
  activeTab: string;
}

const SCATTER_POINTS = [
  // Group 0
  { x: 1.4, y: 0.2, group: 0 },
  { x: 1.5, y: 0.3, group: 0 },
  { x: 1.3, y: 0.2, group: 0 },
  { x: 1.7, y: 0.4, group: 0 },
  { x: 1.9, y: 0.4, group: 0 },
  { x: 1.4, y: 0.3, group: 0 },
  // Group 1
  { x: 3.5, y: 1.0, group: 1 },
  { x: 4.0, y: 1.3, group: 1 },
  { x: 4.5, y: 1.5, group: 1 },
  { x: 3.9, y: 1.1, group: 1 },
  { x: 4.2, y: 1.3, group: 1 },
  { x: 3.6, y: 1.0, group: 1 },
  // Group 2
  { x: 5.1, y: 1.9, group: 2 },
  { x: 5.6, y: 2.1, group: 2 },
  { x: 5.9, y: 2.3, group: 2 },
  { x: 5.1, y: 1.8, group: 2 },
  { x: 6.0, y: 2.5, group: 2 },
  { x: 5.5, y: 2.1, group: 2 },
  // Group 3
  { x: 2.6, y: 0.8, group: 3 },
  { x: 2.9, y: 0.9, group: 3 },
  { x: 3.1, y: 0.7, group: 3 },
  // Group 4
  { x: 4.8, y: 2.4, group: 4 },
  { x: 4.6, y: 2.2, group: 4 },
  // Group 5
  { x: 6.2, y: 1.6, group: 5 },
  { x: 6.5, y: 1.8, group: 5 },
];

export const PlotPreviewer: React.FC<PlotPreviewerProps> = ({
  colors,
  cvdMode,
  shapes,
  activeTab,
}) => {
  const [plotType, setPlotType] = useState<'scatter' | 'bars'>('scatter');

  const safeColors = colors.length > 0 ? colors : ['#3B82F6'];
  const simulatedColors = safeColors.map(c => simulateCVD(c, cvdMode));

  // Clean white canvas dimensions
  const width = 380;
  const height = 180;
  const padLeft = 32;
  const padRight = 72;
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

  const activeGroupCount = Math.max(1, safeColors.length);
  const visiblePoints = SCATTER_POINTS.filter(p => p.group < activeGroupCount);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
      {/* Minimal Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-xs">
        <span className="font-medium text-slate-700">Preview</span>

        <div className="flex bg-slate-100 rounded p-0.5 text-[10px]">
          <button
            onClick={() => setPlotType('scatter')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              plotType === 'scatter' ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'text-slate-500'
            }`}
          >
            Scatter
          </button>
          <button
            onClick={() => setPlotType('bars')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              plotType === 'bars' ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'text-slate-500'
            }`}
          >
            Bars
          </button>
        </div>
      </div>

      {/* SVG Canvas Area (Clean White) */}
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

          {/* Minimal Axis lines */}
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
            Petal.Length
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
            Petal.Width
          </text>

          {/* Scatter Plot */}
          {plotType === 'scatter' && (
            <g>
              {visiblePoints.map((pt, idx) => {
                const colorIdx = pt.group % simulatedColors.length;
                const pointColor = simulatedColors[colorIdx];

                const shapeAssigned = shapes && shapes[colorIdx];
                const pch = shapeAssigned ? shapeAssigned.pch : 16;
                const fillCol = shapeAssigned?.fill ? simulateCVD(shapeAssigned.fill, cvdMode) : pointColor;

                const cx = mapX(pt.x);
                const cy = mapY(pt.y);

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
              })}
            </g>
          )}

          {/* Bar Chart */}
          {plotType === 'bars' && (
            <g>
              {simulatedColors.map((col, idx) => {
                const barCount = simulatedColors.length;
                const availableW = plotWidth - 12;
                const barW = Math.max(8, Math.min(32, availableW / barCount - 4));
                const totalBarSpan = barCount * (barW + 4);
                const startOffset = padLeft + (plotWidth - totalBarSpan) / 2;

                const barX = startOffset + idx * (barW + 4);
                const ratios = [0.45, 0.85, 0.65, 0.95, 0.55, 0.75, 0.4, 0.9];
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

          {/* Minimal Legend */}
          <g transform={`translate(${padLeft + plotWidth + 6}, ${padTop + 4})`}>
            {simulatedColors.slice(0, 6).map((col, i) => {
              const pch = shapes && shapes[i] ? shapes[i].pch : 16;
              const fillCol = shapes && shapes[i]?.fill ? simulateCVD(shapes[i].fill!, cvdMode) : col;
              const yPos = 8 + i * 15;

              return (
                <g key={`leg-${i}`} transform={`translate(0, ${yPos})`}>
                  <ShapeIcon
                    pch={pch}
                    size={10}
                    color={col}
                    fill={fillCol}
                    strokeWidth={1.2}
                  />
                  <text
                    x={14}
                    y={8}
                    fill="#475569"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {shapes && shapes[i]?.label ? shapes[i].label.slice(0, 6) : `g${i + 1}`}
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
