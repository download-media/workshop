import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, getSession, getClient, deleteSession, setSessionStatus } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  try {
    const { id } = await params
    const session = await getSession(id)
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    const client = await getClient(session.client_id)
    return NextResponse.json({ session, client })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Fetch failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  try {
    const { id } = await params
    const body = await req.json()
    if (body.status === 'active' || body.status === 'completed') {
      const session = await setSessionStatus(id, body.status)
      return NextResponse.json({ session })
    }
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  try {
    const { id } = await params
    await deleteSession(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 })
  }
}
