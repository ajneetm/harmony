import { useEffect, useRef, useState } from 'react'
import {
  LogOut, MessageSquare, Globe, ChevronDown, Trash2,
  TrendingUp, TrendingDown, BarChart2, FileText, Phone,
  RefreshCw, User, BookOpen, Award, MessageCircle,
  CheckCircle, Clock, XCircle, Send, Plus, Loader2, GraduationCap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppState, useConversations } from '../store'
import { getFontCSSProperties } from '../utils/fonts'
import RadarChart from '../components/RadarChart'
import type { ReportChartData } from '../utils/reportService'
import {
  sbWorkshops, sbEnrollments, sbCertificates, sbConsultations,
  type Workshop, type Certificate, type Consultation,
} from '../lib/supabaseDashboard'

type Tab = 'profile' | 'workshops' | 'certificates' | 'consultations'

const tr = {
  ar: {
    dashboard: 'لوحتي', hello: 'مرحباً', sessions: 'جلسة', noSessions: 'لا توجد جلسات بعد',
    startNow: 'ابدأ جلستك الأولى', myConversations: 'محادثاتي', continueChat: 'متابعة',
    newSession: 'جلسة جديدة', logout: 'تسجيل الخروج', back: 'الرئيسية', deleteConfirm: 'حذف',
    joinedOn: 'انضم في', lastReport: 'آخر تقرير', viewReport: 'عرض التقرير',
    overall: 'الإجمالي', harmony: 'الانسجام', mental: 'الذهني', emotional: 'المشاعري',
    existential: 'السلوكي', strengths: 'أبرز نقاط القوة', development: 'مناطق التطوير',
    noReport: 'لا يوجد تقرير بعد', noReportHint: 'أكمل الاستبيان للحصول على تقريرك',
    cognitiveRadar: 'الرادار الإدراكي', admin: 'الإدارة', messages: 'رسالة',
    quickActions: 'إجراءات سريعة', viewFullReport: 'عرض التقرير الكامل',
    continueLastChat: 'متابعة آخر محادثة', retakeAssessment: 'إعادة التقييم',
    consultation: 'هل تريد استشارة؟', consultationDesc: 'احجز جلسة مع أحد مستشارينا لمناقشة نتائجك',
    bookNow: 'احجز الآن',
    // tabs
    tabProfile: 'الملف الشخصي', tabWorkshops: 'الدورات', tabCertificates: 'الشهادات', tabConsultations: 'الاستشارات',
    // workshops
    enroll: 'سجّل', enrolled: 'مسجّل', unenroll: 'إلغاء التسجيل', noWorkshops: 'لا توجد دورات متاحة حالياً',
    category: 'التصنيف', duration: 'المدة',
    // certificates
    noCertificates: 'لا توجد شهادات بعد', issuedBy: 'صادرة من', issuedAt: 'تاريخ الإصدار',
    // consultations
    newConsultation: 'استشارة جديدة', subject: 'الموضوع', messageLabel: 'رسالتك',
    send: 'إرسال', noConsultations: 'لا توجد استشارات بعد',
    statusPending: 'قيد المراجعة', statusReplied: 'تم الرد', statusClosed: 'مغلقة',
    adminReply: 'رد المستشار', consultationPhone: 'أو تواصل مباشرة',
    sending: 'جاري الإرسال...', subjectPlaceholder: 'موضوع استشارتك', messagePlaceholder: 'اكتب رسالتك هنا...',
  },
  en: {
    dashboard: 'My Dashboard', hello: 'Hello', sessions: 'sessions', noSessions: 'No sessions yet',
    startNow: 'Start your first session', myConversations: 'My Conversations', continueChat: 'Continue',
    newSession: 'New Session', logout: 'Sign Out', back: 'Home', deleteConfirm: 'Delete',
    joinedOn: 'Joined', lastReport: 'Latest Report', viewReport: 'View Report',
    overall: 'Overall', harmony: 'Harmony', mental: 'Mental', emotional: 'Emotional',
    existential: 'Existential', strengths: 'Top Strengths', development: 'Development Areas',
    noReport: 'No report yet', noReportHint: 'Complete the questionnaire to get your report',
    cognitiveRadar: 'Cognitive Radar', admin: 'Admin', messages: 'messages',
    quickActions: 'Quick Actions', viewFullReport: 'View Full Report',
    continueLastChat: 'Continue Last Chat', retakeAssessment: 'Retake Assessment',
    consultation: 'Need a consultation?', consultationDesc: 'Book a session with one of our advisors to discuss your results',
    bookNow: 'Book Now',
    // tabs
    tabProfile: 'Profile', tabWorkshops: 'Courses', tabCertificates: 'Certificates', tabConsultations: 'Consultations',
    // workshops
    enroll: 'Enroll', enrolled: 'Enrolled', unenroll: 'Unenroll', noWorkshops: 'No workshops available',
    category: 'Category', duration: 'Duration',
    // certificates
    noCertificates: 'No certificates yet', issuedBy: 'Issued by', issuedAt: 'Issue date',
    // consultations
    newConsultation: 'New Consultation', subject: 'Subject', messageLabel: 'Your message',
    send: 'Send', noConsultations: 'No consultations yet',
    statusPending: 'Pending', statusReplied: 'Replied', statusClosed: 'Closed',
    adminReply: 'Advisor Reply', consultationPhone: 'Or contact directly',
    sending: 'Sending...', subjectPlaceholder: 'Consultation subject', messagePlaceholder: 'Write your message here...',
  },
}

