'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Plus, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useIdeationStore, ROLES } from '@/lib/ideation-store'
import type { WorstIdea, ParticipantRole } from '@/lib/ideation-store'

/* ────────────────────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────────────────────── */

const EXERCISES = [
  { id: 'room', label: 'ROOM' },
  { id: 'frame', label: 'FRAME' },
  { id: 'generate', label: 'GENERATE' },
  { id: 'flip', label: 'FLIP' },
  { id: 'matrix', label: 'MATRIX' },
  { id: 'vote', label: 'VOTE' },
] as const

const HMW_HINTS = [
  'How might we make [audience] feel [emotion] when they see our content?',
  'How might we stand out in [platform] without a big budget?',
  'How might we turn [problem] into a content opportunity?',
]

const SOURCE_COLORS: Record<string, string> = {
  'How Might We': '#2E5E8C',
  'Crazy 8s': '#4A8AC2',
  'Worst Idea Flip': '#E8855A',
  'Creative Matrix': '#7EB8E0',
}

/* ────────────────────────────────────────────────────────────
   Step Indicator
   ──────────────────────────────────────────────────────────── */

function StepIndicator({
  current,
  onChange,
}: {
  current: number
  onChange: (idx: number) => void
}) {
  return (
    <div className="liquid-glass rounded-2xl p-1.5 flex gap-1 mb-10">
      {EXERCISES.map((ex, idx) => {
        const isActive = idx === current
        const isPast = idx < current
        return (
          <button
            key={ex.id}
            onClick={() => onChange(idx)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 transition-colors"
            aria-selected={isActive}
            role="tab"
          >
            {isActive && (
              <motion.div
                layoutId="ideation-step"
                className="absolute inset-0 rounded-xl bg-white/40"
                style={{ border: '1px solid rgba(255,255,255,0.5)' }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span
              className="relative z-10 title-caps-sm transition-colors duration-300"
              style={{
                color: isActive
                  ? '#1A1A1A'
                  : isPast
                    ? '#1A1A1A80'
                    : '#1A1A1A30',
              }}
            >
              {idx > 0 && (
                <span
                  className="mr-1.5"
                  style={{
                    opacity: isActive ? 0.4 : 0.2,
                  }}
                >
                  {'\u2192'}
                </span>
              )}
              {ex.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Exercise 1: HOW MIGHT WE
   ──────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────
   Room Setup — Add participants and assign roles
   ──────────────────────────────────────────────────────────── */

function RoomSetup() {
  const participants = useIdeationStore((s) => s.participants)
  const addParticipant = useIdeationStore((s) => s.addParticipant)
  const updateParticipant = useIdeationStore((s) => s.updateParticipant)
  const removeParticipant = useIdeationStore((s) => s.removeParticipant)
  const [nameInput, setNameInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const name = nameInput.trim()
    if (!name) return
    addParticipant(name)
    setNameInput('')
    inputRef.current?.focus()
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="title-caps-lg text-[#1A1A1A]">THE ROOM</h2>
        <p className="text-sm text-[#2E2E2E] mt-2">
          Who is in the session? Add everyone, then assign roles. Roles shape how each person contributes — and the number of people sets the total votes at the end.
        </p>
      </div>

      {/* Add participant */}
      <div className="flex gap-3 mb-8">
        <Input
          ref={inputRef}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
          placeholder="Name"
          className="h-12 flex-1 bg-white/20 border-white/30 text-[#1A1A1A] text-lg placeholder:text-[#1A1A1A]/20"
        />
        <button
          onClick={handleAdd}
          disabled={!nameInput.trim()}
          className="title-caps-sm px-6 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors disabled:opacity-20"
        >
          + ADD
        </button>
      </div>

      {/* Participants */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {participants.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="liquid-glass rounded-2xl p-5 group"
            >
              <div className="flex items-start gap-4">
                {/* Name */}
                <div className="flex-1">
                  <input
                    value={p.name}
                    onChange={(e) => updateParticipant(p.id, { name: e.target.value })}
                    className="bg-transparent text-lg font-bold text-[#1A1A1A] outline-none w-full"
                    style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                  />

                  {/* Role selector */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ROLES.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => updateParticipant(p.id, { role: role.value })}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider transition-all duration-200 ${
                          p.role === role.value
                            ? role.value === 'wild-ideator' ? 'bg-[#E8855A]/15 text-[#E8855A] ring-1 ring-[#E8855A]/20'
                            : role.value === 'devils-advocate' ? 'bg-[#E85A5A]/15 text-[#E85A5A] ring-1 ring-[#E85A5A]/20'
                            : role.value === 'builder' ? 'bg-[#2E5E8C]/15 text-[#2E5E8C] ring-1 ring-[#2E5E8C]/20'
                            : role.value === 'connector' ? 'bg-[#4A8AC2]/15 text-[#4A8AC2] ring-1 ring-[#4A8AC2]/20'
                            : 'bg-white/30 text-[#1A1A1A] ring-1 ring-white/40'
                            : 'text-[#1A1A1A]/25 hover:text-[#1A1A1A]/50'
                        }`}
                        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>

                  {/* Role description */}
                  {p.role !== 'none' && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-[#6A7A8A] mt-2"
                    >
                      {ROLES.find((r) => r.value === p.role)?.description}
                    </motion.p>
                  )}
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="text-[#1A1A1A]/10 hover:text-[#E85A5A] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {participants.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#1A1A1A]/30 text-sm">Add the people in the room to get started</p>
        </div>
      )}

      {/* Summary */}
      {participants.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex items-center gap-4 text-sm text-[#6A7A8A]"
        >
          <span className="title-caps-sm text-[#1A1A1A]/30">
            {participants.length} {participants.length === 1 ? 'PERSON' : 'PEOPLE'}
          </span>
          <span className="text-[#1A1A1A]/10">|</span>
          <span className="title-caps-sm text-[#1A1A1A]/30">
            {participants.length} {participants.length === 1 ? 'VOTE' : 'VOTES'} IN FINAL ROUND
          </span>
        </motion.div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   How Might We
   ──────────────────────────────────────────────────────────── */

function HowMightWeExercise() {
  const { hmwQuestions, addHmwQuestion, removeHmwQuestion } =
    useIdeationStore()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const fullQuestion = trimmed.toLowerCase().startsWith('how might we')
      ? trimmed
      : `How might we ${trimmed}`
    addHmwQuestion(fullQuestion)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <span className="title-caps-sm mb-4 block" style={{ color: 'rgba(46,94,140,0.5)' }}>
          EXERCISE 01
        </span>
        <h1 className="title-caps-lg" style={{ color: '#1A1A1A' }}>
          How Might We
        </h1>
        <p className="mt-4 text-base" style={{ color: '#2E2E2E' }}>
          Reframe your challenge as open-ended questions. Great HMW questions are
          broad enough to allow creative freedom but narrow enough to be
          actionable.
        </p>
        <div className="mt-8 h-px w-full" style={{ background: 'rgba(26,26,26,0.06)' }} />
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="liquid-glass rounded-2xl p-6 mb-8"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(26,26,26,0.25)' }}>
              How might we...
            </span>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              className="h-12 pl-[130px] text-sm border-white/30 bg-white/15"
              placeholder="type your challenge here"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="h-12 px-5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
            style={{
              backgroundColor: '#2E5E8C',
              color: '#ffffff',
            }}
          >
            Add
          </button>
        </div>
      </motion.div>

      {/* Example hints */}
      {hmwQuestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="title-caps-sm mb-3" style={{ color: 'rgba(26,26,26,0.25)' }}>
            NEED INSPIRATION?
          </p>
          <div className="space-y-2">
            {HMW_HINTS.map((hint, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(hint.replace('How might we ', ''))
                  inputRef.current?.focus()
                }}
                className="block w-full text-left rounded-xl px-5 py-3.5 text-sm transition-all border border-white/20 bg-white/10 backdrop-blur-sm"
                style={{ color: 'rgba(26,26,26,0.4)' }}
              >
                <span style={{ color: 'rgba(46,94,140,0.5)' }}>HMW </span>
                {hint.replace('How might we ', '')}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Question cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {hmwQuestions.map((q, idx) => (
            <motion.div
              key={`${q}-${idx}`}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="liquid-glass rounded-2xl p-5 flex items-start gap-4"
            >
              <span
                className="title-caps-sm mt-0.5 shrink-0"
                style={{ color: 'rgba(46,94,140,0.4)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <p className="flex-1 text-[15px] leading-relaxed" style={{ color: '#1A1A1A' }}>
                {q}
              </p>
              <button
                onClick={() => removeHmwQuestion(idx)}
                className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[#E85A5A]/10"
                style={{ color: 'rgba(26,26,26,0.25)' }}
                aria-label={`Remove question ${idx + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Exercise 2: CRAZY 8s
   ──────────────────────────────────────────────────────────── */

function Crazy8sExercise() {
  const { crazy8Ideas, setCrazy8Idea } = useIdeationStore()
  const [timerActive, setTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [activePanel, setActivePanel] = useState(0)
  const [isReview, setIsReview] = useState(false)
  const [flashPanel, setFlashPanel] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  // Check if all panels have content (for auto-review detection)
  const allPanelsComplete = crazy8Ideas.every((idea) => idea.text.trim())

  // Timer logic
  useEffect(() => {
    if (!timerActive) return

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up for this panel
          if (activePanel < 7) {
            // Flash effect
            setFlashPanel(activePanel)
            setTimeout(() => setFlashPanel(null), 400)

            setActivePanel((p) => p + 1)
            // Focus next textarea
            setTimeout(() => {
              textareaRefs.current[activePanel + 1]?.focus()
            }, 50)
            return 60
          } else {
            // All 8 done
            clearInterval(intervalRef.current!)
            setTimerActive(false)
            setIsReview(true)
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerActive, activePanel])

  const startTimer = () => {
    setTimerActive(true)
    setTimeRemaining(60)
    setActivePanel(0)
    setIsReview(false)
    setTimeout(() => {
      textareaRefs.current[0]?.focus()
    }, 100)
  }

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerActive(false)
  }

  // Timer circle math
  const circleRadius = 54
  const circleCircumference = 2 * Math.PI * circleRadius
  const strokeProgress = (timeRemaining / 60) * circleCircumference
  const timerColor = timeRemaining <= 10 ? '#E85A5A' : timeRemaining <= 20 ? '#E8855A' : '#4A8AC2'

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <span className="title-caps-sm mb-4 block" style={{ color: 'rgba(46,94,140,0.5)' }}>
          EXERCISE 02
        </span>
        <h1 className="title-caps-lg" style={{ color: '#1A1A1A' }}>
          Crazy 8s
        </h1>
        <p className="mt-4 text-base" style={{ color: '#2E2E2E' }}>
          8 ideas. 60 seconds each. No filtering. The best ideas come after
          you&apos;ve exhausted the obvious ones.
        </p>
        <div className="mt-8 h-px w-full" style={{ background: 'rgba(26,26,26,0.06)' }} />
      </motion.div>

      {/* Timer + controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex flex-col items-center mb-10"
      >
        {/* Circular countdown */}
        <div className="relative mb-6">
          <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={circleRadius}
              fill="none"
              stroke="rgba(0,0,0,0.04)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <motion.circle
              cx="70"
              cy="70"
              r={circleRadius}
              fill="none"
              stroke={timerColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              animate={{
                strokeDashoffset: circleCircumference - strokeProgress,
              }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
            {/* Pulsing glow when active and low */}
            {timerActive && timeRemaining <= 10 && (
              <circle
                cx="70"
                cy="70"
                r={circleRadius}
                fill="none"
                stroke="#E85A5A"
                strokeWidth="2"
                opacity="0.3"
              >
                <animate
                  attributeName="r"
                  from={circleRadius}
                  to={String(circleRadius + 8)}
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.3"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>
          {/* Timer text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold tabular-nums"
              style={{ color: timerColor }}
              animate={
                timerActive && timeRemaining <= 10
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: timerActive && timeRemaining <= 10 ? Infinity : 0,
              }}
            >
              {timeRemaining}
            </motion.span>
            <span className="title-caps-sm mt-0.5" style={{ color: 'rgba(26,26,26,0.25)' }}>
              {timerActive ? `PANEL ${activePanel + 1}/8` : 'SECONDS'}
            </span>
          </div>
        </div>

        {/* Start / stop */}
        {!timerActive && !isReview && (
          <button
            onClick={startTimer}
            className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#2E5E8C' }}
          >
            START
          </button>
        )}
        {timerActive && (
          <button
            onClick={stopTimer}
            className="rounded-xl px-8 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(232,90,90,0.1)',
              color: '#E85A5A',
              border: '1px solid rgba(232,90,90,0.2)',
            }}
          >
            PAUSE
          </button>
        )}
        {isReview && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsReview(false)}
              className="rounded-xl px-6 py-3 text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#1A1A1A',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              EDIT
            </button>
            <button
              onClick={startTimer}
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: '#2E5E8C' }}
            >
              RESTART
            </button>
          </div>
        )}
      </motion.div>

      {/* 8 Panels grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {crazy8Ideas.map((idea, idx) => {
          const isActive = timerActive && activePanel === idx
          const isCompleted = timerActive && idx < activePanel
          const isFuture = timerActive && idx > activePanel
          const isFlashing = flashPanel === idx

          return (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: isFuture ? 0.5 : 1,
                y: 0,
                scale: isFlashing ? 1.03 : 1,
              }}
              transition={{
                delay: idx * 0.04,
                duration: 0.3,
              }}
              className="relative rounded-2xl p-4 transition-all"
              style={{
                background: isActive
                  ? 'rgba(255,255,255,0.45)'
                  : 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: isActive
                  ? '2px solid rgba(74,138,194,0.5)'
                  : isFlashing
                    ? '2px solid rgba(232,133,90,0.6)'
                    : '1px solid rgba(255,255,255,0.35)',
                boxShadow: isActive
                  ? '0 0 24px rgba(74,138,194,0.15), 0 8px 32px rgba(0,0,0,0.05)'
                  : isFlashing
                    ? '0 0 30px rgba(232,133,90,0.2)'
                    : '0 8px 32px rgba(0,0,0,0.05)',
              }}
            >
              {/* Panel number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="title-caps-sm"
                  style={{
                    color: isActive
                      ? '#4A8AC2'
                      : isCompleted
                        ? '#1A1A1A50'
                        : '#1A1A1A20',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {isActive && (
                  <motion.div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#4A8AC2' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
              </div>

              <Textarea
                ref={(el) => {
                  textareaRefs.current[idx] = el
                }}
                value={idea.text}
                onChange={(e) => setCrazy8Idea(idx, e.target.value)}
                placeholder={
                  isActive
                    ? 'Type fast. No filtering.'
                    : isFuture
                      ? '...'
                      : 'Your idea'
                }
                disabled={isFuture}
                className="min-h-[80px] text-sm border-transparent bg-transparent resize-none placeholder:text-[#1A1A1A]/20"
                style={{
                  color: isCompleted && !isReview ? '#1A1A1A80' : '#1A1A1A',
                }}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Exercise 3: WORST POSSIBLE IDEA
   ──────────────────────────────────────────────────────────── */

function WorstIdeaExercise() {
  const { worstIdeas, addWorstIdea, updateWorstIdea, removeWorstIdea } =
    useIdeationStore()
  const [badInput, setBadInput] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [flipInput, setFlipInput] = useState('')

  const handleAddBad = () => {
    const trimmed = badInput.trim()
    if (!trimmed) return
    addWorstIdea(trimmed)
    setBadInput('')
  }

  const handleFlip = (id: string) => {
    const trimmed = flipInput.trim()
    if (!trimmed) return
    updateWorstIdea(id, { flippedIdea: trimmed })
    setFlipInput('')
    setExpandedId(null)
  }

  const handleExpandToggle = (idea: WorstIdea) => {
    if (expandedId === idea.id) {
      setExpandedId(null)
      setFlipInput('')
    } else {
      setExpandedId(idea.id)
      setFlipInput(idea.flippedIdea || '')
    }
  }

  const flippedIdeas = worstIdeas.filter((w) => w.flippedIdea.trim())

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <span className="title-caps-sm mb-4 block" style={{ color: 'rgba(232,90,90,0.5)' }}>
          EXERCISE 03
        </span>
        <h1 className="title-caps-lg" style={{ color: '#1A1A1A' }}>
          Worst Possible Idea
        </h1>
        <p className="mt-4 text-base" style={{ color: '#2E2E2E' }}>
          Generate the absolute worst ideas you can think of. Then flip each one
          into something brilliant. The psychology: bad ideas unlock creative
          freedom.
        </p>
        <div className="mt-8 h-px w-full" style={{ background: 'rgba(26,26,26,0.06)' }} />
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Worst ideas */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#E85A5A' }} />
            <span className="title-caps-sm" style={{ color: '#E85A5A' }}>
              THE WORST IDEAS
            </span>
          </div>

          {/* Add input */}
          <div className="liquid-glass rounded-2xl p-4 mb-4">
            <div className="flex gap-3">
              <Input
                value={badInput}
                onChange={(e) => setBadInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddBad()
                  }
                }}
                placeholder="The absolute worst idea you can think of..."
                className="h-11 text-sm border-white/30 bg-white/15"
              />
              <button
                onClick={handleAddBad}
                disabled={!badInput.trim()}
                className="h-11 px-4 rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'rgba(232,90,90,0.12)',
                  color: '#E85A5A',
                  border: '1px solid rgba(232,90,90,0.2)',
                }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bad idea cards */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {worstIdeas.map((idea) => {
                const isExpanded = expandedId === idea.id
                return (
                  <motion.div
                    key={idea.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl p-4 transition-all cursor-pointer"
                    style={{
                      background: isExpanded
                        ? 'rgba(255,255,255,0.42)'
                        : 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(40px) saturate(180%)',
                      border: isExpanded
                        ? '1px solid rgba(232,90,90,0.3)'
                        : '1px solid rgba(255,255,255,0.35)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                    }}
                    onClick={() => handleExpandToggle(idea)}
                  >
                    <div className="flex items-start gap-3">
                      <p className="flex-1 text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>
                        {idea.badIdea}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        {idea.flippedIdea && (
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#4A8AC2' }} />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeWorstIdea(idea.id)
                          }}
                          className="rounded-lg p-1.5 transition-colors hover:bg-[#E85A5A]/10"
                          style={{ color: 'rgba(26,26,26,0.2)' }}
                          aria-label="Remove idea"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded flip area */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <p className="title-caps-sm mb-3" style={{ color: '#4A8AC2' }}>
                              FLIP IT
                            </p>
                            <p className="text-xs mb-3" style={{ color: '#6A7A8A' }}>
                              What&apos;s the opposite? What if this terrible idea actually
                              had a kernel of genius?
                            </p>
                            <div className="flex gap-2">
                              <Input
                                value={flipInput}
                                onChange={(e) => setFlipInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleFlip(idea.id)
                                  }
                                }}
                                placeholder="The brilliant version..."
                                className="h-10 text-sm border-white/30 bg-white/15"
                              />
                              <button
                                onClick={() => handleFlip(idea.id)}
                                disabled={!flipInput.trim()}
                                className="h-10 px-4 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-30"
                                style={{ backgroundColor: '#4A8AC2' }}
                              >
                                FLIP
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {worstIdeas.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed py-12 text-center"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <p className="text-sm" style={{ color: '#6A7A8A' }}>
                Go on, be terrible. The worse the better.
              </p>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Flipped ideas */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#4A8AC2' }} />
            <span className="title-caps-sm" style={{ color: '#4A8AC2' }}>
              THE FLIPPED VERSION
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {flippedIdeas.map((idea) => (
                <motion.div
                  key={`flip-${idea.id}`}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="liquid-glass rounded-2xl p-4"
                >
                  <p className="text-sm leading-relaxed mb-2" style={{ color: '#1A1A1A' }}>
                    {idea.flippedIdea}
                  </p>
                  <p className="text-xs" style={{ color: '#6A7A8A' }}>
                    Flipped from: <span style={{ color: '#E85A5A' }}>{idea.badIdea}</span>
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {flippedIdeas.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed py-12 text-center"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <p className="text-sm" style={{ color: '#6A7A8A' }}>
                Click a bad idea to flip it into gold.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Exercise 4: CREATIVE MATRIX
   ──────────────────────────────────────────────────────────── */

function CreativeMatrixExercise() {
  const {
    matrixRows,
    matrixCols,
    matrixCells,
    setMatrixCell,
    addMatrixRow,
    addMatrixCol,
    removeMatrixRow,
    removeMatrixCol,
    updateMatrixRow,
    updateMatrixCol,
  } = useIdeationStore()

  const [editingCell, setEditingCell] = useState<{ row: string; col: string } | null>(null)
  const [cellInput, setCellInput] = useState('')
  const [newRowInput, setNewRowInput] = useState('')
  const [newColInput, setNewColInput] = useState('')
  const [editingRowLabel, setEditingRowLabel] = useState<string | null>(null)
  const [editingColLabel, setEditingColLabel] = useState<string | null>(null)
  const [rowLabelInput, setRowLabelInput] = useState('')
  const [colLabelInput, setColLabelInput] = useState('')

  const ROW_TINTS = [
    'rgba(46,94,140,0.04)',
    'rgba(74,138,194,0.04)',
    'rgba(232,133,90,0.04)',
    'rgba(126,184,224,0.04)',
    'rgba(184,212,232,0.04)',
    'rgba(46,94,140,0.03)',
  ]

  const getCellIdea = (row: string, col: string) => {
    return matrixCells.find((c) => c.row === row && c.col === col)?.idea || ''
  }

  const handleCellClick = (row: string, col: string) => {
    setEditingCell({ row, col })
    setCellInput(getCellIdea(row, col))
  }

  const handleCellSave = () => {
    if (!editingCell) return
    setMatrixCell(editingCell.row, editingCell.col, cellInput.trim())
    setEditingCell(null)
    setCellInput('')
  }

  const handleAddRow = () => {
    const trimmed = newRowInput.trim()
    if (!trimmed) return
    addMatrixRow(trimmed)
    setNewRowInput('')
  }

  const handleAddCol = () => {
    const trimmed = newColInput.trim()
    if (!trimmed) return
    addMatrixCol(trimmed)
    setNewColInput('')
  }

  const handleRowLabelSave = (oldLabel: string) => {
    const trimmed = rowLabelInput.trim()
    if (trimmed && trimmed !== oldLabel) {
      updateMatrixRow(oldLabel, trimmed)
    }
    setEditingRowLabel(null)
    setRowLabelInput('')
  }

  const handleColLabelSave = (oldLabel: string) => {
    const trimmed = colLabelInput.trim()
    if (trimmed && trimmed !== oldLabel) {
      updateMatrixCol(oldLabel, trimmed)
    }
    setEditingColLabel(null)
    setColLabelInput('')
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <span className="title-caps-sm mb-4 block" style={{ color: 'rgba(232,133,90,0.5)' }}>
          EXERCISE 04
        </span>
        <h1 className="title-caps-lg" style={{ color: '#1A1A1A' }}>
          Creative Matrix
        </h1>
        <p className="mt-4 text-base" style={{ color: '#2E2E2E' }}>
          Cross-pollinate categories with inspiration sources. Each intersection
          forces an unexpected creative connection.
        </p>
        <div className="mt-8 h-px w-full" style={{ background: 'rgba(26,26,26,0.06)' }} />
      </motion.div>

      {/* Matrix table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="liquid-glass rounded-2xl overflow-hidden"
      >
        {/* Scrollable wrapper for mobile */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px]">
            {/* Column headers */}
            <thead>
              <tr>
                <th className="p-3 w-[140px]" />
                {matrixCols.map((col) => (
                  <th
                    key={col}
                    className="p-3 text-center"
                    style={{ minWidth: '140px' }}
                  >
                    {editingColLabel === col ? (
                      <Input
                        autoFocus
                        value={colLabelInput}
                        onChange={(e) => setColLabelInput(e.target.value)}
                        onBlur={() => handleColLabelSave(col)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleColLabelSave(col)
                          if (e.key === 'Escape') {
                            setEditingColLabel(null)
                            setColLabelInput('')
                          }
                        }}
                        className="h-7 text-xs text-center border-white/30 bg-white/15"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-1 group">
                        <button
                          onClick={() => {
                            setEditingColLabel(col)
                            setColLabelInput(col)
                          }}
                          className="title-caps-sm transition-colors hover:text-[#4A8AC2]"
                          style={{ color: '#1A1A1A', opacity: 0.6 }}
                        >
                          {col}
                        </button>
                        <button
                          onClick={() => removeMatrixCol(col)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-[#E85A5A]/10"
                          style={{ color: '#E85A5A' }}
                          aria-label={`Remove column: ${col}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </th>
                ))}
                <th className="p-3 w-[50px]">
                  {/* Add column */}
                </th>
              </tr>
            </thead>

            <tbody>
              {matrixRows.map((row, rowIdx) => (
                <tr
                  key={row}
                  style={{ backgroundColor: ROW_TINTS[rowIdx % ROW_TINTS.length] }}
                >
                  {/* Row label */}
                  <td className="p-3">
                    {editingRowLabel === row ? (
                      <Input
                        autoFocus
                        value={rowLabelInput}
                        onChange={(e) => setRowLabelInput(e.target.value)}
                        onBlur={() => handleRowLabelSave(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRowLabelSave(row)
                          if (e.key === 'Escape') {
                            setEditingRowLabel(null)
                            setRowLabelInput('')
                          }
                        }}
                        className="h-7 text-xs border-white/30 bg-white/15"
                      />
                    ) : (
                      <div className="flex items-center gap-1 group">
                        <button
                          onClick={() => {
                            setEditingRowLabel(row)
                            setRowLabelInput(row)
                          }}
                          className="text-xs font-semibold text-left transition-colors hover:text-[#4A8AC2]"
                          style={{ color: '#1A1A1A' }}
                        >
                          {row}
                        </button>
                        <button
                          onClick={() => removeMatrixRow(row)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-[#E85A5A]/10"
                          style={{ color: '#E85A5A' }}
                          aria-label={`Remove row: ${row}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Cells */}
                  {matrixCols.map((col) => {
                    const idea = getCellIdea(row, col)
                    const isEditing =
                      editingCell?.row === row && editingCell?.col === col

                    return (
                      <td key={`${row}-${col}`} className="p-1.5">
                        {isEditing ? (
                          <div className="rounded-xl p-2 bg-white/30 border border-white/40">
                            <Textarea
                              autoFocus
                              value={cellInput}
                              onChange={(e) => setCellInput(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleCellSave()
                                }
                                if (e.key === 'Escape') {
                                  setEditingCell(null)
                                  setCellInput('')
                                }
                              }}
                              placeholder="Your idea..."
                              className="min-h-[60px] text-xs border-transparent bg-transparent resize-none"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCellClick(row, col)}
                            className="w-full min-h-[60px] rounded-xl p-3 text-left transition-all hover:bg-white/20"
                            style={{
                              background: idea
                                ? 'rgba(255,255,255,0.25)'
                                : 'transparent',
                              border: idea
                                ? '1px solid rgba(255,255,255,0.3)'
                                : '1px dashed rgba(0,0,0,0.06)',
                            }}
                          >
                            {idea ? (
                              <span className="text-xs leading-relaxed" style={{ color: '#1A1A1A' }}>
                                {idea}
                              </span>
                            ) : (
                              <span
                                className="flex items-center justify-center h-full text-sm"
                                style={{ color: 'rgba(26,26,26,0.12)' }}
                              >
                                +
                              </span>
                            )}
                          </button>
                        )}
                      </td>
                    )
                  })}

                  <td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row / add column buttons */}
        <div className="flex items-center gap-4 px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={newRowInput}
              onChange={(e) => setNewRowInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddRow()
                }
              }}
              placeholder="Add row..."
              className="h-8 max-w-[180px] text-xs border-white/20 bg-white/10"
            />
            <button
              onClick={handleAddRow}
              disabled={!newRowInput.trim()}
              className="h-8 px-3 rounded-lg text-xs font-semibold transition-all disabled:opacity-20"
              style={{ color: '#4A8AC2' }}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Input
              value={newColInput}
              onChange={(e) => setNewColInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCol()
                }
              }}
              placeholder="Add column..."
              className="h-8 max-w-[180px] text-xs border-white/20 bg-white/10"
            />
            <button
              onClick={handleAddCol}
              disabled={!newColInput.trim()}
              className="h-8 px-3 rounded-lg text-xs font-semibold transition-all disabled:opacity-20"
              style={{ color: '#4A8AC2' }}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Exercise 5: DOT VOTE
   ──────────────────────────────────────────────────────────── */

function DotVoteExercise() {
  const { votedIdeas, collectIdeasForVoting, toggleVote, totalVotesUsed, maxVotes, participants } =
    useIdeationStore()

  const max = maxVotes()
  const votesRemaining = max - totalVotesUsed()

  // Collect ideas on mount
  useEffect(() => {
    collectIdeasForVoting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sort by votes (highest first)
  const sortedIdeas = useMemo(
    () => [...votedIdeas].sort((a, b) => b.votes - a.votes),
    [votedIdeas]
  )

  const topIdeas = sortedIdeas.filter((i) => i.votes > 0)

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <span className="title-caps-sm mb-4 block" style={{ color: 'rgba(46,94,140,0.5)' }}>
          EXERCISE 05
        </span>
        <h1 className="title-caps-lg" style={{ color: '#1A1A1A' }}>
          Dot Vote
        </h1>
        <p className="mt-4 text-base" style={{ color: '#2E2E2E' }}>
          Review all your ideas from every exercise. Vote on the ones worth
          pursuing. {participants.length > 0 ? `${participants.length} people in the room = ${max} votes.` : 'Add people in the Room step for more votes.'}
        </p>
        <div className="mt-8 h-px w-full" style={{ background: 'rgba(26,26,26,0.06)' }} />
      </motion.div>

      {/* Vote counter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="liquid-glass rounded-2xl p-5 mb-8 flex items-center justify-between"
      >
        <div>
          <span className="title-caps-sm" style={{ color: '#1A1A1A' }}>
            VOTES REMAINING
          </span>
          <p className="text-xs mt-1" style={{ color: '#6A7A8A' }}>
            Click cards to vote. Click again to remove.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((dot) => (
            <motion.div
              key={dot}
              className="h-4 w-4 rounded-full"
              animate={{
                backgroundColor:
                  dot <= votesRemaining
                    ? '#4A8AC2'
                    : 'rgba(0,0,0,0.06)',
                scale: dot <= votesRemaining ? 1 : 0.75,
              }}
              transition={{ duration: 0.25 }}
            />
          ))}
          <span
            className="ml-2 text-lg font-bold tabular-nums"
            style={{ color: votesRemaining === 0 ? '#E85A5A' : '#4A8AC2' }}
          >
            {votesRemaining}
          </span>
        </div>
      </motion.div>

      {/* Recollect button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={collectIdeasForVoting}
          className="title-caps-sm transition-colors hover:text-[#4A8AC2]"
          style={{ color: 'rgba(26,26,26,0.3)' }}
        >
          REFRESH IDEAS
        </button>
      </div>

      {/* Idea cards */}
      {sortedIdeas.length > 0 ? (
        <LayoutGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {sortedIdeas.map((idea) => {
                const sourceColor = SOURCE_COLORS[idea.source] || '#6A7A8A'
                const isVoted = idea.votes > 0

                return (
                  <motion.button
                    key={idea.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => toggleVote(idea.id)}
                    disabled={!isVoted && votesRemaining === 0}
                    className="text-left rounded-2xl p-5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: isVoted
                        ? 'rgba(255,255,255,0.48)'
                        : 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(40px) saturate(180%)',
                      border: isVoted
                        ? `2px solid ${sourceColor}40`
                        : '1px solid rgba(255,255,255,0.35)',
                      boxShadow: isVoted
                        ? `0 0 20px ${sourceColor}10, 0 8px 32px rgba(0,0,0,0.06)`
                        : '0 8px 32px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Source label */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${sourceColor}10`,
                          color: sourceColor,
                          border: `1px solid ${sourceColor}20`,
                        }}
                      >
                        {idea.source}
                      </span>
                      {/* Vote dots */}
                      {isVoted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex gap-1"
                        >
                          {Array.from({ length: idea.votes }).map((_, i) => (
                            <div
                              key={i}
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: sourceColor }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#1A1A1A' }}
                    >
                      {idea.text}
                    </p>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <p className="text-sm" style={{ color: '#6A7A8A' }}>
            No ideas to vote on yet. Complete the other exercises first.
          </p>
        </motion.div>
      )}

      {/* Top Ideas section */}
      {topIdeas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12"
        >
          <div className="mb-6">
            <h2 className="title-caps-md" style={{ color: '#1A1A1A' }}>
              Top Ideas
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#2E2E2E' }}>
              Your highest-voted ideas, ready to pursue.
            </p>
          </div>

          <div className="space-y-3">
            {topIdeas.map((idea, idx) => {
              const sourceColor = SOURCE_COLORS[idea.source] || '#6A7A8A'
              return (
                <motion.div
                  key={`top-${idea.id}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="liquid-glass-strong rounded-2xl p-5 flex items-center gap-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: sourceColor }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed" style={{ color: '#1A1A1A' }}>
                      {idea.text}
                    </p>
                    <span className="text-xs mt-1 block" style={{ color: '#6A7A8A' }}>
                      from {idea.source}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {Array.from({ length: idea.votes }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: sourceColor }}
                      />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Main Ideation Page
   ──────────────────────────────────────────────────────────── */

export default function IdeationPage() {
  const { currentExercise, setCurrentExercise, hmwQuestions } =
    useIdeationStore()

  const canAdvance = () => {
    switch (currentExercise) {
      case 0:
        return hmwQuestions.length > 0
      default:
        return true
    }
  }

  const goNext = () => {
    if (currentExercise < 4) {
      setCurrentExercise(currentExercise + 1)
    }
  }

  const goPrev = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      {/* Step indicator */}
      <StepIndicator current={currentExercise} onChange={setCurrentExercise} />

      {/* Exercise content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {currentExercise === 0 && <RoomSetup />}
          {currentExercise === 1 && <HowMightWeExercise />}
          {currentExercise === 2 && <Crazy8sExercise />}
          {currentExercise === 3 && <WorstIdeaExercise />}
          {currentExercise === 4 && <CreativeMatrixExercise />}
          {currentExercise === 5 && <DotVoteExercise />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom navigation */}
      <div className="mt-12 flex items-center justify-between">
        {currentExercise > 0 ? (
          <button
            onClick={goPrev}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all"
            style={{
              color: 'rgba(26,26,26,0.4)',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
        ) : (
          <div />
        )}

        {currentExercise < 4 && (
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
            style={{ backgroundColor: '#2E5E8C' }}
          >
            Next Exercise
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
