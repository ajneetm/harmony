import { useEffect, useRef, useState } from 'react'
import {
  LogOut, MessageSquare, Globe, ChevronDown, Trash2,
  TrendingUp, TrendingDown, BarChart2, FileText, Phone,
  RefreshCw, User, BookOpen, Award, MessageCircle,
  CheckCircle, Clock, XCircle, Send, Plus, Loader2, GraduationCap, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppState, useConversations } from '../store'
import { supabase } from '../lib/supabase'
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
    consultation: 'هل تريد استشارة؟', consultationDesc: 'تواصل مع أحد مستشارينا لمناقشة نتائجك',
    bookNow: 'احجز الآن',
    tabProfile: 'الملف الشخصي', tabWorkshops: 'الدورات', tabCertificates: 'الشهادات', tabConsultations: 'الاستشارات',
    enroll: 'سجّل', enrolled: 'مسجّل', unenroll: 'إلغاء التسجيل', noWorkshops: 'لا توجد دورات متاحة حالياً',
    category: 'التصنيف', duration: 'المدة',
    noCertificates: 'لا توجد شهادات بعد', issuedBy: 'صادرة من', issuedAt: 'تاريخ الإصدار',
    newConsultation: 'استشارة جديدة', subject: 'الموضوع', messageLabel: 'رسالتك',
    send: 'إرسال', noConsultations: 'لا توجد استشارات بعد',
    statusPending: 'قيد المراجعة', statusReplied: 'تم الرد', statusClosed: 'مغلقة',
    adminReply: 'رد المستشار', consultationPhone: 'أو تواصل مباشرة',
    sending: 'جاري الإرسال...', subjectPlaceholder: 'موضوع استشارتك', messagePlaceholder: 'اكتب رسالتك هنا...',
    reports: 'تقرير', conversations: 'محادثة', certificates_count: 'شهادة',
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
    tabProfile: 'Profile', tabWorkshops: 'Courses', tabCertificates: 'Certificates', tabConsultations: 'Consultations',
    enroll: 'Enroll', enrolled: 'Enrolled', unenroll: 'Unenroll', noWorkshops: 'No workshops available',
    category: 'Category', duration: 'Duration',
    noCertificates: 'No certificates yet', issuedBy: 'Issued by', issuedAt: 'Issue date',
    newConsultation: 'New Consultation', subject: 'Subject', messageLabel: 'Your message',
    send: 'Send', noConsultations: 'No consultations yet',
    statusPending: 'Pending', statusReplied: 'Replied', statusClosed: 'Closed',
    adminReply: 'Advisor Reply', consultationPhone: 'Or contact directly',
    sending: 'Sending...', subjectPlaceholder: 'Consultation subject', messagePlaceholder: 'Write your message here...',
    reports: 'reports', conversations: 'conversations', certificates_count: 'certificates',
  },
}

interface StoredReport { aiResponse: string; chartData: ReportChartData }

