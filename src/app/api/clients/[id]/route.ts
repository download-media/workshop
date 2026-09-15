import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, getClient, getSessionsForClient, setAccessCode, updateClient, deleteClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  try {
    const { id } = await params
    const client = await getClient(id)
    const sessions = await getSessionsForClient(id)
    return NextResponse.json({ client, sessions })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Fetch failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  try {
    const { id } = await params
    const body = await req.json()
    // regenerateCode: true → fresh random code; accessCode: "CUSTOM" → set custom code
    if (body.regenerateCode) {
      const client = await setAccessCode(id, null)
      return NextResponse.json({ client })
    }
    if (typeof body.accessCode === 'string' && body.accessCode.trim()) {
      const client = await setAccessCode(id, body.accessCode)
      return NextResponse.json({ client })
    }
    const updates: { name?: string; facilitator?: string } = {}
    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim()
    if (typeof body.facilitator === 'string' && body.facilitator.trim()) updates.facilitator = body.facilitator.trim()
    const client = await updateClient(id, updates)
    return NextResponse.json({ client })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  try {
    const { id } = await params
    await deleteClient(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 })
  }
}
