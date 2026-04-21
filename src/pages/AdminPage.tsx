import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { sbConversations, type DBConversation } from '../lib/supabaseConversations'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'a.hajali@ajnee.com'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

interface SupabaseUser {
  id: string
  email: string
  name: string | null
  created_at: string
  last_sign_in_at: string | null
}

export default function AdminPage() {
  const { user, signOut } = useAuth()
  const [conversations, setConversations] = useState<DBConversation[]>([])
  const [supabaseUsers, setSupabaseUsers] = useState<SupabaseUser[]>([])
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [loadingUsers, setLoadingUsers]   = useState(true)
  const [selectedUser, setSelectedUser]   = useState<string | null>(null)
  const [expandedConv, setExpandedConv]   = useState<string | null>(null)

  const isAdmin = user?.email === ADMIN_EMAIL

  // Load all conversations (admin RLS policy allows this)
  useEffect(() => {
    if (!isAdmin) return
    sbConversations.listAll()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoadingConvs(false))
  }, [isAdmin])

  // Load all users via Edge Function
  useEffect(() => {
    if (!isAdmin) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingUsers(false); return }
      fetch(`${SUPABASE_URL}/functions/v1/admin-users`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(res => {
          console.log('admin-users response:', res)
          if (res.users) setSupabaseUsers(res.users)
          else console.error('admin-users error:', res.error)
        })
        .catch(e => console.error('admin-users fetch failed:', e))
        .finally(() => setLoadingUsers(false))
    }).catch(e => { console.error('getSession failed:', e); setLoadingUsers(false) })
  }, [isAdmin])

  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <p>Please sign in.</p>
    </div>
  )

  if (!isAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center space-y-3">
        <p className="text-red-500 text-xl font-bold">Access Denied</p>
        <p className="text-gray-400 text-sm">This page is restricted to admins.</p>
        <button onClick={() => (window as any).navigateTo('/dashboard')}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700">
          Go to Dashboard
        </button>
      </div>
    </div>
  )

  const userMap = Object.fromEntries(supabaseUsers.map(u => [u.id, u]))
  const filteredConvs = selectedUser
    ? conversations.filter(c => c.user_id === selectedUser)
    : conversations

  const totalReports = conversations.filter(c => c.report_data).length

  return (
    <div className="min-h-screen bg-black text-white" dir="ltr">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => (window as any).navigateTo('/dashboard')}
            className="text-gray-400 hover:text-white text-sm">← Dashboard</button>
          <span className="text-white/20">|</span>
          <span className="font-bold text-red-500">Admin Panel</span>
        </div>
        <button onClick={signOut} className="text-sm text-gray-400 hover:text-white">Sign Out</button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',         value: supabaseUsers.length },
            { label: 'Total Conversations', value: conversations.length },
            { label: 'Reports Generated',   value: totalReports },
            { label: 'Active Today',        value: supabaseUsers.filter(u =>
              u.last_sign_in_at && new Date(u.last_sign_in_at).toDateString() === new Date().toDateString()
            ).length },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-5 text-center border border-white/10">
              <p className="text-3xl font-bold text-red-500">{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Users List */}
          <div className="lg:col-span-1 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold">Registered Users</h2>
              {selectedUser && (
                <button onClick={() => setSelectedUser(null)} className="text-xs text-red-400 hover:text-red-300">
                  Clear filter
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[600px] divide-y divide-white/5">
              {loadingUsers ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : supabaseUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No users found</p>
              ) : supabaseUsers.map(u => {
                const convCount   = conversations.filter(c => c.user_id === u.id).length
                const reportCount = conversations.filter(c => c.user_id === u.id && c.report_data).length
                const isSelected  = selectedUser === u.id
                return (
                  <div key={u.id}
                    onClick={() => setSelectedUser(isSelected ? null : u.id)}
                    className={`px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'bg-red-900/20 border-l-2 border-red-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-600/20 flex items-center justify-center text-sm font-bold text-red-400 flex-shrink-0">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name || '—'}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>{convCount} conv{convCount !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{reportCount} report{reportCount !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conversations */}
          <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="font-semibold">
                {selectedUser
                  ? `Conversations — ${userMap[selectedUser]?.name || userMap[selectedUser]?.email || selectedUser}`
                  : 'All Conversations'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{filteredConvs.length} total</p>
            </div>
            <div className="overflow-y-auto max-h-[600px] divide-y divide-white/5">
              {loadingConvs ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No conversations found</p>
              ) : filteredConvs.map(conv => {
                const owner      = userMap[conv.user_id]
                const isExpanded = expandedConv === conv.id
                const hasReport  = !!conv.report_data

                let reportSummary: any = null
                if (hasReport) {
                  try { reportSummary = JSON.parse(conv.report_data!).chartData } catch { /* ignore */ }
                }

                return (
                  <div key={conv.id} className="px-5 py-4">
                    <div className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedConv(isExpanded ? null : conv.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{conv.title || 'Untitled'}</p>
                          {hasReport && (
                            <span className="flex-shrink-0 text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full">
                              Report
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                          {owner && <span>{owner.name || owner.email}</span>}
                          <span>·</span>
                          <span>{conv.messages.length} messages</span>
                          <span>·</span>
                          <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-gray-600 text-xs ml-2">{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        {reportSummary && (
                          <div className="bg-black/40 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Report Results</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { label: 'Overall',     value: reportSummary.overall + '%' },
                                { label: 'Harmony',     value: reportSummary.harmony + '%' },
                                { label: 'Mental',      value: reportSummary.mental?.percentage + '%' },
                                { label: 'Emotional',   value: reportSummary.emotional?.percentage + '%' },
                                { label: 'Existential', value: reportSummary.existential?.percentage + '%' },
                              ].map(s => (
                                <div key={s.label} className="text-center bg-white/5 rounded-lg p-2">
                                  <p className="text-lg font-bold text-red-400">{s.value}</p>
                                  <p className="text-xs text-gray-500">{s.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-black/40 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Messages</p>
                          {conv.messages.slice(-6).map((m, i) => (
                            <div key={i} className={`text-xs px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-white/10 text-right' : 'bg-red-900/20'}`}>
                              <span className="text-gray-500 text-[10px] block mb-0.5">{m.role}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
