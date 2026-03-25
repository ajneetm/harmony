import { Store } from '@tanstack/store'
import type { Message } from '../utils/ai'

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  // Questionnaire state persistence
  questionnaireData?: {
    showQuestionnaire: boolean
    questions: Array<{id: number, text: string, originalId?: number, dimension?: string, element?: string, type?: string}>
    visualizationData: any
    questionnaireResults: any
    isCompleted: boolean
  }
}

export interface State {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  language: 'ar' | 'en'
}

// Load language from localStorage or default to 'en'
const getInitialLanguage = (): 'ar' | 'en' => {
  try {
    const stored = localStorage.getItem('language')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed === 'ar' || parsed === 'en') {
        return parsed
      }
    }
  } catch (error) {
    console.error('Failed to load language from localStorage:', error)
  }
  return 'en'
}

const initialState: State = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  language: getInitialLanguage()
}

export const store = new Store<State>(initialState)

export const actions = {
  // Chat actions
  setConversations: (conversations: Conversation[]) => {
    store.setState(state => ({ ...state, conversations }))
  },

  setCurrentConversationId: (id: string | null) => {
    store.setState(state => ({ ...state, currentConversationId: id }))
  },

  addConversation: (conversation: Conversation) => {
    store.setState(state => ({
      ...state,
      conversations: [...state.conversations, conversation],
      currentConversationId: conversation.id
    }))
  },

  updateConversationId: (oldId: string, newId: string) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.map(conv =>
        conv.id === oldId ? { ...conv, id: newId } : conv
      ),
      currentConversationId: state.currentConversationId === oldId ? newId : state.currentConversationId
    }))
  },

  updateConversationTitle: (id: string, title: string) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.map(conv =>
        conv.id === id ? { ...conv, title } : conv
      )
    }))
  },

  deleteConversation: (id: string) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.filter(conv => conv.id !== id),
      currentConversationId: state.currentConversationId === id ? null : state.currentConversationId
    }))
  },

  addMessage: (conversationId: string, message: Message) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    }))
  },

  setLoading: (isLoading: boolean) => {
    store.setState(state => ({ ...state, isLoading }))
  },

  setLanguage: (lang: 'en' | 'ar') => {
    store.setState(state => ({ ...state, language: lang }))
    // Persist to localStorage
    try {
      localStorage.setItem('language', JSON.stringify(lang))
    } catch (error) {
      console.error('Failed to save language to localStorage:', error)
    }
  },

  // Update conversation questionnaire data
  updateConversationQuestionnaire: (id: string, questionnaireData: Conversation['questionnaireData']) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.map(conv =>
        conv.id === id ? { ...conv, questionnaireData } : conv
      )
    }))
  },

  // Update conversation messages (e.g., to remove loading messages)
  updateConversationMessages: (id: string, messages: Message[]) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.map(conv =>
        conv.id === id ? { ...conv, messages } : conv
      )
    }))
  }
}

// Selectors
export const selectors = {
  getCurrentConversation: (state: State) =>
    state.conversations.find(c => c.id === state.currentConversationId),
  getConversations: (state: State) => state.conversations,
  getCurrentConversationId: (state: State) => state.currentConversationId,
  getIsLoading: (state: State) => state.isLoading,
  getLanguage: (state: State) => state.language
}