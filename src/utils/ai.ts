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

**تعليمات مهمة حول الأسئلة المعكوسة:**
- يجب أن يكون 9 أسئلة بالضبط من أصل 27 ذات صياغة سلبية (reversed: true).
- الأسئلة السلبية تصف حالة ضعف أو غياب، مثال: "أجد صعوبة في..." أو "لا أستطيع..." أو "أفتقر إلى...".
- وزّع الأسئلة المعكوسة بشكل غير متوقع على الوظائف التسع (لا تجعلها في نهاية القائمة فقط).
- الأسئلة العادية (reversed: false) تصف حالة إيجابية أو قوة.

**تعليمات مهمة حول بساطة السؤال:**
- كل سؤال يجب أن يقيس فكرة أو سلوكًا واحدًا فقط.
- ممنوع دمج فكرتين بحرف عطف "و" في نفس السؤال (مثال خاطئ: "أخطط جيدًا وأتحمل المسؤولية عن قراراتي") — لازم يكون فيه إجابة واحدة واضحة ممكنة، لا إجابتين مختلفتين لجزأين من نفس السؤال.

يجب أن يكون الناتج عبارة عن JSON object كامل ومتكامل بالشكل التالي:
{
  "problem": "ملخص المشكلة",
  "questions": [
    {"id": 1, "dimension": "...", "element": "...", "type": "...", "text": "...", "reversed": false},
    {"id": 2, "dimension": "...", "element": "...", "type": "...", "text": "...", "reversed": true},
    ... (27 سؤال بالضبط، 9 منها reversed: true و18 reversed: false)
  ]
}

فقط قم بإرجاع الـ JSON object الكامل، لا تعيد أي أوامر أو تعليقات أو أي شيء آخر.`
      : `${subscriptionPrompt}

**Harmony Analysis Problem:**
${aiResponse}

**Required:** Based on the analysis above, create 27 evaluative questions according to the Harmony model.

**Important instructions about reversed questions:**
- Exactly 9 of the 27 questions must be negatively-worded (reversed: true).
- Reversed questions describe a weakness or absence, e.g. "I struggle to...", "I find it difficult to...", "I lack...".
- Distribute the reversed questions unpredictably across the nine functions (not only at the end).
- Regular questions (reversed: false) describe a positive state or strength.

**Important instructions about question simplicity:**
- Each question must measure exactly one idea or behavior.
- Never join two ideas with "and" in the same question (bad example: "I plan well and take responsibility for my decisions") — there must be one clear possible answer, not two different answers for two parts of the same question.

The output should be a complete JSON object in the following format:
{
  "problem": "problem summary",
  "questions": [
    {"id": 1, "dimension": "...", "element": "...", "type": "...", "text": "...", "reversed": false},
    {"id": 2, "dimension": "...", "element": "...", "type": "...", "text": "...", "reversed": true},
    ... (exactly 27 questions, 9 with reversed: true and 18 with reversed: false)
  ]
}

