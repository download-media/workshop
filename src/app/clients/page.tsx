'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Copy, GitCompare, Link2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useWorkshopStore } from '@/lib/store'

interface SessionRow {
  id: string
  client_id: string
  service_type: string
  date: string
  status: 'active' | 'completed'
  label: string | null
  created_at: string
  updated_at: string
}

interface ClientRow {
  id: string
  name: string
  facilitator: string
  access_code: string | null
  created_at: string
  sessions: SessionRow[]
}

const SERVICE_LABELS: Record<string, string> = {
  social: 'Social',
  web: 'Web',
  branding: 'Brand',
  ideation: 'Ideation',
}

function fmtDate(d: string) {
  const date = new Date(`${d}T00:00:00`)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ClientsPage() {
  const router = useRouter()
  const hydrateSession = useWorkshopStore((s) => s.hydrateSession)

  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [compareA, setCompareA] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Could not load clients')
      }
      const data = await res.json()
      setClients(data.clients || [])
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function openSession(sessionId: string, dest: '/overview' | '/workshop/summary') {
    setBusy(sessionId)
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      if (!res.ok) throw new Error('Could not load session')
      const { session, client } = await res.json()
      const data = (session.workshop_data || {}) as Record<string, unknown>
      const prevConfig = (data.config || {}) as { facilitatorName?: string }
      hydrateSession(session.id, {
        ...data,
        config: {
          clientName: client.name,
          facilitatorName: prevConfig.facilitatorName || client.facilitator,
          serviceType: session.service_type,
          date: session.date,
        },
      })
      router.push(dest)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open session')
      setBusy(null)
    }
  }

  async function removeSession(session: SessionRow, clientName: string) {
    const ok = window.confirm(`Delete the ${SERVICE_LABELS[session.service_type] || session.service_type} session from ${fmtDate(session.date)} for ${clientName}? This cannot be undone.`)
    if (!ok) return
    await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' })
    load()
  }

  async function toggleStatus(session: SessionRow) {
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: session.status === 'completed' ? 'active' : 'completed' }),
    })
    load()
  }

  async function regenerateCode(client: ClientRow) {
    await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regenerateCode: true }),
    })
    load()
  }

  async function setCustomCode(client: ClientRow) {
    const code = window.prompt('Set a custom access code (letters and numbers, min 6 characters):', client.access_code || '')
    if (!code || code.trim().length < 6) return
    await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode: code }),
    })
    load()
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  function toggleCompare(sessionId: string) {
    if (compareA === sessionId) {
      setCompareA(null)
    } else if (compareA) {
      router.push(`/clients/compare?a=${compareA}&b=${sessionId}`)
    } else {
      setCompareA(sessionId)
    }
  }

  const filtered = query.trim()
    ? clients.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : clients

  const totalSessions = clients.reduce((n, c) => n + c.sessions.length, 0)

  return (
    <div className="relative min-h-screen sky-bg">
      {/* Cloud background */}
      <div className="fixed inset-0 z-0">
        <Image src="/workshop/images/cloud-cutouts.jpeg" alt="" fill className="object-cover opacity-[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E8F0F6]/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 py-16 sm:py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="title-caps-sm text-ink/25 mb-3">DWNLD WORKSHOP</p>
              <h1 className="title-caps-xl text-ink">INTERNAL</h1>
            </div>
            <button
              onClick={() => router.push('/?form=1')}
              className="group flex items-center gap-2 liquid-glass rounded-full pl-4 pr-2 py-2 hover:bg-white/50 transition-all"
            >
              <span className="title-caps-sm text-ink/50 group-hover:text-ink transition-colors">NEW SESSION</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/[0.05] text-ink/40 group-hover:bg-ink group-hover:text-white transition-all">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </button>
          </div>
          <p className="text-sm text-ink/35 mb-10">
            {loading ? 'Loading...' : `${clients.length} client${clients.length !== 1 ? 's' : ''} · ${totalSessions} session${totalSessions !== 1 ? 's' : ''}`}
          </p>
        </motion.div>

        {/* Compare hint */}
        <AnimatePresence>
          {compareA && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 liquid-glass rounded-2xl px-5 py-3 flex items-center justify-between"
            >
              <span className="text-sm text-ink/60">Comparing: pick a second session to compare against.</span>
              <button onClick={() => setCompareA(null)} className="text-xs text-ink/30 hover:text-ink/60 transition-colors">Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full liquid-glass-subtle rounded-2xl px-5 py-3.5 bg-transparent text-sm text-ink outline-none placeholder:text-ink/20 focus:bg-white/40 transition-colors"
          />
        </motion.div>

        {error && <p className="mb-6 text-sm text-[#E85A5A]">{error}</p>}

        {/* Client list */}
        <div className="flex flex-col gap-3">
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-ink/30 py-10 text-center">
              {clients.length === 0 ? 'No clients yet. Run a workshop and it will show up here.' : 'No clients match that search.'}
            </p>
          )}

          {filtered.map((client, idx) => {
            const isOpen = expanded === client.id
            const lastSession = client.sessions[0]
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * Math.min(idx, 8), duration: 0.4 }}
                className={`rounded-2xl transition-all ${isOpen ? 'liquid-glass' : 'liquid-glass-subtle hover:bg-white/40'}`}
              >
                {/* Client row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : client.id)}
                  className="w-full px-5 sm:px-6 py-5 text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="title-caps-md text-ink truncate">{client.name.toUpperCase()}</p>
                      <p className="text-xs text-ink/35 mt-1">
                        {client.sessions.length} session{client.sessions.length !== 1 ? 's' : ''}
                        {lastSession && <> · Last: {SERVICE_LABELS[lastSession.service_type] || lastSession.service_type}, {fmtDate(lastSession.date)}</>}
                        {' '}· Facilitator: {client.facilitator}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {client.access_code && (
                        <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-ink/30 bg-ink/[0.04] rounded-full px-3 py-1">
                          {client.access_code}
                        </span>
                      )}
                      <ChevronDown className={`h-4 w-4 text-ink/25 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6">
                        {/* Access code row */}
                        <div className="mb-5 rounded-xl bg-white/30 px-4 py-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-ink/30 mb-1">Access code</p>
                              <p className="font-mono text-sm tracking-[0.2em] text-ink/70">{client.access_code || 'None yet'}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {client.access_code && (
                                <>
                                  <button
                                    onClick={() => copyText(`code-${client.id}`, client.access_code!)}
                                    title="Copy access code"
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink/30 hover:text-ink/70 hover:bg-white/60 transition-all"
                                  >
                                    {copied === `code-${client.id}` ? <Check className="h-3.5 w-3.5 text-[#2E5E8C]" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => copyText(`link-${client.id}`, `https://download.lol/workshop/share/${client.access_code}`)}
                                    title="Copy client share link"
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink/30 hover:text-ink/70 hover:bg-white/60 transition-all"
                                  >
                                    {copied === `link-${client.id}` ? <Check className="h-3.5 w-3.5 text-[#2E5E8C]" /> : <Link2 className="h-3.5 w-3.5" />}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => regenerateCode(client)}
                                title="Generate a new code"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/30 hover:text-ink/70 hover:bg-white/60 transition-all"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setCustomCode(client)}
                                className="text-[10px] tracking-wider text-ink/30 hover:text-ink/60 transition-colors px-2"
                              >
                                CUSTOM
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-ink/25 mt-2">
                            The share link shows this client their own workshop summaries. The code only unlocks their data, never anyone else&apos;s.
                          </p>
                        </div>

                        {/* Sessions */}
                        {client.sessions.length === 0 ? (
                          <p className="text-sm text-ink/30 py-2">No sessions yet.</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {client.sessions.map((session) => (
                              <div
                                key={session.id}
                                className={`rounded-xl px-4 py-3.5 transition-all ${
                                  compareA === session.id ? 'bg-[#2E5E8C]/10 ring-1 ring-[#2E5E8C]/30' : 'bg-white/25 hover:bg-white/45'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="title-caps-sm text-ink/60 w-16 shrink-0">
                                      {(SERVICE_LABELS[session.service_type] || session.service_type).toUpperCase()}
                                    </span>
                                    <span className="text-sm text-ink/50">{fmtDate(session.date)}</span>
                                    <button
                                      onClick={() => toggleStatus(session)}
                                      title="Toggle status"
                                      className={`text-[9px] font-bold tracking-wider rounded-full px-2 py-0.5 transition-colors ${
                                        session.status === 'completed'
                                          ? 'text-[#2E5E8C] bg-[#2E5E8C]/10 hover:bg-[#2E5E8C]/20'
                                          : 'text-[#E8855A] bg-[#E8855A]/10 hover:bg-[#E8855A]/20'
                                      }`}
                                    >
                                      {session.status === 'completed' ? 'COMPLETE' : 'IN PROGRESS'}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => openSession(session.id, '/overview')}
                                      disabled={busy === session.id}
                                      className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider text-ink/45 hover:text-white hover:bg-ink transition-all"
                                    >
                                      {busy === session.id ? 'OPENING...' : 'RESUME'}
                                      <ArrowRight className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => openSession(session.id, '/workshop/summary')}
                                      disabled={busy === session.id}
                                      className="rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider text-ink/45 hover:text-white hover:bg-[#2E5E8C] transition-all"
                                    >
                                      SUMMARY
                                    </button>
                                    <button
                                      onClick={() => toggleCompare(session.id)}
                                      title={compareA === session.id ? 'Deselect' : compareA ? 'Compare with selected' : 'Select for comparison'}
                                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                                        compareA === session.id ? 'bg-[#2E5E8C] text-white' : 'text-ink/30 hover:text-[#2E5E8C] hover:bg-[#2E5E8C]/10'
                                      }`}
                                    >
                                      <GitCompare className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => removeSession(session, client.name)}
                                      title="Delete session"
                                      className="flex h-7 w-7 items-center justify-center rounded-full text-ink/20 hover:text-[#E85A5A] hover:bg-[#E85A5A]/10 transition-all"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-ink/[0.04] flex items-center justify-between">
          <button
            onClick={() => router.push('/?form=1')}
            className="title-caps-sm text-ink/30 hover:text-ink/60 transition-colors"
          >
            ← SETUP
          </button>
          <Image src="/workshop/images/logo-wordmark-black.png" alt="DWNLD" width={60} height={15} className="opacity-15" />
        </div>
      </div>
    </div>
  )
}
