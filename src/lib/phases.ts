import type { Phase } from './types'

export const PHASES: Phase[] = [
  {
    id: 'setup',
    number: 0,
    title: 'Setup',
    subtitle: 'Configure your workshop',
    color: '#ffffff',
    exercises: [],
  },
  {
    id: 'foundation',
    number: 1,
    title: 'Foundation',
    subtitle: 'Who are you',
    color: '#82f45d',
    exercises: ['golden-circle'],
  },
  {
    id: 'audience',
    number: 2,
    title: 'Audience',
    subtitle: 'Who do you serve',
    color: '#1d52d4',
    exercises: ['top-audiences', 'empathy-map', 'before-after'],
  },
  {
    id: 'position',
    number: 3,
    title: 'Position',
    subtitle: 'Where do you sit',
    color: '#ffaa71',
    exercises: ['competitor-audit', 'landscape-matrix'],
  },
  {
    id: 'application',
    number: 4,
    title: 'Application',
    subtitle: 'What do we build',
    color: '#82f45d',
    exercises: ['content', 'creative-direction', 'content-pillars', 'campaign-ideation'],
  },
  {
    id: 'priorities',
    number: 5,
    title: 'Priorities',
    subtitle: 'What matters first',
    color: '#a4e2f0',
    exercises: ['priority-ranking'],
  },
]

export const getPhase = (id: string) => PHASES.find((p) => p.id === id)
export const getNextPhase = (id: string) => {
  const idx = PHASES.findIndex((p) => p.id === id)
  return idx < PHASES.length - 1 ? PHASES[idx + 1] : null
}
export const getPrevPhase = (id: string) => {
  const idx = PHASES.findIndex((p) => p.id === id)
  return idx > 0 ? PHASES[idx - 1] : null
}
