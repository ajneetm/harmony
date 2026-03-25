export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
  isInitialInstruction?: boolean
  isLoadingQuestionnaire?: boolean
}

// AWS Lambda Function URL for real streaming
const LAMBDA_FUNCTION_URL = 'https://pm542m4qyu2ltw4gdhvpjadzgu0wdqme.lambda-url.eu-west-2.on.aws/'

// Streaming AI response function for AWS Lambda Function URL with real streaming
export const genAIResponseStream = async (
  data: {
      messages: Array<Message>
      systemPrompt?: { value: string; enabled: boolean }
  },
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  abortController?: AbortController // Optional abort controller for cancellation
) => {
  let controller = abortController || new AbortController();
  try {
    console.log('Making streaming request to AWS Lambda Function URL...');
    
    const response = await fetch(LAMBDA_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: data.messages,
        systemPrompt: data.systemPrompt
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    console.log('Starting to read streaming response...');

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream completed');
        onComplete();
        break;
      }

      // AWS Lambda Function URL with streaming sends chunks directly
      const chunk = decoder.decode(value);
      
      console.log('Received chunk:', chunk.length, 'characters');
      
      // Check for error messages
      if (chunk.startsWith('ERROR:')) {
        onError(chunk.substring(6).trim());
        return;
      }
      
      // Send each chunk directly to the UI for real-time display
      if (chunk) {
        onChunk(chunk);
      }
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('Streaming request aborted by user.');
      onError('Streaming stopped by user.');
    } else {
      console.error('Streaming AI request failed:', error);
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('An unknown error occurred.');
      }
    }
  }
}

// Fallback function for non-streaming requests (backward compatibility)
export const genAIResponse = async (data: {
  messages: Array<Message>
  systemPrompt?: { value: string; enabled: boolean }
}) => {
  try {
    console.log('Making fallback request to Lambda Function URL...');
    
    const response = await fetch(LAMBDA_FUNCTION_URL, {
      method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: data.messages,
        systemPrompt: data.systemPrompt
      })
    });

    console.log('Response received:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    // Check for error messages
    if (content.startsWith('ERROR:')) {
      throw new Error(content.substring(6).trim());
    }
    
    console.log('AI response received:', {
      contentLength: content.length
    });

    return {
      success: true,
      content: content
    };

  } catch (error) {
    console.error('Frontend AI request failed:', error);
    throw error;
  }
}

// Generate questionnaire questions from AI response using subscription prompts
export const generateQuestions = async (aiResponse: string, language: 'ar' | 'en' = 'en') => {
  try {
    console.log('Generating questionnaire questions using subscription prompts and AI response...');
    
    // Import the subscription prompts
    const { subscription_AR_PROMPT, subscription_EN_PROMPT } = await import('./subscription_prompts');
    
    // Get the appropriate subscription prompt based on language
    const subscriptionPrompt = language === 'ar' ? subscription_AR_PROMPT : subscription_EN_PROMPT;
    
    // Combine the subscription prompt with the AI response
    const combinedPrompt = language === 'ar' ? 
      `${subscriptionPrompt}

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

فقط قم بإرجاع الـ JSON object الكامل، لا تعيد أي أوامر أو تعليقات أو أي شيء آخر.` :
      `${subscriptionPrompt}

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

Only return the complete JSON object, do not return any commands, comments, or anything else.`;

    // Use non-streaming request with higher token limit for questionnaire generation
    const response = await fetch(LAMBDA_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: combinedPrompt
          }
        ],
        systemPrompt: {
          value: language === 'ar' ? 
            'أنت خبير في نموذج هارموني. قم بإنشاء 27 سؤالاً بالضبط بناءً على التحليل والإرشادات المقدمة. يجب أن تجيب بصيغة JSON صحيحة فقط. أرجع كائن JSON مع حقول "problem" و "questions". تأكد من أن JSON كامل ومنسق بشكل صحيح مع جميع الأسئلة الـ 27.' :
            'You are a Harmony model expert. Generate exactly 27 questions based on the provided analysis and subscription prompt. You must respond in valid JSON format only. Return a JSON object with "problem" and "questions" fields. Ensure the JSON is complete and properly formatted with all 27 questions.',
          enabled: true
        },
        stream: false, // Disable streaming for complete JSON response
        max_tokens: 4000, // Higher token limit for questionnaire generation
        response_format: { type: "json_object" } // Force JSON output mode
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    // Check for error messages
    if (content.startsWith('ERROR:')) {
      throw new Error(content.substring(6).trim());
    }
    
    console.log('Questions generated using subscription prompts:', {
      contentLength: content.length,
      preview: content.substring(0, 200) + '...'
    });

    // Parse the JSON response
    try {
      // Clean the response to ensure it's pure JSON
      let cleanContent = content.trim();
      
      // Remove any markdown formatting if present
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find the JSON object in the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      const jsonResponse = JSON.parse(cleanContent);
      
      // Validate the structure - handle both formats
      let questions = [];
      
      if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
        questions = jsonResponse.questions;
      } else {
        throw new Error('Invalid response format: missing questions array');
      }
      
      // Convert to the format expected by the Questionnaire component
      const formattedQuestions = questions.map((q: any, index: number) => ({
        id: index + 1,
        text: q.statement || q.text || q.question
      }));
      
      console.log(`Successfully generated ${formattedQuestions.length} questions`);
      return formattedQuestions;
      
    } catch (parseError) {
      console.error('Failed to parse questions JSON:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse questions from AI response');
    }

  } catch (error) {
    console.error('Failed to generate questions using subscription prompts:', error);
    throw error;
  }
}

