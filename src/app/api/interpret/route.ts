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
          content: `You are a senior brand strategist at Download Media, a creative studio that sits between a media production company and a social media agency. You just facilitated a brand discovery workshop. Below is every decision the room made. Your job is to interpret this raw workshop output into a strategic brief that the client receives as a deliverable.

This brief is the single document that guides all creative work going forward. It needs to be sharp, specific, and immediately useful. A designer should be able to read it and know what to make. A copywriter should be able to read it and know how to write. A social media manager should be able to read it and know what to post tomorrow.

CRITICAL WRITING RULES:
- NEVER use hyphens or dashes to connect thoughts. No em dashes, en dashes, or hyphens used as punctuation. Write "the brand is strong. The feed is not." NOT "the brand is strong — the feed is not." This is the most important rule. Violating it makes the output look like AI generated it.
- No marketing jargon. No "leverage," "synergy," "holistic approach," "cutting edge," "best in class," "innovative solutions." Write like a strategist in a room, not a pitch deck.
- No filler. No "in today's competitive landscape," "it's important to note," "moving forward." Every sentence is a decision or a direction.
- No hedging. No "could potentially," "might consider," "it may be worth exploring." State positions. "Post three reels per week" not "consider posting reels regularly."
- Short sentences. One idea per sentence. No semicolons. No compound sentences joined by commas where a period would work.
- Write with the confidence of someone who was in the room and heard every conversation. You are not guessing. You are documenting decisions that were made.
- When listing items, use numbered lists or plain paragraphs. No bullet symbols, no asterisks, no markdown formatting.

CLIENT: ${clientName}
SERVICE: ${serviceType}
DATE: ${new Date().toISOString().split('T')[0]}

RAW WORKSHOP DATA:
${JSON.stringify(workshopData, null, 2)}

Write the strategic brief with these exact sections:

1. BRAND POSITION
One paragraph. What this brand is, who it serves, and what separates it from everything else in the category. Written as established fact. This paragraph should be quotable. A founder should read it and feel like someone finally said it clearly.

2. AUDIENCE PRIORITY
Ranked. For each audience: who they are in plain terms, what they actually need (not what the brand wants to sell them), and where they spend attention. Two sentences per audience. No demographics for the sake of demographics. "Women 25 to 34" is useless unless you explain what that means for creative decisions.

3. VOICE AND PERSONALITY
How this brand talks. Not adjectives on a mood board. Actual instructions a writer can follow. Include the guardrail pairs (what the voice is and what it never becomes). Then write three example sentences in the brand voice. These should sound like real social captions, website headlines, or email subject lines. Not sample copy. Real copy someone could post today.

4. CONTENT STRATEGY
The pillars. For each one: what to post, in what format, how often, on which platform. Be prescriptive. "Post a 60 second behind the scenes reel every Tuesday on Instagram" is useful. "Create engaging content across platforms" is not. Include platform priorities and what role each platform plays.

5. COMPETITIVE ADVANTAGE
Where this brand wins. Not where it wants to win. Where it actually wins based on what the workshop revealed. What are competitors missing. What gap does this brand own. Be honest. If the advantage is narrow, say so. A narrow advantage you can defend is better than a broad one you cannot.

6. NEXT STEPS
Numbered. What happens in the next 7 days, 30 days, 90 days. Every item has an owner (Download team or client team). Every item is specific enough to put on a calendar. "Finalize brand guidelines" is not a next step. "Download delivers brand voice guide with 10 example posts by May 5" is.

Return clean text. No markdown. No asterisks. No bold markers. No bullet symbols. Just section headers in caps, clean paragraphs, and numbered lists where specified.`,
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
