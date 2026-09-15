// data layer — Render Postgres (shared "download-db", schema "workshop"). Server-only (used in API routes).
import { Pool } from 'pg'
import { randomBytes } from 'crypto'

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, options: '-c search_path=workshop,public' })
  : (null as unknown as Pool)

export const isSupabaseConfigured = !!process.env.DATABASE_URL

// Idempotent DDL — the original tables were created by hand, newer columns arrive here.
let schemaReady: Promise<void> | null = null
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`alter table clients add column if not exists access_code text`)
      await pool.query(`create unique index if not exists idx_clients_access_code on clients(access_code)`)
      await pool.query(`alter table sessions add column if not exists label text`)
    })().catch((e) => { schemaReady = null; throw e })
  }
  return schemaReady
}

async function q(text: string, params: unknown[] = []) {
  await ensureSchema()
  return pool.query(text, params)
}

/* ── types ── */
export interface DbClient { id: string; name: string; facilitator: string; access_code: string | null; created_at: string }
export interface DbSession { id: string; client_id: string; service_type: string; date: string; status: 'active' | 'completed'; label: string | null; workshop_data: Record<string, unknown>; created_at: string; updated_at: string }
export interface DbBrandProfile { id: string; client_id: string; website_url: string | null; guidelines_text: string | null; ai_analysis: Record<string, unknown> | null; created_at: string; updated_at: string }

/* ── access codes ── */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O/1/I/L
export function generateAccessCode() {
  const bytes = randomBytes(8)
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
    if (i === 3) code += '-'
  }
  return code
}

/* ── clients ── */
export async function getClients() { return (await q('select * from clients order by created_at desc')).rows as DbClient[] }
export async function getClient(id: string) {
  const r = await q('select * from clients where id=$1', [id]); if (!r.rows[0]) throw new Error('client not found'); return r.rows[0] as DbClient
}
export async function getClientByName(name: string) {
  const r = await q('select * from clients where name ilike $1 limit 1', [name]); return (r.rows[0] || null) as DbClient | null
}
export async function getClientByCode(code: string) {
  const r = await q('select * from clients where upper(access_code)=upper($1) limit 1', [code]); return (r.rows[0] || null) as DbClient | null
}
export async function searchClients(term: string) {
  const r = await q('select * from clients where name ilike $1 order by name asc limit 8', [`%${term}%`])
  return r.rows as DbClient[]
}
export async function createClientRecord(name: string, facilitator: string) {
  const r = await q('insert into clients (name,facilitator,access_code) values ($1,$2,$3) returning *', [name, facilitator, generateAccessCode()])
  return r.rows[0] as DbClient
}
export async function setAccessCode(clientId: string, code: string | null) {
  const value = code ? code.trim().toUpperCase() : generateAccessCode()
  const r = await q('update clients set access_code=$1 where id=$2 returning *', [value, clientId])
  if (!r.rows[0]) throw new Error('client not found')
  return r.rows[0] as DbClient
}
export async function updateClient(clientId: string, updates: Partial<Pick<DbClient, 'name' | 'facilitator'>>) {
  const sets: string[] = []; const vals: unknown[] = []; let i = 1
  for (const [k, v] of Object.entries(updates)) { sets.push(`"${k}"=$${i++}`); vals.push(v) }
  if (!sets.length) return getClient(clientId)
  vals.push(clientId)
  const r = await q(`update clients set ${sets.join(',')} where id=$${i} returning *`, vals)
  if (!r.rows[0]) throw new Error('client not found')
  return r.rows[0] as DbClient
}
export async function deleteClient(clientId: string) {
  await q('delete from clients where id=$1', [clientId])
}

/** Every client with their sessions (workshop_data omitted — it can be megabytes). */
export async function getClientsWithSessions() {
  const clients = await getClients()
  const r = await q(`select id, client_id, service_type, date, status, label, created_at, updated_at from sessions order by date desc, created_at desc`)
  const byClient = new Map<string, Omit<DbSession, 'workshop_data'>[]>()
  for (const s of r.rows as Omit<DbSession, 'workshop_data'>[]) {
    const list = byClient.get(s.client_id) || []
    list.push(s)
    byClient.set(s.client_id, list)
  }
  return clients.map((c) => ({ ...c, sessions: byClient.get(c.id) || [] }))
}

/* ── sessions ── */
export async function getSessionsForClient(clientId: string) {
  return (await q('select * from sessions where client_id=$1 order by date desc, created_at desc', [clientId])).rows as DbSession[]
}
export async function getSession(sessionId: string) {
  const r = await q('select * from sessions where id=$1', [sessionId])
  return (r.rows[0] || null) as DbSession | null
}
export async function createSession(clientId: string, serviceType: string, date: string, workshopData: Record<string, unknown>) {
  const r = await q(`insert into sessions (client_id,service_type,date,status,workshop_data) values ($1,$2,$3,'active',$4) returning *`,
    [clientId, serviceType, date, JSON.stringify(workshopData)]); return r.rows[0] as DbSession
}
/** One session per client + service + date — resuming the same day continues it, a new day is a new version. */
export async function findOrCreateSession(clientId: string, serviceType: string, date: string, workshopData: Record<string, unknown>) {
  const existing = await q('select * from sessions where client_id=$1 and service_type=$2 and date=$3 limit 1', [clientId, serviceType, date])
  if (existing.rows[0]) return existing.rows[0] as DbSession
  return createSession(clientId, serviceType, date, workshopData)
}
export async function updateSession(sessionId: string, workshopData: Record<string, unknown>) {
  const r = await q('update sessions set workshop_data=$1, updated_at=now() where id=$2 returning *', [JSON.stringify(workshopData), sessionId]); return r.rows[0] as DbSession
}
export async function setSessionStatus(sessionId: string, status: 'active' | 'completed') {
  const r = await q('update sessions set status=$1, updated_at=now() where id=$2 returning *', [status, sessionId]); return r.rows[0] as DbSession
}
export async function completeSession(sessionId: string) {
  await setSessionStatus(sessionId, 'completed')
}
export async function deleteSession(sessionId: string) {
  await q('delete from sessions where id=$1', [sessionId])
}
/** Latest session for a client, optionally filtered by service — used by the portal-facing endpoints. */
export async function getLatestSessionForClient(clientId: string, serviceType?: string) {
  const r = serviceType
    ? await q('select * from sessions where client_id=$1 and service_type=$2 order by date desc, updated_at desc limit 1', [clientId, serviceType])
    : await q('select * from sessions where client_id=$1 order by date desc, updated_at desc limit 1', [clientId])
  return (r.rows[0] || null) as DbSession | null
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
