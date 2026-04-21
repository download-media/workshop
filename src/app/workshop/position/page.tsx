'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useWorkshopStore } from '@/lib/store'
import type { Competitor, LandscapePosition } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2 } from 'lucide-react'
import Image from 'next/image'

// ─── Tab Toggle ──────────────────────────────────────
type ExerciseTab = 'audit' | 'landscape'

function TabToggle({
  active,
  onChange,
}: {
  active: ExerciseTab
  onChange: (t: ExerciseTab) => void
}) {
  const tabs: { id: ExerciseTab; label: string }[] = [
    { id: 'audit', label: 'Competitive Audit' },
    { id: 'landscape', label: 'Landscape Matrix' },
  ]

  return (
    <div className="flex rounded-xl liquid-glass-strong p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-5 py-2.5 rounded-lg title-caps-sm transition-colors ${
            active === tab.id
              ? 'text-[#1A1A1A]'
              : 'text-[#5A5A5A] hover:text-[#1A1A1A]'
          }`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="position-tab-bg"
              className="absolute inset-0 rounded-lg bg-white/45 border border-white/55"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Score Dots ──────────────────────────────────────
function ScoreDots({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="title-caps-sm text-[#6A7A8A]">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="group/dot relative size-7 flex items-center justify-center"
            aria-label={`Score ${n} of 5`}
          >
            <motion.div
              className={`size-5 rounded-full border-2 transition-colors ${
                n <= value
                  ? 'bg-[#4A8AC2] border-[#4A8AC2]'
                  : 'border-[rgba(0,0,0,0.08)] group-hover/dot:border-[rgba(0,0,0,0.16)] bg-[rgba(0,0,0,0.03)]'
              }`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Competitor Scorecard ────────────────────────────
function CompetitorCard({
  competitor,
  onUpdate,
  onRemove,
}: {
  competitor: Competitor
  onUpdate: (data: Partial<Competitor>) => void
  onRemove: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 flex flex-col gap-4 group relative shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)]"
    >
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 size-7 flex items-center justify-center rounded-lg text-[#6A7A8A] hover:text-[#E85A5A] hover:bg-[#E85A5A]/10 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Remove competitor"
      >
        <X className="size-4" />
      </button>

      <Input
        value={competitor.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Competitor name"
        className="text-base font-medium bg-white/30 border-white/30 text-[#1A1A1A] placeholder:text-[#6A7A8A]/50 focus-visible:border-[#4A8AC2]/40 h-10"
      />

      <Input
        value={competitor.platforms}
        onChange={(e) => onUpdate({ platforms: e.target.value })}
        placeholder="Platforms (e.g. Instagram, LinkedIn, TikTok)"
        className="bg-white/30 border-white/30 text-[#1A1A1A] placeholder:text-[#6A7A8A]/50 focus-visible:border-[#4A8AC2]/40"
      />

      <div className="flex flex-col gap-4">
        <ScoreDots
          value={competitor.visualIdentity}
          onChange={(v) => onUpdate({ visualIdentity: v })}
          label="Visual Identity"
        />
        <ScoreDots
          value={competitor.engagement}
          onChange={(v) => onUpdate({ engagement: v })}
          label="Engagement"
        />
      </div>

      <Input
        value={competitor.contentThemes}
        onChange={(e) => onUpdate({ contentThemes: e.target.value })}
        placeholder="Content themes"
        className="bg-white/30 border-white/30 text-[#1A1A1A] placeholder:text-[#6A7A8A]/50 focus-visible:border-[#4A8AC2]/40"
      />

      <Input
        value={competitor.tone}
        onChange={(e) => onUpdate({ tone: e.target.value })}
        placeholder="Tone of voice"
        className="bg-white/30 border-white/30 text-[#1A1A1A] placeholder:text-[#6A7A8A]/50 focus-visible:border-[#4A8AC2]/40"
      />

      <Textarea
        value={competitor.gaps}
        onChange={(e) => onUpdate({ gaps: e.target.value })}
        placeholder="Gaps & opportunities you see..."
        className="bg-white/30 border-white/30 text-[#1A1A1A] placeholder:text-[#6A7A8A]/50 focus-visible:border-[#4A8AC2]/40 min-h-20"
      />
    </motion.div>
  )
}

// ─── Competitive Content Audit ───────────────────────
function CompetitiveAudit() {
  const competitors = useWorkshopStore((s) => s.competitors)
  const addCompetitor = useWorkshopStore((s) => s.addCompetitor)
  const updateCompetitor = useWorkshopStore((s) => s.updateCompetitor)
  const removeCompetitor = useWorkshopStore((s) => s.removeCompetitor)

  const handleAdd = () => {
    addCompetitor({
      id: `comp-${Date.now()}`,
      name: '',
      platforms: '',
      visualIdentity: 0,
      contentThemes: '',
      engagement: 0,
      tone: '',
      gaps: '',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="title-caps-md text-[#1A1A1A]">
            Competitive Content Audit
          </h2>
          <p className="text-sm text-[#2E2E2E] mt-1">
            Score each competitor across key content dimensions
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 bg-[#2E5E8C]/10 text-[#2E5E8C] border border-[#2E5E8C]/20 hover:bg-[#2E5E8C]/20 hover:border-[#2E5E8C]/30 transition-all"
          size="lg"
        >
          <Plus className="size-4" />
          Add Competitor
        </Button>
      </div>

      {competitors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="liquid-glass rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center"
        >
          <div>
            <p className="text-[#1A1A1A] font-medium">No competitors yet</p>
            <p className="text-sm text-[#6A7A8A] mt-1">
              Add your first competitor to begin the audit
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {competitors.map((c) => (
            <CompetitorCard
              key={c.id}
              competitor={c}
              onUpdate={(data) => updateCompetitor(c.id, data)}
              onRemove={() => removeCompetitor(c.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Landscape Matrix ────────────────────────────────

interface DotModalState {
  x: number
  y: number
  screenX: number
  screenY: number
}

function LandscapeMatrix() {
  const positions = useWorkshopStore((s) => s.landscapePositions)
  const addPosition = useWorkshopStore((s) => s.addLandscapePosition)
  const updatePosition = useWorkshopStore((s) => s.updateLandscapePosition)
  const removePosition = useWorkshopStore((s) => s.removeLandscapePosition)
  const axes = useWorkshopStore((s) => s.landscapeAxes)
  const setAxes = useWorkshopStore((s) => s.setLandscapeAxes)

  const gridRef = useRef<HTMLDivElement>(null)
  const [dotModal, setDotModal] = useState<DotModalState | null>(null)
  const [modalName, setModalName] = useState('')
  const [modalIsClient, setModalIsClient] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; id: string } | null>(null)

  // Calculate grid-relative coordinates
  const getGridCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!gridRef.current) return null
      const rect = gridRef.current.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      }
    },
    []
  )

  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) return
      if ((e.target as HTMLElement).closest('[data-dot]')) return

      const coords = getGridCoords(e.clientX, e.clientY)
      if (!coords) return

      setDotModal({
        x: coords.x,
        y: coords.y,
        screenX: e.clientX,
        screenY: e.clientY,
      })
      setModalName('')
      setModalIsClient(false)
    },
    [getGridCoords, dragging]
  )

  const handlePlaceDot = useCallback(() => {
    if (!dotModal || !modalName.trim()) return
    addPosition({
      id: `lp-${Date.now()}`,
      name: modalName.trim(),
      x: dotModal.x,
      y: dotModal.y,
      isClient: modalIsClient,
    })
    setDotModal(null)
  }, [dotModal, modalName, modalIsClient, addPosition])

  // ─── Drag handling ────────────────────────────────
  const handleDotMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(id)
      dragRef.current = { startX: e.clientX, startY: e.clientY, id }
    },
    []
  )

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const coords = getGridCoords(e.clientX, e.clientY)
      if (!coords) return
      updatePosition(dragging, { x: coords.x, y: coords.y })
    }

    const handleMouseUp = () => {
      setDragging(null)
      dragRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, getGridCoords, updatePosition])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div>
        <h2 className="title-caps-md text-[#1A1A1A]">
          Landscape Matrix
        </h2>
        <p className="text-sm text-[#2E2E2E] mt-1">
          Click on the grid to place competitors and map the landscape. Drag to reposition.
        </p>
      </div>

      {/* Editable axis labels */}
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <span className="title-caps-sm text-[#6A7A8A]">
            X-Axis Left
          </span>
          <Input
            value={axes.xLeft}
            onChange={(e) => setAxes({ xLeft: e.target.value })}
            className="bg-white/30 border-white/30 text-[#1A1A1A] text-sm h-10 focus-visible:border-[#4A8AC2]/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="title-caps-sm text-[#6A7A8A]">
            X-Axis Right
          </span>
          <Input
            value={axes.xRight}
            onChange={(e) => setAxes({ xRight: e.target.value })}
            className="bg-white/30 border-white/30 text-[#1A1A1A] text-sm h-10 focus-visible:border-[#4A8AC2]/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="title-caps-sm text-[#6A7A8A]">
            Y-Axis Top
          </span>
          <Input
            value={axes.yTop}
            onChange={(e) => setAxes({ yTop: e.target.value })}
            className="bg-white/30 border-white/30 text-[#1A1A1A] text-sm h-10 focus-visible:border-[#4A8AC2]/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="title-caps-sm text-[#6A7A8A]">
            Y-Axis Bottom
          </span>
          <Input
            value={axes.yBottom}
            onChange={(e) => setAxes({ yBottom: e.target.value })}
            className="bg-white/30 border-white/30 text-[#1A1A1A] text-sm h-10 focus-visible:border-[#4A8AC2]/40"
          />
        </div>
      </div>

      {/* Matrix grid */}
      <div className="relative w-full max-w-3xl mx-auto">
        {/* Y-axis label top */}
        <div className="text-center mb-2">
          <span className="title-caps-sm text-[#1A1A1A]">
            {axes.yTop}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* X-axis label left */}
          <div className="w-20 flex-shrink-0 text-right">
            <span className="title-caps-sm text-[#1A1A1A]">
              {axes.xLeft}
            </span>
          </div>

          {/* The Grid */}
          <div
            ref={gridRef}
            onClick={handleGridClick}
            className="relative aspect-square w-full rounded-2xl overflow-hidden cursor-crosshair select-none liquid-glass"
            style={{ userSelect: 'none' }}
          >
            {/* Decorative cloud image */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <Image
                src="/images/cloud-cutouts.jpeg"
                alt=""
                fill
                className="object-cover opacity-[0.06]"
                aria-hidden="true"
              />
            </div>

            {/* Quadrant backgrounds */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-[1]">
              <div className="bg-[rgba(46,94,140,0.04)] border-r border-b border-[rgba(0,0,0,0.1)]" />
              <div className="bg-[rgba(46,94,140,0.04)] border-b border-[rgba(0,0,0,0.1)]" />
              <div className="bg-[rgba(46,94,140,0.04)] border-r border-[rgba(0,0,0,0.1)]" />
              <div className="bg-[rgba(46,94,140,0.04)]" />
            </div>

            {/* Center lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[rgba(0,0,0,0.1)] z-[2]" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[rgba(0,0,0,0.1)] z-[2]" />

            {/* Subtle grid */}
            <div className="absolute inset-0 pointer-events-none z-[2]">
              {[25, 75].map((p) => (
                <div key={`vl-${p}`}>
                  <div
                    className="absolute top-0 bottom-0 w-px bg-[rgba(0,0,0,0.04)]"
                    style={{ left: `${p}%` }}
                  />
                  <div
                    className="absolute left-0 right-0 h-px bg-[rgba(0,0,0,0.04)]"
                    style={{ top: `${p}%` }}
                  />
                </div>
              ))}
            </div>

            {/* Placed dots */}
            <AnimatePresence>
              {positions.map((pos) => (
                <motion.div
                  key={pos.id}
                  data-dot
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute group/pin z-[10]"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: dragging === pos.id ? 50 : 10,
                    cursor: dragging === pos.id ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={(e) => handleDotMouseDown(e, pos.id)}
                >
                  {/* Dot */}
                  <div
                    className={`relative rounded-full shadow-lg ${
                      pos.isClient
                        ? 'bg-[#2E5E8C] size-5 border-2 border-white/60'
                        : 'bg-[#4A8AC2] size-3.5 border-2 border-white/50'
                    }`}
                  />
                  {/* Label */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] font-medium pointer-events-none ${
                      pos.isClient
                        ? 'bg-[#2E5E8C]/10 text-[#1A1A1A] border border-[#2E5E8C]/15 -top-7'
                        : 'bg-white/50 text-[#1A1A1A] border border-white/40 top-full mt-1'
                    }`}
                  >
                    {pos.name}
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removePosition(pos.id)
                    }}
                    className="absolute -top-2.5 -right-2.5 size-4 rounded-full bg-[#E85A5A] text-white flex items-center justify-center opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-auto"
                    aria-label={`Remove ${pos.name}`}
                  >
                    <X className="size-2.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Click placement preview */}
            {dotModal && (
              <div
                className="absolute size-3 rounded-full bg-[#2E5E8C]/30 border border-[#2E5E8C]/50 animate-pulse pointer-events-none z-[15]"
                style={{
                  left: `${dotModal.x}%`,
                  top: `${dotModal.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
          </div>

          {/* X-axis label right */}
          <div className="w-20 flex-shrink-0">
            <span className="title-caps-sm text-[#1A1A1A]">
              {axes.xRight}
            </span>
          </div>
        </div>

        {/* Y-axis label bottom */}
        <div className="text-center mt-2">
          <span className="title-caps-sm text-[#1A1A1A]">
            {axes.yBottom}
          </span>
        </div>
      </div>

      {/* Dot placement modal */}
      <AnimatePresence>
        {dotModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setDotModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="fixed z-50 liquid-glass-strong rounded-xl p-4 flex flex-col gap-3 w-64 shadow-2xl"
              style={{
                left: Math.min(dotModal.screenX, window.innerWidth - 280),
                top: dotModal.screenY + 12,
              }}
            >
              <p className="title-caps-sm text-[#6A7A8A]">
                Place a pin
              </p>
              <Input
                autoFocus
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder="Name"
                className="bg-white/30 border-white/30 text-[#1A1A1A] text-sm h-9 focus-visible:border-[#4A8AC2]/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePlaceDot()
                  if (e.key === 'Escape') setDotModal(null)
                }}
              />
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    modalIsClient
                      ? 'bg-[#2E5E8C] border-[#2E5E8C]'
                      : 'border-[rgba(0,0,0,0.12)] group-hover:border-[rgba(0,0,0,0.24)]'
                  }`}
                  onClick={() => setModalIsClient(!modalIsClient)}
                >
                  {modalIsClient && (
                    <svg
                      className="size-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#1A1A1A]">This is the client brand</span>
              </label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setDotModal(null)}
                  variant="ghost"
                  className="flex-1 text-sm h-8 text-[#6A7A8A] hover:text-[#1A1A1A]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePlaceDot}
                  disabled={!modalName.trim()}
                  className="flex-1 bg-[#2E5E8C] text-white hover:bg-[#2E5E8C]/90 disabled:opacity-30 text-sm h-8 font-semibold"
                >
                  Place
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Legend */}
      {positions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 items-center"
        >
          <span className="title-caps-sm text-[#6A7A8A] mr-1">Legend:</span>
          {positions.map((pos) => (
            <div
              key={pos.id}
              className="flex items-center gap-1.5 liquid-glass rounded-lg px-2.5 py-1.5"
            >
              <div
                className={`rounded-full ${
                  pos.isClient
                    ? 'bg-[#2E5E8C] size-2.5'
                    : 'bg-[#4A8AC2] size-2'
                }`}
              />
              <span className="text-xs text-[#1A1A1A]">{pos.name}</span>
              <button
                onClick={() => removePosition(pos.id)}
                className="ml-1 text-[#6A7A8A] hover:text-[#E85A5A] transition-colors"
                aria-label={`Remove ${pos.name}`}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────
export default function PositionPage() {
  const [tab, setTab] = useState<ExerciseTab>('audit')

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="size-8 rounded-lg bg-[#2E5E8C]/10 border border-[#2E5E8C]/15 flex items-center justify-center">
              <span className="text-sm font-bold text-[#2E5E8C]">3</span>
            </div>
            <span className="title-caps-sm text-[#2E5E8C]">
              Phase 3
            </span>
          </div>
          <h1 className="title-caps-lg text-[#1A1A1A] mt-2">
            Competitive Position
          </h1>
          <p className="text-[#2E2E2E] mt-1">
            Understand the competitive landscape and find your unique position.
          </p>
        </div>

        {/* Tabs */}
        <TabToggle active={tab} onChange={setTab} />

        {/* Content */}
        <div>
          {tab === 'audit' ? <CompetitiveAudit /> : <LandscapeMatrix />}
        </div>
      </div>
    </div>
  )
}
