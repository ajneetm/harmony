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
    const { messages, systemPrompt, stream = true } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    const genAI = new GoogleGenerativeAI(apiKey)

    const systemInstruction = systemPrompt?.enabled ? systemPrompt.value : undefined

    const filtered = messages.filter(
      (m: any) => !m.isTyping && !m.isInitialInstruction && !m.isLoadingQuestionnaire
    )
    const history = filtered.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const lastMessage = filtered[filtered.length - 1]?.content ?? ''

    const getModel = (index: number) =>
      genAI.getGenerativeModel({
        model: MODELS[index] ?? MODELS[0],
        ...(systemInstruction ? { systemInstruction } : {}),
      })

    if (!stream) {
      let result: any
      for (let i = 0; i < MODELS.length; i++) {
        try {
          const chat = getModel(i).startChat({ history })
          result = await chat.sendMessage(lastMessage)
          break
        } catch (err: any) {
          if (i === MODELS.length - 1) throw err
        }
      }
      const content = result.response.text()
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    let streamResult: any
    for (let i = 0; i < MODELS.length; i++) {
      try {
        const chat = getModel(i).startChat({ history })
        streamResult = await chat.sendMessageStream(lastMessage)
        break
      } catch (err: any) {
        if (i === MODELS.length - 1) throw err
      }
    }

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamResult.stream) {
          const text = chunk.text()
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        ...corsHeaders(req),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
