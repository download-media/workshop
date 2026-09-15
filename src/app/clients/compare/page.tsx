'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type {
  GoldenCircle, Audience, ContentPillar, PlatformStrategy, Priority,
  PersonalitySlider, VoiceGuardrail, CampaignIdea, BeforeAfter, VoiceAttribute,
} from '@/lib/types'

interface LoadedSession {
  id: string
  serviceType: string
  date: string
  status: string
  clientName: string
  data: {
    goldenCircle?: GoldenCircle
    audiences?: Audience[]
    beforeAfter?: BeforeAfter
    voiceAttributes?: VoiceAttribute[]
    personalitySliders?: PersonalitySlider[]
    voiceGuardrails?: VoiceGuardrail[]
    contentPillars?: ContentPillar[]
    platformStrategies?: PlatformStrategy[]
    campaignIdeas?: CampaignIdea[]
    priorities?: Priority[]
  }
}

const SERVICE_LABELS: Record<string, string> = {
  social: 'Social', web: 'Web', branding: 'Brand', ideation: 'Ideation',
}

function fmtDate(d: string) {
  const date = new Date(`${d}T00:00:00`)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

async function loadSession(id: string): Promise<LoadedSession | null> {
  const res = await fetch(`/api/sessions/${id}`)
  if (!res.ok) return null
  const { session, client } = await res.json()
  return {
    id: session.id,
    serviceType: session.service_type,
    date: session.date,
    status: session.status,
    clientName: client.name,
    data: session.workshop_data || {},
  }
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/35 px-4 py-3.5 min-w-0">
      {children}
    </div>
  )
}

function Empty() {
  return <p className="text-xs italic text-ink/25">Not captured in this session</p>
}

