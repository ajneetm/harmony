import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Content } from '@google/generative-ai'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
  isInitialInstruction?: boolean
  isLoadingQuestionnaire?: boolean
}

// ─── Arabic report cleaner ────────────────────────────────────────────────────
const cleanArabicReport = (text: string): string => {
  text = text.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\u31F0-\u31FF\uFF65-\uFF9F]/g, '')
  text = text.replace(/[\u0400-\u04FF]/g, '')
  text = text.replace(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, '')
  text = text.replace(/(?<=[\u0600-\u06FF])[A-Za-z]+/g, '')
  text = text.replace(/[A-Za-z]+(?=[\u0600-\u06FF])/g, '')
  text = text.replace(/([\u0600-\u06FF])\s+[A-Za-z]{2,}\s+([\u0600-\u06FF])/g, '$1 $2')
  text = text.replace(/(?<=[^\x00-\x7F\s])\s*[A-Za-z]{2,}\s*(?=[^\x00-\x7F])/g, ' ')
  text = text.replace(/[、。・]/g, '،')
  text = text.replace(/[ \t]{2,}/g, ' ')
  return text.trim()
}

// ─── Gemini client ────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string)
const MODEL  = 'gemini-1.5-flash'

const getModel = () =>
  genAI.getGenerativeModel({ model: MODEL }, { apiVersion: 'v1' })

// v1 doesn't support systemInstruction — prepend it as a user/model exchange
const withSystem = (systemInstruction: string | undefined, contents: Content[]): Content[] =>
  systemInstruction
    ? [
        { role: 'user',  parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'مفهوم، سأتبع هذه التعليمات.' }] },
        ...contents,
      ]
    : contents

// Convert our Message[] to Gemini content format
const toGeminiContents = (messages: Message[]) =>
  messages
    .filter(m => !m.isTyping && !m.isInitialInstruction && !m.isLoadingQuestionnaire)
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

// ─── Streaming ───────────────────────────────────────────────────────────────
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
    const systemInstruction = data.systemPrompt?.enabled ? data.systemPrompt.value : undefined
    const model    = getModel()
    const contents = withSystem(systemInstruction, toGeminiContents(data.messages))

    const result = await model.generateContentStream({ contents })

    for await (const chunk of result.stream) {
      if (abortController?.signal.aborted) break
      const text = chunk.text()
      if (text) onChunk(text)
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

// ─── Non-streaming ────────────────────────────────────────────────────────────
export const genAIResponse = async (data: {
  messages: Message[]
  systemPrompt?: { value: string; enabled: boolean }
}) => {
  const systemInstruction = data.systemPrompt?.enabled ? data.systemPrompt.value : undefined
  const model    = getModel()
  const contents = withSystem(systemInstruction, toGeminiContents(data.messages))

  const result = await model.generateContent({ contents })
  const content = result.response.text()
  return { success: true, content }
}

// ─── Generate questionnaire questions ────────────────────────────────────────
export const generateQuestions = async (aiResponse: string, language: 'ar' | 'en' = 'en') => {
  try {
    const { subscription_AR_PROMPT, subscription_EN_PROMPT } = await import('./subscription_prompts')
    const subscriptionPrompt = language === 'ar' ? subscription_AR_PROMPT : subscription_EN_PROMPT

    const combinedPrompt = language === 'ar'
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

    const model  = getModel()
    const result = await model.generateContent({
      contents: withSystem(systemInstruction, [{ role: 'user', parts: [{ text: combinedPrompt }] }]),
      generationConfig: { responseMimeType: 'application/json' },
    })

    let content = result.response.text().trim()
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) content = jsonMatch[0]

    const parsed    = JSON.parse(content)
    const questions = parsed.questions

    if (!Array.isArray(questions)) throw new Error('Invalid response: missing questions array')

    return questions.map((q: any, i: number) => ({
      id: i + 1,
      text: q.statement || q.text || q.question
    }))

  } catch (error) {
    console.error('Failed to generate questions:', error)
    throw error
  }
}

// ─── Generate report ──────────────────────────────────────────────────────────
export const generateReport = async (_answersData: any, chartData: any, language: 'ar' | 'en' = 'ar') => {
  try {
    const { getReportPrompt } = await import('./report_prompts')
    const reportPrompt = getReportPrompt(language)

    const { mental, emotional, existential, harmony, overall, allElements } = chartData

    const dimensionData = [
      { key: 'mental',      value: mental.percentage,      label_ar: 'الذهني',   label_en: 'Mental',      desc_ar: 'جانب التفكير والتحليل',          desc_en: 'the side of thinking and analysis' },
      { key: 'emotional',   value: emotional.percentage,   label_ar: 'المشاعري', label_en: 'Emotional',   desc_ar: 'جانب المشاعر والتفاعل الداخلي',  desc_en: 'the side of emotions and inner interaction' },
      { key: 'existential', value: existential.percentage, label_ar: 'السلوكي',  label_en: 'Existential', desc_ar: 'جانب الهوية والتشكل الداخلي',    desc_en: 'the side of identity and inner formation' },
    ]
    dimensionData.sort((a, b) => b.value - a.value)
    const highest = dimensionData[0]
    const lowest  = dimensionData[dimensionData.length - 1]

    const top3    = allElements.slice(0, 3)
    const bottom3 = [...allElements].slice(-3).reverse()
    const balance_gap = Math.max(mental.percentage, emotional.percentage, existential.percentage)
      - Math.min(mental.percentage, emotional.percentage, existential.percentage)

    const chartDataText = language === 'ar'
      ? JSON.stringify({
          'النسبة_العامة':  overall,
          'نسبة_التجانس':   harmony,
          'نسبة_الذهني':    mental.percentage,
          'نسبة_المشاعري':  emotional.percentage,
          'نسبة_السلوكي':   existential.percentage,
          'البعد_الأعلى':   { الاسم: highest.label_ar, الوصف: highest.desc_ar, القيمة: highest.value },
          'البعد_الأدنى':   { الاسم: lowest.label_ar,  القيمة: lowest.value },
          'أقوى_3_وظائف':   top3.map((e: any)    => ({ الاسم: e.name, الدرجة: Number(e.score.toFixed(2)) })),
          'أضعف_3_وظائف':   bottom3.map((e: any) => ({ الاسم: e.name, الدرجة: Number(e.score.toFixed(2)) })),
          'فجوة_التوازن':   Number(balance_gap.toFixed(1)),
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

    const systemInstruction = language === 'ar'
      ? 'أنت خبير في نموذج هارموني. قم بكتابة تقرير نفسي موجز وإنساني باللغة العربية الفصحى حصراً بناءً على إجابات الاستبيان المقدمة. ممنوع منعاً باتاً استخدام أي كلمات أو أحرف من لغات أخرى غير العربية.'
      : 'You are a Harmony model expert. Write a brief and humane psychological report in English based on the provided questionnaire answers. Use only English words and characters.'

    const model  = getModel()
    const result = await model.generateContent({
      contents: withSystem(systemInstruction, [{ role: 'user', parts: [{ text: fullPrompt }] }]),
      generationConfig: { maxOutputTokens: 2500 },
    })

    let content = result.response.text()
    if (!content?.trim()) throw new Error('Empty AI response received')

    if (language === 'ar') content = cleanArabicReport(content)
    return content.trim()

  } catch (error) {
    console.error('Failed to generate report:', error)
    throw error
  }
}
