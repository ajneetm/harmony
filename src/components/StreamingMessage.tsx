import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import { AiIcon } from './icons/AiIcons'
import type { Message } from '../utils/ai'
import { genAIResponseStream } from '../utils/ai'

interface StreamingMessageProps {
  messages: Array<Message>
  systemPrompt?: { value: string; enabled: boolean }
  onComplete: (content: string) => void
  onError: (error: string) => void
  onProgress?: () => void
}

export const StreamingMessage = ({ 
  messages, 
  systemPrompt,
  onComplete,
  onError,
  onProgress
}: StreamingMessageProps) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(true)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    console.log('Starting real-time OpenAI streaming...')
    
    genAIResponseStream(
      { messages, systemPrompt },
      // onChunk - called for each piece of text
      (chunk: string) => {
        setDisplayedText(prev => {
          const newText = prev + chunk
          // Trigger scroll on each chunk
          if (onProgress) {
            setTimeout(onProgress, 0)
          }
          return newText
        })
      },
      // onComplete - called when streaming finishes
      () => {
        console.log('Streaming completed!')
        setIsStreaming(false)
        onComplete(displayedText)
      },
      // onError - called if there's an error
      (error: string) => {
        console.error('Streaming error:', error)
        setIsStreaming(false)
        onError(error)
      }
    )

    return () => {
      setIsStreaming(false)
    }
  }, [messages, systemPrompt, onComplete, onError, onProgress, displayedText])

  return (
    <div className="py-1 animate-fadeIn">
      <div
        className="chat-message flex items-start w-full max-w-3xl gap-4 mx-auto rounded-lg p-4 bg-[#141414]"
        style={{
          borderLeft: '4px solid',
          borderImage:
            'linear-gradient(to bottom, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #8800ff) 1',
        }}
        tabIndex={0}
      >
        <AiIcon className="flex-shrink-0 w-12 h-12 ml-4" />
        
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
                {displayedText || ''}
              </ReactMarkdown>
            </div>
            {isStreaming && (
              <span className="inline-block w-2 h-5 ml-1 bg-red-600 animate-pulse"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 