// data layer — Render Postgres (shared "download-db", schema "workshop"). Server-only (used in API routes).
import { Pool } from 'pg'

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, options: '-c search_path=workshop,public' })
  : (null as unknown as Pool)

export const isSupabaseConfigured = !!process.env.DATABASE_URL

async function q(text: string, params: unknown[] = []) { return pool.query(text, params) }

/* ── types ── */
export interface DbClient { id: string; name: string; facilitator: string; created_at: string }
export interface DbSession { id: string; client_id: string; service_type: string; date: string; status: 'active' | 'completed'; workshop_data: Record<string, unknown>; created_at: string; updated_at: string }
export interface DbBrandProfile { id: string; client_id: string; website_url: string | null; guidelines_text: string | null; ai_analysis: Record<string, unknown> | null; created_at: string; updated_at: string }

/* ── clients ── */
export async function getClients() { return (await q('select * from clients order by created_at desc')).rows as DbClient[] }
export async function getClient(id: string) {
  const r = await q('select * from clients where id=$1', [id]); if (!r.rows[0]) throw new Error('client not found'); return r.rows[0] as DbClient
}
export async function getClientByName(name: string) {
  const r = await q('select * from clients where name ilike $1 limit 1', [name]); return (r.rows[0] || null) as DbClient | null
}
export async function createClientRecord(name: string, facilitator: string) {
  const r = await q('insert into clients (name,facilitator) values ($1,$2) returning *', [name, facilitator]); return r.rows[0] as DbClient
}

/* ── sessions ── */
export async function getSessionsForClient(clientId: string) {
  return (await q('select * from sessions where client_id=$1 order by created_at desc', [clientId])).rows as DbSession[]
}
export async function createSession(clientId: string, serviceType: string, date: string, workshopData: Record<string, unknown>) {
  const r = await q(`insert into sessions (client_id,service_type,date,status,workshop_data) values ($1,$2,$3,'active',$4) returning *`,
    [clientId, serviceType, date, JSON.stringify(workshopData)]); return r.rows[0] as DbSession
}
export async function updateSession(sessionId: string, workshopData: Record<string, unknown>) {
  const r = await q('update sessions set workshop_data=$1, updated_at=now() where id=$2 returning *', [JSON.stringify(workshopData), sessionId]); return r.rows[0] as DbSession
}
export async function completeSession(sessionId: string) {
  await q(`update sessions set status='completed', updated_at=now() where id=$1`, [sessionId])
}

/* ── brand profiles ── */
export async function getBrandProfile(clientId: string) {
  const r = await q('select * from brand_profiles where client_id=$1 limit 1', [clientId]); return (r.rows[0] || null) as DbBrandProfile | null
}
export async function upsertBrandProfile(clientId: string, updates: Partial<Pick<DbBrandProfile, 'website_url' | 'guidelines_text' | 'ai_analysis'>>) {
  const existing = await getBrandProfile(clientId)
  if (existing) {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1
    for (const [k, v] of Object.entries(updates)) { sets.push(`"${k}"=$${i++}`); vals.push(k === 'ai_analysis' && v ? JSON.stringify(v) : v) }
    sets.push('updated_at=now()'); vals.push(clientId)
    const r = await q(`update brand_profiles set ${sets.join(',')} where client_id=$${i} returning *`, vals); return r.rows[0] as DbBrandProfile
  }
  const r = await q('insert into brand_profiles (client_id,website_url,guidelines_text,ai_analysis) values ($1,$2,$3,$4) returning *',
    [clientId, updates.website_url ?? null, updates.guidelines_text ?? null, updates.ai_analysis ? JSON.stringify(updates.ai_analysis) : null]); return r.rows[0] as DbBrandProfile
}
