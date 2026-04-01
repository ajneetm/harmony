import { useEffect, useState } from 'react'
import { Download, ArrowLeft } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import RadarChart from '../components/RadarChart'
import misbaraLogo from '../components/icons/misbara_original_logo.svg'
import headerSvg from '../components/icons/header.svg'
import footerSvg from '../components/icons/footer.svg'
import { getFontCSSProperties } from '../utils/fonts'

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

interface DimensionData {
  percentage: number
  elements: ChartData[]
}

interface ReportChartData {
  mental: DimensionData
  emotional: DimensionData
  existential: DimensionData
  harmony: number
  overall: number
  allElements: { name: string; score: number; dimension: string }[]
  typeLabels: {
    mental: string
    emotional: string
    existential: string
  }
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

// Report Page Component
export default function ReportPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  
  const navigate = (path: string) => {
    if (typeof window !== 'undefined' && (window as any).navigateTo) {
      (window as any).navigateTo(path);
    }
  }

  const isArabic = reportData?.questionnaireData.language === 'ar'
  
  // Get chatId from URL query parameters
  const urlParams = new URLSearchParams(window.location.search)
  const chatId = urlParams.get('chatId')

  useEffect(() => {
    const loadReportData = () => {
      try {
        const storedData = sessionStorage.getItem('reportData')
        if (storedData) {
          const data = JSON.parse(storedData)
          setReportData(data)
          console.log('Report data loaded:', data)
          
          // Apply font CSS properties based on language
          if (data.questionnaireData?.language) {
            const fontProps = getFontCSSProperties(data.questionnaireData.language)
            Object.entries(fontProps).forEach(([property, value]) => {
              document.documentElement.style.setProperty(property, value)
              console.log(`ReportPage: Set CSS property: ${property} = ${value}`)
            })
            
            // Also apply the appropriate font class
            document.documentElement.classList.remove('font-tajawal', 'font-inter')
            const fontClass = data.questionnaireData.language === 'ar' ? 'font-tajawal' : 'font-inter'
            document.documentElement.classList.add(fontClass)
            console.log(`ReportPage: Applied font class: ${fontClass} for language: ${data.questionnaireData.language}`)
          }
        } else {
          setError('No report data found')
        }
      } catch (err) {
        console.error('Error loading report data:', err)
        setError('Failed to load report data')
      } finally {
        setIsLoading(false)
      }
    }

    loadReportData()
  }, [])

  // Auto-download PDF after report loads
  useEffect(() => {
    if (reportData && !isLoading && !error) {
      // Small delay to ensure content is fully rendered
      const autoDownloadTimer = setTimeout(() => {
        console.log('Auto-downloading PDF...')
        handleDownloadPDF()
      }, 1500) // 1.5 second delay

      return () => clearTimeout(autoDownloadTimer)
    }
  }, [reportData, isLoading, error])


  const handleDownloadPDF = async () => {
    if (!reportData) return
    
    setIsDownloading(true)
    try {
      const reportElement = document.getElementById('report-content')
      if (!reportElement) throw new Error('Report content not found')

      // Temporarily adjust styles for PDF generation - force desktop layout
      const originalStyle = reportElement.style.cssText
      const originalClassList = reportElement.className
      
      // Apply consistent PDF-friendly styles for all devices
      reportElement.style.width = '210mm'
      reportElement.style.maxWidth = '210mm'
      reportElement.style.minHeight = '297mm'
      reportElement.style.padding = '18mm'
      reportElement.style.fontSize = '12pt'
      reportElement.style.lineHeight = '1.6'
      reportElement.style.backgroundColor = '#000000'
      reportElement.style.color = '#ffffff'
      reportElement.style.margin = '0 auto'
      reportElement.style.display = 'flex'
      reportElement.style.flexDirection = 'column'
      
      // Override responsive classes temporarily to force desktop layout
      reportElement.className = 'bg-black text-white print:bg-white print:text-black shadow-2xl'
      
      // Force all chart containers to desktop size
      const chartContainers = reportElement.querySelectorAll('.chart-container')
      const originalChartStyles: string[] = []
      chartContainers.forEach((container, index) => {
        const element = container as HTMLElement
        originalChartStyles[index] = element.style.cssText
        element.style.height = '220px'
        element.style.minHeight = '220px'
        element.style.padding = '12px'
      })
      
      // Force grid layout to desktop version
      const gridContainer = reportElement.querySelector('.grid')
      const originalGridClass = gridContainer?.className
      if (gridContainer) {
        gridContainer.className = 'grid grid-cols-3 gap-4'
      }

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 300))

