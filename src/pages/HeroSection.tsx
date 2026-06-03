import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown, Menu, X, User } from 'lucide-react'
import { getFontCSSProperties } from '../utils/fonts'
import { useAppState } from '../store'
import { translations } from '../utils/translations'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'a.hajali@ajnee.com'

export default function HeroSection() {
  const { language, setLanguage } = useAppState()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktopLangOpen, setIsDesktopLangOpen] = useState(false)
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isTrainer, setIsTrainer] = useState(false)
  const [showContact, setShowContact] = useState(false)
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

  useEffect(() => {
    if (!user) { setIsTrainer(false); return }
    if (user.email === ADMIN_EMAIL) { setIsTrainer(true); return }
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => setIsTrainer(data?.role === 'trainer' || data?.role === 'admin'))
  }, [user])

  const handleChatRedirect = () => {
    if (!isTrainer) { setShowContact(true); return }
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
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab.id === item.id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
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
        <div className={`w-full max-w-[1440px] mx-auto px-8 flex h-full ${!isAr ? 'flex-row-reverse' : ''}`}>

          {/* Faces image — always left */}
          <div className="w-[55%] flex items-center justify-center overflow-hidden">
            <img
              src="/faces.png"
              alt="Harmony Faces"
              className="h-[72%] w-auto object-contain grayscale brightness-75"
            />
          </div>

          {/* Info panel — always right, text direction per language */}
          <div className={`w-[45%] flex flex-col justify-center gap-8 items-start ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
            {/* Logo */}
            <button onClick={() => { if ((window as any).navigateTo) (window as any).navigateTo('/') }}>
              <img src="/misbara_full_logo.svg" alt="Harmony Logo" className="h-28 object-contain" />
            </button>

            {/* Active tab title + content */}
            <div className={`flex flex-col gap-2 w-full ${isAr ? 'text-right' : 'text-left'}`}>
              <h2 className="text-2xl font-bold text-[#FFBD00]">
                {activeTab.title}{qMark}
              </h2>
              <p className="text-base text-gray-300 leading-relaxed">
                {activeTab.content}
              </p>
            </div>

            {/* Subtitle + CTA */}
            <div className="flex flex-col gap-3 w-full items-start">
              <p className={`text-xl font-bold text-white leading-snug ${isAr ? 'text-right' : 'text-left'}`}>
                {t.welcomeSubtitle}
              </p>
              <button
                onClick={handleChatRedirect}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-2xl text-base font-bold transition-all shadow-[0_10px_35px_rgba(220,38,38,0.35)] active:scale-95"
              >
                {hero.talkToHarmony}
              </button>

              {/* Partner logos — always LTR order */}
              <div className="flex items-end gap-6 mt-4" dir="ltr">
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

      {/* Contact overlay for non-trainers */}
      {showContact && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setShowContact(false)}
        >
          <div
            className="rounded-2xl p-8 text-center w-full max-w-sm"
            style={{ background: '#0f0f0f', border: '1px solid #2e2e2e' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 left-4 text-gray-500 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <p className="text-xl font-bold text-white mb-2" dir="rtl">احصل على تقريرك الكامل</p>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed" dir="rtl">
              تقرير هارموني يُعدّ حصرياً من قِبَل مختص معتمد.<br />
              تواصل معنا لتحديد موعد وتحليل نتائجك بشكل دقيق.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/31000003"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#25D366' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                31000003
              </a>
              <a
                href="mailto:contact@ajnee.com"
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#a0aec0' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                contact@ajnee.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
