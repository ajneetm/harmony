import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { genAIResponse, getReportPrompt } from './'

// Function to add custom font support for Arabic
const addArabicFontSupport = (doc: jsPDF) => {
  try {
    // For Arabic text, we'll use a more robust approach
    // Note: jsPDF doesn't natively support Tajawal, so we'll use helvetica
    // which handles Arabic text reasonably well
    doc.setFont('helvetica')
    return true
  } catch (error) {
    console.warn('Could not set Arabic font, using default:', error)
    return false
  }
}

// Function to add English font support
const addEnglishFontSupport = (doc: jsPDF) => {
  try {
    // For English text, use helvetica which is clean and readable
    doc.setFont('helvetica')
    return true
  } catch (error) {
    console.warn('Could not set English font, using default:', error)
    return false
  }
}

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

// Function to format answers for AI prompt
const formatAnswersForPrompt = (data: QuestionnaireData): string => {
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

// Function to generate AI report
const generateAIReport = async (data: QuestionnaireData): Promise<string> => {
  try {
    const { language } = data
    
    // Import the chart data generation and AI report functions
    const { generateReport } = await import('./ai')
    const { generateChartData } = await import('./reportService')
    
    // Generate chart data first (same as in reportService.ts)
    const chartData = generateChartData(data)
    
    // Use the new generateReport function with chart data
    const aiResponse = await generateReport(data, chartData, language)
    
    if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
      throw new Error('Empty AI response received')
    }
    
    return aiResponse.trim()
  } catch (error) {
    console.error('Error generating AI report:', error)
    throw new Error('Failed to generate AI report')
  }
}

// Function to add Arabic text with RTL support
const addArabicText = (doc: jsPDF, text: string, x: number, y: number, options: {
  fontSize?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
} = {}) => {
  const { fontSize = 12, maxWidth = 170, align = 'right', lineHeight = 7 } = options
  
  doc.setFontSize(fontSize)
  
  // For Arabic text, we'll use a more robust approach
  // Split text into words and handle RTL manually
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  // Build lines word by word, respecting maxWidth
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = doc.getTextWidth(testLine)
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  let currentY = y
  
  lines.forEach((line: string) => {
    let textX = x
    
    // Adjust X position based on alignment
    if (align === 'center') {
      const textWidth = doc.getTextWidth(line)
      textX = x - (textWidth / 2)
    } else if (align === 'right') {
      const textWidth = doc.getTextWidth(line)
      textX = x - textWidth
    }
    
    // Add the text with better positioning for Arabic
    doc.text(line, textX, currentY, { 
      align: align === 'center' ? 'center' : 'right'
    })
    currentY += lineHeight
  })
  
  return currentY
}

// Function to add English text
const addEnglishText = (doc: jsPDF, text: string, x: number, y: number, options: {
  fontSize?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
} = {}) => {
  const { fontSize = 12, maxWidth = 170, align = 'left', lineHeight = 7 } = options
  
  doc.setFontSize(fontSize)
  
  const lines = doc.splitTextToSize(text, maxWidth)
  
  let currentY = y
  
  lines.forEach((line: string) => {
    let textX = x
    
    if (align === 'center') {
      const textWidth = doc.getTextWidth(line)
      textX = x + (maxWidth - textWidth) / 2
    } else if (align === 'right') {
      const textWidth = doc.getTextWidth(line)
      textX = x + maxWidth - textWidth
    }
    
    doc.text(line, textX, currentY)
    currentY += lineHeight
  })
  
  return currentY
}

