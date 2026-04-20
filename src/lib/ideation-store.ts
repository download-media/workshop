'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */

export type ParticipantRole = 'wild-ideator' | 'devils-advocate' | 'builder' | 'connector' | 'none'

export const ROLES: { value: ParticipantRole; label: string; description: string }[] = [
  { value: 'wild-ideator', label: 'WILD IDEATOR', description: 'Go big. No filter. The wilder the better.' },
  { value: 'devils-advocate', label: "DEVIL'S ADVOCATE", description: 'Challenge every idea. Poke holes. Stress test.' },
  { value: 'builder', label: 'BUILDER', description: 'Take rough ideas and make them real. Add detail.' },
  { value: 'connector', label: 'CONNECTOR', description: 'Find links between ideas. Combine the unexpected.' },
  { value: 'none', label: 'NO ROLE', description: 'Freeform. Contribute however feels right.' },
]

export interface Participant {
  id: string
  name: string
  role: ParticipantRole
}

export interface Crazy8Idea {
  id: string
  panelIndex: number // 0-7
  text: string
  sketch: string // text description
}

export interface WorstIdea {
  id: string
  badIdea: string
  flippedIdea: string
}

export interface MatrixCell {
  id: string
  row: string // category label
  col: string // inspiration source label
  idea: string
}

export interface VotedIdea {
  id: string
  source: string // which exercise
  text: string
  votes: number
}

/* ────────────────────────────────────────────────────────────
   Store interface
   ──────────────────────────────────────────────────────────── */

interface IdeationStore {
  // Participants
  participants: Participant[]
  addParticipant: (name: string) => void
  updateParticipant: (id: string, data: Partial<Participant>) => void
  removeParticipant: (id: string) => void
  maxVotes: () => number

  // HMW
  hmwQuestions: string[]
  addHmwQuestion: (q: string) => void
  removeHmwQuestion: (index: number) => void

  // Crazy 8s
  crazy8Ideas: Crazy8Idea[]
  setCrazy8Idea: (panelIndex: number, text: string) => void
  updateCrazy8Idea: (id: string, data: Partial<Crazy8Idea>) => void

  // Worst Possible Idea
  worstIdeas: WorstIdea[]
  addWorstIdea: (badIdea: string) => void
  updateWorstIdea: (id: string, data: Partial<WorstIdea>) => void
  removeWorstIdea: (id: string) => void

  // Creative Matrix
  matrixCells: MatrixCell[]
  matrixRows: string[]
  matrixCols: string[]
  setMatrixCell: (row: string, col: string, idea: string) => void
  addMatrixRow: (label: string) => void
  removeMatrixRow: (label: string) => void
  updateMatrixRow: (oldLabel: string, newLabel: string) => void
  addMatrixCol: (label: string) => void
  removeMatrixCol: (label: string) => void
  updateMatrixCol: (oldLabel: string, newLabel: string) => void

  // Dot Vote
  votedIdeas: VotedIdea[]
  collectIdeasForVoting: () => void
  toggleVote: (id: string) => void
  totalVotesUsed: () => number

  // Navigation
  currentExercise: number // 0-4
  setCurrentExercise: (idx: number) => void

  // Reset
  resetIdeation: () => void
}

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const DEFAULT_ROWS = ['Brand Story', 'Educational', 'Entertainment', 'Behind the Scenes']
const DEFAULT_COLS = ['Competitor X', 'Completely Different Industry', 'A Film/Show', 'A Meme/Trend']

const initialCrazy8Ideas: Crazy8Idea[] = Array.from({ length: 8 }, (_, i) => ({
  id: `c8-${i}`,
  panelIndex: i,
  text: '',
  sketch: '',
}))

const initialState = {
  participants: [] as Participant[],
  hmwQuestions: [] as string[],
  crazy8Ideas: initialCrazy8Ideas,
  worstIdeas: [] as WorstIdea[],
  matrixCells: [] as MatrixCell[],
  matrixRows: DEFAULT_ROWS,
  matrixCols: DEFAULT_COLS,
  votedIdeas: [] as VotedIdea[],
  currentExercise: 0,
}

/* ────────────────────────────────────────────────────────────
   Store
   ──────────────────────────────────────────────────────────── */

