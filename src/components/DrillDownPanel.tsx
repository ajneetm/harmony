import { useState, useEffect } from 'react'
import { selectQuestions } from '../utils/drillDownQuestions'

interface DrillDownPanelProps {
  functionName: string
  cogScore: number
  emoScore: number
  behScore: number
  coherence: number
  questionnaireTopic: string
  language: 'ar' | 'en'
  onClose: () => void
}

export default function DrillDownPanel({
  functionName, cogScore, emoScore, behScore, coherence, language, onClose,
}: DrillDownPanelProps) {
  const [copied, setCopied] = useState(false)
  const isAr = language === 'ar'

  const questions = selectQuestions(functionName, cogScore, emoScore, behScore, language)

  // Determine weakest driver label for display
  const min     = Math.min(cogScore, emoScore, behScore)
  const weakDrv = cogScore === min
    ? (isAr ? 'الذهني'   : 'Cognitive')
    : emoScore === min
      ? (isAr ? 'المشاعري' : 'Emotional')
      : (isAr ? 'السلوكي'  : 'Behavioral')

  const copyAll = () => {
    navigator.clipboard.writeText(questions.map((q, i) => `${i + 1}. ${q}`).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 space-y-4"
        style={{ background: '#111', border: '1px solid #2e2e2e' }}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-base">
              {isAr ? `أسئلة تعمقية — ${functionName}` : `Drill-Down — ${functionName}`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isAr
                ? `المحرك الأضعف: ${weakDrv} (${min.toFixed(1)})`
                : `Weakest driver: ${weakDrv} (${min.toFixed(1)})`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label: isAr ? 'ذهني'    : 'Cog.',  value: cogScore, color: '#22c55e' },
            { label: isAr ? 'مشاعري' : 'Emo.',  value: emoScore, color: '#ae1f23' },
            { label: isAr ? 'سلوكي'  : 'Beh.',  value: behScore, color: '#3b82f6' },
            { label: isAr ? 'التجانس': 'Coh.',  value: null, raw: `${coherence}%`, color: '#ffffff' },
          ].map((item, i) => (
            <div key={i} className="rounded-lg py-2 px-1" style={{ background: '#1a1a1a' }}>
              <p className="text-gray-400 mb-1">{item.label}</p>
              <p className="font-bold" style={{ color: item.color }}>
                {item.raw ?? item.value!.toFixed(1)}
              </p>
            </div>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
          {questions.map((q, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl p-3"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <span className="text-blue-400 font-bold text-sm shrink-0 mt-0.5">{i + 1}.</span>
              <p className="text-gray-200 text-sm leading-relaxed">{q}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={copyAll}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition"
          style={{
            background: copied ? '#14532d' : '#1a1a1a',
            color:      copied ? '#4ade80' : '#d1d5db',
            border: '1px solid #2e2e2e',
          }}
        >
          {copied
            ? (isAr ? '✓ تم النسخ' : '✓ Copied!')
            : (isAr ? 'نسخ الأسئلة' : 'Copy Questions')}
        </button>
      </div>
    </div>
  )
}