function CompareContent() {
  const router = useRouter()
  const params = useSearchParams()
  const idA = params.get('a')
  const idB = params.get('b')

  const missingIds = !idA || !idB
  const [a, setA] = useState<LoadedSession | null>(null)
  const [b, setB] = useState<LoadedSession | null>(null)
  const [loading, setLoading] = useState(!missingIds)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!idA || !idB) return
    Promise.all([loadSession(idA), loadSession(idB)]).then(([ra, rb]) => {
      if (!ra || !rb) setError('One of the sessions could not be loaded.')
      setA(ra)
      setB(rb)
      setLoading(false)
    })
  }, [idA, idB])

  if (loading) {
    return <p className="text-sm text-ink/30 py-20 text-center">Loading sessions...</p>
  }
  if (missingIds || error || !a || !b) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-ink/40 mb-6">
          {missingIds ? 'Pick two sessions from the internal view to compare.' : error || 'Sessions not found.'}
        </p>
        <button onClick={() => router.push('/clients')} className="title-caps-sm text-ink/40 hover:text-ink transition-colors">← BACK TO INTERNAL</button>
      </div>
    )
  }

  const sections: { title: string; render: (s: LoadedSession) => React.ReactNode }[] = [
    {
      title: 'Golden Circle',
      render: (s) => {
        const g = s.data.goldenCircle
        if (!g || (!g.why && !g.how && !g.what)) return <Empty />
        return (
          <div className="space-y-2">
            {(['why', 'how', 'what'] as const).map((k) => g[k] && (
              <div key={k}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#2E5E8C]">{k}</span>
                <p className="text-xs text-ink/70 leading-relaxed">{g[k]}</p>
              </div>
            ))}
            {g.leadTheme && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#E8855A]">Lead theme</span>
                <p className="text-xs text-ink/70">{g.leadTheme}</p>
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: 'Audiences',
      render: (s) => {
        const list = (s.data.audiences || []).slice().sort((x, y) => x.rank - y.rank)
        if (!list.length) return <Empty />
        return (
          <ol className="space-y-1.5">
            {list.map((aud, i) => (
              <li key={aud.id} className="text-xs text-ink/70">
                <span className="font-bold text-ink/40">#{i + 1}</span> {aud.name}
                {aud.description && <span className="text-ink/40"> — {aud.description}</span>}
              </li>
            ))}
          </ol>
        )
      },
    },
    {
      title: 'Transformation',
      render: (s) => {
        const ba = s.data.beforeAfter
        if (!ba || (!ba.statement && !ba.before?.length && !ba.after?.length)) return <Empty />
        return (
          <div className="space-y-1.5 text-xs text-ink/70">
            {ba.statement && <p className="leading-relaxed">{ba.statement}</p>}
            {!!ba.before?.length && <p><span className="font-bold text-[#E85A5A]">Before:</span> {ba.before.join(', ')}</p>}
            {!!ba.after?.length && <p><span className="font-bold text-[#2E5E8C]">After:</span> {ba.after.join(', ')}</p>}
          </div>
        )
      },
    },
    {
      title: 'Voice',
      render: (s) => {
        const weAre = (s.data.voiceAttributes || []).filter((v) => v.category === 'we-are').map((v) => v.word)
        const weAreNot = (s.data.voiceAttributes || []).filter((v) => v.category === 'we-are-not').map((v) => v.word)
        const rails = s.data.voiceGuardrails || []
        if (!weAre.length && !weAreNot.length && !rails.length) return <Empty />
        return (
          <div className="space-y-1.5 text-xs text-ink/70">
            {!!weAre.length && <p><span className="font-bold text-[#2E5E8C]">We are:</span> {weAre.join(', ')}</p>}
            {!!weAreNot.length && <p><span className="font-bold text-[#E85A5A]">We are not:</span> {weAreNot.join(', ')}</p>}
            {rails.map((r) => (
              <p key={r.id}><span className="text-ink/40">{r.positive}</span> — never {r.negative}</p>
            ))}
          </div>
        )
      },
    },
    {
      title: 'Personality',
      render: (s) => {
        const sliders = s.data.personalitySliders || []
        if (!sliders.length) return <Empty />
        return (
          <div className="space-y-2">
            {sliders.map((sl) => (
              <div key={sl.id}>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-ink/30 mb-0.5">
                  <span>{sl.leftLabel}</span><span>{sl.rightLabel}</span>
                </div>
                <div className="h-1 rounded-full bg-ink/[0.06] relative">
                  <div className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#2E5E8C]" style={{ left: `calc(${sl.value}% - 5px)` }} />
                </div>
              </div>
            ))}
          </div>
        )
      },
    },
    {
      title: 'Content Pillars',
      render: (s) => {
        const pillars = s.data.contentPillars || []
        if (!pillars.length) return <Empty />
        return (
          <div className="space-y-1.5">
            {pillars.map((p) => {
              const total = p.businessAlignment + p.audienceInterest + p.credibility + p.sustainability
              return (
                <p key={p.id} className="text-xs text-ink/70">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-ink/35"> · {total}/20</span>
                  {p.description && <span className="text-ink/40"> — {p.description}</span>}
                </p>
              )
            })}
          </div>
        )
      },
    },
    {
      title: 'Platforms',
      render: (s) => {
        const platforms = (s.data.platformStrategies || []).filter((p) => p.role || p.priority)
        if (!platforms.length) return <Empty />
        return (
          <div className="space-y-1">
            {platforms.map((p) => (
              <p key={p.id} className="text-xs text-ink/70">
                <span className="font-semibold">{p.platform}</span>
                {p.priority && <span className={`ml-1.5 text-[9px] font-bold uppercase ${p.priority === 'invest' ? 'text-[#2E5E8C]' : p.priority === 'kill' ? 'text-[#E85A5A]' : 'text-ink/40'}`}>{p.priority}</span>}
                {p.role && <span className="text-ink/40"> — {p.role}</span>}
              </p>
            ))}
          </div>
        )
      },
    },
    {
      title: 'Campaign Ideas',
      render: (s) => {
        const ideas = s.data.campaignIdeas || []
        if (!ideas.length) return <Empty />
        return (
          <div className="space-y-1">
            {ideas.slice().sort((x, y) => y.votes - x.votes).map((i) => (
              <p key={i.id} className="text-xs text-ink/70">
                <span className="font-bold text-ink/35">{i.votes}▲</span> {i.concept}
                {i.platform && <span className="text-ink/40"> · {i.platform}</span>}
              </p>
            ))}
          </div>
        )
      },
    },
    {
      title: 'Priorities',
      render: (s) => {
        const priorities = (s.data.priorities || []).slice().sort((x, y) => y.votes - x.votes)
        if (!priorities.length) return <Empty />
        return (
          <ol className="space-y-1">
            {priorities.map((p, i) => (
              <li key={p.id} className="text-xs text-ink/70">
                <span className="font-bold text-ink/35">{i + 1}.</span> {p.description}
                {p.owner && <span className="text-ink/40"> · {p.owner}</span>}
                {p.deadline && <span className="text-ink/40"> · {p.deadline}</span>}
              </li>
            ))}
          </ol>
        )
      },
    },
  ]

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <button onClick={() => router.push('/clients')} className="title-caps-sm text-ink/25 hover:text-ink/60 transition-colors mb-6 block">
          ← INTERNAL
        </button>
        <h1 className="title-caps-lg text-ink mb-2">SESSION COMPARISON</h1>
        <p className="text-sm text-ink/40">
          {a.clientName}{a.clientName !== b.clientName ? ` vs ${b.clientName}` : ''}
        </p>
      </motion.div>

      {/* Column headers — sticky */}
      <div className="sticky top-0 z-20 grid grid-cols-2 gap-4 py-3 -mx-2 px-2" style={{ background: 'linear-gradient(180deg, #E8F0F6 75%, transparent)' }}>
        {[a, b].map((s, i) => (
          <div key={s.id + i} className="liquid-glass rounded-xl px-4 py-3">
            <p className="title-caps-sm text-ink/70">{(SERVICE_LABELS[s.serviceType] || s.serviceType).toUpperCase()} · {fmtDate(s.date)}</p>
            <p className="text-[10px] text-ink/30 mt-0.5 uppercase tracking-wider">{s.clientName} · {s.status === 'completed' ? 'Complete' : 'In progress'}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="title-caps-sm text-ink/40 mb-2.5">{section.title.toUpperCase()}</h2>
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <Cell>{section.render(a)}</Cell>
              <Cell>{section.render(b)}</Cell>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function ComparePage() {
  return (
    <div className="relative min-h-screen sky-bg">
      <div className="fixed inset-0 z-0">
        <Image src="/workshop/images/frosted-cloud.jpeg" alt="" fill className="object-cover opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E8F0F6]/60" />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10 py-16">
        <Suspense fallback={null}>
          <CompareContent />
        </Suspense>
      </div>
    </div>
  )
}
