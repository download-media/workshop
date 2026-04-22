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
import type { ContentPillar, CampaignIdea } from '@/lib/types'

/* ────────────────────────────────────────────────────────────
   Tab Navigation
   ──────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'logistics', label: 'Logistics' },
  { id: 'pillars', label: 'Content Pillars' },
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

/* ────────────────────────────────────────────────────────────
   Logistics Tab
   ──────────────────────────────────────────────────────────── */

const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'X / Twitter', 'Facebook']

function LogisticsTab() {
  const { logistics, setLogistics, addOnCameraPerson, updateOnCameraPerson, removeOnCameraPerson } = useWorkshopStore()

  const handleAddPerson = () => {
    addOnCameraPerson({
      id: uid(),
      name: '',
      role: '',
      notes: '',
    })
  }

  const togglePlatform = (platform: string) => {
    const current = logistics.platforms
    if (current.includes(platform)) {
      setLogistics({ platforms: current.filter((p) => p !== platform) })
    } else {
      setLogistics({ platforms: [...current, platform] })
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* On Camera People */}
      <div>
        <h3 className="title-caps-md text-[#1A1A1A] mb-2">ON CAMERA</h3>
        <p className="text-sm text-[#2E2E2E] mb-6">Who from the client team will be on camera or featured in content?</p>

        <div className="flex flex-col gap-3 mb-4">
          {logistics.onCameraPeople.map((person) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass rounded-2xl p-5 group"
            >
              <div className="flex gap-4">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    value={person.name}
                    onChange={(e) => updateOnCameraPerson(person.id, { name: e.target.value })}
                    placeholder="Name"
                    className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
                  />
                  <Input
                    value={person.role}
                    onChange={(e) => updateOnCameraPerson(person.id, { role: e.target.value })}
                    placeholder="Role (e.g. Founder, Lead Designer)"
                    className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
                  />
                  <Input
                    value={person.notes}
                    onChange={(e) => updateOnCameraPerson(person.id, { notes: e.target.value })}
                    placeholder="Notes (e.g. comfortable on camera, prefers voiceover)"
                    className="h-10 col-span-2 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
                  />
                </div>
                <button
                  onClick={() => removeOnCameraPerson(person.id)}
                  className="self-start text-[#1A1A1A]/10 hover:text-[#E85A5A] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleAddPerson}
          className="w-full rounded-2xl border border-dashed border-white/25 bg-white/8 py-3 transition-all hover:border-white/40 hover:bg-white/12"
        >
          <span className="title-caps-sm text-[#1A1A1A]/40">+ ADD PERSON</span>
        </button>
      </div>

      {/* Platforms */}
      <div>
        <h3 className="title-caps-md text-[#1A1A1A] mb-2">PLATFORMS</h3>
        <p className="text-sm text-[#2E2E2E] mb-4">Which platforms are we posting on?</p>

        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((platform) => {
            const isActive = logistics.platforms.includes(platform)
            return (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`rounded-full px-5 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#1A1A1A]/25 hover:text-[#1A1A1A]/50 bg-white/10'
                }`}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {platform.toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Posting Volume & Format Split */}
      <div>
        <h3 className="title-caps-md text-[#1A1A1A] mb-2">VOLUME AND FORMAT</h3>
        <p className="text-sm text-[#2E2E2E] mb-6">Posting cadence and content format breakdown.</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="liquid-glass rounded-2xl p-5">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">POSTS PER WEEK</label>
            <Input
              value={logistics.postingVolume}
              onChange={(e) => setLogistics({ postingVolume: e.target.value })}
              placeholder="e.g. 5"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
          <div className="liquid-glass rounded-2xl p-5">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">SHOOT FREQUENCY</label>
            <Input
              value={logistics.shootFrequency}
              onChange={(e) => setLogistics({ shootFrequency: e.target.value })}
              placeholder="e.g. 6 hours per 3 months"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
          <div className="liquid-glass rounded-2xl p-5">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">VIDEO %</label>
            <Input
              value={logistics.videoPercentage}
              onChange={(e) => setLogistics({ videoPercentage: e.target.value })}
              placeholder="e.g. 60%"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
          <div className="liquid-glass rounded-2xl p-5">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">CAROUSEL %</label>
            <Input
              value={logistics.carouselPercentage}
              onChange={(e) => setLogistics({ carouselPercentage: e.target.value })}
              placeholder="e.g. 30%"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
          <div className="liquid-glass rounded-2xl p-5 col-span-2">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">OTHER FORMATS</label>
            <Input
              value={logistics.otherFormats}
              onChange={(e) => setLogistics({ otherFormats: e.target.value })}
              placeholder="e.g. Stories 10%, static posts, polls"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
        </div>
      </div>

      {/* Point of Contact */}
      <div>
        <h3 className="title-caps-md text-[#1A1A1A] mb-2">POINT OF CONTACT</h3>
        <p className="text-sm text-[#2E2E2E] mb-6">Who do we coordinate with on the client side?</p>

        <div className="grid grid-cols-3 gap-4">
          <div className="liquid-glass rounded-2xl p-5">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">NAME</label>
            <Input
              value={logistics.pointOfContact}
              onChange={(e) => setLogistics({ pointOfContact: e.target.value })}
              placeholder="e.g. Sarah Kim"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
          <div className="liquid-glass rounded-2xl p-5">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">PREFERRED PLATFORM</label>
            <Input
              value={logistics.contactPlatform}
              onChange={(e) => setLogistics({ contactPlatform: e.target.value })}
              placeholder="e.g. Slack, email, iMessage"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
          <div className="liquid-glass rounded-2xl p-5">
            <label className="title-caps-sm text-[#1A1A1A]/40 mb-2 block">AVAILABILITY</label>
            <Input
              value={logistics.contactAvailability}
              onChange={(e) => setLogistics({ contactAvailability: e.target.value })}
              placeholder="e.g. whenever, work hours only"
              className="h-10 bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="title-caps-md text-[#1A1A1A] mb-2">NOTES</h3>
        <Textarea
          value={logistics.notes}
          onChange={(e) => setLogistics({ notes: e.target.value })}
          placeholder="Any other logistics, constraints, or details..."
          className="min-h-[100px] bg-white/20 border-white/30 text-[#1A1A1A] placeholder:text-[#1A1A1A]/25 resize-none"
        />
      </div>
    </div>
  )
}

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
          {activeTab === 'logistics' && <LogisticsTab />}
          {activeTab === 'pillars' && <ContentPillarsTab />}
          {activeTab === 'video' && <VideoStyleTab />}
          {activeTab === 'campaign' && <CampaignIdeationTab />}
        </div>
      </ExerciseCard>
    </div>
  )
}
