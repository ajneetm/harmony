import { generateReport } from './ai'

// Interface definitions
interface QuestionWithAnswer {
  id: number
  text: string
  user_answer: number
  scale: Record<string, string>
  user_answer_text: string
}

interface QuestionnaireData {
  questionnaire_id: number
  submission_time: string
  language: 'ar' | 'en'
  questions_with_answers: QuestionWithAnswer[]
  total_questions: number
  answered_questions: number
}

interface ChartData {
  dimension: string
  value: number
}

interface ElementData {
  name: string
  score: number
  dimension: 'mental' | 'emotional' | 'existential'
}

interface DimensionData {
  percentage: number
  elements: ChartData[]
}

export interface ReportChartData {
  // New dimensional scores (for numbers, AI, percentages display)
  mental: DimensionData
  emotional: DimensionData
  existential: DimensionData
  harmony: number
  overall: number
  allElements: ElementData[]
  typeLabels: {
    mental: string
    emotional: string
    existential: string
  }
  // Original 9-axis chart data (for radar visualization)
  radarCognitive: ChartData[]
  radarEmotional: ChartData[]
  radarBehavioral: ChartData[]
  radarLabels: {
    cognitive: string
    emotional: string
    behavioral: string
  }
}

interface ReportData {
  aiResponse: string
  questionnaireData: QuestionnaireData
  chartData?: ReportChartData
}

/**
 * Processes questionnaire data to generate chart data for visualization
 * 3 dimensions: Mental (Q1-9), Emotional (Q10-18), Existential (Q19-27)
 * Each dimension score = sum / 45 * 100
 * Harmony = 100 - (max_dim% - min_dim%)
 * Overall = total_sum / 135 * 100
 */
export const generateChartData = (data: QuestionnaireData): ReportChartData => {
  const { questions_with_answers, language } = data
  const answers = questions_with_answers.map(q => q.user_answer)

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

  // Split into 3 dimensions
  const mentalAnswers = answers.slice(0, 9)
  const emotionalAnswers = answers.slice(9, 18)
  const existentialAnswers = answers.slice(18, 27)

  // Dimension percentages (max 45 per dimension)
  const mentalPct = Math.round(sum(mentalAnswers) / 45 * 100)
  const emotionalPct = Math.round(sum(emotionalAnswers) / 45 * 100)
  const existentialPct = Math.round(sum(existentialAnswers) / 45 * 100)


  // Overall: total / 135 * 100
  const overall = Math.round(sum(answers) / 135 * 100)

  // Function names per language (9 functions total)
  const functionNames = language === 'ar'
    ? ['الإدراك', 'الجاهزية', 'النية', 'الفعل', 'التفاعل', 'الاستجابة', 'الاستقبال', 'التطور', 'التشكل']
    : ['Perception', 'Readiness', 'Intention', 'Action', 'Interaction', 'Response', 'Reception', 'Evolution', 'Effect']

  // Each function has 3 indicators: answers[i*3]=Mental, [i*3+1]=Emotional, [i*3+2]=Behavioral
  // Function average = mean of 3 indicators
  // Function harmony = 100 - (gap × 25), where gap = max - min of 3 indicators
  const functions = functionNames.map((name, i) => {
    const a = answers[i * 3], b = answers[i * 3 + 1], c = answers[i * 3 + 2]
    const score = (a + b + c) / 3
    const gap = Math.max(a, b, c) - Math.min(a, b, c)
    const functionHarmony = Math.max(0, 100 - gap * 25)
    return { name, score, functionHarmony }
  })

  // Overall harmony = average of all 9 function harmonies
  const harmony = Math.round(functions.reduce((s, f) => s + f.functionHarmony, 0) / 9)

  // Map functions back to dimensions for radar charts
  const elementNames = {
    mental:      functionNames.slice(0, 3),
    emotional:   functionNames.slice(3, 6),
    existential: functionNames.slice(6, 9),
  }

  const calcElements = (dimAnswers: number[], names: string[]): ChartData[] =>
    names.map((name, i) => ({
      dimension: name,
      value: (dimAnswers[i * 3] + dimAnswers[i * 3 + 1] + dimAnswers[i * 3 + 2]) / 3,
    }))

  const mentalElements     = calcElements(mentalAnswers,      elementNames.mental)
  const emotionalElements  = calcElements(emotionalAnswers,   elementNames.emotional)
  const existentialElements = calcElements(existentialAnswers, elementNames.existential)

  // All elements ranked by score
  const allElements: ElementData[] = [
    ...mentalElements.map(e => ({ name: e.dimension, score: e.value, dimension: 'mental' as const })),
    ...emotionalElements.map(e => ({ name: e.dimension, score: e.value, dimension: 'emotional' as const })),
    ...existentialElements.map(e => ({ name: e.dimension, score: e.value, dimension: 'existential' as const })),
  ].sort((a, b) => b.score - a.score)

  const typeLabels = {
    mental: language === 'ar' ? 'الذهني' : 'Mental',
    emotional: language === 'ar' ? 'المشاعري / التفاعلي' : 'Emotional / Interactive',
    existential: language === 'ar' ? 'السلوكي' : 'Existential',
  }

  // ── Original 9-axis radar data (cognitive / emotional / behavioral) ──
  // Structure: 27 questions = 3 worlds × 3 elements × 3 types
  // typeIndex = question index % 3  (0=cognitive, 1=emotional, 2=behavioral)
  // elementIndex within each world = Math.floor((index % 9) / 3)
  const radarDimensions = functionNames

  const radarGroups = {
    cognitive: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    emotional: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    behavioral: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
  }

  questions_with_answers.forEach((q, index) => {
    const worldIndex = Math.floor(index / 9)
    const elementIndex = Math.floor((index % 9) / 3)
    const typeIndex = index % 3
    const globalElementIndex = worldIndex * 3 + elementIndex
    const types = ['cognitive', 'emotional', 'behavioral'] as const
    radarGroups[types[typeIndex]][globalElementIndex].total += q.user_answer
    radarGroups[types[typeIndex]][globalElementIndex].count += 1
  })

  const buildRadarData = (group: { total: number; count: number }[]): ChartData[] =>
    radarDimensions.map((dimension, i) => ({
      dimension,
      value: group[i].count > 0 ? group[i].total / group[i].count : 0,
    }))

  return {
    mental: { percentage: mentalPct, elements: mentalElements },
    emotional: { percentage: emotionalPct, elements: emotionalElements },
    existential: { percentage: existentialPct, elements: existentialElements },
    harmony,
    overall,
    allElements,
    typeLabels,
    radarCognitive: buildRadarData(radarGroups.cognitive),
    radarEmotional: buildRadarData(radarGroups.emotional),
    radarBehavioral: buildRadarData(radarGroups.behavioral),
    radarLabels: {
      cognitive: language === 'ar' ? 'الذهني' : 'Cognitive',
      emotional: language === 'ar' ? 'المشاعري' : 'Emotional',
      behavioral: language === 'ar' ? 'السلوكي' : 'Existential',
    },
  }
}

