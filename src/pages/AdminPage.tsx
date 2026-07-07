import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { sbConversations, type DBConversation } from '../lib/supabaseConversations'
import { supabase } from '../lib/supabase'
import {
  sbWorkshops, sbCertificates, sbConsultations,
  type Workshop, type Certificate, type Consultation,
} from '../lib/supabaseDashboard'
import {
  LayoutDashboard, Users, MessageSquare, BookOpen, Award, MessageCircle,
  LogOut, ChevronLeft, Plus, Trash2, Edit2, Check, X, Loader2,
  CheckCircle, Clock, XCircle, Send, Search, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react'


interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

type AdminTab = 'overview' | 'users' | 'conversations' | 'workshops' | 'certificates' | 'consultations'

const TABS = [
  { key: 'overview'      as AdminTab, label: 'نظرة عامة',  icon: LayoutDashboard },
  { key: 'users'         as AdminTab, label: 'المستخدمون', icon: Users           },
  { key: 'conversations' as AdminTab, label: 'المحادثات',  icon: MessageSquare   },
  { key: 'workshops'     as AdminTab, label: 'الدورات',    icon: BookOpen        },
  { key: 'certificates'  as AdminTab, label: 'الشهادات',   icon: Award           },
  { key: 'consultations' as AdminTab, label: 'الاستشارات', icon: MessageCircle   },
]

const ROLES = [
  { value: 'user',        label: 'مستخدم',   color: 'text-gray-400 bg-white/5 border-white/10'              },
  { value: 'trainer',     label: 'مدرب',     color: 'text-amber-400 bg-amber-500/10 border-amber-500/25'    },
  { value: 'institution', label: 'مؤسسة',    color: 'text-blue-400 bg-blue-500/10 border-blue-500/25'       },
  { value: 'admin',       label: 'مدير',     color: 'text-red-400 bg-red-500/10 border-red-500/25'          },
]

const roleStyle = (role: string) => ROLES.find(r => r.value === role) ?? ROLES[0]
const initial  = (u: AdminUser) => (u.name || u.email || '?').charAt(0).toUpperCase()
const fmt      = (d: string) => new Date(d).toLocaleDateString('ar-SA')
const blankWs  = (): Omit<Workshop, 'id' | 'created_at'> => ({
  title_ar: '', title_en: '', desc_ar: '', desc_en: '',
  duration_ar: '', duration_en: '', category_ar: '', category_en: '',
  image_url: '', is_active: true,
})

// ─── Sub-components ───────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 size={28} className="text-red-500 animate-spin" />
  </div>
)

const Empty = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center mb-4">
      <Icon size={24} className="text-gray-600" />
    </div>
    <p className="text-gray-500 text-sm">{label}</p>
  </div>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
    {children}
  </div>
)

