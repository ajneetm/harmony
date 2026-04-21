import { useEffect, useRef, useState } from 'react'
import { LogOut, MessageSquare, Globe, ChevronDown, Trash2, TrendingUp, TrendingDown, BarChart2, FileText, Phone, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppState, useConversations } from '../store'
import { getFontCSSProperties } from '../utils/fonts'
import RadarChart from '../components/RadarChart'
import type { ReportChartData } from '../utils/reportService'

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
    joinedOn: 'انضم في',
    lastReport: 'آخر تقرير',
    viewReport: 'عرض التقرير',
    overall: 'الإجمالي',
    harmony: 'الانسجام',
    mental: 'الذهني',
    emotional: 'المشاعري',
    existential: 'السلوكي',
    strengths: 'أبرز نقاط القوة',
    development: 'مناطق التطوير',
    noReport: 'لا يوجد تقرير بعد',
    noReportHint: 'أكمل الاستبيان للحصول على تقريرك',
    cognitiveRadar: 'الرادار الإدراكي',
    admin: 'الإدارة',
    messages: 'رسالة',
    quickActions: 'إجراءات سريعة',
    viewFullReport: 'عرض التقرير الكامل',
    continueLastChat: 'متابعة آخر محادثة',
    retakeAssessment: 'إعادة التقييم',
    consultation: 'هل تريد استشارة؟',
    consultationDesc: 'احجز جلسة مع أحد مستشارينا لمناقشة نتائجك',
    bookNow: 'احجز الآن',
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
    joinedOn: 'Joined',
    lastReport: 'Latest Report',
    viewReport: 'View Report',
    overall: 'Overall',
    harmony: 'Harmony',
    mental: 'Mental',
    emotional: 'Emotional',
    existential: 'Existential',
    strengths: 'Top Strengths',
    development: 'Development Areas',
    noReport: 'No report yet',
    noReportHint: 'Complete the questionnaire to get your report',
    cognitiveRadar: 'Cognitive Radar',
    admin: 'Admin',
    messages: 'messages',
    quickActions: 'Quick Actions',
    viewFullReport: 'View Full Report',
    continueLastChat: 'Continue Last Chat',
    retakeAssessment: 'Retake Assessment',
    consultation: 'Need a consultation?',
    consultationDesc: 'Book a session with one of our advisors to discuss your results',
    bookNow: 'Book Now',
  },
}

interface StoredReport {
  aiResponse: string
  chartData: ReportChartData
}