const Ring = ({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) => {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

const ScoreRing = ({ pct, color, label }: { pct: number; color: string; label: string }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="relative">
      <Ring pct={pct} color={color} />
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{ color }}>{pct}%</span>
    </div>
    <span className="text-[11px] text-gray-500">{label}</span>
  </div>
)

const Bar = ({ pct, color }: { pct: number; color: string }) => (
  <div className="w-full bg-white/5 rounded-full h-1.5 mt-1">
    <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
  </div>
)

const Spin = () => <div className="flex justify-center py-16"><Loader2 size={24} className="text-red-500 animate-spin" /></div>

const Empty = ({ icon: Icon, text, action }: { icon: React.ElementType; text: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-3 py-16">
    <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center">
      <Icon size={22} className="text-gray-700" />
    </div>
    <p className="text-gray-600 text-sm">{text}</p>
    {action}
  </div>
)

const inp = 'w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/6 transition'

export default function DashboardPage() {
  const { user, signOut }               = useAuth()
  const { language, setLanguage }       = useAppState()
  const { conversations, deleteConversation } = useConversations()
  const [langOpen, setLangOpen]         = useState(false)
  const langRef                         = useRef<HTMLDivElement>(null)
  const [lastReport, setLastReport]     = useState<{ convId: string; data: StoredReport } | null>(null)
  const [activeTab, setActiveTab]       = useState<Tab>('profile')

  const [workshops,    setWorkshops]    = useState<Workshop[]>([])
  const [enrolledIds,  setEnrolledIds]  = useState<Set<string>>(new Set())
  const [loadingWs,    setLoadingWs]    = useState(false)
  const [enrollingId,  setEnrollingId]  = useState<string | null>(null)

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loadingCerts, setLoadingCerts] = useState(false)

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loadingConss,  setLoadingConss]  = useState(false)
  const [showForm,      setShowForm]      = useState(false)
  const [cSubject,      setCSubject]      = useState('')
  const [cMessage,      setCMessage]      = useState('')
  const [sending,       setSending]       = useState(false)

  const t    = tr[language]
  const isAr = language === 'ar'
  const userId = user?.id ?? null

  useEffect(() => {
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    const fp = getFontCSSProperties(language)
    Object.entries(fp).forEach(([p, v]) => document.documentElement.style.setProperty(p, v))
  }, [language])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (conversations.length === 0) return
    const reversed = [...conversations].reverse()
    for (const conv of reversed) {
      const raw = localStorage.getItem(`report-${conv.id}`)
      if (raw) {
        try {
          const p = JSON.parse(raw) as StoredReport
          if (p.chartData) { setLastReport({ convId: conv.id, data: p }); return }
        } catch { /* */ }
      }
    }
    setLastReport(null)
  }, [conversations])

  useEffect(() => {
    if (activeTab !== 'workshops') return
    setLoadingWs(true)
    Promise.all([
      sbWorkshops.list(),
      userId ? sbEnrollments.listForUser(userId) : Promise.resolve([]),
    ])
      .then(([ws, enrs]) => { setWorkshops(ws); setEnrolledIds(new Set(enrs.map(e => e.workshop_id))) })
      .catch(console.error)
      .finally(() => setLoadingWs(false))
  }, [activeTab, userId])

  useEffect(() => {
    if (activeTab !== 'certificates' || !userId) return
    setLoadingCerts(true)
    sbCertificates.listForUser(userId).then(setCertificates).catch(console.error).finally(() => setLoadingCerts(false))
  }, [activeTab, userId])

  useEffect(() => {
    if (activeTab !== 'consultations' || !userId) return
    setLoadingConss(true)
    sbConsultations.listForUser(userId).then(setConsultations).catch(console.error).finally(() => setLoadingConss(false))
  }, [activeTab, userId])

  const name     = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '—'
  const email    = user?.email || ''
  const initial  = name.charAt(0).toUpperCase()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    void supabase.rpc('is_admin').then(({ data }) => setIsAdmin(data === true))
  }, [user])

  const totalReports = conversations.filter(c => !!localStorage.getItem(`report-${c.id}`)).length

  const openConv = (id: string) => { sessionStorage.setItem('currentConversationId', id); (window as any).navigateTo('/chat') }
  const newChat  = () => { sessionStorage.removeItem('currentConversationId'); (window as any).navigateTo('/chat') }
  const openLastReport = () => {
    if (!lastReport) return
    const raw = localStorage.getItem(`report-${lastReport.convId}`)
    if (raw) {
      sessionStorage.setItem('reportData', raw)
      window.location.href = `${window.location.origin}/?page=report&chatId=${encodeURIComponent(lastReport.convId)}`
    }
  }

  const handleEnroll = async (wsId: string) => {
    if (!userId) return
    setEnrollingId(wsId)
    try {
      if (enrolledIds.has(wsId)) {
        await sbEnrollments.unenroll(userId, wsId)
        setEnrolledIds(p => { const s = new Set(p); s.delete(wsId); return s })
      } else {
        await sbEnrollments.enroll(userId, wsId)
        setEnrolledIds(p => new Set([...p, wsId]))
      }
    } catch (e) { console.error(e) }
    finally { setEnrollingId(null) }
  }

  const handleSendConsultation = async () => {
    if (!userId || !cSubject.trim() || !cMessage.trim()) return
    setSending(true)
    try {
      const c = await sbConsultations.create(userId, cSubject.trim(), cMessage.trim())
      setConsultations(p => [c, ...p])
      setCSubject(''); setCMessage(''); setShowForm(false)
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  const cd = lastReport?.data.chartData

  const statusBadge = (s: Consultation['status']) => {
    const map = {
      replied: { icon: CheckCircle, label: t.statusReplied, cls: 'text-green-400 bg-green-500/8 border-green-500/20' },
      closed:  { icon: XCircle,     label: t.statusClosed,  cls: 'text-gray-500 bg-white/4 border-white/8' },
      pending: { icon: Clock,        label: t.statusPending, cls: 'text-amber-400 bg-amber-500/8 border-amber-500/20' },
    }
    const { icon: Icon, label, cls } = map[s]
    return (
      <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${cls}`}>
        <Icon size={10} />{label}
      </span>
    )
  }

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile',       label: t.tabProfile,       icon: User           },
    { key: 'workshops',     label: t.tabWorkshops,     icon: BookOpen       },
    { key: 'certificates',  label: t.tabCertificates,  icon: Award          },
    { key: 'consultations', label: t.tabConsultations, icon: MessageCircle  },
  ]

  return (
    <div className="min-h-screen bg-[#080808] text-white" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#080808]/90 backdrop-blur-sm">
        <button onClick={() => (window as any).navigateTo('/')}
          className="text-xs text-gray-600 hover:text-gray-400 transition flex items-center gap-1.5">
          {isAr ? '→' : '←'} {t.back}
        </button>

        <span className="text-[#FFBD00] font-black tracking-[0.2em] text-sm">HARMONY</span>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => (window as any).navigateTo('/admin')}
              className="text-[11px] border border-red-600/35 rounded-full px-3 py-1.5 text-red-400 hover:bg-red-600/10 transition">
              {t.admin}
            </button>
          )}
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1 text-[11px] border border-white/10 rounded-full px-3 py-1.5 text-gray-500 hover:text-white hover:border-white/20 transition">
              <Globe size={11} />{language.toUpperCase()}<ChevronDown size={9} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className={`absolute top-full mt-1.5 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-50 ${isAr ? 'left-0' : 'right-0'}`}>
                {(['en', 'ar'] as const).map(lang => (
                  <button key={lang} onClick={() => { setLanguage(lang); setLangOpen(false) }}
                    className={`block w-full px-5 py-2.5 text-sm text-white hover:bg-white/8 transition text-left ${language === lang ? 'text-red-400' : ''}`}>
                    {lang === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={signOut}
            className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-red-400 transition">
            <LogOut size={13} /><span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </nav>

      {/* ── Hero header ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center text-2xl font-black border border-red-600/30 shadow-[0_0_30px_rgba(174,31,35,0.25)]">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[#080808]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{t.hello}، {name}</h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{email}</p>
              <div className="flex items-center gap-4 mt-2">
                {[
                  { label: t.conversations, value: conversations.length },
                  { label: t.reports,       value: totalReports          },
                  { label: t.certificates_count, value: certificates.length },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm">{s.value}</span>
                    <span className="text-gray-600 text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score rings (if report exists) */}
            {cd && (
              <div className="flex items-center gap-4 flex-shrink-0">
                <ScoreRing pct={cd.overall}  color="#ae1f23" label={t.overall}  />
                <ScoreRing pct={cd.harmony}  color="#f59e0b" label={t.harmony}  />
              </div>
            )}

            {/* CTA */}
            <button onClick={newChat}
              className="flex-shrink-0 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-[0_4px_20px_rgba(174,31,35,0.4)] active:scale-95">
              <Sparkles size={14} />{t.newSession}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 pb-10 space-y-5">

        {/* Tabs */}
        <div className="flex gap-0.5 bg-white/3 border border-white/6 rounded-2xl p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === key
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}>
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Profile ──────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">

            {/* Score section */}
            {cd ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Drivers bars */}
                <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 space-y-4">
                  <p className="text-[11px] text-gray-600 uppercase tracking-wider">المحركات الثلاثة</p>
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
                      <Bar pct={d.pct} color={d.color} />
                    </div>
                  ))}
                  <button onClick={openLastReport}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-600/30 text-sm text-red-400 hover:bg-red-600/10 transition">
                    <FileText size={13} />{t.viewReport}
                  </button>
                </div>

                {/* Radar */}
                <div className="lg:col-span-3 bg-[#0f0f0f] border border-white/6 rounded-2xl p-4">
                  <p className="text-[11px] text-gray-600 uppercase tracking-wider text-center mb-1">{t.cognitiveRadar}</p>
                  <RadarChart title="" color="#ae1f23" data={cd.radarCognitive} language={language} />
                </div>
              </div>
            ) : (
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-600/8 border border-red-600/15 flex items-center justify-center">
                  <BarChart2 size={24} className="text-red-600/60" />
                </div>
                <div>
                  <p className="text-white font-semibold">{t.noReport}</p>
                  <p className="text-gray-600 text-sm mt-1">{t.noReportHint}</p>
                </div>
                <button onClick={newChat}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
                  <Sparkles size={13} />{t.startNow}
                </button>
              </div>
            )}

            {/* Strengths + Development */}
            {cd && cd.allElements.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: t.strengths, icon: TrendingUp,   color: 'text-green-400',  barColor: '#22c55e', items: cd.allElements.slice(0, 3),             scoreColor: 'text-green-400' },
                  { title: t.development, icon: TrendingDown, color: 'text-orange-400', barColor: '#f97316', items: [...cd.allElements].slice(-3).reverse(), scoreColor: 'text-orange-400' },
                ].map(({ title, icon: Icon, color, barColor, items, scoreColor }) => (
                  <div key={title} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon size={14} className={color} />
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{title}</p>
                    </div>
                    <div className="space-y-3.5">
                      {items.map((el, i) => (
                        <div key={el.name}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black w-5 ${scoreColor}`}>#{i+1}</span>
                              <span className="text-sm text-white">{el.name}</span>
                            </div>
                            <span className={`text-xs font-semibold ${scoreColor}`}>{(el.score ?? 0).toFixed(1)}</span>
                          </div>
                          <Bar pct={((el.score ?? 0) / 5) * 100} color={barColor} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions + Consultation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 space-y-2">
                <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-3">{t.quickActions}</p>
                {cd && (
                  <button onClick={openLastReport}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/6 text-sm text-gray-300 hover:border-red-600/30 hover:text-white hover:bg-red-600/5 transition">
                    <FileText size={14} className="text-red-400 flex-shrink-0" />{t.viewFullReport}
                  </button>
                )}
                {conversations.length > 0 && (
                  <button onClick={() => openConv([...conversations].reverse()[0].id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/6 text-sm text-gray-300 hover:border-red-600/30 hover:text-white hover:bg-red-600/5 transition">
                    <MessageSquare size={14} className="text-red-400 flex-shrink-0" />{t.continueLastChat}
                  </button>
                )}
                <button onClick={newChat}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/6 text-sm text-gray-300 hover:border-red-600/30 hover:text-white hover:bg-red-600/5 transition">
                  <RefreshCw size={14} className="text-red-400 flex-shrink-0" />{t.retakeAssessment}
                </button>
              </div>
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="font-semibold text-white text-sm">{t.consultation}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.consultationDesc}</p>
                </div>
                <a href="tel:+97431000003"
                  className="mt-5 flex items-center justify-center gap-2 bg-gradient-to-l from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-xl py-3 text-sm font-semibold transition shadow-[0_4px_20px_rgba(174,31,35,0.3)]">
                  <Phone size={13} />+974 3100 0003
                </a>
              </div>
            </div>

            {/* Conversation history */}
            <div>
              <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-3">{t.myConversations}</p>
              {conversations.length === 0 ? (
                <Empty icon={MessageSquare} text={t.noSessions}
                  action={
                    <button onClick={newChat} className="text-red-400 text-sm hover:text-red-300 transition">{t.startNow} →</button>
                  }
                />
              ) : (
                <div className="space-y-1.5">
                  {[...conversations].reverse().map(conv => {
                    const hasReport = !!localStorage.getItem(`report-${conv.id}`)
                    return (
                      <div key={conv.id} onClick={() => openConv(conv.id)}
                        className="bg-[#0f0f0f] border border-white/5 hover:border-white/12 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition group">
                        <div className="w-8 h-8 rounded-lg bg-red-600/8 border border-red-600/15 flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={13} className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white truncate">{conv.title}</p>
                            {hasReport && <span className="flex-shrink-0 text-[10px] bg-red-600/12 text-red-400 px-1.5 py-0.5 rounded-full">{isAr ? 'تقرير' : 'Report'}</span>}
                          </div>
                          <p className="text-xs text-gray-700">{conv.messages.length} {t.messages}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={e => { e.stopPropagation(); deleteConversation(conv.id) }}
                            className="p-1.5 rounded-lg hover:bg-red-600/15 text-gray-700 hover:text-red-400 transition">
                            <Trash2 size={12} />
                          </button>
                          <span className="text-xs text-gray-600">{t.continueChat} →</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Workshops ────────────────────────────────────────────────── */}
        {activeTab === 'workshops' && (
          loadingWs ? <Spin /> :
          workshops.length === 0 ? <Empty icon={GraduationCap} text={t.noWorkshops} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workshops.map(ws => {
                const isEnrolled = enrolledIds.has(ws.id)
                const isLoading  = enrollingId === ws.id
                return (
                  <div key={ws.id} className={`bg-[#0f0f0f] rounded-2xl p-5 flex flex-col gap-4 border transition ${
                    isEnrolled ? 'border-red-600/25' : 'border-white/6'
                  }`}>
                    {ws.image_url && (
                      <img src={ws.image_url} alt="" className="w-full h-32 object-cover rounded-xl bg-white/5" />
                    )}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-white">{isAr ? ws.title_ar : ws.title_en}</h3>
                      {(isAr ? ws.desc_ar : ws.desc_en) && (
                        <p className="text-sm text-gray-500 leading-relaxed">{isAr ? ws.desc_ar : ws.desc_en}</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(isAr ? ws.category_ar : ws.category_en) && (
                          <span className="text-xs bg-red-600/8 text-red-400 px-2.5 py-1 rounded-full border border-red-600/15">
                            {isAr ? ws.category_ar : ws.category_en}
                          </span>
                        )}
                        {(isAr ? ws.duration_ar : ws.duration_en) && (
                          <span className="text-xs bg-white/4 text-gray-500 px-2.5 py-1 rounded-full border border-white/8">
                            {isAr ? ws.duration_ar : ws.duration_en}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleEnroll(ws.id)} disabled={isLoading || !userId}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                        isEnrolled
                          ? 'border border-red-600/35 text-red-400 hover:bg-red-600/10'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_15px_rgba(174,31,35,0.3)]'
                      }`}>
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : isEnrolled ? t.unenroll : t.enroll}
                    </button>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ── Tab: Certificates ─────────────────────────────────────────────── */}
        {activeTab === 'certificates' && (
          loadingCerts ? <Spin /> :
          certificates.length === 0 ? <Empty icon={Award} text={t.noCertificates} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-[#0f0f0f] border border-amber-500/15 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Award size={18} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{isAr ? cert.title_ar : cert.title_en}</h3>
                      {cert.description && <p className="text-sm text-gray-500 mt-1">{cert.description}</p>}
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-600"><span className="text-gray-500">{t.issuedBy}:</span> {cert.issued_by}</p>
                        <p className="text-xs text-gray-600"><span className="text-gray-500">{t.issuedAt}:</span> {new Date(cert.issued_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Tab: Consultations ────────────────────────────────────────────── */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <a href="tel:+97431000003" className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-400 transition">
                <Phone size={13} />{t.consultationPhone}: +974 3100 0003
              </a>
              <button onClick={() => setShowForm(f => !f)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                <Plus size={13} />{t.newConsultation}
              </button>
            </div>

            {showForm && (
              <div className="bg-[#0f0f0f] border border-red-600/20 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{t.subject}</label>
                  <input value={cSubject} onChange={e => setCSubject(e.target.value)} placeholder={t.subjectPlaceholder} className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{t.messageLabel}</label>
                  <textarea value={cMessage} onChange={e => setCMessage(e.target.value)}
                    placeholder={t.messagePlaceholder} rows={4} className={`${inp} resize-none`} />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-white transition">{isAr ? 'إلغاء' : 'Cancel'}</button>
                  <button onClick={handleSendConsultation} disabled={sending || !cSubject.trim() || !cMessage.trim()}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                    {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    {sending ? t.sending : t.send}
                  </button>
                </div>
              </div>
            )}

            {loadingConss ? <Spin /> :
             consultations.length === 0 ? <Empty icon={MessageCircle} text={t.noConsultations} /> : (
              <div className="space-y-3">
                {consultations.map(c => (
                  <div key={c.id} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm">{c.subject}</h4>
                        <p className="text-xs text-gray-700 mt-0.5">
                          {new Date(c.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      {statusBadge(c.status)}
                    </div>
                    <div className="bg-black/30 rounded-xl px-4 py-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{c.message}</p>
                    </div>
                    {c.admin_reply && (
                      <div className="bg-green-600/6 border border-green-600/15 rounded-xl px-4 py-3">
                        <p className="text-[11px] text-green-500 font-medium mb-1.5">{t.adminReply}</p>
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
