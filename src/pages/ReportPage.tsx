import { useEffect, useState } from 'react'
import { Download, ArrowLeft } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
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
  const reportTopic = sessionStorage.getItem('reportTopic') || ''
  
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
          const storedLang = (() => { try { return JSON.parse(localStorage.getItem('language') || '"en"') } catch { return 'en' } })()
          setError(storedLang === 'ar' ? 'لم يتم العثور على بيانات التقرير' : 'No report data found')
        }
      } catch (err) {
        console.error('Error loading report data:', err)
        const storedLang = (() => { try { return JSON.parse(localStorage.getItem('language') || '"en"') } catch { return 'en' } })()
        setError(storedLang === 'ar' ? 'فشل في تحميل بيانات التقرير' : 'Failed to load report data')
      } finally {
        setIsLoading(false)
      }
    }

    loadReportData()
  }, [])



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
      reportElement.style.width = '794px' // A4 width in px at 96dpi
      reportElement.style.maxWidth = '794px'
      reportElement.style.minHeight = 'auto'
      reportElement.style.padding = '40px'
      reportElement.style.fontSize = '12pt'
      reportElement.style.lineHeight = '1.6'
      reportElement.style.backgroundColor = '#000000'
      reportElement.style.color = '#ffffff'
      reportElement.style.margin = '0 auto'
      reportElement.style.display = 'block'

      // Override responsive classes temporarily to force desktop layout
      reportElement.className = 'bg-black text-white shadow-2xl'

      // Force all chart containers to desktop size
      const chartContainers = reportElement.querySelectorAll('.chart-container')
      const originalChartStyles: string[] = []
      chartContainers.forEach((container, index) => {
        const element = container as HTMLElement
        originalChartStyles[index] = element.style.cssText
        element.style.height = '200px'
        element.style.minHeight = '200px'
        element.style.padding = '8px'
      })

      // Force grid layout to desktop version
      const gridContainer = reportElement.querySelector('.grid')
      const originalGridClass = gridContainer?.className
      if (gridContainer) {
        gridContainer.className = 'grid grid-cols-3 gap-4'
      }

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 500))

      // Capture the full report at its actual height (no fixed height limit)
      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        windowHeight: reportElement.scrollHeight + 200
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

      // Create PDF - split across multiple pages if content is taller than one page
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = 210       // A4 width in mm
      const pdfPageHeight = 297  // A4 full height in mm
      // Use slightly less than full height per page so cuts fall in margins, not mid-line
      const contentPerPage = 285 // mm of content shown per page (12mm bottom breathing room)

      // Calculate image height in mm based on aspect ratio
      const imgWidthPx = canvas.width
      const imgHeightPx = canvas.height
      const imgHeightMm = (imgHeightPx / imgWidthPx) * pdfWidth

      // Helper: find the nearest "safe" cut point in the canvas (a mostly-dark row)
      const findSafeCutPx = (startPx: number, rangePx: number): number => {
        const ctx2 = document.createElement('canvas').getContext('2d')
        if (!ctx2) return startPx
        // Sample a thin horizontal strip at startPx ± rangePx/2
        const scanY = Math.max(0, Math.min(imgHeightPx - 1, startPx))
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = Math.min(imgWidthPx, 100) // sample width
        tempCanvas.height = rangePx
        const tCtx = tempCanvas.getContext('2d')
        if (!tCtx) return startPx
        tCtx.drawImage(canvas, 0, Math.max(0, scanY - rangePx / 2), imgWidthPx, rangePx, 0, 0, tempCanvas.width, rangePx)
        const data = tCtx.getImageData(0, 0, tempCanvas.width, rangePx).data
        // Find darkest row (lowest average brightness = black background = safe to cut)
        let bestRow = 0
        let bestBrightness = Infinity
        for (let row = 0; row < rangePx; row++) {
          let rowBrightness = 0
          for (let col = 0; col < tempCanvas.width; col++) {
            const idx = (row * tempCanvas.width + col) * 4
            rowBrightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          }
          rowBrightness /= tempCanvas.width
          if (rowBrightness < bestBrightness) {
            bestBrightness = rowBrightness
            bestRow = row
          }
        }
        return Math.max(0, scanY - rangePx / 2 + bestRow)
      }

      let yPosMm = 0
      let pageCount = 0

      while (yPosMm < imgHeightMm) {
        if (pageCount > 0) pdf.addPage()

        // Fill page with black first
        pdf.setFillColor(0, 0, 0)
        pdf.rect(0, 0, pdfWidth, pdfPageHeight, 'F')

        const remainingMm = imgHeightMm - yPosMm
        const rawSliceMm = Math.min(contentPerPage, remainingMm)

        // Try to find a smarter cut point near the natural page boundary
        let sliceMm = rawSliceMm
        if (remainingMm > contentPerPage) {
          // Only smart-cut if there is a next page
          const idealCutPx = Math.round((yPosMm + rawSliceMm) / imgHeightMm * imgHeightPx)
          const searchRangePx = Math.round(20 / imgHeightMm * imgHeightPx) // search ±20mm worth
          const safeCutPx = findSafeCutPx(idealCutPx, searchRangePx)
          sliceMm = (safeCutPx / imgHeightPx) * imgHeightMm - yPosMm
          sliceMm = Math.max(rawSliceMm - 20, Math.min(rawSliceMm + 5, sliceMm)) // clamp
        }

        const sourceYPx = Math.round(yPosMm / imgHeightMm * imgHeightPx)
        const sliceHeightPx = Math.round(sliceMm / imgHeightMm * imgHeightPx)

        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = imgWidthPx
        sliceCanvas.height = Math.max(1, sliceHeightPx)

        const ctx = sliceCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceYPx,
            imgWidthPx, sliceCanvas.height,
            0, 0,
            imgWidthPx, sliceCanvas.height
          )
        }

        const sliceImgData = sliceCanvas.toDataURL('image/png', 0.92)
        pdf.addImage(sliceImgData, 'PNG', 0, 0, pdfWidth, sliceMm)

        yPosMm += sliceMm
        pageCount++
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `misbara-report-${timestamp}.pdf`

      // Use blob URL for universal download compatibility (works on mobile + desktop + iOS)
      const blob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)

      console.log('PDF generated successfully:', filename)

    } catch (error) {
      console.error('Error generating PDF:', error)
      const isAr = reportData?.questionnaireData.language === 'ar'
      alert(isAr ? 'فشل في توليد PDF. يرجى المحاولة مرة أخرى.' : 'Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleViewPDF = async () => {
    if (!reportData) return
    setIsDownloading(true)
    try {
      const reportElement = document.getElementById('report-content')
      if (!reportElement) throw new Error('Report content not found')

      const originalStyle = reportElement.style.cssText
      const originalClassList = reportElement.className
      reportElement.style.width = '794px'
      reportElement.style.maxWidth = '794px'
      reportElement.style.minHeight = 'auto'
      reportElement.style.padding = '40px'
      reportElement.style.fontSize = '12pt'
      reportElement.style.lineHeight = '1.6'
      reportElement.style.backgroundColor = '#000000'
      reportElement.style.color = '#ffffff'
      reportElement.style.margin = '0 auto'
      reportElement.style.display = 'block'
      reportElement.className = 'bg-black text-white shadow-2xl'

      const chartContainers = reportElement.querySelectorAll('.chart-container')
      const originalChartStyles: string[] = []
      chartContainers.forEach((container, index) => {
        const element = container as HTMLElement
        originalChartStyles[index] = element.style.cssText
        element.style.height = '200px'
        element.style.minHeight = '200px'
        element.style.padding = '8px'
      })

      const gridContainer = reportElement.querySelector('.grid')
      const originalGridClass = gridContainer?.className
      if (gridContainer) gridContainer.className = 'grid grid-cols-3 gap-4'

      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#000000', scale: 2, useCORS: true, allowTaint: true,
        scrollX: 0, scrollY: 0, windowWidth: 1200,
        windowHeight: reportElement.scrollHeight + 200
      })

      reportElement.style.cssText = originalStyle
      reportElement.className = originalClassList
      chartContainers.forEach((container, index) => {
        (container as HTMLElement).style.cssText = originalChartStyles[index]
      })
      if (gridContainer && originalGridClass) gridContainer.className = originalGridClass

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = 210
      const pdfPageHeight = 297
      const contentPerPage = 285
      const imgWidthPx = canvas.width
      const imgHeightPx = canvas.height
      const imgHeightMm = (imgHeightPx / imgWidthPx) * pdfWidth

      let yPosMm = 0
      let pageCount = 0
      while (yPosMm < imgHeightMm) {
        if (pageCount > 0) pdf.addPage()
        pdf.setFillColor(0, 0, 0)
        pdf.rect(0, 0, pdfWidth, pdfPageHeight, 'F')
        const remainingMm = imgHeightMm - yPosMm
        const sliceMm = Math.min(contentPerPage, remainingMm)
        const sourceYPx = Math.round(yPosMm / imgHeightMm * imgHeightPx)
        const sliceHeightPx = Math.round(sliceMm / imgHeightMm * imgHeightPx)
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = imgWidthPx
        sliceCanvas.height = Math.max(1, sliceHeightPx)
        const ctx = sliceCanvas.getContext('2d')
        if (ctx) ctx.drawImage(canvas, 0, sourceYPx, imgWidthPx, sliceCanvas.height, 0, 0, imgWidthPx, sliceCanvas.height)
        pdf.addImage(sliceCanvas.toDataURL('image/png', 0.92), 'PNG', 0, 0, pdfWidth, sliceMm)
        yPosMm += sliceMm
        pageCount++
      }

      const blob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    } catch (error) {
      console.error('Error generating PDF for view:', error)
      const isAr = reportData?.questionnaireData.language === 'ar'
      alert(isAr ? 'فشل في عرض PDF.' : 'Failed to generate PDF view.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Color the first word after "N) " green (top3) or orange (bottom3)
  // Handles both: **1) الإدراك** and plain: 1) الإدراك لديك...
  const colorFunctionNames = (content: string): string => {
    const lines = content.split('\n')
    let inTop3 = false
    let inBottom3 = false
    return lines.map(line => {
      if (/أقوى 3 وظائف|Top 3 Functions/.test(line)) { inTop3 = true; inBottom3 = false }
      else if (/أضعف 3 وظائف|Areas for Development/.test(line)) { inTop3 = false; inBottom3 = true }
      else if (/^## /.test(line) && !/أقوى|أضعف|Top 3|Areas for/.test(line)) { inTop3 = false; inBottom3 = false }

      if ((inTop3 || inBottom3) && /\d+\)/.test(line)) {
        const color = inTop3 ? '#22c55e' : '#f97316'
        // Match the first Arabic/Latin word after "N) " — skips any ** markers
        return line.replace(
          /(\*{0,2}\d+\)\s*\*{0,2})([\u0600-\u06FFa-zA-ZÀ-ÿ\u0610-\u061A\u064B-\u065F]+)/,
          `$1<span style="color:${color};font-weight:700">$2</span>`
        )
      }
      return line
    }).join('\n')
  }

  const renderMarkdownContent = (content: string) => {
    // Clean the content to remove any markdown code block wrapping
    let cleanContent = content.trim();
    
    // Remove markdown code block wrapping if present (global flag to handle multiple occurrences)
    cleanContent = cleanContent.replace(/```(?:markdown|md)?\s*/gi, '').replace(/\s*```/g, '');
    
    // Remove any remaining code block patterns
    cleanContent = cleanContent.replace(/^```\s*/gm, '').replace(/\s*```$/gm, '');

    // Color function names
    cleanContent = colorFunctionNames(cleanContent)

    return (
      <div className="prose prose-sm prose-invert max-w-none text-white print:text-black">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
          h1: ({ children, ...props }) => (
            <h1 {...props} className="text-xl font-semibold mt-5 mb-3 text-white print:text-black">
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} className="font-semibold mt-4 mb-2 text-white print:text-black" style={{ fontSize: 'clamp(14px, 1.1vw, 16px)' }}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-base font-semibold mt-3 mb-2 text-white print:text-black">
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p {...props} className="mb-3 text-gray-200 print:text-black leading-relaxed text-sm font-normal">
              {children}
            </p>
          ),
          strong: ({ children, ...props }) => (
            <strong {...props} className="font-semibold text-white print:text-black">
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

  return (
    <>
      {/* Main container with black background */}
      <div className="min-h-screen bg-black">
        {/* Header with action buttons - all devices */}
        <div className="flex w-full px-2 sm:px-4 py-2 sm:py-4 flex-wrap justify-end gap-2">
          <button
            onClick={handleViewPDF}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="truncate">
              {isDownloading
                ? (isArabic ? 'جاري التحضير...' : 'Preparing...')
                : (isArabic ? 'عرض PDF' : 'View PDF')
              }
            </span>
          </button>
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
            {/* Report Title Header */}
            <div className="w-full px-4 md:px-[20mm] pt-6 pb-4 flex items-center gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
              <img src={misbaraLogo} alt="Logo" className="h-8 w-auto opacity-80" />
              <div>
                <p className="text-xs text-gray-400 leading-none mb-1">
                  {isArabic ? 'تقرير' : 'Report'}
                </p>
                <p className="text-base font-semibold text-white leading-snug">
                  {isArabic ? 'تحليل الذات وارتباطها بـ' : 'Self-Analysis related to'}
                </p>
                {reportTopic && (
                  <p className="text-sm font-bold leading-none mt-0.5" style={{ color: '#f59e0b' }}>
                    {reportTopic}
                  </p>
                )}
              </div>
            </div>

            {/* Header separator line */}
            <div className="w-full border-b border-gray-400"></div>

            {/* Content with padding - no bottom padding to leave space for footer */}
            <div className="px-4 md:px-[20mm] flex-1 flex flex-col">


            {/* Charts Section */}
            {chartData && (
              <section className="mt-4 md:mt-6 mb-3 md:mb-4">

                {/* Summary Row — 3 cards */}
                {(() => {
                  const dims = [
                    { key: 'mental', pct: chartData.mental.percentage, label: chartData.typeLabels.mental },
                    { key: 'emotional', pct: chartData.emotional.percentage, label: chartData.typeLabels.emotional },
                    { key: 'existential', pct: chartData.existential.percentage, label: chartData.typeLabels.existential },
                  ]
                  const dominant = dims.reduce((a, b) => a.pct >= b.pct ? a : b)
                  return (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
                      {/* Overall */}
                      <div className="flex-1 rounded-2xl px-5 py-4" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                        <p className="text-xs text-gray-400 mb-2">
                          {isArabic ? 'المستوى العام' : 'Overall Level'}
                        </p>
                        <p className="text-4xl font-bold leading-none text-white">
                          {chartData.overall}%
                        </p>
                      </div>
                      {/* Harmony */}
                      <div className="flex-1 rounded-2xl px-5 py-4" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                        <p className="text-xs text-gray-400 mb-2">
                          {isArabic ? 'التجانس بين الأبعاد' : 'Dimension Coherence'}
                        </p>
                        <p className="text-4xl font-bold leading-none text-white">
                          {chartData.harmony}%
                        </p>
                      </div>
                      {/* Driven by */}
                      <div className="flex-1 rounded-2xl px-5 py-4" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                        <p className="text-xs text-gray-400 mb-2">
                          {isArabic
                            ? `يقودك الجانب ${dominant.label.split('/')[0].trim()}`
                            : `Driven by ${dominant.label.split('/')[0].trim()}`}
                        </p>
                        <p className="text-4xl font-bold leading-none text-white">
                          {dominant.pct}%
                        </p>
                      </div>
                    </div>
                  )
                })()}

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
            
            {/* Footer — minimal */}
            <div className="mt-auto px-4 md:px-[20mm] pb-4 md:pb-[10mm]">
              <div className="w-full border-b border-gray-700 mb-3"></div>
              <div className="flex items-center justify-between" dir={isArabic ? 'rtl' : 'ltr'}>
                <img src={misbaraLogo} alt="Logo" className="h-5 w-auto opacity-40" />
                <p className="text-xs text-gray-600">harmony</p>
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