/**
 * Generates AI report and navigates to it in the same tab
 * @param data - Questionnaire data with answers
 * @param visualizationElement - Optional DOM element containing charts/visualizations (not used anymore)
 * @param chatId - Optional chat ID to return to after closing the report
 * @returns Promise<void>
 */
export const generateAndOpenReport = async (
  data: QuestionnaireData,
  visualizationElement?: HTMLElement,
  chatId?: string
): Promise<void> => {
  try {
    console.log('Starting report generation process...')
    console.log('Received chatId:', chatId);
    
    // 🐛 DEBUG LOG: Show the complete questionnaire data structure
    console.log('=== 🐛 DEBUG: QUESTIONNAIRE DATA STRUCTURE ===');
    console.log('Language:', data.language);
    console.log('Total Questions:', data.total_questions);
    console.log('Answered Questions:', data.answered_questions);
    console.log('Questions with Answers:');
    data.questions_with_answers.forEach((q, index) => {
      console.log(`${index + 1}. ${q.text}`);
      console.log(`   Answer: ${q.user_answer}/5 (${q.user_answer_text})`);
    });
    console.log('=== END QUESTIONNAIRE DATA ===');
    
    // Step 1: Generate chart data for visualization first
    console.log('Processing chart data...')
    const chartData = generateChartData(data)
    
    // Step 2: Generate AI report content using chart data
    console.log('Generating AI report content...')
    const aiResponse = await generateReport(data, chartData, data.language)
    
    if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
      throw new Error('Empty AI response received')
    }
    
    // 🐛 DEBUG LOG: Show the 3 charts data
    console.log('=== 🐛 DEBUG: 3 CHARTS DATA ===');
    console.log('MENTAL:', chartData.mental);
    console.log('EMOTIONAL:', chartData.emotional);
    console.log('EXISTENTIAL:', chartData.existential);
    console.log('OVERALL:', chartData.overall, '% | HARMONY:', chartData.harmony, '%');
    console.log('ALL ELEMENTS RANKED:', chartData.allElements);
    console.log('=== END CHARTS DATA ===');
    
    // Step 3: Prepare complete report data
    const reportData: ReportData = {
      aiResponse: aiResponse.trim(),
      questionnaireData: data,
      chartData
    }
    
    // Step 4: Store complete report data
    sessionStorage.setItem('reportData', JSON.stringify(reportData))
    
    // Step 5: Navigate to report in same tab with chatId if provided
    console.log('Navigating to report page...')
    const reportUrl = chatId ? `?page=report&chatId=${encodeURIComponent(chatId)}` : '?page=report'
    console.log('Report URL:', reportUrl);
    
    // Use the proper URL structure for the query parameter routing system
    window.location.href = window.location.origin + '/' + reportUrl
    
    console.log('Report generation completed successfully')
    
  } catch (error) {
    console.error('Error generating report:', error)
    throw new Error(
      data.language === 'ar' 
        ? 'فشل في إنشاء التقرير. يرجى المحاولة مرة أخرى.'
        : 'Failed to generate report. Please try again.'
    )
  }
}

