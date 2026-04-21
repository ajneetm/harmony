import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import {
  ChatMessage,
  TypingMessage,
  LoadingIndicator,
  ChatInput,
  Sidebar,
  WelcomeScreen,
  Questionnaire
} from '../components'
import { PlusCircle, ArrowLeft } from 'lucide-react'
import { useConversations, useAppState, actions } from '../store'
import { genAIResponseStream, generateQuestions, type Message, HARMONY_PROMPT_AR, HARMONY_PROMPT_EN, PROMPT1_AR, PROMPT1_EN, GENERAL_PROMPT_AR, GENERAL_PROMPT_EN, translations } from '../utils'
import { Globe, ChevronDown } from 'lucide-react'
import { 
  getRandomizedLifeQuestions, 
  getRandomizedFamilyQuestions, 
  getRandomizedRomanticQuestions, 
  getRandomizedWorkQuestions,
  getRandomizedCrisisQuestions 
} from '../utils/lifeQuestionnaire'
import { generateAndOpenReport } from '../utils/reportService'
import { getFontCSSProperties } from '../utils/fonts'
import { useAuth } from '../context/AuthContext'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

function ChatPage() {

  const navigate = (path: string) => {
    if (typeof window !== 'undefined' && (window as any).navigateTo) {
      (window as any).navigateTo(path);
    }
  }
  // Get chatId from URL or sessionStorage
  const urlParams = new URLSearchParams(window.location.search)
  const chatIdFromUrl = urlParams.get('chatId') || sessionStorage.getItem('restoreChatId')
  
  const {
    conversations,
    currentConversationId,
    currentConversation,
    setCurrentConversationId,
    createNewConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
  } = useConversations()
  
  const { isLoading, setLoading, language } = useAppState()
  const { user } = useAuth()
  const saveReportMutation = useMutation(api.conversations.saveReport)

  const saveReportToConvex = useCallback(async (chatId: string, reportJson: string) => {
    if (!user) return  // guests don't save to Convex
    await saveReportMutation({ id: chatId as Id<'conversations'>, reportData: reportJson })
  }, [saveReportMutation, user])

  // CRITICAL FIX: Set document direction and styles IMMEDIATELY on mount
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof document !== 'undefined') {
      // Set the page title
      document.title = 'Harmony Chat'
      
      // IMPORTANT: Set direction based on language
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = language
      
      // Apply font CSS properties based on language
      const fontProps = getFontCSSProperties(language)
      Object.entries(fontProps).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value)
        console.log(`ChatPage: Set CSS property: ${property} = ${value}`)
      })
      
      // Also apply the appropriate font class
      document.documentElement.classList.remove('font-tajawal', 'font-inter')
      const fontClass = language === 'ar' ? 'font-tajawal' : 'font-inter'
      document.documentElement.classList.add(fontClass)
      console.log(`ChatPage: Applied font class: ${fontClass} for language: ${language}`)
      
      // Ensure dark mode is applied
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      
      console.log('ChatPage mounted - Direction set to:', language === 'ar' ? 'rtl' : 'ltr')
    }
  }, [language]) // Re-run if language changes
  
  // Effect to handle fresh start from Mr. Harmony and restore conversation from URL
  useEffect(() => {
    console.log('Chat component effect - chatIdFromUrl:', chatIdFromUrl);
    console.log('Chat component effect - currentConversationId:', currentConversationId);
    
    // Check if this is a fresh Mr. Harmony start
    const isFreshStart = sessionStorage.getItem('mrHarmonyFreshStart');
    if (isFreshStart) {
      console.log('=== MR HARMONY FRESH START DETECTED ===');
      console.log('Current language will be preserved:', language);

      // Clear the flag so it doesn't affect subsequent visits
      sessionStorage.removeItem('mrHarmonyFreshStart');

      // Force complete state reset (but preserve language selection)
      actions.setConversations([]);
      actions.setCurrentConversationId(null);
      // NOTE: We do NOT set language here - it should be preserved from home page

      // Clear any local state that might interfere
      setInput('');
      setPendingMessage(null);
      setInputDisabled(true);
      setError(null);
      setShowQuestionnaire(false);
      setQuestions([]);
      setQuestionnaireResults(null);
      setLastAIResponse(null);
      setIsResponseComplete(false);
      
      console.log('=== FRESH START COMPLETE - ALL STATE RESET ===');
      return; // Don't restore any conversation
    }
    
    // Normal conversation restoration logic
    if (chatIdFromUrl && chatIdFromUrl !== currentConversationId) {
      console.log('Restoring conversation from URL:', chatIdFromUrl)
      setCurrentConversationId(chatIdFromUrl)

      // Clear chatId from URL and sessionStorage
      sessionStorage.removeItem('restoreChatId')
      const url = new URL(window.location.href)
      url.searchParams.delete('chatId')
      window.history.replaceState({}, '', url.toString())
    }
  }, [chatIdFromUrl, currentConversationId, setCurrentConversationId])

  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(
    () => currentConversation?.messages || [],
    [currentConversation]
  )
  
  // Debug logging for conversation state
  useEffect(() => {
    console.log('=== CONVERSATION STATE DEBUG ===');
    console.log('currentConversationId:', currentConversationId);
    console.log('currentConversation:', currentConversation);
    console.log('messages:', messages);
    console.log('messages.length:', messages.length);
    console.log('conversations:', conversations);
    console.log('================================');
  }, [currentConversationId, currentConversation, messages, conversations])

  // Effect to restore questionnaire state when switching conversations
  useEffect(() => {
    if (currentConversation?.questionnaireData) {
      const qData = currentConversation.questionnaireData
      console.log('Restoring questionnaire state for conversation:', currentConversationId, qData)
      
      setShowQuestionnaire(qData.showQuestionnaire)
      setQuestions(qData.questions)
      setQuestionnaireResults(qData.questionnaireResults)
    } else {
      // Clear questionnaire state if no data
      setShowQuestionnaire(false)
      setQuestions([])
      setQuestionnaireResults(null)
    }
  }, [currentConversationId, currentConversation?.questionnaireData])

  // Check if current conversation has a saved report in localStorage
  useEffect(() => {
    if (currentConversationId) {
      setHasSavedReport(!!localStorage.getItem(`report-${currentConversationId}`))
      setReportFailed(false)
    } else {
      setHasSavedReport(false)
    }
  }, [currentConversationId])

  // Local state
  const [input, setInput] = useState('')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null)
  const [error, setError] = useState<string | null>(null);
  // System prompt is now handled dynamically in processAIResponse
  const [inputDisabled, setInputDisabled] = useState(true) // Start disabled by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isThinking, setIsThinking] = useState(false) // Track AI thinking state
  const [streamingStarted, setStreamingStarted] = useState(false) // Track when streaming begins
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Questionnaire state
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questions, setQuestions] = useState<Array<{id: number, text: string}>>([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [lastAIResponse, setLastAIResponse] = useState<string | null>(null)
  const [questionnaireResults, setQuestionnaireResults] = useState<Record<number, number> | null>(null)
  const [isResponseComplete, setIsResponseComplete] = useState(false) // Track if response was completed vs stopped
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportFailed, setReportFailed] = useState(false)
  const [hasSavedReport, setHasSavedReport] = useState(false)
  const [showQuestionnaireReminder, setShowQuestionnaireReminder] = useState(false)
  const [userPressedLater, setUserPressedLater] = useState(false)

  // Language selector state
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  
  const hasMessages = messages.length > 0 || pendingMessage !== null || isThinking || showQuestionnaire

  // Check if user is in an active conversation  
  const activeConversation = conversations.find(c => c.id === currentConversationId)
  const hasActiveMessages = activeConversation && activeConversation.messages.length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    // Only allow language change if no active conversation with messages
    if (!hasActiveMessages) {
      actions.setLanguage(lang)
      setIsLanguageDropdownOpen(false)
    } else {
      // Close dropdown if can't change language
      setIsLanguageDropdownOpen(false)
    }
  }

  // Helper function to check if AI response contains structured markdown content (indicating proper harmony analysis)
  const hasStructuredContent = useCallback((content: string) => {
    // Check for markdown with bullet points, lists, or structured content
    const bulletPointRegex = /^\s*[-*+]\s+/m; // Bullet points
    const numberedListRegex = /^\s*\d+\.\s+/m; // Numbered lists
    const headerRegex = /^#{1,6}\s+/m; // Headers
    const strongTextRegex = /\*\*.*?\*\*/; // Bold text
    
    return bulletPointRegex.test(content) || 
           numberedListRegex.test(content) || 
           headerRegex.test(content) || 
           strongTextRegex.test(content);
  }, [])

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const maxScrollTop = scrollHeight - clientHeight
      
      // Mobile-friendly scroll: Try smooth first, fallback to instant
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        // For mobile: Use instant scroll for reliability
        container.scrollTop = maxScrollTop
      } else {
        // For desktop: Use smooth scroll
        try {
          container.scrollTo({
            top: maxScrollTop,
            behavior: 'smooth'
          })
        } catch (error) {
          // Fallback to instant scroll if smooth fails
          container.scrollTop = maxScrollTop
        }
      }
    }
  }, []);

  // Enhanced scroll timing for mobile devices
  useEffect(() => {
    // Don't auto-scroll when questionnaire is active
    if (showQuestionnaire) return
    
    // Longer delay for mobile to ensure DOM is fully updated
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const delay = isMobile ? 150 : 50
    
    const timer = setTimeout(scrollToBottom, delay)
    return () => clearTimeout(timer)
  }, [messages, isLoading, showQuestionnaire, scrollToBottom])

  // Scroll to questionnaire when it first appears - but not all the way to bottom
  useEffect(() => {
    if (showQuestionnaire && messagesContainerRef.current) {
      // Small delay to ensure questionnaire is rendered
      const timer = setTimeout(() => {
        const container = messagesContainerRef.current
        if (container) {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

          if (isMobile) {
            // On mobile: scroll to show top of questionnaire, not the bottom
            // Scroll to 60% of the way down instead of 100%
            const scrollHeight = container.scrollHeight
            const clientHeight = container.clientHeight
            const targetScroll = scrollHeight - clientHeight * 1.5
            container.scrollTop = Math.max(0, targetScroll)
          } else {
            // Desktop: smooth scroll
            scrollToBottom()
          }
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showQuestionnaire, scrollToBottom])

  const createTitleFromInput = useCallback((text: string) => {
    const words = text.trim().split(/\s+/)
    const firstThreeWords = words.slice(0, 3).join(' ')
    return firstThreeWords + (words.length > 3 ? '...' : '')
  }, []);

  // Helper function to process AI response with real streaming
const processAIResponse = useCallback(async (conversationId: string, userMessage: Message) => {
  try {
    let promptToUse: { value: string; enabled: boolean } | undefined
    
    // Determine which prompt to use based on conversation state
    // Count actual user messages (not initial instructions)
    const userMessages = messages.filter(m => m.role === 'user')
    
    if (userMessages.length === 0) {
      // First user message - use the original Harmony prompt for deep analysis
      console.log('Using HARMONY PROMPT for first user problem')
      promptToUse = {
        value: language === 'ar' ? PROMPT1_AR : PROMPT1_EN,
        enabled: true,
      }
    } else {
      // Subsequent messages - use the general prompt that can adapt
      console.log('Using GENERAL PROMPT for follow-up messages')
      promptToUse = {
        value: language === 'ar' ? GENERAL_PROMPT_AR : GENERAL_PROMPT_EN,
        enabled: true,
      }
    }

    console.log('Making streaming AI request with:', {
      messageCount: [...messages, userMessage].length,
      hasSystemPrompt: !!promptToUse?.enabled,
      conversationId
    });

    // Start with thinking state - no full bubble yet
    setIsThinking(true)
    setStreamingStarted(false)
    setPendingMessage(null)
    setInputDisabled(true)
    
    const streamingMessageId = (Date.now() + 1).toString()
    let fullContent = ''
    let firstChunkReceived = false
    
    // Create and store AbortController for this stream
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Use streaming API
    await genAIResponseStream(
      {
        messages: [...messages, userMessage],
        systemPrompt: promptToUse,
      },
      // onChunk: Update the message content in real-time
      (chunk: string) => {
        fullContent += chunk
        
        // On first chunk, switch from thinking to streaming
        if (!firstChunkReceived) {
          firstChunkReceived = true
          setIsThinking(false)
          setStreamingStarted(true)
          
          // Create the streaming message now that content has started
          const streamingMessage: Message = {
            id: streamingMessageId,
            role: 'assistant' as const,
            content: fullContent,
            isTyping: false, // No simulated typing, real streaming
          }
          setPendingMessage(streamingMessage)
        } else {
          // Update existing streaming message
          setPendingMessage(prev => prev ? {
            ...prev,
            content: fullContent
          } : null)
        }
        
        // Force scroll on each chunk for mobile
        setTimeout(() => {
          scrollToBottom()
        }, 10)
      },
      // onComplete: Finalize the message
      async () => {
        console.log('Streaming complete, final content length:', fullContent.length);
        abortControllerRef.current = null // Clear controller
        
        if (fullContent.trim()) {
          const finalMessage: Message = {
            id: streamingMessageId,
            role: 'assistant' as const,
            content: fullContent,
          }
          
          // Add the final message to the conversation
          await addMessage(conversationId, finalMessage)
        }
        
        // Clear all streaming states and re-enable input
        setIsThinking(false)
        setStreamingStarted(false)
        setPendingMessage(null)
        setInputDisabled(false)
        
        // Store the AI response for potential questionnaire generation
        setLastAIResponse(fullContent)
        setIsResponseComplete(true) // Mark response as complete
        
        // Show questionnaire reminder logic:
        // 1. First time: show after Harmony analysis  
        // 2. After user pressed "Later": show with every AI message (including non-Harmony)
        // 3. Never show if questionnaire completed
        if (!questionnaireResults) {
          if (!userPressedLater && hasStructuredContent(fullContent)) {
            // First time - show only after Harmony analysis
            setShowQuestionnaireReminder(true)
          } else if (userPressedLater) {
            // User pressed "Later" before - show with every AI message
            setShowQuestionnaireReminder(true)
          }
        }
      },
      // onError: Handle streaming errors
      (error: string) => {
        console.error('Streaming error:', error)
        abortControllerRef.current = null // Clear controller
        
        // If the error is from user stop, save the partial content as a message
        if (error === 'Streaming stopped by user.') {
          const partial = fullContent.trim() // Use fullContent
          if (partial) {
            const partialMessage: Message = {
              id: streamingMessageId,
              role: 'assistant' as const,
              content: partial,
            }
            addMessage(conversationId, partialMessage)
            setLastAIResponse(partial)
          }
          setIsThinking(false)
          setStreamingStarted(false)
          setPendingMessage(null)
          setInputDisabled(false)
          setIsResponseComplete(false) // Mark response as incomplete
          return
        }
        
        // Clear all streaming states
        setIsThinking(false)
        setStreamingStarted(false)
        setPendingMessage(null)
        setInputDisabled(false)
        
        // Add an error message to the conversation
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: language === 'ar' ? `عذراً، حدث خطأ: ${error}` : `Sorry, I encountered an error: ${error}`,
        }
        addMessage(conversationId, errorMessage)
        setIsResponseComplete(false) // Mark response as incomplete
      },
      abortController
    )
    
  } catch (error) {
    console.error('Error in AI response:', error)
    abortControllerRef.current = null // Clear controller
    
    // Clear all streaming states on error
    setIsThinking(false)
    setStreamingStarted(false)
    setPendingMessage(null)
    setInputDisabled(false)
    
    // Add an error message to the conversation
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: language === 'ar' ? 'عذراً، حدث خطأ أثناء توليد الرد. يرجى المحاولة مرة أخرى.' : 'Sorry, I encountered an error generating a response. Please try again.',
    }
    await addMessage(conversationId, errorMessage)
    setIsResponseComplete(false) // Mark response as incomplete
  }
}, [messages, addMessage, language, setPendingMessage, setInputDisabled, scrollToBottom])

  // Questionnaire functions
  const handleStartQuestionnaire = useCallback(async () => {
    if (!lastAIResponse || !currentConversationId) return
    
    setGeneratingQuestions(true)
    
    // Add loading message to chat with animated dots
    const loadingMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: language === 'ar' ? 'جاري إنشاء الاستبيان' : 'Generating questionnaire',
      isLoadingQuestionnaire: true, // Special flag to show animated dots
    }
    await addMessage(currentConversationId, loadingMessage)
    
    try {
      const generatedQuestions = await generateQuestions(lastAIResponse, language)
      setQuestions(generatedQuestions)
      setShowQuestionnaire(true)
      
      // Remove the loading message immediately after questionnaire is ready
      if (currentConversationId) {
        // Filter out the loading message from the current conversation
        const currentConv = conversations.find(c => c.id === currentConversationId)
        if (currentConv) {
          const filteredMessages = currentConv.messages.filter(msg => !msg.isLoadingQuestionnaire)
          // Use the store action to update conversation messages
          const updateMessages = (actions as any).updateConversationMessages
          if (updateMessages) {
            updateMessages(currentConversationId, filteredMessages)
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate questions:', error)
      setError(language === 'ar' ? 'فشل في توليد أسئلة الاستبيان. يرجى المحاولة مرة أخرى.' : 'Failed to generate questionnaire questions. Please try again.')
      
      // Remove the loading message on error as well
      if (currentConversationId) {
        const currentConv = conversations.find(c => c.id === currentConversationId)
        if (currentConv) {
          const filteredMessages = currentConv.messages.filter(msg => !msg.isLoadingQuestionnaire)
          const updateMessages = (actions as any).updateConversationMessages
          if (updateMessages) {
            updateMessages(currentConversationId, filteredMessages)
          }
        }
      }
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: language === 'ar' ? 'عذراً، حدث خطأ في إنشاء الاستبيان. يرجى المحاولة مرة أخرى.' : 'Sorry, there was an error generating the questionnaire. Please try again.',
      }
      await addMessage(currentConversationId, errorMessage)
    } finally {
      setGeneratingQuestions(false)
    }
  }, [lastAIResponse, language, currentConversationId, addMessage])

  const handleQuestionnaireComplete = useCallback(async (answers: Record<number, number>) => {
    setQuestionnaireResults(answers)
    setShowQuestionnaire(false)
    setShowQuestionnaireReminder(false) // Hide the reminder when questionnaire is completed
    setGeneratingReport(true) // Start report generation loading
    setReportFailed(false)
    
    // Create enhanced JSON with full question details + user answers
    const enhancedResults = {
      questionnaire_id: Date.now(),
      submission_time: new Date().toISOString(),
      language: language,
      questions_with_answers: questions
        .map(question => ({
          id: question.id,
          text: question.text,
          user_answer: answers[question.id] || 0,
          scale: {
            1: language === 'ar' ? 'غير موافق بشدة' : 'Strongly Disagree',
            2: language === 'ar' ? 'غير موافق' : 'Disagree', 
            3: language === 'ar' ? 'لا أعرف' : 'Neutral',
            4: language === 'ar' ? 'موافق' : 'Agree',
            5: language === 'ar' ? 'موافق بشدة' : 'Strongly Agree'
          },
          user_answer_text: answers[question.id] ?
            (language === 'ar' ?
              ['غير موافق بشدة', 'غير موافق', 'لا أعرف', 'موافق', 'موافق بشدة'][answers[question.id] - 1] :
              ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'][answers[question.id] - 1]
            ) : (language === 'ar' ? 'لا إجابة' : 'No Answer')
        }))
        .filter(q => q.user_answer > 0), // Only include answered questions
      total_questions: questions.length,
      answered_questions: Object.keys(answers).length
    }
    
    // Persist questionnaire data to conversation
    if (currentConversationId) {
      console.log('Persisting questionnaire data to conversation:', currentConversationId);
      const questionnaireData = {
        showQuestionnaire: false,
        questions,
        visualizationData: enhancedResults, // Keep for conversation persistence
        questionnaireResults: answers,
        isCompleted: true
      }
      actions.updateConversationQuestionnaire(currentConversationId, questionnaireData)
    }
    
    // Add completion message to the conversation
    const resultsMessage: Message = {
      id: (Date.now() + 3).toString(),
      role: 'assistant' as const,
      content: `${language === 'ar' ? 
        '✅ تم إكمال الاستبيان بنجاح! جاري تحضير التقرير...' : 
        '✅ Questionnaire completed successfully! Preparing your report...'
      }`
    }
    
    if (currentConversationId) {
      addMessage(currentConversationId, resultsMessage)
    }
    
    // Save results to sessionStorage so user can retry without retaking the test
    sessionStorage.setItem('pendingReportData', JSON.stringify(enhancedResults))

    // Directly generate and open report instead of showing visualization in chat
    try {
      await generateAndOpenReport(enhancedResults, undefined, currentConversationId || undefined, saveReportToConvex)
      sessionStorage.removeItem('pendingReportData')
    } catch (error) {
      console.error('Failed to generate report:', error)
      // Show error message in chat
      const errorMessage: Message = {
        id: (Date.now() + 4).toString(),
        role: 'assistant' as const,
        content: `${language === 'ar' ?
          '❌ حدث خطأ في إنشاء التقرير. اضغط على زر "إعادة المحاولة" لإعادة توليد التقرير.' :
          '❌ Failed to generate report. Click "Retry" to generate the report again.'
        }`
      }

      if (currentConversationId) {
        addMessage(currentConversationId, errorMessage)
      }
      setReportFailed(true)
    } finally {
      setGeneratingReport(false) // Stop report generation loading
    }
  }, [questions, language, currentConversationId, addMessage, actions])

  const handleViewSavedReport = useCallback(() => {
    if (!currentConversationId) return
    const raw = localStorage.getItem(`report-${currentConversationId}`)
    if (!raw) return
    sessionStorage.setItem('reportData', raw)
    const reportUrl = `?page=report&chatId=${encodeURIComponent(currentConversationId)}`
    window.location.href = window.location.origin + '/' + reportUrl
  }, [currentConversationId])

  const handleRetryReport = useCallback(async () => {
    const raw = sessionStorage.getItem('pendingReportData')
    if (!raw) return
    const enhancedResults = JSON.parse(raw)
    setReportFailed(false)
    setGeneratingReport(true)
    try {
      await generateAndOpenReport(enhancedResults, undefined, currentConversationId || undefined, saveReportToConvex)
      sessionStorage.removeItem('pendingReportData')
    } catch (error) {
      console.error('Retry failed:', error)
      setReportFailed(true)
    } finally {
      setGeneratingReport(false)
    }
  }, [currentConversationId])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const currentInput = input
    setInput('') // Clear input early for better UX
    setInputDisabled(true) // Disable input while processing
    setLoading(true)
    setError(null)
    
    const conversationTitle = createTitleFromInput(currentInput)

    try {
      // Create the user message object
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: currentInput.trim(),
      }
      
      let conversationId = currentConversationId

      // If no current conversation, create one in Convex first
      if (!conversationId) {
        try {
          console.log('Creating new Convex conversation with title:', conversationTitle)
          // Create a new conversation with our title
          const convexId = await createNewConversation(conversationTitle)
          
          if (convexId) {
            console.log('Successfully created Convex conversation with ID:', convexId)
            conversationId = convexId
            
            // Add user message directly to Convex
            console.log('Adding user message to Convex conversation:', userMessage.content)
            await addMessage(conversationId, userMessage)
          } else {
            console.warn('Failed to create Convex conversation, falling back to local')
            // Fallback to local storage if Convex creation failed
            const tempId = Date.now().toString()
            const tempConversation = {
              id: tempId,
              title: conversationTitle,
              messages: [],
            }
            
            actions.addConversation(tempConversation)
            conversationId = tempId
            
            // Add user message to local state
            actions.addMessage(conversationId, userMessage)
          }
        } catch (error) {
          console.error('Error creating conversation:', error)
          throw new Error('Failed to create conversation')
        }
      } else {
        // We already have a conversation ID, add message directly to Convex
        console.log('Adding user message to existing conversation:', conversationId)
        await addMessage(conversationId, userMessage)
        
        // Check if this is the user's first actual message (after the initial assistant message)
        // If so, update the conversation title based on their input
        const userMessages = messages.filter(m => m.role === 'user')
        if (userMessages.length === 0) {
          // This is the first user message, update the conversation title
          console.log('Updating conversation title to:', conversationTitle)
          await updateConversationTitle(conversationId, conversationTitle)
        }
      }
      
      // Process with AI after message is stored
      await processAIResponse(conversationId, userMessage)
      
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: language === 'ar' ? 'عذراً، حدث خطأ أثناء معالجة طلبك.' : 'Sorry, I encountered an error processing your request.',
      }
      if (currentConversationId) {
        await addMessage(currentConversationId, errorMessage)
      }
      else {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(language === 'ar' ? 'حدث خطأ غير معروف.' : 'An unknown error occurred.')
        }
      }
      // Re-enable input on error so user can try again
      setInputDisabled(false)
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, createTitleFromInput, currentConversationId, createNewConversation, addMessage, updateConversationTitle, processAIResponse, setLoading, messages, setInputDisabled, setError]);

  const handleNewChat = useCallback(() => {
    console.log('handleNewChat called - resetting all state');
    
    // Clean up any pending AI response/typing animation
    setPendingMessage(null)
    setLoading(false)
    setInputDisabled(true) // Keep disabled for new chats
    setError(null)
    
    // Clear thinking and streaming states
    setIsThinking(false)
    setStreamingStarted(false)
    
    // Clear questionnaire state
    setShowQuestionnaire(false)
    setQuestions([])
    setGeneratingQuestions(false)
    setLastAIResponse(null)
    setQuestionnaireResults(null)
    setIsResponseComplete(false) // Reset response completion status
    setShowQuestionnaireReminder(false)
    setUserPressedLater(false)
    
    // Clear input
    setInput('')
    
    // Reset the current conversation so the welcome screen is shown
    setCurrentConversationId(null)
    // System prompt is handled dynamically now
    
    console.log('handleNewChat completed - currentConversationId should be null');
  }, [setCurrentConversationId, setPendingMessage, setLoading, setInputDisabled, setError])
