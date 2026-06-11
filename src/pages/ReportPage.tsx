import { useEffect, useState } from 'react'
import { Download, ArrowLeft } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import RadarChart from '../components/RadarChart'
import CombinedWorldRadar from '../components/CombinedWorldRadar'
import DrillDownPanel, { type SavedAnalysis } from '../components/DrillDownPanel'
import misbaraLogo from '../components/icons/misbara_original_logo.svg'
import headerSvg from '../components/icons/header.svg'
import footerSvg from '../components/icons/footer.svg'
import { getFontCSSProperties } from '../utils/fonts'
import { supabase } from '../lib/supabase'
import { generateChartData } from '../utils/reportService'
import { useAuth } from '../context/AuthContext'

const ADMIN_EMAIL = 'a.hajali@ajnee.com'

const FN_NAMES_AR = ['الإدراك', 'الجاهزية', 'النية', 'الفعل', 'التفاعل', 'الناتج', 'الاستقبال', 'التطور', 'التشكيل']
const FN_NAMES_EN = ['Perception', 'Readiness', 'Intention', 'Action', 'Interaction', 'Outcome', 'Reception', 'Evolution', 'Formation']

// ── Dynamic user summary (Arabic) ──────────────────────────────────────────
function buildUserSummaryAR(cd: any): string {
  const ap = cd.actionPower ?? Math.round(cd.overall * cd.harmony / 100)
  const h  = cd.harmony

  const driverOptions = [
    { name: 'الذهني',   pct: cd.mental.percentage,
      charDesc: 'شخص مفكر وتحليلي، تميل إلى التعامل مع الحياة من خلال التفكير والتخطيط والتأمل',
      supportTip: 'بتحرك أكبر في الواقع العملي وتحويل الأفكار إلى خطوات ملموسة' },
    { name: 'المشاعري', pct: cd.emotional.percentage,
      charDesc: 'شخص تفاعلي وعاطفي، تميل إلى التعامل مع الحياة من خلال المشاعر والعلاقات والتواصل',
      supportTip: 'بتوجيه أوضح وبنية أكثر تنظيمًا تحول مشاعرك إلى أثر فعلي' },
    { name: 'السلوكي',  pct: cd.existential.percentage,
      charDesc: 'شخص عملي وواقعي، تميل إلى التعامل مع الحياة من خلال الحركة والتصرف والممارسة',
      supportTip: 'بتخطيط أوضح ووعي أعمق بالاتجاه' },
  ]
  const dom = driverOptions.reduce((a, b) => a.pct >= b.pct ? a : b)

  const worldOptions = [
    { name: cd.worldLabels?.inner       ?? 'العالم الداخلي',   pct: cd.worldMentalPct      ?? 0,
      strongDesc: 'إدراكًا ونيّة واستعدادًا داخليًا جيدًا',
      weakDesc:   'تحويل وعيك الداخلي إلى حضور واضح في المحيط المباشر' },
    { name: cd.worldLabels?.physical    ?? 'العالم الخارجي',   pct: cd.worldEmotionalPct   ?? 0,
      strongDesc: 'قدرةً على التفاعل مع محيطك والانخراط في الواقع',
      weakDesc:   'تحويل ما تعرفه وتريده داخليًا إلى خطوات عملية ونتائج ملموسة في الواقع' },
    { name: cd.worldLabels?.existential ?? 'العالم الوجودي',   pct: cd.worldExistentialPct ?? 0,
      strongDesc: 'إحساسًا راسخًا بالهوية والمعنى والغاية',
      weakDesc:   'تعميق الإحساس بالهدف والمعنى وربطه بأفعالك اليومية' },
  ]
  const strong = worldOptions.reduce((a, b) => a.pct >= b.pct ? a : b)
  const weak   = worldOptions.reduce((a, b) => a.pct <= b.pct ? a : b)

  const apLevel = ap >= 70 ? 'مرتفعة وتدل على تأثير ملحوظ في واقعك'
                : ap >= 55 ? 'جيدة، لكنها تحتاج إلى مزيد من التنظيم والتركيز حتى تصبح أكثر تأثيرًا ووضوحًا في الواقع'
                : ap >= 40 ? 'في مرحلة البناء وتحتاج إلى تفعيل أقوى وتوجيه أكثر وضوحًا'
                : 'في مرحلتها الأولى وتستدعي مراجعة شاملة ونقطة انطلاق جديدة'

  const harmReading = h >= 80 ? 'ممتازة تشير إلى توافق عالٍ'
                    : h >= 65 ? 'جيدة تشير إلى وجود توافق مرضٍ'
                    : h >= 50 ? 'متوسطة تشير إلى بعض التباين'
                    : 'تشير إلى تباين واضح يستحق المعالجة'

  const harmConclusion = h >= 65
    ? 'وهذا يعني أن المشكلة ليست في وجود تشتت كبير داخلك، بل في حاجة الأداء إلى تفعيل أقوى في الواقع العملي'
    : 'وهذا يعني أن تحقيق مزيد من التوافق بين أبعادك الداخلية المختلفة سيرفع كفاءتك بشكل ملحوظ'

  return [
    `تظهر نتائج هارموني أن كفاءة أدائك في الحياة العامة بلغت ${ap}%، وهذا يعني أن لديك حضورًا ${apLevel}.`,
    `كما بلغت درجة الانسجام العام ${h}%، وهي نتيجة ${harmReading} بين ما تفكر فيه، وما تشعر به، وما تقوم به. ${harmConclusion}.`,
    `يقودك الجانب ${dom.name} بنسبة ${dom.pct}%، مما يعكس أنك ${dom.charDesc}. وهذه نقطة قوة مهمة، لكنها تصبح أكثر كفاءةً عندما تكون مدعومة ${dom.supportTip}.`,
    `أما من حيث العوالم، فيظهر أن ${strong.name} هو الأكثر انطلاقًا لديك بنسبة ${strong.pct}%، مما يدل على أن لديك ${strong.strongDesc}. في المقابل، فإن ${weak.name} هو الأقل انطلاقًا بنسبة ${weak.pct}%، وهذا يعني أن التحدي الأبرز لديك هو ${weak.weakDesc}.`,
    `بشكل عام، يمكن القول إنك تمتلك قاعدة داخلية جيدة وإمكانات واضحة، وكلما استطعت تحويل رغباتك وخططك إلى أفعال أكثر وضوحًا وانتظامًا، ارتفعت كفاءة أدائك وأصبح أثره أقوى في حياتك العامة.`,
  ].join('\n\n')
}

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
  radarRawCognitive?: ChartData[]
  radarRawEmotional?: ChartData[]
  radarRawBehavioral?: ChartData[]
  radarPct?: { cognitive: number; emotional: number; behavioral: number }
  radarLabels: {
    cognitive: string
    emotional: string
    behavioral: string
  }
  worldRadarInner?: ChartData[]
  worldRadarPhysical?: ChartData[]
  worldRadarExistential?: ChartData[]
  worldLabels?: {
    inner: string
    physical: string
    existential: string
  }
  worldHarmony?: number
  dominantWorld?: string
  worldMentalPct?: number
  worldEmotionalPct?: number
  worldExistentialPct?: number
  driverHarmony?: number
  fnHarmony?: number
  actionPower?: number
}

