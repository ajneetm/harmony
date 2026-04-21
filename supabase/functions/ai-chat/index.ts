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
      // Non-streaming
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Streaming — SSE
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
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
