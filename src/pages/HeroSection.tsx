import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown, Menu, X, User } from 'lucide-react'
import { getFontCSSProperties } from '../utils/fonts'
import { useAppState } from '../store'
import { translations } from '../utils/translations'

export default function HeroSection() {
  const { language, setLanguage } = useAppState()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktopLangOpen, setIsDesktopLangOpen] = useState(false)
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const desktopLangRef = useRef<HTMLDivElement>(null)
  const mobileLangRef = useRef<HTMLDivElement>(null)

  const t = translations[language]
  const hero = t.hero
  const isAr = language === 'ar'
  const qMark = isAr ? '؟' : '?'

  const menuItems = [
    { id: 'who',      title: hero.whoWeAre,      content: hero.whoWeAreContent },
    { id: 'vision',   title: hero.ourVision,     content: hero.ourVisionContent },
    { id: 'mission',  title: hero.ourMission,    content: hero.ourMissionContent },
    { id: 'platform', title: hero.aboutPlatform, content: hero.aboutPlatformContent },
    { id: 'why',      title: hero.whyChooseUs,   content: hero.whyChooseUsContent },
    { id: 'services', title: hero.ourServices,   content: hero.ourServicesContent },
  ]

  const [activeTab, setActiveTab] = useState(menuItems[0])

  useEffect(() => {
    const found = menuItems.find(item => item.id === activeTab.id)
    if (found) setActiveTab(found)
  }, [language])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopLangRef.current && !desktopLangRef.current.contains(e.target as Node))
        setIsDesktopLangOpen(false)
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target as Node))
        setIsMobileLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dir = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    const fontProps = getFontCSSProperties(language)
    Object.entries(fontProps).forEach(([p, v]) =>
      document.documentElement.style.setProperty(p, v)
    )
    document.documentElement.classList.remove('font-tajawal', 'font-inter')
    document.documentElement.classList.add(isAr ? 'font-tajawal' : 'font-inter')
  }, [language])

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    setLanguage(lang)
    setIsDesktopLangOpen(false)
    setIsMobileLangOpen(false)
  }

  const handleChatRedirect = () => {
    localStorage.removeItem('currentConversationId')
    sessionStorage.removeItem('reportData')
    sessionStorage.setItem('mrHarmonyFreshStart', 'true')
    if (typeof window !== 'undefined' && (window as any).navigateTo) {
      (window as any).navigateTo('/chat')
    }
  }

  /* ─────────────────── LANGUAGE DROPDOWN ─────────────────── */
  const LangDropdown = ({ isOpen, setOpen, refProp }: {
    isOpen: boolean
    setOpen: (v: boolean) => void
    refProp: React.RefObject<HTMLDivElement>
  }) => (
    <div className="relative" ref={refProp}>
      <button
        onClick={() => setOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-red-600/40 rounded-full text-red-500 font-bold uppercase hover:bg-red-600/10 transition"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{language}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`absolute top-full mt-2 bg-gray-900 border border-red-600/20 rounded-xl shadow-2xl overflow-hidden z-[110] ${isAr ? 'left-0' : 'right-0'}`}>
          <div className="flex" dir="ltr">
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`px-5 py-2.5 text-sm hover:bg-red-600 text-white transition text-left ${language === 'en' ? 'bg-red-600/20' : ''}`}
            >
              EN
            </button>
            <div className="w-px bg-red-600/20" />
            <button
              onClick={() => handleLanguageSelect('ar')}
              className={`px-5 py-2.5 text-sm hover:bg-red-600 text-white transition text-right ${language === 'ar' ? 'bg-red-600/20' : ''}`}
            >
              AR
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="h-screen bg-black text-white font-sans relative overflow-hidden">

      {/* ════════════════════ NAVBAR ════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'
      }`}>

        {/* ── Desktop Navbar (xl+) ── */}
        <div className="hidden xl:flex items-center h-16 max-w-[1440px] mx-auto px-8 gap-4" dir={isAr ? 'rtl' : 'ltr'}>
          {/* Nav items — first in DOM = appears at start side (right in AR, left in EN) */}
          <div className="flex-1 flex items-center justify-start gap-1">
            {menuItems.map(item => (
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

          {/* User + Language — second in DOM = appears at end side (left in AR, right in EN) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => (window as any).navigateTo('/auth')} className="p-2 bg-red-600 rounded-full shadow-lg shadow-red-600/20">
              <User size={16} className="text-white" />
            </button>
            <LangDropdown isOpen={isDesktopLangOpen} setOpen={setIsDesktopLangOpen} refProp={desktopLangRef} />
          </div>
        </div>

        {/* ── Mobile Navbar (<xl) ── */}
        <div
          className="flex xl:hidden items-center h-14 px-4 gap-2"
          dir="ltr"
        >
          {/* Start side: Hamburger + User */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-white/5 transition"
            >
              {menuOpen
                ? <X size={22} className="text-red-500" />
                : <Menu size={22} className="text-red-500" />}
            </button>
            <button onClick={() => (window as any).navigateTo('/auth')} className="p-2 bg-red-600 rounded-full shadow-lg shadow-red-600/20">
              <User size={16} className="text-white" />
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* End side: Language */}
          <LangDropdown isOpen={isMobileLangOpen} setOpen={setIsMobileLangOpen} refProp={mobileLangRef} />
        </div>
      </nav>

      {/* ── Mobile slide-down menu ── */}
      {menuOpen && (
        <div className="xl:hidden fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute top-[56px] left-0 right-0 bg-[#0f0f0f] border-b border-red-600/20 shadow-2xl"
            onClick={e => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="px-5 py-4 grid grid-cols-2 gap-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item); setMenuOpen(false) }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab.id === item.id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MOBILE MAIN (< xl) ════════════════════ */}
      <main
        className="xl:hidden h-full flex flex-col items-center justify-center px-6 pt-16 pb-6 overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="max-w-md w-full flex flex-col items-center text-center h-full justify-between">

          {/* Logo */}
          <button className="flex-shrink-0 pt-2" onClick={() => { if ((window as any).navigateTo) (window as any).navigateTo('/') }}>
            <img src="/misbara_full_logo.svg" alt="Logo" className="h-20 object-contain" />
          </button>

          {/* Active tab content */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0 px-2 mt-4">
            <h3 className="text-xl font-bold text-[#FFBD00]">
              {activeTab.title}{qMark}
            </h3>
            <p className="text-[13px] font-light text-gray-300 leading-relaxed max-w-[300px] line-clamp-3">
              {activeTab.content}
            </p>
          </div>

          {/* Faces image */}
          <div className="relative flex-grow flex items-center justify-center w-full min-h-0 py-3">
            <div className="absolute inset-0 bg-red-600/5 blur-[80px] rounded-full" />
            <img
              src="/faces.png"
              alt="Harmony Faces"
              className="max-h-full max-w-full object-contain grayscale brightness-90"
            />
          </div>

          {/* Partner logos + CTA */}
          <div className="w-full flex-shrink-0 pb-3 flex flex-col items-center gap-3">
            <div className="flex items-end justify-center gap-5" dir="ltr">
              {[
                { src: '/LOIDA.png', label: isAr ? 'الموزع'  : 'Distributor', link: 'https://www.loidabritish.com/' },
                { src: '/AJNEE.png', label: isAr ? 'المبتكر' : 'Innovator',   link: 'https://www.ajnee.com/' },
                { src: '/CPD.png',   label: isAr ? 'المعتمد' : 'Accredited',  link: 'https://www.cpduk.co.uk/courses/loida-british-self-leadership-towards-broader-horizons-through-the-harmony-technique' },
              ].map(({ src, label, link }) => (
                <div key={src} className="flex flex-col items-center gap-1">
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      <img src={src} alt={label} className="h-[80px] w-[80px] object-contain opacity-75 hover:opacity-100 transition-opacity cursor-pointer" />
                    </a>
                  ) : (
                    <img src={src} alt={label} className="h-[80px] w-[80px] object-contain opacity-75" />
                  )}
                  <span className="text-[10px] text-white/50">{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleChatRedirect}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-lg font-bold transition-all shadow-[0_10px_35px_rgba(220,38,38,0.35)] active:scale-95"
            >
              {isAr ? 'دردش مع السيد هارموني' : 'Chat with Mr. Harmony'}
            </button>
          </div>
        </div>
      </main>

      {/* ════════════════════ DESKTOP MAIN (xl+) ════════════════════ */}
      <main className="hidden xl:flex h-full pt-16" dir="ltr">
        {/* Constrained container — same as navbar */}
        <div className="w-full max-w-[1440px] mx-auto px-8 flex h-full">

          {/* Left: Faces image */}
          <div className="w-[55%] flex items-center justify-center overflow-hidden">
            <img
              src="/faces.png"
              alt="Harmony Faces"
              className="h-[72%] w-auto object-contain grayscale brightness-75"
            />
          </div>

          {/* Right: Info panel */}
          <div className="w-[45%] flex flex-col items-end text-right justify-center gap-8">
            {/* Logo */}
            <button onClick={() => { if ((window as any).navigateTo) (window as any).navigateTo('/') }}>
              <img
                src="/misbara_full_logo.svg"
                alt="Harmony Logo"
                className="h-28 object-contain"
              />
            </button>

            {/* Active tab title + content */}
            <div className="flex flex-col gap-2 w-full">
              <h2 className="text-2xl font-bold text-[#FFBD00]">
                {activeTab.title}{qMark}
              </h2>
              <p className="text-base text-gray-300 leading-relaxed">
                {activeTab.content}
              </p>
            </div>

            {/* Subtitle + CTA */}
            <div className="flex flex-col gap-3 w-full items-end">
              <p className="text-xl font-bold text-white leading-snug">
                {t.welcomeSubtitle}
              </p>
              <button
                onClick={handleChatRedirect}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-2xl text-base font-bold transition-all shadow-[0_10px_35px_rgba(220,38,38,0.35)] active:scale-95"
              >
                {hero.talkToHarmony}
              </button>

              {/* Partner logos */}
              <div className="flex items-end gap-6 mt-0" dir="ltr">
                {[
                  { src: '/LOIDA.png', label: isAr ? 'الموزع'  : 'Distributor', link: 'https://www.loidabritish.com/' },
                  { src: '/AJNEE.png', label: isAr ? 'المبتكر' : 'Innovator',   link: 'https://www.ajnee.com/' },
                  { src: '/CPD.png',   label: isAr ? 'المعتمد' : 'Accredited',  link: 'https://www.cpduk.co.uk/courses/loida-british-self-leadership-towards-broader-horizons-through-the-harmony-technique' },
                ].map(({ src, label, link }) => (
                  <div key={src} className="flex flex-col items-center gap-1">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      <img src={src} alt={label} className="h-[80px] w-[80px] object-contain opacity-75 hover:opacity-100 transition-opacity cursor-pointer" />
                    </a>
                    <span className="text-[10px] text-white/50">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
