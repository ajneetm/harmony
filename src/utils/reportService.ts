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

interface ReportChartData {
  cognitive: ChartData[]
  emotional: ChartData[]
  behavioral: ChartData[]
  typeLabels: {
    cognitive: string
    emotional: string
    behavioral: string
  }
  overallAverages: {
    cognitive: number
    emotional: number
    behavioral: number
  }
}

interface ReportData {
  aiResponse: string
  questionnaireData: QuestionnaireData
  chartData?: ReportChartData
}

/**
 * Processes questionnaire data to generate chart data for visualization
 * @param data - Questionnaire data with answers
 * @returns Chart data for radar visualization
 */
export const generateChartData = (data: QuestionnaireData): ReportChartData => {
  const { questions_with_answers, language } = data

  // Helper function to map question to its category based on position
  const mapQuestionToCategory = (question: QuestionWithAnswer, index: number) => {
    // Based on the Harmony Model structure: 27 questions = 3 worlds × 3 elements × 3 types
    // Questions 1-9: Inner World, 10-18: External World, 19-27: Perceptual World
    // Within each world: 3 questions per element (cognitive, emotional, behavioral)
    
    const worldIndex = Math.floor(index / 9) // 0=inner, 1=external, 2=perceptual
    const elementIndex = Math.floor((index % 9) / 3) // 0=first element, 1=second, 2=third
    const typeIndex = index % 3 // 0=cognitive, 1=emotional, 2=behavioral
    
    const worlds = ['inner', 'external', 'perceptual']
    const elements = ['perception', 'readiness', 'intention', 'action', 'interaction', 'response', 'reception', 'evolution', 'mentalImage']
    const types = ['cognitive', 'emotional', 'behavioral']
    
    return {
      world: worlds[worldIndex],
      element: elements[worldIndex * 3 + elementIndex],
      type: types[typeIndex],
      score: question.user_answer
    }
  }
  
  // Process questions and group by type
  const processedData = questions_with_answers.map(mapQuestionToCategory)
  
  // Group by type and calculate averages for each subdimension
  const groupedData = {
    cognitive: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    emotional: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    behavioral: Array(9).fill(0).map(() => ({ total: 0, count: 0 }))
  }
  
  // Element mapping to array indices
  const elementToIndex = {
    perception: 0, readiness: 1, intention: 2,
    action: 3, interaction: 4, response: 5,
    reception: 6, evolution: 7, mentalImage: 8
  }
  
  // Dimension names in order
  const dimensions = [
    'Perception', 'Readiness', 'Intention',
    'Action', 'Interaction', 'Response',
    'Reception', 'Evolution', 'Mental Image'
  ]
  
  processedData.forEach((item) => {
    const index = elementToIndex[item.element as keyof typeof elementToIndex]
    if (index !== undefined) {
      groupedData[item.type as keyof typeof groupedData][index].total += item.score
      groupedData[item.type as keyof typeof groupedData][index].count += 1
    }
  })
  
  // Calculate averages and prepare radar chart data
  const prepareRadarData = (typeData: { total: number; count: number }[]) => {
    return dimensions.map((dimension, index) => ({
      dimension,
      value: typeData[index].count > 0 ? typeData[index].total / typeData[index].count : 0
    }))
  }
  
  const cognitiveData = prepareRadarData(groupedData.cognitive)
  const emotionalData = prepareRadarData(groupedData.emotional)
  const behavioralData = prepareRadarData(groupedData.behavioral)
  
  // Calculate overall averages for summary
  const calculateOverallAverage = (data: ChartData[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return data.length > 0 ? total / data.length : 0
  }
  
  const overallAverages = {
    cognitive: calculateOverallAverage(cognitiveData),
    emotional: calculateOverallAverage(emotionalData),
    behavioral: calculateOverallAverage(behavioralData)
  }
  
  const typeLabels = {
    cognitive: language === 'ar' ? 'الذهني' : 'Cognitive',
    emotional: language === 'ar' ? 'الحسي' : 'Emotional',
    behavioral: language === 'ar' ? 'السلوكي' : 'Behavioral'
  }
  
  return {
    cognitive: cognitiveData,
    emotional: emotionalData,
    behavioral: behavioralData,
    typeLabels,
    overallAverages
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
    console.log('COGNITIVE CHART:', chartData.cognitive);
    console.log('EMOTIONAL CHART:', chartData.emotional);
    console.log('BEHAVIORAL CHART:', chartData.behavioral);
    console.log('OVERALL AVERAGES:', chartData.overallAverages);
    console.log('TYPE LABELS:', chartData.typeLabels);
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