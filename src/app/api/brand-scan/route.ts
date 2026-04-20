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

    // Scrape the website if URL provided
    let websiteContent = ''
    if (websiteUrl) {
      try {
        const res = await fetch(websiteUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandScanner/1.0)' },
          signal: AbortSignal.timeout(10000),
        })
        const html = await res.text()
        // Strip HTML tags, keep text content
        websiteContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 15000) // Limit to avoid token overflow
      } catch {
        websiteContent = `[Could not fetch ${websiteUrl}]`
      }
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a senior brand strategist preparing for a workshop with a client. Analyze everything provided and generate practical workshop starting points.

CLIENT: ${clientName || 'Unknown'}

${websiteUrl ? `WEBSITE URL: ${websiteUrl}\n\nWEBSITE CONTENT:\n${websiteContent}` : ''}

${guidelinesText ? `BRAND GUIDELINES:\n${guidelinesText}` : ''}

Based on this, generate a JSON object with these fields. Be specific, not generic. Every suggestion should be grounded in what you actually found:

{
  "summary": "2-3 sentence summary of the brand as you understand it",
  "goldenCircle": {
    "what": "what they do — one clear sentence",
    "how": "how they do it differently — 2-3 differentiators",
    "why": "why they exist beyond money — their deeper purpose"
  },
  "audienceSuggestions": [
    { "name": "segment name", "description": "who they are and what they care about" }
  ],
  "voiceAttributes": ["5-7 adjectives that describe how the brand sounds based on their existing content"],
  "personalitySliders": {
    "friendVsAuthority": 0-100,
    "innovativeVsClassic": 0-100,
    "playfulVsSerious": 0-100,
    "massVsElite": 0-100,
    "casualVsFormal": 0-100,
    "boldVsSubtle": 0-100
  },
  "contentPillarSuggestions": [
    { "name": "pillar name", "description": "what content falls here" }
  ],
  "competitorSuggestions": ["3-5 likely competitor names"],
  "positioningHypothesis": "one sentence positioning statement draft"
}

Return ONLY the JSON. No markdown, no explanation.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response
    let analysis
    try {
      analysis = JSON.parse(text)
    } catch {
      // Try to extract JSON from the response
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
