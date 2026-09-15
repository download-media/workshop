import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, getClientByCode, getSessionsForClient } from '@/lib/supabase'

// Client-facing endpoint for the portal. Auth is the client's access code — it can
// only ever return data for the one client that code belongs to. Exempted from the
// admin gate in src/proxy.ts.
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code || code.trim().length < 6) {
      return NextResponse.json({ error: 'Access code required' }, { status: 401 })
    }
    const client = await getClientByCode(code.trim())
    if (!client) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
    }
    const sessions = await getSessionsForClient(client.id)
    return NextResponse.json({
      client: { name: client.name, facilitator: client.facilitator },
      sessions: sessions.map((s) => ({
        id: s.id,
        serviceType: s.service_type,
        date: s.date,
        status: s.status,
        updatedAt: s.updated_at,
        workshopData: s.workshop_data,
      })),
      shareUrl: `https://download.lol/workshop/share/${client.access_code}`,
    })
  } catch (error) {
    console.error('Portal brief error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    )
  }
}
