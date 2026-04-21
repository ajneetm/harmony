import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite-001']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { chartData, language, reportPrompt } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    const genAI = new GoogleGenerativeAI(apiKey)

    const systemInstruction = language === 'ar'
      ? 'أنت خبير في نموذج هارموني. قم بكتابة تقرير نفسي موجز وإنساني باللغة العربية الفصحى حصراً. ممنوع منعاً باتاً استخدام أي كلمات أو أحرف من لغات أخرى غير العربية.'
      : 'You are a Harmony model expert. Write a brief and humane psychological report in English only.'

    let result: any
    for (let i = 0; i < MODELS.length; i++) {
      try {
        const model = genAI.getGenerativeModel({ model: MODELS[i], systemInstruction })
        result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: reportPrompt }] }],
          generationConfig: { maxOutputTokens: 2500 },
        })
        break
      } catch (err: any) {
        if (i === MODELS.length - 1) throw err
      }
    }

    let content = result.response.text()
    if (!content?.trim()) throw new Error('Empty AI response')
    if (language === 'ar') content = cleanArabicReport(content)

    return new Response(JSON.stringify({ content: content.trim() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
