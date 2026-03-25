import React, { useEffect } from 'react'
import { useAppState } from '../store'

interface FontProviderProps {
  children: React.ReactNode
  className?: string
}

/**
 * FontProvider component that automatically applies the correct font class
 * based on the current language. This ensures consistent typography throughout the app.
 */
export const FontProvider: React.FC<FontProviderProps> = ({ children, className = '' }) => {
  const { language } = useAppState()
  
  // Apply the appropriate font class based on language
  const fontClass = language === 'ar' ? 'font-tajawal' : 'font-inter'
  
  // Apply font to document root when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Remove existing font classes
      document.documentElement.classList.remove('font-tajawal', 'font-inter')
      // Add current font class
      document.documentElement.classList.add(fontClass)
      
      console.log('FontProvider: Applied font class:', fontClass, 'for language:', language)
    }
  }, [language, fontClass])
  
  return (
    <div className={`${fontClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Hook to get the current font class based on language
 * @returns The appropriate font class for the current language
 */
export const useFontClass = () => {
  const { language } = useAppState()
  return language === 'ar' ? 'font-tajawal' : 'font-inter'
}
