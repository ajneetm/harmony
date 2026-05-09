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
  const size   = 700
  const cx     = size / 2
  const cy     = size / 2
  const maxR   = 250
  const levels = 5
  const n      = 3
  const labelR = maxR + 62

  const angleOf = (i: number) => (i * 360) / n - 90

  const toXY = (i: number, value: number) => {
    const a = (angleOf(i) * Math.PI) / 180
    const r = (value / 5) * maxR
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  }

  const gridPoints = (level: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (angleOf(i) * Math.PI) / 180
      const r = ((level + 1) / levels) * maxR
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`
    }).join(' ')

  const polyPoints = (world: WorldEntry) =>
    world.data.map((d, i) => {
      const p = toXY(i, d.value)
      return `${p.x},${p.y}`
    }).join(' ')

  const axisLabels = worlds[0].data.map((_, i) => {
    const a = (angleOf(i) * Math.PI) / 180
    const x = cx + Math.cos(a) * labelR
    const y = cy + Math.sin(a) * labelR
    return {
      x, y,
      anchor: x > cx + 10 ? 'start' : x < cx - 10 ? 'end' : 'middle',
    }
  })

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full" style={{ maxWidth: 380 }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">

          {/* Grid rings */}
          {Array.from({ length: levels }, (_, i) => (
            <polygon key={i} points={gridPoints(i)} fill="none" stroke="#374151" strokeWidth="0.8" opacity="0.6" />
          ))}

          {/* Axes */}
          {Array.from({ length: n }, (_, i) => {
            const a = (angleOf(i) * Math.PI) / 180
            return (
              <line key={i}
                x1={cx} y1={cy}
                x2={cx + Math.cos(a) * maxR}
                y2={cy + Math.sin(a) * maxR}
                stroke="#4B5563" strokeWidth="1.2"
              />
            )
          })}

          {/* Scale numbers */}
          {[1, 2, 3, 4, 5].map(lv => (
            <text key={lv} x={cx + 6} y={cy - (lv / 5) * maxR + 8}
              fontSize="22" fill="#6B7280" textAnchor="start">{lv}</text>
          ))}

          {/* 3 world triangles — outline only, no fill */}
          {worlds.map((w, wi) => (
            <g key={wi}>
              <polygon
                points={polyPoints(w)}
                fill="none"
                stroke={w.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {w.data.map((d, i) => {
                const p = toXY(i, d.value)
                return (
                  <circle key={i}
                    cx={p.x} cy={p.y} r="7"
                    fill={w.color} stroke="#111" strokeWidth="2"
                  />
                )
              })}
            </g>
          ))}

          {/* Axis labels — show all 3 worlds' labels stacked */}
          {axisLabels.map((lbl, i) => (
            <text key={i}
              x={lbl.x} y={lbl.y}
              textAnchor={lbl.anchor}
              dominantBaseline="middle"
            >
              {worlds.map((w, wi) => (
                <tspan key={wi}
                  x={lbl.x}
                  dy={wi === 0 ? 0 : '1.2em'}
                  fontSize="22"
                  fill={w.color}
                  fontWeight="600"
                >
                  {w.data[i]?.dimension}
                </tspan>
              ))}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-2 flex-wrap"
        dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {worlds.map((w, wi) => (
          <div key={wi} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: w.color }} />
            <span className="text-xs font-semibold" style={{ color: w.color }}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CombinedWorldRadar
