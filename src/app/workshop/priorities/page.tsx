'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronUp } from 'lucide-react'
import { useWorkshopStore } from '@/lib/store'
import { PhaseHeader } from '@/components/workshop/PhaseHeader'
import { ExerciseCard } from '@/components/workshop/ExerciseCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const RANK_COLORS = ['#2E5E8C', '#4A8AC2', '#E8855A']

/* ────────────────────────────────────────────────────────────
   Timeline Milestones
   ──────────────────────────────────────────────────────────── */

interface MilestoneData {
  summaryBy: string
  firstDraftBy: string
  firstLiveBy: string
}

const MILESTONE_COLORS = ['#4A8AC2', '#E8855A', '#2E5E8C']

function TimelineSection() {
  const [milestones, setMilestones] = useState<MilestoneData>({
    summaryBy: '',
    firstDraftBy: '',
    firstLiveBy: '',
  })

  const items = [
    { key: 'summaryBy' as const, label: 'Workshop summary delivered by' },
    { key: 'firstDraftBy' as const, label: 'First content draft by' },
    { key: 'firstLiveBy' as const, label: 'First content live by' },
  ]

  return (
    <div className="mt-10">
      <ExerciseCard
        title="Timeline"
        description="Set key milestones to keep momentum after the workshop."
      >
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[15px] top-2 bottom-2 w-px"
            style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
          />

          <div className="space-y-8">
            {items.map((item, idx) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex items-start gap-4 pl-0"
              >
                {/* Simple circle marker */}
                <div
                  className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${MILESTONE_COLORS[idx]}15`,
                    border: `2px solid ${MILESTONE_COLORS[idx]}`,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: MILESTONE_COLORS[idx] }}
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#1A1A1A' }}>
                    {item.label}
                  </label>
                  <input
                    type="date"
                    value={milestones[item.key]}
                    onChange={(e) =>
                      setMilestones((prev) => ({ ...prev, [item.key]: e.target.value }))
                    }
                    className="max-w-xs border-0 border-b-2 bg-transparent px-0 py-1 text-sm outline-none transition-colors focus:ring-0"
                    style={{
                      color: '#1A1A1A',
                      borderBottomColor: milestones[item.key] ? MILESTONE_COLORS[idx] : 'rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ExerciseCard>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Priority Cards
   ──────────────────────────────────────────────────────────── */

function PriorityCards() {
  const { priorities, addPriority, updatePriority, removePriority } = useWorkshopStore()

  const sortedPriorities = [...priorities].sort((a, b) => b.votes - a.votes)

  const handleAdd = () => {
    addPriority({
      id: uid(),
      description: '',
      owner: '',
      deadline: '',
      votes: 0,
    })
  }

  return (
    <ExerciseCard
      title="Priority Ranking"
      description="Add priorities and vote to surface the most important actions. Cards auto-sort by votes."
      time="15 min"
    >
      <div className="mb-6 flex items-center justify-end">
        <Button onClick={handleAdd} size="sm" className="gap-1.5 bg-[#2E5E8C] text-white hover:bg-[#2E5E8C]/90">
          <Plus className="h-3.5 w-3.5" />
          Add Priority
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {sortedPriorities.map((priority, idx) => (
            <motion.div
              key={priority.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, layout: { type: 'spring', bounce: 0.15 } }}
              className="liquid-glass group relative rounded-2xl p-5"
            >
              <div className="flex gap-4">
                {/* Vote button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => updatePriority(priority.id, { votes: priority.votes + 1 })}
                    className="flex flex-col items-center rounded-xl px-3 py-3 transition-all active:scale-95 bg-white/40 border border-white/50 hover:bg-white/60"
                    aria-label={`Upvote priority, current votes: ${priority.votes}`}
                  >
                    <ChevronUp className="h-5 w-5" style={{ color: '#4A8AC2' }} />
                    <span
                      className="mt-1 text-lg font-bold"
                      style={{ color: '#1A1A1A' }}
                    >
                      {priority.votes}
                    </span>
                  </button>
                  {/* Rank badge */}
                  {idx < 3 && priority.votes > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: RANK_COLORS[idx] }}
                    >
                      #{idx + 1}
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Describe this priority..."
                    value={priority.description}
                    onChange={(e) =>
                      updatePriority(priority.id, { description: e.target.value })
                    }
                    className="min-h-14 text-sm"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs" style={{ color: '#6A7A8A' }}>
                        Owner
                      </label>
                      <Input
                        placeholder="Who's responsible?"
                        value={priority.owner}
                        onChange={(e) =>
                          updatePriority(priority.id, { owner: e.target.value })
                        }
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs" style={{ color: '#6A7A8A' }}>
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={priority.deadline}
                        onChange={(e) =>
                          updatePriority(priority.id, { deadline: e.target.value })
                        }
                        className="h-8 w-full border-0 border-b-2 bg-transparent px-0 py-1 text-xs outline-none transition-colors focus:ring-0"
                        style={{
                          color: '#1A1A1A',
                          borderBottomColor: priority.deadline ? '#4A8AC2' : 'rgba(0,0,0,0.1)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removePriority(priority.id)}
                  className="mt-1 self-start rounded-lg p-1.5 opacity-0 transition-all hover:bg-[#E85A5A]/10 group-hover:opacity-100"
                  style={{ color: '#6A7A8A' }}
                  aria-label="Remove priority"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {priorities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <p className="text-sm" style={{ color: '#6A7A8A' }}>No priorities yet</p>
          <p className="mt-1 text-xs" style={{ color: '#6A7A8A' }}>
            Add priorities and vote to rank them by importance
          </p>
        </motion.div>
      )}
    </ExerciseCard>
  )
}

/* ────────────────────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────────────────────── */

export default function PrioritiesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PhaseHeader
        number={5}
        title="Priorities"
        subtitle="What matters first"
        color="#4A8AC2"
      />

      <PriorityCards />
      <TimelineSection />
    </div>
  )
}
