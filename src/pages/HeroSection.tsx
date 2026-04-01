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
    const handleScroll = () => setScrolled(window.scrollY > 20)
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
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
      
      {/* --- الـ Navbar --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md py-2 border-b border-red-600/10' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
          
          {/* جهة الروابط: النص أحمر، والمحدد خلفية حمراء ونص أبيض */}
          <div className="flex-1 hidden xl:flex items-center gap-1 order-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item)}
                className={`text-[13px] px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  activeTab.id === item.id 
                    ? 'bg-red-600 text-white font-bold' 
                    : 'text-white-600 hover:bg-red-600/10'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* جهة الأدوات */}
          <div className="flex items-center gap-3 order-2">
            <div className="relative" ref={dropdownRefDesktop}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 text-xs border border-red-600/20 rounded-full hover:bg-red-600/5 transition-all text-red-600 font-bold"
              >
                <Globe className="w-4 h-4 text-red-600" />
                <span className="uppercase font-bold">{language}</span>
                <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangOpen && (
                <div className="absolute top-full mt-2 bg-gray-900 border border-red-600/20 rounded-lg shadow-2xl overflow-hidden min-w-[100px] z-[110]">
                  <button onClick={() => handleLanguageSelect('ar')} className="w-full px-4 py-2 text-right text-xs hover:bg-red-600 text-white transition-colors">العربية</button>
                  <button onClick={() => handleLanguageSelect('en')} className="w-full px-4 py-2 text-right text-xs hover:bg-red-600 text-white transition-colors">English</button>
                </div>
              )}
            </div>

            <button className="flex items-center justify-center p-2.5 bg-red-600 hover:bg-red-700 rounded-full transition-all shadow-lg shadow-red-600/20">
              <User size={18} className="text-white" />
            </button>

            <button className="xl:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={26} className="text-red-600" /> : <Menu size={26} className="text-red-600" />}
            </button>
          </div>
        </div>

        {/* منيو الجوال */}
        {menuOpen && (
          <div className="xl:hidden bg-black/98 absolute w-full left-0 p-6 border-b border-red-600/20 flex flex-col gap-4 animate-slideIn">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item); setMenuOpen(false); }} className={`text-right text-lg py-1 ${activeTab.id === item.id ? 'text-red-600 font-bold' : 'text-red-400'}`}>
                {item.title}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* --- المحتوى الرئيسي --- */}
      <div className="min-h-screen flex items-center justify-center px-4 pt-32 pb-16">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-start space-y-6 animate-fadeIn">
            <img src="/misbara_full_logo.svg" alt="Misbara Logo" className="h-24 lg:h-32 mb-4" />
            
            <div className="w-full">
              {/* النص الفرعي يبقى باللون الأصفر الذهبي */}
              <h3 className="text-xl font-bold text-[#FFBD00] mb-4">{activeTab.title}</h3>
              <p className="text-base font-light text-gray-300 leading-relaxed max-w-xl">{activeTab.short}</p>
            </div>
            
            <div className="w-full pt-4">
              {/* العنوان الرئيسي: أصفر ذهبي وحجم 25px */}
              <h1 
                className="font-black leading-tight mb-8" 
                style={{ fontSize: '22px', color: 'white' }}
              >
                {t.mainHeading}
              </h1>
              
              {/* زر دردش: أحمر */}
              <button
                onClick={handleChatRedirect}
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-full text-xl font-bold transition-all shadow-lg shadow-red-600/30 transform hover:scale-105"
              >
                {language === 'ar' ? 'دردش مع مستر هارموني' : 'Chat with Mr. Harmony'}
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center relative order-last md:order-none">
            <div className="absolute inset-0 bg-red-600/5 blur-[120px] rounded-full"></div>
            <img 
              src="/faces.png" 
              alt="Harmony Faces" 
              className="relative rounded-2xl object-cover w-full h-auto max-lg shadow-2xl transition-transform duration-500 hover:scale-[1.02]" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}