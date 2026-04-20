export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
  isInitialInstruction?: boolean
  isLoadingQuestionnaire?: boolean
}

// ─── DeepSeek config ──────────────────────────────────────────────────────────
const DEEPSEEK_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string
const DEEPSEEK_BASE    = 'https://api.groq.com/openai/v1/chat/completions'
const DEEPSEEK_MODEL   = 'llama-3.3-70b-versatile'

type DSMessage = { role: 'system' | 'user' | 'assistant'; content: string }

const buildMessages = (
  messages: Message[],
  systemPrompt?: { value: string; enabled: boolean }
): DSMessage[] => {
  const result: DSMessage[] = []

  if (systemPrompt?.enabled && systemPrompt.value) {
    result.push({ role: 'system', content: systemPrompt.value })
  }

  messages
    .filter(m => !m.isTyping && !m.isInitialInstruction && !m.isLoadingQuestionnaire)
    .forEach(m => result.push({ role: m.role, content: m.content }))

  return result
}

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
  const controller = abortController || new AbortController()
  try {
    const response = await fetch(DEEPSEEK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: buildMessages(data.messages, data.systemPrompt),
        stream: true,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`DeepSeek error ${response.status}: ${errText}`)
    }

    if (!response.body) throw new Error('No response body')

    const reader  = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) { onComplete(); break }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr || jsonStr === '[DONE]') continue
        try {
          const parsed = JSON.parse(jsonStr)
          const text = parsed?.choices?.[0]?.delta?.content
          if (text) onChunk(text)
        } catch { /* skip malformed chunk */ }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
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
  const response = await fetch(DEEPSEEK_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: buildMessages(data.messages, data.systemPrompt),
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`DeepSeek error ${response.status}: ${errText}`)
  }

  const json = await response.json()
  return { success: true, content: json?.choices?.[0]?.message?.content ?? '' }
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

    const systemText = language === 'ar'
      ? 'أنت خبير في نموذج هارموني. قم بإنشاء 27 سؤالاً بالضبط. أرجع JSON فقط مع حقلي "problem" و "questions".'
      : 'You are a Harmony model expert. Generate exactly 27 questions. Return valid JSON only with "problem" and "questions" fields.'

    const response = await fetch(DEEPSEEK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemText },
          { role: 'user',   content: combinedPrompt },
        ],
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`DeepSeek error ${response.status}: ${errText}`)
    }

    const json    = await response.json()
    let   content = json?.choices?.[0]?.message?.content ?? ''

    content = content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '')
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

    const chartDataText = JSON.stringify({
      overall_percentage:     overall,
      harmony_percentage:     harmony,
      mental_percentage:      mental.percentage,
      emotional_percentage:   emotional.percentage,
      existential_percentage: existential.percentage,
      highest_dimension: { label_ar: highest.label_ar, label_en: highest.label_en, desc_ar: highest.desc_ar, desc_en: highest.desc_en, value: highest.value },
      lowest_dimension:  { label_ar: lowest.label_ar,  label_en: lowest.label_en,  value: lowest.value },
      top_3_functions:    top3.map((e: any)    => ({ name: e.name, score: Number(e.score.toFixed(2)) })),
      bottom_3_functions: bottom3.map((e: any) => ({ name: e.name, score: Number(e.score.toFixed(2)) })),
      balance_gap: Number(balance_gap.toFixed(1)),
    }, null, 2)

    const fullPrompt = reportPrompt.replace('{CHART_DATA_PLACEHOLDER}', chartDataText)

    const systemText = language === 'ar'
      ? 'أنت خبير في نموذج هارموني. قم بكتابة تقرير نفسي موجز وإنساني باللغة العربية بناءً على إجابات الاستبيان المقدمة.'
      : 'You are a Harmony model expert. Write a brief and humane psychological report in English based on the provided questionnaire answers.'

    const response = await fetch(DEEPSEEK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemText },
          { role: 'user',   content: fullPrompt },
        ],
        max_tokens: 8192,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`DeepSeek error ${response.status}: ${errText}`)
    }

    const json    = await response.json()
    const content = json?.choices?.[0]?.message?.content ?? ''
    if (!content?.trim()) throw new Error('Empty AI response received')

    return content.trim()

  } catch (error) {
    console.error('Failed to generate report:', error)
    throw error
  }
}
