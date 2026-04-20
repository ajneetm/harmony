import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexClientProvider } from './convex'
import HeroSection from './pages/HeroSection'
import ChatPage from './pages/ChatPage'
import ReportPage from './pages/ReportPage'
import AuthPage from './pages/AuthPage'
import NotFound from './pages/NotFound'
import { FontProvider } from './components'
import { getFontCSSProperties } from './utils/fonts'
import { AuthProvider, useAuth } from './context/AuthContext'
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

function AppRouter({ currentPath }: { currentPath: string }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Protected routes
  if ((currentPath === '/chat' || currentPath === '/report') && !user) {
    ;(window as any).navigateTo('/auth')
    return null
  }

  switch (currentPath) {
    case '/':      return <HeroSection />
    case '/chat':  return <ChatPage />
    case '/report':return <ReportPage />
    case '/auth':  return user ? ((() => { (window as any).navigateTo('/chat'); return null })()) : <AuthPage />
    default:       return <NotFound />
  }
}

const App = () => {
  const [currentPath, setCurrentPath] = useState('/')
  
  useEffect(() => {
    // Function to get current path from query parameter
    const getCurrentPath = () => {
      const params = new URLSearchParams(window.location.search)
      const page = params.get('page')
      
      if (page === 'chat')   return '/chat'
      if (page === 'report') return '/report'
      if (page === 'auth')   return '/auth'
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
  
  return (
    <ConvexClientProvider>
      <AuthProvider>
        <FontProvider>
          <AppRouter currentPath={currentPath} />
        </FontProvider>
      </AuthProvider>
    </ConvexClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)