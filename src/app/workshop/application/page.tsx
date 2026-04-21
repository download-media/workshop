'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, ChevronUp } from 'lucide-react'
import { useWorkshopStore } from '@/lib/store'
import { PhaseHeader } from '@/components/workshop/PhaseHeader'
import { ExerciseCard } from '@/components/workshop/ExerciseCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { ContentPillar, CampaignIdea, PlatformStrategy } from '@/lib/types'

/* ────────────────────────────────────────────────────────────
   Tab Navigation
   ──────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'pillars', label: 'Content Pillars' },
  { id: 'platform', label: 'Platform Strategy' },
  { id: 'video', label: 'Video Style' },
  { id: 'campaign', label: 'Campaign Ideation' },
] as const

type TabId = (typeof TABS)[number]['id']

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function scoreColor(total: number) {
  if (total >= 12) return '#2E5E8C'
  if (total >= 8) return '#E8855A'
  return '#E85A5A'
}

const SCAMPER = [
  { letter: 'S', word: 'Substitute', question: 'What can you substitute in your content?', color: '#2E5E8C' },
  { letter: 'C', word: 'Combine', question: 'What ideas or formats can you combine?', color: '#4A8AC2' },
  { letter: 'A', word: 'Adapt', question: 'What can you adapt from other industries?', color: '#E8855A' },
  { letter: 'M', word: 'Modify', question: 'What can you magnify or minimize?', color: '#E85A5A' },
  { letter: 'P', word: 'Put to other uses', question: 'How else can this content be used?', color: '#7EB8E0' },
  { letter: 'E', word: 'Eliminate', question: 'What can you remove or simplify?', color: '#B8D4E8' },
  { letter: 'R', word: 'Reverse', question: 'What if you did the opposite?', color: '#2E5E8C' },
]

/* ────────────────────────────────────────────────────────────
   Content Pillars Tab
   ──────────────────────────────────────────────────────────── */

