import React from 'react'

interface CombinedWorldRadarProps {
  title: string
  titleColor: string
  axisLabels: string[]          // 3 function names for this world
  cognitive:  number[]          // 3 ذهني  values  → green
  emotional:  number[]          // 3 مشاعري values  → red
  behavioral: number[]          // 3 سلوكي values   → blue
  percentage: number
  coherence: number
  language?: 'ar' | 'en'
}

const COLORS = { cognitive: '#22c55e', emotional: '#ae1f23', behavioral: '#3b82f6' }

const CombinedWorldRadar: React.FC<CombinedWorldRadarProps> = ({
  title, titleColor, axisLabels, cognitive, emotional, behavioral, percentage, coherence, language = 'en'
}) => {
  const size   = 700
  const cx     = size / 2
  const cy     = size / 2
  const maxR   = 240
  const levels = 5
  const n      = 3
  const labelR = maxR + 65

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

  const buildPoly = (values: number[]) =>
    values.map((v, i) => {
      const p = toXY(i, v)
      return `${p.x},${p.y}`
    }).join(' ')

  const types = [
    { key: 'cognitive',  values: cognitive,  color: COLORS.cognitive,  label: language === 'ar' ? 'الذهني'   : 'Cognitive'  },
    { key: 'emotional',  values: emotional,  color: COLORS.emotional,  label: language === 'ar' ? 'المشاعري' : 'Emotional'  },
    { key: 'behavioral', values: behavioral, color: COLORS.behavioral, label: language === 'ar' ? 'السلوكي'  : 'Behavioral' },
  ]

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full" style={{ maxWidth: 340 }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
          <defs>
            {types.map(t => (
              <radialGradient key={t.key} id={`cwrf-${t.key}-${title.replace(/\s/g,'')}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={t.color} stopOpacity="0.03" />
                <stop offset="100%" stopColor={t.color} stopOpacity="0.30" />
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
          {[1,2,3,4,5].map(lv => (
            <text key={lv} x={cx + 6} y={cy - (lv/5)*maxR + 7}
              fontSize="22" fill="#6B7280" textAnchor="start">{lv}</text>
          ))}

          {/* 3 type triangles */}
          {types.map(t => (
            <g key={t.key}>
              <polygon
                points={buildPoly(t.values)}
                fill={`url(#cwrf-${t.key}-${title.replace(/\s/g,'')})`}
                stroke={t.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {t.values.map((v, i) => {
                const p = toXY(i, v)
                return (
                  <circle key={i}
                    cx={p.x} cy={p.y} r="7"
                    fill={t.color} stroke="#111" strokeWidth="2"
                  />
                )
              })}
            </g>
          ))}

          {/* Axis labels */}
          {axisLabels.map((lbl, i) => {
            const a = (angleOf(i) * Math.PI) / 180
            const x = cx + Math.cos(a) * labelR
            const y = cy + Math.sin(a) * labelR
            const anchor = x > cx + 10 ? 'start' : x < cx - 10 ? 'end' : 'middle'
            return (
              <text key={i} x={x} y={y}
                fontSize="30" fill="#ffffff"
                textAnchor={anchor} dominantBaseline="middle" fontWeight="600">
                {lbl}
              </text>
            )
          })}
        </svg>
      </div>

      {/* World title */}
      <div className="flex items-center justify-center gap-1.5 mt-1 mb-2">
        <span className="w-3 h-3 rounded-full" style={{ background: titleColor }} />
        <span className="text-sm font-bold" style={{ color: titleColor }}>{title}</span>
      </div>

      {/* Two indicators */}
      <div className="flex justify-center gap-3 w-full">
        <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
          <p className="text-[10px] text-gray-400 mb-1">
            {language === 'ar' ? 'معدل الوظائف' : 'Functions Avg'}
          </p>
          <p className="text-lg font-bold leading-none" style={{ color: titleColor }}>{percentage}%</p>
        </div>
        <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
          <p className="text-[10px] text-gray-400 mb-1">
            {language === 'ar' ? 'التجانس الداخلي' : 'Internal Coherence'}
          </p>
          <p className="text-lg font-bold leading-none" style={{ color: titleColor }}>{coherence}%</p>
        </div>
      </div>
    </div>
  )
}

export default CombinedWorldRadar
