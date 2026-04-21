import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { sbConversations, type DBConversation } from '../lib/supabaseConversations'
import { supabase } from '../lib/supabase'
import {
  sbWorkshops, sbCertificates, sbConsultations,
  type Workshop, type Certificate, type Consultation,
} from '../lib/supabaseDashboard'
import {
  BarChart2, Users, MessageSquare, BookOpen, Award, MessageCircle,
  LogOut, ChevronLeft, Plus, Trash2, Edit2, Check, X, Loader2,
  CheckCircle, Clock, XCircle, Send,
} from 'lucide-react'

const ADMIN_EMAIL = 'a.hajali@ajnee.com'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

interface SupabaseUser { id: string; email: string; name: string | null; created_at: string; last_sign_in_at: string | null }

type AdminTab = 'overview' | 'users' | 'conversations' | 'workshops' | 'certificates' | 'consultations'

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview',      label: 'نظرة عامة',   icon: <BarChart2     size={16} /> },
  { key: 'users',         label: 'المستخدمون',  icon: <Users         size={16} /> },
  { key: 'conversations', label: 'المحادثات',   icon: <MessageSquare size={16} /> },
  { key: 'workshops',     label: 'الدورات',     icon: <BookOpen      size={16} /> },
  { key: 'certificates',  label: 'الشهادات',    icon: <Award         size={16} /> },
  { key: 'consultations', label: 'الاستشارات',  icon: <MessageCircle size={16} /> },
]

// ─── Blank workshop form ──────────────────────────────────────────────────────
const blankWs = (): Omit<Workshop, 'id' | 'created_at'> => ({
  title_ar: '', title_en: '', desc_ar: '', desc_en: '',
  duration_ar: '', duration_en: '', category_ar: '', category_en: '',
  image_url: '', is_active: true,
})

