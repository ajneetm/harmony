import React, { useState } from 'react';

interface RadarChartProps {
  title: string;
  color: string;
  data: Array<{ dimension: string; value: number }>;
  language?: 'ar' | 'en';
}

const RadarChart: React.FC<RadarChartProps> = ({ title, color, data, language = 'en' }) => {
  const size = 1010;
  const center = size / 2;
  const maxRadius = 387;
  const levels = 5; // 5 levels for scale 1-5
  
  // State for hover functionality
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; dimension: string } | null>(null);
  
  // Ensure we have all 9 dimensions in correct order
  const dimensions = [
    'Perception',
    'Readiness', 
    'Intention',
    'Action',
    'Interaction',
    'Response',
    'Reception',
    'Evolution',
    'Mental Image'
  ];

  const dimensionLabels = language === 'ar' ? {
    'Perception': 'الإدراك',
    'Readiness': 'الجاهزية',
    'Intention': 'النية',
    'Action': 'الفعل',
    'Interaction': 'التفاعل',
    'Response': 'الاستجابة',
    'Reception': 'الاستقبال',
    'Evolution': 'التطور',
    'Mental Image': 'التشكيل'
  } : {
    'Perception': 'Perception',
    'Readiness': 'Readiness',
    'Intention': 'Intention',
    'Action': 'Action',
    'Interaction': 'Interaction',
    'Response': 'Response',
    'Reception': 'Reception',
    'Evolution': 'Evolution',
    'Mental Image': 'Mental Image'
  };

  // Create a map for quick lookup
  const dataMap = data.reduce((acc, item) => {
    acc[item.dimension] = item.value;
    return acc;
  }, {} as Record<string, number>);

  // Calculate points for each dimension
  const points = dimensions.map((dimension, index) => {
    const angle = (index * 360) / dimensions.length - 90; // Start from top
    const value = dataMap[dimension] || 0;
    const radius = (value / 5) * maxRadius; // Scale 1-5 to radius
    
    const x = center + Math.cos((angle * Math.PI) / 180) * radius;
    const y = center + Math.sin((angle * Math.PI) / 180) * radius;
    
    return { x, y, value, dimension, angle };
  });

  // Create grid lines (concentric polygons)
  const gridLines = [];
  for (let level = 1; level <= levels; level++) {
    const radius = (level / levels) * maxRadius;
    const gridPoints = dimensions.map((_, index) => {
      const angle = (index * 360) / dimensions.length - 90;
      const x = center + Math.cos((angle * Math.PI) / 180) * radius;
      const y = center + Math.sin((angle * Math.PI) / 180) * radius;
      return `${x},${y}`;
    });
    gridLines.push(gridPoints.join(' '));
  }

  // Create axis lines
  const axisLines = dimensions.map((_, index) => {
    const angle = (index * 360) / dimensions.length - 90;
    const x = center + Math.cos((angle * Math.PI) / 180) * maxRadius;
    const y = center + Math.sin((angle * Math.PI) / 180) * maxRadius;
    return { x1: center, y1: center, x2: x, y2: y };
  });

  // Create labels
  const labels = dimensions.map((dimension, index) => {
    const angle = (index * 360) / dimensions.length - 90;
    // Increase spacing only for specific Arabic labels that are too close together
    const needsExtraSpacing = language === 'ar' && (dimension === 'Interaction' || dimension === 'Response');
    const labelRadius = maxRadius + (needsExtraSpacing ? 60 : 40);
    const x = center + Math.cos((angle * Math.PI) / 180) * labelRadius;
    const y = center + Math.sin((angle * Math.PI) / 180) * labelRadius;
    
    return {
      x,
      y,
      text: dimensionLabels[dimension],
      dimension,
      textAnchor: x > center ? 'start' : x < center ? 'end' : 'middle'
    };
  });

  // Create data polygon path
  const dataPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-full max-w-lg aspect-square">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          style={{ maxWidth: '1010px' }}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1"
          />

          {/* Grid lines */}
          {gridLines.map((points, index) => (
            <polygon
              key={`grid-${index}`}
              points={points}
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {/* Axis lines */}
          {axisLines.map((line, index) => (
            <line
              key={`axis-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#D1D5DB"
              strokeWidth="1.5"
            />
          ))}

          {/* Scale labels */}
          {[1, 2, 3, 4, 5].map((level) => (
            <text
              key={`scale-${level}`}
              x={center + 8}
              y={center - (level / 5) * maxRadius + 6}
              fontSize="33"
              fill="#9CA3AF"
              textAnchor="start"
              className="font-medium"
            >
              {level}
            </text>
          ))}

          {/* Data area */}
          <polygon
            points={dataPath}
            fill={color}
            fillOpacity="0.2"
            stroke={color}
            strokeWidth="3"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="6"
              fill={color}
              stroke="#ffffff"
              strokeWidth="3"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint({
                x: point.x,
                y: point.y,
                value: point.value,
                dimension: dimensionLabels[point.dimension]
              })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Labels */}
          {labels.map((label, index) => (
            <text
              key={`label-${index}`}
              x={label.x}
              y={label.y}
              fontSize="37"
              fill="#ffffff"
              textAnchor={label.textAnchor}
              dominantBaseline="middle"
              className="font-semibold"
            >
              {label.text}
            </text>
          ))}

          {/* Tooltip */}
          {hoveredPoint && (
            <g>
              <rect
                x={hoveredPoint.x - 35}
                y={hoveredPoint.y - 40}
                width="70"
                height="30"
                fill="#1f2937"
                stroke="#374151"
                strokeWidth="1"
                rx="6"
              />
              <text
                x={hoveredPoint.x}
                y={hoveredPoint.y - 20}
                fontSize="30"
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-semibold"
              >
                {hoveredPoint.value.toFixed(1)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div
            className="w-5 h-5 rounded flex-shrink-0 self-center"
            style={{ backgroundColor: color }}
          />
          <span className="text-white text-lg font-semibold leading-none">{title}</span>
        </div>

      </div>
    </div>
  );
};

export default RadarChart; 