interface ReportData {
  aiResponse: string
  questionnaireData: QuestionnaireData
  chartData?: ReportChartData
}

// Report Page Component
export default function ReportPage() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [userRole, setUserRole] = useState<string>('user')
  const [drillDown, setDrillDown] = useState<{ functionName: string; cogScore: number; emoScore: number; behScore: number; coherence: number } | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<Record<string, SavedAnalysis>>({})
  const [comprehensiveReport, setComprehensiveReport] = useState('')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const reportTopic = sessionStorage.getItem('reportTopic') || ''

  const generateComprehensiveReport = async (language: 'ar' | 'en', topic: string, chartData: any) => {
    const analyses = Object.values(savedAnalyses)
    if (analyses.length === 0) return
    setGeneratingReport(true)
    setComprehensiveReport('')
    setShowReportModal(true)

    const isAr = language === 'ar'
    const analysesText = analyses.map(a =>
      isAr
        ? `وظيفة: ${a.functionName} (ذهني=${a.cogScore.toFixed(1)} / مشاعري=${a.emoScore.toFixed(1)} / سلوكي=${a.behScore.toFixed(1)} / تجانس=${a.coherence}%)\nالمشكلة: ${a.problem}\nالشرح: ${a.explanation}\nنقطة التدخل: ${a.intervention}\nتوصيات ذاتية: ${a.selfRecs.join(' — ')}\nتوصيات موجهة: ${a.coachRecs.join(' — ')}`
        : `Function: ${a.functionName} (Cog=${a.cogScore.toFixed(1)} / Emo=${a.emoScore.toFixed(1)} / Beh=${a.behScore.toFixed(1)} / Coh=${a.coherence}%)\nProblem: ${a.problem}\nExplanation: ${a.explanation}\nIntervention: ${a.intervention}\nSelf-recs: ${a.selfRecs.join(' — ')}\nCoach-recs: ${a.coachRecs.join(' — ')}`
    ).join('\n\n---\n\n')

    const systemPrompt = isAr
      ? `أنت خبير في نموذج هارموني للفعل الإنساني (ثلاثة عوالم × تسع وظائف × ثلاثة محركات). بناءً على التحليلات المفصلة المقدمة، اكتب تقريراً نهائياً شاملاً موجهاً للمختص.

اكتب التقرير بصيغة مركزة وعملية، مقسماً إلى:
## المشكلة الجذرية
(المشكلة الأساسية التي تربط جميع التحليلات — ليس مجرد أضعف رقم)

## نمط التأثير المتبادل
(كيف تتشابك المشاكل المحددة وتؤثر على بعضها)

## نقطة التدخل الأولى
(الوظيفة التي إذا تغيرت ستحرك البقية)

## خطة العمل الذاتية
(4-5 خطوات عملية يقوم بها الشخص)

## توصيات للمختص
(3-4 برامج أو جلسات موجهة)`
      : `You are a Harmony human-action model expert (3 worlds × 9 functions × 3 drivers). Based on the detailed analyses provided, write a comprehensive final report for the coach.

Write a focused, practical report divided into:
## Root Problem
(The core issue connecting all analyses — not just the lowest number)

## Interaction Pattern
(How the identified problems interlock and affect each other)

## First Intervention Point
(The function that, if changed, will move the others)

## Self-Action Plan
(4-5 practical steps the person takes)

## Coach Recommendations
(3-4 guided programs or sessions)`

    const top3    = chartData?.allElements?.slice(0, 3)?.map((e: any) => `${e.name} (${(e.score ?? 0).toFixed(1)})`)?.join(', ') ?? ''
    const bottom3 = chartData?.allElements ? [...chartData.allElements].slice(-3).reverse().map((e: any) => `${e.name} (${(e.score ?? 0).toFixed(1)})`).join(', ') : ''

    const userMsg = isAr
      ? `السياق: "${topic || 'تحليل الذات'}"\nالنسبة العامة: ${chartData?.overall ?? '—'}% | التجانس: ${chartData?.harmony ?? '—'}%\nأقوى 3 وظائف: ${top3}\nأضعف 3 وظائف: ${bottom3}\n\nالتحليلات المكتملة (${analyses.length} وظيفة):\n\n${analysesText}\n\naكتب التقرير النهائي الشامل.`
      : `Context: "${topic || 'self-analysis'}"\nOverall: ${chartData?.overall ?? '—'}% | Harmony: ${chartData?.harmony ?? '—'}%\nTop 3 functions: ${top3}\nBottom 3 functions: ${bottom3}\n\nCompleted analyses (${analyses.length} function${analyses.length > 1 ? 's' : ''}):\n\n${analysesText}\n\nWrite the comprehensive final report.`

    const { genAIResponseStream } = await import('../utils/ai')
    await genAIResponseStream(
      {
        messages: [{ id: '1', role: 'user' as const, content: userMsg }],
        systemPrompt: { enabled: true, value: systemPrompt },
      },
      chunk => setComprehensiveReport(prev => prev + chunk),
      () => setGeneratingReport(false),
      () => { setGeneratingReport(false) }
    )
  }

  const navigate = (path: string) => {
    if (typeof window !== 'undefined' && (window as any).navigateTo) {
      // Extract chatId if present in path and store in sessionStorage
      const match = path.match(/[?&]chatId=([^&]+)/)
      if (match) {
        sessionStorage.setItem('restoreChatId', decodeURIComponent(match[1]))
        path = path.split('?')[0]
      }
      (window as any).navigateTo(path)
    }
  }

  const isArabic = reportData?.questionnaireData.language === 'ar'
  
  // Get chatId from URL query parameters
  const urlParams = new URLSearchParams(window.location.search)
  const chatId = urlParams.get('chatId')

  useEffect(() => {
    const applyFont = (lang: string) => {
      const fontProps = getFontCSSProperties(lang)
      Object.entries(fontProps).forEach(([p, v]) => document.documentElement.style.setProperty(p, v))
      document.documentElement.classList.remove('font-tajawal', 'font-inter')
      document.documentElement.classList.add(lang === 'ar' ? 'font-tajawal' : 'font-inter')
    }

    const fixData = (data: any) => {
      // Recompute if: no chartData, harmony missing, or old format (missing driverHarmony = pre-fix cached report)
      if (data.questionnaireData && (!data.chartData || data.chartData.harmony == null || data.chartData.driverHarmony == null || data.chartData.fnHarmony == null)) {
        data.chartData = generateChartData(data.questionnaireData)
      }
      return data
    }

    const loadReportData = async () => {
      try {
        // 1. Try sessionStorage first (fastest)
        const local = sessionStorage.getItem('reportData')
          || (chatId ? localStorage.getItem(`report-${chatId}`) : null)

        if (local) {
          const data = fixData(JSON.parse(local))
          setReportData(data)
          if (data.questionnaireData?.language) applyFont(data.questionnaireData.language)
          return
        }

        // 2. Fallback: fetch from Supabase
        if (chatId) {
          const { data: row, error: dbErr } = await supabase
            .from('conversations')
            .select('report_data')
            .eq('id', chatId)
            .single()

          if (!dbErr && row?.report_data) {
            const data = fixData(JSON.parse(row.report_data))
            setReportData(data)
            if (data.questionnaireData?.language) applyFont(data.questionnaireData.language)
            return
          }
        }

        const storedLang = (() => { try { return JSON.parse(localStorage.getItem('language') || '"en"') } catch { return 'en' } })()
        setError(storedLang === 'ar' ? 'لم يتم العثور على بيانات التقرير' : 'No report data found')
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

  useEffect(() => {
    if (!user) return
    if (user.email === ADMIN_EMAIL) { setUserRole('trainer'); return }
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => { if (data?.role) setUserRole(data.role) })
  }, [user])

  const isTrainer = userRole === 'trainer' || userRole === 'admin' || user?.email === ADMIN_EMAIL

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

      // Measure hard page-break markers AFTER layout settles (scale:2 canvas)
      const CANVAS_SCALE = 2
      const hardBreaksPx: number[] = []
      const markers = reportElement.querySelectorAll('[data-pdf-newpage]')
      markers.forEach(marker => {
        const el = marker as HTMLElement
        let offsetTop = 0
        let cur: HTMLElement | null = el
        while (cur && cur !== reportElement) {
          offsetTop += cur.offsetTop
          cur = cur.offsetParent as HTMLElement
        }
        hardBreaksPx.push(offsetTop * CANVAS_SCALE)
      })

      // Capture the full report at its actual height
      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#000000',
        scale: CANVAS_SCALE,
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
      chartContainers.forEach((container, index) => {
        (container as HTMLElement).style.cssText = originalChartStyles[index]
      })
      if (gridContainer && originalGridClass) {
        gridContainer.className = originalGridClass
      }

      // Build PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = 210
      const pdfPageHeight = 297
      const contentPerPage = 285

      const imgWidthPx = canvas.width
      const imgHeightPx = canvas.height
      const imgHeightMm = (imgHeightPx / imgWidthPx) * pdfWidth

      // Convert hard break pixels → mm
      const hardBreaksMm = hardBreaksPx.map(px => (px / imgHeightPx) * imgHeightMm)

      // Build ordered list of segments: [start, end] in mm
      // Each hard break starts a new page; within a segment use auto-splitting if > 297mm
      const segmentStartsMm = [0, ...hardBreaksMm]
      const segmentEndsMm = [...hardBreaksMm, imgHeightMm]

      const addPageFromCanvas = (startMm: number, endMm: number, firstOfSegment: boolean, pageCount: number) => {
        let yMm = startMm
        let localCount = pageCount
        while (yMm < endMm) {
          if (localCount > 0) pdf.addPage()
          pdf.setFillColor(0, 0, 0)
          pdf.rect(0, 0, pdfWidth, pdfPageHeight, 'F')

          const remainingMm = endMm - yMm
          const sliceMm = Math.min(contentPerPage, remainingMm)
          const sourceYPx = Math.round((yMm / imgHeightMm) * imgHeightPx)
          const sliceHeightPx = Math.round((sliceMm / imgHeightMm) * imgHeightPx)

          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = imgWidthPx
          sliceCanvas.height = Math.max(1, sliceHeightPx)
          const ctx = sliceCanvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(canvas, 0, sourceYPx, imgWidthPx, sliceCanvas.height, 0, 0, imgWidthPx, sliceCanvas.height)
          }
          pdf.addImage(sliceCanvas.toDataURL('image/png', 0.92), 'PNG', 0, 0, pdfWidth, sliceMm)

          yMm += sliceMm
          localCount++
        }
        return localCount
      }

      let pageCount = 0
      for (let i = 0; i < segmentStartsMm.length; i++) {
        pageCount = addPageFromCanvas(segmentStartsMm[i], segmentEndsMm[i], i === 0, pageCount)
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `harmony-report-${timestamp}.pdf`

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

      // Measure hard page-break markers
      const CANVAS_SCALE_V = 2
      const hardBreaksPxV: number[] = []
      reportElement.querySelectorAll('[data-pdf-newpage]').forEach(marker => {
        const el = marker as HTMLElement
        let offsetTop = 0
        let cur: HTMLElement | null = el
        while (cur && cur !== reportElement) { offsetTop += cur.offsetTop; cur = cur.offsetParent as HTMLElement }
        hardBreaksPxV.push(offsetTop * CANVAS_SCALE_V)
      })

      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#000000', scale: CANVAS_SCALE_V, useCORS: true, allowTaint: true,
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

      const hardBreaksMmV = hardBreaksPxV.map(px => (px / imgHeightPx) * imgHeightMm)
      const segStarts = [0, ...hardBreaksMmV]
      const segEnds = [...hardBreaksMmV, imgHeightMm]

      let pageCount = 0
      for (let s = 0; s < segStarts.length; s++) {
        let yMm = segStarts[s]
        const endMm = segEnds[s]
        while (yMm < endMm) {
          if (pageCount > 0) pdf.addPage()
          pdf.setFillColor(0, 0, 0)
          pdf.rect(0, 0, pdfWidth, pdfPageHeight, 'F')
          const sliceMm = Math.min(contentPerPage, endMm - yMm)
          const sourceYPx = Math.round((yMm / imgHeightMm) * imgHeightPx)
          const sliceHeightPx = Math.round((sliceMm / imgHeightMm) * imgHeightPx)
          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = imgWidthPx
          sliceCanvas.height = Math.max(1, sliceHeightPx)
          const ctx = sliceCanvas.getContext('2d')
          if (ctx) ctx.drawImage(canvas, 0, sourceYPx, imgWidthPx, sliceCanvas.height, 0, 0, imgWidthPx, sliceCanvas.height)
          pdf.addImage(sliceCanvas.toDataURL('image/png', 0.92), 'PNG', 0, 0, pdfWidth, sliceMm)
          yMm += sliceMm
          pageCount++
        }
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

  // Split AI response into: intro | strengths+weaknesses | rest
  const splitAiResponse = (content: string) => {
    const clean = content
      .trim()
      .replace(/```(?:markdown|md)?\s*/gi, '')
      .replace(/\s*```/g, '')
      .replace(/^```\s*/gm, '')
      .replace(/\s*```$/gm, '')

    const startPattern = isArabic ? /^##\s*أقوى الجوانب/m : /^##\s*Your Strongest Points/m
    const startMatch = startPattern.exec(clean)
    if (!startMatch) return { intro: clean, sw: '', after: '' }

    const before = clean.slice(0, startMatch.index).trim()
    const rest = clean.slice(startMatch.index)

    // Find next section after strengths
    const weaknessPattern = isArabic ? /^##\s*ما يحتاج إلى دعم/m : /^##\s*Areas That Could Use Support/m
    const weaknessMatch = weaknessPattern.exec(rest)
    if (!weaknessMatch) return { intro: before, sw: rest.trim(), after: '' }

    const afterWeakness = rest.slice(weaknessMatch.index + 1)
    const nextSectionMatch = /^## /m.exec(afterWeakness)
    if (!nextSectionMatch) return { intro: before, sw: rest.trim(), after: '' }

    const swEnd = weaknessMatch.index + 1 + nextSectionMatch.index
    return {
      intro: before,
      sw: rest.slice(0, swEnd).trim(),
      after: rest.slice(swEnd).trim()
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

              if (chatId) {
                // Use React Router navigation to avoid page reload
                navigate(`/chat?chatId=${encodeURIComponent(chatId)}`);
              } else {
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

              if (chatId) {
                // Use React Router navigation to avoid page reload
                navigate(`/chat?chatId=${encodeURIComponent(chatId)}`);
              } else {
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
            {isTrainer && chartData && (
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
                          {isArabic ? 'التجانس بين الوظائف' : 'Function Coherence'}
                        </p>
                        <p className="text-4xl font-bold leading-none text-white">
                          {chartData.harmony}%
                        </p>
                      </div>
                      {/* كفاءة الأداء */}
                      <div className="flex-1 rounded-2xl px-5 py-4" style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}>
                        <p className="text-xs text-gray-400 mb-2">
                          {isArabic ? 'كفاءة الأداء' : 'Performance Efficiency'}
                        </p>
                        <p className="text-4xl font-bold leading-none text-white">
                          {chartData.actionPower ?? Math.round(chartData.overall * chartData.harmony / 100)}%
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

                {/* Type Percentages Row — matches the radar above each */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-2">
                  <div className="text-center">
                    <span className="text-xl font-bold" style={{ color: '#22c55e' }}>
                      {(chartData.radarPct?.cognitive ?? chartData.mental.percentage)}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold" style={{ color: '#ae1f23' }}>
                      {(chartData.radarPct?.emotional ?? chartData.emotional.percentage)}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>
                      {(chartData.radarPct?.behavioral ?? chartData.existential.percentage)}%
                    </span>
                  </div>
                </div>

                {/* ══ WORLDS SECTION ══ */}
                {chartData.worldRadarInner && chartData.worldLabels && (
                  <>
                    {/* Divider */}
                    <div className="my-5 border-t border-gray-700" />

                    {/* 3 world radars — each shows cognitive/emotional/behavioral breakdown */}
                    {(() => {
                      const rc = chartData.radarCognitive
                      const re = chartData.radarEmotional
                      const rb = chartData.radarBehavioral

                      const fnCoherence = (c: number, e: number, b: number) =>
                        Math.max(0, Math.round(100 - (Math.max(c, e, b) - Math.min(c, e, b)) * 15))

                      const worldInternalCoherence = (start: number) => {
                        // Compare average scores of the 3 functions within the world
                        const fnAvgs = [0, 1, 2].map(j =>
                          (rc[start + j].value + re[start + j].value + rb[start + j].value) / 3
                        )
                        const gap = Math.max(...fnAvgs) - Math.min(...fnAvgs)
                        return Math.max(0, Math.round(100 - gap * 15))
                      }

                      const innerCoh  = worldInternalCoherence(0)
                      const physCoh   = worldInternalCoherence(3)
                      const existCoh  = worldInternalCoherence(6)

                      const worlds = [
                        {
                          title: chartData.worldLabels.inner,
                          titleColor: '#22c55e',
                          axisLabels: chartData.worldRadarInner.map(d => d.dimension),
                          cognitive:  rc.slice(0, 3).map(d => d.value),
                          emotional:  re.slice(0, 3).map(d => d.value),
                          behavioral: rb.slice(0, 3).map(d => d.value),
                          coherence:  innerCoh,
                        },
                        {
                          title: chartData.worldLabels.physical,
                          titleColor: '#ae1f23',
                          axisLabels: (chartData.worldRadarPhysical ?? []).map(d => d.dimension),
                          cognitive:  rc.slice(3, 6).map(d => d.value),
                          emotional:  re.slice(3, 6).map(d => d.value),
                          behavioral: rb.slice(3, 6).map(d => d.value),
                          coherence:  physCoh,
                        },
                        {
                          title: chartData.worldLabels.existential,
                          titleColor: '#3b82f6',
                          axisLabels: (chartData.worldRadarExistential ?? []).map(d => d.dimension),
                          cognitive:  rc.slice(6, 9).map(d => d.value),
                          emotional:  re.slice(6, 9).map(d => d.value),
                          behavioral: rb.slice(6, 9).map(d => d.value),
                          coherence:  existCoh,
                        },
                      ]

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {worlds.map((w, i) => (
                            <CombinedWorldRadar key={i} {...w} language={questionnaireData.language} />
                          ))}
                        </div>
                      )
                    })()}
                  </>
                )}

              </section>
            )}

            {/* ── Trainer Tables ── */}
            {isTrainer && chartData && (() => {
              const rc = chartData.radarCognitive
              const re = chartData.radarEmotional
              const rb = chartData.radarBehavioral
              const fnCoh = (c: number, e: number, b: number) =>
                Math.max(0, Math.round(100 - (Math.max(c, e, b) - Math.min(c, e, b)) * 15))
              const worldCoh = (start: number) => {
                const fnAvgs = [0, 1, 2].map(j =>
                  (rc[start + j].value + re[start + j].value + rb[start + j].value) / 3
                )
                const gap = Math.max(...fnAvgs) - Math.min(...fnAvgs)
                return Math.max(0, Math.round(100 - gap * 15))
              }
              const fnNames = isArabic ? FN_NAMES_AR : FN_NAMES_EN
              const thCls = 'py-2 px-3 text-xs font-semibold text-gray-400 border-b border-white/10'
              const tdCls = 'py-2 px-3 text-sm border-b border-white/5'

              return (
                <section className="mt-4 mb-4 space-y-5" dir={isArabic ? 'rtl' : 'ltr'}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Table 1 — Drivers */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
                      <p className="text-xs font-semibold text-gray-400 px-4 pt-3 pb-2">
                        {isArabic ? 'المحركات' : 'Drivers'}
                      </p>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className={`${thCls} text-${isArabic ? 'right' : 'left'}`}>{isArabic ? 'المحرك' : 'Driver'}</th>
                            <th className={`${thCls} text-center`}>{isArabic ? 'مستوى الحضور' : 'Presence'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: isArabic ? 'الذهني'   : 'Cognitive',  pct: chartData.mental.percentage,    color: '#22c55e' },
                            { name: isArabic ? 'المشاعري' : 'Emotional',  pct: chartData.emotional.percentage, color: '#ae1f23' },
                            { name: isArabic ? 'السلوكي'  : 'Behavioral', pct: chartData.existential.percentage, color: '#3b82f6' },
                          ].map((row, i) => (
                            <tr key={i}>
                              <td className={tdCls}>
                                <span className="inline-block w-2 h-2 rounded-full mx-2" style={{ background: row.color }} />
                                {row.name}
                              </td>
                              <td className={`${tdCls} text-center font-bold`} style={{ color: row.color }}>{row.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table 2 — Worlds */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
                      <p className="text-xs font-semibold text-gray-400 px-4 pt-3 pb-2">
                        {isArabic ? 'العوالم' : 'Worlds'}
                      </p>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className={`${thCls} text-${isArabic ? 'right' : 'left'}`}>{isArabic ? 'العالم' : 'World'}</th>
                            <th className={`${thCls} text-center`}>{isArabic ? 'الأداء' : 'Score'}</th>
                            <th className={`${thCls} text-center`}>{isArabic ? 'التجانس' : 'Coh.'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: chartData.worldLabels?.inner       ?? (isArabic ? 'العالم الداخلي'   : 'Inner World'),       pct: chartData.worldMentalPct      ?? 0, coh: worldCoh(0), color: '#22c55e' },
                            { name: chartData.worldLabels?.physical    ?? (isArabic ? 'العالم الخارجي'   : 'Physical World'),    pct: chartData.worldEmotionalPct   ?? 0, coh: worldCoh(3), color: '#ae1f23' },
                            { name: chartData.worldLabels?.existential ?? (isArabic ? 'العالم الوجودي'   : 'Existential World'), pct: chartData.worldExistentialPct ?? 0, coh: worldCoh(6), color: '#3b82f6' },
                          ].map((row, i) => (
                            <tr key={i}>
                              <td className={tdCls}>
                                <span className="inline-block w-2 h-2 rounded-full mx-2" style={{ background: row.color }} />
                                {row.name}
                              </td>
                              <td className={`${tdCls} text-center font-bold text-white`}>{row.pct}%</td>
                              <td className={`${tdCls} text-center font-bold`} style={{ color: row.color }}>{row.coh}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table 3 — Functions (9 rows) */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
                    <div className="px-4 pt-3 pb-2 flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-400">{isArabic ? 'الوظائف التسع' : 'Nine Functions'}</p>
                      <p className="text-[10px] text-gray-600" dir="ltr">
                        {isArabic ? 'الكفاءة = (متوسط − 1) ÷ 4 × 100' : 'Efficiency = (avg − 1) ÷ 4 × 100'}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px]">
                        <thead>
                          <tr>
                            <th className={`${thCls} text-${isArabic ? 'right' : 'left'}`}>{isArabic ? 'الوظيفة' : 'Function'}</th>
                            <th className={`${thCls} text-center`} style={{ color: '#22c55e' }}>{isArabic ? 'ذهني' : 'Cog.'}</th>
                            <th className={`${thCls} text-center`} style={{ color: '#ae1f23' }}>{isArabic ? 'مشاعري' : 'Emo.'}</th>
                            <th className={`${thCls} text-center`} style={{ color: '#3b82f6' }}>{isArabic ? 'سلوكي' : 'Beh.'}</th>
                            <th className={`${thCls} text-center`}>{isArabic ? 'النسبة' : 'Avg.'}</th>
                            <th className={`${thCls} text-center`}>{isArabic ? 'الكفاءة' : 'Eff.'}</th>
                            <th className={`${thCls} text-center`}>{isArabic ? 'التجانس' : 'Coh.'}</th>
                            <th className={`${thCls} text-center w-10`} />
                          </tr>
                        </thead>
                        <tbody>
                          {fnNames.map((name, i) => {
                            const c = rc[i]?.value ?? 0
                            const e = re[i]?.value ?? 0
                            const b = rb[i]?.value ?? 0
                            const avgRaw = (c + e + b) / 3
                            const pct = Math.round(avgRaw / 5 * 100)
                            const eff = Math.round((avgRaw - 1) / 4 * 100)
                            const effColor = eff >= 75 ? '#22c55e' : eff >= 50 ? '#f59e0b' : '#ef4444'
                            const coh = fnCoh(c, e, b)
                            const cohColor = coh >= 75 ? '#22c55e' : coh >= 50 ? '#f59e0b' : '#ef4444'
                            return (
                              <tr key={i} className="hover:bg-white/2 transition">
                                <td className={`${tdCls} font-medium`}>{name}</td>
                                <td className={`${tdCls} text-center`} style={{ color: '#22c55e' }}>{c.toFixed(1)}</td>
                                <td className={`${tdCls} text-center`} style={{ color: '#ae1f23' }}>{e.toFixed(1)}</td>
                                <td className={`${tdCls} text-center`} style={{ color: '#3b82f6' }}>{b.toFixed(1)}</td>
                                <td className={`${tdCls} text-center text-gray-300`}>{pct}%</td>
                                <td className={`${tdCls} text-center font-semibold`} style={{ color: effColor }}>{eff}%</td>
                                <td className={`${tdCls} text-center font-bold`} style={{ color: cohColor }}>{coh}%</td>
                                <td className={`${tdCls} text-center`}>
                                  <button
                                    onClick={() => setDrillDown({ functionName: name, cogScore: c, emoScore: e, behScore: b, coherence: coh })}
                                    title={isArabic ? 'أسئلة تعمقية' : 'Drill-down questions'}
                                    className="transition text-base leading-none"
                                    style={{ color: savedAnalyses[name] ? '#4ade80' : '' }}
                                  >
                                    {savedAnalyses[name] ? '✓' : '🔍'}
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table 4 — 12 Indicators */}
                  {(() => {
                    const drivers = [
                      { name: isArabic ? 'الذهني'   : 'Cognitive',  pct: chartData.mental.percentage },
                      { name: isArabic ? 'المشاعري' : 'Emotional',  pct: chartData.emotional.percentage },
                      { name: isArabic ? 'السلوكي'  : 'Behavioral', pct: chartData.existential.percentage },
                    ]
                    const wlds = [
                      { name: chartData.worldLabels?.inner       ?? (isArabic ? 'الداخلي'   : 'Inner'),       pct: chartData.worldMentalPct      ?? 0 },
                      { name: chartData.worldLabels?.physical    ?? (isArabic ? 'الخارجي'   : 'Physical'),    pct: chartData.worldEmotionalPct   ?? 0 },
                      { name: chartData.worldLabels?.existential ?? (isArabic ? 'الوجودي'   : 'Existential'), pct: chartData.worldExistentialPct ?? 0 },
                    ]
                    const domDriver   = drivers.reduce((a, b) => a.pct >= b.pct ? a : b)
                    const weakDriver  = drivers.reduce((a, b) => b.pct < a.pct ? b : a)
                    const strongWorld = wlds.reduce((a, b) => a.pct >= b.pct ? a : b)
                    const weakWorld   = wlds.reduce((a, b) => b.pct < a.pct ? b : a)
                    const strongFn    = chartData.allElements[0]
                    const weakFn      = chartData.allElements[chartData.allElements.length - 1]
                    const allDriversEqual = drivers.every(d => d.pct === drivers[0].pct)
                    const allWorldsEqual  = wlds.every(w => w.pct === wlds[0].pct)
                    const allFnsEqual     = chartData.allElements.every(f => f.score === chartData.allElements[0].score)
                    const tied = isArabic ? 'متساوية' : 'Equal'
                    const driverGap   = Math.max(...drivers.map(d => d.pct)) - Math.min(...drivers.map(d => d.pct))
                    const ap          = chartData.actionPower ?? Math.round(chartData.overall * chartData.harmony / 100)

                    const rows = isArabic ? [
                      { num: 1,  label: 'كفاءة الأداء',              value: `${ap}%` },
                      { num: 2,  label: 'يقودك الجانب',              value: allDriversEqual ? tied : `${domDriver.name} (${domDriver.pct}%)` },
                      { num: 3,  label: 'متوسط الأداء العام',         value: `${chartData.overall}%` },
                      { num: 4,  label: 'التجانس العام',              value: `${chartData.harmony}%` },
                      { num: 5,  label: 'تجانس المحركات',             value: `${chartData.driverHarmony ?? '-'}%` },
                      { num: 6,  label: 'تجانس العوالم',              value: `${chartData.worldHarmony ?? '-'}%` },
                      { num: 6.5, label: 'الانسجام العام',             value: `${chartData.fnHarmony ?? '-'}%` },
                      { num: 7,  label: 'المحرك المسيطر',             value: allDriversEqual ? tied : `${domDriver.name} (${domDriver.pct}%)` },
                      { num: 8,  label: 'أقوى عالم',                  value: allWorldsEqual ? tied : `${strongWorld.name} (${strongWorld.pct}%)` },
                      { num: 9,  label: 'أضعف عالم',                  value: allWorldsEqual ? tied : `${weakWorld.name} (${weakWorld.pct}%)` },
                      { num: 10, label: 'أضعف محرك',                  value: allDriversEqual ? tied : `${weakDriver.name} (${weakDriver.pct}%)` },
                      { num: 11, label: 'أقوى وظيفة',                 value: allFnsEqual ? tied : `${strongFn?.name ?? '—'} (${(strongFn?.score ?? 0).toFixed(1)})` },
                      { num: 12, label: 'أضعف وظيفة',                 value: allFnsEqual ? tied : `${weakFn?.name ?? '—'} (${(weakFn?.score ?? 0).toFixed(1)})` },
                      { num: 13, label: 'أكبر فجوة بين المحركات',     value: `${driverGap}%` },
                    ] : [
                      { num: 1,  label: 'Performance Efficiency',    value: `${ap}%` },
                      { num: 2,  label: 'Leading Driver',            value: allDriversEqual ? tied : `${domDriver.name} (${domDriver.pct}%)` },
                      { num: 3,  label: 'Action Average',            value: `${chartData.overall}%` },
                      { num: 4,  label: 'General Harmony',           value: `${chartData.harmony}%` },
                      { num: 5,  label: 'Driver Harmony',            value: `${chartData.driverHarmony ?? '-'}%` },
                      { num: 6,  label: 'World Harmony',             value: `${chartData.worldHarmony ?? '-'}%` },
                      { num: 6.5, label: 'Overall Harmony',          value: `${chartData.fnHarmony ?? '-'}%` },
                      { num: 7,  label: 'Dominant Driver',           value: allDriversEqual ? tied : `${domDriver.name} (${domDriver.pct}%)` },
                      { num: 8,  label: 'Strongest World',           value: allWorldsEqual ? tied : `${strongWorld.name} (${strongWorld.pct}%)` },
                      { num: 9,  label: 'Weakest World',             value: allWorldsEqual ? tied : `${weakWorld.name} (${weakWorld.pct}%)` },
                      { num: 10, label: 'Weakest Driver',            value: allDriversEqual ? tied : `${weakDriver.name} (${weakDriver.pct}%)` },
                      { num: 11, label: 'Strongest Function',        value: allFnsEqual ? tied : `${strongFn?.name ?? '—'} (${(strongFn?.score ?? 0).toFixed(1)})` },
                      { num: 12, label: 'Weakest Function',          value: allFnsEqual ? tied : `${weakFn?.name ?? '—'} (${(weakFn?.score ?? 0).toFixed(1)})` },
                      { num: 13, label: 'Largest Driver Gap',        value: `${driverGap}%` },
                    ]

                    return (
                      <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
                        <p className="text-xs font-semibold text-gray-400 px-4 pt-3 pb-2">
                          {isArabic ? 'المؤشرات الـ 13' : '13 Indicators'}
                        </p>
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className={`${thCls} text-center w-8`}>#</th>
                              <th className={`${thCls} text-${isArabic ? 'right' : 'left'}`}>{isArabic ? 'المؤشر' : 'Indicator'}</th>
                              <th className={`${thCls} text-${isArabic ? 'left' : 'right'}`}>{isArabic ? 'القيمة' : 'Value'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(row => (
                              <tr key={row.num} className="hover:bg-white/2 transition">
                                <td className={`${tdCls} text-center text-gray-600 text-xs`}>{row.num}</td>
                                <td className={tdCls}>{row.label}</td>
                                <td className={`${tdCls} text-${isArabic ? 'left' : 'right'} font-semibold text-white`}>{row.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  })()}
                  {/* Table 5 — Questions & Answers */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
                    <p className="text-xs font-semibold text-gray-400 px-4 pt-3 pb-2">
                      {isArabic ? 'الأسئلة والأجوبة' : 'Questions & Answers'}
                    </p>
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className={`${thCls} text-center w-8`}>#</th>
                          <th className={`${thCls} text-${isArabic ? 'right' : 'left'}`}>{isArabic ? 'السؤال' : 'Question'}</th>
                          <th className={`${thCls} text-center w-8`}>{isArabic ? 'خام' : 'Raw'}</th>
                          <th className={`${thCls} text-center w-10`}>{isArabic ? 'فعلي' : 'Eff.'}</th>
                          <th className={`${thCls} text-${isArabic ? 'left' : 'right'}`}>{isArabic ? 'النص' : 'Label'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionnaireData.questions_with_answers.map((q, idx) => {
                          const fnIdx   = Math.floor(idx / 3)
                          const typeIdx = idx % 3
                          const typeColor = typeIdx === 0 ? '#22c55e' : typeIdx === 1 ? '#ae1f23' : '#3b82f6'
                          const typeLabel = isArabic
                            ? (typeIdx === 0 ? 'ذ' : typeIdx === 1 ? 'م' : 'س')
                            : (typeIdx === 0 ? 'C' : typeIdx === 1 ? 'E' : 'B')
                          const effectiveAnswer = q.reversed ? Math.max(1, Math.min(5, 6 - q.user_answer)) : q.user_answer
                          const scoreColor = effectiveAnswer >= 4 ? '#22c55e' : effectiveAnswer >= 3 ? '#f59e0b' : '#ef4444'
                          const isFirstInFn = typeIdx === 0
                          return (
                            <>
                              {isFirstInFn && (
                                <tr key={`fn-${fnIdx}`} className="bg-white/3">
                                  <td colSpan={5} className="py-1.5 px-3 text-xs font-bold text-gray-300">
                                    {fnNames[fnIdx]}
                                  </td>
                                </tr>
                              )}
                              <tr key={idx} className="hover:bg-white/2 transition">
                                <td className={`${tdCls} text-center text-[10px]`} style={{ color: typeColor }}>{typeLabel}</td>
                                <td className={`${tdCls} text-xs text-gray-300 max-w-[180px]`}>
                                  {q.reversed && <span className="text-amber-400 mr-1" title={isArabic ? 'سؤال معكوس' : 'Reversed'}>↺</span>}
                                  {q.text}
                                </td>
                                <td className={`${tdCls} text-center text-xs text-gray-500`}>{q.user_answer}</td>
                                <td className={`${tdCls} text-center font-bold text-sm`} style={{ color: scoreColor }}>{effectiveAnswer}</td>
                                <td className={`${tdCls} text-xs text-gray-400 text-${isArabic ? 'left' : 'right'}`}>{q.user_answer_text}</td>
                              </tr>
                            </>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
            })()}

            {/* ── Comprehensive Report Button (trainer only) ── */}
            {isTrainer && chartData && Object.keys(savedAnalyses).length > 0 && (
              <div className="px-4 pb-4" dir={isArabic ? 'rtl' : 'ltr'}>
                <button
                  onClick={() => generateComprehensiveReport(
                    reportData?.questionnaireData.language ?? 'ar',
                    reportTopic,
                    chartData
                  )}
                  disabled={generatingReport}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #166534, #15803d)' }}
                >
                  {generatingReport
                    ? (isArabic ? '⏳ جاري توليد التقرير...' : '⏳ Generating report...')
                    : (isArabic
                        ? `📋 توليد التقرير الشامل (${Object.keys(savedAnalyses).length} تحليل)`
                        : `📋 Generate Final Report (${Object.keys(savedAnalyses).length} analysis)`)}
                </button>
              </div>
            )}

            {/* Report text section */}
            {!isTrainer ? (
              <section className="flex flex-col items-center justify-center py-10 px-4" dir="rtl">
                <div className="rounded-2xl p-8 text-center w-full max-w-md" style={{ background: '#0f0f0f', border: '1px solid #2e2e2e' }}>
                  <p className="text-xl font-bold text-white mb-3">تواصل معنا لحجز جلسة التطوير الذاتي</p>
                  <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    افهم نتائجك بوضوح، واكتشف نقاط قوتك ومجالات التطوير لديك من خلال جلسة موجهة مع مختص معتمد في هارموني.
                  </p>
                  <button
                    onClick={() => chatId ? navigate(`/chat?chatId=${encodeURIComponent(chatId)}`) : navigate('/chat')}
                    className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    تحدث مع السيد هارموني
                  </button>
                </div>
              </section>
            ) : (
              /* AI Report Section — split: intro | strengths/weaknesses | rest */
              (() => {
                const split = splitAiResponse(aiResponse)
                return (
                  <>
                    {/* Intro section */}
                    {split.intro && (
                      <section className="mb-2">
                        <div className="prose prose-lg max-w-none">
                          {renderMarkdownContent(split.intro)}
                        </div>
                      </section>
                    )}

                    {/* Hard page-break marker for PDF */}
                    {split.sw && (
                      <div
                        data-pdf-newpage="true"
                        id="pdf-page-2-start"
                        style={{ height: 0, overflow: 'hidden' }}
                      />
                    )}

                    {/* Strengths & Weaknesses — lands on page 2 in PDF */}
                    {split.sw && (
                      <section className="mb-2">
                        <div className="prose prose-lg max-w-none">
                          {renderMarkdownContent(split.sw)}
                        </div>
                      </section>
                    )}

                    {/* Remaining content */}
                    {split.after && (
                      <section className="mb-2">
                        <div className="prose prose-lg max-w-none">
                          {renderMarkdownContent(split.after)}
                        </div>
                      </section>
                    )}
                  </>
                )
              })()
            )}
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

              if (chatId) {
                // Use React Router navigation to avoid page reload
                navigate(`/chat?chatId=${encodeURIComponent(chatId)}`);
              } else {
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

      {drillDown && (
        <DrillDownPanel
          {...drillDown}
          questionnaireTopic={reportTopic}
          language={reportData?.questionnaireData.language ?? 'ar'}
          alreadySaved={!!savedAnalyses[drillDown.functionName]}
          onAnalysisSaved={a => setSavedAnalyses(prev => ({ ...prev, [a.functionName]: a }))}
          onClose={() => setDrillDown(null)}
        />
      )}

      {/* ── Comprehensive Report Modal ── */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={e => { if (e.target === e.currentTarget && !generatingReport) setShowReportModal(false) }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl flex flex-col"
            style={{ background: '#111', border: '1px solid #2e2e2e', maxHeight: '88vh' }}
            dir={reportData?.questionnaireData.language === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="px-6 pt-5 pb-3 shrink-0 flex items-center justify-between border-b border-white/10">
              <div>
                <h3 className="text-white font-bold text-base">
                  {reportData?.questionnaireData.language === 'ar' ? 'التقرير الشامل' : 'Comprehensive Report'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {reportData?.questionnaireData.language === 'ar'
                    ? `بناءً على ${Object.keys(savedAnalyses).length} تحليل تعمقي`
                    : `Based on ${Object.keys(savedAnalyses).length} drill-down analysis`}
                </p>
              </div>
              {!generatingReport && (
                <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
              )}
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1 prose prose-invert max-w-none text-sm leading-relaxed">
              {generatingReport && !comprehensiveReport && (
                <p className="text-gray-500 animate-pulse">
                  {reportData?.questionnaireData.language === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}
                </p>
              )}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comprehensiveReport}
              </ReactMarkdown>
              {generatingReport && comprehensiveReport && (
                <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse rounded ml-1" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}