// Function to parse and add markdown content
const addMarkdownContent = (doc: jsPDF, content: string, startX: number, startY: number, isArabic: boolean, maxWidth: number = 170): number => {
  const lines = content.split('\n')
  let currentY = startY
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) {
      currentY += 5
      continue
    }
    
    // Headers
    if (trimmedLine.startsWith('###')) {
      const headerText = trimmedLine.replace('###', '').trim()
      doc.setFont('helvetica', 'bold')
      
      if (isArabic) {
        currentY = addArabicText(doc, headerText, startX + maxWidth, currentY, {
          fontSize: 14,
          maxWidth,
          align: 'right',
          lineHeight: 8
        })
      } else {
        currentY = addEnglishText(doc, headerText, startX, currentY, {
          fontSize: 14,
          maxWidth,
          align: 'left',
          lineHeight: 8
        })
      }
      
      doc.setFont('helvetica', 'normal')
      currentY += 5
    }
    else if (trimmedLine.startsWith('##')) {
      const headerText = trimmedLine.replace('##', '').trim()
      doc.setFont('helvetica', 'bold')
      
      if (isArabic) {
        currentY = addArabicText(doc, headerText, startX + maxWidth, currentY, {
          fontSize: 16,
          maxWidth,
          align: 'right',
          lineHeight: 9
        })
      } else {
        currentY = addEnglishText(doc, headerText, startX, currentY, {
          fontSize: 16,
          maxWidth,
          align: 'left',
          lineHeight: 9
        })
      }
      
      doc.setFont('helvetica', 'normal')
      currentY += 8
    }
    else if (trimmedLine.startsWith('#')) {
      const headerText = trimmedLine.replace('#', '').trim()
      doc.setFont('helvetica', 'bold')
      
      if (isArabic) {
        currentY = addArabicText(doc, headerText, startX + maxWidth, currentY, {
          fontSize: 18,
          maxWidth,
          align: 'right',
          lineHeight: 10
        })
      } else {
        currentY = addEnglishText(doc, headerText, startX, currentY, {
          fontSize: 18,
          maxWidth,
          align: 'left',
          lineHeight: 10
        })
      }
      
      doc.setFont('helvetica', 'normal')
      currentY += 10
    }
    // Bold text (simple **text** support)
    else if (trimmedLine.includes('**')) {
      doc.setFont('helvetica', 'bold')
      const cleanText = trimmedLine.replace(/\*\*/g, '')
      
      if (isArabic) {
        currentY = addArabicText(doc, cleanText, startX + maxWidth, currentY, {
          fontSize: 12,
          maxWidth,
          align: 'right'
        })
      } else {
        currentY = addEnglishText(doc, cleanText, startX, currentY, {
          fontSize: 12,
          maxWidth,
          align: 'left'
        })
      }
      
      doc.setFont('helvetica', 'normal')
      currentY += 3
    }
    // Bullet points
    else if (trimmedLine.startsWith('- ')) {
      const bulletText = trimmedLine.replace('- ', '')
      
      if (isArabic) {
        currentY = addArabicText(doc, `• ${bulletText}`, startX + maxWidth, currentY, {
          fontSize: 11,
          maxWidth: maxWidth - 10,
          align: 'right'
        })
      } else {
        currentY = addEnglishText(doc, `• ${bulletText}`, startX + 5, currentY, {
          fontSize: 11,
          maxWidth: maxWidth - 10,
          align: 'left'
        })
      }
      
      currentY += 2
    }
    // Regular text
    else {
      if (isArabic) {
        currentY = addArabicText(doc, trimmedLine, startX + maxWidth, currentY, {
          fontSize: 11,
          maxWidth,
          align: 'right'
        })
      } else {
        currentY = addEnglishText(doc, trimmedLine, startX, currentY, {
          fontSize: 11,
          maxWidth,
          align: 'left'
        })
      }
      
      currentY += 3
    }
    
    // Add new page if content is too long
    if (currentY > 280) {
      doc.addPage()
      currentY = 20
    }
  }
  
  return currentY
}

