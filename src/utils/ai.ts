import { getReportPrompt } from './report_prompts'
import { subscription_AR_PROMPT, subscription_EN_PROMPT } from './subscription_prompts'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
  isInitialInstruction?: boolean
  isLoadingQuestionnaire?: boolean
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const fnUrl = (name: string) => `${SUPABASE_URL}/functions/v1/${name}`
const fnHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_KEY}` }

// ─── Streaming chat ───────────────────────────────────────────────────────────
export const genAIResponseStream = async (
  data: {
    messages: Message[]
    systemPrompt?: { value: string; enabled: boolean }
  },
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  abortController?: AbortController
) => {
  try {
    const res = await fetch(fnUrl('ai-chat'), {
      method: 'POST',
      headers: fnHeaders,
      body: JSON.stringify({ messages: data.messages, systemPrompt: data.systemPrompt, stream: true }),
      signal: abortController?.signal,
    })

    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') { onComplete(); return }
        try { const { text } = JSON.parse(payload); if (text) onChunk(text) } catch { /* ignore */ }
      }
    }
    onComplete()
  } catch (error: any) {
    if (abortController?.signal.aborted) {
      onError('Streaming stopped by user.')
    } else {
      onError(error instanceof Error ? error.message : 'An unknown error occurred.')
    }
  }
}

// ─── Non-streaming chat ───────────────────────────────────────────────────────
export const genAIResponse = async (data: {
  messages: Message[]
  systemPrompt?: { value: string; enabled: boolean }
}) => {
  const res = await fetch(fnUrl('ai-chat'), {
    method: 'POST',
    headers: fnHeaders,
    body: JSON.stringify({ messages: data.messages, systemPrompt: data.systemPrompt, stream: false }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return { success: true, content: json.content as string }
}

// ─── Generate questionnaire questions ────────────────────────────────────────
export const generateQuestions = async (aiResponse: string, language: 'ar' | 'en' = 'en') => {
  try {
    const subscriptionPrompt = language === 'ar' ? subscription_AR_PROMPT : subscription_EN_PROMPT

    const prompt = language === 'ar'
      ? `${subscriptionPrompt}

**المشكلة المحللة من هارموني:**
${aiResponse}

**المطلوب:** بناءً على التحليل أعلاه، قم بإنشاء 27 سؤالاً تقييمياً وفق نموذج هارموني.

يجب أن يكون الناتج عبارة عن JSON object كامل ومتكامل بالشكل التالي:
{
  "problem": "ملخص المشكلة",
  "questions": [
    {"dimension": "...", "element": "...", "type": "...", "statement": "..."},
    ... (27 سؤال بالضبط)
  ]
}

فقط قم بإرجاع الـ JSON object الكامل، لا تعيد أي أوامر أو تعليقات أو أي شيء آخر.`
      : `${subscriptionPrompt}

**Harmony Analysis Problem:**
${aiResponse}

**Required:** Based on the analysis above, create 27 evaluative questions according to the Harmony model.

The output should be a complete JSON object in the following format:
{
  "problem": "problem summary",
  "questions": [
    {"dimension": "...", "element": "...", "type": "...", "statement": "..."},
    ... (exactly 27 questions)
  ]
}

Only return the complete JSON object, do not return any commands, comments, or anything else.`

    const systemInstruction = language === 'ar'
      ? 'أنت خبير في نموذج هارموني. قم بإنشاء 27 سؤالاً بالضبط. أرجع JSON فقط مع حقلي "problem" و "questions".'
      : 'You are a Harmony model expert. Generate exactly 27 questions. Return valid JSON only with "problem" and "questions" fields.'

    const res = await fetch(fnUrl('ai-questions'), {
      method: 'POST',
      headers: fnHeaders,
      body: JSON.stringify({ prompt, systemInstruction }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    return json.questions

  } catch (error) {
    console.error('Failed to generate questions:', error)
    throw error
  }
}

// ─── Generate report ──────────────────────────────────────────────────────────
export const generateReport = async (_answersData: any, chartData: any, language: 'ar' | 'en' = 'ar') => {
  try {
    const reportPrompt = getReportPrompt(language)

    const { mental, emotional, existential, harmony, overall, allElements } = chartData

    const dimensionData = [
      { value: mental.percentage,      label_ar: 'الذهني',   label_en: 'Mental',      desc_ar: 'جانب التفكير والتحليل',         desc_en: 'the side of thinking and analysis' },
      { value: emotional.percentage,   label_ar: 'المشاعري', label_en: 'Emotional',   desc_ar: 'جانب المشاعر والتفاعل الداخلي', desc_en: 'the side of emotions and inner interaction' },
      { value: existential.percentage, label_ar: 'السلوكي',  label_en: 'Existential', desc_ar: 'جانب الهوية والتشكل الداخلي',   desc_en: 'the side of identity and inner formation' },
    ].sort((a, b) => b.value - a.value)

    const highest    = dimensionData[0]
    const lowest     = dimensionData[dimensionData.length - 1]
    const top3       = allElements.slice(0, 3)
    const bottom3    = [...allElements].slice(-3).reverse()
    const balance_gap = Math.max(mental.percentage, emotional.percentage, existential.percentage)
      - Math.min(mental.percentage, emotional.percentage, existential.percentage)

    const chartDataText = language === 'ar'
      ? JSON.stringify({
          'النسبة_العامة': overall,
          'نسبة_التجانس':  harmony,
          'نسبة_الذهني':   mental.percentage,
          'نسبة_المشاعري': emotional.percentage,
          'نسبة_السلوكي':  existential.percentage,
          'البعد_الأعلى':  { الاسم: highest.label_ar, الوصف: highest.desc_ar, القيمة: highest.value },
          'البعد_الأدنى':  { الاسم: lowest.label_ar,  القيمة: lowest.value },
          'أقوى_3_وظائف':  top3.map((e: any)    => ({ الاسم: e.name, الدرجة: Number(e.score.toFixed(2)) })),
          'أضعف_3_وظائف':  bottom3.map((e: any) => ({ الاسم: e.name, الدرجة: Number(e.score.toFixed(2)) })),
          'فجوة_التوازن':  Number(balance_gap.toFixed(1)),
        }, null, 2)
      : JSON.stringify({
          overall_percentage:     overall,
          harmony_percentage:     harmony,
          mental_percentage:      mental.percentage,
          emotional_percentage:   emotional.percentage,
          existential_percentage: existential.percentage,
          highest_dimension: { label: highest.label_en, description: highest.desc_en, value: highest.value },
          lowest_dimension:  { label: lowest.label_en,  value: lowest.value },
          top_3_functions:    top3.map((e: any)    => ({ name: e.name, score: Number(e.score.toFixed(2)) })),
          bottom_3_functions: bottom3.map((e: any) => ({ name: e.name, score: Number(e.score.toFixed(2)) })),
          balance_gap: Number(balance_gap.toFixed(1)),
        }, null, 2)

    const fullPrompt = reportPrompt.replace('{CHART_DATA_PLACEHOLDER}', chartDataText)

    const res = await fetch(fnUrl('ai-report'), {
      method: 'POST',
      headers: fnHeaders,
      body: JSON.stringify({ chartData, language, reportPrompt: fullPrompt }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    return json.content as string

  } catch (error) {
    console.error('Failed to generate report:', error)
    throw error
  }
}
