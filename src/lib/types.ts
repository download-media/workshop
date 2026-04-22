export interface WorkshopConfig {
  clientName: string
  facilitatorName: string
  serviceType: 'social' | 'web' | 'branding' | 'ideation'
  date: string
}

export interface GoldenCircle {
  what: string
  how: string
  why: string
  leadTheme: string
}

export interface Audience {
  id: string
  name: string
  description: string
  platformBehavior: string
  rank: number
}

export interface EmpathyMap {
  audienceId: string
  says: string[]
  thinks: string[]
  feels: string[]
  does: string[]
}

export interface BeforeAfter {
  before: string[]
  after: string[]
  statement: string
}

export interface Competitor {
  id: string
  name: string
  platforms: string
  visualIdentity: number
  contentThemes: string
  engagement: number
  tone: string
  gaps: string
}

export interface LandscapePosition {
  id: string
  name: string
  x: number // 0-100
  y: number // 0-100
  isClient?: boolean
}

export interface VoiceAttribute {
  id: string
  word: string
  category: 'we-are' | 'torn' | 'we-are-not'
}

export interface PersonalitySlider {
  id: string
  leftLabel: string
  rightLabel: string
  value: number // 0-100
}

export interface VoiceGuardrail {
  id: string
  positive: string
  negative: string
}

export interface ToneDimension {
  id: string
  leftLabel: string
  rightLabel: string
  value: number // 1-10
  platformValues?: Record<string, number>
}

export interface ContentPillar {
  id: string
  name: string
  description: string
  businessAlignment: number
  audienceInterest: number
  credibility: number
  sustainability: number
  contentIdeas: string[]
}

export interface PlatformStrategy {
  id: string
  platform: string
  role: string
  audience: string
  contentTypes: string
  frequency: string
  priority: 'kill' | 'keep' | 'invest' | ''
}

export interface OnCameraPerson {
  id: string
  name: string
  role: string
  notes: string
}

export interface Logistics {
  onCameraPeople: OnCameraPerson[]
  platforms: string[]
  postingVolume: string
  videoPercentage: string
  carouselPercentage: string
  otherFormats: string
  shootFrequency: string
  socialGoal: string
  socialPurpose: string
  desiredOutcomes: string[]
  storyStrategy: string
  metaAdsBudget: string
  metaAdsGoal: string
  metaAdsNotes: string
  pointOfContact: string
  contactPlatform: string
  contactAvailability: string
  notes: string
}

export interface VideoStyle {
  id: string
  style: string
  rating: number
}

export interface ShotIdea {
  id: string
  description: string
  style: string
  pillar: string
}

export interface ContentHook {
  id: string
  hook: string
  format: string
}

export interface CampaignIdea {
  id: string
  concept: string
  platform: string
  format: string
  votes: number
}

export interface Priority {
  id: string
  description: string
  owner: string
  deadline: string
  votes: number
}

export type PhaseId = 'setup' | 'foundation' | 'audience' | 'position' | 'identity' | 'application' | 'priorities'

export interface Phase {
  id: PhaseId
  number: number
  title: string
  subtitle: string
  color: string
  exercises: string[]
}
