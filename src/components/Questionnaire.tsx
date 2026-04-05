import { useState, useRef, memo } from 'react'
import { useAppState } from '../store'
import { translations } from '../utils'

interface Question {
  id: number
  text: string
}

interface QuestionnaireProps {
  questions: Question[]
  onComplete: (answers: Record<number, number>) => void
}

export const Questionnaire = memo(({ questions, onComplete }: QuestionnaireProps) => {
  const { language } = useAppState()
  const t = translations[language]
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const completedRef = useRef(false)

  const scaleOptions = [
    { value: 5, label: language === 'ar' ? 'موافق بشدة' : 'Strongly Agree' },
    { value: 4, label: language === 'ar' ? 'موافق' : 'Agree' },
    { value: 3, label: language === 'ar' ? 'لا أعرف' : 'Neutral' },
    { value: 2, label: language === 'ar' ? 'غير موافق' : 'Disagree' },
    { value: 1, label: language === 'ar' ? 'غير موافق بشدة' : 'Strongly Disagree' }
  ]

  const handleAnswerSelect = (value: number) => {
    if (!questions[currentQuestion]) return

    const questionId = questions[currentQuestion].id

    // Prevent double-firing (label onClick + radio onChange both trigger)
    if (answers[questionId] === value) return

    const updatedAnswers = {
      ...answers,
      [questionId]: value
    }

    setAnswers(updatedAnswers)

    // Auto-advance to next question after a short delay for visual feedback
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
      } else {
        // All questions answered, complete the questionnaire
        if (!completedRef.current) {
          completedRef.current = true
          onComplete(updatedAnswers)
        }
      }
    }, 300) // 300ms delay for smooth transition
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // All questions answered, complete the questionnaire
      if (!completedRef.current) {
        completedRef.current = true
        onComplete(answers)
      }
    }
  }

  const handlePrevious = () => {
    console.log('handlePrevious called:', { currentQuestion })
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const isAnswered = answers[questions[currentQuestion]?.id] !== undefined
  const progress = ((currentQuestion + 1) / questions.length) * 100

  // Memoized component to prevent unnecessary re-renders

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
        <p className="text-center text-gray-400">
          {language === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}
        </p>
      </div>
    )
  }

  return (
    <div className="questionnaire-container w-full max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="mb-6">
        <div className="flex justify-center items-center mb-2">
          <h3 className="text-lg font-medium text-white">
            {language === 'ar' ? 'استبيان التقييم' : 'Assessment Questionnaire'}
          </h3>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-400">
          {language === 'ar' 
            ? `السؤال ${currentQuestion + 1} من ${questions.length}`
            : `Question ${currentQuestion + 1} of ${questions.length}`
          }
        </p>
      </div>

      {/* Current Question */}
      <div className="mb-6">
        <h4 className="text-white mb-4 text-base leading-relaxed">
          {questions[currentQuestion]?.text}
        </h4>
        
        {/* Scale Options */}
        <div className="space-y-2">
          {scaleOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                answers[questions[currentQuestion]?.id] === option.value
                  ? 'border-red-600 bg-red-600/10'
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAnswerSelect(option.value)
              }}
            >
              <input
                type="radio"
                name={`question-${questions[currentQuestion]?.id}`}
                value={option.value}
                checked={answers[questions[currentQuestion]?.id] === option.value}
                onChange={() => {}} // handled by label onClick
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                answers[questions[currentQuestion]?.id] === option.value
                  ? 'border-red-600'
                  : 'border-gray-500'
              }`}>
                {answers[questions[currentQuestion]?.id] === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                )}
              </div>
              <span className={`text-white text-base ${
                language === 'ar' ? 'mr-6 text-right' : 'ml-6 text-left'
              }`}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pb-2">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handlePrevious()
          }}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            currentQuestion === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
        >
          {language === 'ar' ? 'السابق' : 'Previous'}
        </button>
        
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleNext()
          }}
          disabled={!isAnswered}
          className={`px-6 py-2 rounded-lg transition-all duration-200 ${
            !isAnswered
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : currentQuestion === questions.length - 1
              ? 'bg-green-600 text-white hover:bg-green-500'
              : 'bg-red-600 text-white hover:bg-red-500'
          }`}
        >
          {currentQuestion === questions.length - 1
            ? (language === 'ar' ? 'إنهاء' : 'Complete')
            : (language === 'ar' ? 'التالي' : 'Next')
          }
        </button>
      </div>
    </div>
  )
})