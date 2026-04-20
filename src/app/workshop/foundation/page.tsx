'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useWorkshopStore } from '@/lib/store'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

type Ring = 'why' | 'how' | 'what'

const RING_CONFIG: Record<Ring, { label: string; radius: number; color: string; fillColor: string; prompt: string }> = {
  what: {
    label: 'WHAT',
    radius: 180,
    color: '#7EB8E0',
    fillColor: 'rgba(126, 184, 224, 0.08)',
    prompt: 'What does your brand do? What products or services do you offer?',
  },
  how: {
    label: 'HOW',
    radius: 120,
    color: '#4A8AC2',
    fillColor: 'rgba(74, 138, 194, 0.1)',
    prompt: 'How do you do it differently? What makes your approach unique?',
  },
  why: {
    label: 'WHY',
    radius: 60,
    color: '#2E5E8C',
    fillColor: 'rgba(46, 94, 140, 0.14)',
    prompt: 'Why does your brand exist? What is your deeper purpose?',
  },
}

const RING_ORDER: Ring[] = ['what', 'how', 'why']

const DEFAULT_THEMES = ['Speed', 'Fairness', 'Trust', 'Innovation', 'Quality', 'Community']

export default function FoundationPage() {
  const { goldenCircle, setGoldenCircle } = useWorkshopStore()
  const [activeRing, setActiveRing] = useState<Ring | null>(null)
  const [customTheme, setCustomTheme] = useState('')
  const [availableThemes, setAvailableThemes] = useState(DEFAULT_THEMES)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (activeRing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [activeRing])

  const handleRingClick = useCallback((ring: Ring) => {
    setActiveRing((prev) => (prev === ring ? null : ring))
  }, [])

  const handleTextChange = useCallback(
    (ring: Ring, value: string) => {
      setGoldenCircle({ [ring]: value })
    },
    [setGoldenCircle]
  )

  const handleThemeSelect = useCallback(
    (theme: string) => {
      setGoldenCircle({ leadTheme: goldenCircle.leadTheme === theme ? '' : theme })
    },
    [goldenCircle.leadTheme, setGoldenCircle]
  )

  const handleAddCustomTheme = useCallback(() => {
    const trimmed = customTheme.trim()
    if (trimmed && !availableThemes.includes(trimmed)) {
      setAvailableThemes((prev) => [...prev, trimmed])
      setGoldenCircle({ leadTheme: trimmed })
      setCustomTheme('')
    }
  }, [customTheme, availableThemes, setGoldenCircle])

  const getTextPreview = (ring: Ring) => {
    const text = goldenCircle[ring]
    if (!text) return ''
    return text.length > 60 ? text.slice(0, 57) + '...' : text
  }

  // SVG dimensions
  const svgSize = 420
  const center = svgSize / 2

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
          PHASE 01
        </span>
        <h1 className="title-caps-lg text-ink">
          The Golden Circle
        </h1>
        <p className="mt-4 text-base text-[#2E2E2E]">
          Start from the inside out. Brands that lead with purpose create deeper connections.
          Click each ring to define your WHY, HOW, and WHAT.
        </p>
        <div className="mt-8 h-px w-full bg-ink/[0.06]" />
      </motion.div>

      {/* Main content: diagram + editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Concentric Circles Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative liquid-glass rounded-2xl p-6">
            {/* Decorative background image */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <Image
                src="/images/cd-sky.jpeg"
                alt=""
                fill
                className="object-cover opacity-[0.06]"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            <svg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="relative z-10 select-none"
            >
              {RING_ORDER.map((ring) => {
                const config = RING_CONFIG[ring]
                const isActive = activeRing === ring
                const hasContent = !!goldenCircle[ring]

                return (
                  <g key={ring}>
                    {/* Ring background */}
                    <circle
                      cx={center}
                      cy={center}
                      r={config.radius}
                      fill={isActive ? config.fillColor : hasContent ? `${config.color}08` : 'rgba(255,255,255,0.04)'}
                      stroke={config.color}
                      strokeWidth={isActive ? 2 : 1}
                      strokeOpacity={isActive ? 0.8 : hasContent ? 0.4 : 0.2}
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => handleRingClick(ring)}
                      style={{
                        transition: 'fill 0.3s, stroke-opacity 0.3s, stroke-width 0.3s',
                      }}
                    />

                    {/* Ring label */}
                    <text
                      x={center}
                      y={
                        ring === 'what'
                          ? center - config.radius + 24
                          : ring === 'how'
                            ? center - config.radius + 20
                            : center - 20
                      }
                      textAnchor="middle"
                      fill={config.color}
                      fontSize={ring === 'why' ? 14 : 11}
                      fontWeight="700"
                      letterSpacing="0.15em"
                      opacity={isActive ? 1 : 0.6}
                      className="pointer-events-none uppercase"
                      style={{
                        transition: 'opacity 0.3s',
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      }}
                    >
                      {config.label}
                    </text>

                    {/* Text preview inside ring */}
                    {hasContent && (
                      <foreignObject
                        x={center - (ring === 'why' ? 40 : ring === 'how' ? 70 : 100)}
                        y={
                          ring === 'why'
                            ? center - 8
                            : ring === 'how'
                              ? center - config.radius + 38
                              : center - config.radius + 40
                        }
                        width={ring === 'why' ? 80 : ring === 'how' ? 140 : 200}
                        height={ring === 'why' ? 40 : ring === 'how' ? 60 : 70}
                        className="pointer-events-none"
                      >
                        <div
                          className="flex items-center justify-center text-center"
                          style={{
                            color: '#1A1A1A',
                            fontSize: ring === 'why' ? '9px' : '10px',
                            lineHeight: '1.4',
                            opacity: 0.5,
                            overflow: 'hidden',
                          }}
                        >
                          {getTextPreview(ring)}
                        </div>
                      </foreignObject>
                    )}

                    {/* Subtle pulse ring when active */}
                    {isActive && (
                      <circle
                        cx={center}
                        cy={center}
                        r={config.radius}
                        fill="none"
                        stroke={config.color}
                        strokeWidth="1"
                        opacity="0.2"
                      >
                        <animate
                          attributeName="r"
                          from={config.radius}
                          to={config.radius + 10}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.2"
                          to="0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                )
              })}

              {/* Center dot */}
              <circle
                cx={center}
                cy={center}
                r="4"
                fill={activeRing === 'why' ? RING_CONFIG.why.color : 'rgba(26,26,26,0.15)'}
                style={{ transition: 'fill 0.3s' }}
              />
            </svg>

            {/* Completion indicators */}
            <div className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 flex flex-col gap-2">
              {RING_ORDER.map((ring) => {
                const config = RING_CONFIG[ring]
                const hasContent = !!goldenCircle[ring]
                return (
                  <motion.div
                    key={ring}
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => handleRingClick(ring)}
                    whileHover={{ x: -4 }}
                  >
                    <div
                      className="h-2 w-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: hasContent ? config.color : 'rgba(26,26,26,0.1)',
                      }}
                    />
                    <span
                      className="title-caps-sm opacity-0 group-hover:opacity-60 transition-opacity"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Editor Panel */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {activeRing ? (
              <motion.div
                key={activeRing}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="liquid-glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: RING_CONFIG[activeRing].color }}
                    />
                    <h3
                      className="title-caps-sm"
                      style={{ color: RING_CONFIG[activeRing].color }}
                    >
                      {RING_CONFIG[activeRing].label}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveRing(null)}
                    className="rounded-lg p-1.5 text-ink/30 transition-colors hover:bg-white/20 hover:text-ink/60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-ink-muted mb-4">{RING_CONFIG[activeRing].prompt}</p>
                <Textarea
                  ref={textareaRef}
                  value={goldenCircle[activeRing]}
                  onChange={(e) => handleTextChange(activeRing, e.target.value)}
                  placeholder={`Define your ${RING_CONFIG[activeRing].label}...`}
                  className="min-h-[120px] border-white/30 bg-white/10 text-ink placeholder:text-ink/35 resize-none"
                />

                {/* Navigate to next ring */}
                {activeRing !== 'why' && (
                  <button
                    onClick={() => {
                      const idx = RING_ORDER.indexOf(activeRing)
                      if (idx < RING_ORDER.length - 1) setActiveRing(RING_ORDER[idx + 1])
                    }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-ink/40 transition-colors hover:text-ink/70"
                  >
                    Go deeper
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="liquid-glass rounded-2xl p-6 text-center"
              >
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-10 w-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-ink/30" />
                  </div>
                  <p className="text-sm text-ink/40">Click a ring to start filling it in</p>
                  <p className="text-xs text-ink/25">Start from the outside (WHAT) and work inward</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick preview cards */}
          <div className="grid grid-cols-3 gap-2">
            {RING_ORDER.map((ring) => {
              const config = RING_CONFIG[ring]
              const hasContent = !!goldenCircle[ring]
              return (
                <motion.button
                  key={ring}
                  onClick={() => handleRingClick(ring)}
                  className="rounded-xl p-3 text-left transition-all bg-white/15 border border-white/25 backdrop-blur-sm"
                  style={{
                    borderColor: activeRing === ring ? `${config.color}40` : undefined,
                    backgroundColor: activeRing === ring ? `${config.color}10` : undefined,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="title-caps-sm mb-1"
                    style={{ color: config.color, opacity: hasContent ? 1 : 0.5 }}
                  >
                    {config.label}
                  </div>
                  <p className="text-[11px] text-ink/40 leading-relaxed line-clamp-2">
                    {goldenCircle[ring] || 'Not defined yet'}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lead Theme Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-16"
      >
        <div className="liquid-glass rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="title-caps-md text-ink mb-2">
              Which theme leads on social?
            </h2>
            <p className="text-sm text-[#2E2E2E]">
              Select the theme that best represents how you want to show up across platforms.
            </p>
          </div>

          {/* Theme chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {availableThemes.map((theme) => {
              const isSelected = goldenCircle.leadTheme === theme
              const isDefault = DEFAULT_THEMES.includes(theme)
              return (
                <motion.button
                  key={theme}
                  onClick={() => handleThemeSelect(theme)}
                  className="group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border"
                  style={{
                    borderColor: isSelected ? 'rgba(46,94,140,0.4)' : 'rgba(255,255,255,0.35)',
                    backgroundColor: isSelected ? 'rgba(46,94,140,0.12)' : 'rgba(255,255,255,0.15)',
                    color: isSelected ? '#2E5E8C' : '#1A1A1A',
                    backdropFilter: 'blur(12px)',
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="absolute inset-0 rounded-full border border-sky-deep/30"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{theme}</span>
                  {!isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAvailableThemes((prev) => prev.filter((t) => t !== theme))
                        if (goldenCircle.leadTheme === theme) {
                          setGoldenCircle({ leadTheme: '' })
                        }
                      }}
                      className="relative z-10 ml-0.5 rounded-full p-0.5 text-ink/30 hover:text-ink/60 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Add custom theme */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Input
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTheme()
                  }
                }}
                placeholder="Add a custom theme..."
                className="h-9 border-white/30 bg-white/15 text-ink placeholder:text-ink/30"
              />
            </div>
            <button
              onClick={handleAddCustomTheme}
              disabled={!customTheme.trim()}
              className="title-caps-sm text-ink/50 hover:text-ink transition-colors disabled:opacity-30 disabled:hover:text-ink/50 px-3 py-2"
            >
              + ADD
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
