'use client'

import type {
  WorkshopConfig, GoldenCircle, Audience, EmpathyMap, BeforeAfter, Competitor,
  LandscapePosition, VoiceAttribute, PersonalitySlider, VoiceGuardrail, ToneDimension,
  ContentPillar, PlatformStrategy, VideoStyle, CampaignIdea, Priority, Logistics,
} from '@/lib/types'

export interface WorkshopSummaryData {
  config: WorkshopConfig
  goldenCircle?: GoldenCircle
  audiences?: Audience[]
  empathyMaps?: EmpathyMap[]
  beforeAfter?: BeforeAfter
  competitors?: Competitor[]
  landscapePositions?: LandscapePosition[]
  landscapeAxes?: { xLeft: string; xRight: string; yTop: string; yBottom: string }
  voiceAttributes?: VoiceAttribute[]
  personalitySliders?: PersonalitySlider[]
  voiceGuardrails?: VoiceGuardrail[]
  toneDimensions?: ToneDimension[]
  contentPillars?: ContentPillar[]
  platformStrategies?: PlatformStrategy[]
  logistics?: Logistics
  videoStyles?: VideoStyle[]
  campaignIdeas?: CampaignIdea[]
  priorities?: Priority[]
  aiBrief?: string
}

const INK = '#1A1A1A'
const MUTED = '#6A7A8A'
const BLUE = '#2E5E8C'
const SKY = '#4A8AC2'
const WARM = '#E8855A'
const CORAL = '#E85A5A'

const SERVICE_LABELS: Record<string, string> = {
  social: 'Social Media',
  web: 'Web Development',
  branding: 'Brand Strategy',
  ideation: 'Creative Ideation',
}

