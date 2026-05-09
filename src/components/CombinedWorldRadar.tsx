import React from 'react'

interface WorldEntry {
  data: Array<{ dimension: string; value: number }>
  label: string
  color: string
}

interface CombinedWorldRadarProps {
  worlds: [WorldEntry, WorldEntry, WorldEntry]
  dominantIndex?: number
  language?: 'ar' | 'en'
}

const CombinedWorldRadar: React.FC<CombinedWorldRadarProps> = ({ worlds, language = 'en' }) => {
  const size   = 1010
  const cx     = size / 2
  const cy     = size / 2
  const maxR   = 387
  const levels = 5
  const total  = 9  // 9 axes total (3 per world)

  const angleOf = (i: number) => (i * 360) / total - 90

  const toXY = (axisIndex: number, value: number) => {
    const a = (angleOf(axisIndex) * Math.PI) / 180
    const r = (value / 5) * maxR
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  }

  // Grid rings (9-axis polygons)
  const gridPoints = (level: number) =>
    Array.from({ length: total }, (_, i) => {
      const a = (angleOf(i) * Math.PI) / 180
      const r = ((level + 1) / levels) * maxR
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`
    }).join(' ')

  // Each world occupies 3 consecutive axes on the 9-axis radar
  // World 0 → axes 0,1,2 | World 1 → axes 3,4,5 | World 2 → axes 6,7,8
  const worldTriangles = worlds.map((w, wi) =>
    w.data.map((d, di) => toXY(wi * 3 + di, d.value))
  )

  // All 9 axis labels (combined from the 3 worlds in order)
  const allLabels = worlds.flatMap((w, wi) =>
    w.data.map((d, di) => {
      const axisIdx = wi * 3 + di
      const a       = (angleOf(axisIdx) * Math.PI) / 180
      const needsExtra = language === 'ar' && (d.dimension === 'التفاعل' || d.dimension === 'الناتج')
      const labelR    = maxR + (needsExtra ? 60 : 42)
      const x         = cx + Math.cos(a) * labelR
      const y         = cy + Math.sin(a) * labelR
      return {
        x, y,
        text: d.dimension,
        color: w.color,
        anchor: x > cx + 10 ? 'start' : x < cx - 10 ? 'end' : 'middle',
      }
    })
  )

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-lg aspect-square">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          <defs>
            {worlds.map((w, wi) => (
              <radialGradient key={wi} id={`cwf-g-${wi}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={w.color} stopOpacity="0.05" />
                <stop offset="60%"  stopColor={w.color} stopOpacity="0.20" />
                <stop offset="100%" stopColor={w.color} stopOpacity="0.45" />
              </radialGradient>
            ))}
          </defs>

          {/* Background circle */}
          <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="#9CA3AF" strokeWidth="1" />

          {/* Grid rings */}
          {Array.from({ length: levels }, (_, i) => (
            <polygon key={i} points={gridPoints(i)} fill="none" stroke="#9CA3AF" strokeWidth="0.5" opacity="0.5" />
          ))}

          {/* Axis lines */}
          {Array.from({ length: total }, (_, i) => {
            const a = (angleOf(i) * Math.PI) / 180
            return (
              <line key={i}
                x1={cx} y1={cy}
                x2={cx + Math.cos(a) * maxR}
                y2={cy + Math.sin(a) * maxR}
                stroke="#D1D5DB" strokeWidth="1.5"
              />
            )
          })}

          {/* Scale numbers */}
          {[1, 2, 3, 4, 5].map(lv => (
            <text key={lv}
              x={cx + 8} y={cy - (lv / 5) * maxR + 6}
              fontSize="33" fill="#9CA3AF" textAnchor="start">
              {lv}
            </text>
          ))}

          {/* 3 world triangles */}
          {worlds.map((w, wi) => {
            const pts = worldTriangles[wi].map(p => `${p.x},${p.y}`).join(' ')
            return (
              <g key={wi}>
                <polygon
                  points={pts}
                  fill={`url(#cwf-g-${wi})`}
                  stroke={w.color}
                  strokeWidth="3"
                  style={{ filter: `drop-shadow(0 0 4px ${w.color}66)` }}
                />
                {/* Data points */}
                {worldTriangles[wi].map((p, pi) => (
                  <circle key={pi}
                    cx={p.x} cy={p.y} r="14"
                    fill={w.color} stroke="#ffffff" strokeWidth="3"
                  />
                ))}
              </g>
            )
          })}

          {/* Axis labels — each colored by its world */}
          {allLabels.map((lbl, i) => (
            <text key={i}
              x={lbl.x} y={lbl.y}
              fontSize="37" fill={lbl.color}
              textAnchor={lbl.anchor}
              dominantBaseline="middle"
              fontWeight="700"
            >
              {lbl.text}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3 flex-wrap"
        dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {worlds.map((w, wi) => (
          <div key={wi} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: w.color }} />
            <span className="text-sm font-semibold" style={{ color: w.color }}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CombinedWorldRadar