// Generate report from questionnaire answers using report prompts
export const generateReport = async (answersData: any, chartData: any, language: 'ar' | 'en' = 'ar') => {
  try {
    console.log('Generating report from questionnaire answers with chart data...');
    
    // Import the report prompts
    const { getReportPrompt } = await import('./report_prompts');
    
    // Get the appropriate report prompt based on language
    const reportPrompt = getReportPrompt(language);
    
    // Format chart data as structured JSON for better AI processing
    const averages = chartData.overallAverages;
    
    // Find highest and lowest dimensions
    const dimensionData = [
      { key: 'cognitive', value: averages.cognitive, label_ar: 'الذهني', label_en: 'Cognitive' },
      { key: 'emotional', value: averages.emotional, label_ar: 'الحسي', label_en: 'Emotional' },
      { key: 'behavioral', value: averages.behavioral, label_ar: 'السلوكي', label_en: 'Behavioral' }
    ];
    
    dimensionData.sort((a, b) => b.value - a.value); // Sort by value descending
    const highest = dimensionData[0];
    const lowest = dimensionData[dimensionData.length - 1];
    
    // Find strongest and weakest individual elements across all dimensions
    const allElements = [
      ...chartData.cognitive.map((item: any) => ({ ...item, type: 'cognitive', type_ar: 'ذهني' })),
      ...chartData.emotional.map((item: any) => ({ ...item, type: 'emotional', type_ar: 'حسي' })),
      ...chartData.behavioral.map((item: any) => ({ ...item, type: 'behavioral', type_ar: 'سلوكي' }))
    ];
    
    allElements.sort((a, b) => b.value - a.value);
    const strongestElement = allElements[0];
    const weakestElement = allElements[allElements.length - 1];
    
    // Calculate balance gap
    const values = Object.values(averages);
    const balance_gap = Number((Math.max(...values) - Math.min(...values)).toFixed(2));
    
    const chartDataText = JSON.stringify({
      averages: {
        cognitive: Number(averages.cognitive.toFixed(2)),
        emotional: Number(averages.emotional.toFixed(2)),
        behavioral: Number(averages.behavioral.toFixed(2))
      },
      highest_dimension: {
        label_ar: highest.label_ar,
        label_en: highest.label_en,
        value: Number(highest.value.toFixed(2))
      },
      lowest_dimension: {
        label_ar: lowest.label_ar,
        label_en: lowest.label_en,
        value: Number(lowest.value.toFixed(2))
      },
      strongest_element: {
        dimension: strongestElement.dimension,
        type_ar: strongestElement.type_ar,
        type_en: strongestElement.type,
        value: Number(strongestElement.value.toFixed(2))
      },
      weakest_element: {
        dimension: weakestElement.dimension,
        type_ar: weakestElement.type_ar,
        type_en: weakestElement.type,
        value: Number(weakestElement.value.toFixed(2))
      },
      balance_gap: balance_gap
    }, null, 2);
    
    // 🐛 DEBUG LOG: Show the chart data being sent instead of raw answers
    console.log('=== 🐛 DEBUG: CHART DATA SENT TO AI ===');
    console.log(chartDataText);
    console.log('=== END CHART DATA ===');
    
    // Replace placeholder in prompt
    const fullPrompt = reportPrompt.replace('{CHART_DATA_PLACEHOLDER}', chartDataText);
    
    // 🐛 DEBUG LOG: Show the full prompt being sent to AI
    console.log('=== 🐛 DEBUG: FULL PROMPT SENT TO AI ===');
    console.log(fullPrompt);
    console.log('=== END FULL PROMPT ===');

    // Use non-streaming request for report generation
    const response = await fetch(LAMBDA_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        systemPrompt: {
          value: language === 'ar' ? 
            'أنت خبير في نموذج هارموني. قم بكتابة تقرير نفسي موجز وإنساني باللغة العربية بناءً على إجابات الاستبيان المقدمة.' :
            'You are a Harmony model expert. Write a brief and humane psychological report in English based on the provided questionnaire answers.',
          enabled: true
        },
        stream: false, // Disable streaming for complete response
        max_tokens: 2000, // Higher token limit for report generation
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    // Check for error messages
    if (content.startsWith('ERROR:')) {
      throw new Error(content.substring(6).trim());
    }
    
    // 🐛 DEBUG LOG: Show the final AI-generated report
    console.log('=== 🐛 DEBUG: FINAL AI-GENERATED REPORT ===');
    console.log(content.trim());
    console.log('=== END AI-GENERATED REPORT ===');
    
    console.log('Report generated successfully');
    return content.trim();

  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
}