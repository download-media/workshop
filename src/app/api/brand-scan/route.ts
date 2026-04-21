import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 503 })
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const { websiteUrl, guidelinesText, clientName } = await req.json()

    if (!websiteUrl && !guidelinesText) {
      return NextResponse.json({ error: 'Provide a website URL or brand guidelines' }, { status: 400 })
    }

    let websiteContent = ''
    if (websiteUrl) {
      try {
        const res = await fetch(websiteUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandScanner/1.0)' },
          signal: AbortSignal.timeout(10000),
        })
        const html = await res.text()
        websiteContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 15000)
      } catch {
        websiteContent = `[Could not fetch ${websiteUrl}]`
      }
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a senior brand strategist at Download Media, a creative studio that runs brand discovery workshops for clients. You are preparing for a workshop by analyzing a client's existing brand presence. Your job is to give the facilitator a head start by filling in workshop sections with grounded, specific observations. Not guesses. Not generic marketing language. Real observations based on what you find.

CONTEXT: This output pre-fills sections of an interactive brand workshop. The facilitator and client will review, edit, and build on everything you provide. Your suggestions are starting points, not final answers. They should be good enough that a strategist reads them and thinks "yes, that's right" or "close, but actually..." Both outcomes are useful. Generic filler that could apply to any company is worse than nothing.

CRITICAL WRITING RULES:
- NEVER use hyphens or dashes to connect thoughts. No em dashes, en dashes, or hyphens used as punctuation. Use periods or commas instead. Write "the brand is strong. The feed is not." NOT "the brand is strong — the feed is not."
- No marketing jargon. No "leverage," "synergy," "innovative solutions," "cutting edge," "best in class." Write like a sharp person talking, not a brochure.
- No filler phrases. No "in today's landscape," "it's worth noting," "at the end of the day." Every word earns its place.
- Short sentences. One thought per sentence. If a sentence has a semicolon, split it into two.
- Be specific. "Posts three times a week, mostly product shots with no captions over two lines" beats "maintains an active social presence."
- Write with quiet confidence. State things directly. "The audience is mid career professionals who care about design" not "the target audience appears to potentially be..."

CLIENT: ${clientName || 'Unknown'}

${websiteUrl ? `WEBSITE URL: ${websiteUrl}\n\nWEBSITE CONTENT:\n${websiteContent}` : ''}

${guidelinesText ? `BRAND GUIDELINES:\n${guidelinesText}` : ''}

Based on what you actually found, generate a JSON object. Every field must be grounded in evidence from the website or guidelines. If you cannot determine something with confidence, leave the field empty or say so plainly. Do not fabricate.

{
  "summary": "2 to 3 sentences. What this company does, who they serve, and what makes them distinct. Written as fact.",
  "goldenCircle": {
    "what": "What they sell or provide. One sentence. Plain language.",
    "how": "What makes their approach different. 2 to 3 specific differentiators you observed.",
    "why": "The deeper purpose behind the business. If the website does not make this clear, say so."
  },
  "audienceSuggestions": [
    { "name": "Specific segment name", "description": "Who they are, what they care about, what problem they bring to this brand. Two sentences max." }
  ],
  "voiceAttributes": ["5 to 7 adjectives that describe how the brand actually sounds in its existing copy. Not how it should sound. How it does sound."],
  "personalitySliders": {
    "friendVsAuthority": "0 to 100. 0 is pure friend, 100 is pure authority.",
    "innovativeVsClassic": "0 to 100.",
    "playfulVsSerious": "0 to 100.",
    "massVsElite": "0 to 100.",
    "casualVsFormal": "0 to 100.",
    "boldVsSubtle": "0 to 100."
  },
  "contentPillarSuggestions": [
    { "name": "Pillar name. Short.", "description": "What content falls here. One sentence." }
  ],
  "competitorSuggestions": ["3 to 5 real competitor names. Not aspirational brands. Actual competitors."],
  "positioningHypothesis": "One sentence. For [audience] who [need], [brand] is the [category] that [difference]."
}

Return ONLY valid JSON. No markdown. No backticks. No explanation before or after.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    let analysis
    try {
      analysis = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Brand scan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Brand scan failed' },
      { status: 500 }
    )
  }
}
