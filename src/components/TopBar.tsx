import { Globe, ChevronDown, Menu, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppState } from '../store'

interface TopBarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function TopBar({ onMenuToggle, isMobileMenuOpen }: TopBarProps) {
  const { language, setLanguage, conversations, currentConversationId } = useAppState()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Check if user is in an active conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const hasMessages = currentConversation && currentConversation.messages.length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    // Only allow language change if no active conversation with messages
    if (!hasMessages) {
      setLanguage(lang)
      setIsOpen(false)
    } else {
      // Show a brief indication that language can't be changed
      setIsOpen(false)
      // You could add a toast notification here if desired
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-3 md:p-4 backdrop-blur-sm bg-black/80 border-b border-red-600/20">
      {/* Language Dropdown - positioned on the left */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 backdrop-blur-sm text-white rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm ${
            hasMessages 
              ? 'bg-gray-600/70 border-gray-600 cursor-not-allowed opacity-60' 
              : 'bg-gray-800/90 border-gray-700 hover:bg-gray-700 cursor-pointer'
          }`}
          disabled={hasMessages}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden md:inline font-medium">{language.toUpperCase()}</span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !hasMessages && (
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

      {/* Mobile menu button - positioned on the right for RTL layout */}
      <button
        onClick={onMenuToggle}
        className="flex md:hidden items-center justify-center w-10 h-10 text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </div>
  )
}
