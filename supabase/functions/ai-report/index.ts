import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

const getCorsOrigin = (req: Request): string => {
  const origin = req.headers.get('Origin') ?? ''
  const env = Deno.env.get('ALLOWED_ORIGIN') ?? ''
  const allowed = [env, env.replace('://www.', '://'), env.replace('://', '://www.')].filter(Boolean)
  return allowed.includes(origin) ? origin : (env || '*')
}

const corsHeaders = (req: Request) => ({
  'Access-Control-Allow-Origin': getCorsOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
})

const isAuthorized = (req: Request): boolean => {
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const auth = req.headers.get('Authorization') ?? ''
  return anon !== '' && auth === `Bearer ${anon}`
}

const cleanArabicReport = (text: string): string => {
  text = text.replace(/[一-鿿㐀-䶿぀-ヿㇰ-ㇿ･-ﾟ]/g, '')
  text = text.replace(/[Ѐ-ӿ]/g, '')
  text = text.replace(/[가-힯ᄀ-ᇿ㄰-㆏]/g, '')
  text = text.replace(/(?<=[؀-ۿ])[A-Za-z]+/g, '')
  text = text.replace(/[A-Za-z]+(?=[؀-ۿ])/g, '')
  text = text.replace(/([؀-ۿ])\s+[A-Za-z]{2,}\s+([؀-ۿ])/g, '$1 $2')
  text = text.replace(/(?<=[^\x00-\x7F\s])\s*[A-Za-z]{2,}\s*(?=[^\x00-\x7F])/g, ' ')
  text = text.replace(/[、。・]/g, '،')
  text = text.replace(/[ \t]{2,}/g, ' ')
  return text.trim()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req) })
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
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
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
