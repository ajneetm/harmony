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
  const auth = req.headers.get('Authorization') ?? ''
  return auth.startsWith('Bearer ') && auth.length > 7
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
    const { prompt, systemInstruction } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    const genAI = new GoogleGenerativeAI(apiKey)

    let result: any
    for (let i = 0; i < MODELS.length; i++) {
      try {
        const model = genAI.getGenerativeModel({ model: MODELS[i], systemInstruction })
        result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        })
        break
      } catch (err: any) {
        if (i === MODELS.length - 1) throw err
      }
    }

    let content = result.response.text().trim()
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) content = jsonMatch[0]

    const parsed = JSON.parse(content)
    const questions = parsed.questions
    if (!Array.isArray(questions)) throw new Error('Invalid response: missing questions array')

    const mapped = questions.map((q: any, i: number) => ({
      id: i + 1,
      text: q.statement || q.text || q.question,
      reversed: q.reversed ?? false,
    }))

    return new Response(JSON.stringify({ questions: mapped }), {
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
