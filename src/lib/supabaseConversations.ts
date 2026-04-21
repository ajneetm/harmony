import { supabase } from './supabase'
import type { Message } from '../utils/ai'

export interface DBConversation {
  id: string
  user_id: string
  title: string
  messages: Message[]
  report_data: string | null
  created_at: string
  updated_at: string
}

export const sbConversations = {
  async list(userId: string): Promise<DBConversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async listAll(): Promise<DBConversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(userId: string, title: string): Promise<DBConversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title, messages: [] })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateTitle(id: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id)
    if (error) throw error
  },

  async addMessage(id: string, message: Message, currentMessages: Message[]): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ messages: [...currentMessages, message] })
      .eq('id', id)
    if (error) throw error
  },

  async saveReport(id: string, reportData: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ report_data: reportData })
      .eq('id', id)
    if (error) throw error
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