export default function AdminPage() {
  const { user, signOut } = useAuth()
  const isAdmin = user?.email === ADMIN_EMAIL

  const [activeTab,   setActiveTab]   = useState<AdminTab>('overview')

  // ── Data ──────────────────────────────────────────────────────────────────
  const [conversations,  setConversations]  = useState<DBConversation[]>([])
  const [supabaseUsers,  setSupabaseUsers]  = useState<SupabaseUser[]>([])
  const [workshops,      setWorkshops]      = useState<Workshop[]>([])
  const [certificates,   setCertificates]   = useState<(Certificate & { user_email?: string })[]>([])
  const [consultations,  setConsultations]  = useState<Consultation[]>([])

  // ── Loading ───────────────────────────────────────────────────────────────
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [loadingUsers, setLoadingUsers]   = useState(true)
  const [loadingWs,    setLoadingWs]      = useState(false)
  const [loadingCerts, setLoadingCerts]   = useState(false)
  const [loadingConss, setLoadingConss]   = useState(false)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedUser,  setSelectedUser]  = useState<string | null>(null)
  const [expandedConv,  setExpandedConv]  = useState<string | null>(null)

  // Workshop form
  const [wsForm,        setWsForm]        = useState<Omit<Workshop, 'id' | 'created_at'> | null>(null)
  const [editingWsId,   setEditingWsId]   = useState<string | null>(null)
  const [savingWs,      setSavingWs]      = useState(false)

  // Certificate form
  const [certForm,      setCertForm]      = useState<{ userId: string; title_ar: string; title_en: string; issued_by: string; description: string } | null>(null)
  const [savingCert,    setSavingCert]    = useState(false)

  // Consultation reply
  const [replyingId,    setReplyingId]    = useState<string | null>(null)
  const [replyText,     setReplyText]     = useState('')
  const [sendingReply,  setSendingReply]  = useState(false)

  // ── Load base data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return
    sbConversations.listAll()
      .then(setConversations).catch(console.error).finally(() => setLoadingConvs(false))
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingUsers(false); return }
      fetch(`${SUPABASE_URL}/functions/v1/admin-users`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(res => { if (res.users) setSupabaseUsers(res.users) })
        .catch(console.error)
        .finally(() => setLoadingUsers(false))
    }).catch(() => setLoadingUsers(false))
  }, [isAdmin])

  // ── Load tab-specific data ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin || activeTab !== 'workshops') return
    setLoadingWs(true)
    sbWorkshops.listAll().then(setWorkshops).catch(console.error).finally(() => setLoadingWs(false))
  }, [activeTab, isAdmin])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'certificates') return
    setLoadingCerts(true)
    sbCertificates.listAll().then(setCertificates).catch(console.error).finally(() => setLoadingCerts(false))
  }, [activeTab, isAdmin])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'consultations') return
    setLoadingConss(true)
    sbConsultations.listAll().then(setConsultations).catch(console.error).finally(() => setLoadingConss(false))
  }, [activeTab, isAdmin])

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <p>Please sign in.</p>
    </div>
  )
  if (!isAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center space-y-3">
        <p className="text-red-500 text-xl font-bold">Access Denied</p>
        <button onClick={() => (window as any).navigateTo('/dashboard')}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700">
          Go to Dashboard
        </button>
      </div>
    </div>
  )

  const userMap = Object.fromEntries(supabaseUsers.map(u => [u.id, u]))
  const filteredConvs = selectedUser ? conversations.filter(c => c.user_id === selectedUser) : conversations
  const totalReports  = conversations.filter(c => c.report_data).length

  // ── Workshop handlers ─────────────────────────────────────────────────────
  const handleSaveWorkshop = async () => {
    if (!wsForm) return
    setSavingWs(true)
    try {
      if (editingWsId) {
        await sbWorkshops.update(editingWsId, wsForm)
        setWorkshops(ws => ws.map(w => w.id === editingWsId ? { ...w, ...wsForm } : w))
      } else {
        const created = await sbWorkshops.create(wsForm)
        setWorkshops(ws => [created, ...ws])
      }
      setWsForm(null); setEditingWsId(null)
    } catch (e) { console.error(e) }
    finally { setSavingWs(false) }
  }

  const handleDeleteWorkshop = async (id: string) => {
    if (!confirm('حذف هذه الدورة؟')) return
    try { await sbWorkshops.remove(id); setWorkshops(ws => ws.filter(w => w.id !== id)) }
    catch (e) { console.error(e) }
  }

  // ── Certificate handlers ──────────────────────────────────────────────────
  const handleIssueCert = async () => {
    if (!certForm || !certForm.userId || !certForm.title_ar) return
    setSavingCert(true)
    try {
      const created = await sbCertificates.issue({
        user_id: certForm.userId,
        title_ar: certForm.title_ar,
        title_en: certForm.title_en,
        issued_by: certForm.issued_by || 'Harmony',
        description: certForm.description || null,
      })
      const u = userMap[certForm.userId]
      setCertificates(prev => [{ ...created, user_email: u?.email }, ...prev])
      setCertForm(null)
    } catch (e) { console.error(e) }
    finally { setSavingCert(false) }
  }

  const handleRevokeCert = async (id: string) => {
    if (!confirm('إلغاء هذه الشهادة؟')) return
    try { await sbCertificates.revoke(id); setCertificates(c => c.filter(x => x.id !== id)) }
    catch (e) { console.error(e) }
  }

  // ── Consultation reply ────────────────────────────────────────────────────
  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      await sbConsultations.reply(id, replyText.trim())
      setConsultations(c => c.map(x => x.id === id ? { ...x, status: 'replied', admin_reply: replyText.trim(), replied_at: new Date().toISOString() } : x))
      setReplyingId(null); setReplyText('')
    } catch (e) { console.error(e) }
    finally { setSendingReply(false) }
  }

  const handleCloseConsultation = async (id: string) => {
    try {
      await sbConsultations.close(id)
      setConsultations(c => c.map(x => x.id === id ? { ...x, status: 'closed' } : x))
    } catch (e) { console.error(e) }
  }

  const Spinner = () => <div className="flex justify-center py-16"><Loader2 size={28} className="text-red-500 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-black text-white flex" dir="rtl">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 border-l border-white/8 bg-[#0a0a0a] flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-5 py-6 border-b border-white/8">
          <button onClick={() => (window as any).navigateTo('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition mb-3">
            <ChevronLeft size={13} />الصفحة الرئيسية
          </button>
          <p className="font-bold text-white text-base">لوحة تحكم المدير</p>
          <p className="text-xs text-gray-500 mt-0.5">هارموني</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                activeTab === tab.key
                  ? 'bg-white text-black font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/8 space-y-1">
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-600/10 transition">
            <LogOut size={16} />تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-6">

        {/* ── Overview ───────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">نظرة عامة</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'إجمالي المستخدمين', value: supabaseUsers.length,  color: 'text-red-500'  },
                { label: 'المحادثات',          value: conversations.length,  color: 'text-blue-400' },
                { label: 'التقارير المُنشأة',  value: totalReports,          color: 'text-green-400'},
                { label: 'نشطون اليوم',        value: supabaseUsers.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at).toDateString() === new Date().toDateString()).length, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 text-center">
                  <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Recent users */}
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
              <h2 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">آخر المستخدمين</h2>
              <div className="space-y-3">
                {[...supabaseUsers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-xs font-bold text-red-400">
                      {(u.name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{u.name || u.email}</p>
                      <p className="text-xs text-gray-600">{new Date(u.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <span className="text-xs text-gray-600">{conversations.filter(c => c.user_id === u.id).length} محادثة</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Users ──────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold">المستخدمون <span className="text-base font-normal text-gray-500">({supabaseUsers.length})</span></h1>
            {loadingUsers ? <Spinner /> : (
              <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {supabaseUsers.map(u => {
                    const convCount   = conversations.filter(c => c.user_id === u.id).length
                    const reportCount = conversations.filter(c => c.user_id === u.id && c.report_data).length
                    return (
                      <div key={u.id}
                        onClick={() => { setSelectedUser(u.id === selectedUser ? null : u.id); setActiveTab('conversations') }}
                        className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/3 transition group">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center font-bold text-red-400 flex-shrink-0">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{u.name || '—'}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5 text-left">
                          <p>{convCount} محادثة · {reportCount} تقرير</p>
                          <p>{new Date(u.created_at).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <span className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition">عرض المحادثات ←</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Conversations ───────────────────────────────────────────────── */}
        {activeTab === 'conversations' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {selectedUser ? `محادثات — ${userMap[selectedUser]?.name || userMap[selectedUser]?.email}` : 'المحادثات'}
                <span className="text-base font-normal text-gray-500 mr-2">({filteredConvs.length})</span>
              </h1>
              {selectedUser && (
                <button onClick={() => setSelectedUser(null)} className="text-xs text-red-400 hover:text-red-300 border border-red-600/30 rounded-full px-3 py-1.5">
                  إلغاء الفلتر
                </button>
              )}
            </div>
            {loadingConvs ? <Spinner /> : (
              <div className="space-y-3">
                {filteredConvs.map(conv => {
                  const owner      = userMap[conv.user_id]
                  const isExpanded = expandedConv === conv.id
                  const hasReport  = !!conv.report_data
                  let reportSummary: any = null
                  if (hasReport) { try { reportSummary = JSON.parse(conv.report_data!).chartData } catch { /* ignore */ } }

                  return (
                    <div key={conv.id} className="bg-[#0f0f0f] border border-white/8 rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 flex items-start justify-between cursor-pointer hover:bg-white/3 transition"
                        onClick={() => setExpandedConv(isExpanded ? null : conv.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{conv.title || 'بدون عنوان'}</p>
                            {hasReport && <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full">تقرير</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {owner?.name || owner?.email || '—'} · {conv.messages.length} رسالة · {new Date(conv.updated_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <span className="text-gray-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-3 border-t border-white/5">
                          {reportSummary && (
                            <div className="bg-black/40 rounded-xl p-4 mt-4">
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">نتائج التقرير</p>
                              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                {[
                                  { label: 'الإجمالي', value: reportSummary.overall + '%' },
                                  { label: 'الانسجام', value: reportSummary.harmony + '%' },
                                  { label: 'الذهني',   value: reportSummary.mental?.percentage + '%' },
                                  { label: 'المشاعري', value: reportSummary.emotional?.percentage + '%' },
                                  { label: 'السلوكي',  value: reportSummary.existential?.percentage + '%' },
                                ].map(s => (
                                  <div key={s.label} className="text-center bg-white/5 rounded-xl p-2.5">
                                    <p className="text-lg font-bold text-red-400">{s.value}</p>
                                    <p className="text-xs text-gray-500">{s.label}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="bg-black/40 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">الرسائل</p>
                            {conv.messages.slice(-6).map((m, i) => (
                              <div key={i} className={`text-xs px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-white/10' : 'bg-red-900/20'}`}>
                                <span className="text-gray-500 text-[10px] block mb-0.5">{m.role === 'user' ? 'المستخدم' : 'هارموني'}</span>
                                <span className="text-gray-300 line-clamp-2">{m.content}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Workshops ───────────────────────────────────────────────────── */}
        {activeTab === 'workshops' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">الدورات</h1>
              <button onClick={() => { setWsForm(blankWs()); setEditingWsId(null) }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
                <Plus size={15} />إضافة دورة
              </button>
            </div>

            {/* Workshop form */}
            {wsForm && (
              <div className="bg-[#0f0f0f] border border-red-600/30 rounded-2xl p-5 space-y-4">
                <p className="font-semibold text-sm">{editingWsId ? 'تعديل الدورة' : 'دورة جديدة'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { key: 'title_ar',    label: 'الاسم بالعربي' },
                    { key: 'title_en',    label: 'الاسم بالإنجليزي' },
                    { key: 'category_ar', label: 'التصنيف بالعربي' },
                    { key: 'category_en', label: 'التصنيف بالإنجليزي' },
                    { key: 'duration_ar', label: 'المدة بالعربي' },
                    { key: 'duration_en', label: 'المدة بالإنجليزي' },
                  ] as { key: keyof typeof wsForm; label: string }[]).map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
                      <input value={(wsForm as any)[f.key] ?? ''}
                        onChange={e => setWsForm(w => w ? { ...w, [f.key]: e.target.value } : w)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 transition" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">الوصف بالعربي</label>
                  <textarea value={wsForm.desc_ar ?? ''} rows={2}
                    onChange={e => setWsForm(w => w ? { ...w, desc_ar: e.target.value } : w)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600/50 transition resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">الوصف بالإنجليزي</label>
                  <textarea value={wsForm.desc_en ?? ''} rows={2}
                    onChange={e => setWsForm(w => w ? { ...w, desc_en: e.target.value } : w)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600/50 transition resize-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ws-active" checked={wsForm.is_active}
                    onChange={e => setWsForm(w => w ? { ...w, is_active: e.target.checked } : w)}
                    className="accent-red-600 w-4 h-4" />
                  <label htmlFor="ws-active" className="text-sm text-gray-300">نشطة</label>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setWsForm(null); setEditingWsId(null) }} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">إلغاء</button>
                  <button onClick={handleSaveWorkshop} disabled={savingWs || !wsForm.title_ar}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                    {savingWs ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    حفظ
                  </button>
                </div>
              </div>
            )}

            {loadingWs ? <Spinner /> : workshops.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-12 text-center">
                <BookOpen size={36} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد دورات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workshops.map(ws => (
                  <div key={ws.id} className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{ws.title_ar}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${ws.is_active ? 'bg-green-600/15 text-green-400' : 'bg-gray-600/15 text-gray-500'}`}>
                          {ws.is_active ? 'نشطة' : 'معطّلة'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{ws.title_en} · {ws.category_ar} · {ws.duration_ar}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { setWsForm({ title_ar: ws.title_ar, title_en: ws.title_en, desc_ar: ws.desc_ar, desc_en: ws.desc_en, duration_ar: ws.duration_ar, duration_en: ws.duration_en, category_ar: ws.category_ar, category_en: ws.category_en, image_url: ws.image_url, is_active: ws.is_active }); setEditingWsId(ws.id) }}
                        className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteWorkshop(ws.id)}
                        className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-600/30 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Certificates ────────────────────────────────────────────────── */}
        {activeTab === 'certificates' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">الشهادات</h1>
              <button onClick={() => setCertForm({ userId: '', title_ar: '', title_en: '', issued_by: 'Harmony', description: '' })}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
                <Plus size={15} />إصدار شهادة
              </button>
            </div>

            {/* Certificate form */}
            {certForm && (
              <div className="bg-[#0f0f0f] border border-red-600/30 rounded-2xl p-5 space-y-4">
                <p className="font-semibold text-sm">إصدار شهادة جديدة</p>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">المستخدم</label>
                  <select value={certForm.userId} onChange={e => setCertForm(f => f ? { ...f, userId: e.target.value } : f)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600/50 transition">
                    <option value="">اختر المستخدم</option>
                    {supabaseUsers.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">اسم الشهادة بالعربي</label>
                    <input value={certForm.title_ar} onChange={e => setCertForm(f => f ? { ...f, title_ar: e.target.value } : f)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600/50 transition" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">اسم الشهادة بالإنجليزي</label>
                    <input value={certForm.title_en} onChange={e => setCertForm(f => f ? { ...f, title_en: e.target.value } : f)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600/50 transition" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">صادرة من</label>
                  <input value={certForm.issued_by} onChange={e => setCertForm(f => f ? { ...f, issued_by: e.target.value } : f)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600/50 transition" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">الوصف (اختياري)</label>
                  <input value={certForm.description} onChange={e => setCertForm(f => f ? { ...f, description: e.target.value } : f)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600/50 transition" />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setCertForm(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">إلغاء</button>
                  <button onClick={handleIssueCert} disabled={savingCert || !certForm.userId || !certForm.title_ar}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                    {savingCert ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                    إصدار
                  </button>
                </div>
              </div>
            )}

            {loadingCerts ? <Spinner /> : certificates.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-12 text-center">
                <Award size={36} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد شهادات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-[#0f0f0f] border border-amber-500/15 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                      <Award size={16} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{cert.title_ar}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cert.user_email || userMap[cert.user_id]?.email || cert.user_id} · {cert.issued_by} · {new Date(cert.issued_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <button onClick={() => handleRevokeCert(cert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-600/25 rounded-lg hover:bg-red-600/10 transition">
                      <X size={12} />إلغاء
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Consultations ────────────────────────────────────────────────── */}
        {activeTab === 'consultations' && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold">
              الاستشارات
              <span className="text-base font-normal text-gray-500 mr-2">
                ({consultations.filter(c => c.status === 'pending').length} قيد المراجعة)
              </span>
            </h1>
            {loadingConss ? <Spinner /> : consultations.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-12 text-center">
                <MessageCircle size={36} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد استشارات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map(c => (
                  <div key={c.id} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm">{c.subject}</p>
                          <div className="flex items-center gap-1 text-xs">
                            {c.status === 'replied' ? <CheckCircle size={11} className="text-green-400" /> :
                             c.status === 'closed'  ? <XCircle     size={11} className="text-gray-500" /> :
                                                      <Clock       size={11} className="text-amber-400" />}
                            <span className={c.status === 'replied' ? 'text-green-400' : c.status === 'closed' ? 'text-gray-500' : 'text-amber-400'}>
                              {c.status === 'replied' ? 'تم الرد' : c.status === 'closed' ? 'مغلقة' : 'قيد المراجعة'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{c.message}</p>
                        <p className="text-xs text-gray-600 mt-1.5">
                          {userMap[c.user_id]?.name || userMap[c.user_id]?.email || c.user_id} · {new Date(c.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {c.status !== 'closed' && (
                          <button onClick={() => { setReplyingId(replyingId === c.id ? null : c.id); setReplyText('') }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/30 transition">
                            <Send size={11} />رد
                          </button>
                        )}
                        {c.status !== 'closed' && (
                          <button onClick={() => handleCloseConsultation(c.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-600/30 transition">
                            <XCircle size={11} />إغلاق
                          </button>
                        )}
                      </div>
                    </div>

                    {c.admin_reply && (
                      <div className="mt-3 bg-green-600/8 border border-green-600/20 rounded-xl p-3">
                        <p className="text-xs text-green-400 font-medium mb-1">ردك</p>
                        <p className="text-sm text-gray-300">{c.admin_reply}</p>
                      </div>
                    )}

                    {replyingId === c.id && (
                      <div className="mt-3 space-y-2">
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                          placeholder="اكتب ردك هنا..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 transition resize-none" />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setReplyingId(null); setReplyText('') }} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition">إلغاء</button>
                          <button onClick={() => handleSendReply(c.id)} disabled={sendingReply || !replyText.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50">
                            {sendingReply ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                            إرسال
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
