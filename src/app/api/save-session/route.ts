import { NextRequest, NextResponse } from 'next/server'
import {
  isSupabaseConfigured,
  getClientByName,
  createClientRecord,
  findOrCreateSession,
  updateSession,
  getSessionsForClient,
} from '@/lib/supabase'

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const { clientName, facilitator, serviceType, date, workshopData, sessionId } = await req.json()

    // If updating existing session
    if (sessionId) {
      const session = await updateSession(sessionId, workshopData)
      if (session) return NextResponse.json({ session })
      // Session row was deleted from the internal view — fall through and re-attach below
    }

    // Find or create client
    let client = await getClientByName(clientName)
    if (!client) {
      client = await createClientRecord(clientName, facilitator)
    }

    // One session per client + service + date — same-day work continues, a new day is a new version
    let session = await findOrCreateSession(client.id, serviceType, date, workshopData)
    if (workshopData && Object.keys(workshopData).length > 0) {
      session = await updateSession(session.id, workshopData)
    }
    return NextResponse.json({ session, client })
  } catch (error) {
    console.error('Save session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const clientId = req.nextUrl.searchParams.get('clientId')
    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 })
    }

    const sessions = await getSessionsForClient(clientId)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    )
  }
}
