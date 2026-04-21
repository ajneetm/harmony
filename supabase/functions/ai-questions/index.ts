import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite-001']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
    }))

    return new Response(JSON.stringify({ questions: mapped }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
