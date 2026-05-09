import React, { useState } from 'react'

interface WorldRadarChartProps {
  title: string
  color: string
  data: Array<{ dimension: string; value: number }>
  language?: 'ar' | 'en'
}

const WorldRadarChart: React.FC<WorldRadarChartProps> = ({ title, color, data, language = 'en' }) => {
  const size = 600
  const center = size / 2
  const maxRadius = 220
  const levels = 5
  const n = data.length || 3

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null)

  const points = data.map((item, index) => {
    const angle = (index * 360) / n - 90
    const value = item.value
    const radius = (value / 5) * maxRadius
    const x = center + Math.cos((angle * Math.PI) / 180) * radius
    const y = center + Math.sin((angle * Math.PI) / 180) * radius
    return { x, y, value, label: item.dimension, angle }
  })

  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius
    return data.map((_, index) => {
      const angle = (index * 360) / n - 90
      const x = center + Math.cos((angle * Math.PI) / 180) * r
      const y = center + Math.sin((angle * Math.PI) / 180) * r
      return `${x},${y}`
    }).join(' ')
  })

  const axisLines = data.map((_, index) => {
    const angle = (index * 360) / n - 90
    return {
      x2: center + Math.cos((angle * Math.PI) / 180) * maxRadius,
      y2: center + Math.sin((angle * Math.PI) / 180) * maxRadius,
    }
  })

  const labelRadius = maxRadius + 55
  const labels = data.map((item, index) => {
    const angle = (index * 360) / n - 90
    const x = center + Math.cos((angle * Math.PI) / 180) * labelRadius
    const y = center + Math.sin((angle * Math.PI) / 180) * labelRadius
    return {
      x, y,
      text: item.dimension,
      anchor: x > center + 10 ? 'start' : x < center - 10 ? 'end' : 'middle',
    }
  })

  const dataPath = points.map(p => `${p.x},${p.y}`).join(' ')
  const gradId = `wgrad-${title.replace(/[\s/]/g, '')}`

  return (
    <div className="flex flex-col items-center p-2">
      <div className="relative w-full aspect-square" style={{ maxWidth: 260 }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          <defs>
            <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={color} stopOpacity="0.05" />
              <stop offset="60%"  stopColor={color} stopOpacity="0.20" />
              <stop offset="100%" stopColor={color} stopOpacity="0.45" />
            </radialGradient>
          </defs>

          <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="#9CA3AF" strokeWidth="1" />

          {gridLines.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="#9CA3AF" strokeWidth="0.5" opacity="0.5" />
          ))}

          {axisLines.map((line, i) => (
            <line key={i} x1={center} y1={center} x2={line.x2} y2={line.y2} stroke="#D1D5DB" strokeWidth="1.5" />
          ))}

          {[1, 2, 3, 4, 5].map(level => (
            <text key={level} x={center + 6} y={center - (level / 5) * maxRadius + 8} fontSize="22" fill="#9CA3AF" textAnchor="start">
              {level}
            </text>
          ))}

          <polygon points={dataPath} fill={`url(#${gradId})`} stroke={color} strokeWidth="3" />

          {points.map((p, i) => (
            <circle
              key={i} cx={p.x} cy={p.y} r="8"
              fill={color} stroke="#fff" strokeWidth="3"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, value: p.value, label: p.label })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {labels.map((lbl, i) => (
            <text key={i} x={lbl.x} y={lbl.y} fontSize="28" fill="#fff" textAnchor={lbl.anchor} dominantBaseline="middle" fontWeight="600">
              {lbl.text}
            </text>
          ))}

          {hoveredPoint && (
            <g>
              <rect x={hoveredPoint.x - 40} y={hoveredPoint.y - 45} width="80" height="34" fill="#1f2937" stroke="#374151" strokeWidth="1" rx="6" />
              <text x={hoveredPoint.x} y={hoveredPoint.y - 23} fontSize="26" fill="#fff" textAnchor="middle" dominantBaseline="middle">
                {hoveredPoint.value.toFixed(1)}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-white text-sm font-semibold">{title}</span>
        </div>
      </div>
    </div>
  )
}

export default WorldRadarChart
