import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 503 })
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const { workshopData, clientName, serviceType } = await req.json()

    if (!workshopData) {
      return NextResponse.json({ error: 'No workshop data provided' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      messages: [
        {
          role: 'user',
          content: `You are a senior brand strategist at a creative studio. A workshop just finished. Here is every decision made during the session. Interpret it into a clean, actionable strategic brief.

CLIENT: ${clientName}
SERVICE: ${serviceType}
DATE: ${new Date().toISOString().split('T')[0]}

RAW WORKSHOP DATA:
${JSON.stringify(workshopData, null, 2)}

Write a strategic brief with these sections. Be direct. No filler. Every sentence should be a decision or an action.

1. BRAND POSITION
One paragraph. What this brand is, who it's for, and what makes it different. Written as fact, not aspiration.

2. AUDIENCE PRIORITY
Ranked list. For each: who they are, what they need, where to reach them. Two sentences max per audience.

3. VOICE & PERSONALITY
The brand voice in practice. What it sounds like. What it never sounds like. Include the guardrails as rules. Write 3 example sentences in the brand voice.

4. CONTENT STRATEGY
The pillars, what to post, how often, on which platforms. Be specific about format and frequency. No "consider posting" — say what to post.

5. COMPETITIVE ADVANTAGE
Where the brand wins. What competitors aren't doing. The gap this brand owns.

6. IMMEDIATE NEXT STEPS
Numbered list. What happens in the next 7 days, 30 days, 90 days. Assign to roles where relevant (Download team vs client team).

Return clean text with these exact section headers. No markdown formatting. No asterisks. No bullet symbols. Just clean paragraphs and numbered lists.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ brief: text })
  } catch (error) {
    console.error('Interpret error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interpretation failed' },
      { status: 500 }
    )
  }
}
