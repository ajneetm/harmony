import { generateReport } from './ai'

// Interface definitions
interface QuestionWithAnswer {
  id: number
  text: string
  user_answer: number
  scale: Record<string, string>
  user_answer_text: string
  reversed?: boolean
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
  // Driver scores (mental=cognitive, emotional, existential=behavioral)
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
  radarPct: { cognitive: number; emotional: number; behavioral: number }
  radarLabels: {
    cognitive: string
    emotional: string
    behavioral: string
  }
  // World radars: العالم الداخلي / الفيزيائي / الوجودي
  worldRadarInner: ChartData[]
  worldRadarPhysical: ChartData[]
  worldRadarExistential: ChartData[]
  worldLabels: {
    inner: string
    physical: string
    existential: string
  }
  worldHarmony: number
  dominantWorld: string
  // World percentages (separate from driver percentages)
  worldMentalPct: number
  worldEmotionalPct: number
  worldExistentialPct: number
  // Additional harmony components
  driverHarmony: number
  fnHarmony: number
  actionPower: number
}

interface ReportData {
  aiResponse: string
  questionnaireData: QuestionnaireData
  chartData?: ReportChartData
}

/**
 * Processes questionnaire data to generate chart data for visualization.
 *
 * 27 questions = 9 functions × 3 driver types (M/E/B):
 *   answers[i*3]   = Mental/Cognitive driver for function i
 *   answers[i*3+1] = Emotional driver for function i
 *   answers[i*3+2] = Behavioral driver for function i
 *
 * 3 worlds (groups of 3 functions each):
 *   Inner World     = functions 0-2 (questions 0-8)
 *   Physical World  = functions 3-5 (questions 9-17)
 *   Existential World = functions 6-8 (questions 18-26)
 *
 * Key metrics:
 *   Driver %  = avg of 9 same-type answers / 5 * 100
 *   World %   = avg of 9 consecutive answers / 5 * 100
 *   Fi        = avg(M[i], E[i], B[i])
 *   Hd        = 100 - (max_driver% - min_driver%)
 *   Hw        = 100 - (max_world% - min_world%)
 *   H         = (Hd + Hw) / 2
 *   A         = avg(all Fi) = overall%
 *   P         = A × H / 100
 */
