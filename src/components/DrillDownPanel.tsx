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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string
const fnUrl = (name: string) => `${SUPABASE_URL}/functions/v1/${name}`
const fnHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_KEY}` }

interface Analysis {
  problem:      string
  explanation:  string
  intervention: string
  selfRecs:     string[]
  coachRecs:    string[]
}

export default function DrillDownPanel({
  functionName, cogScore, emoScore, behScore, coherence, questionnaireTopic, language, onClose,
}: DrillDownPanelProps) {
  const [answers,       setAnswers]       = useState<string[]>([])
  const [analysis,      setAnalysis]      = useState<Analysis | null>(null)
  const [analyzing,     setAnalyzing]     = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  const isAr     = language === 'ar'
  const avg      = ((cogScore + emoScore + behScore) / 3).toFixed(1)
  const questions = selectQuestions(functionName, cogScore, emoScore, behScore, language)

  const min     = Math.min(cogScore, emoScore, behScore)
  const weakDrv = cogScore === min
    ? (isAr ? 'الذهني'   : 'Cognitive')
    : emoScore === min
      ? (isAr ? 'المشاعري' : 'Emotional')
      : (isAr ? 'السلوكي'  : 'Behavioral')

  // Initialise answer slots when questions load
  useEffect(() => {
    setAnswers(questions.map(() => ''))
  }, [questions.length])

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const answeredCount = answers.filter(a => a.trim()).length
  const hasAnyAnswer  = answeredCount > 0

  const analyze = async () => {
    if (!hasAnyAnswer) return
    setAnalyzing(true)
    setAnalysisError('')
    setAnalysis(null)

    const systemPrompt = isAr
      ? `أنت خبير في نموذج هارموني للفعل الإنساني. بناءً على إجابات المستفيد، حدد المشكلة الرئيسية واكتب تحليلاً موجهاً.

أنواع المشكلات في هارموني:
- إدراكية: غموض المعنى أو التفسير السلبي للمواقف
- جاهزية: يملك الفهم والرغبة لكن لا طاقة أو وقت أو مهارة أو دعم
- نية: رغبة غير واضحة أو نوايا متعارضة أو هدف غير محدد
- فعل: يعرف ويريد لكن لا يبدأ أو يبدأ ثم يتوقف
- تفاعل: خلل في التعامل مع الآخرين أو البيئة
- استجابة: يكرر نفس الأسلوب رغم فشله ولا يعدّل
- استقبال: لا يستقبل الأحداث والنتائج بوعي
- تطور: لا يتحول التعلم إلى نمو ويكرر الأخطاء
- تشكل: نمط سلبي متكرر تحوّل إلى عادة مستقرة
- وجودية/ظرفية: ضغط حياتي يفوق الطاقة الحالية

مهم: المشكلة لا تُحدَّد من أقل رقم فقط، بل من العلاقة بين الأرقام والإجابات والسياق.

أجب بـ JSON فقط، بهذا الشكل بالضبط:
{"problem":"نوع المشكلة","explanation":"شرح 2-3 جمل","intervention":"اسم الوظيفة الأولى للتدخل","selfRecs":["توصية1","توصية2","توصية3","توصية4"],"coachRecs":["توصية1","توصية2","توصية3"]}`
      : `You are a Harmony human-action model expert. Based on the participant's answers, identify the main problem and write a structured analysis.

Harmony problem types:
- Perception: unclear meaning or negative interpretation of situations
- Readiness: has understanding and desire but lacks energy, time, skill, or support
- Intention: desire is unclear, conflicting intentions, or undefined goal
- Action: knows and wants but doesn't start, or starts then stops
- Interaction: issues in dealing with others or the environment
- Response: repeats same approach despite failure, doesn't adjust based on results
- Reception: doesn't receive events and results with awareness
- Evolution: learning doesn't convert to growth, repeats same mistakes
- Formation: recurring negative pattern that became a stable habit
- Existential/Circumstantial: life pressure exceeding current capacity

Important: The problem is not determined by the lowest number alone, but by the relationship between scores, answers, and context.

Respond in JSON only, exactly like this:
{"problem":"problem type","explanation":"2-3 sentence explanation","intervention":"first function name for intervention","selfRecs":["rec1","rec2","rec3","rec4"],"coachRecs":["rec1","rec2","rec3"]}`

    // Build structured Q&A — only include answered questions
    const qaLines = questions
      .map((q, i) => answers[i]?.trim() ? `س${i + 1}: ${q}\nج: ${answers[i].trim()}` : null)
      .filter(Boolean)
      .join('\n\n')

    const userMsg = isAr
      ? `الوظيفة: ${functionName}
النتائج: ذهني=${cogScore.toFixed(1)}/5، مشاعري=${emoScore.toFixed(1)}/5، سلوكي=${behScore.toFixed(1)}/5، متوسط=${avg}/5، تجانس=${coherence}%
السياق: "${questionnaireTopic || 'تحليل الذات'}"

الأسئلة والإجابات (${answeredCount} من ${questions.length}):
${qaLines}

قدم التحليل بتنسيق JSON.`
      : `Function: ${functionName}
