'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  WorkshopConfig,
  GoldenCircle,
  Audience,
  EmpathyMap,
  BeforeAfter,
  Competitor,
  LandscapePosition,
  VoiceAttribute,
  PersonalitySlider,
  VoiceGuardrail,
  ToneDimension,
  ContentPillar,
  PlatformStrategy,
  VideoStyle,
  CampaignIdea,
  Priority,
  PhaseId,
  Logistics,
  OnCameraPerson,
} from './types'

interface WorkshopStore {
  // Navigation
  currentPhase: PhaseId
  setCurrentPhase: (phase: PhaseId) => void

  // Config
  config: WorkshopConfig
  setConfig: (config: Partial<WorkshopConfig>) => void

  // Phase 1: Foundation
  goldenCircle: GoldenCircle
  setGoldenCircle: (data: Partial<GoldenCircle>) => void

  // Phase 2: Audience
  audiences: Audience[]
  addAudience: (audience: Audience) => void
  updateAudience: (id: string, data: Partial<Audience>) => void
  removeAudience: (id: string) => void
  empathyMaps: EmpathyMap[]
  setEmpathyMap: (map: EmpathyMap) => void
  beforeAfter: BeforeAfter
  setBeforeAfter: (data: Partial<BeforeAfter>) => void

  // Phase 3: Position
  competitors: Competitor[]
  addCompetitor: (competitor: Competitor) => void
  updateCompetitor: (id: string, data: Partial<Competitor>) => void
  removeCompetitor: (id: string) => void
  landscapePositions: LandscapePosition[]
  addLandscapePosition: (pos: LandscapePosition) => void
  updateLandscapePosition: (id: string, data: Partial<LandscapePosition>) => void
  removeLandscapePosition: (id: string) => void
  landscapeAxes: { xLeft: string; xRight: string; yTop: string; yBottom: string }
  setLandscapeAxes: (axes: Partial<{ xLeft: string; xRight: string; yTop: string; yBottom: string }>) => void

  // Phase 4: Identity
  voiceAttributes: VoiceAttribute[]
  setVoiceAttributes: (attrs: VoiceAttribute[]) => void
  updateVoiceAttribute: (id: string, category: VoiceAttribute['category']) => void
  personalitySliders: PersonalitySlider[]
  updatePersonalitySlider: (id: string, value: number) => void
  voiceGuardrails: VoiceGuardrail[]
  addVoiceGuardrail: (guardrail: VoiceGuardrail) => void
  updateVoiceGuardrail: (id: string, data: Partial<VoiceGuardrail>) => void
  removeVoiceGuardrail: (id: string) => void
  toneDimensions: ToneDimension[]
  updateToneDimension: (id: string, value: number) => void

  // Phase 5: Application
  contentPillars: ContentPillar[]
  addContentPillar: (pillar: ContentPillar) => void
  updateContentPillar: (id: string, data: Partial<ContentPillar>) => void
  removeContentPillar: (id: string) => void
  platformStrategies: PlatformStrategy[]
  updatePlatformStrategy: (id: string, data: Partial<PlatformStrategy>) => void
  logistics: Logistics
  setLogistics: (data: Partial<Logistics>) => void
  addOnCameraPerson: (person: OnCameraPerson) => void
  updateOnCameraPerson: (id: string, data: Partial<OnCameraPerson>) => void
  removeOnCameraPerson: (id: string) => void
  videoStyles: VideoStyle[]
  updateVideoStyle: (id: string, rating: number) => void
  campaignIdeas: CampaignIdea[]
  addCampaignIdea: (idea: CampaignIdea) => void
  updateCampaignIdea: (id: string, data: Partial<CampaignIdea>) => void
  removeCampaignIdea: (id: string) => void

  // Phase 6: Priorities
  priorities: Priority[]
  addPriority: (priority: Priority) => void
  updatePriority: (id: string, data: Partial<Priority>) => void
  removePriority: (id: string) => void

  // Reset
  resetWorkshop: () => void
}

const defaultVoiceAttributes: VoiceAttribute[] = [
  'Confident', 'Witty', 'Technical', 'Warm', 'Bold', 'Playful',
  'Authoritative', 'Approachable', 'Disruptive', 'Trustworthy',
  'Edgy', 'Professional', 'Friendly', 'Sharp', 'Human',
  'Innovative', 'Casual', 'Expert', 'Progressive', 'Direct',
  'Thoughtful', 'Energetic', 'Relatable', 'Precise', 'Visionary',
].map((word, i) => ({ id: `va-${i}`, word, category: 'torn' as const }))

