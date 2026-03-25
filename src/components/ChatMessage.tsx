import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import { User } from 'lucide-react'
import type { Message } from '../utils/ai'
import { AiIcon } from './icons/AiIcons'

export const ChatMessage = ({ message }: { message: Message }) => (
  <div className="py-1">
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
      {message.role === 'assistant' ? (
        <AiIcon className="flex-shrink-0 w-12 h-12 ml-4" />
      ) : (
        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-medium text-white bg-black rounded-lg">
          <User className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0 mr-4">
        <div className="overflow-hidden">
          {message.isLoadingQuestionnaire ? (
            // Special loading display for questionnaire generation
            <div className="flex items-center gap-3">
              <div className="text-lg font-medium text-gray-300">{message.content}</div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-red-600 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-red-600 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          ) : (
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
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