      // Capture the report as an image with consistent settings
      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 210 * 3.78,  // A4 width in pixels
        height: 297 * 3.78, // A4 height in pixels
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,  // Force desktop viewport
        windowHeight: 1600
      })

      // Restore all original styles
      reportElement.style.cssText = originalStyle
      reportElement.className = originalClassList
      
      // Restore chart container styles
      chartContainers.forEach((container, index) => {
        const element = container as HTMLElement
        element.style.cssText = originalChartStyles[index]
      })
      
      // Restore grid class
      if (gridContainer && originalGridClass) {
        gridContainer.className = originalGridClass
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png', 0.95)
      const imgWidth = 210 // A4 width in mm
      const imgHeight = 297 // A4 height in mm
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `misbara-report-${timestamp}.pdf`
      
      pdf.save(filename)

      console.log('PDF generated successfully:', filename)
      
      // Check if on mobile and set downloaded state
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        setIsDownloaded(true)
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const renderMarkdownContent = (content: string) => {
    // Clean the content to remove any markdown code block wrapping
    let cleanContent = content.trim();
    
    // Remove markdown code block wrapping if present (global flag to handle multiple occurrences)
    cleanContent = cleanContent.replace(/```(?:markdown|md)?\s*/gi, '').replace(/\s*```/g, '');
    
    // Remove any remaining code block patterns
    cleanContent = cleanContent.replace(/^```\s*/gm, '').replace(/\s*```$/gm, '');
    
    return (
      <div className="prose prose-sm prose-invert max-w-none text-white print:text-black">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
          components={{
          h1: ({ children, ...props }) => (
            <h1 {...props} className="text-2xl font-bold mt-5 mb-4 text-white print:text-black">
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} className="text-xl font-bold mt-5 mb-3 text-white print:text-black">
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-lg font-bold mt-4 mb-3 text-white print:text-black">
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p {...props} className="mb-3 text-white print:text-black leading-relaxed text-base">
              {children}
            </p>
          ),
          strong: ({ children, ...props }) => (
            <strong {...props} className="font-bold text-white print:text-black">
              {children}
            </strong>
          ),
          ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc ml-5 mb-3 text-white print:text-black">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal ml-5 mb-3 text-white print:text-black">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="mb-1 text-white print:text-black text-base">
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote {...props} className="border-l-4 border-gray-500 pl-4 italic text-gray-300 print:text-gray-700 mb-3">
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }) => (
            <code {...props} className="bg-gray-800 print:bg-gray-200 text-gray-200 print:text-gray-800 px-1 py-0.5 rounded text-sm">
              {children}
            </code>
          ),
          table: ({ children, ...props }) => (
            <div className="table-wrapper overflow-x-auto md:overflow-x-visible">
              <table {...props} className="table-auto border-collapse border border-gray-600 print:border-gray-400 text-white print:text-black">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">
            {isArabic ? 'جاري تحميل التقرير...' : 'Loading Report...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {isArabic ? 'خطأ' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || (isArabic ? 'لم يتم العثور على بيانات التقرير' : 'Report data not found')}
          </p>
          <button
            onClick={() => {
              console.log('Error page button clicked!');
              console.log('ChatId from URL:', chatId);

              if (chatId) {
                console.log('Navigating to chat with chatId:', chatId);
                // Use React Router navigation to avoid page reload
                navigate(`/chat?chatId=${encodeURIComponent(chatId)}`);
              } else {
                console.log('No chatId found, navigating to chat welcome');
                navigate('/chat');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isArabic ? 'العودة إلى الرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    )
  }

  const { aiResponse, questionnaireData, chartData } = reportData

  // Show download success screen on mobile after download
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  if (isMobile && isDownloaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {isArabic ? 'تم تحميل التقرير بنجاح!' : 'Report Downloaded Successfully!'}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              {isArabic 
                ? 'تم حفظ تقرير التطوير الذاتي الخاص بك على جهازك. يمكنك الآن العودة للمحادثة أو الصفحة الرئيسية.'
                : 'Your self-development assessment report has been saved to your device. You can now return to the chat or home page.'
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('New chat button clicked!');
                navigate('/chat');
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-base font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>
                {isArabic ? 'محادثة جديدة' : 'New Chat'}
              </span>
            </button>
            
            <button
              onClick={() => {
                console.log('Home button clicked!');
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-base font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>
                {isArabic ? 'الصفحة الرئيسية' : 'Home Page'}
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main container with black background */}
      <div className="min-h-screen bg-black">
        {/* Header with action buttons - Desktop only */}
        <div className="hidden md:flex w-full px-2 sm:px-4 py-2 sm:py-4 flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="truncate">
              {isDownloading
                ? (isArabic ? 'جاري التحميل...' : 'Downloading...')
                : (isArabic ? 'تحميل PDF' : 'Download PDF')
              }
            </span>
          </button>
          
          <button
            onClick={() => {
              console.log('Close button clicked!');
              console.log('ChatId from URL:', chatId);
              console.log('Current URL:', window.location.href);

              if (chatId) {
                console.log('Navigating to chat with chatId:', chatId);
                // Use React Router navigation to avoid page reload
                navigate(`/chat?chatId=${encodeURIComponent(chatId)}`);
              } else {
                console.log('No chatId found, navigating to chat welcome');
                navigate('/chat');
              }
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate">
              {isArabic ? 'إغلاق' : 'Close'}
            </span>
          </button>
        </div>

        {/* Report Content Container with Header */}
        <div className="w-full px-2 sm:px-4 pb-8 flex justify-center">
          {/* A4 Report Content with Header */}
          <div 
            id="report-content" 
            className={`w-full md:w-[210mm] md:max-w-[210mm] bg-black text-white print:bg-white print:text-black shadow-2xl flex flex-col justify-between ${ 
              isArabic ? 'text-right' : 'text-left'
            }`}
            style={{
              height: 'auto',
              minHeight: '297mm',  
              margin: '0 auto',
              fontSize: '12pt',
              lineHeight: '1.6'
            }}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {/* Main content area */}
            <div className="flex-1">
            {/* Header SVG - At the very top */}
            <div className="w-full mb-1 md:mb-2">
              <img 
                src={headerSvg} 
                alt="Header" 
                className="w-full h-auto object-contain"
                style={{
                  maxHeight: '100px',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
              />
            </div>

            {/* Header separator line */}
            <div className="w-full border-b border-gray-400"></div>

            {/* Content with padding - no bottom padding to leave space for footer */}
            <div className="px-4 md:px-[20mm] flex-1 flex flex-col">


            {/* Charts Section */}
            {chartData && (
              <section className="mt-4 md:mt-6 mb-3 md:mb-4">

                {/* Overall & Harmony Summary Row */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                  {/* Overall */}
                  <div className="flex-1 relative overflow-hidden rounded-2xl px-5 py-4"
                    style={{ background: 'linear-gradient(135deg, #1c1a0e 0%, #2a2300 100%)', border: '1px solid #f59e0b44' }}>
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
                      style={{ background: '#f59e0b', filter: 'blur(20px)', transform: 'translate(25%, -25%)' }} />
                    <p className="text-xs text-gray-400 mb-1">
                      {isArabic ? 'المستوى العام' : 'Overall Level'}
                    </p>
                    <p className="text-4xl font-bold leading-none" style={{ color: '#f59e0b' }}>
                      {chartData.overall}%
                    </p>
                  </div>
                  {/* Harmony */}
                  <div className="flex-1 relative overflow-hidden rounded-2xl px-5 py-4"
                    style={{ background: 'linear-gradient(135deg, #150d20 0%, #1e0a30 100%)', border: '1px solid #a855f744' }}>
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
                      style={{ background: '#a855f7', filter: 'blur(20px)', transform: 'translate(25%, -25%)' }} />
                    <p className="text-xs text-gray-400 mb-1">
                      {isArabic ? 'التجانس بين الأبعاد' : 'Dimension Coherence'}
                    </p>
                    <p className="text-4xl font-bold leading-none" style={{ color: '#a855f7' }}>
                      {chartData.harmony}%
                    </p>
                  </div>
                </div>

                {/* 3 Radar Charts — original 9-axis style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="p-2 md:p-3 flex items-center justify-center chart-container h-40 md:h-52">
                    <div className="w-full h-full flex items-center justify-center">
                      <RadarChart
                        title={chartData.radarLabels.cognitive}
                        color="#22c55e"
                        data={chartData.radarCognitive}
                        language={questionnaireData.language}
                      />
                    </div>
                  </div>

                  <div className="p-2 md:p-3 flex items-center justify-center chart-container h-40 md:h-52">
                    <div className="w-full h-full flex items-center justify-center">
                      <RadarChart
                        title={chartData.radarLabels.emotional}
                        color="#ae1f23"
                        data={chartData.radarEmotional}
                        language={questionnaireData.language}
                      />
                    </div>
                  </div>

                  <div className="p-2 md:p-3 flex items-center justify-center chart-container h-40 md:h-52">
                    <div className="w-full h-full flex items-center justify-center">
                      <RadarChart
                        title={chartData.radarLabels.behavioral}
                        color="#3b82f6"
                        data={chartData.radarBehavioral}
                        language={questionnaireData.language}
                      />
                    </div>
                  </div>
                </div>

                {/* Dimension Percentages Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-2">
                  <div className="text-center">
                    <span className="text-xl font-bold" style={{ color: '#22c55e' }}>
                      {chartData.mental.percentage}%
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-xl font-bold" style={{ color: '#ae1f23' }}>
                      {chartData.emotional.percentage}%
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>
                      {chartData.existential.percentage}%
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* AI Report Section */}
            <section className="flex-1 mb-2" style={{overflow: 'hidden', minHeight: 0}}>
              <div className="prose prose-lg max-w-none overflow-hidden">
                {renderMarkdownContent(aiResponse)}
              </div>
            </section>
            </div>
            
            {/* Footer area - outside the padded content, always at bottom */}
            <div className="mt-auto px-4 md:px-[20mm] pb-2 md:pb-[10mm]">
              {/* Footer separator line */}
              <div className="w-full border-b border-gray-400 mb-1"></div>

              {/* Footer SVG */}
              <div className="w-full">
                <img 
                  src={footerSvg} 
                  alt="Footer" 
                  className="w-full h-auto object-contain"
                  style={{
                    maxHeight: '60px',
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Action buttons for mobile - at bottom */}
        <div className="md:hidden w-full px-2 sm:px-4 py-4 flex justify-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-base font-medium"
          >
            <Download className="w-5 h-5" />
            <span>
              {isDownloading
                ? (isArabic ? 'جاري التحميل...' : 'Downloading...')
                : (isArabic ? 'تحميل PDF' : 'Download PDF')
              }
            </span>
          </button>
          
          <button
            onClick={() => {
              console.log('Close button clicked!');
              console.log('ChatId from URL:', chatId);
              console.log('Current URL:', window.location.href);

              if (chatId) {
                console.log('Navigating to chat with chatId:', chatId);
                // Use React Router navigation to avoid page reload
                navigate(`/chat?chatId=${encodeURIComponent(chatId)}`);
              } else {
                console.log('No chatId found, navigating to chat welcome');
                navigate('/chat');
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-base font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {isArabic ? 'إغلاق' : 'Close'}
            </span>
          </button>
        </div>

        {/* Custom styles for responsive charts */}
        <style>{`
          .chart-container .flex.flex-col.items-center.p-4 {
            padding: 0.5rem !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          
          @media (min-width: 640px) {
            .chart-container .flex.flex-col.items-center.p-4 {
              padding: 1rem !important;
            }
          }
          
          .chart-container h3 {
            font-size: 0.9rem !important;
            margin-bottom: 0.5rem !important;
            text-align: center !important;
            font-weight: bold !important;
          }
          
          @media (min-width: 640px) {
            .chart-container h3 {
              font-size: 1.1rem !important;
              margin-bottom: 1rem !important;
            }
          }
          
          .chart-container .relative.w-full.max-w-lg.aspect-square {
            max-width: none !important;
            width: 100% !important;
            height: 160px !important;
            flex: 1 !important;
            min-height: 160px !important;
          }
          
          @media (min-width: 640px) {
            .chart-container .relative.w-full.max-w-lg.aspect-square {
              height: 200px !important;
              min-height: 200px !important;
            }
          }
          
          .chart-container svg {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            min-height: 160px !important;
          }
          
          @media (min-width: 640px) {
            .chart-container svg {
              min-height: 200px !important;
            }
          }
          
          .chart-container .mt-6.text-center {
            margin-top: 0.5rem !important;
            display: block !important;
            font-size: 0.8rem !important;
          }
          
          @media (min-width: 640px) {
            .chart-container .mt-6.text-center {
              margin-top: 1rem !important;
              font-size: 0.9rem !important;
            }
          }
          
          /* Mobile-specific adjustments */
          @media (max-width: 639px) {
            .chart-container {
              margin-bottom: 1rem !important;
            }
            
            #report-content {
              font-size: 11pt !important;
              line-height: 1.5 !important;
            }
            
            .prose {
              font-size: 0.9rem !important;
            }
          }
          
          /* Print-specific styles */
          @media print {
            .chart-container .relative.w-full.max-w-lg.aspect-square {
              height: 200px !important;
              min-height: 200px !important;
            }
            .chart-container svg {
              min-height: 200px !important;
            }
            
            #report-content {
              width: 210mm !important;
              max-width: 210mm !important;
              padding: 20mm !important;
              font-size: 12pt !important;
              line-height: 1.6 !important;
            }
          }
        `}</style>
      </div>
    </>
  )
}