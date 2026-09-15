// Builds the "hand off to AI" markdown — a self-contained brief any AI (or human)
// can work from without ever having seen the workshop.
import type { WorkshopSummaryData } from '@/components/summary/SummaryDocument'

const SERVICE_LABELS: Record<string, string> = {
  social: 'Social Media',
  web: 'Web Development',
  branding: 'Brand Strategy',
  ideation: 'Creative Ideation',
}

function section(title: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return ''
  return `## ${title}\n\n${trimmed}\n\n`
}

export function buildHandoffMarkdown(data: WorkshopSummaryData): string {
  const c = data.config
  const lines: string[] = []

  lines.push(`# Brand Workshop Handoff — ${c.clientName}`)
  lines.push('')
  lines.push(`- **Client:** ${c.clientName}`)
  lines.push(`- **Service:** ${SERVICE_LABELS[c.serviceType] || c.serviceType}`)
  lines.push(`- **Workshop date:** ${c.date}`)
  lines.push(`- **Facilitator:** ${c.facilitatorName}`)
  lines.push(`- **Prepared by:** Download Media (DWNLD)`)
  lines.push('')
  lines.push(`## How to use this document`)
  lines.push('')
  lines.push(`You are picking up creative or strategic work for ${c.clientName}. Everything below was decided in a live brand discovery workshop with the client in the room. Treat these as decisions, not suggestions. When you produce work (copy, content calendars, design direction, campaign concepts), it must line up with the voice, audience priorities, and positioning captured here. Do not use em dashes or hyphens as punctuation in any client-facing copy.`)
  lines.push('')

  let out = lines.join('\n')

  // Golden circle
  const g = data.goldenCircle
  if (g && (g.why || g.how || g.what)) {
    out += section('Foundation (Golden Circle)', [
      g.why && `- **Why (the belief):** ${g.why}`,
      g.how && `- **How (the approach):** ${g.how}`,
      g.what && `- **What (the offer):** ${g.what}`,
      g.leadTheme && `- **Lead theme:** ${g.leadTheme}`,
    ].filter(Boolean).join('\n'))
  }

  // Audiences
  const audiences = (data.audiences || []).slice().sort((a, b) => a.rank - b.rank)
  if (audiences.length) {
    out += section('Audiences (ranked by priority)', audiences.map((a, i) => {
      const map = (data.empathyMaps || []).find((m) => m.audienceId === a.id)
      let block = `${i + 1}. **${a.name}**${a.description ? ` — ${a.description}` : ''}`
      if (a.platformBehavior) block += `\n   - Platform behavior: ${a.platformBehavior}`
      if (map) {
        if (map.says.length) block += `\n   - Says: ${map.says.join('; ')}`
        if (map.thinks.length) block += `\n   - Thinks: ${map.thinks.join('; ')}`
        if (map.feels.length) block += `\n   - Feels: ${map.feels.join('; ')}`
        if (map.does.length) block += `\n   - Does: ${map.does.join('; ')}`
      }
      return block
    }).join('\n'))
  }

  // Transformation
  const ba = data.beforeAfter
  if (ba && (ba.before.length || ba.after.length || ba.statement)) {
    out += section('Customer transformation', [
      ba.before.length ? `- **Before working with ${c.clientName}:** ${ba.before.join('; ')}` : '',
      ba.after.length ? `- **After:** ${ba.after.join('; ')}` : '',
      ba.statement ? `- **Transformation statement:** "${ba.statement}"` : '',
    ].filter(Boolean).join('\n'))
  }

  // Competitors
  const competitors = data.competitors || []
  if (competitors.length) {
    out += section('Competitive landscape', competitors.map((comp) => {
      const parts = [`- **${comp.name}**`]
      if (comp.contentThemes) parts.push(`themes: ${comp.contentThemes}`)
      if (comp.tone) parts.push(`tone: ${comp.tone}`)
      parts.push(`visual ${comp.visualIdentity}/10, engagement ${comp.engagement}/10`)
      if (comp.gaps) parts.push(`**gap we can own: ${comp.gaps}**`)
      return parts.join(' — ')
    }).join('\n'))
  }

  const axes = data.landscapeAxes
  const positions = data.landscapePositions || []
  if (positions.length && axes) {
    const client = positions.find((p) => p.isClient)
    out += section('Positioning map', [
      `Axes: ${axes.xLeft} ↔ ${axes.xRight} (horizontal), ${axes.yTop} ↔ ${axes.yBottom} (vertical).`,
      ...positions.map((p) => `- ${p.isClient ? `**${p.name} (the client)**` : p.name}: ${p.x}% toward ${axes.xRight}, ${p.y}% toward ${axes.yBottom}`),
      client ? `\nThe client deliberately sits ${client.x < 50 ? axes.xLeft : axes.xRight} and ${client.y < 50 ? axes.yTop : axes.yBottom} relative to the field.` : '',
    ].filter(Boolean).join('\n'))
  }

  // Voice
  const weAre = (data.voiceAttributes || []).filter((v) => v.category === 'we-are').map((v) => v.word)
  const weAreNot = (data.voiceAttributes || []).filter((v) => v.category === 'we-are-not').map((v) => v.word)
  const guardrails = data.voiceGuardrails || []
  if (weAre.length || weAreNot.length || guardrails.length) {
    out += section('Voice', [
      weAre.length ? `- **The brand is:** ${weAre.join(', ')}` : '',
      weAreNot.length ? `- **The brand is never:** ${weAreNot.join(', ')}` : '',
      ...guardrails.map((gr) => `- **Guardrail:** ${gr.positive}, but never ${gr.negative}`),
    ].filter(Boolean).join('\n'))
  }

  // Personality sliders
  const sliders = data.personalitySliders || []
  if (sliders.some((s) => s.value !== 50)) {
    out += section('Personality (0 = fully left, 100 = fully right)', sliders.map((s) =>
      `- ${s.leftLabel} ←→ ${s.rightLabel}: **${s.value}** (${s.value < 40 ? `leans ${s.leftLabel}` : s.value > 60 ? `leans ${s.rightLabel}` : 'balanced'})`
    ).join('\n'))
  }

  const tone = data.toneDimensions || []
  if (tone.some((t) => t.value !== 5)) {
    out += section('Tone dimensions (1 = fully left, 10 = fully right)', tone.map((t) =>
      `- ${t.leftLabel} ←→ ${t.rightLabel}: **${t.value}/10**`
    ).join('\n'))
  }

  // Content pillars
  const pillars = data.contentPillars || []
  if (pillars.length) {
    out += section('Content pillars', pillars.map((p) => {
      const total = p.businessAlignment + p.audienceInterest + p.credibility + p.sustainability
      let block = `- **${p.name}** (score ${total}/20)${p.description ? ` — ${p.description}` : ''}`
      if (p.contentIdeas.length) block += `\n  - Ideas: ${p.contentIdeas.join('; ')}`
      return block
    }).join('\n'))
  }

  // Platforms
  const platforms = (data.platformStrategies || []).filter((p) => p.role || p.priority || p.frequency)
  if (platforms.length) {
    out += section('Platform strategy', platforms.map((p) =>
      `- **${p.platform}**${p.priority ? ` [${p.priority.toUpperCase()}]` : ''}${p.role ? ` — role: ${p.role}` : ''}${p.frequency ? ` — frequency: ${p.frequency}` : ''}${p.audience ? ` — audience: ${p.audience}` : ''}${p.contentTypes ? ` — formats: ${p.contentTypes}` : ''}`
    ).join('\n'))
  }

  // Video styles
  const videoStyles = (data.videoStyles || []).filter((v) => v.rating > 0).sort((a, b) => b.rating - a.rating)
  if (videoStyles.length) {
    out += section('Video direction (client preference, 5 = strongest)', videoStyles.map((v) => `- ${v.style}: ${v.rating}/5`).join('\n'))
  }

  // Campaign ideas
  const ideas = (data.campaignIdeas || []).slice().sort((a, b) => b.votes - a.votes)
  if (ideas.length) {
    out += section('Campaign ideas (by room votes)', ideas.map((i) =>
      `- (${i.votes} votes) ${i.concept}${i.platform ? ` — ${i.platform}` : ''}${i.format ? `, ${i.format}` : ''}`
    ).join('\n'))
  }

  // Logistics
  const lg = data.logistics
  if (lg && (lg.postingVolume || lg.socialGoal || lg.shootFrequency || lg.onCameraPeople.length || lg.metaAdsBudget || lg.pointOfContact)) {
    out += section('Production logistics', [
      lg.socialGoal ? `- **Goal:** ${lg.socialGoal}` : '',
      lg.socialPurpose ? `- **Purpose:** ${lg.socialPurpose}` : '',
      lg.desiredOutcomes?.length ? `- **Desired outcomes:** ${lg.desiredOutcomes.join('; ')}` : '',
      lg.postingVolume ? `- **Posting volume:** ${lg.postingVolume}` : '',
      (lg.videoPercentage || lg.carouselPercentage) ? `- **Format mix:** ${[lg.videoPercentage && `${lg.videoPercentage} video`, lg.carouselPercentage && `${lg.carouselPercentage} carousel`, lg.otherFormats].filter(Boolean).join(', ')}` : '',
      lg.shootFrequency ? `- **Shoot cadence:** ${lg.shootFrequency}` : '',
      lg.storyStrategy ? `- **Stories:** ${lg.storyStrategy}` : '',
      lg.onCameraPeople.length ? `- **On camera:** ${lg.onCameraPeople.map((p) => `${p.name}${p.role ? ` (${p.role})` : ''}`).join(', ')}` : '',
      lg.metaAdsBudget ? `- **Meta ads:** ${[lg.metaAdsBudget, lg.metaAdsGoal].filter(Boolean).join(', ')}${lg.metaAdsNotes ? ` — ${lg.metaAdsNotes}` : ''}` : '',
      lg.pointOfContact ? `- **Point of contact:** ${[lg.pointOfContact, lg.contactPlatform, lg.contactAvailability].filter(Boolean).join(', ')}` : '',
      lg.notes ? `- **Notes:** ${lg.notes}` : '',
    ].filter(Boolean).join('\n'))
  }

  // Priorities
  const priorities = (data.priorities || []).slice().sort((a, b) => b.votes - a.votes)
  if (priorities.length) {
    out += section('Agreed priorities (by room votes)', priorities.map((p, i) =>
      `${i + 1}. ${p.description}${p.owner ? ` — owner: ${p.owner}` : ''}${p.deadline ? ` — due: ${p.deadline}` : ''} (${p.votes} votes)`
    ).join('\n'))
  }

  // Strategic brief
  if (data.aiBrief) {
    out += section('Strategic brief (written from this workshop)', data.aiBrief)
  }

  out += `---\n\nGenerated by DWNLD Workshop on ${c.date}. Source of truth lives at download.lol/workshop.\n`
  return out
}
