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

const CombinedWorldRadar: React.FC<CombinedWorldRadarProps> = ({
  worlds,
  dominantIndex = 0,
}) => {
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

  const axisLabels = worlds[dominantIndex].data.map((d, i) => {
    const a = (angleOf(i) * Math.PI) / 180
    const x = cx + Math.cos(a) * labelR
    const y = cy + Math.sin(a) * labelR
    return {
      x, y,
      text: d.dimension,
      anchor: x > cx + 10 ? 'start' : x < cx - 10 ? 'end' : 'middle',
    }
  })

  // draw order: others first, dominant on top
  const drawOrder = [0, 1, 2].filter(i => i !== dominantIndex).concat(dominantIndex)

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full" style={{ maxWidth: 380 }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
          <defs>
            {worlds.map((w, wi) => (
              <radialGradient key={wi} id={`cwr-g-${wi}-${dominantIndex}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={w.color} stopOpacity="0.02" />
                <stop offset="60%"  stopColor={w.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={w.color} stopOpacity="0.38" />
              </radialGradient>
            ))}
          </defs>

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

          {/* All 3 polygons */}
          {drawOrder.map(wi => {
            const w       = worlds[wi]
            const isDom   = wi === dominantIndex
            const gradId  = `cwr-g-${wi}-${dominantIndex}`
            return (
              <g key={wi}>
                <polygon
                  points={polyPoints(w)}
                  fill={`url(#${gradId})`}
                  stroke={w.color}
                  strokeWidth={isDom ? 3.5 : 1.5}
                  opacity={1}
                  strokeDasharray={isDom ? undefined : '5 4'}
                  style={isDom ? { filter: `drop-shadow(0 0 6px ${w.color}80)` } : undefined}
                />
                {/* Data points */}
                {w.data.map((d, i) => {
                  const p = toXY(i, d.value)
                  return (
                    <circle key={i}
                      cx={p.x} cy={p.y}
                      r={isDom ? 9 : 5}
                      fill={w.color}
                      stroke="#fff"
                      strokeWidth={isDom ? 2.5 : 1.5}
                      opacity={1}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* Axis labels */}
          {axisLabels.map((lbl, i) => (
            <text key={i}
              x={lbl.x} y={lbl.y}
              fontSize="30" fill="#fff"
              textAnchor={lbl.anchor}
              dominantBaseline="middle"
              fontWeight="600"
            >
              {lbl.text}
            </text>
          ))}
        </svg>
      </div>

      {/* Static label */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <span className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: worlds[dominantIndex].color }} />
        <span className="text-sm font-semibold text-white">
          {worlds[dominantIndex].label}
        </span>
      </div>
    </div>
  )
}

export default CombinedWorldRadar
