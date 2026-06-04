import { useState } from 'react'

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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string
const fnUrl = (name: string) => `${SUPABASE_URL}/functions/v1/${name}`
const fnHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_KEY}` }

export default function DrillDownPanel({
  functionName, cogScore, emoScore, behScore, coherence, questionnaireTopic, language, onClose,
}: DrillDownPanelProps) {
  const [questions, setQuestions] = useState<string[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)

  const isAr = language === 'ar'
  const avg  = ((cogScore + emoScore + behScore) / 3).toFixed(1)

  const generate = async () => {
    setLoading(true)
    setError('')
    setQuestions([])

    const systemPrompt = isAr
      ? `أنت مختص نفسي متمرس. مهمتك توليد أسئلة استقصائية عميقة وهادفة تساعد المختص على فهم جذور الضعف لدى الشخص.
الأسئلة يجب أن تكون:
- مفتوحة وتشجع على التأمل
- تستهدف الجانب الضعيف تحديداً
- عملية وقابلة للسؤال في جلسة
أجب بقائمة من 3 إلى 6 أسئلة فقط، كل سؤال في سطر خاص به، مرقمة هكذا: 1. ...`
      : `You are an experienced psychologist. Your task is to generate deep, targeted follow-up questions that help a specialist understand the root causes of a person's weakness.
Questions should be:
- Open-ended and reflective
- Targeting the specific weak dimension
- Practical for use in a session
Respond with a numbered list of 3-6 questions only, one per line: 1. ...`

    const userMsg = isAr
      ? `الشخص أظهر ضعفاً في وظيفة "${functionName}" ضمن استبيان "${questionnaireTopic || 'تحليل الذات'}".
النتائج:
- الذهني: ${cogScore.toFixed(1)}/5
- المشاعري: ${emoScore.toFixed(1)}/5
- السلوكي: ${behScore.toFixed(1)}/5
- المتوسط: ${avg}/5
- التجانس: ${coherence}%

ولّد أسئلة متعمقة يسألها المختص للشخص لفهم أسباب هذا الضعف.`
      : `The person showed weakness in the "${functionName}" function in the "${questionnaireTopic || 'self-analysis'}" questionnaire.
Results:
- Cognitive: ${cogScore.toFixed(1)}/5
- Emotional: ${emoScore.toFixed(1)}/5
- Behavioral: ${behScore.toFixed(1)}/5
- Average: ${avg}/5
- Coherence: ${coherence}%

Generate targeted follow-up questions for the specialist to ask the person to understand the root cause of this weakness.`

    try {
      const res = await fetch(fnUrl('ai-chat'), {
        method: 'POST',
        headers: fnHeaders,
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMsg }],
          systemPrompt: { enabled: true, value: systemPrompt },
          stream: false,
        }),
      })
      if (!res.ok) throw new Error()
      const { content } = await res.json()
      const parsed = (content as string)
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => /^\d+[\.\)]\s/.test(l))
        .map((l: string) => l.replace(/^\d+[\.\)]\s+/, ''))
      setQuestions(parsed.length > 0 ? parsed : [content])
    } catch {
      setError(isAr ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again')
    } finally {
      setLoading(false)
    }
  }

  const copyAll = () => {
    navigator.clipboard.writeText(questions.map((q, i) => `${i + 1}. ${q}`).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <h3 className="text-white font-bold text-base">
            {isAr ? `أسئلة تعمقية — ${functionName}` : `Drill-Down — ${functionName}`}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label: isAr ? 'ذهني' : 'Cog.', value: cogScore, color: '#22c55e' },
            { label: isAr ? 'مشاعري' : 'Emo.', value: emoScore, color: '#ae1f23' },
            { label: isAr ? 'سلوكي' : 'Beh.', value: behScore, color: '#3b82f6' },
            { label: isAr ? 'التجانس' : 'Coh.', value: null, raw: `${coherence}%`, color: '#ffffff' },
          ].map((item, i) => (
            <div key={i} className="rounded-lg py-2 px-1" style={{ background: '#1a1a1a' }}>
              <p className="text-gray-400 mb-1">{item.label}</p>
              <p className="font-bold" style={{ color: item.color }}>
                {item.raw ?? item.value!.toFixed(1)}
              </p>
            </div>
          ))}
        </div>

        {/* Generate button */}
        {questions.length === 0 && !loading && (
          <button
            onClick={generate}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition hover:opacity-90 active:scale-95"
            style={{ background: '#1d4ed8' }}
          >
            {isAr ? 'توليد الأسئلة التعمقية' : 'Generate Follow-up Questions'}
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3" />
            <p className="text-gray-400 text-sm">{isAr ? 'يولّد الأسئلة...' : 'Generating questions...'}</p>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, i) => (
                <div key={i} className="flex gap-3 rounded-xl p-3" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <span className="text-blue-400 font-bold text-sm shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-gray-200 text-sm leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={copyAll}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition"
                style={{
                  background: copied ? '#14532d' : '#1a1a1a',
                  color: copied ? '#4ade80' : '#d1d5db',
                  border: '1px solid #2e2e2e',
                }}
              >
                {copied ? (isAr ? '✓ تم النسخ' : '✓ Copied!') : (isAr ? 'نسخ الأسئلة' : 'Copy Questions')}
              </button>
              <button
                onClick={generate}
                className="py-2 px-4 rounded-xl text-sm text-gray-400 hover:text-white transition"
                style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}
              >
                {isAr ? 'تجديد' : 'Regenerate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