interface StoredReport { aiResponse: string; chartData: ReportChartData }

const ScoreBar = ({ pct, color = '#ae1f23' }: { pct: number; color?: string }) => (
  <div className="w-full bg-white/5 rounded-full h-1.5 mt-1.5">
    <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
  </div>
)

export default function DashboardPage() {
  const { user, signOut }               = useAuth()
  const { language, setLanguage }       = useAppState()
  const { conversations, deleteConversation } = useConversations()
  const [langOpen, setLangOpen]         = useState(false)
  const langRef                         = useRef<HTMLDivElement>(null)
  const [lastReport, setLastReport]     = useState<{ convId: string; data: StoredReport } | null>(null)
  const [activeTab, setActiveTab]       = useState<Tab>('profile')

  // Workshops state
  const [workshops, setWorkshops]       = useState<Workshop[]>([])
  const [enrolledIds, setEnrolledIds]   = useState<Set<string>>(new Set())
  const [loadingWs, setLoadingWs]       = useState(false)
  const [enrollingId, setEnrollingId]   = useState<string | null>(null)

  // Certificates state
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loadingCerts, setLoadingCerts] = useState(false)

  // Consultations state
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loadingConss, setLoadingConss]   = useState(false)
  const [showForm, setShowForm]           = useState(false)
  const [cSubject, setCSubject]           = useState('')
  const [cMessage, setCMessage]           = useState('')
  const [sending, setSending]             = useState(false)

  const t   = tr[language]
  const isAr = language === 'ar'
  const userId = user?.id ?? null

  useEffect(() => {
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    const fp = getFontCSSProperties(language)
    Object.entries(fp).forEach(([p, v]) => document.documentElement.style.setProperty(p, v))
  }, [language])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Find last report from localStorage
  useEffect(() => {
    if (conversations.length === 0) return
    const reversed = [...conversations].reverse()
    for (const conv of reversed) {
      const raw = localStorage.getItem(`report-${conv.id}`)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredReport
          if (parsed.chartData) { setLastReport({ convId: conv.id, data: parsed }); return }
        } catch { /* ignore */ }
      }
    }
    setLastReport(null)
  }, [conversations])

  // Load workshops when tab opens
  useEffect(() => {
    if (activeTab !== 'workshops') return
    setLoadingWs(true)
    Promise.all([
      sbWorkshops.list(),
      userId ? sbEnrollments.listForUser(userId) : Promise.resolve([]),
    ])
      .then(([ws, enrs]) => {
        setWorkshops(ws)
        setEnrolledIds(new Set(enrs.map(e => e.workshop_id)))
      })
      .catch(console.error)
      .finally(() => setLoadingWs(false))
  }, [activeTab, userId])

  // Load certificates when tab opens
  useEffect(() => {
    if (activeTab !== 'certificates' || !userId) return
    setLoadingCerts(true)
    sbCertificates.listForUser(userId)
      .then(setCertificates)
      .catch(console.error)
      .finally(() => setLoadingCerts(false))
  }, [activeTab, userId])

  // Load consultations when tab opens
  useEffect(() => {
    if (activeTab !== 'consultations' || !userId) return
    setLoadingConss(true)
    sbConsultations.listForUser(userId)
      .then(setConsultations)
      .catch(console.error)
      .finally(() => setLoadingConss(false))
  }, [activeTab, userId])

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

  const handleEnroll = async (workshopId: string) => {
    if (!userId) return
    setEnrollingId(workshopId)
    try {
      if (enrolledIds.has(workshopId)) {
        await sbEnrollments.unenroll(userId, workshopId)
        setEnrolledIds(prev => { const s = new Set(prev); s.delete(workshopId); return s })
      } else {
        await sbEnrollments.enroll(userId, workshopId)
        setEnrolledIds(prev => new Set([...prev, workshopId]))
      }
    } catch (e) { console.error(e) }
    finally { setEnrollingId(null) }
  }

  const handleSendConsultation = async () => {
    if (!userId || !cSubject.trim() || !cMessage.trim()) return
    setSending(true)
    try {
      const c = await sbConsultations.create(userId, cSubject.trim(), cMessage.trim())
      setConsultations(prev => [c, ...prev])
      setCSubject(''); setCMessage(''); setShowForm(false)
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  const cd = lastReport?.data.chartData

  const statusIcon = (s: Consultation['status']) =>
    s === 'replied' ? <CheckCircle size={13} className="text-green-400" /> :
    s === 'closed'  ? <XCircle    size={13} className="text-gray-500" />   :
                      <Clock      size={13} className="text-amber-400" />

  const statusLabel = (s: Consultation['status']) =>
    s === 'replied' ? t.statusReplied :
    s === 'closed'  ? t.statusClosed  : t.statusPending

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',       label: t.tabProfile,       icon: <User       size={15} /> },
    { key: 'workshops',     label: t.tabWorkshops,     icon: <BookOpen   size={15} /> },
    { key: 'certificates',  label: t.tabCertificates,  icon: <Award      size={15} /> },
    { key: 'consultations', label: t.tabConsultations, icon: <MessageCircle size={15} /> },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <button onClick={() => (window as any).navigateTo('/')} className="text-sm text-gray-400 hover:text-white transition">
          ← {t.back}
        </button>
        <span className="text-[#FFBD00] font-bold tracking-widest text-sm uppercase">Harmony</span>
        <div className="flex items-center gap-3">
          {email === 'a.hajali@ajnee.com' && (
            <button onClick={() => (window as any).navigateTo('/admin')}
              className="text-xs border border-red-600/40 rounded-full px-3 py-1.5 text-red-400 hover:bg-red-600/10 transition">
              {t.admin}
            </button>
          )}
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1 text-xs border border-red-600/40 rounded-full px-3 py-1.5 text-red-400 hover:bg-red-600/10 transition">
              <Globe size={12} />{language.toUpperCase()}<ChevronDown size={10} />
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
            <LogOut size={14} />{t.logout}
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-5">

        {/* Profile header */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white">{name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{email}</p>
            <p className="text-xs text-gray-600 mt-0.5">{t.joinedOn}: {joinDate}</p>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('currentConversationId'); (window as any).navigateTo('/chat') }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-[0_4px_15px_rgba(174,31,35,0.4)] active:scale-95 flex-shrink-0">
            + {t.newSession}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0f0f0f] border border-white/8 rounded-2xl p-1.5">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white shadow-[0_2px_10px_rgba(174,31,35,0.4)]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Profile ────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-5">

            {/* Report scores */}
            {cd ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t.overall}</p>
                      <p className="text-4xl font-black text-red-500">{cd.overall}<span className="text-xl text-red-700">%</span></p>
                      <ScoreBar pct={cd.overall} />
                    </div>
                    <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t.harmony}</p>
                      <p className="text-4xl font-black text-amber-400">{cd.harmony}<span className="text-xl text-amber-600">%</span></p>
                      <ScoreBar pct={cd.harmony} color="#f59e0b" />
                    </div>
                  </div>
                  <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 space-y-4">
                    {[
                      { label: t.mental,      pct: cd.mental.percentage,      color: '#dc2626' },
                      { label: t.emotional,   pct: cd.emotional.percentage,   color: '#7c3aed' },
                      { label: t.existential, pct: cd.existential.percentage, color: '#0891b2' },
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
                  <button onClick={openLastReport}
                    className="w-full border border-red-600/40 hover:border-red-500 rounded-xl py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 transition flex items-center justify-center gap-2">
                    <FileText size={15} />{t.viewReport}
                  </button>
                </div>
                <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 flex flex-col">
                  <p className="text-xs text-gray-500 uppercase tracking-wider text-center mb-2">{t.cognitiveRadar}</p>
                  <RadarChart title="" color="#ae1f23" data={cd.radarCognitive} language={language} />
                </div>
              </div>
            ) : (
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
                <BarChart2 size={32} className="text-gray-700" />
                <p className="text-gray-400 font-medium">{t.noReport}</p>
                <p className="text-gray-600 text-sm">{t.noReportHint}</p>
              </div>
            )}

            {/* Strengths + Development */}
            {cd && cd.allElements.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={15} className="text-green-400" />
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t.strengths}</p>
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
                <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown size={15} className="text-orange-400" />
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t.development}</p>
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

            {/* Quick Actions + Consultation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">{t.quickActions}</p>
                <div className="space-y-2">
                  {cd && (
                    <button onClick={openLastReport}
                      className="w-full flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 text-sm text-gray-300 hover:border-red-600/40 hover:text-white hover:bg-red-600/5 transition">
                      <FileText size={15} className="text-red-400 flex-shrink-0" />{t.viewFullReport}
                    </button>
                  )}
                  {conversations.length > 0 && (
                    <button onClick={() => openConversation([...conversations].reverse()[0].id)}
                      className="w-full flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 text-sm text-gray-300 hover:border-red-600/40 hover:text-white hover:bg-red-600/5 transition">
                      <MessageSquare size={15} className="text-red-400 flex-shrink-0" />{t.continueLastChat}
                    </button>
                  )}
                  <button onClick={() => { sessionStorage.removeItem('currentConversationId'); (window as any).navigateTo('/chat') }}
                    className="w-full flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 text-sm text-gray-300 hover:border-red-600/40 hover:text-white hover:bg-red-600/5 transition">
                    <RefreshCw size={15} className="text-red-400 flex-shrink-0" />{t.retakeAssessment}
                  </button>
                </div>
              </div>
              <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <p className="font-semibold text-white mb-2">{t.consultation}</p>
                  <p className="text-sm text-gray-500">{t.consultationDesc}</p>
                </div>
                <a href="tel:+97431000003"
                  className="mt-5 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-sm font-semibold transition shadow-[0_4px_15px_rgba(174,31,35,0.3)]">
                  <Phone size={14} />+974 3100 0003
                </a>
              </div>
            </div>

            {/* Conversation history */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">{t.myConversations}</h3>
              {conversations.length === 0 ? (
                <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-10 text-center">
                  <MessageSquare size={32} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t.noSessions}</p>
                  <button onClick={() => (window as any).navigateTo('/chat')} className="mt-4 text-red-400 text-sm hover:text-red-300 transition">
                    {t.startNow} →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...conversations].reverse().map(conv => {
                    const hasReport = !!localStorage.getItem(`report-${conv.id}`)
                    return (
                      <div key={conv.id} onClick={() => openConversation(conv.id)}
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
                          <p className="text-xs text-gray-600">{conv.messages.length} {t.messages}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={e => handleDelete(e, conv.id)}
                            className="p-1.5 rounded-lg hover:bg-red-600/20 text-gray-600 hover:text-red-400 transition">
                            <Trash2 size={13} />
                          </button>
                          <span className="text-xs text-red-400">{t.continueChat} →</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Workshops ───────────────────────────────────────────────── */}
        {activeTab === 'workshops' && (
          <div>
            {loadingWs ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="text-red-500 animate-spin" /></div>
            ) : workshops.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                <GraduationCap size={36} className="text-gray-700" />
                <p className="text-gray-500">{t.noWorkshops}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workshops.map(ws => {
                  const isEnrolled = enrolledIds.has(ws.id)
                  const isLoading  = enrollingId === ws.id
                  return (
                    <div key={ws.id} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-base">{isAr ? ws.title_ar : ws.title_en}</h3>
                        {(isAr ? ws.desc_ar : ws.desc_en) && (
                          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{isAr ? ws.desc_ar : ws.desc_en}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-3">
                          {(isAr ? ws.category_ar : ws.category_en) && (
                            <span className="text-xs bg-red-600/10 text-red-400 px-2.5 py-1 rounded-full border border-red-600/20">
                              {isAr ? ws.category_ar : ws.category_en}
                            </span>
                          )}
                          {(isAr ? ws.duration_ar : ws.duration_en) && (
                            <span className="text-xs bg-white/5 text-gray-400 px-2.5 py-1 rounded-full border border-white/10">
                              {isAr ? ws.duration_ar : ws.duration_en}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleEnroll(ws.id)} disabled={isLoading || !userId}
                        className={`mt-1 w-full py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                          isEnrolled
                            ? 'border border-red-600/40 text-red-400 hover:bg-red-600/10'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_12px_rgba(174,31,35,0.3)]'
                        } disabled:opacity-50`}>
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : isEnrolled ? t.unenroll : t.enroll}
                      </button>
                      {isEnrolled && (
                        <div className="flex items-center gap-1.5 justify-center text-xs text-green-400">
                          <CheckCircle size={12} />{t.enrolled}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Certificates ────────────────────────────────────────────── */}
        {activeTab === 'certificates' && (
          <div>
            {loadingCerts ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="text-red-500 animate-spin" /></div>
            ) : certificates.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                <Award size={36} className="text-gray-700" />
                <p className="text-gray-500">{t.noCertificates}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certificates.map(cert => (
                  <div key={cert.id}
                    className="bg-[#0f0f0f] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                        <Award size={18} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white">{isAr ? cert.title_ar : cert.title_en}</h3>
                        {cert.description && <p className="text-sm text-gray-500 mt-1">{cert.description}</p>}
                        <div className="mt-3 flex flex-col gap-1">
                          <p className="text-xs text-gray-600">
                            <span className="text-gray-500">{t.issuedBy}:</span> {cert.issued_by}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="text-gray-500">{t.issuedAt}:</span>{' '}
                            {new Date(cert.issued_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Consultations ───────────────────────────────────────────── */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">

            {/* New consultation form toggle */}
            <div className="flex items-center justify-between">
              <a href="tel:+97431000003"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition">
                <Phone size={14} />{t.consultationPhone}: +974 3100 0003
              </a>
              <button onClick={() => setShowForm(f => !f)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-[0_4px_12px_rgba(174,31,35,0.3)]">
                <Plus size={14} />{t.newConsultation}
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-[#0f0f0f] border border-red-600/30 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{t.subject}</label>
                  <input value={cSubject} onChange={e => setCSubject(e.target.value)}
                    placeholder={t.subjectPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{t.messageLabel}</label>
                  <textarea value={cMessage} onChange={e => setCMessage(e.target.value)}
                    placeholder={t.messagePlaceholder} rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 transition resize-none" />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition">
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button onClick={handleSendConsultation}
                    disabled={sending || !cSubject.trim() || !cMessage.trim()}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? t.sending : t.send}
                  </button>
                </div>
              </div>
            )}

            {/* Consultations list */}
            {loadingConss ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="text-red-500 animate-spin" /></div>
            ) : consultations.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                <MessageCircle size={36} className="text-gray-700" />
                <p className="text-gray-500">{t.noConsultations}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map(c => (
                  <div key={c.id} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm">{c.subject}</h4>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{c.message}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 text-xs">
                        {statusIcon(c.status)}
                        <span className={c.status === 'replied' ? 'text-green-400' : c.status === 'closed' ? 'text-gray-500' : 'text-amber-400'}>
                          {statusLabel(c.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mt-2">
                      {new Date(c.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {c.admin_reply && (
                      <div className="mt-3 bg-green-600/8 border border-green-600/20 rounded-xl p-3">
                        <p className="text-xs text-green-400 font-medium mb-1">{t.adminReply}</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{c.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
