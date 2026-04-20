'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { useWorkshopStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Audience, EmpathyMap } from '@/lib/types'

type TabId = 'audiences' | 'empathy' | 'before-after'

const TABS: { id: TabId; label: string }[] = [
  { id: 'audiences', label: 'Top 3 Audiences' },
  { id: 'empathy', label: 'Empathy Map' },
  { id: 'before-after', label: 'Before / After' },
]

const RANK_COLORS: Record<number, string> = {
  1: '#2E5E8C',
  2: '#4A8AC2',
  3: '#E8855A',
}

// ──────────────────────────────────────────────
// Exercise A: Top 3 Audiences
// ──────────────────────────────────────────────

function AudienceExercise() {
  const { audiences, addAudience, updateAudience, removeAudience } = useWorkshopStore()

  const handleAdd = useCallback(() => {
    if (audiences.length >= 5) return
    const newAudience: Audience = {
      id: `aud-${Date.now()}`,
      name: '',
      description: '',
      platformBehavior: '',
      rank: audiences.length + 1,
    }
    addAudience(newAudience)
  }, [audiences.length, addAudience])

  const handleMoveUp = useCallback(
    (id: string) => {
      const idx = audiences.findIndex((a) => a.id === id)
      if (idx <= 0) return
      const swapTarget = audiences[idx - 1]
      updateAudience(id, { rank: swapTarget.rank })
      updateAudience(swapTarget.id, { rank: audiences[idx].rank })
    },
    [audiences, updateAudience]
  )

  const handleMoveDown = useCallback(
    (id: string) => {
      const idx = audiences.findIndex((a) => a.id === id)
      if (idx >= audiences.length - 1) return
      const swapTarget = audiences[idx + 1]
      updateAudience(id, { rank: swapTarget.rank })
      updateAudience(swapTarget.id, { rank: audiences[idx].rank })
    },
    [audiences, updateAudience]
  )

  const sorted = [...audiences].sort((a, b) => a.rank - b.rank)

  return (
    <div>
      <div className="mb-6">
        <h3 className="title-caps-md text-ink mb-2">Who are your top audiences?</h3>
        <p className="text-sm text-[#2E2E2E]">
          Define and rank your most important audience segments. Use the arrows to reorder by priority.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <AnimatePresence mode="popLayout">
          {sorted.map((audience, idx) => {
            const rankColor = RANK_COLORS[idx + 1] || '#8A8A8A'
            return (
              <motion.div
                key={audience.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="group liquid-glass rounded-2xl p-4"
              >
                <div className="flex gap-4">
                  {/* Rank + reorder controls */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => handleMoveUp(audience.id)}
                      disabled={idx === 0}
                      className="rounded-md p-0.5 text-ink/25 transition-colors hover:bg-white/20 hover:text-ink/50 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-ink/25"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all"
                      style={{
                        backgroundColor: `${rankColor}12`,
                        color: rankColor,
                        border: `1px solid ${rankColor}30`,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <button
                      onClick={() => handleMoveDown(audience.id)}
                      disabled={idx === sorted.length - 1}
                      className="rounded-md p-0.5 text-ink/25 transition-colors hover:bg-white/20 hover:text-ink/50 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-ink/25"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-3">
                    <Input
                      value={audience.name}
                      onChange={(e) => updateAudience(audience.id, { name: e.target.value })}
                      placeholder="Audience name (e.g., Growth-stage founders)"
                      className="h-10 border-white/30 bg-white/20 text-ink font-medium placeholder:text-ink/35"
                    />
                    <Textarea
                      value={audience.description}
                      onChange={(e) => updateAudience(audience.id, { description: e.target.value })}
                      placeholder="Who are they? What do they care about?"
                      className="min-h-[60px] border-white/30 bg-white/15 text-ink placeholder:text-ink/35 resize-none"
                    />
                    <Input
                      value={audience.platformBehavior}
                      onChange={(e) =>
                        updateAudience(audience.id, { platformBehavior: e.target.value })
                      }
                      placeholder="Platform behavior (e.g., Scrolls LinkedIn at 7am, saves Reels)"
                      className="h-10 border-white/30 bg-white/20 text-ink placeholder:text-ink/35"
                    />
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeAudience(audience.id)}
                    className="self-start rounded-lg p-1.5 text-ink/15 transition-colors hover:bg-coral/10 hover:text-coral"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {audiences.length < 5 && (
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <button
            onClick={handleAdd}
            className="w-full rounded-2xl border border-dashed border-white/25 bg-white/8 py-3 transition-all hover:border-white/40 hover:bg-white/12"
          >
            <span className="title-caps-sm text-ink/40">+ ADD AUDIENCE</span>
          </button>
        </motion.div>
      )}

      {audiences.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center gap-3 py-12 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 border border-white/25">
            <span className="text-ink/20 text-lg font-bold">?</span>
          </div>
          <p className="text-sm text-ink/40">No audiences yet</p>
          <p className="text-xs text-ink/25">Add your first audience segment to get started</p>
        </motion.div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Exercise B: Empathy Map
// ──────────────────────────────────────────────

const QUADRANTS = [
  { key: 'says' as const, label: 'Says', color: 'rgba(46,94,140,0.08)', borderColor: 'rgba(46,94,140,0.15)', textColor: '#2E5E8C' },
  { key: 'thinks' as const, label: 'Thinks', color: 'rgba(74,138,194,0.08)', borderColor: 'rgba(74,138,194,0.15)', textColor: '#4A8AC2' },
  { key: 'feels' as const, label: 'Feels', color: 'rgba(232,133,90,0.08)', borderColor: 'rgba(232,133,90,0.15)', textColor: '#E8855A' },
  { key: 'does' as const, label: 'Does', color: 'rgba(126,184,224,0.08)', borderColor: 'rgba(126,184,224,0.15)', textColor: '#7EB8E0' },
] as const

function EmpathyExercise() {
  const { audiences, empathyMaps, setEmpathyMap } = useWorkshopStore()
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>('')
  const [inputs, setInputs] = useState<Record<string, string>>({
    says: '',
    thinks: '',
    feels: '',
    does: '',
  })
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const currentMap: EmpathyMap | undefined = empathyMaps.find(
    (m) => m.audienceId === selectedAudienceId
  )

  const getMapData = useCallback((): EmpathyMap => {
    return (
      currentMap || {
        audienceId: selectedAudienceId,
        says: [],
        thinks: [],
        feels: [],
        does: [],
      }
    )
  }, [currentMap, selectedAudienceId])

  const handleAddItem = useCallback(
    (quadrant: 'says' | 'thinks' | 'feels' | 'does') => {
      const value = inputs[quadrant]?.trim()
      if (!value || !selectedAudienceId) return
      const map = getMapData()
      setEmpathyMap({
        ...map,
        [quadrant]: [...map[quadrant], value],
      })
      setInputs((prev) => ({ ...prev, [quadrant]: '' }))
      inputRefs.current[quadrant]?.focus()
    },
    [inputs, selectedAudienceId, getMapData, setEmpathyMap]
  )

  const handleRemoveItem = useCallback(
    (quadrant: 'says' | 'thinks' | 'feels' | 'does', index: number) => {
      const map = getMapData()
      setEmpathyMap({
        ...map,
        [quadrant]: map[quadrant].filter((_, i) => i !== index),
      })
    },
    [getMapData, setEmpathyMap]
  )

  if (audiences.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 border border-white/25">
          <span className="text-ink/20 text-lg font-bold">?</span>
        </div>
        <p className="text-sm text-ink/40">Add audiences first</p>
        <p className="text-xs text-ink/25">
          Create audience segments in the Top 3 Audiences tab to map empathy
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="title-caps-md text-ink mb-2">Empathy Map</h3>
        <p className="text-sm text-[#2E2E2E]">
          Step into your audience&#39;s shoes. What do they say, think, feel, and do?
        </p>
      </div>

      {/* Audience selector */}
      <div className="mb-6">
        <label className="title-caps-sm mb-2 block text-ink/40">
          Select Audience
        </label>
        <div className="flex flex-wrap gap-2">
          {audiences.map((aud) => {
            const isSelected = selectedAudienceId === aud.id
            const hasMap = empathyMaps.some((m) => m.audienceId === aud.id)
            return (
              <motion.button
                key={aud.id}
                onClick={() => setSelectedAudienceId(aud.id)}
                className="relative rounded-xl px-3.5 py-2 text-sm font-medium transition-all border"
                style={{
                  borderColor: isSelected ? 'rgba(74,138,194,0.35)' : 'rgba(255,255,255,0.3)',
                  backgroundColor: isSelected ? 'rgba(74,138,194,0.1)' : 'rgba(255,255,255,0.15)',
                  color: isSelected ? '#2E5E8C' : '#1A1A1A',
                  backdropFilter: 'blur(12px)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {aud.name || 'Unnamed'}
                {hasMap && (
                  <span
                    className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#4A8AC2' }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* 2x2 Grid */}
      {selectedAudienceId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUADRANTS.map((q) => {
            const items = currentMap?.[q.key] || []
            return (
              <motion.div
                key={q.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border p-4 backdrop-blur-xl"
                style={{
                  borderColor: q.borderColor,
                  backgroundColor: q.color,
                }}
              >
                {/* Quadrant header */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="title-caps-sm"
                    style={{ color: q.textColor }}
                  >
                    {q.label}
                  </span>
                  <span className="ml-auto text-[10px] text-ink/25">{items.length}</span>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-1.5 mb-3 min-h-[40px]">
                  <AnimatePresence>
                    {items.map((item, i) => (
                      <motion.span
                        key={`${q.key}-${i}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="group/chip inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm bg-white/30 text-ink border-white/40"
                      >
                        {item}
                        <button
                          onClick={() => handleRemoveItem(q.key, i)}
                          className="rounded-sm p-0.5 opacity-0 transition-opacity group-hover/chip:opacity-100 hover:bg-white/30"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add item input */}
                <div className="flex gap-1.5">
                  <Input
                    ref={(el) => {
                      inputRefs.current[q.key] = el
                    }}
                    value={inputs[q.key]}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [q.key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddItem(q.key)
                      }
                    }}
                    placeholder={`Add what they ${q.key.toLowerCase()}...`}
                    className="h-9 text-sm border-white/30 bg-white/20 text-ink placeholder:text-ink/35"
                  />
                  <button
                    onClick={() => handleAddItem(q.key)}
                    disabled={!inputs[q.key]?.trim()}
                    className="title-caps-sm text-ink/40 hover:text-ink transition-colors disabled:opacity-30 shrink-0 px-1.5"
                  >
                    + ADD
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl p-8 text-center">
          <p className="text-sm text-ink/40">Select an audience above to start mapping</p>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Exercise C: Before / After
// ──────────────────────────────────────────────

function BeforeAfterExercise() {
  const { beforeAfter, setBeforeAfter } = useWorkshopStore()
  const [beforeInput, setBeforeInput] = useState('')
  const [afterInput, setAfterInput] = useState('')
  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef = useRef<HTMLInputElement>(null)

  const handleAddBefore = useCallback(() => {
    const trimmed = beforeInput.trim()
    if (!trimmed) return
    setBeforeAfter({ before: [...beforeAfter.before, trimmed] })
    setBeforeInput('')
    beforeRef.current?.focus()
  }, [beforeInput, beforeAfter.before, setBeforeAfter])

  const handleAddAfter = useCallback(() => {
    const trimmed = afterInput.trim()
    if (!trimmed) return
    setBeforeAfter({ after: [...beforeAfter.after, trimmed] })
    setAfterInput('')
    afterRef.current?.focus()
  }, [afterInput, beforeAfter.after, setBeforeAfter])

  const handleRemoveBefore = useCallback(
    (index: number) => {
      setBeforeAfter({ before: beforeAfter.before.filter((_, i) => i !== index) })
    },
    [beforeAfter.before, setBeforeAfter]
  )

  const handleRemoveAfter = useCallback(
    (index: number) => {
      setBeforeAfter({ after: beforeAfter.after.filter((_, i) => i !== index) })
    },
    [beforeAfter.after, setBeforeAfter]
  )

  return (
    <div>
      <div className="mb-6">
        <h3 className="title-caps-md text-ink mb-2">Before / After</h3>
        <p className="text-sm text-[#2E2E2E]">
          Map the emotional transformation. How do users feel before and after engaging with your
          brand?
        </p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* BEFORE column */}
        <div
          className="rounded-2xl border p-5 backdrop-blur-xl"
          style={{
            borderColor: 'rgba(232,133,90,0.15)',
            backgroundColor: 'rgba(232,133,90,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#E8855A' }}
            />
            <span className="title-caps-sm" style={{ color: '#E8855A' }}>
              Before
            </span>
            <span className="ml-auto text-[10px] text-ink/25">{beforeAfter.before.length}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 min-h-[48px]">
            <AnimatePresence>
              {beforeAfter.before.map((item, i) => (
                <motion.span
                  key={`before-${i}`}
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group/tag inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium bg-white/30 text-ink border-white/40"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveBefore(i)}
                    className="rounded-sm p-0.5 opacity-0 transition-opacity group-hover/tag:opacity-100 hover:bg-white/30"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="flex gap-1.5">
            <Input
              ref={beforeRef}
              value={beforeInput}
              onChange={(e) => setBeforeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddBefore()
                }
              }}
              placeholder="Frustrated, confused, overwhelmed..."
              className="h-9 text-sm border-white/30 bg-white/20 text-ink placeholder:text-ink/35"
            />
            <button
              onClick={handleAddBefore}
              disabled={!beforeInput.trim()}
              className="title-caps-sm text-ink/40 hover:text-ink transition-colors disabled:opacity-30 shrink-0 px-1.5"
            >
              + ADD
            </button>
          </div>
        </div>

        {/* AFTER column */}
        <div
          className="rounded-2xl border p-5 backdrop-blur-xl"
          style={{
            borderColor: 'rgba(74,138,194,0.15)',
            backgroundColor: 'rgba(74,138,194,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#4A8AC2' }}
            />
            <span className="title-caps-sm" style={{ color: '#4A8AC2' }}>
              After
            </span>
            <span className="ml-auto text-[10px] text-ink/25">{beforeAfter.after.length}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 min-h-[48px]">
            <AnimatePresence>
              {beforeAfter.after.map((item, i) => (
                <motion.span
                  key={`after-${i}`}
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group/tag inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium bg-white/30 text-ink border-white/40"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveAfter(i)}
                    className="rounded-sm p-0.5 opacity-0 transition-opacity group-hover/tag:opacity-100 hover:bg-white/30"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="flex gap-1.5">
            <Input
              ref={afterRef}
              value={afterInput}
              onChange={(e) => setAfterInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddAfter()
                }
              }}
              placeholder="Confident, clear, empowered..."
              className="h-9 text-sm border-white/30 bg-white/20 text-ink placeholder:text-ink/35"
            />
            <button
              onClick={handleAddAfter}
              disabled={!afterInput.trim()}
              className="title-caps-sm text-ink/40 hover:text-ink transition-colors disabled:opacity-30 shrink-0 px-1.5"
            >
              + ADD
            </button>
          </div>
        </div>
      </div>

      {/* Synthesis statement */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="mb-4">
          <h4 className="title-caps-sm text-ink mb-2">Synthesis</h4>
          <p className="text-xs text-ink-muted">
            Combine your insights into a single transformation statement.
          </p>
        </div>

        {/* Template hint */}
        <div className="mb-3 rounded-xl bg-white/10 border border-white/20 px-4 py-3">
          <p className="text-xs text-ink/35 italic leading-relaxed">
            Users feel{' '}
            <span style={{ color: '#E8855A', opacity: 0.6 }}>___</span>
            . Our brand helps them feel{' '}
            <span style={{ color: '#4A8AC2', opacity: 0.6 }}>___</span>
            , so they can{' '}
            <span style={{ color: '#2E5E8C', opacity: 0.6 }}>___</span>.
          </p>
        </div>

        <Textarea
          value={beforeAfter.statement}
          onChange={(e) => setBeforeAfter({ statement: e.target.value })}
          placeholder="Users feel frustrated and overwhelmed by options. Our brand helps them feel confident and clear, so they can make bold decisions without second-guessing."
          className="min-h-[100px] border-white/30 bg-white/15 text-ink placeholder:text-ink/20 resize-none"
        />
      </motion.div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Main Audience Page
// ──────────────────────────────────────────────

export default function AudiencePage() {
  const [activeTab, setActiveTab] = useState<TabId>('audiences')

  return (
    <div className="mx-auto max-w-4xl py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <span className="title-caps-sm mb-4 block text-sky-deep/50">
          PHASE 02
        </span>
        <h1 className="title-caps-lg text-ink">
          Audience
        </h1>
        <p className="mt-4 text-base text-[#2E2E2E]">
          Understand who you serve, what they feel, and how your brand transforms their
          experience.
        </p>
        <div className="mt-8 h-px w-full bg-ink/[0.06]" />
      </motion.div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-1 rounded-2xl liquid-glass p-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? '#1A1A1A' : '#6A7A8A',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="audience-tab-bg"
                    className="absolute inset-0 rounded-xl bg-white/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'audiences' && <AudienceExercise />}
          {activeTab === 'empathy' && <EmpathyExercise />}
          {activeTab === 'before-after' && <BeforeAfterExercise />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
