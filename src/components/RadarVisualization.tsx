import React, { useRef, useState } from 'react'
import { Download } from 'lucide-react'
import RadarChart from './RadarChart'
import { generateAndOpenReport } from '../utils/reportService'
import { useConversations } from '../store'

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

interface RadarVisualizationProps {
  data: QuestionnaireData
}

const RadarVisualization: React.FC<RadarVisualizationProps> = ({ data }) => {
  const { questions_with_answers, language } = data
  const visualizationRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const { currentConversationId } = useConversations()
  
  // Debug the conversation ID
  console.log('=== RADAR VISUALIZATION DEBUG ===');
  console.log('RadarVisualization currentConversationId:', currentConversationId);
  console.log('Type:', typeof currentConversationId);
  console.log('==================================');
  
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
  const calculateOverallAverage = (data: { dimension: string; value: number }[]) => {
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
    emotional: language === 'ar' ? 'الشعوري' : 'Emotional',
    behavioral: language === 'ar' ? 'السلوكي' : 'Behavioral'
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      console.log('=== REPORT GENERATION DEBUG ===');
      console.log('Current conversation ID:', currentConversationId);
      console.log('Type of currentConversationId:', typeof currentConversationId);
      console.log('Is currentConversationId null?', currentConversationId === null);
      console.log('Is currentConversationId undefined?', currentConversationId === undefined);
      console.log('Is currentConversationId empty string?', currentConversationId === '');
      console.log('================================');
      
      await generateAndOpenReport(data, visualizationRef.current || undefined, currentConversationId || undefined)
    } catch (error) {
      console.error('Error generating report:', error)
      // Show user-friendly error message
      alert(
        language === 'ar' 
          ? 'عذراً، حدث خطأ في إنشاء التقرير. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred while generating the report. Please try again.'
      )
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div ref={visualizationRef} className="w-full max-w-7xl mx-auto p-6">
      {/* Header with title and desktop button */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">
          {language === 'ar' ? 'نتائج التقييم' : 'Assessment Results'}
        </h2>
        
        {/* PDF Download Button - Desktop only */}
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            isGeneratingPDF
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg shadow-red-500/50 shadow-lg animate-pulse hover:animate-none'
          }`}
          title={language === 'ar' ? 'تحميل تقرير التحليل النفسي' : 'Download Psychological Analysis Report'}
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">
                {language === 'ar' ? 'جاري التحليل وإنشاء التقرير...' : 'Analyzing & Generating Report...'}
              </span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span className="text-sm">
                {language === 'ar' ? 'تحميل التقرير' : 'Download Report'}
              </span>
            </>
          )}
        </button>
      </div>
      
      {/* Radar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <RadarChart
          title={typeLabels.cognitive}
          color="#22c55e"
          data={cognitiveData}
          language={language}
        />
        <RadarChart
          title={typeLabels.emotional}
          color="#ae1f23"
          data={emotionalData}
          language={language}
        />
        <RadarChart
          title={typeLabels.behavioral}
          color="#3b82f6"
          data={behavioralData}
          language={language}
        />
      </div>
      
      {/* Summary Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {language === 'ar' ? 'ملخص النتائج' : 'Results Summary'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-white font-medium">{typeLabels.cognitive}</span>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">
              {overallAverages.cognitive.toFixed(1)}/5
            </p>
            <p className="text-gray-300 text-sm">
              {language === 'ar' ? 'المتوسط العام' : 'Overall Average'}
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-white font-medium">{typeLabels.emotional}</span>
            </div>
            <p className="text-2xl font-bold text-red-400 mt-2">
              {overallAverages.emotional.toFixed(1)}/5
            </p>
            <p className="text-gray-300 text-sm">
              {language === 'ar' ? 'المتوسط العام' : 'Overall Average'}
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-white font-medium">{typeLabels.behavioral}</span>
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {overallAverages.behavioral.toFixed(1)}/5
            </p>
            <p className="text-gray-300 text-sm">
              {language === 'ar' ? 'المتوسط العام' : 'Overall Average'}
            </p>
          </div>
        </div>
        

      </div>

      {/* PDF Download Button - Mobile only (at bottom) */}
      <div className="md:hidden mt-6 flex justify-center">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 text-base font-medium ${
            isGeneratingPDF
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg shadow-red-500/50 shadow-lg animate-pulse hover:animate-none'
          }`}
          title={language === 'ar' ? 'تحميل تقرير التحليل النفسي' : 'Download Psychological Analysis Report'}
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>
                {language === 'ar' ? 'جاري التحليل وإنشاء التقرير...' : 'Analyzing & Generating Report...'}
              </span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>
                {language === 'ar' ? 'تحميل التقرير' : 'Download Report'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default RadarVisualization 