export const generateQuestionnairePDF = async (
  data: QuestionnaireData,
  visualizationElement?: HTMLElement
): Promise<void> => {
  const { language, submission_time } = data
  const isArabic = language === 'ar'

  try {
    console.log('Generating AI report...')
    const aiReportContent = await generateAIReport(data)
    
    console.log('AI report generated successfully, creating PDF with jsPDF...')
    
    // Create new jsPDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Set default font and enable language-specific font support
    if (isArabic) {
      addArabicFontSupport(doc)
      console.log('Arabic font support enabled')
    } else {
      addEnglishFontSupport(doc)
      console.log('English font support enabled')
    }
    
    let currentY = 20
    
    // Add main title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    
    const mainTitle = isArabic ? 'تقرير التحليل النفسي' : 'Psychological Analysis Report'
    
    if (isArabic) {
      currentY = addArabicText(doc, mainTitle, 190, currentY, {
        fontSize: 20,
        maxWidth: 170,
        align: 'center'
      })
    } else {
      currentY = addEnglishText(doc, mainTitle, 20, currentY, {
        fontSize: 20,
        maxWidth: 170,
        align: 'center'
      })
    }
    
    doc.setFont('helvetica', 'normal')
    currentY += 15
    
    // Add date
    const dateStr = new Date(submission_time).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const dateText = `${isArabic ? 'تاريخ التقرير: ' : 'Report Date: '}${dateStr}`
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    
    if (isArabic) {
      currentY = addArabicText(doc, dateText, 190, currentY, {
        fontSize: 12,
        maxWidth: 170,
        align: 'center'
      })
    } else {
      currentY = addEnglishText(doc, dateText, 20, currentY, {
        fontSize: 12,
        maxWidth: 170,
        align: 'center'
      })
    }
    
    doc.setTextColor(0, 0, 0)
    currentY += 20
    
    // Add visualization if provided
    if (visualizationElement) {
      try {
        console.log('Capturing visualization...')
        const canvas = await html2canvas(visualizationElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 150
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // Center the image
        const imgX = (210 - imgWidth) / 2
        
        // Add visualization title
        const vizTitle = isArabic ? 'الرسوم البيانية للنتائج' : 'Results Visualization'
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        
        if (isArabic) {
          currentY = addArabicText(doc, vizTitle, 190, currentY, {
            fontSize: 16,
            maxWidth: 170,
            align: 'center'
          })
        } else {
          currentY = addEnglishText(doc, vizTitle, 20, currentY, {
            fontSize: 16,
            maxWidth: 170,
            align: 'center'
          })
        }
        
        currentY += 10
        
        doc.addImage(imgData, 'PNG', imgX, currentY, imgWidth, imgHeight)
        currentY += imgHeight + 20
        
        doc.setFont('helvetica', 'normal')
        
        // Add new page for the report
        if (currentY > 200) {
          doc.addPage()
          currentY = 20
        }
        
      } catch (error) {
        console.error('Error adding visualization to PDF:', error)
      }
    }
    
    // Add AI report content
    currentY = addMarkdownContent(doc, aiReportContent, 20, currentY, isArabic)
    
    // Add footer
    const footer = isArabic ? 'تم إنشاء هذا التقرير بواسطة نظام مسبرة' : 'Generated by Misbara System'
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    
    if (isArabic) {
      addArabicText(doc, footer, 190, 285, {
        fontSize: 10,
        maxWidth: 170,
        align: 'center'
      })
    } else {
      addEnglishText(doc, footer, 20, 285, {
        fontSize: 10,
        maxWidth: 170,
        align: 'center'
      })
    }
    
    // Download the PDF
    const dateTimestamp = new Date().toISOString().slice(0, 10)
    
    // Detect questionnaire type based on questions content
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
    
    let fileName: string
    if (isLifeQuestionnaire) {
      fileName = `${isArabic ? 'تقرير_علاقتي_بالحياة' : 'life_relationship_report'}_${dateTimestamp}.pdf`
    } else if (isFamilyQuestionnaire) {
      fileName = `${isArabic ? 'تقرير_علاقتي_بالأسرة' : 'family_relationship_report'}_${dateTimestamp}.pdf`
    } else if (isRomanticQuestionnaire) {
      fileName = `${isArabic ? 'تقرير_علاقتي_الحسية' : 'romantic_relationship_report'}_${dateTimestamp}.pdf`
    } else if (isWorkQuestionnaire) {
      fileName = `${isArabic ? 'تقرير_علاقتي_بالعمل' : 'work_relationship_report'}_${dateTimestamp}.pdf`
    } else {
      fileName = `${isArabic ? 'تقرير_التحليل_النفسي' : 'psychological_analysis_report'}_${dateTimestamp}.pdf`
    }
    
    doc.save(fileName)
    
    console.log('PDF generated successfully with jsPDF!')

  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error)
    throw error
  }
} 
