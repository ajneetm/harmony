import React from 'react'

interface CircularChartProps {
  title: string
  values: number[] // Array of 9 values (one for each subdimension)
  labels: string[] // Array of 9 labels for each subdimension
  radius?: number
  strokeWidth?: number
  language?: 'ar' | 'en'
}

export const CircularChart: React.FC<CircularChartProps> = ({
  title,
  values,
  labels,
  radius = 80,
  strokeWidth = 20,
  language = 'en'
}) => {
  const centerX = 120
  const centerY = 120
  const totalSize = 240
  
  // Color gradient function from red (low) to green (high)
  const getScoreColor = (score: number): string => {
    if (score <= 2) return '#ae1f23' // red
    if (score <= 3) return '#f59e0b' // orange
    if (score <= 4) return '#eab308' // yellow
    return '#22c55e' // green
  }
  
  // Create 9 equal segments (40 degrees each)
  const segmentAngle = 360 / 9
  const segments = values.map((value, index) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180) // Start from top
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180)
    
    const x1 = centerX + (radius - strokeWidth/2) * Math.cos(startAngle)
    const y1 = centerY + (radius - strokeWidth/2) * Math.sin(startAngle)
    const x2 = centerX + (radius - strokeWidth/2) * Math.cos(endAngle)
    const y2 = centerY + (radius - strokeWidth/2) * Math.sin(endAngle)
    
    const largeArcFlag = segmentAngle > 180 ? 1 : 0
    
    return {
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius - strokeWidth/2} ${radius - strokeWidth/2} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: getScoreColor(value),
      value: value,
      label: labels[index]
    }
  })
  
  return (
    <div className="flex flex-col items-center bg-gray-900 rounded-lg p-4 border border-gray-800">
      <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
      <div className="relative">
        <svg width={totalSize} height={totalSize} className="transform rotate-0">
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius - strokeWidth/2}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
          />
          
          {/* Colored segments */}
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.8"
              className="transition-opacity duration-200 hover:opacity-100"
            />
          ))}
          
          {/* Center circle with average score */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius - strokeWidth - 10}
            fill="#111827"
            stroke="#374151"
            strokeWidth="2"
          />
          
          {/* Average score text */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="text-sm font-medium fill-white"
          >
            {language === 'ar' ? 'المتوسط' : 'Average'}
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="text-lg font-bold fill-white"
          >
            {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}
          </text>
        </svg>
        
        {/* Labels around the circle */}
        <div className="absolute inset-0">
          {labels.map((label, index) => {
            const angle = (index * segmentAngle - 90) * (Math.PI / 180)
            const labelRadius = radius + 25
            const x = centerX + labelRadius * Math.cos(angle)
            const y = centerY + labelRadius * Math.sin(angle)
            
            return (
              <div
                key={index}
                className="absolute text-xs text-gray-300 font-medium"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  width: '60px',
                  textAlign: 'center'
                }}
              >
                {label}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center space-x-4 text-xs text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span>1-2</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
          <span>2-3</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
          <span>3-4</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>4-5</span>
        </div>
      </div>
    </div>
  )
}

export default CircularChart 