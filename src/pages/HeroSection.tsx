import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown, Menu, X, User } from 'lucide-react'
import { getFontCSSProperties } from '../utils/fonts'
import { useAppState } from '../store'
import { translations } from '../utils/translations'

export default function HeroSection() {
  const { language, setLanguage } = useAppState()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRefDesktop = useRef<HTMLDivElement>(null)

  const t = translations[language].hero

  const menuItems = [
    { id: 'who', title: t.whoWeAre, content: t.whoWeAreContent, short: t.aboutShort },
    { id: 'vision', title: t.ourVision, content: t.ourVisionContent, short: t.ourVisionContent },
    { id: 'mission', title: t.ourMission, content: t.ourMissionContent, short: t.ourMissionContent },
    { id: 'platform', title: t.aboutPlatform, content: t.aboutPlatformContent, short: t.aboutPlatformContent },
    { id: 'why', title: t.whyChooseUs, content: t.whyChooseUsContent, short: t.whyChooseUsContent },
    { id: 'services', title: t.ourServices, content: t.ourServicesContent, short: t.ourServicesContent }
  ]

  const [activeTab, setActiveTab] = useState(menuItems[0])

  useEffect(() => {
    const current = menuItems.find(item => item.id === activeTab.id)
    if (current) setActiveTab(current)
  }, [language])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = language
      const fontProps = getFontCSSProperties(language)
      Object.entries(fontProps).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value)
      })
      const fontClass = language === 'ar' ? 'font-tajawal' : 'font-inter'
      document.documentElement.classList.remove('font-tajawal', 'font-inter')
      document.documentElement.classList.add(fontClass)
    }
  }, [language])

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    setLanguage(lang)
    setIsLangOpen(false)
  }

  const handleChatRedirect = () => {
    localStorage.removeItem('currentConversationId');
    sessionStorage.removeItem('reportData');
    sessionStorage.setItem('mrHarmonyFreshStart', 'true');
    if (typeof window !== 'undefined' && (window as any).navigateTo) {
      (window as any).navigateTo('/chat');
    }
  }

  return (
    <div className="h-screen bg-black text-white font-sans relative overflow-hidden">
      
      {/* --- Navbar --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md py-2' : 'bg-transparent py-4 md:py-6'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-14 md:h-16">
          
          {/* Desktop Menu */}
          <div className="flex-1 hidden xl:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item)}
                className={`text-[13px] px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  activeTab.id === item.id 
                    ? 'bg-red-600 text-white font-bold' 
                    : 'text-gray-400 hover:bg-red-600/10'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Tools */}
          <div className="flex items-center gap-3 ms-auto">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-[11px] border border-red-600/30 rounded-full text-red-600 font-bold uppercase"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language}</span>
                <ChevronDown size={12} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangOpen && (
                <div className="absolute top-full mt-2 bg-gray-900 border border-red-600/20 rounded-lg shadow-2xl overflow-hidden min-w-[100px] z-[110]">
                  <button onClick={() => handleLanguageSelect('ar')} className="w-full px-4 py-2 text-right text-xs hover:bg-red-600 text-white">العربية</button>
                  <button onClick={() => handleLanguageSelect('en')} className="w-full px-4 py-2 text-left text-xs hover:bg-red-600 text-white">English</button>
                </div>
              )}
            </div>

            <button className="p-2 bg-red-600 rounded-full shadow-lg shadow-red-600/20">
              <User size={16} className="text-white" />
            </button>

            <button className="xl:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} className="text-red-600" /> : <Menu size={24} className="text-red-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="xl:hidden bg-black/98 absolute w-full left-0 p-6 border-b border-red-600/20 flex flex-col gap-4 animate-slideIn">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item); setMenuOpen(false); }} className={`text-right text-lg py-1 ${activeTab.id === item.id ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                {item.title}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* --- Main Content Section (Optimized for Mobile Viewport) --- */}
      <main className="h-full flex flex-col items-center justify-center px-6 pt-20 pb-8 overflow-hidden">
        <div className="max-w-md w-full flex flex-col items-center text-center h-full justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          
          {/* 1. Logo */}
          <div className="flex-shrink-0 animate-fadeIn pt-2">
            <img 
              src="/misbara_full_logo.svg" 
              alt="Misbara Logo" 
              className="h-20 md:h-28 object-contain" 
            />
          </div>
          
          {/* 2. Text Content */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
            <h3 className="text-xl md:text-2xl font-bold text-[#FFBD00]">
              {activeTab.title}؟
            </h3>
            <p className="text-[14px] md:text-lg font-light text-gray-300 leading-relaxed max-w-[280px] md:max-w-xl line-clamp-3 md:line-clamp-none">
              {activeTab.short}
            </p>
          </div>

          {/* 3. Faces Image (Fills remaining space) */}
          <div className="relative flex-grow flex items-center justify-center w-full min-h-0 py-4">
            <div className="absolute inset-0 bg-red-600/5 blur-[80px] rounded-full"></div>
            <img 
              src="/faces.png" 
              alt="Harmony Faces" 
              className="max-h-full max-w-full object-contain grayscale brightness-90 transition-transform duration-700" 
            />
          </div>

          {/* 4. Action Button */}
          <div className="w-full flex-shrink-0 pb-4">
            <button
              onClick={handleChatRedirect}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-lg font-bold transition-all shadow-[0_10px_35px_rgba(220,38,38,0.35)] active:scale-95 transform"
            >
              {language === 'ar' ? 'دردش مع السيد هارموني' : 'Chat with Mr. Harmony'}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}