/**
 * Formats questionnaire answers for display in report
 * @param data - Questionnaire data
 * @returns Formatted string of questions and answers
 */
export const formatAnswersForReport = (data: QuestionnaireData): string => {
  const { questions_with_answers, language } = data

  return questions_with_answers
    .map((q) => {
      const answer = q.user_answer
      const answerText = q.user_answer_text || (language === 'ar' 
        ? ['ضعيف جداً', 'ضعيف', 'متوسط', 'جيد', 'ممتاز'][answer - 1]
        : ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][answer - 1])
      
      return `${language === 'ar' ? 'السؤال' : 'Question'} ${q.id}: ${q.text}\n${language === 'ar' ? 'الإجابة' : 'Answer'}: ${answerText} (${answer}/5)`
    })
    .join('\n\n')
}

/**
 * Detects questionnaire type based on question content
 * @param data - Questionnaire data
 * @returns Questionnaire type identifier
 */
export const detectQuestionnaireType = (data: QuestionnaireData): string => {
  const isLifeQuestionnaire = data.questions_with_answers?.some(q => 
    q.text?.includes('حياة') || q.text?.includes('life') || q.text?.includes('live')
  )
  const isFamilyQuestionnaire = data.questions_with_answers?.some(q => 
    q.text?.includes('أسرت') || q.text?.includes('العائلة') || q.text?.includes('family')
  )
  const isRomanticQuestionnaire = data.questions_with_answers?.some(q => 
    q.text?.includes('شريك') || q.text?.includes('علاقت') || q.text?.includes('حب') || 
    q.text?.includes('partner') || q.text?.includes('relationship') || q.text?.includes('love')
  )
  const isWorkQuestionnaire = data.questions_with_answers?.some(q => 
    q.text?.includes('عمل') || q.text?.includes('مهن') || q.text?.includes('وظيف') || 
    q.text?.includes('work') || q.text?.includes('job') || q.text?.includes('profession')
  )
  
  if (isLifeQuestionnaire) return 'life'
  if (isFamilyQuestionnaire) return 'family'
  if (isRomanticQuestionnaire) return 'romantic'
  if (isWorkQuestionnaire) return 'work'
  return 'general'
}

/**
 * Generates filename based on questionnaire type and language
 * @param data - Questionnaire data
 * @returns Generated filename
 */
export const generateReportFilename = (data: QuestionnaireData): string => {
  const dateTimestamp = new Date().toISOString().slice(0, 10)
  const type = detectQuestionnaireType(data)
  const isArabic = data.language === 'ar'
  
  const fileNames = {
    life: isArabic ? 'تقرير_علاقتي_بالحياة' : 'life_relationship_report',
    family: isArabic ? 'تقرير_علاقتي_بالأسرة' : 'family_relationship_report',
    romantic: isArabic ? 'تقرير_علاقتي_الحسية' : 'romantic_relationship_report',
    work: isArabic ? 'تقرير_علاقتي_بالعمل' : 'work_relationship_report',
    general: isArabic ? 'تقرير_التحليل_النفسي' : 'psychological_analysis_report'
  }
  
  return `${fileNames[type as keyof typeof fileNames]}_${dateTimestamp}.pdf`
} 