export const useIdeationStore = create<IdeationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Participants ────────────────────────────────────
      addParticipant: (name) =>
        set((s) => ({
          participants: [...s.participants, { id: uid(), name, role: 'none' }],
        })),
      updateParticipant: (id, data) =>
        set((s) => ({
          participants: s.participants.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      removeParticipant: (id) =>
        set((s) => ({
          participants: s.participants.filter((p) => p.id !== id),
        })),
      maxVotes: () => {
        const s = get()
        return Math.max(s.participants.length, 1) // at least 1 vote even with no participants
      },

      // ── HMW ─────────────────────────────────────────────
      addHmwQuestion: (q) =>
        set((s) => ({ hmwQuestions: [...s.hmwQuestions, q] })),
      removeHmwQuestion: (index) =>
        set((s) => ({
          hmwQuestions: s.hmwQuestions.filter((_, i) => i !== index),
        })),

      // ── Crazy 8s ────────────────────────────────────────
      setCrazy8Idea: (panelIndex, text) =>
        set((s) => ({
          crazy8Ideas: s.crazy8Ideas.map((idea) =>
            idea.panelIndex === panelIndex ? { ...idea, text } : idea
          ),
        })),
      updateCrazy8Idea: (id, data) =>
        set((s) => ({
          crazy8Ideas: s.crazy8Ideas.map((idea) =>
            idea.id === id ? { ...idea, ...data } : idea
          ),
        })),

      // ── Worst Possible Idea ─────────────────────────────
      addWorstIdea: (badIdea) =>
        set((s) => ({
          worstIdeas: [
            ...s.worstIdeas,
            { id: uid(), badIdea, flippedIdea: '' },
          ],
        })),
      updateWorstIdea: (id, data) =>
        set((s) => ({
          worstIdeas: s.worstIdeas.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
        })),
      removeWorstIdea: (id) =>
        set((s) => ({
          worstIdeas: s.worstIdeas.filter((w) => w.id !== id),
        })),

      // ── Creative Matrix ─────────────────────────────────
      setMatrixCell: (row, col, idea) =>
        set((s) => {
          const existing = s.matrixCells.find(
            (c) => c.row === row && c.col === col
          )
          if (existing) {
            return {
              matrixCells: s.matrixCells.map((c) =>
                c.id === existing.id ? { ...c, idea } : c
              ),
            }
          }
          return {
            matrixCells: [
              ...s.matrixCells,
              { id: uid(), row, col, idea },
            ],
          }
        }),
      addMatrixRow: (label) =>
        set((s) => ({
          matrixRows: [...s.matrixRows, label],
        })),
      removeMatrixRow: (label) =>
        set((s) => ({
          matrixRows: s.matrixRows.filter((r) => r !== label),
          matrixCells: s.matrixCells.filter((c) => c.row !== label),
        })),
      updateMatrixRow: (oldLabel, newLabel) =>
        set((s) => ({
          matrixRows: s.matrixRows.map((r) =>
            r === oldLabel ? newLabel : r
          ),
          matrixCells: s.matrixCells.map((c) =>
            c.row === oldLabel ? { ...c, row: newLabel } : c
          ),
        })),
      addMatrixCol: (label) =>
        set((s) => ({
          matrixCols: [...s.matrixCols, label],
        })),
      removeMatrixCol: (label) =>
        set((s) => ({
          matrixCols: s.matrixCols.filter((c) => c !== label),
          matrixCells: s.matrixCells.filter((c) => c.col !== label),
        })),
      updateMatrixCol: (oldLabel, newLabel) =>
        set((s) => ({
          matrixCols: s.matrixCols.map((c) =>
            c === oldLabel ? newLabel : c
          ),
          matrixCells: s.matrixCells.map((c) =>
            c.col === oldLabel ? { ...c, col: newLabel } : c
          ),
        })),

      // ── Dot Vote ────────────────────────────────────────
      collectIdeasForVoting: () => {
        const s = get()
        const collected: VotedIdea[] = []

        // HMW questions
        s.hmwQuestions.forEach((q) => {
          collected.push({
            id: uid(),
            source: 'How Might We',
            text: q,
            votes: 0,
          })
        })

        // Crazy 8 ideas
        s.crazy8Ideas
          .filter((idea) => idea.text.trim())
          .forEach((idea) => {
            collected.push({
              id: uid(),
              source: 'Crazy 8s',
              text: idea.text,
              votes: 0,
            })
          })

        // Flipped ideas from Worst Possible Idea
        s.worstIdeas
          .filter((w) => w.flippedIdea.trim())
          .forEach((w) => {
            collected.push({
              id: uid(),
              source: 'Worst Idea Flip',
              text: w.flippedIdea,
              votes: 0,
            })
          })

        // Matrix cell ideas
        s.matrixCells
          .filter((c) => c.idea.trim())
          .forEach((c) => {
            collected.push({
              id: uid(),
              source: 'Creative Matrix',
              text: c.idea,
              votes: 0,
            })
          })

        // Preserve existing votes if re-collecting
        const existingVotes = new Map(
          s.votedIdeas.map((v) => [v.text, v.votes])
        )
        collected.forEach((item) => {
          const prev = existingVotes.get(item.text)
          if (prev !== undefined) item.votes = prev
        })

        set({ votedIdeas: collected })
      },

      toggleVote: (id) =>
        set((s) => {
          const item = s.votedIdeas.find((v) => v.id === id)
          if (!item) return s

          const totalUsed = s.votedIdeas.reduce(
            (sum, v) => sum + v.votes,
            0
          )

          // If already voted, remove vote
          if (item.votes > 0) {
            return {
              votedIdeas: s.votedIdeas.map((v) =>
                v.id === id ? { ...v, votes: 0 } : v
              ),
            }
          }

          // If under max votes (= number of participants), add vote
          const max = get().maxVotes()
          if (totalUsed < max) {
            return {
              votedIdeas: s.votedIdeas.map((v) =>
                v.id === id ? { ...v, votes: 1 } : v
              ),
            }
          }

          return s
        }),

      totalVotesUsed: () => {
        const s = get()
        return s.votedIdeas.reduce((sum, v) => sum + v.votes, 0)
      },

      // ── Navigation ──────────────────────────────────────
      setCurrentExercise: (idx) => set({ currentExercise: idx }),

      // ── Reset ───────────────────────────────────────────
      resetIdeation: () => set(initialState),
    }),
    { name: 'ideation-store' }
  )
)
