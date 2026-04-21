import { supabase } from './supabase'

export interface Workshop {
  id: string
  title_ar: string
  title_en: string
  desc_ar: string | null
  desc_en: string | null
  duration_ar: string | null
  duration_en: string | null
  category_ar: string | null
  category_en: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface WorkshopEnrollment {
  id: string
  user_id: string
  workshop_id: string
  enrolled_at: string
}

export interface Certificate {
  id: string
  user_id: string
  title_ar: string
  title_en: string
  issued_by: string
  issued_at: string
  description: string | null
}

export interface Consultation {
  id: string
  user_id: string
  subject: string
  message: string
  status: 'pending' | 'replied' | 'closed'
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

// ─── Workshops ────────────────────────────────────────────────────────────────
export const sbWorkshops = {
  async list(): Promise<Workshop[]> {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async listAll(): Promise<Workshop[]> {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(w: Omit<Workshop, 'id' | 'created_at'>): Promise<Workshop> {
    const { data, error } = await supabase
      .from('workshops')
      .insert(w)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, w: Partial<Workshop>): Promise<void> {
    const { error } = await supabase.from('workshops').update(w).eq('id', id)
    if (error) throw error
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('workshops').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const sbEnrollments = {
  async listForUser(userId: string): Promise<WorkshopEnrollment[]> {
    const { data, error } = await supabase
      .from('workshop_enrollments')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data ?? []
  },

  async enroll(userId: string, workshopId: string): Promise<void> {
    const { error } = await supabase
      .from('workshop_enrollments')
      .insert({ user_id: userId, workshop_id: workshopId })
    if (error) throw error
  },

  async unenroll(userId: string, workshopId: string): Promise<void> {
    const { error } = await supabase
      .from('workshop_enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('workshop_id', workshopId)
    if (error) throw error
  },
}

// ─── Certificates ─────────────────────────────────────────────────────────────
export const sbCertificates = {
  async listForUser(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async listAll(): Promise<(Certificate & { email?: string })[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async issue(cert: Omit<Certificate, 'id' | 'issued_at'>): Promise<Certificate> {
    const { data, error } = await supabase
      .from('certificates')
      .insert(cert)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async revoke(id: string): Promise<void> {
    const { error } = await supabase.from('certificates').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── Consultations ────────────────────────────────────────────────────────────
export const sbConsultations = {
  async listForUser(userId: string): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async listAll(): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(userId: string, subject: string, message: string): Promise<Consultation> {
    const { data, error } = await supabase
      .from('consultations')
      .insert({ user_id: userId, subject, message })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async reply(id: string, reply: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .update({ admin_reply: reply, status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async close(id: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'closed' })
      .eq('id', id)
    if (error) throw error
  },
}
