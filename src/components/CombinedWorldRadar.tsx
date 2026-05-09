import React, { useState } from 'react'

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
  language = 'en',
}) => {
  const [active, setActive] = useState(dominantIndex)

  const size = 700
  const cx = size / 2
  const cy = size / 2
  const maxR = 250
  const levels = 5
  const n = 3
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

  const axisLabels = worlds[active].data.map((d, i) => {
    const a = (angleOf(i) * Math.PI) / 180
    return {
      x: cx + Math.cos(a) * labelR,
      y: cy + Math.sin(a) * labelR,
      text: d.dimension,
      anchor: (() => {
        const x = cx + Math.cos(a) * labelR
        if (x > cx + 10) return 'start'
        if (x < cx - 10) return 'end'
        return 'middle'
      })(),
    }
  })

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full" style={{ maxWidth: 380 }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
          <defs>
            {worlds.map((w, wi) => (
              <radialGradient key={wi} id={`cwr-grad-${wi}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={w.color} stopOpacity="0.03" />
                <stop offset="60%"  stopColor={w.color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={w.color} stopOpacity="0.40" />
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
              <line
                key={i}
                x1={cx} y1={cy}
                x2={cx + Math.cos(a) * maxR}
                y2={cy + Math.sin(a) * maxR}
                stroke="#4B5563" strokeWidth="1.2"
              />
            )
          })}

          {/* Scale numbers */}
          {[1, 2, 3, 4, 5].map(lv => (
            <text key={lv} x={cx + 6} y={cy - (lv / 5) * maxR + 8} fontSize="22" fill="#6B7280" textAnchor="start">
              {lv}
            </text>
          ))}

          {/* Inactive world polygons (drawn first = underneath) */}
          {worlds.map((w, wi) => wi !== active && (
            <polygon
              key={wi}
              points={polyPoints(w)}
              fill={`url(#cwr-grad-${wi})`}
              stroke={w.color}
              strokeWidth="1.5"
              opacity="0.28"
              strokeDasharray="6 4"
            />
          ))}

          {/* Active world polygon (on top) */}
          <polygon
            points={polyPoints(worlds[active])}
            fill={`url(#cwr-grad-${active})`}
            stroke={worlds[active].color}
            strokeWidth="3.5"
            opacity="1"
            style={{ filter: `drop-shadow(0 0 6px ${worlds[active].color}80)` }}
          />

          {/* Data points for active world */}
          {worlds[active].data.map((d, i) => {
            const p = toXY(i, d.value)
            return (
              <circle
                key={i}
                cx={p.x} cy={p.y} r="9"
                fill={worlds[active].color}
                stroke="#fff" strokeWidth="2.5"
              />
            )
          })}

          {/* Axis labels (from active world) */}
          {axisLabels.map((lbl, i) => (
            <text
              key={i}
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

      {/* Legend / world selector */}
      <div className="flex items-center justify-center gap-3 mt-2 flex-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {worlds.map((w, wi) => (
          <button
            key={wi}
            onClick={() => setActive(wi)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: wi === active ? `${w.color}22` : 'transparent',
              border: `1.5px solid ${wi === active ? w.color : w.color + '55'}`,
              color: wi === active ? w.color : w.color + '88',
              boxShadow: wi === active ? `0 0 8px ${w.color}44` : 'none',
              opacity: wi === active ? 1 : 0.6,
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: w.color, opacity: wi === active ? 1 : 0.5 }}
            />
            {w.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CombinedWorldRadar
