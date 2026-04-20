import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as SupabaseClient

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

/* ────────────────────────────────────────────────────────────
   Database types
   ──────────────────────────────────────────────────────────── */

export interface DbClient {
  id: string
  name: string
  facilitator: string
  created_at: string
}

export interface DbSession {
  id: string
  client_id: string
  service_type: string
  date: string
  status: 'active' | 'completed'
  workshop_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbBrandProfile {
  id: string
  client_id: string
  website_url: string | null
  guidelines_text: string | null
  ai_analysis: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

/* ────────────────────────────────────────────────────────────
   Client operations
   ──────────────────────────────────────────────────────────── */

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as DbClient[]
}

export async function getClient(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as DbClient
}

export async function getClientByName(name: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .ilike('name', name)
    .maybeSingle()
  if (error) throw error
  return data as DbClient | null
}

export async function createClientRecord(name: string, facilitator: string) {
  const { data, error } = await supabase
    .from('clients')
    .insert({ name, facilitator })
    .select()
    .single()
  if (error) throw error
  return data as DbClient
}

/* ────────────────────────────────────────────────────────────
   Session operations
   ──────────────────────────────────────────────────────────── */

export async function getSessionsForClient(clientId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as DbSession[]
}

export async function createSession(
  clientId: string,
  serviceType: string,
  date: string,
  workshopData: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      client_id: clientId,
      service_type: serviceType,
      date,
      status: 'active',
      workshop_data: workshopData,
    })
    .select()
    .single()
  if (error) throw error
  return data as DbSession
}

export async function updateSession(
  sessionId: string,
  workshopData: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      workshop_data: workshopData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data as DbSession
}

export async function completeSession(sessionId: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}

/* ────────────────────────────────────────────────────────────
   Brand profile operations
   ──────────────────────────────────────────────────────────── */

export async function getBrandProfile(clientId: string) {
  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()
  if (error) throw error
  return data as DbBrandProfile | null
}

export async function upsertBrandProfile(
  clientId: string,
  updates: Partial<Pick<DbBrandProfile, 'website_url' | 'guidelines_text' | 'ai_analysis'>>
) {
  const { data: existing } = await supabase
    .from('brand_profiles')
    .select('id')
    .eq('client_id', clientId)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('brand_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .select()
      .single()
    if (error) throw error
    return data as DbBrandProfile
  } else {
    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({ client_id: clientId, ...updates })
      .select()
      .single()
    if (error) throw error
    return data as DbBrandProfile
  }
}