Only return the complete JSON object, do not return any commands, comments, or anything else.`

    const systemInstruction = language === 'ar'
      ? 'أنت خبير في نموذج هارموني. قم بإنشاء 27 سؤالاً بالضبط: 18 إيجابية (reversed: false) و9 سلبية (reversed: true) موزعة بشكل عشوائي. كل سؤال يقيس فكرة واحدة فقط، بدون دمج فكرتين بـ"و". أرجع JSON فقط.'
      : 'You are a Harmony model expert. Generate exactly 27 questions: 18 positive (reversed: false) and 9 negative (reversed: true) distributed randomly. Each question must measure exactly one idea, never two ideas joined with "and". Return valid JSON only.'

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

    const {
      mental, emotional, existential, harmony, overall, allElements,
      worldHarmony, dominantWorld, worldMentalPct, worldEmotionalPct, worldExistentialPct,
      driverHarmony, actionPower,
    } = chartData

    // mental.percentage / emotional.percentage / existential.percentage are now DRIVER percentages
    const dimensionData = [
      { value: mental.percentage,      label_ar: 'الذهني',   label_en: 'Mental',      desc_ar: 'جانب التفكير والتحليل',         desc_en: 'the side of thinking and analysis',  world_ar: 'العالم الداخلي',   world_en: 'Inner World'       },
      { value: emotional.percentage,   label_ar: 'المشاعري', label_en: 'Emotional',   desc_ar: 'جانب المشاعر والتفاعل الداخلي', desc_en: 'the side of emotions and inner interaction', world_ar: 'العالم الفيزيائي', world_en: 'Physical World'    },
      { value: existential.percentage, label_ar: 'السلوكي',  label_en: 'Behavioral',  desc_ar: 'جانب الهوية والتشكيل الداخلي',   desc_en: 'the side of identity and inner formation',  world_ar: 'العالم الوجودي',   world_en: 'Existential World' },
    ].sort((a, b) => b.value - a.value)

    const highest    = dimensionData[0]
    const lowest     = dimensionData[dimensionData.length - 1]
    const top3       = allElements.slice(0, 3)
    const bottom3    = [...allElements].slice(-3).reverse()
    const balance_gap = Math.max(mental.percentage, emotional.percentage, existential.percentage)
      - Math.min(mental.percentage, emotional.percentage, existential.percentage)

    // World percentages (fall back to driver percentages for old cached reports missing the field)
    const wMentalPct      = worldMentalPct      ?? mental.percentage
    const wEmotionalPct   = worldEmotionalPct   ?? emotional.percentage
    const wExistentialPct = worldExistentialPct ?? existential.percentage

    const chartDataText = language === 'ar'
      ? JSON.stringify({
          'النسبة_العامة':    overall,
          'قوة_الفعل':        actionPower ?? Math.round(overall * harmony / 100),
          'نسبة_التجانس':     harmony,
          'تجانس_المحركات':   driverHarmony ?? harmony,
          'تجانس_العوالم':    worldHarmony ?? harmony,
          'نسبة_الذهني':      mental.percentage,
          'نسبة_المشاعري':    emotional.percentage,
          'نسبة_السلوكي':     existential.percentage,
          'المحرك_الأعلى':    { الاسم: highest.label_ar, الوصف: highest.desc_ar, القيمة: highest.value },
          'المحرك_الأدنى':    { الاسم: lowest.label_ar,  القيمة: lowest.value },
          'أقوى_3_وظائف':     top3.map((e: any)    => ({ الاسم: e.name, الدرجة: Number((e.score ?? 0).toFixed(2)) })),
          'أضعف_3_وظائف':     bottom3.map((e: any) => ({ الاسم: e.name, الدرجة: Number((e.score ?? 0).toFixed(2)) })),
          'فجوة_التوازن':     Number(balance_gap.toFixed(1)),
          'العوالم_الثلاثة': {
            'العالم_الداخلي':   { النسبة: wMentalPct,      البعد: 'الذهني'   },
            'العالم_الفيزيائي': { النسبة: wEmotionalPct,   البعد: 'المشاعري' },
            'العالم_الوجودي':   { النسبة: wExistentialPct, البعد: 'السلوكي'  },
          },
          'العالم_المتحكم': dominantWorld ?? highest.world_ar,
        }, null, 2)
      : JSON.stringify({
          overall_percentage:     overall,
          action_power:           actionPower ?? Math.round(overall * harmony / 100),
          harmony_percentage:     harmony,
          driver_harmony:         driverHarmony ?? harmony,
          world_harmony:          worldHarmony ?? harmony,
          mental_percentage:      mental.percentage,
          emotional_percentage:   emotional.percentage,
          behavioral_percentage:  existential.percentage,
          highest_driver: { label: highest.label_en, description: highest.desc_en, value: highest.value },
          lowest_driver:  { label: lowest.label_en,  value: lowest.value },
          top_3_functions:    top3.map((e: any)    => ({ name: e.name, score: Number((e.score ?? 0).toFixed(2)) })),
          bottom_3_functions: bottom3.map((e: any) => ({ name: e.name, score: Number((e.score ?? 0).toFixed(2)) })),
          balance_gap: Number(balance_gap.toFixed(1)),
          three_worlds: {
            inner_world:       { percentage: wMentalPct,      dimension: 'Mental'      },
            physical_world:    { percentage: wEmotionalPct,   dimension: 'Emotional'   },
            existential_world: { percentage: wExistentialPct, dimension: 'Behavioral'  },
          },
          dominant_world: dominantWorld ?? highest.world_en,
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