export const generateChartData = (data: QuestionnaireData): ReportChartData => {
  const { questions_with_answers, language } = data
  // Apply reverse scoring: for negatively-worded questions, flip the scale (6 - answer)
  const answers = questions_with_answers.map(q =>
    q.reversed ? Math.max(1, Math.min(5, 6 - q.user_answer)) : q.user_answer
  )

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

  // ── Driver answers (interleaved: M at i%3==0, E at i%3==1, B at i%3==2) ──
  const cognitiveAnswers  = answers.filter((_, i) => i % 3 === 0)   // M[0..8]
  const emotionalTypeAnswers = answers.filter((_, i) => i % 3 === 1) // E[0..8]
  const behavioralAnswers = answers.filter((_, i) => i % 3 === 2)    // B[0..8]

  // Driver percentages (max 45 per driver = 9 questions × max 5)
  const driverMentalPct    = Math.round(sum(cognitiveAnswers)       / 45 * 100)
  const driverEmotionalPct = Math.round(sum(emotionalTypeAnswers)   / 45 * 100)
  const driverBehavioralPct = Math.round(sum(behavioralAnswers)     / 45 * 100)

  // ── World answers (consecutive blocks of 9) ──
  const internalWorldAnswers    = answers.slice(0, 9)
  const physicalWorldAnswers    = answers.slice(9, 18)
  const existentialWorldAnswers = answers.slice(18, 27)

  // World percentages
  const worldMentalPct      = Math.round(sum(internalWorldAnswers)    / 45 * 100)
  const worldEmotionalPct   = Math.round(sum(physicalWorldAnswers)    / 45 * 100)
  const worldExistentialPct = Math.round(sum(existentialWorldAnswers) / 45 * 100)

  // ── Overall (A = action average = avg of all function scores) ──
  const overall = Math.round(sum(answers) / 135 * 100)

  // ── Harmony (driver + world components) ──
  const driverHarmony = Math.max(0, 100 - (
    Math.max(driverMentalPct, driverEmotionalPct, driverBehavioralPct) -
    Math.min(driverMentalPct, driverEmotionalPct, driverBehavioralPct)
  ))
  const worldHarmonyVal = Math.max(0, 100 - (
    Math.max(worldMentalPct, worldEmotionalPct, worldExistentialPct) -
    Math.min(worldMentalPct, worldEmotionalPct, worldExistentialPct)
  ))
  // ── Function names (9 functions, in world order) ──
  const functionNames = language === 'ar'
    ? ['الإدراك', 'الجاهزية', 'النية', 'الفعل', 'التفاعل', 'الناتج', 'الاستقبال', 'التطور', 'التشكيل']
    : ['Perception', 'Readiness', 'Intention', 'Action', 'Interaction', 'Outcome', 'Reception', 'Evolution', 'Formation']

  const elementNames = {
    mental:      functionNames.slice(0, 3),
    emotional:   functionNames.slice(3, 6),
    existential: functionNames.slice(6, 9),
  }

  // ── World elements (Fi per function = avg of 3 driver answers) ──
  const calcElements = (dimAnswers: number[], names: string[]): ChartData[] =>
    names.map((name, i) => ({
      dimension: name,
      value: (dimAnswers[i * 3] + dimAnswers[i * 3 + 1] + dimAnswers[i * 3 + 2]) / 3,
    }))

  const mentalElements      = calcElements(internalWorldAnswers,    elementNames.mental)
  const emotionalElements   = calcElements(physicalWorldAnswers,    elementNames.emotional)
  const existentialElements = calcElements(existentialWorldAnswers, elementNames.existential)

  // All 9 functions ranked by score
  const allElements: ElementData[] = [
    ...mentalElements.map(e      => ({ name: e.dimension, score: e.value, dimension: 'mental'      as const })),
    ...emotionalElements.map(e   => ({ name: e.dimension, score: e.value, dimension: 'emotional'   as const })),
    ...existentialElements.map(e => ({ name: e.dimension, score: e.value, dimension: 'existential' as const })),
  ].sort((a, b) => b.score - a.score)

  // Function harmony: spread between highest and lowest function efficiency (scale: 1→0%, 5→100%)
  const fnEfficiencies = allElements.map(e => (e.score - 1) / 4 * 100).filter(n => isFinite(n))
  const fnHarmony = fnEfficiencies.length >= 2
    ? Math.max(0, Math.round(100 - (Math.max(...fnEfficiencies) - Math.min(...fnEfficiencies))))
    : 0

  // Overall harmony = average of 3 harmony components
  const harmony = Math.round((driverHarmony + worldHarmonyVal + fnHarmony) / 3)

  // Action Power
  const actionPower = Math.round(overall * harmony / 100)

  // Labels for the 3 driver types (match the radar chart titles)
  const typeLabels = {
    mental:      language === 'ar' ? 'الذهني'      : 'Mental',
    emotional:   language === 'ar' ? 'المشاعري'    : 'Emotional',
    existential: language === 'ar' ? 'السلوكي'     : 'Behavioral',
  }

  // ── 9-axis radar data (one radar per driver type, 9 axes = 9 functions) ──
  // Always use English keys so RadarChart's internal lookup matches
  const radarDimensions = [
    'Perception', 'Readiness', 'Intention', 'Action', 'Interaction',
    'Response', 'Reception', 'Evolution', 'Mental Image'
  ]

  const radarGroups = {
    cognitive: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    emotional: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    behavioral: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
  }
  const radarGroupsRaw = {
    cognitive: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    emotional: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
    behavioral: Array(9).fill(0).map(() => ({ total: 0, count: 0 })),
  }

  questions_with_answers.forEach((q, index) => {
    const worldIndex        = Math.floor(index / 9)
    const elementIndex      = Math.floor((index % 9) / 3)
    const typeIndex         = index % 3
    const globalElementIndex = worldIndex * 3 + elementIndex
    const types = ['cognitive', 'emotional', 'behavioral'] as const
    radarGroups[types[typeIndex]][globalElementIndex].total    += answers[index]   // effective
    radarGroupsRaw[types[typeIndex]][globalElementIndex].total += q.user_answer    // raw (for coherence)
    radarGroups[types[typeIndex]][globalElementIndex].count    += 1
    radarGroupsRaw[types[typeIndex]][globalElementIndex].count += 1
  })

  const buildRadarData = (group: { total: number; count: number }[]): ChartData[] =>
    radarDimensions.map((dimension, i) => ({
      dimension,
      value: group[i].count > 0 ? group[i].total / group[i].count : 0,
    }))

  // ── World radars (3 axes each = 3 functions per world) ──
  const buildWorldRadar = (dimAnswers: number[], names: string[]): ChartData[] =>
    names.map((name, i) => ({
      dimension: name,
      value: (dimAnswers[i * 3] + dimAnswers[i * 3 + 1] + dimAnswers[i * 3 + 2]) / 3,
    }))

  const worldRadarInner       = buildWorldRadar(internalWorldAnswers,    elementNames.mental)
  const worldRadarPhysical    = buildWorldRadar(physicalWorldAnswers,    elementNames.emotional)
  const worldRadarExistential = buildWorldRadar(existentialWorldAnswers, elementNames.existential)

  const worldLabels = {
    inner:       language === 'ar' ? 'العالم الداخلي'   : 'Inner World',
    physical:    language === 'ar' ? 'العالم الخارجي'   : 'Physical World',
    existential: language === 'ar' ? 'العالم الوجودي'   : 'Existential World',
  }

  const worldPcts   = [worldMentalPct, worldEmotionalPct, worldExistentialPct]
  const worldNames  = [worldLabels.inner, worldLabels.physical, worldLabels.existential]
  const dominantWorld = worldNames[worldPcts.indexOf(Math.max(...worldPcts))]

  const radarPct = {
    cognitive:  driverMentalPct,
    emotional:  driverEmotionalPct,
    behavioral: driverBehavioralPct,
  }

  return {
    // Driver percentages (match the 3 radar chart labels)
    mental:      { percentage: driverMentalPct,    elements: mentalElements },
    emotional:   { percentage: driverEmotionalPct, elements: emotionalElements },
    existential: { percentage: driverBehavioralPct, elements: existentialElements },
    harmony,
    overall,
    allElements,
    typeLabels,
    radarCognitive:     buildRadarData(radarGroups.cognitive),
    radarEmotional:     buildRadarData(radarGroups.emotional),
    radarBehavioral:    buildRadarData(radarGroups.behavioral),
    radarRawCognitive:  buildRadarData(radarGroupsRaw.cognitive),
    radarRawEmotional:  buildRadarData(radarGroupsRaw.emotional),
    radarRawBehavioral: buildRadarData(radarGroupsRaw.behavioral),
    radarPct,
    radarLabels: {
      cognitive:  language === 'ar' ? 'الذهني'   : 'Cognitive',
      emotional:  language === 'ar' ? 'المشاعري' : 'Emotional',
      behavioral: language === 'ar' ? 'السلوكي'  : 'Behavioral',
    },
    worldRadarInner,
    worldRadarPhysical,
    worldRadarExistential,
    worldLabels,
    worldHarmony: worldHarmonyVal,
    dominantWorld,
    worldMentalPct,
    worldEmotionalPct,
    worldExistentialPct,
    driverHarmony,
    fnHarmony,
    actionPower,
  }
}