Scores: Cognitive=${cogScore.toFixed(1)}/5, Emotional=${emoScore.toFixed(1)}/5, Behavioral=${behScore.toFixed(1)}/5, Avg=${avg}/5, Coherence=${coherence}%
Context: "${questionnaireTopic || 'self-analysis'}"

Questions & Answers (${answeredCount} of ${questions.length}):
${qaLines}

Provide analysis in JSON format.`

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
      const jsonMatch = (content as string).match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error()
      const p = JSON.parse(jsonMatch[0])
      setAnalysis({
        problem:      p.problem      ?? '',
        explanation:  p.explanation  ?? '',
        intervention: p.intervention ?? '',
        selfRecs:     Array.isArray(p.selfRecs)  ? p.selfRecs  : [],
        coachRecs:    Array.isArray(p.coachRecs) ? p.coachRecs : [],
      })
    } catch {
      setAnalysisError(isAr ? 'حدث خطأ في التحليل، حاول مجدداً' : 'Analysis error, please try again')
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setAnalysis(null)
    setAnswers(questions.map(() => ''))
    setAnalysisError('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl flex flex-col"
        style={{ background: '#111', border: '1px solid #2e2e2e', maxHeight: '90vh' }}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-base">
                {isAr ? `تعمق — ${functionName}` : `Drill-Down — ${functionName}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAr ? `المحرك الأضعف: ${weakDrv} (${min.toFixed(1)})` : `Weakest driver: ${weakDrv} (${min.toFixed(1)})`}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none mt-0.5">✕</button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: isAr ? 'ذهني'    : 'Cog.',  value: cogScore, color: '#22c55e' },
              { label: isAr ? 'مشاعري' : 'Emo.',  value: emoScore, color: '#ae1f23' },
              { label: isAr ? 'سلوكي'  : 'Beh.',  value: behScore, color: '#3b82f6' },
              { label: isAr ? 'التجانس': 'Coh.',  value: null, raw: `${coherence}%`, color: '#ffffff' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg py-2" style={{ background: '#1a1a1a' }}>
                <p className="text-gray-400 mb-1">{item.label}</p>
                <p className="font-bold" style={{ color: item.color }}>
                  {item.raw ?? item.value!.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto px-6 pb-6 flex-1">

          {!analysis ? (
            <div className="space-y-4 mt-2">
              {/* Q&A list */}
              {questions.map((q, i) => (
                <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <div className="flex gap-2">
                    <span className="text-blue-400 font-bold text-sm shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-gray-200 text-sm leading-relaxed">{q}</p>
                  </div>
                  <textarea
                    value={answers[i] ?? ''}
                    onChange={e => setAnswers(prev => { const next = [...prev]; next[i] = e.target.value; return next })}
                    rows={2}
                    placeholder={isAr ? 'الجواب...' : 'Answer...'}
                    className="w-full rounded-lg text-sm text-gray-300 resize-none outline-none p-2"
                    style={{ background: '#0f0f0f', border: '1px solid #333' }}
                  />
                </div>
              ))}

              {analysisError && <p className="text-red-400 text-xs">{analysisError}</p>}

              <button
                onClick={analyze}
                disabled={analyzing || !hasAnyAnswer}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
                style={{ background: '#1d4ed8' }}
              >
                {analyzing
                  ? (isAr ? 'جاري التحليل...' : 'Analyzing...')
                  : (isAr
                      ? `تحليل (${answeredCount}/${questions.length} إجابة)`
                      : `Analyze (${answeredCount}/${questions.length} answered)`)}
              </button>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {/* Problem */}
              <div className="rounded-xl p-4 space-y-1" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                <p className="text-gray-400 text-xs">{isAr ? 'المشكلة الرئيسية' : 'Main Problem'}</p>
                <p className="text-white font-bold">{analysis.problem}</p>
                <p className="text-gray-300 text-sm leading-relaxed mt-1">{analysis.explanation}</p>
              </div>

              {/* Intervention */}
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                <span className="text-yellow-400 text-lg shrink-0">⚡</span>
                <div>
                  <p className="text-gray-400 text-xs">{isAr ? 'نقطة التدخل الأولى' : 'First Intervention'}</p>
                  <p className="text-yellow-300 font-semibold text-sm">{analysis.intervention}</p>
                </div>
              </div>

              {/* Self Recs */}
              <div className="rounded-xl p-4 space-y-2" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                <p className="text-gray-400 text-xs font-semibold">{isAr ? '✦ توصيات ذاتية' : '✦ Self-directed'}</p>
                {analysis.selfRecs.map((r, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-200">
                    <span className="text-green-400 shrink-0 mt-0.5">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Coach Recs */}
              <div className="rounded-xl p-4 space-y-2" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                <p className="text-gray-400 text-xs font-semibold">{isAr ? '✦ توصيات موجهة (بمساندة مختص)' : '✦ Coach-guided'}</p>
                {analysis.coachRecs.map((r, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-200">
                    <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Redo */}
              <button
                onClick={reset}
                className="w-full py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 transition"
                style={{ border: '1px solid #2e2e2e' }}
              >
                {isAr ? 'تحليل جديد' : 'New analysis'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
