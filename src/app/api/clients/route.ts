import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, getClientsWithSessions, searchClients } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const search = req.nextUrl.searchParams.get('search')
    if (search !== null) {
      const clients = search.trim() ? await searchClients(search.trim()) : []
      return NextResponse.json({ clients })
    }
    const clients = await getClientsWithSessions()
    return NextResponse.json({ clients })
  } catch (error) {
    console.error('List clients error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Fetch failed' }, { status: 500 })
  }
}
