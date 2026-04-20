'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Printer, ArrowRight } from 'lucide-react'
import { useWorkshopStore } from '@/lib/store'

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

function SectionWrapper({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="break-inside-avoid"
    >
      <h2 className="title-caps-md mb-4" style={{ color: '#1A1A1A' }}>
        {title}
      </h2>
      <div className="rounded-2xl border px-6 py-5 print:border-gray-200 print:bg-white" style={{ borderColor: 'rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.5)' }}>
        {children}
      </div>
    </motion.section>
  )
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="text-sm italic print:text-gray-400" style={{ color: '#6A7A8A' }}>
      {text}
    </p>
  )
}

function scoreColor(total: number) {
  if (total >= 12) return '#2E5E8C'
  if (total >= 8) return '#E8855A'
  return '#E85A5A'
}

/* ────────────────────────────────────────────────────────────
   Golden Circle Mini Diagram
   ──────────────────────────────────────────────────────────── */

function GoldenCircleDiagram({ what, how, why }: { what: string; how: string; why: string }) {
  const rings = [
    { label: 'Why', value: why, size: 200, color: '#2E5E8C' },
    { label: 'How', value: how, size: 150, color: '#4A8AC2' },
    { label: 'What', value: what, size: 100, color: '#E8855A' },
  ]

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      {/* Concentric circles */}
      <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
        {rings.map((ring, idx) => (
          <div
            key={ring.label}
            className="absolute flex items-center justify-center rounded-full"
            style={{
              width: ring.size,
              height: ring.size,
              backgroundColor: `${ring.color}08`,
              border: `1px solid ${ring.color}25`,
            }}
          >
            {idx === rings.length - 1 && (
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: ring.color }}
              >
                {ring.label}
              </span>
            )}
          </div>
        ))}
        {/* Labels on rings */}
        <span
          className="absolute left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider"
          style={{ top: 8, color: '#2E5E8C' }}
        >
          Why
        </span>
        <span
          className="absolute left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider"
          style={{ top: 32, color: '#4A8AC2' }}
        >
          How
        </span>
      </div>

      {/* Text descriptions */}
      <div className="flex-1 space-y-3">
        {rings.map((ring) => (
          <div key={ring.label}>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: ring.color }}
            >
              {ring.label}
            </span>
            <p className="mt-0.5 text-sm print:text-gray-800" style={{ color: '#1A1A1A' }}>
              {ring.value || <span className="italic" style={{ color: '#6A7A8A' }}>Not filled in</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Summary Page
   ──────────────────────────────────────────────────────────── */

export default function SummaryPage() {
  const store = useWorkshopStore()
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const sortedAudiences = [...store.audiences].sort((a, b) => a.rank - b.rank)
  const sortedPriorities = [...store.priorities].sort((a, b) => b.votes - a.votes)
  const weAre = store.voiceAttributes.filter((a) => a.category === 'we-are')
  const weAreNot = store.voiceAttributes.filter((a) => a.category === 'we-are-not')

  return (
    <>
      {/* Print-optimized styles */}
      <style>{`
        @media print {
          body { background: white !important; color: #1A1A1A !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .summary-page { background: white !important; }
          .summary-page * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
          .print-break { break-before: page; }
          * { color-adjust: exact !important; }
        }
      `}</style>

      <div ref={printRef} className="summary-page mx-auto max-w-4xl px-6 py-10" style={{ backgroundColor: '#FAFBFC' }}>
        {/* Decorative header image */}
        <div className="relative mb-10 -mx-6 -mt-10 overflow-hidden" style={{ height: '180px' }}>
          <img
            src="/images/frosted-cloud.jpeg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover print:hidden"
            style={{ opacity: 0.12 }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, #FAFBFC 100%)' }} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-start justify-between"
        >
          <div>
            <h1 className="title-caps-lg" style={{ color: '#1A1A1A' }}>
              Workshop Summary
            </h1>
            {store.config.clientName && (
              <p className="mt-2 text-lg" style={{ color: '#6A7A8A' }}>
                {store.config.clientName}
              </p>
            )}
            <div className="mt-1 flex items-center gap-3 text-sm" style={{ color: '#6A7A8A' }}>
              {store.config.date && <span>{store.config.date}</span>}
              {store.config.facilitatorName && (
                <>
                  <span style={{ color: 'rgba(0,0,0,0.1)' }}>|</span>
                  <span>Facilitated by {store.config.facilitatorName}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="no-print inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Export
          </button>
        </motion.div>

        <div className="space-y-8">
          {/* ── Phase 1: Foundation ─────────────────────────── */}
          <SectionWrapper title="Foundation" delay={0.05}>
            <GoldenCircleDiagram
              what={store.goldenCircle.what}
              how={store.goldenCircle.how}
              why={store.goldenCircle.why}
            />
            {store.goldenCircle.leadTheme && (
              <div className="mt-5 rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(46,94,140,0.06)' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E5E8C' }}>
                  Lead Theme
                </span>
                <p className="mt-1 text-sm print:text-gray-800" style={{ color: '#1A1A1A' }}>
                  {store.goldenCircle.leadTheme}
                </p>
              </div>
            )}
          </SectionWrapper>

          {/* ── Phase 2: Audience ───────────────────────────── */}
          <SectionWrapper title="Audience" delay={0.1}>
            {sortedAudiences.length > 0 ? (
              <div className="space-y-6">
                {/* Audience list */}
                <div className="space-y-3">
                  <h3 className="title-caps-sm" style={{ color: '#6A7A8A' }}>
                    Target Audiences
                  </h3>
                  {sortedAudiences.map((audience, idx) => (
                    <div
                      key={audience.id}
                      className="flex items-start gap-3 rounded-xl px-4 py-3 print:bg-gray-50"
                      style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{
                          backgroundColor: idx === 0 ? '#2E5E8C' : idx === 1 ? '#4A8AC2' : '#8A8A8A',
                        }}
                      >
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold print:text-gray-900" style={{ color: '#1A1A1A' }}>
                          {audience.name || 'Untitled audience'}
                        </span>
                        {audience.description && (
                          <p className="mt-0.5 text-xs print:text-gray-500" style={{ color: '#6A7A8A' }}>
                            {audience.description}
                          </p>
                        )}
                        {audience.platformBehavior && (
                          <p className="mt-0.5 text-xs print:text-gray-400" style={{ color: '#6A7A8A' }}>
                            Platform: {audience.platformBehavior}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empathy Maps */}
                {store.empathyMaps.length > 0 && (
                  <div>
                    <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                      Empathy Maps
                    </h3>
                    {store.empathyMaps.map((map) => {
                      const audience = store.audiences.find((a) => a.id === map.audienceId)
                      const quadrants = [
                        { label: 'Says', items: map.says, color: '#2E5E8C' },
                        { label: 'Thinks', items: map.thinks, color: '#4A8AC2' },
                        { label: 'Feels', items: map.feels, color: '#E8855A' },
                        { label: 'Does', items: map.does, color: '#7EB8E0' },
                      ]
                      const hasContent = quadrants.some((q) => q.items.length > 0)
                      if (!hasContent) return null

                      return (
                        <div key={map.audienceId} className="mb-4">
                          <span className="mb-2 block text-xs font-medium" style={{ color: '#6A7A8A' }}>
                            {audience?.name || 'Unknown audience'}
                          </span>
                          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl print:bg-gray-100" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                            {quadrants.map((q) => (
                              <div
                                key={q.label}
                                className="p-3 print:bg-white"
                                style={{ backgroundColor: '#FAFBFC' }}
                              >
                                <span
                                  className="text-[10px] font-bold uppercase tracking-wider"
                                  style={{ color: q.color }}
                                >
                                  {q.label}
                                </span>
                                {q.items.length > 0 ? (
                                  <ul className="mt-1.5 space-y-1">
                                    {q.items.map((item, i) => (
                                      <li
                                        key={i}
                                        className="text-xs print:text-gray-700"
                                        style={{ color: '#3A3A3A' }}
                                      >
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-1 text-xs" style={{ color: '#6A7A8A' }}>--</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Before / After */}
                {(store.beforeAfter.before.length > 0 || store.beforeAfter.after.length > 0) && (
                  <div>
                    <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                      Before &amp; After
                    </h3>
                    <div className="flex items-stretch gap-4">
                      <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: 'rgba(232,90,90,0.06)' }}>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#E85A5A' }}>
                          Before
                        </span>
                        <ul className="mt-2 space-y-1">
                          {store.beforeAfter.before.map((item, i) => (
                            <li key={i} className="text-xs print:text-gray-700" style={{ color: '#3A3A3A' }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center">
                        <ArrowRight className="h-5 w-5" style={{ color: 'rgba(0,0,0,0.15)' }} />
                      </div>
                      <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: 'rgba(46,94,140,0.06)' }}>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E5E8C' }}>
                          After
                        </span>
                        <ul className="mt-2 space-y-1">
                          {store.beforeAfter.after.map((item, i) => (
                            <li key={i} className="text-xs print:text-gray-700" style={{ color: '#3A3A3A' }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {store.beforeAfter.statement && (
                      <div className="mt-3 rounded-xl px-4 py-3 print:bg-gray-50" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <span className="title-caps-sm" style={{ color: '#6A7A8A' }}>
                          Transformation Statement
                        </span>
                        <p className="mt-1 text-sm print:text-gray-800" style={{ color: '#1A1A1A' }}>
                          {store.beforeAfter.statement}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <EmptyNote text="No audiences defined yet." />
            )}
          </SectionWrapper>

          {/* ── Phase 3: Position ───────────────────────────── */}
          <SectionWrapper title="Position" delay={0.15}>
            {store.competitors.length > 0 ? (
              <div className="space-y-4">
                <h3 className="title-caps-sm" style={{ color: '#6A7A8A' }}>
                  Competitor Landscape
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {store.competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="rounded-xl p-4 print:bg-gray-50"
                      style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold print:text-gray-900" style={{ color: '#1A1A1A' }}>
                          {comp.name || 'Unnamed'}
                        </span>
                        <div className="flex gap-1">
                          {[comp.visualIdentity, comp.engagement].map((val, i) => (
                            <div
                              key={i}
                              className="flex h-5 items-center gap-0.5 rounded px-1.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.04)',
                                color: '#6A7A8A',
                              }}
                            >
                              {i === 0 ? 'Visual' : 'Engage'}: {val}/10
                            </div>
                          ))}
                        </div>
                      </div>
                      {comp.contentThemes && (
                        <p className="text-xs" style={{ color: '#6A7A8A' }}>
                          Themes: {comp.contentThemes}
                        </p>
                      )}
                      {comp.gaps && (
                        <p className="mt-1 text-xs" style={{ color: '#E8855A' }}>
                          Gaps: {comp.gaps}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyNote text="No competitor analysis completed." />
            )}
          </SectionWrapper>

          {/* ── Phase 4: Identity ───────────────────────────── */}
          <SectionWrapper title="Identity" delay={0.2}>
            <div className="space-y-6">
              {/* Voice Attributes */}
              {(weAre.length > 0 || weAreNot.length > 0) && (
                <div>
                  <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                    Voice Attributes
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium" style={{ color: '#2E5E8C' }}>We Are</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {weAre.map((attr) => (
                          <span
                            key={attr.id}
                            className="rounded-full px-2.5 py-1 text-xs"
                            style={{ backgroundColor: 'rgba(46,94,140,0.1)', color: '#2E5E8C' }}
                          >
                            {attr.word}
                          </span>
                        ))}
                        {weAre.length === 0 && (
                          <span className="text-xs" style={{ color: '#6A7A8A' }}>None selected</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium" style={{ color: '#E85A5A' }}>We Are Not</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {weAreNot.map((attr) => (
                          <span
                            key={attr.id}
                            className="rounded-full px-2.5 py-1 text-xs"
                            style={{ backgroundColor: 'rgba(232,90,90,0.1)', color: '#E85A5A' }}
                          >
                            {attr.word}
                          </span>
                        ))}
                        {weAreNot.length === 0 && (
                          <span className="text-xs" style={{ color: '#6A7A8A' }}>None selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personality Sliders as horizontal bars */}
              <div>
                <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                  Brand Personality
                </h3>
                <div className="space-y-3">
                  {store.personalitySliders.map((slider) => (
                    <div key={slider.id} className="flex items-center gap-3">
                      <span className="w-20 text-right text-xs print:text-gray-500" style={{ color: '#6A7A8A' }}>
                        {slider.leftLabel}
                      </span>
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full print:bg-gray-200" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                        <motion.div
                          className="absolute top-0 h-full rounded-full"
                          style={{
                            left: 0,
                            width: `${slider.value}%`,
                            backgroundColor: '#4A8AC2',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${slider.value}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        />
                        {/* Position indicator */}
                        <motion.div
                          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 print:bg-white print:border-gray-400"
                          style={{
                            left: `calc(${slider.value}% - 7px)`,
                            backgroundColor: '#4A8AC2',
                            borderColor: '#ffffff',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        />
                      </div>
                      <span className="w-20 text-xs print:text-gray-500" style={{ color: '#6A7A8A' }}>
                        {slider.rightLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Guardrails */}
              {store.voiceGuardrails.length > 0 && (
                <div>
                  <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                    Voice Guardrails
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {store.voiceGuardrails.map((guardrail) => (
                      <div
                        key={guardrail.id}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 print:bg-gray-50"
                        style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#2E5E8C' }} />
                            <span className="text-xs font-medium print:text-gray-900" style={{ color: '#2E5E8C' }}>
                              {guardrail.positive || '--'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs" style={{ color: 'rgba(0,0,0,0.15)' }}>vs</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#E85A5A' }} />
                            <span className="text-xs line-through print:text-gray-500" style={{ color: '#E85A5A' }}>
                              {guardrail.negative || '--'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tone Dimensions */}
              {store.toneDimensions.length > 0 && (
                <div>
                  <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                    Tone Dimensions
                  </h3>
                  <div className="space-y-2">
                    {store.toneDimensions.map((dim) => (
                      <div key={dim.id} className="flex items-center gap-3">
                        <span className="w-24 text-right text-xs" style={{ color: '#6A7A8A' }}>
                          {dim.leftLabel}
                        </span>
                        <div className="relative flex h-2 flex-1 items-center">
                          <div className="h-full w-full rounded-full print:bg-gray-200" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
                          <motion.div
                            className="absolute h-3 w-3 rounded-full shadow-lg"
                            style={{
                              left: `calc(${((dim.value - 1) / 9) * 100}% - 6px)`,
                              backgroundColor: '#4A8AC2',
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                          />
                        </div>
                        <span className="w-24 text-xs" style={{ color: '#6A7A8A' }}>
                          {dim.rightLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionWrapper>

          {/* ── Phase 5: Application ───────────────────────── */}
          <SectionWrapper title="Application" delay={0.25}>
            <div className="space-y-6">
              {/* Content Pillars with scores */}
              {store.contentPillars.length > 0 ? (
                <div>
                  <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                    Content Pillars
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {store.contentPillars.map((pillar) => {
                      const total =
                        pillar.businessAlignment +
                        pillar.audienceInterest +
                        pillar.credibility +
                        pillar.sustainability
                      const color = scoreColor(total)
                      return (
                        <div
                          key={pillar.id}
                          className="rounded-xl p-4 print:bg-gray-50"
                          style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-semibold print:text-gray-900" style={{ color: '#1A1A1A' }}>
                              {pillar.name || 'Untitled'}
                            </span>
                            {/* Simple progress indicator */}
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${(total / 20) * 100}%`, backgroundColor: '#4A8AC2' }}
                                />
                              </div>
                              <span className="text-xs font-medium" style={{ color }}>
                                {total}/20
                              </span>
                            </div>
                          </div>
                          {pillar.description && (
                            <p className="mb-2 text-xs print:text-gray-500" style={{ color: '#6A7A8A' }}>
                              {pillar.description}
                            </p>
                          )}
                          {pillar.contentIdeas.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {pillar.contentIdeas.map((idea, i) => (
                                <span
                                  key={i}
                                  className="rounded-full px-2 py-0.5 text-[10px] print:bg-gray-100 print:text-gray-600"
                                  style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: '#3A3A3A' }}
                                >
                                  {idea}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <EmptyNote text="No content pillars defined." />
              )}

              {/* Platform Strategy mini table */}
              {store.platformStrategies.some((p) => p.role || p.priority) && (
                <div>
                  <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                    Platform Strategy
                  </h3>
                  <div className="overflow-hidden rounded-xl print:border-gray-200" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                          <th className="px-3 py-2 font-semibold" style={{ color: '#6A7A8A' }}>Platform</th>
                          <th className="px-3 py-2 font-semibold" style={{ color: '#6A7A8A' }}>Role</th>
                          <th className="px-3 py-2 font-semibold" style={{ color: '#6A7A8A' }}>Frequency</th>
                          <th className="px-3 py-2 font-semibold" style={{ color: '#6A7A8A' }}>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.platformStrategies.map((p) => {
                          const priorityColors: Record<string, string> = {
                            kill: '#E85A5A',
                            keep: '#6A7A8A',
                            invest: '#2E5E8C',
                          }
                          return (
                            <tr
                              key={p.id}
                              style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}
                            >
                              <td className="px-3 py-2 font-medium print:text-gray-900" style={{ color: '#1A1A1A' }}>
                                {p.platform}
                              </td>
                              <td className="px-3 py-2 print:text-gray-600" style={{ color: '#6A7A8A' }}>
                                {p.role || '--'}
                              </td>
                              <td className="px-3 py-2 print:text-gray-600" style={{ color: '#6A7A8A' }}>
                                {p.frequency || '--'}
                              </td>
                              <td className="px-3 py-2">
                                {p.priority ? (
                                  <span
                                    className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase"
                                    style={{
                                      backgroundColor: `${priorityColors[p.priority]}15`,
                                      color: priorityColors[p.priority],
                                    }}
                                  >
                                    {p.priority}
                                  </span>
                                ) : (
                                  <span style={{ color: '#6A7A8A' }}>--</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Video Styles */}
              {store.videoStyles.some((v) => v.rating > 0) && (
                <div>
                  <h3 className="mb-3 title-caps-sm" style={{ color: '#6A7A8A' }}>
                    Video Style Preferences
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {store.videoStyles
                      .filter((v) => v.rating > 0)
                      .sort((a, b) => b.rating - a.rating)
                      .map((style) => (
                        <div
                          key={style.id}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 print:bg-gray-50"
                          style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        >
                          <span className="text-xs print:text-gray-900" style={{ color: '#1A1A1A' }}>
                            {style.style}
                          </span>
                          <div className="ml-auto flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <div
                                key={v}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    v <= style.rating
                                      ? '#4A8AC2'
                                      : 'rgba(0,0,0,0.08)',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </SectionWrapper>

          {/* ── Phase 6: Priorities ─────────────────────────── */}
          <SectionWrapper title="Priorities" delay={0.3}>
            {sortedPriorities.length > 0 ? (
              <div className="space-y-3">
                {sortedPriorities.map((priority, idx) => (
                  <div
                    key={priority.id}
                    className="flex items-start gap-4 rounded-xl px-4 py-3 print:bg-gray-50"
                    style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    {/* Rank + votes */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{
                          backgroundColor: idx === 0 ? '#2E5E8C' : idx === 1 ? '#4A8AC2' : '#8A8A8A',
                        }}
                      >
                        {priority.votes}
                      </div>
                      <span className="text-[10px]" style={{ color: '#6A7A8A' }}>
                        {priority.votes === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-sm print:text-gray-900" style={{ color: '#1A1A1A' }}>
                        {priority.description || 'No description'}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs print:text-gray-500" style={{ color: '#6A7A8A' }}>
                        {priority.owner && (
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#4A8AC2' }} />
                            {priority.owner}
                          </span>
                        )}
                        {priority.deadline && (
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#E8855A' }} />
                            {priority.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyNote text="No priorities defined yet." />
            )}
          </SectionWrapper>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-6 text-center print:border-gray-200"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p className="text-xs print:text-gray-400" style={{ color: '#6A7A8A' }}>
            Generated by DWNLD Workshop
            {store.config.date && ` on ${store.config.date}`}
          </p>
        </motion.div>
      </div>
    </>
  )
}