function fmtDate(d?: string) {
  if (!d) return ''
  const date = new Date(`${d}T00:00:00`)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/* ── shared building blocks ─────────────────────────────── */

function Section({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <section className="summary-section break-inside-avoid-page">
      <div className="flex items-baseline gap-4 mb-5 pt-10 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: `${INK}40` }}>
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.18em]" style={{ color: INK }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function Label({ children, color = MUTED }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color }}>
      {children}
    </span>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`summary-card rounded-xl px-5 py-4 break-inside-avoid ${className}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      {children}
    </div>
  )
}

/* ── landscape matrix ───────────────────────────────────── */

function LandscapeMatrix({ positions, axes }: {
  positions: LandscapePosition[]
  axes: { xLeft: string; xRight: string; yTop: string; yBottom: string }
}) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 420 }}>
      <div className="relative rounded-xl" style={{ aspectRatio: '1', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
        {/* Axis lines */}
        <div className="absolute left-0 right-0 top-1/2 h-px" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }} />
        <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }} />
        {/* Dots */}
        {positions.map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div
              className="rounded-full"
              style={{
                width: p.isClient ? 14 : 9,
                height: p.isClient ? 14 : 9,
                backgroundColor: p.isClient ? WARM : `${BLUE}99`,
                boxShadow: p.isClient ? `0 0 0 4px ${WARM}25` : 'none',
              }}
            />
            <span className="mt-1 text-[9px] font-semibold whitespace-nowrap" style={{ color: p.isClient ? WARM : MUTED }}>
              {p.name}
            </span>
          </div>
        ))}
        {/* Axis labels */}
        <span className="absolute left-1/2 -translate-x-1/2 top-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: `${INK}35` }}>{axes.yTop}</span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: `${INK}35` }}>{axes.yBottom}</span>
        <span className="absolute top-1/2 -translate-y-1/2 left-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: `${INK}35`, writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}>{axes.xLeft}</span>
        <span className="absolute top-1/2 -translate-y-1/2 right-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: `${INK}35`, writingMode: 'vertical-rl' }}>{axes.xRight}</span>
      </div>
    </div>
  )
}

/* ── AI brief renderer ──────────────────────────────────── */

export function BriefRenderer({ brief }: { brief: string }) {
  const lines = brief.split('\n')
  const blocks: { type: 'header' | 'numbered' | 'para'; text: string }[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const isHeader =
      line === line.toUpperCase() &&
      line.replace(/[^A-Za-z]/g, '').length > 2 &&
      line.length < 60 &&
      !/^\d+[.)]/.test(line)
    if (isHeader) blocks.push({ type: 'header', text: line.replace(/^\d+\.\s*/, '') })
    else if (/^\d+[.)]/.test(line)) blocks.push({ type: 'numbered', text: line })
    else blocks.push({ type: 'para', text: line })
  }

  return (
    <div className="brief-body">
      {blocks.map((b, i) => {
        if (b.type === 'header') {
          return (
            <h3
              key={i}
              className="text-[11px] font-bold uppercase tracking-[0.18em] mt-8 mb-3 first:mt-0 pb-2"
              style={{ color: BLUE, borderBottom: `1px solid ${BLUE}20` }}
            >
              {b.text}
            </h3>
          )
        }
        if (b.type === 'numbered') {
          const match = b.text.match(/^(\d+)[.)]\s*(.*)$/)
          return (
            <div key={i} className="flex gap-3 mb-2.5">
              <span className="shrink-0 text-xs font-bold w-5 text-right" style={{ color: `${BLUE}90` }}>{match?.[1]}</span>
              <p className="text-[13.5px] leading-relaxed" style={{ color: `${INK}D0` }}>{match?.[2] || b.text}</p>
            </div>
          )
        }
        return (
          <p key={i} className="mb-3 text-[13.5px] leading-[1.7]" style={{ color: `${INK}D0` }}>
            {b.text}
          </p>
        )
      })}
    </div>
  )
}

/* ── main document ──────────────────────────────────────── */

export function SummaryDocument({ data }: { data: WorkshopSummaryData }) {
  const config = data.config
  const audiences = (data.audiences || []).slice().sort((a, b) => a.rank - b.rank)
  const empathyMaps = data.empathyMaps || []
  const beforeAfter = data.beforeAfter
  const competitors = data.competitors || []
  const landscapePositions = data.landscapePositions || []
  const landscapeAxes = data.landscapeAxes || { xLeft: 'Polished', xRight: 'Raw', yTop: 'Corporate', yBottom: 'Human' }
  const weAre = (data.voiceAttributes || []).filter((v) => v.category === 'we-are')
  const weAreNot = (data.voiceAttributes || []).filter((v) => v.category === 'we-are-not')
  const guardrails = data.voiceGuardrails || []
  const sliders = data.personalitySliders || []
  const tone = data.toneDimensions || []
  const pillars = data.contentPillars || []
  const platforms = (data.platformStrategies || []).filter((p) => p.role || p.priority || p.frequency)
  const logistics = data.logistics
  const videoStyles = (data.videoStyles || []).filter((v) => v.rating > 0).sort((a, b) => b.rating - a.rating)
  const campaignIdeas = (data.campaignIdeas || []).slice().sort((a, b) => b.votes - a.votes)
  const priorities = (data.priorities || []).slice().sort((a, b) => b.votes - a.votes)

  const hasIdentity = weAre.length > 0 || weAreNot.length > 0 || guardrails.length > 0 || sliders.some((s) => s.value !== 50) || tone.some((t) => t.value !== 5)
  const hasLogistics = !!logistics && (
    logistics.onCameraPeople.length > 0 || !!logistics.postingVolume || !!logistics.socialGoal ||
    !!logistics.shootFrequency || !!logistics.metaAdsBudget || !!logistics.pointOfContact
  )

  let sectionIndex = 0
  const nextIndex = () => ++sectionIndex

  return (
    <div className="summary-doc" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* ── Cover header ── */}
      <header className="mb-4">
        <div className="flex items-start justify-between mb-10">
          <span className="text-[11px] font-bold tracking-[0.25em]" style={{ color: `${INK}35` }}>
            DWNLD WORKSHOP
          </span>
          <span className="text-[11px] tracking-[0.15em]" style={{ color: `${INK}30` }}>
            {SERVICE_LABELS[config.serviceType]?.toUpperCase() || config.serviceType?.toUpperCase()}
          </span>
        </div>

        <h1
          className="font-bold uppercase leading-[0.95] tracking-tight mb-8"
          style={{ color: INK, fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}
        >
          {config.clientName}
        </h1>

        <div className="grid grid-cols-3 gap-4 pb-2">
          <div>
            <Label>Date</Label>
            <p className="text-sm" style={{ color: `${INK}B0` }}>{fmtDate(config.date)}</p>
          </div>
          <div>
            <Label>Facilitator</Label>
            <p className="text-sm" style={{ color: `${INK}B0` }}>{config.facilitatorName || '—'}</p>
          </div>
          <div>
            <Label>Prepared by</Label>
            <p className="text-sm" style={{ color: `${INK}B0` }}>Download Media</p>
          </div>
        </div>
      </header>

      <div className="space-y-2">
        {/* ── Strategic brief ── */}
        {data.aiBrief && (
          <Section index={nextIndex()} title="Strategic Brief">
            <Card className="!px-7 !py-6">
              <BriefRenderer brief={data.aiBrief} />
            </Card>
          </Section>
        )}

        {/* ── Foundation ── */}
        <Section index={nextIndex()} title="Foundation">
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { label: 'Why', value: data.goldenCircle?.why, color: BLUE, note: 'The belief' },
              { label: 'How', value: data.goldenCircle?.how, color: SKY, note: 'The approach' },
              { label: 'What', value: data.goldenCircle?.what, color: WARM, note: 'The offer' },
            ]).map((ring) => (
              <Card key={ring.label}>
                <div className="flex items-baseline justify-between mb-2">
                  <Label color={ring.color}>{ring.label}</Label>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: `${INK}25` }}>{ring.note}</span>
                </div>
                <p className="text-[13.5px] leading-relaxed" style={{ color: ring.value ? `${INK}D0` : `${MUTED}80` }}>
                  {ring.value || 'Not captured'}
                </p>
              </Card>
            ))}
          </div>
          {data.goldenCircle?.leadTheme && (
            <div className="mt-3 rounded-xl px-5 py-4" style={{ backgroundColor: `${BLUE}0A`, border: `1px solid ${BLUE}1A` }}>
              <Label color={BLUE}>Lead theme</Label>
              <p className="text-[15px] font-medium leading-relaxed" style={{ color: INK }}>
                {data.goldenCircle.leadTheme}
              </p>
            </div>
          )}
        </Section>

        {/* ── Audience ── */}
        {(audiences.length > 0 || beforeAfter?.statement || (beforeAfter?.before?.length || 0) > 0) && (
          <Section index={nextIndex()} title="Audience">
            {audiences.length > 0 && (
              <div className="space-y-2.5 mb-6">
                {audiences.map((audience, idx) => {
                  const map = empathyMaps.find((m) => m.audienceId === audience.id)
                  const hasMap = map && (map.says.length || map.thinks.length || map.feels.length || map.does.length)
                  return (
                    <Card key={audience.id}>
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: idx === 0 ? BLUE : idx === 1 ? SKY : '#8A97A5' }}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: INK }}>{audience.name || 'Untitled audience'}</p>
                          {audience.description && (
                            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: MUTED }}>{audience.description}</p>
                          )}
                          {audience.platformBehavior && (
                            <p className="mt-1 text-xs" style={{ color: `${MUTED}B0` }}>Where they live: {audience.platformBehavior}</p>
                          )}
                          {hasMap && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                              {([
                                { label: 'Says', items: map!.says, color: BLUE },
                                { label: 'Thinks', items: map!.thinks, color: SKY },
                                { label: 'Feels', items: map!.feels, color: WARM },
                                { label: 'Does', items: map!.does, color: '#7EB8E0' },
                              ]).map((qd) => (
                                <div key={qd.label} className="p-2.5" style={{ backgroundColor: '#FDFDFC' }}>
                                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: qd.color }}>{qd.label}</span>
                                  {qd.items.length ? (
                                    <ul className="mt-1 space-y-0.5">
                                      {qd.items.map((item, i) => (
                                        <li key={i} className="text-[11px] leading-snug" style={{ color: `${INK}A0` }}>{item}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="mt-1 text-[11px]" style={{ color: `${MUTED}60` }}>—</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {beforeAfter && (beforeAfter.before.length > 0 || beforeAfter.after.length > 0 || beforeAfter.statement) && (
              <div>
                <Label>The transformation</Label>
                {(beforeAfter.before.length > 0 || beforeAfter.after.length > 0) && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: `${CORAL}08`, border: `1px solid ${CORAL}15` }}>
                      <Label color={CORAL}>Before</Label>
                      <ul className="space-y-1">
                        {beforeAfter.before.map((item, i) => (
                          <li key={i} className="text-[12.5px] leading-snug" style={{ color: `${INK}A0` }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: `${BLUE}08`, border: `1px solid ${BLUE}15` }}>
                      <Label color={BLUE}>After</Label>
                      <ul className="space-y-1">
                        {beforeAfter.after.map((item, i) => (
                          <li key={i} className="text-[12.5px] leading-snug" style={{ color: `${INK}A0` }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {beforeAfter.statement && (
                  <p className="text-[15px] font-medium leading-relaxed rounded-xl px-5 py-4" style={{ color: INK, backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    “{beforeAfter.statement}”
                  </p>
                )}
              </div>
            )}
          </Section>
        )}

        {/* ── Position ── */}
        {(competitors.length > 0 || landscapePositions.length > 0) && (
          <Section index={nextIndex()} title="Position">
            {landscapePositions.length > 0 && (
              <div className="mb-6">
                <Label>The landscape</Label>
                <LandscapeMatrix positions={landscapePositions} axes={landscapeAxes} />
              </div>
            )}
            {competitors.length > 0 && (
              <div>
                <Label>Competitor audit</Label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {competitors.map((comp) => (
                    <Card key={comp.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold" style={{ color: INK }}>{comp.name || 'Unnamed'}</span>
                        <span className="text-[10px] font-medium" style={{ color: MUTED }}>
                          Visual {comp.visualIdentity}/10 · Engagement {comp.engagement}/10
                        </span>
                      </div>
                      {comp.contentThemes && <p className="text-xs leading-snug" style={{ color: MUTED }}>Themes: {comp.contentThemes}</p>}
                      {comp.tone && <p className="text-xs leading-snug mt-0.5" style={{ color: MUTED }}>Tone: {comp.tone}</p>}
                      {comp.gaps && (
                        <p className="text-xs leading-snug mt-1.5 font-medium" style={{ color: WARM }}>Opening: {comp.gaps}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Identity ── */}
        {hasIdentity && (
          <Section index={nextIndex()} title="Identity">
            {(weAre.length > 0 || weAreNot.length > 0) && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: `${BLUE}08`, border: `1px solid ${BLUE}15` }}>
                  <Label color={BLUE}>We are</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {weAre.map((v) => (
                      <span key={v.id} className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ backgroundColor: `${BLUE}12`, color: BLUE }}>
                        {v.word}
                      </span>
                    ))}
                    {weAre.length === 0 && <span className="text-xs" style={{ color: `${MUTED}70` }}>—</span>}
                  </div>
                </div>
                <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: `${CORAL}06`, border: `1px solid ${CORAL}12` }}>
                  <Label color={CORAL}>We are not</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {weAreNot.map((v) => (
                      <span key={v.id} className="rounded-full px-2.5 py-1 text-[11px] font-medium line-through" style={{ backgroundColor: `${CORAL}0E`, color: `${CORAL}CC` }}>
                        {v.word}
                      </span>
                    ))}
                    {weAreNot.length === 0 && <span className="text-xs" style={{ color: `${MUTED}70` }}>—</span>}
                  </div>
                </div>
              </div>
            )}

            {guardrails.length > 0 && (
              <div className="mb-5">
                <Label>Voice guardrails</Label>
                <div className="space-y-1.5">
                  {guardrails.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 rounded-lg px-4 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span className="text-[13px] font-medium" style={{ color: BLUE }}>{g.positive}</span>
                      <span className="text-[11px] uppercase tracking-wider shrink-0" style={{ color: `${INK}30` }}>but never</span>
                      <span className="text-[13px] font-medium" style={{ color: CORAL }}>{g.negative}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sliders.length > 0 && (
              <div className="mb-5">
                <Label>Personality</Label>
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {sliders.map((s) => (
                    <div key={s.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.value <= 50 ? INK : `${INK}40` }}>{s.leftLabel}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.value > 50 ? INK : `${INK}40` }}>{s.rightLabel}</span>
                      </div>
                      <div className="relative h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                        <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full" style={{ left: `calc(${s.value}% - 7px)`, backgroundColor: BLUE, boxShadow: `0 0 0 3px ${BLUE}20` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tone.length > 0 && tone.some((t) => t.value !== 5) && (
              <div>
                <Label>Tone of voice</Label>
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {tone.map((t) => (
                    <div key={t.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.value <= 5 ? INK : `${INK}40` }}>{t.leftLabel}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.value > 5 ? INK : `${INK}40` }}>{t.rightLabel}</span>
                      </div>
                      <div className="relative h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                        <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full" style={{ left: `calc(${(t.value - 1) / 9 * 100}% - 7px)`, backgroundColor: SKY, boxShadow: `0 0 0 3px ${SKY}20` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Application ── */}
        {(pillars.length > 0 || platforms.length > 0 || videoStyles.length > 0 || campaignIdeas.length > 0) && (
          <Section index={nextIndex()} title="Application">
            {pillars.length > 0 && (
              <div className="mb-6">
                <Label>Content pillars</Label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {pillars.map((pillar) => {
                    const total = pillar.businessAlignment + pillar.audienceInterest + pillar.credibility + pillar.sustainability
                    return (
                      <Card key={pillar.id}>
                        <div className="flex items-center justify-between mb-1.5 gap-3">
                          <span className="text-sm font-semibold" style={{ color: INK }}>{pillar.name || 'Untitled'}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="h-1.5 w-14 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                              <div className="h-full rounded-full" style={{ width: `${(total / 20) * 100}%`, backgroundColor: total >= 14 ? BLUE : total >= 10 ? SKY : WARM }} />
                            </div>
                            <span className="text-[11px] font-bold" style={{ color: total >= 14 ? BLUE : total >= 10 ? SKY : WARM }}>{total}/20</span>
                          </div>
                        </div>
                        {pillar.description && <p className="text-xs leading-relaxed mb-2" style={{ color: MUTED }}>{pillar.description}</p>}
                        {pillar.contentIdeas.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {pillar.contentIdeas.map((idea, i) => (
                              <span key={i} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: `${INK}90` }}>
                                {idea}
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {platforms.length > 0 && (
              <div className="mb-6">
                <Label>Platform strategy</Label>
                <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(0,0,0,0.025)' }}>
                        {['Platform', 'Role', 'Frequency', 'Call'].map((h) => (
                          <th key={h} className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {platforms.map((p) => {
                        const priorityColors: Record<string, string> = { kill: CORAL, keep: MUTED, invest: BLUE }
                        return (
                          <tr key={p.id} style={{ borderTop: '1px solid rgba(0,0,0,0.04)', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                            <td className="px-3.5 py-2.5 font-semibold" style={{ color: INK }}>{p.platform}</td>
                            <td className="px-3.5 py-2.5" style={{ color: MUTED }}>{p.role || '—'}</td>
                            <td className="px-3.5 py-2.5" style={{ color: MUTED }}>{p.frequency || '—'}</td>
                            <td className="px-3.5 py-2.5">
                              {p.priority ? (
                                <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: `${priorityColors[p.priority]}14`, color: priorityColors[p.priority] }}>
                                  {p.priority}
                                </span>
                              ) : <span style={{ color: `${MUTED}60` }}>—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {videoStyles.length > 0 && (
              <div className="mb-6">
                <Label>Video direction</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {videoStyles.map((style) => (
                    <div key={style.id} className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span className="text-[11.5px] leading-tight" style={{ color: `${INK}C0` }}>{style.style}</span>
                      <div className="ml-auto flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <div key={v} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: v <= style.rating ? SKY : 'rgba(0,0,0,0.08)' }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {campaignIdeas.length > 0 && (
              <div>
                <Label>Campaign ideas</Label>
                <div className="space-y-1.5">
                  {campaignIdeas.map((idea, i) => (
                    <div key={idea.id} className="flex items-start gap-3 rounded-lg px-4 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span className="shrink-0 mt-0.5 text-[10px] font-bold rounded-md px-1.5 py-0.5" style={{ backgroundColor: i === 0 ? `${BLUE}12` : 'rgba(0,0,0,0.04)', color: i === 0 ? BLUE : MUTED }}>
                        {idea.votes} {idea.votes === 1 ? 'vote' : 'votes'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] leading-snug" style={{ color: `${INK}D0` }}>{idea.concept}</p>
                        {(idea.platform || idea.format) && (
                          <p className="text-[11px] mt-0.5" style={{ color: `${MUTED}B0` }}>
                            {[idea.platform, idea.format].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Logistics ── */}
        {hasLogistics && logistics && (
          <Section index={nextIndex()} title="Logistics">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {logistics.socialGoal && (
                <Card><Label color={BLUE}>Goal</Label><p className="text-[13px] leading-relaxed" style={{ color: `${INK}C0` }}>{logistics.socialGoal}</p></Card>
              )}
              {logistics.postingVolume && (
                <Card><Label>Posting volume</Label><p className="text-[13px]" style={{ color: `${INK}C0` }}>{logistics.postingVolume}</p></Card>
              )}
              {(logistics.videoPercentage || logistics.carouselPercentage) && (
                <Card>
                  <Label>Format mix</Label>
                  <p className="text-[13px]" style={{ color: `${INK}C0` }}>
                    {[logistics.videoPercentage && `${logistics.videoPercentage} video`, logistics.carouselPercentage && `${logistics.carouselPercentage} carousel`, logistics.otherFormats].filter(Boolean).join(' · ')}
                  </p>
                </Card>
              )}
              {logistics.shootFrequency && (
                <Card><Label>Shoot cadence</Label><p className="text-[13px]" style={{ color: `${INK}C0` }}>{logistics.shootFrequency}</p></Card>
              )}
              {(logistics.metaAdsBudget || logistics.metaAdsGoal) && (
                <Card>
                  <Label>Meta ads</Label>
                  <p className="text-[13px]" style={{ color: `${INK}C0` }}>
                    {[logistics.metaAdsBudget, logistics.metaAdsGoal].filter(Boolean).join(' · ')}
                  </p>
                  {logistics.metaAdsNotes && <p className="text-[11px] mt-1" style={{ color: MUTED }}>{logistics.metaAdsNotes}</p>}
                </Card>
              )}
              {logistics.pointOfContact && (
                <Card>
                  <Label>Point of contact</Label>
                  <p className="text-[13px]" style={{ color: `${INK}C0` }}>
                    {[logistics.pointOfContact, logistics.contactPlatform, logistics.contactAvailability].filter(Boolean).join(' · ')}
                  </p>
                </Card>
              )}
            </div>
            {logistics.onCameraPeople.length > 0 && (
              <div className="mt-3">
                <Label>On camera</Label>
                <div className="flex flex-wrap gap-2">
                  {logistics.onCameraPeople.map((person) => (
                    <span key={person.id} className="rounded-full px-3 py-1.5 text-[11.5px]" style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.05)', color: `${INK}C0` }}>
                      <span className="font-semibold">{person.name}</span>
                      {person.role && <span style={{ color: MUTED }}> · {person.role}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {logistics.notes && (
              <p className="mt-3 text-[12.5px] leading-relaxed rounded-xl px-4 py-3" style={{ color: MUTED, backgroundColor: 'rgba(0,0,0,0.02)' }}>{logistics.notes}</p>
            )}
          </Section>
        )}

        {/* ── Priorities ── */}
        {priorities.length > 0 && (
          <Section index={nextIndex()} title="Priorities">
            <div className="space-y-2">
              {priorities.map((priority, idx) => (
                <div key={priority.id} className="flex items-center gap-4 rounded-xl px-5 py-3.5 break-inside-avoid" style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: idx === 0 ? BLUE : idx === 1 ? SKY : '#8A97A5' }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] leading-snug" style={{ color: INK }}>{priority.description || 'No description'}</p>
                    {(priority.owner || priority.deadline) && (
                      <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>
                        {[priority.owner && `Owner: ${priority.owner}`, priority.deadline && `Due: ${priority.deadline}`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] font-medium" style={{ color: `${MUTED}90` }}>
                    {priority.votes} {priority.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="mt-14 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <span className="text-[10px] tracking-[0.2em] font-bold" style={{ color: `${INK}30` }}>DWNLD®</span>
        <span className="text-[10px]" style={{ color: `${MUTED}90` }}>
          Workshop summary · {config.clientName} · {fmtDate(config.date)}
        </span>
      </footer>
    </div>
  )
}