const handleCrisisQuestionnaire = useCallback(async () => {
    setQuestionnaireResults(null)
    setShowQuestionnaire(false)
    try {
      console.log('handleCrisisQuestionnaire called');
      
      const defaultTitle = language === 'ar' ? 'التعامل مع الأحداث الكبرى' : 'Dealing with Major Events'
      sessionStorage.setItem('reportTopic', language === 'ar' ? 'الأحداث الكبرى' : 'Major Events')

      console.log('Creating new conversation for Crisis questionnaire...');
      const id = await createNewConversation(defaultTitle)
      console.log('New conversation created with ID:', id);
      
      // Clear any existing pending message and set the conversation
      setPendingMessage(null)
      setCurrentConversationId(id)
      setInput('')
      setInputDisabled(false) // Enable input for questionnaire interaction
      
      // Generate fixed randomized Crisis questions
      const randomizedQuestions = getRandomizedCrisisQuestions(language)
      setQuestions(randomizedQuestions)
      
      // Small delay to ensure conversation state is set before showing questionnaire
      setTimeout(() => {
        setShowQuestionnaire(true)
        
        // Persist initial questionnaire state
        const questionnaireData = {
          showQuestionnaire: true,
          questions: randomizedQuestions,
          visualizationData: null,
          questionnaireResults: null,
          isCompleted: false
        }
        actions.updateConversationQuestionnaire(id, questionnaireData)
      }, 100)
      
      console.log('Crisis questionnaire started with', randomizedQuestions.length, 'questions');
    } catch (error) {
      console.error('Error in handleCrisisQuestionnaire:', error);
      setError(language === 'ar' ? 'فشل في إنشاء استبيان الأحداث الكبرى. يرجى المحاولة مرة أخرى.' : 'Failed to create Crisis questionnaire. Please try again.');
    }
  }, [language, createNewConversation, setCurrentConversationId, setPendingMessage, setError])
  const handleDefineProblem = useCallback(async () => {
    try {
      console.log('handleDefineProblem called - current state:', {
        currentConversationId,
        conversations: conversations.map(c => ({ id: c.id, title: c.title }))
      });
      
      const instruction = language === 'ar' ? HARMONY_PROMPT_AR : HARMONY_PROMPT_EN
      const defaultTitle = language === 'ar' ? 'مشكلة جديدة' : 'New Problem'
      
      console.log('Creating new conversation for problem definition...');
      const id = await createNewConversation(defaultTitle)
      console.log('New conversation created with ID:', id);
      
      // Clear any existing pending message and set the conversation
      setPendingMessage(null)
      setCurrentConversationId(id)
      setInput('')
      
      console.log('State updated - currentConversationId set to:', id);
      
      // Create the typing message as pendingMessage instead of adding directly
      const typingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: instruction,
        isTyping: true,
        isInitialInstruction: true
      }
      
      console.log('Setting initial instruction as pending message with typing effect:', {
        messageId: typingMessage.id,
        contentLength: instruction.length,
        newConversationId: id
      });
      setPendingMessage(typingMessage)
    } catch (error) {
      console.error('Error in handleDefineProblem:', error);
      setError(language === 'ar' ? 'فشل في إنشاء محادثة جديدة. يرجى المحاولة مرة أخرى.' : 'Failed to create new conversation. Please try again.');
    }
  }, [language, createNewConversation, setCurrentConversationId, setPendingMessage, setError, setInputDisabled])

  const handleLifeQuestionnaire = useCallback(async () => {
    setQuestionnaireResults(null)
    setShowQuestionnaire(false)
    try {
      console.log('handleLifeQuestionnaire called');
      
      const defaultTitle = language === 'ar' ? 'علاقتي بالحياة' : 'My Relationship with Life'
      sessionStorage.setItem('reportTopic', language === 'ar' ? 'الحياة العامة' : 'Life')

      console.log('Creating new conversation for Life questionnaire...');
      const id = await createNewConversation(defaultTitle)
      console.log('New conversation created with ID:', id);
      
      // Clear any existing pending message and set the conversation
      setPendingMessage(null)
      setCurrentConversationId(id)
      setInput('')
      setInputDisabled(false) // Enable input for questionnaire interaction
      
      // Generate fixed randomized Life questions
      const randomizedQuestions = getRandomizedLifeQuestions(language)
      setQuestions(randomizedQuestions)
      
      // Small delay to ensure conversation state is set before showing questionnaire
      setTimeout(() => {
        setShowQuestionnaire(true)
        
        // Persist initial questionnaire state
        const questionnaireData = {
          showQuestionnaire: true,
          questions: randomizedQuestions,
          visualizationData: null,
          questionnaireResults: null,
          isCompleted: false
        }
        actions.updateConversationQuestionnaire(id, questionnaireData)
      }, 100)
      
      console.log('Life questionnaire started with', randomizedQuestions.length, 'questions');
    } catch (error) {
      console.error('Error in handleLifeQuestionnaire:', error);
      setError(language === 'ar' ? 'فشل في إنشاء استبيان الحياة. يرجى المحاولة مرة أخرى.' : 'Failed to create Life questionnaire. Please try again.');
    }
  }, [language, createNewConversation, setCurrentConversationId, setPendingMessage, setError])

  const handleFamilyQuestionnaire = useCallback(async () => {
    setQuestionnaireResults(null)
    setShowQuestionnaire(false)
    try {
      console.log('handleFamilyQuestionnaire called');
      
      const defaultTitle = language === 'ar' ? 'علاقتي بالأسرة' : 'My Relationship with Family'
      sessionStorage.setItem('reportTopic', language === 'ar' ? 'الشؤون الأسرية' : 'Family')

      console.log('Creating new conversation for Family questionnaire...');
      const id = await createNewConversation(defaultTitle)
      console.log('New conversation created with ID:', id);
      
      // Clear any existing pending message and set the conversation
      setPendingMessage(null)
      setCurrentConversationId(id)
      setInput('')
      setInputDisabled(false) // Enable input for questionnaire interaction
      
      // Generate fixed randomized Family questions
      const randomizedQuestions = getRandomizedFamilyQuestions(language)
      setQuestions(randomizedQuestions)
      
      // Small delay to ensure conversation state is set before showing questionnaire
      setTimeout(() => {
        setShowQuestionnaire(true)
        
        // Persist initial questionnaire state
        const questionnaireData = {
          showQuestionnaire: true,
          questions: randomizedQuestions,
          visualizationData: null,
          questionnaireResults: null,
          isCompleted: false
        }
        actions.updateConversationQuestionnaire(id, questionnaireData)
      }, 100)
      
      console.log('Family questionnaire started with', randomizedQuestions.length, 'questions');
    } catch (error) {
      console.error('Error in handleFamilyQuestionnaire:', error);
      setError(language === 'ar' ? 'فشل في إنشاء استبيان الأسرة. يرجى المحاولة مرة أخرى.' : 'Failed to create Family questionnaire. Please try again.');
    }
  }, [language, createNewConversation, setCurrentConversationId, setPendingMessage, setError])

  const handleRomanticQuestionnaire = useCallback(async () => {
    setQuestionnaireResults(null)
    setShowQuestionnaire(false)
    try {
      console.log('handleRomanticQuestionnaire called');
      
      const defaultTitle = language === 'ar' ? 'علاقتي بالشريك ' : 'My Relationship with Emotions'
      sessionStorage.setItem('reportTopic', language === 'ar' ? 'العلاقات العاطفية' : 'Emotions')

      console.log('Creating new conversation for Emotions questionnaire...');
      const id = await createNewConversation(defaultTitle)
      console.log('New conversation created with ID:', id);
      
      // Clear any existing pending message and set the conversation
      setPendingMessage(null)
      setCurrentConversationId(id)
      setInput('')
      setInputDisabled(false) // Enable input for questionnaire interaction
      
      // Generate fixed randomized Romantic questions
      const randomizedQuestions = getRandomizedRomanticQuestions(language)
      setQuestions(randomizedQuestions)
      
      // Small delay to ensure conversation state is set before showing questionnaire
      setTimeout(() => {
        setShowQuestionnaire(true)
        
        // Persist initial questionnaire state
        const questionnaireData = {
          showQuestionnaire: true,
          questions: randomizedQuestions,
          visualizationData: null,
          questionnaireResults: null,
          isCompleted: false
        }
        actions.updateConversationQuestionnaire(id, questionnaireData)
      }, 100)
      
      console.log('Romantic questionnaire started with', randomizedQuestions.length, 'questions');
    } catch (error) {
      console.error('Error in handleRomanticQuestionnaire:', error);
      setError(language === 'ar' ? 'فشل في إنشاء الاستبيان العاطفي. يرجى المحاولة مرة أخرى.' : 'Failed to create Romantic questionnaire. Please try again.');
    }
  }, [language, createNewConversation, setCurrentConversationId, setPendingMessage, setError])

  const handleWorkQuestionnaire = useCallback(async () => {
    setQuestionnaireResults(null)
    setShowQuestionnaire(false)
    try {
      console.log('handleWorkQuestionnaire called');
      
      const defaultTitle = language === 'ar' ? 'علاقتي بالعمل' : 'My Relationship with Work'
      sessionStorage.setItem('reportTopic', language === 'ar' ? 'المسار المهني' : 'Work')

      console.log('Creating new conversation for Work questionnaire...');
      const id = await createNewConversation(defaultTitle)
      console.log('New conversation created with ID:', id);
      
      // Clear any existing pending message and set the conversation
      setPendingMessage(null)
      setCurrentConversationId(id)
      setInput('')
      setInputDisabled(false) // Enable input for questionnaire interaction
      
      // Generate fixed randomized Work questions
      const randomizedQuestions = getRandomizedWorkQuestions(language)
      setQuestions(randomizedQuestions)
      
      // Small delay to ensure conversation state is set before showing questionnaire
      setTimeout(() => {
        setShowQuestionnaire(true)
        
        // Persist initial questionnaire state
        const questionnaireData = {
          showQuestionnaire: true,
          questions: randomizedQuestions,
          visualizationData: null,
          questionnaireResults: null,
          isCompleted: false
        }
        actions.updateConversationQuestionnaire(id, questionnaireData)
      }, 100)
      
      console.log('Work questionnaire started with', randomizedQuestions.length, 'questions');
    } catch (error) {
      console.error('Error in handleWorkQuestionnaire:', error);
      setError(language === 'ar' ? 'فشل في إنشاء استبيان العمل. يرجى المحاولة مرة أخرى.' : 'Failed to create Work questionnaire. Please try again.');
    }
  }, [language, createNewConversation, setCurrentConversationId, setPendingMessage, setError])

  

  const handleDeleteChat = useCallback(async (id: string) => {
    await deleteConversation(id)
  }, [deleteConversation]);

  const handleUpdateChatTitle = useCallback(async (id: string, title: string) => {
    await updateConversationTitle(id, title)
    setEditingChatId(null)
    setEditingTitle('')
  }, [updateConversationTitle]);

  // Stop streaming handler
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <div className={`flex flex-col h-full pt-16 md:pt-0 ${
        language === 'ar' 
          ? (sidebarCollapsed ? 'md:mr-12' : 'md:mr-64')
          : (sidebarCollapsed ? 'md:ml-12' : 'md:ml-64')
      }`}>
          {error && (
            <p className="w-full max-w-3xl p-4 mx-auto font-bold text-red-600">{error}</p>
          )}

          {/* View saved report banner */}
          {hasSavedReport && !generatingReport && (
            <div className="w-full max-w-3xl mx-auto px-4 pt-3">
              <button
                onClick={handleViewSavedReport}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {language === 'ar' ? '📊 عرض التقرير السابق' : '📊 View Previous Report'}
              </button>
            </div>
          )}

          {hasMessages ? (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 pb-24 overflow-y-auto"
            >
              <div className="w-full max-w-3xl px-4 mx-auto pt-4 md:pt-2">
                {/* Always show existing messages, only hide when loading for user requests */}
                {[
                    // Filter out any messages that match the pending message ID to avoid duplicates
                    ...messages.filter(msg => !pendingMessage || msg.id !== pendingMessage.id),
                    pendingMessage
                  ]
                  .filter((message): message is Message => message !== null)
                  .map((message, index, array) => {
                    const isLastMessage = index === array.length - 1
                    
                    
                    return (
                      <div key={message.id}>
                        {message.isTyping ? (
                          <TypingMessage 
                            message={message} 
                            typingSpeed={5}
                            onTypingProgress={scrollToBottom}
                            onTypingComplete={async () => {
                              // Capture the conversation ID at completion time
                              const conversationAtCompletion = currentConversationId
                              
                              // When typing completes, save the message to the conversation
                              console.log('Typing completed, saving message to conversation')
                              setPendingMessage(null)
                              
                              // Safety check: only proceed if we still have the same valid conversation
                              if (conversationAtCompletion && message.content.trim() && conversationAtCompletion === currentConversationId) {
                                // Add the final message without typing flag
                                const finalMessage: Message = {
                                  ...message,
                                  isTyping: false
                                }
                                await addMessage(conversationAtCompletion, finalMessage)
                                
                                // Handle input state based on message type
                                if (message.isInitialInstruction) {
                                  // For initial instructions: re-enable input so user can ask their question
                                  setInputDisabled(false)
                                } else {
                                  // For AI responses: keep input enabled for continued conversation
                                  setInputDisabled(false)
                                }
                              }
                            }}
                          />
                        ) : (
                          <ChatMessage message={message} />
                        )}
                        
                        {/* Questionnaire button removed - now handled by floating reminder */}
                        
                        {/* Retry button when report generation failed */}
                        {reportFailed && isLastMessage && (
                          <div className="mt-4 mb-4 flex justify-center">
                            <button
                              onClick={handleRetryReport}
                              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                              {language === 'ar' ? '🔄 إعادة المحاولة' : '🔄 Retry'}
                            </button>
                          </div>
                        )}

                        {/* Show report generation loading after questionnaire completion */}
                        {generatingReport && isLastMessage && (
                          <div className="mt-4 mb-4 animate-fadeIn">
                            <div className={`flex justify-center items-center ${
                              language === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'
                            }`}>
                              {language === 'ar' ? (
                                // Arabic: Text first, then dots
                                <>
                                  <span className="text-white font-medium">
                                    جاري إنشاء التقرير...
                                  </span>
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                </>
                              ) : (
                                // English: Dots first, then text
                                <>
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                  <span className="text-white font-medium">
                                    Generating Report...
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                
                                 {/* Show questionnaire when active */}
                 {showQuestionnaire && (
                   <div className="mt-6 mb-6">
                     <Questionnaire
                       questions={questions}
                       onComplete={handleQuestionnaireComplete}
                     />
                   </div>
                 )}
                
                {/* Show thinking indicator while AI is thinking but hasn't started streaming */}
                {isThinking && !streamingStarted && <LoadingIndicator />}
                
                {/* Show loading indicator only when generating new AI response (for other loading states) */}
                {isLoading && !isThinking && <LoadingIndicator />}
              </div>
            </div>

            {/* Input */}
            
            <ChatInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={showQuestionnaire} // Only disable for questionnaire, not streaming
              sidebarCollapsed={sidebarCollapsed}
              isStreaming={streamingStarted}
              onStopStreaming={handleStopStreaming}
            />
          </>
          ) : (
            <WelcomeScreen
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={inputDisabled}
              onDefineProblem={handleDefineProblem}
              onCrisisQuestionnaire={handleCrisisQuestionnaire}
              onLifeQuestionnaire={handleLifeQuestionnaire}
              onFamilyQuestionnaire={handleFamilyQuestionnaire}
              onRomanticQuestionnaire={handleRomanticQuestionnaire}
              onWorkQuestionnaire={handleWorkQuestionnaire}
              
            />
          )}
      </div>

      {/* Sidebar - Always show on desktop, drawer on mobile */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        handleNewChat={handleNewChat}
        setCurrentConversationId={setCurrentConversationId}
        handleDeleteChat={handleDeleteChat}
        editingChatId={editingChatId}
        setEditingChatId={setEditingChatId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        handleUpdateChatTitle={handleUpdateChatTitle}
        onCollapseChange={setSidebarCollapsed}
        isAiResponding={pendingMessage !== null || isLoading}
      />

      {/* Language Dropdown - positioned based on language */}
      <div className={`fixed top-3 md:top-4 z-30 ${
        language === 'ar' ? 'left-4' : 'right-4'
      }`} ref={dropdownRef}>
        <button
          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 backdrop-blur-sm text-white rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm ${
            hasActiveMessages 
              ? 'bg-gray-600/70 border-gray-600 cursor-not-allowed opacity-60' 
              : 'bg-gray-800/90 border-gray-700 hover:bg-gray-700 cursor-pointer'
          }`}
          disabled={hasActiveMessages}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden md:inline font-medium">{language.toUpperCase()}</span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isLanguageDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isLanguageDropdownOpen && !hasActiveMessages && (
          <div className={`absolute top-full mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[120px] z-40 ${
            language === 'ar' ? 'left-0' : 'right-0'
          }`}>
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                language === 'en' ? 'bg-red-600 text-white' : 'text-gray-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              English
            </button>
            <button
              onClick={() => handleLanguageSelect('ar')}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                language === 'ar' ? 'bg-red-600 text-white' : 'text-gray-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              العربية
            </button>
          </div>
        )}
      </div>

      {/* Floating Questionnaire Reminder - Appears after Harmony analysis */}
      {showQuestionnaireReminder && !questionnaireResults && (
        <div className={`fixed z-40 ${
          // Mobile: higher up, constrained width in chat area, Desktop: lower and positioned over chat content
          'bottom-32 left-4 right-4 md:bottom-28 md:left-1/2 md:transform md:-translate-x-1/2 md:max-w-sm'
        }`}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-2 animate-pulse mx-auto max-w-fit">
            <div className="text-center">
              <h3 className="font-semibold text-xs mb-1">
                {language === 'ar' ? 'احصل على تحليل أعمق لمشكلتك' : '💡 Get Deeper Insights!'}
              </h3>
              <p className="text-xs opacity-90 mb-1.5 leading-tight">
                {language === 'ar' 
                  ? 'قم بعمل الاستبيان التقييمي'
                  : 'Take our assessment'
                }
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setShowQuestionnaireReminder(false)
                    handleStartQuestionnaire()
                  }}
                  disabled={generatingQuestions}
                  className="bg-white text-blue-600 px-2.5 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  {generatingQuestions 
                    ? (language === 'ar' ? 'جاري التحضير...' : 'Preparing...')
                    : (language === 'ar' ? 'ابدأ الآن' : 'Start Now')
                  }
                </button>
                <button
                  onClick={() => {
                    setShowQuestionnaireReminder(false)
                    setUserPressedLater(true) // Mark that user pressed "Later" - will show with every AI response now
                  }}
                  className="bg-white/20 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-white/30 transition-colors"
                >
                  {language === 'ar' ? 'لاحقاً' : 'Later'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating New Chat Button - Above input on mobile */}
      <button
        onClick={handleNewChat}
        disabled={pendingMessage !== null || isLoading}
        className={`fixed bottom-[114px] z-[40] md:hidden w-10 h-10 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200 ${
          language === 'ar' ? 'left-4' : 'right-4'
        } ${
          pendingMessage !== null || isLoading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-red-600 text-white hover:opacity-90 hover:shadow-xl'
        }`}
        title={pendingMessage !== null || isLoading ? 'Please wait for AI response to complete' : translations[language].newChat}
      >
        <PlusCircle className="w-4 h-4" />
      </button>
    </div>
  )
}

export default ChatPage