const defaultSliders: PersonalitySlider[] = [
  { id: 'ps-1', leftLabel: 'Friendly', rightLabel: 'Authority', value: 50 },
  { id: 'ps-2', leftLabel: 'Innovative', rightLabel: 'Classic', value: 50 },
  { id: 'ps-3', leftLabel: 'Playful', rightLabel: 'Serious', value: 50 },
  { id: 'ps-4', leftLabel: 'Mass Appeal', rightLabel: 'Elite', value: 50 },
  { id: 'ps-5', leftLabel: 'Casual', rightLabel: 'Formal', value: 50 },
  { id: 'ps-6', leftLabel: 'Bold', rightLabel: 'Subtle', value: 50 },
]

const defaultTone: ToneDimension[] = [
  { id: 'td-1', leftLabel: 'Funny', rightLabel: 'Serious', value: 5 },
  { id: 'td-2', leftLabel: 'Casual', rightLabel: 'Formal', value: 5 },
  { id: 'td-3', leftLabel: 'Irreverent', rightLabel: 'Respectful', value: 5 },
  { id: 'td-4', leftLabel: 'Enthusiastic', rightLabel: 'Matter-of-fact', value: 5 },
]

const defaultPlatforms: PlatformStrategy[] = [
  { id: 'pl-1', platform: 'LinkedIn', role: '', audience: '', contentTypes: '', frequency: '', priority: '' },
  { id: 'pl-2', platform: 'Instagram', role: '', audience: '', contentTypes: '', frequency: '', priority: '' },
  { id: 'pl-3', platform: 'TikTok', role: '', audience: '', contentTypes: '', frequency: '', priority: '' },
  { id: 'pl-4', platform: 'YouTube', role: '', audience: '', contentTypes: '', frequency: '', priority: '' },
  { id: 'pl-5', platform: 'X / Twitter', role: '', audience: '', contentTypes: '', frequency: '', priority: '' },
]

const defaultVideoStyles: VideoStyle[] = [
  { id: 'vs-1', style: 'Polished Brand Film', rating: 0 },
  { id: 'vs-2', style: 'Raw / iPhone', rating: 0 },
  { id: 'vs-3', style: 'Interview / Talking Head', rating: 0 },
  { id: 'vs-4', style: 'Day-in-the-Life', rating: 0 },
  { id: 'vs-5', style: 'Motion Graphics', rating: 0 },
  { id: 'vs-6', style: 'Humor-Driven', rating: 0 },
  { id: 'vs-7', style: 'Creative / Experimental', rating: 0 },
  { id: 'vs-8', style: 'Educational / How-To', rating: 0 },
  { id: 'vs-9', style: 'Testimonial / Social Proof', rating: 0 },
]

const initialState = {
  currentPhase: 'setup' as PhaseId,
  config: { clientName: '', facilitatorName: '', serviceType: 'social' as const, date: new Date().toISOString().split('T')[0] },
  goldenCircle: { what: '', how: '', why: '', leadTheme: '' },
  audiences: [],
  empathyMaps: [],
  beforeAfter: { before: [], after: [], statement: '' },
  competitors: [],
  landscapePositions: [],
  landscapeAxes: { xLeft: 'Polished', xRight: 'Raw', yTop: 'Corporate', yBottom: 'Human' },
  voiceAttributes: defaultVoiceAttributes,
  personalitySliders: defaultSliders,
  voiceGuardrails: [],
  toneDimensions: defaultTone,
  contentPillars: [],
  platformStrategies: defaultPlatforms,
  logistics: {
    onCameraPeople: [],
    platforms: [],
    postingVolume: '',
    videoPercentage: '',
    carouselPercentage: '',
    otherFormats: '',
    shootFrequency: '',
    socialGoal: '',
    socialPurpose: '',
    desiredOutcomes: [] as string[],
    storyStrategy: '',
    metaAdsBudget: '',
    metaAdsGoal: '',
    metaAdsNotes: '',
    pointOfContact: '',
    contactPlatform: '',
    contactAvailability: '',
    notes: '',
  } as Logistics,
  videoStyles: defaultVideoStyles,
  campaignIdeas: [],
  priorities: [],
}