const inp = 'w-full bg-white/4 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/6 transition'

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, signOut } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  const [tab, setTab] = useState<AdminTab>('overview')

  // data
  const [users,         setUsers]         = useState<AdminUser[]>([])
  const [conversations, setConversations] = useState<DBConversation[]>([])
  const [workshops,     setWorkshops]     = useState<Workshop[]>([])
  const [certificates,  setCertificates]  = useState<Certificate[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])

  // loading
  const [loadingUsers, setLoadingUsers]   = useState(true)
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [loadingWs,    setLoadingWs]      = useState(false)
  const [loadingCerts, setLoadingCerts]   = useState(false)
  const [loadingConss, setLoadingConss]   = useState(false)
  const [usersErr,     setUsersErr]       = useState<string | null>(null)

  // ui
  const [userSearch,    setUserSearch]    = useState('')
  const [convFilter,    setConvFilter]    = useState<string | null>(null)
  const [expandedConv,  setExpandedConv]  = useState<string | null>(null)
  const [consFilter,    setConsFilter]    = useState<'all' | 'pending' | 'replied' | 'closed'>('all')

  // workshop form
  const [wsForm,      setWsForm]      = useState<Omit<Workshop, 'id' | 'created_at'> | null>(null)
  const [editingWsId, setEditingWsId] = useState<string | null>(null)
  const [savingWs,    setSavingWs]    = useState(false)

  // certificate form
  const [certForm,  setCertForm]  = useState<{ userId: string; title_ar: string; title_en: string; issued_by: string; description: string } | null>(null)
  const [savingCert, setSavingCert] = useState(false)

  // role
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  // reply
  const [replyingId,  setReplyingId]  = useState<string | null>(null)
  const [replyText,   setReplyText]   = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // ── Check admin role ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    void supabase.rpc('is_admin').then(({ data }) => setIsAdmin(data === true))
  }, [user])

  // ── Loaders ─────────────────────────────────────────────────────────────────
  const loadUsers = () => {
    setLoadingUsers(true); setUsersErr(null)
    void supabase.rpc('admin_get_users').then(({ data, error }) => {
      if (error) setUsersErr(error.message)
      else setUsers((data ?? []) as AdminUser[])
      setLoadingUsers(false)
    })
  }

  useEffect(() => { if (!isAdmin) return; loadUsers() }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    sbConversations.listAll()
      .then(setConversations).catch(console.error).finally(() => setLoadingConvs(false))
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== 'workshops') return
    setLoadingWs(true)
    sbWorkshops.listAll().then(setWorkshops).catch(console.error).finally(() => setLoadingWs(false))
  }, [tab, isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== 'certificates') return
    setLoadingCerts(true)
    sbCertificates.listAll().then(setCertificates).catch(console.error).finally(() => setLoadingCerts(false))
  }, [tab, isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== 'consultations') return
    setLoadingConss(true)
    sbConsultations.listAll().then(setConsultations).catch(console.error).finally(() => setLoadingConss(false))
  }, [tab, isAdmin])

  // ── Derived data ─────────────────────────────────────────────────────────────
  const userMap       = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])
  const filteredUsers = useMemo(() =>
    userSearch ? users.filter(u =>
      (u.name ?? '').toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    ) : users
  , [users, userSearch])

  const filteredConvs = convFilter ? conversations.filter(c => c.user_id === convFilter) : conversations
  const filteredConss = consFilter === 'all' ? consultations : consultations.filter(c => c.status === consFilter)
  const totalReports  = conversations.filter(c => c.report_data).length
  const pendingConss  = consultations.filter(c => c.status === 'pending').length

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleToggleRole = async (u: AdminUser) => {
    const cycle: Record<string, string> = { user: 'trainer', trainer: 'institution', institution: 'user' }
    const newRole = cycle[u.role] ?? 'user'
    setUpdatingRole(u.id)
    const { error } = await supabase.rpc('update_user_role', { target_id: u.id, new_role: newRole })
    if (error) alert('فشل تغيير الدور: ' + error.message)
    else setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x))
    setUpdatingRole(null)
  }

  const handleDeleteUser = async (u: AdminUser) => {
    if (!confirm(`حذف ${u.email}؟ لا يمكن التراجع.`)) return
    const { error } = await supabase.rpc('delete_user', { target_id: u.id })
    if (error) alert('فشل الحذف: ' + error.message)
    else setUsers(prev => prev.filter(x => x.id !== u.id))
  }

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

  const handleIssueCert = async () => {
    if (!certForm?.userId || !certForm.title_ar) return
    setSavingCert(true)
    try {
      const created = await sbCertificates.issue({
        user_id: certForm.userId, title_ar: certForm.title_ar,
        title_en: certForm.title_en, issued_by: certForm.issued_by || 'Harmony',
        description: certForm.description || null,
      })
      setCertificates(prev => [created, ...prev])
      setCertForm(null)
    } catch (e) { console.error(e) }
    finally { setSavingCert(false) }
  }

  const handleRevokeCert = async (id: string) => {
    if (!confirm('إلغاء هذه الشهادة؟')) return
    try { await sbCertificates.revoke(id); setCertificates(c => c.filter(x => x.id !== id)) }
    catch (e) { console.error(e) }
  }

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      await sbConsultations.reply(id, replyText.trim())
      setConsultations(c => c.map(x => x.id === id
        ? { ...x, status: 'replied', admin_reply: replyText.trim(), replied_at: new Date().toISOString() }
        : x))
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

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <p className="text-gray-500 text-sm">يرجى تسجيل الدخول.</p>
    </div>
  )
  if (isAdmin === null) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 size={24} className="text-red-500 animate-spin" />
    </div>
  )
  if (!isAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mx-auto">
          <X size={28} className="text-red-500" />
        </div>
        <p className="text-white font-semibold">غير مصرّح</p>
        <button onClick={() => (window as any).navigateTo('/dashboard')}
          className="text-sm text-gray-500 hover:text-white border border-white/10 rounded-xl px-4 py-2 transition">
          العودة للرئيسية
        </button>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] text-white flex" dir="rtl">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-l border-white/6 bg-[#0c0c0c]">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/6">
          <button onClick={() => (window as any).navigateTo('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition mb-4">
            <ChevronLeft size={12} />الصفحة الرئيسية
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-600/25 flex items-center justify-center">
              <LayoutDashboard size={16} className="text-red-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">لوحة التحكم</p>
              <p className="text-[11px] text-gray-600">Harmony Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition ${
                tab === key
                  ? 'bg-white text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}>
              <Icon size={15} />
              {label}
              {key === 'consultations' && pendingConss > 0 && (
                <span className={`mr-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === key ? 'bg-black/20 text-black' : 'bg-red-600/20 text-red-400'
                }`}>{pendingConss}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 border-t border-white/6">
          <div className="px-3.5 py-2.5 mb-1 rounded-xl bg-white/3 border border-white/6">
            <p className="text-xs text-white font-medium truncate">{user.email}</p>
            <p className="text-[11px] text-red-400 mt-0.5">مدير النظام</p>
          </div>
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-600 hover:text-red-400 hover:bg-red-600/8 transition">
            <LogOut size={14} />تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="p-8 space-y-7 max-w-5xl">
            <div>
              <h1 className="text-xl font-bold text-white">نظرة عامة</h1>
              <p className="text-sm text-gray-500 mt-1">مرحباً، {user.email}</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'المستخدمون',      value: users.length,         icon: Users,         color: 'text-blue-400',  bg: 'bg-blue-500/8  border-blue-500/15'  },
                { label: 'المحادثات',        value: conversations.length, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/8 border-purple-500/15' },
                { label: 'التقارير المُنشأة', value: totalReports,         icon: Award,         color: 'text-green-400', bg: 'bg-green-500/8  border-green-500/15'  },
                { label: 'استشارات معلّقة',  value: pendingConss,          icon: MessageCircle, color: 'text-amber-400', bg: 'bg-amber-500/8  border-amber-500/15'  },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
                      <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                    <s.icon size={18} className={`${s.color} opacity-60 mt-0.5`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent users */}
            <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">آخر المستخدمين</p>
                <p className="text-xs text-gray-600">{users.length} إجمالاً</p>
              </div>
              {loadingUsers ? <Spinner /> : (
                <div className="divide-y divide-white/4">
                  {[...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 6).map(u => {
                      const rs = roleStyle(u.role)
                      return (
                        <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                            {initial(u)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{u.name || u.email}</p>
                            {u.name && <p className="text-xs text-gray-600 truncate">{u.email}</p>}
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${rs.color}`}>{rs.label}</span>
                          <p className="text-xs text-gray-700 flex-shrink-0">{fmt(u.created_at)}</p>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Users ────────────────────────────────────────────────────────── */}
        {tab === 'users' && (
          <div className="p-8 space-y-5 max-w-5xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">المستخدمون</h1>
                <p className="text-sm text-gray-500 mt-0.5">{users.length} مستخدم مسجّل</p>
              </div>
              <button onClick={loadUsers} className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition">
                <RefreshCw size={13} />تحديث
              </button>
            </div>

            {usersErr && (
              <div className="bg-red-950/30 border border-red-600/25 rounded-xl px-4 py-3 text-sm text-red-400">
                {usersErr}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="بحث بالاسم أو البريد..."
                className="w-full bg-white/4 border border-white/8 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition" />
            </div>

            {loadingUsers ? <Spinner /> : (
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl overflow-hidden">
                {/* Table head */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/6 text-[11px] text-gray-600 uppercase tracking-wider">
                  <span>المستخدم</span>
                  <span>الدور</span>
                  <span>المحادثات</span>
                  <span>تاريخ الانضمام</span>
                  <span></span>
                </div>
                <div className="divide-y divide-white/4">
                  {filteredUsers.map(u => {
                    const convCount   = conversations.filter(c => c.user_id === u.id).length
                    const reportCount = conversations.filter(c => c.user_id === u.id && c.report_data).length
                    const rs = roleStyle(u.role)
                    return (
                      <div key={u.id}
                        className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/2 transition group">
                        {/* User */}
                        <div className="flex items-center gap-3 min-w-0 cursor-pointer"
                          onClick={() => { setConvFilter(u.id); setTab('conversations') }}>
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center font-bold text-sm text-gray-300 flex-shrink-0">
                            {initial(u)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{u.name || '—'}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        {/* Role */}
                        <button onClick={() => handleToggleRole(u)} disabled={updatingRole === u.id}
                          title="اضغط لتغيير الدور"
                          className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition hover:opacity-80 flex-shrink-0 ${rs.color}`}>
                          {updatingRole === u.id ? '...' : rs.label}
                        </button>
                        {/* Stats */}
                        <p className="text-xs text-gray-500 text-center flex-shrink-0">
                          {convCount} <span className="text-gray-700">·</span> {reportCount} تقرير
                        </p>
                        {/* Date */}
                        <p className="text-xs text-gray-700 flex-shrink-0">{fmt(u.created_at)}</p>
                        {/* Delete */}
                        <button onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-600/10 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-600 text-sm py-10">لا نتائج</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Conversations ─────────────────────────────────────────────────── */}
        {tab === 'conversations' && (
          <div className="p-8 space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">المحادثات</h1>
                <p className="text-sm text-gray-500 mt-0.5">{filteredConvs.length} محادثة</p>
              </div>
              {convFilter && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    مفلتر على: <strong className="text-white">{userMap[convFilter]?.name || userMap[convFilter]?.email}</strong>
                  </span>
                  <button onClick={() => setConvFilter(null)}
                    className="text-xs text-red-400 border border-red-600/25 rounded-lg px-3 py-1.5 hover:bg-red-600/10 transition">
                    <X size={11} className="inline ml-1" />إلغاء الفلتر
                  </button>
                </div>
              )}
            </div>

            {loadingConvs ? <Spinner /> : filteredConvs.length === 0 ? <Empty icon={MessageSquare} label="لا توجد محادثات" /> : (
              <div className="space-y-2">
                {filteredConvs.map(conv => {
                  const owner     = userMap[conv.user_id]
                  const expanded  = expandedConv === conv.id
                  const hasReport = !!conv.report_data
                  let report: any = null
                  if (hasReport) { try { report = JSON.parse(conv.report_data!).chartData } catch { /* */ } }

                  return (
                    <div key={conv.id} className="bg-[#0f0f0f] border border-white/6 rounded-2xl overflow-hidden">
                      <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition text-right"
                        onClick={() => setExpandedConv(expanded ? null : conv.id)}>
                        <div className="w-9 h-9 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                          {owner ? initial(owner) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{conv.title || 'بدون عنوان'}</p>
                            {hasReport && <span className="text-[10px] bg-green-600/15 text-green-400 px-2 py-0.5 rounded-full">تقرير</span>}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 truncate">
                            {owner?.name || owner?.email || conv.user_id} · {conv.messages.length} رسالة · {fmt(conv.updated_at)}
                          </p>
                        </div>
                        {expanded ? <ChevronUp size={14} className="text-gray-600 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-600 flex-shrink-0" />}
                      </button>

                      {expanded && (
                        <div className="px-5 pb-5 space-y-3 border-t border-white/5">
                          {report && (
                            <div className="mt-4 grid grid-cols-5 gap-2">
                              {[
                                { label: 'الإجمالي', value: report.overall },
                                { label: 'الانسجام', value: report.harmony },
                                { label: 'الذهني',   value: report.mental?.percentage },
                                { label: 'المشاعري', value: report.emotional?.percentage },
                                { label: 'السلوكي',  value: report.existential?.percentage },
                              ].map(s => (
                                <div key={s.label} className="text-center bg-white/4 rounded-xl py-3">
                                  <p className="text-base font-black text-red-400">{s.value ?? '—'}%</p>
                                  <p className="text-[10px] text-gray-600 mt-0.5">{s.label}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="bg-black/40 rounded-xl p-4 max-h-52 overflow-y-auto space-y-2">
                            {conv.messages.slice(-6).map((m, i) => (
                              <div key={i} className={`text-xs px-3 py-2 rounded-xl ${m.role === 'user' ? 'bg-white/7' : 'bg-red-900/15'}`}>
                                <p className="text-gray-600 text-[10px] mb-0.5">{m.role === 'user' ? 'المستخدم' : 'هارموني'}</p>
                                <p className="text-gray-300 line-clamp-2">{m.content}</p>
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

        {/* ── Workshops ─────────────────────────────────────────────────────── */}
        {tab === 'workshops' && (
          <div className="p-8 space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">الدورات</h1>
                <p className="text-sm text-gray-500 mt-0.5">{workshops.length} دورة</p>
              </div>
              <button onClick={() => { setWsForm(blankWs()); setEditingWsId(null) }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
                <Plus size={14} />دورة جديدة
              </button>
            </div>

            {/* Form */}
            {wsForm && (
              <div className="bg-[#0f0f0f] border border-red-600/25 rounded-2xl p-6 space-y-5">
                <p className="font-semibold text-sm text-white">{editingWsId ? 'تعديل الدورة' : 'دورة جديدة'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { key: 'title_ar',    label: 'الاسم بالعربي' },
                    { key: 'title_en',    label: 'الاسم بالإنجليزي' },
                    { key: 'category_ar', label: 'التصنيف بالعربي' },
                    { key: 'category_en', label: 'التصنيف بالإنجليزي' },
                    { key: 'duration_ar', label: 'المدة بالعربي' },
                    { key: 'duration_en', label: 'المدة بالإنجليزي' },
                    { key: 'image_url',   label: 'رابط الصورة' },
                  ] as { key: keyof typeof wsForm; label: string }[]).map(f => (
                    <Field key={f.key} label={f.label}>
                      <input value={(wsForm as any)[f.key] ?? ''} placeholder={f.label}
                        onChange={e => setWsForm(w => w ? { ...w, [f.key]: e.target.value } : w)}
                        className={inp} />
                    </Field>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="الوصف بالعربي">
                    <textarea value={wsForm.desc_ar ?? ''} rows={3}
                      onChange={e => setWsForm(w => w ? { ...w, desc_ar: e.target.value } : w)}
                      className={`${inp} resize-none`} />
                  </Field>
                  <Field label="الوصف بالإنجليزي">
                    <textarea value={wsForm.desc_en ?? ''} rows={3}
                      onChange={e => setWsForm(w => w ? { ...w, desc_en: e.target.value } : w)}
                      className={`${inp} resize-none`} />
                  </Field>
                </div>
                <div className="flex items-center gap-2.5">
                  <input type="checkbox" id="ws-active" checked={wsForm.is_active}
                    onChange={e => setWsForm(w => w ? { ...w, is_active: e.target.checked } : w)}
                    className="accent-red-600 w-4 h-4 rounded" />
                  <label htmlFor="ws-active" className="text-sm text-gray-300">دورة نشطة</label>
                </div>
                <div className="flex gap-3 justify-end pt-2 border-t border-white/6">
                  <button onClick={() => { setWsForm(null); setEditingWsId(null) }}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-white transition">إلغاء</button>
                  <button onClick={handleSaveWorkshop} disabled={savingWs || !wsForm.title_ar}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                    {savingWs ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}حفظ
                  </button>
                </div>
              </div>
            )}

            {loadingWs ? <Spinner /> : workshops.length === 0 ? <Empty icon={BookOpen} label="لا توجد دورات بعد" /> : (
              <div className="space-y-2">
                {workshops.map(ws => (
                  <div key={ws.id} className="bg-[#0f0f0f] border border-white/6 rounded-2xl px-5 py-4 flex items-center gap-4 group">
                    {ws.image_url && (
                      <img src={ws.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-white/5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm">{ws.title_ar}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          ws.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-600 border border-white/8'
                        }`}>{ws.is_active ? 'نشطة' : 'معطّلة'}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        {ws.title_en}
                        {ws.category_ar && ` · ${ws.category_ar}`}
                        {ws.duration_ar && ` · ${ws.duration_ar}`}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                      <button onClick={() => {
                        setWsForm({ title_ar: ws.title_ar, title_en: ws.title_en, desc_ar: ws.desc_ar, desc_en: ws.desc_en, duration_ar: ws.duration_ar, duration_en: ws.duration_en, category_ar: ws.category_ar, category_en: ws.category_en, image_url: ws.image_url, is_active: ws.is_active })
                        setEditingWsId(ws.id)
                      }} className="p-2 rounded-lg border border-white/8 text-gray-500 hover:text-white hover:border-white/20 transition">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteWorkshop(ws.id)}
                        className="p-2 rounded-lg border border-white/8 text-gray-500 hover:text-red-400 hover:border-red-600/25 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Certificates ──────────────────────────────────────────────────── */}
        {tab === 'certificates' && (
          <div className="p-8 space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">الشهادات</h1>
                <p className="text-sm text-gray-500 mt-0.5">{certificates.length} شهادة</p>
              </div>
              <button onClick={() => setCertForm({ userId: '', title_ar: '', title_en: '', issued_by: 'Harmony', description: '' })}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
                <Plus size={14} />إصدار شهادة
              </button>
            </div>

            {/* Form */}
            {certForm && (
              <div className="bg-[#0f0f0f] border border-red-600/25 rounded-2xl p-6 space-y-4">
                <p className="font-semibold text-sm text-white">إصدار شهادة جديدة</p>
                <Field label="المستخدم">
                  <select value={certForm.userId} onChange={e => setCertForm(f => f ? { ...f, userId: e.target.value } : f)}
                    className={`${inp} bg-[#1a1a1a]`}>
                    <option value="">اختر المستخدم...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="اسم الشهادة بالعربي">
                    <input value={certForm.title_ar} placeholder="اسم الشهادة بالعربي"
                      onChange={e => setCertForm(f => f ? { ...f, title_ar: e.target.value } : f)} className={inp} />
                  </Field>
                  <Field label="اسم الشهادة بالإنجليزي">
                    <input value={certForm.title_en} placeholder="Certificate name in English"
                      onChange={e => setCertForm(f => f ? { ...f, title_en: e.target.value } : f)} className={inp} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="صادرة من">
                    <input value={certForm.issued_by}
                      onChange={e => setCertForm(f => f ? { ...f, issued_by: e.target.value } : f)} className={inp} />
                  </Field>
                  <Field label="الوصف (اختياري)">
                    <input value={certForm.description} placeholder="وصف الشهادة..."
                      onChange={e => setCertForm(f => f ? { ...f, description: e.target.value } : f)} className={inp} />
                  </Field>
                </div>
                <div className="flex gap-3 justify-end pt-2 border-t border-white/6">
                  <button onClick={() => setCertForm(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-white transition">إلغاء</button>
                  <button onClick={handleIssueCert} disabled={savingCert || !certForm.userId || !certForm.title_ar}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                    {savingCert ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}إصدار
                  </button>
                </div>
              </div>
            )}

            {loadingCerts ? <Spinner /> : certificates.length === 0 ? <Empty icon={Award} label="لا توجد شهادات بعد" /> : (
              <div className="space-y-2">
                {certificates.map(cert => {
                  const owner = userMap[cert.user_id]
                  return (
                    <div key={cert.id} className="bg-[#0f0f0f] border border-amber-500/12 rounded-2xl px-5 py-4 flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/8 border border-amber-500/18 flex items-center justify-center flex-shrink-0">
                        <Award size={15} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{cert.title_ar}</p>
                        <p className="text-xs text-gray-600 mt-0.5 truncate">
                          {owner?.name || owner?.email || cert.user_id} · {cert.issued_by} · {fmt(cert.issued_at)}
                        </p>
                      </div>
                      <button onClick={() => handleRevokeCert(cert.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-600/20 rounded-xl hover:bg-red-600/10 transition opacity-0 group-hover:opacity-100">
                        <X size={11} />إلغاء
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Consultations ─────────────────────────────────────────────────── */}
        {tab === 'consultations' && (
          <div className="p-8 space-y-5 max-w-4xl">
            <div>
              <h1 className="text-xl font-bold">الاستشارات</h1>
              <p className="text-sm text-gray-500 mt-0.5">{consultations.length} استشارة · {pendingConss} معلّقة</p>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1 w-fit">
              {([
                { key: 'all',     label: 'الكل',        count: consultations.length },
                { key: 'pending', label: 'قيد المراجعة', count: pendingConss },
                { key: 'replied', label: 'تم الرد',      count: consultations.filter(c => c.status === 'replied').length },
                { key: 'closed',  label: 'مغلقة',        count: consultations.filter(c => c.status === 'closed').length },
              ] as { key: typeof consFilter; label: string; count: number }[]).map(f => (
                <button key={f.key} onClick={() => setConsFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm transition ${
                    consFilter === f.key ? 'bg-white text-black font-semibold' : 'text-gray-500 hover:text-white'
                  }`}>
                  {f.label}
                  <span className={`text-[10px] font-bold px-1 rounded ${
                    consFilter === f.key ? 'text-black/40' : 'text-gray-600'
                  }`}>{f.count}</span>
                </button>
              ))}
            </div>

            {loadingConss ? <Spinner /> : filteredConss.length === 0 ? <Empty icon={MessageCircle} label="لا توجد استشارات" /> : (
              <div className="space-y-3">
                {filteredConss.map(c => {
                  const owner = userMap[c.user_id]
                  return (
                    <div key={c.id} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-white text-sm">{c.subject}</p>
                            <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                              c.status === 'replied' ? 'text-green-400 bg-green-500/8 border-green-500/20' :
                              c.status === 'closed'  ? 'text-gray-500 bg-white/4 border-white/8' :
                                                       'text-amber-400 bg-amber-500/8 border-amber-500/20'
                            }`}>
                              {c.status === 'replied' ? <CheckCircle size={10} /> : c.status === 'closed' ? <XCircle size={10} /> : <Clock size={10} />}
                              {c.status === 'replied' ? 'تم الرد' : c.status === 'closed' ? 'مغلقة' : 'قيد المراجعة'}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {owner?.name || owner?.email || c.user_id} · {fmt(c.created_at)}
                          </p>
                        </div>
                        {c.status !== 'closed' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => { setReplyingId(replyingId === c.id ? null : c.id); setReplyText('') }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/25 transition">
                              <Send size={11} />رد
                            </button>
                            <button onClick={() => handleCloseConsultation(c.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/10 rounded-xl text-gray-500 hover:text-red-400 hover:border-red-600/25 transition">
                              <XCircle size={11} />إغلاق
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <div className="bg-black/30 rounded-xl px-4 py-3">
                        <p className="text-sm text-gray-300 leading-relaxed">{c.message}</p>
                      </div>

                      {/* Admin reply */}
                      {c.admin_reply && (
                        <div className="bg-green-600/6 border border-green-600/18 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-green-500 font-medium mb-1.5">ردك</p>
                          <p className="text-sm text-gray-300">{c.admin_reply}</p>
                        </div>
                      )}

                      {/* Reply form */}
                      {replyingId === c.id && (
                        <div className="space-y-2.5">
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                            placeholder="اكتب ردك هنا..."
                            className={`${inp} resize-none`} />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => { setReplyingId(null); setReplyText('') }}
                              className="px-3 py-1.5 text-xs text-gray-500 hover:text-white transition">إلغاء</button>
                            <button onClick={() => handleSendReply(c.id)} disabled={sendingReply || !replyText.trim()}
                              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl transition disabled:opacity-50">
                              {sendingReply ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}إرسال
                            </button>
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

      </main>
    </div>
  )
}
