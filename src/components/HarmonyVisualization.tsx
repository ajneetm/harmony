import React from 'react'
import { CircularChart } from './CircularChart'

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

interface HarmonyVisualizationProps {
  data: QuestionnaireData
}

// Harmony Model structure mapping
const HARMONY_STRUCTURE = {
  // Inner World (العالم الداخلي)
  inner: {
    perception: { ar: 'الإدراك', en: 'Perception' },
    readiness: { ar: 'الجاهزية', en: 'Readiness' },
    intention: { ar: 'النية', en: 'Intention' }
  },
  // External World (العالم الخارجي)
  external: {
    action: { ar: 'الفعل', en: 'Action' },
    interaction: { ar: 'التفاعل', en: 'Interaction' },
    response: { ar: 'الاستجابة', en: 'Response' }
  },
  // Perceptual World (العالم التصوري)
  perceptual: {
    reception: { ar: 'الاستقبال', en: 'Reception' },
    evolution: { ar: 'التطور', en: 'Evolution' },
    mentalImage: { ar: 'التشكيل', en: 'Mental Image' }
  }
}

const HarmonyVisualization: React.FC<HarmonyVisualizationProps> = ({ data }) => {
  const { questions_with_answers, language } = data
  
  // Helper function to map question to its category based on content and position
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
  
  processedData.forEach((item) => {
    const index = elementToIndex[item.element as keyof typeof elementToIndex]
    if (index !== undefined) {
      groupedData[item.type as keyof typeof groupedData][index].total += item.score
      groupedData[item.type as keyof typeof groupedData][index].count += 1
    }
  })
  
  // Calculate averages
  const averages = {
    cognitive: groupedData.cognitive.map(item => item.count > 0 ? item.total / item.count : 0),
    emotional: groupedData.emotional.map(item => item.count > 0 ? item.total / item.count : 0),
    behavioral: groupedData.behavioral.map(item => item.count > 0 ? item.total / item.count : 0)
  }
  
  // Labels for the 9 subdimensions
  const subdimensionLabels = {
    ar: [
      'الإدراك', 'الجاهزية', 'النية',
      'الفعل', 'التفاعل', 'الاستجابة',
      'الاستقبال', 'التطور', 'التشكيل'
    ],
    en: [
      'Perception', 'Readiness', 'Intention',
      'Action', 'Interaction', 'Response',
      'Reception', 'Evolution', 'Mental Image'
    ]
  }
  
  const labels = subdimensionLabels[language]
  
  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-8 text-center">
        {language === 'ar' ? 'تحليل هارموني البصري' : 'Harmony Visual Analysis'}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cognitive Chart */}
        <CircularChart
          title={language === 'ar' ? 'الذهني' : 'Cognitive'}
          values={averages.cognitive}
          labels={labels}
          language={language}
        />
        
        {/* Emotional Chart */}
        <CircularChart
          title={language === 'ar' ? 'الشعوري' : 'Emotional'}
          values={averages.emotional}
          labels={labels}
          language={language}
        />
        
        {/* Behavioral Chart */}
        <CircularChart
          title={language === 'ar' ? 'السلوكي' : 'Behavioral'}
          values={averages.behavioral}
          labels={labels}
          language={language}
        />
      </div>
      
      {/* Summary Section */}
      <div className="mt-8 bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {language === 'ar' ? 'ملخص النتائج' : 'Results Summary'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800 rounded p-4">
            <h4 className="font-medium text-white mb-2">
              {language === 'ar' ? 'الذهني' : 'Cognitive'}
            </h4>
            <p className="text-gray-300">
              {language === 'ar' ? 'المتوسط: ' : 'Average: '}
              <span className="font-bold text-white">
                {(averages.cognitive.reduce((a, b) => a + b, 0) / averages.cognitive.length).toFixed(1)}
              </span>
            </p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <h4 className="font-medium text-white mb-2">
              {language === 'ar' ? 'الشعوري' : 'Emotional'}
            </h4>
            <p className="text-gray-300">
              {language === 'ar' ? 'المتوسط: ' : 'Average: '}
              <span className="font-bold text-white">
                {(averages.emotional.reduce((a, b) => a + b, 0) / averages.emotional.length).toFixed(1)}
              </span>
            </p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <h4 className="font-medium text-white mb-2">
              {language === 'ar' ? 'السلوكي' : 'Behavioral'}
            </h4>
            <p className="text-gray-300">
              {language === 'ar' ? 'المتوسط: ' : 'Average: '}
              <span className="font-bold text-white">
                {(averages.behavioral.reduce((a, b) => a + b, 0) / averages.behavioral.length).toFixed(1)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HarmonyVisualization 