function ContentPillarsTab() {
  const { contentPillars, addContentPillar, updateContentPillar, removeContentPillar } = useWorkshopStore()
  const [ideaInputs, setIdeaInputs] = useState<Record<string, string>>({})

  const handleAdd = () => {
    addContentPillar({
      id: uid(),
      name: '',
      description: '',
      businessAlignment: 3,
      audienceInterest: 3,
      credibility: 3,
      sustainability: 3,
      contentIdeas: [],
    })
  }

  const handleAddIdea = (pillarId: string) => {
    const text = (ideaInputs[pillarId] || '').trim()
    if (!text) return
    const pillar = contentPillars.find((p) => p.id === pillarId)
    if (!pillar) return
    updateContentPillar(pillarId, { contentIdeas: [...pillar.contentIdeas, text] })
    setIdeaInputs((prev) => ({ ...prev, [pillarId]: '' }))
  }

  const handleRemoveIdea = (pillarId: string, idx: number) => {
    const pillar = contentPillars.find((p) => p.id === pillarId)
    if (!pillar) return
    updateContentPillar(pillarId, {
      contentIdeas: pillar.contentIdeas.filter((_, i) => i !== idx),
    })
  }

  const sliderFields = [
    { key: 'businessAlignment' as const, label: 'Business Alignment' },
    { key: 'audienceInterest' as const, label: 'Audience Interest' },
    { key: 'credibility' as const, label: 'Credibility' },
    { key: 'sustainability' as const, label: 'Sustainability' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm" style={{ color: '#6A7A8A' }}>
          Define your core content themes and score them for strategic fit.
        </p>
        <Button onClick={handleAdd} size="sm" className="gap-1.5 bg-[#2E5E8C] text-white hover:bg-[#2E5E8C]/90">
          <Plus className="h-3.5 w-3.5" />
          Add Pillar
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {contentPillars.map((pillar) => {
            const total =
              pillar.businessAlignment +
              pillar.audienceInterest +
              pillar.credibility +
              pillar.sustainability
            const color = scoreColor(total)

            return (
              <motion.div
                key={pillar.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="liquid-glass rounded-2xl p-5"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Pillar name"
                      value={pillar.name}
                      onChange={(e) => updateContentPillar(pillar.id, { name: e.target.value })}
                      className="text-sm font-semibold"
                    />
                    <Textarea
                      placeholder="Brief description..."
                      value={pillar.description}
                      onChange={(e) => updateContentPillar(pillar.id, { description: e.target.value })}
                      className="min-h-12 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeContentPillar(pillar.id)}
                    className="mt-1 rounded-lg p-1.5 transition-colors hover:bg-[#E85A5A]/10"
                    style={{ color: '#6A7A8A' }}
                    aria-label="Remove pillar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Scoring Segments */}
                <div className="space-y-3">
                  {sliderFields.map((field) => (
                    <div key={field.key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#6A7A8A' }}>{field.label}</span>
                        <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>
                          {pillar[field.key]}/5
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => updateContentPillar(pillar.id, { [field.key]: val })}
                            className="h-2 flex-1 rounded-full transition-all"
                            style={{
                              backgroundColor:
                                val <= pillar[field.key]
                                  ? '#4A8AC2'
                                  : 'rgba(0,0,0,0.06)',
                            }}
                            aria-label={`${field.label} ${val} of 5`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Score */}
                <div className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      border: `1px solid ${color}25`,
                    }}
                  >
                    {total}
                  </div>
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#1A1A1A' }}>
                      Total Score
                    </div>
                    <div className="text-xs" style={{ color: '#6A7A8A' }}>out of 20</div>
                  </div>
                  <div className="ml-auto">
                    <div
                      className="h-2 w-24 overflow-hidden rounded-full"
                      style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#4A8AC2' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(total / 20) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content Ideas */}
                <div className="mt-4">
                  <div className="mb-2 text-xs font-medium" style={{ color: '#6A7A8A' }}>
                    Content Ideas
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {pillar.contentIdeas.map((idea, idx) => (
                        <motion.span
                          key={`${idea}-${idx}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="inline-flex items-center gap-1 rounded-full bg-white/30 border border-white/40 px-2.5 py-1 text-xs"
                          style={{ color: '#1A1A1A' }}
                        >
                          {idea}
                          <button
                            onClick={() => handleRemoveIdea(pillar.id, idx)}
                            className="ml-0.5 transition-colors hover:text-[#E85A5A]"
                            style={{ color: '#6A7A8A' }}
                            aria-label={`Remove idea: ${idea}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an idea..."
                      value={ideaInputs[pillar.id] || ''}
                      onChange={(e) =>
                        setIdeaInputs((prev) => ({ ...prev, [pillar.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddIdea(pillar.id)
                        }
                      }}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddIdea(pillar.id)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {contentPillars.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <p className="text-sm" style={{ color: '#6A7A8A' }}>No pillars yet</p>
          <p className="mt-1 text-xs" style={{ color: '#6A7A8A' }}>
            Click &quot;Add Pillar&quot; to define your first content theme
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Platform Strategy Tab
   ──────────────────────────────────────────────────────────── */

function PlatformStrategyTab() {
  const { platformStrategies, updatePlatformStrategy } = useWorkshopStore()

  const fields = [
    { key: 'role' as const, label: 'Role', placeholder: 'e.g. Thought leadership' },
    { key: 'audience' as const, label: 'Audience', placeholder: 'e.g. B2B decision-makers' },
    { key: 'contentTypes' as const, label: 'Content Types', placeholder: 'e.g. Carousels, video' },
    { key: 'frequency' as const, label: 'Frequency', placeholder: 'e.g. 3x/week' },
  ]

  const priorityOptions: { value: PlatformStrategy['priority']; label: string; bg: string; text: string }[] = [
    { value: 'kill', label: 'KILL', bg: 'rgba(232,90,90,0.15)', text: '#E85A5A' },
    { value: 'keep', label: 'KEEP', bg: 'rgba(0,0,0,0.05)', text: '#6A7A8A' },
    { value: 'invest', label: 'INVEST', bg: 'rgba(46,94,140,0.15)', text: '#2E5E8C' },
  ]

  return (
    <div>
      <p className="mb-6 text-sm" style={{ color: '#6A7A8A' }}>
        Map each platform&#39;s purpose, audience, and investment priority.
      </p>

      {/* Desktop data grid */}
      <div className="hidden lg:block">
        <div className="liquid-glass overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr_150px] items-center border-b border-white/20">
            <div className="px-5 py-3.5 title-caps-sm" style={{ color: '#5A5A5A' }}>Platform</div>
            {fields.map((f) => (
              <div key={f.key} className="px-4 py-3.5 title-caps-sm" style={{ color: '#5A5A5A' }}>{f.label}</div>
            ))}
            <div className="px-4 py-3.5 title-caps-sm text-center" style={{ color: '#5A5A5A' }}>Priority</div>
          </div>

          {/* Rows */}
          {platformStrategies.map((platform, idx) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="grid grid-cols-[120px_1fr_1fr_1fr_1fr_150px] items-center border-b border-white/10 last:border-b-0 transition-colors hover:bg-white/10"
            >
              <div className="px-5 py-3">
                <span className="title-caps-sm" style={{ color: '#1A1A1A' }}>{platform.platform}</span>
              </div>

              {fields.map((f) => (
                <div key={f.key} className="px-3 py-2">
                  <input
                    value={platform[f.key]}
                    onChange={(e) => updatePlatformStrategy(platform.id, { [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="h-9 w-full rounded-lg border border-transparent bg-transparent px-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/25 transition-colors focus:border-white/30 focus:bg-white/15 focus:outline-none"
                  />
                </div>
              ))}

              <div className="flex items-center justify-center gap-1 px-2 py-2">
                {priorityOptions.map((opt) => {
                  const isActive = platform.priority === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => updatePlatformStrategy(platform.id, { priority: isActive ? '' : opt.value })}
                      className="rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                      style={{
                        backgroundColor: isActive ? opt.bg : 'transparent',
                        color: isActive ? opt.text : '#8A8A8A',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 lg:hidden">
        {platformStrategies.map((platform, idx) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="liquid-glass rounded-2xl p-5"
          >
            <div className="mb-4">
              <span className="title-caps-sm" style={{ color: '#1A1A1A' }}>
                {platform.platform}
              </span>
            </div>

            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs" style={{ color: '#6A7A8A' }}>
                    {f.label}
                  </label>
                  <Input
                    value={platform[f.key]}
                    onChange={(e) => updatePlatformStrategy(platform.id, { [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs" style={{ color: '#6A7A8A' }}>Priority</label>
              <div className="flex gap-2">
                {priorityOptions.map((opt) => {
                  const isActive = platform.priority === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        updatePlatformStrategy(platform.id, {
                          priority: isActive ? '' : opt.value,
                        })
                      }
                      className="flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all"
                      style={{
                        backgroundColor: isActive ? opt.bg : 'rgba(0,0,0,0.03)',
                        color: isActive ? opt.text : '#8A8A8A',
                        border: `1px solid ${isActive ? `${opt.text}25` : 'rgba(0,0,0,0.04)'}`,
                      }}
                      aria-label={`Set ${platform.platform} priority to ${opt.label}`}
                      aria-pressed={isActive}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Video Style Tab
   ──────────────────────────────────────────────────────────── */

function VideoStyleTab() {
  const { videoStyles, updateVideoStyle } = useWorkshopStore()

  return (
    <div>
      <p className="mb-6 text-sm" style={{ color: '#6A7A8A' }}>
        Rate each video style based on how well it fits your brand.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videoStyles.map((style, idx) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="liquid-glass group rounded-2xl p-5 transition-colors hover:bg-white/30"
          >
            <div className="mb-4">
              <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                {style.style}
              </span>
            </div>

            {/* Rating dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((val) => {
                const isActive = val <= style.rating
                return (
                  <button
                    key={val}
                    onClick={() => updateVideoStyle(style.id, val === style.rating ? 0 : val)}
                    className="group/dot relative flex h-8 w-8 items-center justify-center"
                    aria-label={`Rate ${style.style} ${val} of 5`}
                  >
                    <motion.div
                      className="h-4 w-4 rounded-full transition-all"
                      animate={{
                        scale: isActive ? 1 : 0.75,
                        backgroundColor: isActive ? '#4A8AC2' : 'rgba(0,0,0,0.08)',
                      }}
                      whileHover={{ scale: 1.1 }}
                    />
                  </button>
                )
              })}
              <span className="ml-2 text-xs" style={{ color: '#6A7A8A' }}>
                {style.rating > 0 ? `${style.rating}/5` : '--'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Campaign Ideation Tab
   ──────────────────────────────────────────────────────────── */

function CampaignIdeationTab() {
  const { campaignIdeas, addCampaignIdea, updateCampaignIdea, removeCampaignIdea } =
    useWorkshopStore()

  const sortedIdeas = useMemo(
    () => [...campaignIdeas].sort((a, b) => b.votes - a.votes),
    [campaignIdeas]
  )

  const handleAdd = () => {
    addCampaignIdea({
      id: uid(),
      concept: '',
      platform: '',
      format: '',
      votes: 0,
    })
  }

  return (
    <div>
      {/* SCAMPER Framework */}
      <div className="mb-6 liquid-glass rounded-2xl p-5">
        <div className="mb-3">
          <span className="title-caps-sm" style={{ color: '#1A1A1A' }}>SCAMPER Framework</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCAMPER.map((item) => (
            <div
              key={item.letter}
              className="group/scamper relative"
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors cursor-default"
                style={{
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}20`,
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.letter}
                </span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>{item.word}</span>
              </div>
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg px-3 py-2 text-xs opacity-0 shadow-xl transition-opacity group-hover/scamper:opacity-100"
                style={{ backgroundColor: '#1A1A1A', color: '#ffffff' }}
              >
                {item.question}
                <div
                  className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent"
                  style={{ borderTopColor: '#1A1A1A' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm" style={{ color: '#6A7A8A' }}>
          Brainstorm campaign concepts and vote on the best ones.
        </p>
        <Button onClick={handleAdd} size="sm" className="gap-1.5 bg-[#2E5E8C] text-white hover:bg-[#2E5E8C]/90">
          <Plus className="h-3.5 w-3.5" />
          Add Idea
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {sortedIdeas.map((idea) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="liquid-glass rounded-2xl p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <Textarea
                  placeholder="Describe your campaign concept..."
                  value={idea.concept}
                  onChange={(e) => updateCampaignIdea(idea.id, { concept: e.target.value })}
                  className="min-h-16 text-sm"
                />
                <button
                  onClick={() => removeCampaignIdea(idea.id)}
                  className="mt-1 rounded-lg p-1.5 transition-colors hover:bg-[#E85A5A]/10"
                  style={{ color: '#6A7A8A' }}
                  aria-label="Remove idea"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: '#6A7A8A' }}>Platform</label>
                  <Input
                    placeholder="e.g. Instagram"
                    value={idea.platform}
                    onChange={(e) => updateCampaignIdea(idea.id, { platform: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: '#6A7A8A' }}>Format</label>
                  <Input
                    placeholder="e.g. Reel series"
                    value={idea.format}
                    onChange={(e) => updateCampaignIdea(idea.id, { format: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Vote counter */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateCampaignIdea(idea.id, { votes: idea.votes + 1 })}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all bg-white/30 border border-white/40 hover:bg-white/50"
                  aria-label={`Upvote idea, current votes: ${idea.votes}`}
                >
                  <ChevronUp className="h-4 w-4" style={{ color: '#4A8AC2' }} />
                  <span className="font-bold" style={{ color: '#1A1A1A' }}>{idea.votes}</span>
                </button>
                <span className="text-xs" style={{ color: '#6A7A8A' }}>
                  {idea.votes === 1 ? '1 vote' : `${idea.votes} votes`}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {campaignIdeas.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <p className="text-sm" style={{ color: '#6A7A8A' }}>No ideas yet</p>
          <p className="mt-1 text-xs" style={{ color: '#6A7A8A' }}>
            Use the SCAMPER framework above for inspiration
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────────────────────── */

export default function ApplicationPage() {
  const [activeTab, setActiveTab] = useState<TabId>('pillars')

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PhaseHeader
        number={5}
        title="Application"
        subtitle="What do we build"
        color="#4A8AC2"
      />

      {/* Tab navigation — liquid glass, no icons */}
      <div className="mb-8 flex gap-1 liquid-glass rounded-2xl p-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-colors"
              aria-selected={isActive}
              role="tab"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-white/40"
                  style={{ border: '1px solid rgba(255,255,255,0.5)' }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span
                className="relative z-10 title-caps-sm"
                style={{
                  color: isActive ? '#1A1A1A' : '#8A8A8A',
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <ExerciseCard
        title={TABS.find((t) => t.id === activeTab)!.label}
        description=""
      >
        <div>
          {activeTab === 'pillars' && <ContentPillarsTab />}
          {activeTab === 'platform' && <PlatformStrategyTab />}
          {activeTab === 'video' && <VideoStyleTab />}
          {activeTab === 'campaign' && <CampaignIdeationTab />}
        </div>
      </ExerciseCard>
    </div>
  )
}