export default function DashboardPage() {
  const { user, signOut }               = useAuth()
  const { language, setLanguage }       = useAppState()
  const { conversations, deleteConversation } = useConversations()
  const [langOpen, setLangOpen]         = useState(false)
  const langRef                         = useRef<HTMLDivElement>(null)
  const [lastReport, setLastReport]     = useState<{ convId: string; data: StoredReport } | null>(null)
  const tr = t[language]
  const isAr = language === 'ar'

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

  // Find the most recent conversation that has a saved report
  useEffect(() => {
    if (conversations.length === 0) return
    const reversed = [...conversations].reverse()
    for (const conv of reversed) {
      const raw = localStorage.getItem(`report-${conv.id}`)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredReport
          if (parsed.chartData) {
            setLastReport({ convId: conv.id, data: parsed })
            return
          }
        } catch { /* ignore */ }
      }
    }
    setLastReport(null)
  }, [conversations])

  const name     = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '—'
  const email    = user?.email || ''
  const initial  = name.charAt(0).toUpperCase()
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const openConversation = (id: string) => {
    sessionStorage.setItem('currentConversationId', id)
    ;(window as any).navigateTo('/chat')
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteConversation(id)
  }

  const openLastReport = () => {
    if (!lastReport) return
    const raw = localStorage.getItem(`report-${lastReport.convId}`)
    if (raw) {
      sessionStorage.setItem('reportData', raw)
      window.location.href = `${window.location.origin}/?page=report&chatId=${encodeURIComponent(lastReport.convId)}`
    }
  }

  const cd = lastReport?.data.chartData

  // Dimension score bar
  const ScoreBar = ({ pct, color = '#ae1f23' }: { pct: number; color?: string }) => (
    <div className="w-full bg-white/5 rounded-full h-1.5 mt-1.5">
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <button onClick={() => (window as any).navigateTo('/')} className="text-sm text-gray-400 hover:text-white transition">
          ← {tr.back}
        </button>
        <span className="text-[#FFBD00] font-bold tracking-widest text-sm uppercase">Harmony</span>
        <div className="flex items-center gap-3">
          {email === 'a.hajali@ajnee.com' && (
            <button onClick={() => (window as any).navigateTo('/admin')}
              className="text-xs border border-red-600/40 rounded-full px-3 py-1.5 text-red-400 hover:bg-red-600/10 transition">
              {tr.admin}
            </button>
          )}
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1 text-xs border border-red-600/40 rounded-full px-3 py-1.5 text-red-400 hover:bg-red-600/10 transition">
              <Globe size={12} />
              {language.toUpperCase()}
              <ChevronDown size={10} />
            </button>
            {langOpen && (
              <div className="absolute top-full mt-2 bg-gray-900 border border-red-600/20 rounded-xl overflow-hidden z-50 right-0">
                {(['en', 'ar'] as const).map(lang => (
                  <button key={lang} onClick={() => { setLanguage(lang); setLangOpen(false) }}
                    className={`block w-full px-5 py-2.5 text-sm text-white hover:bg-red-600 transition text-left ${language === lang ? 'bg-red-600/20' : ''}`}>
                    {lang === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition">
            <LogOut size={14} />
            {tr.logout}
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">

        {/* Profile header */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{email}</p>
            <p className="text-xs text-gray-600 mt-1">{tr.joinedOn}: {joinDate}</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => { sessionStorage.removeItem('currentConversationId'); (window as any).navigateTo('/chat') }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-[0_4px_15px_rgba(174,31,35,0.4)] active:scale-95">
              + {tr.newSession}
            </button>
          </div>
        </div>

        {/* Last report section */}
        {cd ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Scores */}
            <div className="space-y-4">

              {/* Overall + Harmony */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{tr.overall}</p>
                  <p className="text-4xl font-black text-red-500">{cd.overall}<span className="text-xl text-red-700">%</span></p>
                  <ScoreBar pct={cd.overall} />
                </div>
                <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{tr.harmony}</p>
                  <p className="text-4xl font-black text-amber-400">{cd.harmony}<span className="text-xl text-amber-600">%</span></p>
                  <ScoreBar pct={cd.harmony} color="#f59e0b" />
                </div>
              </div>

              {/* Dimension breakdown */}
              <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 space-y-4">
                {[
                  { label: tr.mental,      pct: cd.mental.percentage,      color: '#dc2626' },
                  { label: tr.emotional,   pct: cd.emotional.percentage,   color: '#7c3aed' },
                  { label: tr.existential, pct: cd.existential.percentage, color: '#0891b2' },
                ].map(d => (
                  <div key={d.label}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{d.label}</span>
                      <span className="text-sm font-bold" style={{ color: d.color }}>{d.pct}%</span>
                    </div>
                    <ScoreBar pct={d.pct} color={d.color} />
                  </div>
                ))}
              </div>

              {/* View report button */}
              <button
                onClick={openLastReport}
                className="w-full border border-red-600/40 hover:border-red-500 rounded-xl py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 transition flex items-center justify-center gap-2">
                <FileText size={15} />
                {tr.viewReport}
              </button>
            </div>

            {/* Radar chart */}
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 flex flex-col">
              <p className="text-xs text-gray-500 uppercase tracking-wider text-center mb-2">{tr.cognitiveRadar}</p>
              <RadarChart
                title=""
                color="#ae1f23"
                data={cd.radarCognitive}
                language={language}
              />
            </div>
          </div>
        ) : null}

        {/* Strengths + Development areas */}
        {cd && cd.allElements.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Strengths */}
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-green-400" />
                <p className="text-xs text-gray-400 uppercase tracking-wider">{tr.strengths}</p>
              </div>
              <div className="space-y-3">
                {cd.allElements.slice(0, 3).map((el, i) => (
                  <div key={el.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-green-500 w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">{el.name}</span>
                        <span className="text-xs text-green-400">{el.score.toFixed(1)}/5</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1">
                        <div className="h-1 rounded-full bg-green-500/70 transition-all duration-700" style={{ width: `${(el.score / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Development areas */}
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={15} className="text-orange-400" />
                <p className="text-xs text-gray-400 uppercase tracking-wider">{tr.development}</p>
              </div>
              <div className="space-y-3">
                {[...cd.allElements].slice(-3).reverse().map((el, i) => (
                  <div key={el.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-orange-500 w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">{el.name}</span>
                        <span className="text-xs text-orange-400">{el.score.toFixed(1)}/5</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1">
                        <div className="h-1 rounded-full bg-orange-500/70 transition-all duration-700" style={{ width: `${(el.score / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No report state */}
        {!cd && (
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <BarChart2 size={32} className="text-gray-700" />
            <p className="text-gray-400 font-medium">{tr.noReport}</p>
            <p className="text-gray-600 text-sm">{tr.noReportHint}</p>
          </div>
        )}

        {/* Quick Actions + Consultation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Quick Actions */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">{tr.quickActions}</p>
            <div className="space-y-2">
              {cd && (
                <button onClick={openLastReport}
                  className="w-full flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 text-sm text-gray-300 hover:border-red-600/40 hover:text-white hover:bg-red-600/5 transition">
                  <FileText size={15} className="text-red-400 flex-shrink-0" />
                  {tr.viewFullReport}
                </button>
              )}
              {conversations.length > 0 && (
                <button onClick={() => openConversation([...conversations].reverse()[0].id)}
                  className="w-full flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 text-sm text-gray-300 hover:border-red-600/40 hover:text-white hover:bg-red-600/5 transition">
                  <MessageSquare size={15} className="text-red-400 flex-shrink-0" />
                  {tr.continueLastChat}
                </button>
              )}
              <button
                onClick={() => { sessionStorage.removeItem('currentConversationId'); (window as any).navigateTo('/chat') }}
                className="w-full flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 text-sm text-gray-300 hover:border-red-600/40 hover:text-white hover:bg-red-600/5 transition">
                <RefreshCw size={15} className="text-red-400 flex-shrink-0" />
                {tr.retakeAssessment}
              </button>
            </div>
          </div>

          {/* Consultation card */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <p className="font-semibold text-white mb-2">{tr.consultation}</p>
              <p className="text-sm text-gray-500">{tr.consultationDesc}</p>
            </div>
            <a href="tel:+97431000003"
              className="mt-5 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-sm font-semibold transition shadow-[0_4px_15px_rgba(174,31,35,0.3)]">
              <Phone size={14} />
              +974 3100 0003
            </a>
          </div>
        </div>

        {/* Conversation history */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">{tr.myConversations}</h3>

          {conversations.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-10 text-center">
              <MessageSquare size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{tr.noSessions}</p>
              <button onClick={() => (window as any).navigateTo('/chat')}
                className="mt-4 text-red-400 text-sm hover:text-red-300 transition">
                {tr.startNow} →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {[...conversations].reverse().map(conv => {
                const hasReport = !!localStorage.getItem(`report-${conv.id}`)
                return (
                  <div key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className="bg-[#0f0f0f] border border-white/5 hover:border-red-600/30 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer transition group">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={14} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white truncate font-medium">{conv.title}</p>
                        {hasReport && (
                          <span className="flex-shrink-0 text-[10px] bg-red-600/15 text-red-400 px-1.5 py-0.5 rounded-full">
                            {isAr ? 'تقرير' : 'Report'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{conv.messages.length} {tr.messages}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={e => handleDelete(e, conv.id)}
                        className="p-1.5 rounded-lg hover:bg-red-600/20 text-gray-600 hover:text-red-400 transition">
                        <Trash2 size={13} />
                      </button>
                      <span className="text-xs text-red-400">{tr.continueChat} →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