export const useWorkshopStore = create<WorkshopStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      setConfig: (config) => set((s) => ({ config: { ...s.config, ...config } })),
      setGoldenCircle: (data) => set((s) => ({ goldenCircle: { ...s.goldenCircle, ...data } })),

      addAudience: (audience) => set((s) => ({ audiences: [...s.audiences, audience] })),
      updateAudience: (id, data) => set((s) => ({ audiences: s.audiences.map((a) => a.id === id ? { ...a, ...data } : a) })),
      removeAudience: (id) => set((s) => ({ audiences: s.audiences.filter((a) => a.id !== id) })),

      setEmpathyMap: (map) => set((s) => ({
        empathyMaps: s.empathyMaps.some((m) => m.audienceId === map.audienceId)
          ? s.empathyMaps.map((m) => m.audienceId === map.audienceId ? map : m)
          : [...s.empathyMaps, map],
      })),

      setBeforeAfter: (data) => set((s) => ({ beforeAfter: { ...s.beforeAfter, ...data } })),

      addCompetitor: (competitor) => set((s) => ({ competitors: [...s.competitors, competitor] })),
      updateCompetitor: (id, data) => set((s) => ({ competitors: s.competitors.map((c) => c.id === id ? { ...c, ...data } : c) })),
      removeCompetitor: (id) => set((s) => ({ competitors: s.competitors.filter((c) => c.id !== id) })),

      addLandscapePosition: (pos) => set((s) => ({ landscapePositions: [...s.landscapePositions, pos] })),
      updateLandscapePosition: (id, data) => set((s) => ({ landscapePositions: s.landscapePositions.map((p) => p.id === id ? { ...p, ...data } : p) })),
      removeLandscapePosition: (id) => set((s) => ({ landscapePositions: s.landscapePositions.filter((p) => p.id !== id) })),
      setLandscapeAxes: (axes) => set((s) => ({ landscapeAxes: { ...s.landscapeAxes, ...axes } })),

      setVoiceAttributes: (attrs) => set({ voiceAttributes: attrs }),
      updateVoiceAttribute: (id, category) => set((s) => ({
        voiceAttributes: s.voiceAttributes.map((a) => a.id === id ? { ...a, category } : a),
      })),

      updatePersonalitySlider: (id, value) => set((s) => ({
        personalitySliders: s.personalitySliders.map((sl) => sl.id === id ? { ...sl, value } : sl),
      })),

      addVoiceGuardrail: (g) => set((s) => ({ voiceGuardrails: [...s.voiceGuardrails, g] })),
      updateVoiceGuardrail: (id, data) => set((s) => ({ voiceGuardrails: s.voiceGuardrails.map((g) => g.id === id ? { ...g, ...data } : g) })),
      removeVoiceGuardrail: (id) => set((s) => ({ voiceGuardrails: s.voiceGuardrails.filter((g) => g.id !== id) })),

      updateToneDimension: (id, value) => set((s) => ({
        toneDimensions: s.toneDimensions.map((t) => t.id === id ? { ...t, value } : t),
      })),

      addContentPillar: (pillar) => set((s) => ({ contentPillars: [...s.contentPillars, pillar] })),
      updateContentPillar: (id, data) => set((s) => ({ contentPillars: s.contentPillars.map((p) => p.id === id ? { ...p, ...data } : p) })),
      removeContentPillar: (id) => set((s) => ({ contentPillars: s.contentPillars.filter((p) => p.id !== id) })),

      updatePlatformStrategy: (id, data) => set((s) => ({ platformStrategies: s.platformStrategies.map((p) => p.id === id ? { ...p, ...data } : p) })),

      setLogistics: (data) => set((s) => ({ logistics: { ...s.logistics, ...data } })),
      addOnCameraPerson: (person) => set((s) => ({ logistics: { ...s.logistics, onCameraPeople: [...s.logistics.onCameraPeople, person] } })),
      updateOnCameraPerson: (id, data) => set((s) => ({ logistics: { ...s.logistics, onCameraPeople: s.logistics.onCameraPeople.map((p) => p.id === id ? { ...p, ...data } : p) } })),
      removeOnCameraPerson: (id) => set((s) => ({ logistics: { ...s.logistics, onCameraPeople: s.logistics.onCameraPeople.filter((p) => p.id !== id) } })),

      updateVideoStyle: (id, rating) => set((s) => ({ videoStyles: s.videoStyles.map((v) => v.id === id ? { ...v, rating } : v) })),


      addCampaignIdea: (idea) => set((s) => ({ campaignIdeas: [...s.campaignIdeas, idea] })),
      updateCampaignIdea: (id, data) => set((s) => ({ campaignIdeas: s.campaignIdeas.map((i) => i.id === id ? { ...i, ...data } : i) })),
      removeCampaignIdea: (id) => set((s) => ({ campaignIdeas: s.campaignIdeas.filter((i) => i.id !== id) })),

      addPriority: (priority) => set((s) => ({ priorities: [...s.priorities, priority] })),
      updatePriority: (id, data) => set((s) => ({ priorities: s.priorities.map((p) => p.id === id ? { ...p, ...data } : p) })),
      removePriority: (id) => set((s) => ({ priorities: s.priorities.filter((p) => p.id !== id) })),

      resetWorkshop: () => set(initialState),
    }),
    { name: 'workshop-store' }
  )
)
