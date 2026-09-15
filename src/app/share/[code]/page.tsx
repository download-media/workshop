import Link from 'next/link'
import { isSupabaseConfigured, getClientByCode, getSessionsForClient } from '@/lib/supabase'
import { SummaryDocument, type WorkshopSummaryData } from '@/components/summary/SummaryDocument'

export const dynamic = 'force-dynamic'

const SERVICE_LABELS: Record<string, string> = {
  social: 'Social Media',
  web: 'Web Development',
  branding: 'Brand Strategy',
  ideation: 'Creative Ideation',
}

function fmtDate(d: string) {
  const date = new Date(`${d}T00:00:00`)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function NotFound() {
  return (
    <div className="min-h-screen sky-bg flex flex-col items-center justify-center px-6 text-center">
      <p className="title-caps-sm text-ink/30 mb-4">DWNLD WORKSHOP</p>
      <h1 className="title-caps-lg text-ink mb-3">NOTHING HERE</h1>
      <p className="text-sm text-ink/40 max-w-sm">
        This link is not active. Check the access code with your Download Media contact.
      </p>
    </div>
  )
}

// Client-facing, read-only. The access code in the URL scopes everything to one
// client — sessions are only ever looked up through that client's id.
export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ s?: string }>
}) {
  if (!isSupabaseConfigured) return <NotFound />

  const { code } = await params
  const { s: requestedSession } = await searchParams

  const client = await getClientByCode(decodeURIComponent(code))
  if (!client) return <NotFound />

  const sessions = await getSessionsForClient(client.id)
  if (sessions.length === 0) return <NotFound />

  // Only sessions belonging to this client are reachable — a session id from
  // another client simply falls back to the latest one here.
  const session = sessions.find((x) => x.id === requestedSession) || sessions[0]
  const raw = (session.workshop_data || {}) as Partial<WorkshopSummaryData>
  const data: WorkshopSummaryData = {
    ...raw,
    config: {
      clientName: client.name,
      facilitatorName: raw.config?.facilitatorName || client.facilitator,
      serviceType: (session.service_type as WorkshopSummaryData['config']['serviceType']) || 'social',
      date: session.date,
    },
  }

  return (
    <div className="min-h-screen sky-bg">
      <main className="mx-auto max-w-3xl px-6 sm:px-10 py-14 sm:py-20">
        {/* Session switcher — only shown when this client has more than one */}
        {sessions.length > 1 && (
          <div className="no-print mb-10 flex flex-wrap gap-2">
            {sessions.map((x) => {
              const active = x.id === session.id
              return (
                <Link
                  key={x.id}
                  href={`/share/${encodeURIComponent(code)}?s=${x.id}`}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold tracking-wider transition-all ${
                    active ? 'bg-ink text-white' : 'text-ink/40 hover:text-ink/70 bg-white/40'
                  }`}
                >
                  {(SERVICE_LABELS[x.service_type] || x.service_type).toUpperCase()} · {fmtDate(x.date)}
                </Link>
              )
            })}
          </div>
        )}

        <SummaryDocument data={data} />

        <p className="no-print mt-10 text-center text-[11px] text-ink/25">
          Prepared for {client.name} by Download Media. This page is private to you.
        </p>
      </main>
    </div>
  )
}
