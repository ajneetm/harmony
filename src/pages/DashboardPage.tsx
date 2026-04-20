import { useEffect, useRef, useState } from 'react'
import { LogOut, MessageSquare, Globe, ChevronDown, User, Trash2 } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuth } from '../context/AuthContext'
import { useAppState } from '../store'
import { getFontCSSProperties } from '../utils/fonts'
import { translations } from '../utils/translations'

const t = {
  ar: {
    dashboard: 'لوحتي',
    hello: 'مرحباً',
    sessions: 'جلسة',
    noSessions: 'لا توجد جلسات بعد',
    startNow: 'ابدأ جلستك الأولى',
    myConversations: 'محادثاتي',
    continueChat: 'متابعة',
    newSession: 'جلسة جديدة',
    logout: 'تسجيل الخروج',
    back: 'الرئيسية',
    deleteConfirm: 'حذف',
  },
  en: {
    dashboard: 'My Dashboard',
    hello: 'Hello',
    sessions: 'sessions',
    noSessions: 'No sessions yet',
    startNow: 'Start your first session',
    myConversations: 'My Conversations',
    continueChat: 'Continue',
    newSession: 'New Session',
    logout: 'Sign Out',
    back: 'Home',
    deleteConfirm: 'Delete',
  },
}

export default function DashboardPage() {
  const { user, signOut }         = useAuth()
  const { language, setLanguage } = useAppState()
  const [langOpen, setLangOpen]   = useState(false)
  const langRef                   = useRef<HTMLDivElement>(null)
  const tr                        = t[language]
  const isAr                      = language === 'ar'
  const trans                     = translations[language]

  const conversations = useQuery(
    api.conversations.listByUser,
    user ? { userId: user.id } : 'skip'
  ) ?? []

  const removeConversation = useMutation(api.conversations.remove)

  useEffect(() => {
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    const fp = getFontCSSProperties(language)
    Object.entries(fp).forEach(([p, v]) => document.documentElement.style.setProperty(p, v))
  }, [language])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const name  = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '—'
  const email = user?.email || ''
  const initial = name.charAt(0).toUpperCase()

  const openConversation = (id: string) => {
    sessionStorage.setItem('currentConversationId', id)
    ;(window as any).navigateTo('/chat')
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await removeConversation({ id: id as Id<'conversations'> })
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <button
          onClick={() => (window as any).navigateTo('/')}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← {tr.back}
        </button>

        <span className="text-[#FFBD00] font-bold tracking-widest text-sm uppercase">Harmony</span>

        <div className="flex items-center gap-3">
          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1 text-xs border border-red-600/40 rounded-full px-3 py-1.5 text-red-400 hover:bg-red-600/10 transition"
            >
              <Globe size={12} />
              {language.toUpperCase()}
              <ChevronDown size={10} />
            </button>
            {langOpen && (
              <div className="absolute top-full mt-2 bg-gray-900 border border-red-600/20 rounded-xl overflow-hidden z-50 right-0">
                {(['en', 'ar'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false) }}
                    className={`block w-full px-5 py-2.5 text-sm text-white hover:bg-red-600 transition text-left ${language === lang ? 'bg-red-600/20' : ''}`}
                  >
                    {lang === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition"
          >
            <LogOut size={14} />
            {tr.logout}
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-8">

        {/* Profile card */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{name}</h2>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-2xl font-bold text-red-500">{conversations.length}</p>
            <p className="text-xs text-gray-500">{tr.sessions}</p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => { sessionStorage.removeItem('currentConversationId'); (window as any).navigateTo('/chat') }}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition shadow-[0_8px_25px_rgba(220,38,38,0.3)] active:scale-95"
        >
          + {tr.newSession}
        </button>

        {/* Conversations */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">{tr.myConversations}</h3>

          {conversations.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-10 text-center">
              <MessageSquare size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{tr.noSessions}</p>
              <button
                onClick={() => (window as any).navigateTo('/chat')}
                className="mt-4 text-red-400 text-sm hover:text-red-300 transition"
              >
                {tr.startNow} →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {[...conversations].reverse().map(conv => (
                <div
                  key={conv._id}
                  onClick={() => openConversation(conv._id)}
                  className="bg-[#0f0f0f] border border-white/5 hover:border-red-600/30 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={14} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{conv.title}</p>
                    <p className="text-xs text-gray-600">{conv.messages.length} {language === 'ar' ? 'رسالة' : 'messages'}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={e => handleDelete(e, conv._id)}
                      className="p-1.5 rounded-lg hover:bg-red-600/20 text-gray-600 hover:text-red-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                    <span className="text-xs text-red-400">{tr.continueChat} →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
