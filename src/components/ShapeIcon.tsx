import React from 'react';

interface ShapeIconProps {
  pch: number;
  size?: number;
  color?: string; // mapped to stroke or fill
  fill?: string;  // used for pch 21-25
  strokeWidth?: number;
  className?: string;
}

export const ShapeIcon: React.FC<ShapeIconProps> = ({
  pch,
  size = 20,
  color = '#1E293B',
  fill = '#3B82F6',
  strokeWidth = 2,
  className = '',
}) => {
  const center = size / 2;
  const radius = size * 0.38;
  const pad = size * 0.15;
  const extent = size - pad * 2;

  // Render SVG based on R pch
  const renderShape = () => {
    switch (pch) {
      case 0: // Square open
        return (
          <rect
            x={pad}
            y={pad}
            width={extent}
            height={extent}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 1: // Circle open
        return (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 2: // Triangle up open
        return (
          <polygon
            points={`${center},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 3: // Plus (+)
        return (
          <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
            <line x1={center} y1={pad} x2={center} y2={size - pad} />
            <line x1={pad} y1={center} x2={size - pad} y2={center} />
          </g>
        );
      case 4: // Cross (x)
        return (
          <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
            <line x1={pad} y1={pad} x2={size - pad} y2={size - pad} />
            <line x1={size - pad} y1={pad} x2={pad} y2={size - pad} />
          </g>
        );
      case 5: // Diamond open
        return (
          <polygon
            points={`${center},${pad} ${size - pad},${center} ${center},${size - pad} ${pad},${center}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 6: // Triangle down open
        return (
          <polygon
            points={`${center},${size - pad} ${size - pad},${pad} ${pad},${pad}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 7: // Square & Cross
        return (
          <g stroke={color} strokeWidth={strokeWidth}>
            <rect x={pad} y={pad} width={extent} height={extent} fill="none" />
            <line x1={pad} y1={pad} x2={size - pad} y2={size - pad} />
            <line x1={size - pad} y1={pad} x2={pad} y2={size - pad} />
          </g>
        );
      case 8: // Star / Asterisk
        return (
          <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
            <line x1={center} y1={pad} x2={center} y2={size - pad} />
            <line x1={pad} y1={center} x2={size - pad} y2={center} />
            <line x1={pad + 2} y1={pad + 2} x2={size - pad - 2} y2={size - pad - 2} />
            <line x1={size - pad - 2} y1={pad + 2} x2={pad + 2} y2={size - pad - 2} />
          </g>
        );
      case 9: // Diamond & Plus
        return (
          <g stroke={color} strokeWidth={strokeWidth}>
            <polygon
              points={`${center},${pad} ${size - pad},${center} ${center},${size - pad} ${pad},${center}`}
              fill="none"
            />
            <line x1={center} y1={pad} x2={center} y2={size - pad} strokeLinecap="round" />
            <line x1={pad} y1={center} x2={size - pad} y2={center} strokeLinecap="round" />
          </g>
        );
      case 10: // Circle & Plus
        return (
          <g stroke={color} strokeWidth={strokeWidth}>
            <circle cx={center} cy={center} r={radius} fill="none" />
            <line x1={center} y1={pad} x2={center} y2={size - pad} strokeLinecap="round" />
            <line x1={pad} y1={center} x2={size - pad} y2={center} strokeLinecap="round" />
          </g>
        );
      case 11: // Triangles up & down
        return (
          <g stroke={color} strokeWidth={strokeWidth} fill="none">
            <polygon points={`${center},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`} />
            <polygon points={`${center},${size - pad} ${size - pad},${pad} ${pad},${pad}`} />
          </g>
        );
      case 12: // Square & Plus
        return (
          <g stroke={color} strokeWidth={strokeWidth}>
            <rect x={pad} y={pad} width={extent} height={extent} fill="none" />
            <line x1={center} y1={pad} x2={center} y2={size - pad} strokeLinecap="round" />
            <line x1={pad} y1={center} x2={size - pad} y2={center} strokeLinecap="round" />
          </g>
        );
      case 13: // Circle & Cross
        return (
          <g stroke={color} strokeWidth={strokeWidth}>
            <circle cx={center} cy={center} r={radius} fill="none" />
            <line x1={pad + 2} y1={pad + 2} x2={size - pad - 2} y2={size - pad - 2} strokeLinecap="round" />
            <line x1={size - pad - 2} y1={pad + 2} x2={pad + 2} y2={size - pad - 2} strokeLinecap="round" />
          </g>
        );
      case 14: // Square & Triangle
        return (
          <g stroke={color} strokeWidth={strokeWidth} fill="none">
            <rect x={pad} y={pad} width={extent} height={extent} />
            <polygon points={`${center},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`} />
          </g>
        );
      case 15: // Solid Square
        return <rect x={pad} y={pad} width={extent} height={extent} fill={color} />;
      case 16: // Solid Circle
        return <circle cx={center} cy={center} r={radius} fill={color} />;
      case 17: // Solid Triangle Up
        return (
          <polygon
            points={`${center},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`}
            fill={color}
          />
        );
      case 18: // Solid Diamond
        return (
          <polygon
            points={`${center},${pad} ${size - pad},${center} ${center},${size - pad} ${pad},${center}`}
            fill={color}
          />
        );
      case 19: // Solid Circle Large
        return (
          <circle
            cx={center}
            cy={center}
            r={radius + 1}
            fill={color}
            stroke={color}
            strokeWidth={1}
          />
        );
      case 20: // Small Solid Circle (bullet)
        return <circle cx={center} cy={center} r={radius * 0.65} fill={color} />;

      // 21-25: Fillable shapes with distinct border (color) and interior (fill)
      case 21: // Circle with border and fill
        return (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={fill}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 22: // Square with border and fill
        return (
          <rect
            x={pad}
            y={pad}
            width={extent}
            height={extent}
            fill={fill}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 23: // Diamond with border and fill
        return (
          <polygon
            points={`${center},${pad} ${size - pad},${center} ${center},${size - pad} ${pad},${center}`}
            fill={fill}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 24: // Triangle Up with border and fill
        return (
          <polygon
            points={`${center},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`}
            fill={fill}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      case 25: // Triangle Down with border and fill
        return (
          <polygon
            points={`${center},${size - pad} ${size - pad},${pad} ${pad},${pad}`}
            fill={fill}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        );
      default:
        return <circle cx={center} cy={center} r={radius} fill={color} />;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`inline-block shrink-0 select-none ${className}`}
    >
      {renderShape()}
    </svg>
  );
};