/**
 * Generates AI report and navigates to it in the same tab
 */
export const generateAndOpenReport = async (
  data: QuestionnaireData,
  _visualizationElement?: HTMLElement,
  chatId?: string,
  saveReportToConvex?: (id: string, reportJson: string) => Promise<void>
): Promise<void> => {
  try {
    const chartData = generateChartData(data)
    const aiResponse = await generateReport(data, chartData, data.language)

    if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
      throw new Error('Empty AI response received')
    }

    const reportData: ReportData = {
      aiResponse: aiResponse.trim(),
      questionnaireData: data,
      chartData
    }

    sessionStorage.setItem('reportData', JSON.stringify(reportData))

    const reportJson = JSON.stringify(reportData)
    if (chatId) {
      try { localStorage.setItem(`report-${chatId}`, reportJson) } catch { /* ignore quota errors */ }
      if (saveReportToConvex) {
        try { await saveReportToConvex(chatId, reportJson) } catch { /* non-critical */ }
      }
    }

    const reportUrl = chatId ? `?page=report&chatId=${encodeURIComponent(chatId)}` : '?page=report'
    window.location.href = window.location.origin + '/' + reportUrl

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
  if (isLifeQuestionnaire)    return 'life'
  if (isFamilyQuestionnaire)  return 'family'
  if (isRomanticQuestionnaire) return 'romantic'
  if (isWorkQuestionnaire)    return 'work'
  return 'general'
}

export const generateReportFilename = (data: QuestionnaireData): string => {
  const dateTimestamp = new Date().toISOString().slice(0, 10)
  const type = detectQuestionnaireType(data)
  const isArabic = data.language === 'ar'
  const fileNames = {
    life:     isArabic ? 'تقرير_علاقتي_بالحياة'    : 'life_relationship_report',
    family:   isArabic ? 'تقرير_علاقتي_بالأسرة'    : 'family_relationship_report',
    romantic: isArabic ? 'تقرير_علاقتي_الحسية'     : 'romantic_relationship_report',
    work:     isArabic ? 'تقرير_علاقتي_بالعمل'     : 'work_relationship_report',
    general:  isArabic ? 'تقرير_التحليل_النفسي'    : 'psychological_analysis_report'
  }
  return `${fileNames[type as keyof typeof fileNames]}_${dateTimestamp}.pdf`
}
