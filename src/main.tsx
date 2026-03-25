import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexClientProvider } from './convex'
import HeroSection from './pages/HeroSection'
import ChatPage from './pages/ChatPage'
import ReportPage from './pages/ReportPage'
import NotFound from './pages/NotFound'
import { FontProvider } from './components'
import { getFontCSSProperties } from './utils/fonts'
import './styles.css'

// Initialize Sentry if DSN is available
if (import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then(({ init }) => {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
    })
  })
}

// Create a global navigation function that can be used anywhere
(window as any).navigateTo = (path: string) => {
  console.log('navigateTo called with path:', path)
  
  // Check if this is a Mr. Harmony fresh start - if so, don't clear conversation ID
  // as the ChatPage will handle the complete reset
  const isFreshStart = sessionStorage.getItem('mrHarmonyFreshStart');
  
  // Clear conversation ID for fresh chat (but not during Mr. Harmony fresh start)
  if (path === '/chat' && !isFreshStart) {
    localStorage.removeItem('currentConversationId')
    console.log('Cleared conversation for fresh chat')
  }
  
  // Update URL with query parameter
  const url = new URL(window.location.href)
  if (path === '/') {
    url.searchParams.delete('page')
  } else {
    url.searchParams.set('page', path.substring(1)) // Remove leading slash
  }
  
  console.log('Updating URL to:', url.toString())
  
  // Use pushState to update URL and trigger popstate
  window.history.pushState({}, '', url.toString())
  
  // Dispatch a custom event to trigger re-render
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const App = () => {
  const [currentPath, setCurrentPath] = useState('/')
  
  useEffect(() => {
    // Function to get current path from query parameter
    const getCurrentPath = () => {
      const params = new URLSearchParams(window.location.search)
      const page = params.get('page')
      
      if (page === 'chat') return '/chat'
      if (page === 'report') return '/report'
      return '/'
    }
    
    // Set initial path
    const initialPath = getCurrentPath()
    setCurrentPath(initialPath)
    console.log('Initial route:', initialPath)
    console.log('Initial URL:', window.location.href)
    
    // Get the stored language preference or default to English
    const getStoredLanguage = (): 'ar' | 'en' => {
      try {
        const stored = localStorage.getItem('language')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed === 'ar' || parsed === 'en') {
            return parsed
          }
        }
      } catch (error) {
        console.error('Failed to load language from localStorage:', error)
      }
      return 'en' // Default to English
    }

    const initialLanguage = getStoredLanguage()

    // Apply font based on the stored language preference
    const defaultFontProps = getFontCSSProperties(initialLanguage)
    Object.entries(defaultFontProps).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value)
      console.log(`Set CSS property: ${property} = ${value}`)
    })

    // Also apply the appropriate font class to document root
    const fontClass = initialLanguage === 'ar' ? 'font-tajawal' : 'font-inter'
    document.documentElement.classList.add(fontClass)
    console.log(`Applied initial font class: ${fontClass} for language: ${initialLanguage}`)
    
    // Listen for URL changes (browser back/forward and our custom navigation)
    const handleUrlChange = () => {
      const newPath = getCurrentPath()
      console.log('Route changed to:', newPath)
      console.log('Current URL:', window.location.href)
      setCurrentPath(newPath)
    }
    
    window.addEventListener('popstate', handleUrlChange)
    
    // Clean up any hash from previous routing system
    if (window.location.hash) {
      console.log('Cleaning up old hash:', window.location.hash)
      const url = new URL(window.location.href)
      url.hash = ''
      window.history.replaceState({}, '', url.toString())
    }
    
    return () => window.removeEventListener('popstate', handleUrlChange)
  }, [])
  
  // Log current state
  useEffect(() => {
    console.log('Current route:', currentPath)
    console.log('Current URL:', window.location.href)
  }, [currentPath])
  
  // Render the appropriate component
  let component
  switch(currentPath) {
    case '/':
      component = <HeroSection />
      break
    case '/chat':
      component = <ChatPage />
      break
    case '/report':
      component = <ReportPage />
      break
    default:
      component = <NotFound />
  }
  
  return (
    <ConvexClientProvider>
      <FontProvider>
        {component}
      </FontProvider>
    </ConvexClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)