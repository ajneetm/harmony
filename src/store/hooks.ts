import { useStore } from '@tanstack/react-store'
import { v4 as uuidv4 } from 'uuid'
import { actions, selectors, store, type Conversation } from './store'
import type { Message } from '../utils/ai'
import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { sbConversations } from '../lib/supabaseConversations'

const CONVERSATIONS_STORAGE_KEY = 'misbara-conversations'

const saveToLocalStorage = (conversations: Conversation[]) => {
  try { localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations)) } catch { /* ignore */ }
}

const loadFromLocalStorage = (): Conversation[] => {
  try {
    const s = localStorage.getItem(CONVERSATIONS_STORAGE_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

// ─── useAppState ──────────────────────────────────────────────────────────────
export function useAppState() {
  const isLoading        = useStore(store, s => selectors.getIsLoading(s))
  const conversations    = useStore(store, s => selectors.getConversations(s))
  const currentConversationId = useStore(store, s => selectors.getCurrentConversationId(s))
  const language         = useStore(store, s => selectors.getLanguage(s))

  return {
    conversations,
    currentConversationId,
    isLoading,
    language,
    setCurrentConversationId: actions.setCurrentConversationId,
    addConversation:          actions.addConversation,
    deleteConversation:       actions.deleteConversation,
    updateConversationTitle:  actions.updateConversationTitle,
    addMessage:               actions.addMessage,
    setLoading:               actions.setLoading,
    setLanguage:              actions.setLanguage,
    getCurrentConversation:   selectors.getCurrentConversation,
  }
}

// ─── useConversations ─────────────────────────────────────────────────────────
export function useConversations() {
  const { user }   = useAuth()
  const userId     = user?.id ?? null
  const isLoggedIn = !!userId
  const loaded     = useRef(false)

  const conversations         = useStore(store, s => selectors.getConversations(s))
  const currentConversationId = useStore(store, s => selectors.getCurrentConversationId(s))
  const currentConversation   = useStore(store, s => selectors.getCurrentConversation(s))

  // On mount / user change: load conversations
  useEffect(() => {
    loaded.current = false
    actions.setConversations([])
    actions.setCurrentConversationId(null)

    if (isLoggedIn && userId) {
      sbConversations.list(userId)
        .then(rows => {
          const formatted: Conversation[] = rows.map(r => ({
            id: r.id,
            title: r.title,
            messages: r.messages,
          }))
          actions.setConversations(formatted)
          loaded.current = true
        })
        .catch(console.error)
    } else {
      // Guest: load from localStorage
      const stored = loadFromLocalStorage()
      actions.setConversations(stored)
      loaded.current = true
    }
  }, [userId])

  // Guest: persist to localStorage on change
  useEffect(() => {
    if (!isLoggedIn && loaded.current && conversations.length > 0) {
      saveToLocalStorage(conversations)
    }
  }, [conversations, isLoggedIn])

  return {
    conversations,
    currentConversationId,
    currentConversation,

    setCurrentConversationId: (id: string | null) => actions.setCurrentConversationId(id),

    createNewConversation: async (title = 'New Conversation'): Promise<string> => {
      const localId = uuidv4()
      actions.addConversation({ id: localId, title, messages: [] })

      if (isLoggedIn && userId) {
        try {
          const row = await sbConversations.create(userId, title)
          actions.updateConversationId(localId, row.id)
          actions.setCurrentConversationId(row.id)
          return row.id
        } catch (e) {
          console.error('Failed to create conversation in Supabase:', e)
        }
      }

      actions.setCurrentConversationId(localId)
      return localId
    },

    updateConversationTitle: async (id: string, title: string) => {
      actions.updateConversationTitle(id, title)
      if (isLoggedIn) {
        try { await sbConversations.updateTitle(id, title) } catch { /* ignore */ }
      }
    },

    deleteConversation: async (id: string) => {
      actions.deleteConversation(id)
      if (isLoggedIn) {
        try { await sbConversations.remove(id) } catch { /* ignore */ }
      }
    },

    addMessage: async (conversationId: string, message: Message) => {
      // Read BEFORE updating store to avoid double-append
      const existing = store.state.conversations.find((c: any) => c.id === conversationId)?.messages ?? []
      actions.addMessage(conversationId, message)
      if (isLoggedIn) {
        try { await sbConversations.addMessage(conversationId, message, existing) } catch { /* ignore */ }
      }
    },

    clearAllConversations: () => {
      actions.setConversations([])
      actions.setCurrentConversationId(null)
      if (!isLoggedIn) localStorage.removeItem(CONVERSATIONS_STORAGE_KEY)
    },

    refreshFromStorage: () => {
      if (!isLoggedIn) actions.setConversations(loadFromLocalStorage())
    },
  }
}
