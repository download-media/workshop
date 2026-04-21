'use client'

import { useState, useEffect } from 'react'
import { useWorkshopStore } from '@/lib/store'
import type { VoiceAttribute, VoiceGuardrail } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

// ─── Tab types ───────────────────────────────────────
type IdentityTab = 'voice-sort' | 'sliders' | 'guardrails' | 'tone'

const TABS: { id: IdentityTab; label: string }[] = [
  { id: 'voice-sort', label: 'Voice Sort' },
  { id: 'sliders', label: 'Personality' },
  { id: 'guardrails', label: 'Guardrails' },
  { id: 'tone', label: 'Tone' },
]

// ─── Tab navigation ──────────────────────────────────
function TabNav({
  active,
  onChange,
}: {
  active: IdentityTab
  onChange: (t: IdentityTab) => void
}) {
  return (
    <div className="flex rounded-xl liquid-glass-strong p-1 w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-5 py-2.5 rounded-lg title-caps-sm transition-colors ${
            active === tab.id
              ? 'text-[#1A1A1A]'
              : 'text-[#6A7A8A] hover:text-[#1A1A1A]'
          }`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="identity-tab-bg"
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

// ─── Voice Sort ──────────────────────────────────────

const categoryColors: Record<
  VoiceAttribute['category'],
  { card: string; pill: string; label: string }
> = {
  'we-are': {
    card: 'bg-[#2E5E8C]/10 border-[#2E5E8C]/20',
    pill: 'bg-[#2E5E8C]/10 text-[#2E5E8C]',
    label: 'We Are',
  },
  torn: {
    card: 'bg-white/25 backdrop-blur border-white/30',
    pill: 'bg-white/30 text-[#1A1A1A]',
    label: 'Torn',
  },
  'we-are-not': {
    card: 'bg-[#E85A5A]/10 border-[#E85A5A]/20',
    pill: 'bg-[#E85A5A]/10 text-[#E85A5A]',
    label: 'We Are Not',
  },
}

const categoryOrder: VoiceAttribute['category'][] = [
  'torn',
  'we-are',
  'we-are-not',
]

function VoiceSort() {
  const voiceAttributes = useWorkshopStore((s) => s.voiceAttributes)
  const updateVoiceAttribute = useWorkshopStore((s) => s.updateVoiceAttribute)

  const cycleCategory = (attr: VoiceAttribute) => {
    const currentIdx = categoryOrder.indexOf(attr.category)
    const nextCategory = categoryOrder[(currentIdx + 1) % categoryOrder.length]
    updateVoiceAttribute(attr.id, nextCategory)
  }

  const weAre = voiceAttributes.filter((a) => a.category === 'we-are')
  const torn = voiceAttributes.filter((a) => a.category === 'torn')
  const weAreNot = voiceAttributes.filter((a) => a.category === 'we-are-not')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-10"
    >
      <div>
        <h2 className="title-caps-md text-[#1A1A1A]">Voice Sort</h2>
        <p className="text-sm text-[#2E2E2E] mt-2 mb-6">
          Click each word to sort it. The color tells you where it is.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#2E5E8C]/15 border border-[#2E5E8C]/25" />
            <span className="text-xs text-[#2E5E8C] font-medium">We Are</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-white/40 border border-white/50" />
            <span className="text-xs text-[#6A7A8A] font-medium">Unsorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#E85A5A]/15 border border-[#E85A5A]/25" />
            <span className="text-xs text-[#E85A5A] font-medium">We Are Not</span>
          </div>
        </div>
      </div>

      {/* Word cards — clean grid, no corner labels */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {voiceAttributes.map((attr) => {
          const style = categoryColors[attr.category]
          return (
            <motion.button
              key={attr.id}
              onClick={() => cycleCategory(attr)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`rounded-xl border px-3 py-3.5 text-sm font-medium text-[#1A1A1A] transition-all cursor-pointer select-none text-center ${style.card}`}
            >
              {attr.word}
            </motion.button>
          )
        })}
      </div>

      {/* Summary — three equal columns */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { category: 'we-are' as const, items: weAre, label: 'We Are', color: '#2E5E8C' },
          { category: 'torn' as const, items: torn, label: 'Unsorted', color: '#6A7A8A' },
          { category: 'we-are-not' as const, items: weAreNot, label: 'We Are Not', color: '#E85A5A' },
        ]).map(({ category, items, label, color }) => {
          const style = categoryColors[category]
          return (
            <div
              key={category}
              className="liquid-glass rounded-2xl p-5 min-h-[120px]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="title-caps-sm" style={{ color }}>{label}</span>
                <span className="text-xs font-medium" style={{ color, opacity: 0.5 }}>{items.length}</span>
              </div>
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {items.map((attr) => (
                    <span
                      key={attr.id}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${style.pill}`}
                    >
                      {attr.word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6A7A8A]/40 mt-2">Click words above to sort them here</p>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Personality Sliders ─────────────────────────────

function PersonalitySliders() {
  const sliders = useWorkshopStore((s) => s.personalitySliders)
  const updateSlider = useWorkshopStore((s) => s.updatePersonalitySlider)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8"
    >
      <div>
        <h2 className="title-caps-md text-[#1A1A1A]">
          Brand Personality Sliders
        </h2>
        <p className="text-sm text-[#2E2E2E] mt-1">
          Position each slider to define where the brand falls on each spectrum
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {sliders.map((slider) => (
          <PersonalitySliderRow
            key={slider.id}
            leftLabel={slider.leftLabel}
            rightLabel={slider.rightLabel}
            value={slider.value}
            onChange={(v) => updateSlider(slider.id, v)}
          />
        ))}
      </div>
    </motion.div>
  )
}

function PersonalitySliderRow({
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="relative flex items-center justify-between mb-4">
        <span className="title-caps-sm text-[#1A1A1A]">
          {leftLabel}
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 text-xs font-mono text-[#1A1A1A] tabular-nums liquid-glass rounded-full px-3 py-1">
          {value}
        </span>
        <span className="title-caps-sm text-[#1A1A1A]">
          {rightLabel}
        </span>
      </div>

      {/* Custom range slider */}
      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-2 rounded-full overflow-hidden">
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(to right, #4A8AC2, #E8855A)',
              opacity: 0.2,
            }}
          />
        </div>

        {/* Active track */}
        <div
          className="absolute h-2 rounded-full"
          style={{
            left: 0,
            width: `${value}%`,
            background:
              'linear-gradient(to right, #4A8AC2, #E8855A)',
            opacity: 0.5,
          }}
        />

        {/* Input */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-2 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:size-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white/80
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.15)]
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:transition-shadow
            [&::-webkit-slider-thumb]:hover:shadow-[0_2px_12px_rgba(0,0,0,0.25)]
            [&::-moz-range-thumb]:size-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white/80
            [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.15)]
            [&::-moz-range-thumb]:cursor-grab
            [&::-moz-range-track]:bg-transparent
          "
        />
      </div>
    </div>
  )
}

// ─── Voice Guardrails ────────────────────────────────

const DEFAULT_GUARDRAILS: Omit<VoiceGuardrail, 'id'>[] = [
  { positive: 'Confident', negative: 'Arrogant' },
  { positive: 'Casual', negative: 'Sloppy' },
  { positive: 'Bold', negative: 'Offensive' },
]

function VoiceGuardrails() {
  const guardrails = useWorkshopStore((s) => s.voiceGuardrails)
  const addGuardrail = useWorkshopStore((s) => s.addVoiceGuardrail)
  const updateGuardrail = useWorkshopStore((s) => s.updateVoiceGuardrail)
  const removeGuardrail = useWorkshopStore((s) => s.removeVoiceGuardrail)

  // Seed defaults on first visit
  useEffect(() => {
    if (guardrails.length === 0) {
      DEFAULT_GUARDRAILS.forEach((g, i) => {
        addGuardrail({
          id: `vg-default-${i}`,
          ...g,
        })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = () => {
    addGuardrail({
      id: `vg-${Date.now()}`,
      positive: '',
      negative: '',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="title-caps-md text-[#1A1A1A]">
            Voice Guardrails
          </h2>
          <p className="text-sm text-[#2E2E2E] mt-1">
            Define what the brand voice is, and what it should never become
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 bg-[#2E5E8C]/10 text-[#2E5E8C] border border-[#2E5E8C]/20 hover:bg-[#2E5E8C]/20 hover:border-[#2E5E8C]/30 transition-all"
          size="lg"
        >
          <Plus className="size-4" />
          Add Guardrail
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {guardrails.map((g) => (
            <motion.div
              key={g.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="liquid-glass rounded-2xl p-4 flex items-center gap-3 group relative"
            >
              {/* Positive input */}
              <div className="flex-1 relative">
                <span className="absolute -top-2 left-3 text-[9px] uppercase tracking-wider text-[#2E5E8C]/70 bg-white/60 backdrop-blur-sm px-1.5 rounded-sm z-10">
                  We are
                </span>
                <Input
                  value={g.positive}
                  onChange={(e) =>
                    updateGuardrail(g.id, { positive: e.target.value })
                  }
                  placeholder="Positive trait"
                  className="bg-white/30 border-[#2E5E8C]/20 focus-visible:border-[#2E5E8C]/40 text-[#1A1A1A] placeholder:text-[#6A7A8A]/50 h-11 text-base font-medium"
                />
              </div>

              {/* Divider */}
              <span className="text-sm text-[#6A7A8A] font-medium flex-shrink-0 px-1">
                but not
              </span>

              {/* Negative input */}
              <div className="flex-1 relative">
                <span className="absolute -top-2 left-3 text-[9px] uppercase tracking-wider text-[#E85A5A]/70 bg-white/60 backdrop-blur-sm px-1.5 rounded-sm z-10">
                  Never
                </span>
                <Input
                  value={g.negative}
                  onChange={(e) =>
                    updateGuardrail(g.id, { negative: e.target.value })
                  }
                  placeholder="Negative boundary"
                  className="bg-white/30 border-[#E85A5A]/20 focus-visible:border-[#E85A5A]/40 text-[#1A1A1A] placeholder:text-[#6A7A8A]/50 h-11 text-base font-medium"
                />
              </div>

              {/* Remove */}
              <button
                onClick={() => removeGuardrail(g.id)}
                className="size-8 flex items-center justify-center rounded-lg text-[#6A7A8A] hover:text-[#E85A5A] hover:bg-[#E85A5A]/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                aria-label="Remove guardrail"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {guardrails.length === 0 && (
          <div className="liquid-glass rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-[#6A7A8A]">
              No guardrails yet. Add one to define brand voice boundaries.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Tone Dimensions ─────────────────────────────────

function ToneDimensions() {
  const toneDimensions = useWorkshopStore((s) => s.toneDimensions)
  const updateTone = useWorkshopStore((s) => s.updateToneDimension)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8"
    >
      <div>
        <h2 className="title-caps-md text-[#1A1A1A]">
          Tone Dimensions
        </h2>
        <p className="text-sm text-[#2E2E2E] mt-1">
          Click a circle to set where the brand sits on each tonal scale
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {toneDimensions.map((dim) => (
          <ToneRow
            key={dim.id}
            leftLabel={dim.leftLabel}
            rightLabel={dim.rightLabel}
            value={dim.value}
            onChange={(v) => updateTone(dim.id, v)}
          />
        ))}
      </div>
    </motion.div>
  )
}

function ToneRow({
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="liquid-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="title-caps-sm text-[#1A1A1A] w-28">
          {leftLabel}
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const isSelected = n === value
            return (
              <motion.button
                key={n}
                onClick={() => onChange(n)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                className="relative flex items-center justify-center"
                aria-label={`${leftLabel} ${n} of 10 ${rightLabel}`}
              >
                <div
                  className={`size-8 rounded-full border flex items-center justify-center text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#4A8AC2] border-[#4A8AC2] text-white shadow-[0_2px_12px_rgba(74,138,194,0.3)]'
                      : 'bg-white/30 border-white/40 text-[#6A7A8A] hover:border-[rgba(0,0,0,0.15)] hover:text-[#1A1A1A]'
                  }`}
                >
                  {n}
                </div>
              </motion.button>
            )
          })}
        </div>
        <span className="title-caps-sm text-[#1A1A1A] w-28 text-right">
          {rightLabel}
        </span>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────
export default function IdentityPage() {
  const [tab, setTab] = useState<IdentityTab>('voice-sort')

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="mb-14">
          <span className="title-caps-sm mb-4 block text-sky-deep/50">
            PHASE 04
          </span>
          <h1 className="title-caps-lg text-ink">
            Brand Identity
          </h1>
          <p className="mt-4 text-base text-[#2E2E2E]">
            Define the voice, personality, and tonal range of the brand.
          </p>
          <div className="mt-8 h-px w-full bg-ink/[0.06]" />
        </div>

        {/* Tabs */}
        <TabNav active={tab} onChange={setTab} />

        {/* Content */}
        <div>
          {tab === 'voice-sort' && <VoiceSort />}
          {tab === 'sliders' && <PersonalitySliders />}
          {tab === 'guardrails' && <VoiceGuardrails />}
          {tab === 'tone' && <ToneDimensions />}
        </div>
      </div>
    </div>
  )
}
