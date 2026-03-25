import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import { AiIcon } from './icons/AiIcons'
import type { Message } from '../utils/ai'

interface TypingMessageProps {
  message: Message
  onTypingComplete?: () => void
  onTypingProgress?: () => void
  typingSpeed?: number
}

export const TypingMessage = ({ 
  message, 
  onTypingComplete, 
  onTypingProgress,
  typingSpeed = 30 
}: TypingMessageProps) => {
  // Detect mobile for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const optimizedSpeed = isMobile ? Math.max(typingSpeed * 0.7, 15) : typingSpeed // Faster on mobile
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  
  // Use refs to track state that shouldn't cause re-renders
  const animationStateRef = useRef({
    isAnimating: false,
    currentIndex: 0,
    messageId: '',
    fullText: ''
  })
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const fullText = message.content || ''
    const messageId = message.id
    
    // Skip if already animating this exact message
    if (animationStateRef.current.isAnimating && 
        animationStateRef.current.messageId === messageId &&
        animationStateRef.current.fullText === fullText) {
      console.log('Animation already in progress for this message, skipping')
      return
    }

    // Clean up any existing animation
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }

    // Reset state for new message
    console.log('Starting typing animation for:', fullText.substring(0, 50) + '...')
    animationStateRef.current = {
      isAnimating: true,
      currentIndex: 0,
      messageId: messageId,
      fullText: fullText
    }
    
    setDisplayedText('')
    setIsTyping(true)

    const typeText = () => {
      const state = animationStateRef.current
      
      // Safety check: ensure we're still animating the same message
      if (!state.isAnimating || state.messageId !== messageId || state.fullText !== fullText) {
        console.log('Animation cancelled or message changed')
        return
      }

      console.log(`Typing: ${state.currentIndex}/${fullText.length} - "${fullText.charAt(state.currentIndex)}"`)
      
      if (state.currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, state.currentIndex + 1))
        state.currentIndex++
        
        // Trigger scroll during typing
        if (onTypingProgress) {
          try {
            onTypingProgress()
          } catch (error) {
            console.warn('Error in onTypingProgress:', error)
          }
        }
        
        timeoutRef.current = setTimeout(typeText, optimizedSpeed) as unknown as number
      } else {
        console.log('Typing animation completed!')
        state.isAnimating = false
        setIsTyping(false)
        if (onTypingComplete) {
          onTypingComplete()
        }
      }
    }

    // Start typing
    if (fullText) {
      typeText()
    } else {
      // No content to type
      animationStateRef.current.isAnimating = false
      setIsTyping(false)
    }
    
    // Cleanup function
    return () => {
      console.log('Cleaning up typing animation')
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
      animationStateRef.current.isAnimating = false
    }
  }, [message.content, message.id, optimizedSpeed])

  return (
    <div className="py-1 animate-fadeIn">
      <div
        className={`chat-message flex items-start w-full max-w-3xl gap-4 mx-auto rounded-lg p-4 ${
          message.role === 'assistant' ? 'bg-[#141414]' : 'bg-[#262626]'
        }`}
        style={
          message.role === 'assistant'
            ? {
                borderLeft: '4px solid',
                borderImage:
                  'linear-gradient(to bottom, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #8800ff) 1',
              }
            : undefined
        }
        tabIndex={0}
              >
          {message.role === 'assistant' && (
            <AiIcon className="flex-shrink-0 w-12 h-12 ml-4" />
          )}
          
          <div className="flex-1 min-w-0 mr-4">
          <div className="overflow-hidden">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                components={{
                  table: ({ children, ...props }) => (
                    <div className="table-wrapper overflow-x-auto md:overflow-x-visible">
                      <table {...props}>{children}</table>
                    </div>
                  ),
                }}
              >
                {displayedText}
              </ReactMarkdown>
            </div>
            {isTyping && (
              <span className="inline-block w-2 h-5 ml-1 bg-red-600 animate-pulse"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 