import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { getFontCSSProperties } from '../utils/fonts'
import { useAppState } from '../store'
import { translations } from '../utils/translations'

export default function HeroSection() {
  const { language, setLanguage } = useAppState()
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownRefDesktop = useRef<HTMLDivElement>(null)

  const t = translations[language].hero

  // Check on mount and reset to English if no valid language is set
  useEffect(() => {
    const storedLang = localStorage.getItem('language')
    console.log('HeroSection mounted - stored language:', storedLang)
    console.log('HeroSection mounted - current language:', language)

    // If stored language is null or invalid, OR if it's the old string format 'ar' instead of '"ar"'
    if (!storedLang || (storedLang !== '"en"' && storedLang !== '"ar"')) {
      console.log('No valid language found, setting to English')
      setLanguage('en')
    } else if (storedLang === '"ar"' && language === 'ar') {
      // If explicitly set to Arabic in localStorage and state, that's fine
      console.log('Language is set to Arabic')
    } else if (storedLang === '"en"' && language === 'en') {
      // If explicitly set to English in localStorage and state, that's fine
      console.log('Language is set to English')
    }
  }, [])

  // Update layout and font based on language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = language
      document.documentElement.classList.remove('rtl')
      document.body.classList.remove('rtl')
      document.title = 'Harmony'

      // Apply font based on language
      const fontProps = getFontCSSProperties(language)
      Object.entries(fontProps).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value)
      })

      // Apply the appropriate font class
      const fontClass = language === 'ar' ? 'font-tajawal' : 'font-inter'
      document.documentElement.classList.remove('font-tajawal', 'font-inter')
      document.documentElement.classList.add(fontClass)
    }
  }, [language])

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideMobile = dropdownRef.current && dropdownRef.current.contains(event.target as Node)
      const clickedInsideDesktop = dropdownRefDesktop.current && dropdownRefDesktop.current.contains(event.target as Node)

      if (!clickedInsideMobile && !clickedInsideDesktop) {
        console.log('Clicked outside dropdown, closing')
        setIsLangOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    {
      title: t.whoWeAre,
      content: t.whoWeAreContent
    },
    {
      title: t.ourVision,
      content: t.ourVisionContent
    },
    {
      title: t.ourMission,
      content: t.ourMissionContent
    },
    {
      title: t.aboutPlatform,
      content: t.aboutPlatformContent
    },
    {
      title: t.whyChooseUs,
      content: t.whyChooseUsContent
    },
    {
      title: t.ourServices,
      content: t.ourServicesContent
    }
  ]

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    console.log('Language select clicked:', lang)
    console.log('Current language before change:', language)
    setLanguage(lang)
    setIsLangOpen(false)
    console.log('Language should be changed to:', lang)
  }

  const handleChatRedirect = () => {
    console.log('=== TALK TO MR HARMONY CLICKED ===');
    console.log('Current browser URL:', window.location.href);
    console.log('Current language on home page:', language);
    console.log('Language in localStorage:', localStorage.getItem('language'));

    // Clear only the current conversation ID to start a new chat
    localStorage.removeItem('currentConversationId');
    sessionStorage.removeItem('reportData');

    // NOTE: We do NOT remove 'language' or 'misbara-conversations' from localStorage
    // This preserves language preference and conversation history
    console.log('Language after clearing current conversation:', localStorage.getItem('language'));

    // Add a special flag to indicate this is a fresh Mr. Harmony session
    sessionStorage.setItem('mrHarmonyFreshStart', 'true');

    // Clear URL of any existing parameters
    const url = new URL(window.location.href);
    url.search = ''; // Clear all query parameters
    window.history.replaceState({}, '', url.toString());

    // Use the global navigation function
    if (typeof window !== 'undefined' && (window as any).navigateTo) {
      (window as any).navigateTo('/chat');
    }
  }


  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
    setExpandedItem(null)
  }

  const handleItemClick = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null)
    } else {
      setExpandedItem(index)
    }
  }

  const handleBackdropClick = () => {
    setMenuOpen(false)
    setExpandedItem(null)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black pt-4 pb-4 px-4">
        {/* Header content container - aligned at same level */}
        <div className="flex justify-between items-center mt-12">
          {/* Left side - Language switcher */}
          <div className="flex items-center gap-3">
            {/* Hamburger menu - COMMENTED OUT */}
            {/* <div className="relative">
            <button onClick={toggleMenu} className="focus:outline-none">
              <div className="w-5 h-0.5 bg-white mb-1"></div>
              <div className="w-5 h-0.5 bg-white mb-1"></div>
              <div className="w-5 h-0.5 bg-white"></div>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30 bg-transparent"
                  onClick={handleBackdropClick}
                ></div>

                <div className="absolute top-8 left-0 bg-white/30 backdrop-blur-md text-black rounded-xl px-4 py-3 text-right z-40 shadow-lg space-y-2 text-sm max-w-xs">
                  {menuItems.map((item, index) => (
                    <div key={index} className="w-full">
                      <button
                        onClick={() => handleItemClick(index)}
                        className="flex justify-end items-center w-full p-2 rounded-lg transition-all duration-200 hover:bg-black/10 hover:scale-105 text-white hover:text-red-600 font-semibold"
                      >
                        <span>{item.title}</span>
                      </button>

                      {expandedItem === index && (
                        <div className="mt-2 p-3 backdrop-blur-sm rounded-lg text-xs leading-relaxed text-black border-4 border-red-600 shadow-lg" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ textAlign: language === 'ar' ? 'right' : 'left', borderRightWidth: language === 'ar' ? '4px' : '0', borderLeftWidth: language === 'ar' ? '0' : '4px' }}>
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            </div> */}

            {/* Language Switcher */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  console.log('Language button clicked, current state:', isLangOpen)
                  setIsLangOpen(!isLangOpen)
                }}
                className="flex items-center gap-1 px-2 py-1.5 text-white rounded-lg border bg-gray-800/90 border-gray-700 hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium">{language.toUpperCase()}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isLangOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Language Dropdown Menu */}
              {isLangOpen && (
                <div
                  className={`absolute top-full mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[120px] z-50 ${
                    language === 'ar' ? 'right-0' : 'left-0'
                  }`}
                  onClick={(e) => {
                    console.log('Dropdown clicked')
                    e.stopPropagation()
                  }}
                >
                  <button
                    onClick={(e) => {
                      console.log('English button clicked')
                      e.stopPropagation()
                      handleLanguageSelect('en')
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                      language === 'en' ? 'bg-red-600 text-white' : 'text-gray-300'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    English
                  </button>
                  <button
                    onClick={(e) => {
                      console.log('Arabic button clicked')
                      e.stopPropagation()
                      handleLanguageSelect('ar')
                    }}
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
          </div>

          {/* Logo - aligned with hamburger */}
          <img src="/misbara_full_logo.svg" alt="Misbara Logo" className="h-16" />
        </div>
      </div>

      {/* Main content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-6">
        {/* Mobile Layout - Single column, centered */}
        <div className="md:hidden w-full max-w-md flex flex-col items-center text-center space-y-5 pt-28">
          {/* About text - First */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-lg">{t.whoWeAre}</h3>
            <p className="font-light text-white text-sm leading-relaxed px-4">
              {t.aboutShort}
            </p>
          </div>

          {/* Main heading - Before button */}
          <h1 className="text-2xl font-extrabold text-white leading-relaxed">
            {t.mainHeading}
          </h1>

          {/* CTA Button */}
          <button
            onClick={handleChatRedirect}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-base font-semibold transition-colors duration-200"
          >
            {t.talkToHarmony}
          </button>

          {/* Image at bottom */}
          <div className="w-full max-w-xs mt-8">
            <img
              src="/faces.png"
              alt="Faces"
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
        </div>

        {/* Desktop Layout - Conditional rendering based on language */}
        <div className="hidden md:grid max-w-7xl w-full grid-cols-2 gap-10 items-center relative" dir="ltr">
          {language === 'en' ? (
            <>
              {/* ENGLISH: Content on LEFT */}
              <div className="flex flex-col items-center text-center space-y-8 px-4">
                {/* Logo */}
                <div className="flex items-center justify-center">
                  <img src="/misbara_full_logo.svg" alt="Misbara Logo" className="h-28 lg:h-32" />
                </div>

                {/* Text */}
                <div className="max-w-xl text-center">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-4">{t.whoWeAre}</h3>
                  <p className="text-base lg:text-lg font-light text-white leading-relaxed">
                    {t.aboutShort}
                  </p>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <h1 className="text-lg lg:text-xl font-extrabold text-white leading-relaxed mb-4 max-w-2xl">
                    {t.mainHeading}
                  </h1>
                  <button
                    onClick={handleChatRedirect}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full text-lg lg:text-xl font-semibold transition-colors duration-200"
                  >
                    {t.talkToHarmony}
                  </button>
                </div>
              </div>

              {/* ENGLISH: Image section on RIGHT */}
              <div className="flex flex-col">
                {/* Language switcher above image */}
                <div className="relative h-28 lg:h-32 flex items-start justify-end gap-3">
                  {/* Hamburger menu - COMMENTED OUT */}
                  {/* <div className="relative">
                    <button onClick={toggleMenu} className="focus:outline-none">
                      <div className="w-6 h-0.5 bg-white mb-1"></div>
                      <div className="w-6 h-0.5 bg-white mb-1"></div>
                      <div className="w-6 h-0.5 bg-white"></div>
                    </button>

                    {menuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30 bg-transparent"
                          onClick={handleBackdropClick}
                        ></div>

                        <div className="absolute top-8 left-0 bg-white/30 backdrop-blur-md text-black rounded-xl px-6 py-4 text-right z-40 shadow-lg space-y-2 text-lg max-w-lg">
                          {menuItems.map((item, index) => (
                            <div key={index} className="w-full">
                              <button
                                onClick={() => handleItemClick(index)}
                                className="flex justify-end items-center w-full p-3 rounded-lg transition-all duration-200 hover:bg-black/10 hover:scale-105 text-white hover:text-red-600 font-semibold"
                              >
                                <span>{item.title}</span>
                              </button>

                              {expandedItem === index && (
                                <div className="mt-2 p-4 backdrop-blur-sm rounded-lg text-sm leading-relaxed text-black border-4 border-red-600 shadow-lg" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ textAlign: language === 'ar' ? 'right' : 'left', borderRightWidth: language === 'ar' ? '4px' : '0', borderLeftWidth: language === 'ar' ? '0' : '4px' }}>
                                  {item.content}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div> */}

                  {/* Language Switcher - Desktop (English - opens to LEFT) */}
                  <div className="relative" ref={dropdownRefDesktop}>
                    <button
                      onClick={() => {
                        console.log('Desktop Language button clicked, current state:', isLangOpen)
                        setIsLangOpen(!isLangOpen)
                      }}
                      className="flex items-center gap-2 px-3 py-2 backdrop-blur-sm text-white rounded-lg border bg-gray-800/90 border-gray-700 hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="font-medium">{language.toUpperCase()}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isLangOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Language Dropdown Menu - Opens to the LEFT */}
                    {isLangOpen && (
                      <div
                        className="absolute top-0 right-full mr-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[140px] z-50"
                        onClick={(e) => {
                          console.log('Desktop Dropdown clicked')
                          e.stopPropagation()
                        }}
                      >
                        <button
                          onClick={(e) => {
                            console.log('Desktop English button clicked')
                            e.stopPropagation()
                            handleLanguageSelect('en')
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                            language === 'en' ? 'bg-red-600 text-white' : 'text-gray-300'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                          English
                        </button>
                        <button
                          onClick={(e) => {
                            console.log('Desktop Arabic button clicked')
                            e.stopPropagation()
                            handleLanguageSelect('ar')
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                            language === 'ar' ? 'bg-red-600 text-white' : 'text-gray-300'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                          العربية
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="flex justify-center items-start">
                  <img
                    src="/faces.png"
                    alt="Faces"
                    className="rounded-xl object-cover w-full h-auto max-w-2xl lg:max-w-3xl"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ARABIC: Image section on LEFT */}
              <div className="flex flex-col">
                {/* Language switcher above image */}
                <div className="relative h-28 lg:h-32 flex items-start justify-start gap-3">
                  {/* Hamburger menu - COMMENTED OUT */}
                  {/* <div className="relative">
                    <button onClick={toggleMenu} className="focus:outline-none">
                      <div className="w-6 h-0.5 bg-white mb-1"></div>
                      <div className="w-6 h-0.5 bg-white mb-1"></div>
                      <div className="w-6 h-0.5 bg-white"></div>
                    </button>

                    {menuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30 bg-transparent"
                          onClick={handleBackdropClick}
                        ></div>

                        <div className="absolute top-8 left-0 bg-white/30 backdrop-blur-md text-black rounded-xl px-6 py-4 text-right z-40 shadow-lg space-y-2 text-lg max-w-lg">
                          {menuItems.map((item, index) => (
                            <div key={index} className="w-full">
                              <button
                                onClick={() => handleItemClick(index)}
                                className="flex justify-end items-center w-full p-3 rounded-lg transition-all duration-200 hover:bg-black/10 hover:scale-105 text-white hover:text-red-600 font-semibold"
                              >
                                <span>{item.title}</span>
                              </button>

                              {expandedItem === index && (
                                <div className="mt-2 p-4 backdrop-blur-sm rounded-lg text-sm leading-relaxed text-black border-4 border-red-600 shadow-lg" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ textAlign: language === 'ar' ? 'right' : 'left', borderRightWidth: language === 'ar' ? '4px' : '0', borderLeftWidth: language === 'ar' ? '0' : '4px' }}>
                                  {item.content}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div> */}

                  {/* Language Switcher - Desktop (Arabic - opens to RIGHT) */}
                  <div className="relative" ref={dropdownRefDesktop}>
                    <button
                      onClick={() => {
                        console.log('Desktop Language button clicked, current state:', isLangOpen)
                        setIsLangOpen(!isLangOpen)
                      }}
                      className="flex items-center gap-2 px-3 py-2 backdrop-blur-sm text-white rounded-lg border bg-gray-800/90 border-gray-700 hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="font-medium">{language.toUpperCase()}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isLangOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Language Dropdown Menu - Opens to the RIGHT */}
                    {isLangOpen && (
                      <div
                        className="absolute top-0 left-full ml-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[140px] z-50"
                        onClick={(e) => {
                          console.log('Desktop Dropdown clicked')
                          e.stopPropagation()
                        }}
                      >
                        <button
                          onClick={(e) => {
                            console.log('Desktop English button clicked')
                            e.stopPropagation()
                            handleLanguageSelect('en')
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                            language === 'en' ? 'bg-red-600 text-white' : 'text-gray-300'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                          English
                        </button>
                        <button
                          onClick={(e) => {
                            console.log('Desktop Arabic button clicked')
                            e.stopPropagation()
                            handleLanguageSelect('ar')
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                            language === 'ar' ? 'bg-red-600 text-white' : 'text-gray-300'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                          العربية
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="flex justify-center items-start">
                  <img
                    src="/faces.png"
                    alt="Faces"
                    className="rounded-xl object-cover w-full h-auto max-w-2xl lg:max-w-3xl"
                  />
                </div>
              </div>

              {/* ARABIC: Content on RIGHT */}
              <div className="flex flex-col items-center text-center space-y-8 px-4">
                {/* Logo */}
                <div className="flex items-center justify-center">
                  <img src="/misbara_full_logo.svg" alt="Misbara Logo" className="h-28 lg:h-32" />
                </div>

                {/* Text */}
                <div className="text-xl lg:text-2xl leading-relaxed max-w-xl text-center">
                  <h3 className="font-bold text-white mb-3">{t.whoWeAre}</h3>
                  <p className="font-light text-white">
                    {t.aboutShort}
                  </p>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-relaxed mb-3 max-w-2xl">
                    {t.mainHeading}
                  </h1>
                  <button
                    onClick={handleChatRedirect}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full text-lg lg:text-xl font-semibold transition-colors duration-200"
                  >
                    {t.talkToHarmony}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}