'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkshopStore } from '@/lib/store'

export default function SeedPage() {
  const store = useWorkshopStore()
  const router = useRouter()
  const [status, setStatus] = useState('Seeding DWNLD workshop data...')

  useEffect(() => {
    // Reset first
    store.resetWorkshop()

    // Small delay to ensure reset completes
    setTimeout(() => {
      /* ────────────────────────────────────────────────────
         PHASE 0: CONFIG
         ──────────────────────────────────────────────────── */
      store.setConfig({
        clientName: 'DWNLD (Download Media)',
        facilitatorName: 'Claude',
        serviceType: 'social',
        date: '2026-04-15',
      })

      /* ────────────────────────────────────────────────────
         PHASE 1: FOUNDATION — Golden Circle
         ──────────────────────────────────────────────────── */
      store.setGoldenCircle({
        what: 'Brand-building content engineered for social media performance. We run social media accounts, produce social-first video campaigns (branded documentary series), build creative-forward websites, and manage meta conversion ads.',
        how: "We blend cinematic production quality with platform-native strategy. We're not a traditional agency that outsources creative — we're a studio that makes the content, understands the algorithms, and treats every brand like a media company. Small team, high craft, no templates.",
        why: 'We believe every business has a story worth following. We exist to help brands build real communities — not just audiences — through content people actually choose to watch.',
        leadTheme: 'Community',
      })

      /* ────────────────────────────────────────────────────
         PHASE 2: AUDIENCE
         ──────────────────────────────────────────────────── */
      const audiences = [
        {
          id: 'aud-1',
          name: 'Growth-Stage Founders & Marketing Leaders',
          description: "Founders and CMOs at companies doing $2-20M revenue. They know they need strong social presence but can't justify a full in-house team. They've been burned by generic agencies that deliver templated content. They want a creative partner, not a vendor.",
          platformBehavior: 'Active on LinkedIn (thought leadership, company updates). Scrolling Instagram and TikTok personally but unsure how to translate that for their brand. Watch YouTube for industry education.',
          rank: 1,
        },
        {
          id: 'aud-2',
          name: 'Hospitality & Restaurant Groups',
          description: "Owners/operators of restaurants, hotels, and food & beverage concepts. Opening new locations or expanding. Deeply visual businesses where the brand IS the experience. Timeline-sensitive — delays cost revenue. They get social media but don't have time.",
          platformBehavior: "Instagram-obsessed (food photography, interior design). TikTok-curious. LinkedIn for B2B partnerships and investor relations. Respond to beautiful visual content and real patron experiences.",
          rank: 2,
        },
        {
          id: 'aud-3',
          name: 'Consumer & Lifestyle Brands',
          description: "DTC and retail brands in the $1-10M range. Apparel, wellness, outdoor, food & bev. They understand social is their primary acquisition channel but content doesn't match brand ambition. Looking for social-first creative that feels editorial, not ad-like.",
          platformBehavior: 'Heavy on Instagram Reels and TikTok. Pinterest for discovery. YouTube for longer-form brand storytelling. Save content that inspires them. Share brands that feel aspirational.',
          rank: 3,
        },
        {
          id: 'aud-4',
          name: 'Real Estate & Property Developers',
          description: "Developers and property groups marketing new builds, luxury properties, or mixed-use developments. High-value purchases where brand perception directly affects buyer confidence. Current content is usually stiff renderings and drone shots — massive creative gap.",
          platformBehavior: 'LinkedIn for industry credibility and investor relations. Instagram for lifestyle aspirational content. YouTube for property tours. Facebook still relevant for local community engagement.',
          rank: 4,
        },
        {
          id: 'aud-5',
          name: 'Tech Companies in Western Canada',
          description: "B2B SaaS and tech companies in Victoria, Vancouver, and Calgary. Growing teams that need employer branding and product marketing content. Often have product-market fit but lack brand story. Social presence feels corporate and disconnected from the humans behind the product.",
          platformBehavior: 'LinkedIn-primary for B2B. Twitter/X for industry commentary. YouTube for product demos and talks. Instagram for employer branding. TikTok increasingly for reaching younger talent.',
          rank: 5,
        },
      ]

      audiences.forEach((a) => store.addAudience(a))

      // Empathy Maps
      store.setEmpathyMap({
        audienceId: 'aud-1',
        says: [
          "We need to be on social but don't have time",
          "Our content doesn't match our brand quality",
          "I'm tired of agencies that don't understand our business",
          "We can't justify a full-time creative hire yet",
        ],
        thinks: [
          'Are we falling behind competitors on social?',
          'Will this actually drive revenue or just vanity metrics?',
          "I don't want to micromanage another vendor",
          "What if we invest in this and it doesn't work?",
        ],
        feels: [
          'Overwhelmed by platform changes and algorithm shifts',
          'Embarrassed by their inconsistent, low-quality feed',
          'Frustrated by generic agency output that looks like everyone else',
          "Anxious about wasting budget on content that doesn't convert",
        ],
        does: [
          'Posts sporadically from personal account',
          "Scrolls competitors' feeds for inspiration late at night",
          'Has tried 1-2 agencies and been disappointed each time',
          "Delegates social to a junior team member who isn't creative",
        ],
      })

      store.setEmpathyMap({
        audienceId: 'aud-2',
        says: [
          "Our space speaks for itself but nobody's seeing it online",
          'We need someone who gets the vibe',
          "I don't have time to manage another vendor",
          'Our food looks amazing in person but bad in the photos we post',
        ],
        thinks: [
          'Every other restaurant has better content than us',
          'Will a social media agency actually understand hospitality?',
          'I need butts in seats, not likes',
          'Can we afford this right now with everything else?',
        ],
        feels: [
          'Proud of their physical brand but embarrassed by their online presence',
          'Overwhelmed by how fast social media moves',
          "Frustrated that competitors' mediocre spots get more buzz online",
          'Excited when they see great food/hospitality content on their own feed',
        ],
        does: [
          'Takes iPhone photos of dishes and posts them inconsistently',
          "Checks competitors' Instagram weekly",
          "Has asked staff to 'handle social' with no training or budget",
          'Invests heavily in interior design but zero on digital presence',
        ],
      })

      store.setEmpathyMap({
        audienceId: 'aud-3',
        says: [
          'We want content that feels like a brand, not an ad',
          "Our product is great but our social doesn't reflect that",
          'We need a creative partner who can scale with us',
          "UGC isn't cutting it anymore — we need real creative",
        ],
        thinks: [
          'How do we stand out in an oversaturated feed?',
          'Should we invest in TikTok or double down on Instagram?',
          'We need content that builds brand equity AND converts',
          'Our in-house person is burned out and we keep losing them',
        ],
        feels: [
          'Jealous of brands with cohesive, beautiful feeds',
          'Pressure to keep up with trends while maintaining brand identity',
          'Uncertain about which platforms actually matter for their category',
          'Tired of the content treadmill — posting for the sake of posting',
        ],
        does: [
          'Reposts UGC as primary content strategy',
          'Runs meta ads with static product images',
          'Has a Canva subscription and an overworked marketing coordinator',
          "Attends webinars on social strategy but can't implement the advice",
        ],
      })

      // Before / After
      store.setBeforeAfter({
        before: [
          "Inconsistent content that doesn't match brand quality",
          'Posting feels like a chore, not a strategy',
          'Embarrassed to send people to their social accounts',
          'No clear creative direction or brand story',
          'Wasting budget on content nobody watches',
          "Falling behind competitors who seem to 'get it'",
        ],
        after: [
          'Proud of every post — social accounts feel like a brand extension',
          'Clear creative direction with a content calendar that excites them',
          'Growing an engaged community, not just follower counts',
          'Content that looks cinematic but performs like native social',
          'Measurable impact on brand awareness and customer acquisition',
          'Being the brand that competitors are jealous of',
        ],
        statement: "Businesses feel overwhelmed and embarrassed by their social presence. DWNLD helps them feel proud and strategic, so they can build real community and turn their brand into something people actually follow.",
      })

      /* ────────────────────────────────────────────────────
         PHASE 3: POSITION
         ──────────────────────────────────────────────────── */
      const competitors = [
        {
          id: 'comp-1',
          name: 'Pietra (Victoria)',
          platforms: 'Instagram, LinkedIn',
          visualIdentity: 4,
          contentThemes: 'Branding, social strategy, clean design, brand identity',
          engagement: 3,
          tone: 'Polished, minimalist, professional',
          gaps: "Lacks video production capability. Content feels safe — beautiful but not attention-grabbing. No documentary or campaign work. Strategy-heavy but light on making.",
        },
        {
          id: 'comp-2',
          name: 'Northern (Vancouver)',
          platforms: 'Instagram, LinkedIn, TikTok',
          visualIdentity: 4,
          contentThemes: 'Social media management, influencer marketing, paid social, trend content',
          engagement: 4,
          tone: 'Trendy, youth-forward, fast-paced',
          gaps: "Very trend-chasing with no lasting brand-building. Content is disposable — performs now, forgotten tomorrow. Weak production quality — quantity over craft.",
        },
        {
          id: 'comp-3',
          name: 'Pound & Grain (Vancouver)',
          platforms: 'Instagram, LinkedIn, Web',
          visualIdentity: 5,
          contentThemes: 'Digital strategy, web development, content creation, UX design',
          engagement: 3,
          tone: 'Corporate-casual, strategic, polished',
          gaps: "Too agency-feeling — process over creative. Web-focused with social as an afterthought. No video/documentary capability. Big-agency overhead at mid-market prices.",
        },
        {
          id: 'comp-4',
          name: 'Jelly Digital (Vancouver)',
          platforms: 'Instagram, TikTok, LinkedIn',
          visualIdentity: 3,
          contentThemes: 'Social media management, paid ads, SEO, digital marketing',
          engagement: 4,
          tone: 'Energetic, casual, hustle-culture',
          gaps: "Volume-based approach — output over quality. Low production value. Positions as full-service but lacks creative depth. Templates and playbooks over custom strategy.",
        },
        {
          id: 'comp-5',
          name: 'VaynerMedia (Reference)',
          platforms: 'All major platforms',
          visualIdentity: 4,
          contentThemes: 'Social-first strategy, creator content, cultural relevance, paid media',
          engagement: 5,
          tone: "Direct, conversational, Gary Vee energy — 'content people actually want to watch'",
          gaps: "Enterprise-focused — can't serve small-mid businesses. Too big to be nimble. Their model is the aspiration but not accessible at DWNLD's price point. Factory-scale, not studio-craft.",
        },
      ]

      competitors.forEach((c) => store.addCompetitor(c))

      // Landscape
      store.setLandscapeAxes({
        xLeft: 'Trend-Chasing',
        xRight: 'Brand-Building',
        yTop: 'Production-Led',
        yBottom: 'Strategy-Led',
      })

      const positions = [
        { id: 'lp-1', name: 'DWNLD', x: 72, y: 35, isClient: true },
        { id: 'lp-2', name: 'Pietra', x: 65, y: 68 },
        { id: 'lp-3', name: 'Northern', x: 25, y: 55 },
        { id: 'lp-4', name: 'Pound & Grain', x: 70, y: 72 },
        { id: 'lp-5', name: 'Jelly Digital', x: 20, y: 62 },
        { id: 'lp-6', name: 'VaynerMedia', x: 55, y: 40 },
      ]

      positions.forEach((p) => store.addLandscapePosition(p))

      /* ────────────────────────────────────────────────────
         PHASE 4: IDENTITY
         ──────────────────────────────────────────────────── */

      // Voice Attributes
      const weAreWords = ['Confident', 'Bold', 'Sharp', 'Human', 'Innovative', 'Casual', 'Direct', 'Energetic', 'Visionary', 'Edgy']
      const weAreNotWords = ['Technical', 'Authoritative', 'Professional', 'Precise']
      // Everything else stays 'torn'

      const voiceAttributes = [
        'Confident', 'Witty', 'Technical', 'Warm', 'Bold', 'Playful',
        'Authoritative', 'Approachable', 'Disruptive', 'Trustworthy',
        'Edgy', 'Professional', 'Friendly', 'Sharp', 'Human',
        'Innovative', 'Casual', 'Expert', 'Progressive', 'Direct',
        'Thoughtful', 'Energetic', 'Relatable', 'Precise', 'Visionary',
      ].map((word, i) => ({
        id: `va-${i}`,
        word,
        category: weAreWords.includes(word)
          ? 'we-are' as const
          : weAreNotWords.includes(word)
            ? 'we-are-not' as const
            : 'torn' as const,
      }))

      store.setVoiceAttributes(voiceAttributes)

      // Personality Sliders
      store.updatePersonalitySlider('ps-1', 30)  // Friend (30) ← → Authority (70)
      store.updatePersonalitySlider('ps-2', 18)  // Innovative (18) ← → Classic (82)
      store.updatePersonalitySlider('ps-3', 38)  // Playful (38) ← → Serious (62)
      store.updatePersonalitySlider('ps-4', 62)  // Mass Appeal (38) ← → Elite (62)
      store.updatePersonalitySlider('ps-5', 22)  // Casual (22) ← → Formal (78)
      store.updatePersonalitySlider('ps-6', 18)  // Bold (18) ← → Subtle (82)

      // Voice Guardrails
      const guardrails = [
        { id: 'vg-1', positive: 'Sound like a filmmaker who understands algorithms', negative: 'Sound like a marketer who hired a filmmaker' },
        { id: 'vg-2', positive: 'Show the work — let the reel do the talking', negative: 'Describe the work with marketing buzzwords' },
        { id: 'vg-3', positive: 'Be specific: name tools, platforms, numbers, timeframes', negative: "Be vague: 'we help brands grow on social'" },
        { id: 'vg-4', positive: 'Talk about the craft and the thinking behind decisions', negative: 'Talk about your process and capabilities abstractly' },
        { id: 'vg-5', positive: 'Use casual, direct language — fragments are fine', negative: 'Use corporate, polished, brochure language' },
        { id: 'vg-6', positive: 'Share what you actually believe about brands and content', negative: 'Share what sounds good or optimizes for engagement' },
        { id: 'vg-7', positive: "Say 'we don\\'t know yet' when you don\\'t — radical honesty", negative: "Fake expertise or oversell capabilities you haven't proven" },
        { id: 'vg-8', positive: "Reference specific work, clients, and results (with permission)", negative: "Use generic testimonials or vague social proof" },
      ]

      guardrails.forEach((g) => store.addVoiceGuardrail(g))

      // Tone Dimensions (1-10 scale)
      store.updateToneDimension('td-1', 4)  // Funny (1) ← → Serious (10) — leans funny
      store.updateToneDimension('td-2', 3)  // Casual (1) ← → Formal (10) — very casual
      store.updateToneDimension('td-3', 4)  // Irreverent (1) ← → Respectful (10) — leans irreverent
      store.updateToneDimension('td-4', 3)  // Enthusiastic (1) ← → Matter-of-fact (10) — enthusiastic

      /* ────────────────────────────────────────────────────
         PHASE 5: APPLICATION
         ──────────────────────────────────────────────────── */

      // Content Pillars
      const pillars = [
        {
          id: 'cp-1',
          name: 'The Work',
          description: 'Showcasing completed projects, campaigns, and client results. The reel IS the proof. Let the creative speak — pair with brief context on the brief, the insight, and the outcome.',
          businessAlignment: 5,
          audienceInterest: 5,
          credibility: 5,
          sustainability: 4,
          contentIdeas: [
            'Before/after brand feed transformations',
            'Campaign breakdowns with real metrics',
            'Short-form edits of best client work',
            'Side-by-side: the brief vs. what we made',
            'Client result carousels (6-8 slides)',
          ],
        },
        {
          id: 'cp-2',
          name: 'Behind the Lens',
          description: "Creative process, production BTS, rejected ideas, the messy middle. Show how DWNLD thinks and makes. This is the pillar that builds trust with creative buyers — they want to see the craft, not just the output.",
          businessAlignment: 4,
          audienceInterest: 5,
          credibility: 5,
          sustainability: 5,
          contentIdeas: [
            'The concept that almost was (rejected ideas)',
            'Set day BTS — gear, team, locations',
            'How we storyboard a social campaign',
            'Cutting a 60s Reel from 4hrs of footage',
            'Client brief to final delivery timelapse',
          ],
        },
        {
          id: 'cp-3',
          name: 'The Feed (Industry Perspective)',
          description: "Hot takes, opinions, and analysis on social media, content, and marketing trends. Positions DWNLD as the people who see what's coming and aren't afraid to say what others won't.",
          businessAlignment: 4,
          audienceInterest: 5,
          credibility: 4,
          sustainability: 5,
          contentIdeas: [
            "Contrarian takes: 'The algorithm doesn't care about your brand'",
            'Platform updates decoded for brands',
            "What we'd change if we ran [brand]'s social",
            "Monthly trend reports: what's working, what's dying",
            'Framework posts on social-first content strategy',
          ],
        },
        {
          id: 'cp-4',
          name: 'Build in Public',
          description: "DWNLD's own growth story. Real numbers, real lessons, real mistakes. A 1-year-old agency sharing the founder journey is inherently compelling and builds radical trust.",
          businessAlignment: 3,
          audienceInterest: 4,
          credibility: 5,
          sustainability: 4,
          contentIdeas: [
            'Monthly revenue updates and lessons learned',
            'The pitch that won (and the one we lost)',
            'How we onboard a new client — full process',
            'What it actually costs to run a creative agency',
            'Year 1 mistakes and what we changed',
          ],
        },
        {
          id: 'cp-5',
          name: 'Culture & Craft',
          description: "Team, Victoria life, creative culture, gear, inspiration. The human side of DWNLD. Shows you're real people who care about the craft — not a faceless agency with a stock photo website.",
          businessAlignment: 3,
          audienceInterest: 4,
          credibility: 4,
          sustainability: 5,
          contentIdeas: [
            'A day inside the DWNLD studio',
            'Gear we actually use (and why)',
            "What we're watching, reading, and inspired by",
            "Victoria as a creative city — why we're based here",
            'Team spotlights: who makes the work happen',
          ],
        },
      ]

      pillars.forEach((p) => store.addContentPillar(p))

      // Platform Strategies
      store.updatePlatformStrategy('pl-1', {
        role: 'Thought leadership, founder-led content, B2B client acquisition. Personal profiles drive 80% of effort. Company page is curated portfolio + culture hub.',
        audience: 'Growth-stage founders, CMOs, marketing leaders, tech companies',
        contentTypes: 'Carousels (6-8 slides), text posts with hooks, video clips, case study breakdowns',
        frequency: '3-4x/week personal, 2-3x/week company',
        priority: 'invest',
      })

      store.updatePlatformStrategy('pl-2', {
        role: "Primary creative showcase — this IS the portfolio. Every post should make someone think 'I want DWNLD to make my brand look like this.' Also DWNLD's own brand channel.",
        audience: 'Consumer brands, hospitality, lifestyle businesses, creative peers',
        contentTypes: 'Reels (BTS, campaign clips), carousels (case studies, tips), Stories (daily studio life)',
        frequency: '4-5x/week (Reels, carousels, Stories daily)',
        priority: 'invest',
      })

      store.updatePlatformStrategy('pl-3', {
        role: "Experimental, culture-forward. Test creative concepts. Share hot takes and BTS in the rawest format. Build DWNLD's reputation with younger marketing professionals.",
        audience: 'Young founders, marketing coordinators, creative professionals, small business owners',
        contentTypes: 'Raw BTS, talking head hot takes, creative process, trend-jacking with a production spin',
        frequency: '3-4x/week',
        priority: 'invest',
      })

      store.updatePlatformStrategy('pl-4', {
        role: "Long-form brand storytelling and documentary showcase. This is where the 'media company' identity lives. Campaign documentaries, process deep-dives, client stories.",
        audience: 'All segments for trust-building. Hospitality and consumer brands for campaign showcases.',
        contentTypes: 'Campaign documentaries (3-10 min), process breakdowns, client story mini-docs, studio vlogs',
        frequency: '1-2x/month (quality over quantity)',
        priority: 'keep',
      })

      store.updatePlatformStrategy('pl-5', {
        role: "Minimal presence. Founders share quick thoughts, engage in industry conversations. Not a content creation priority — reactive and organic only.",
        audience: 'Tech companies, marketing professionals',
        contentTypes: 'Quick takes, thread reactions, industry conversation engagement',
        frequency: 'Organic/reactive',
        priority: 'keep',
      })

      // Video Styles
      store.updateVideoStyle('vs-1', 5)  // Polished Brand Film — core identity
      store.updateVideoStyle('vs-2', 4)  // Raw / iPhone — social-native
      store.updateVideoStyle('vs-3', 3)  // Interview / Talking Head
      store.updateVideoStyle('vs-4', 4)  // Day-in-the-Life — documentary DNA
      store.updateVideoStyle('vs-5', 2)  // Motion Graphics — accent, not primary
      store.updateVideoStyle('vs-6', 3)  // Humor-Driven — when it fits

      // Campaign Ideas
      const campaigns = [
        {
          id: 'ci-1',
          concept: "The Social Roast — Founders review brands' social media on camera. Honest, constructive, specific. Not mean-spirited but not sugarcoated. 'Here's what we'd change and why.' People love watching work get reviewed.",
          platform: 'TikTok + Instagram Reels',
          format: 'Short-form video series (60-90s per brand)',
          votes: 9,
        },
        {
          id: 'ci-2',
          concept: "The Rebrand Challenge — Pick a well-known local brand. DWNLD remakes their social feed in 72 hours. Document the process as a mini-doc. Whether they buy or not, the content shows DWNLD's process and taste.",
          platform: 'Instagram + YouTube',
          format: 'Docu-series (3 episodes)',
          votes: 8,
        },
        {
          id: 'ci-3',
          concept: "Behind the Brand — Documentary series following local businesses through a critical moment (restaurant opening, product launch, rebrand). DWNLD embeds for 2-4 weeks. The series IS the deliverable AND the marketing.",
          platform: 'YouTube + Instagram Reels',
          format: 'Mini-documentary (5-10 min + social cuts)',
          votes: 7,
        },
        {
          id: 'ci-4',
          concept: "30 Days of Content — DWNLD takes over a client's social for 30 days with full creative control. Document the strategy, production, and results. Share data publicly. Win or learn — transparency builds trust.",
          platform: 'LinkedIn + Instagram',
          format: 'Build-in-public series + final case study carousel',
          votes: 6,
        },
        {
          id: 'ci-5',
          concept: "Victoria's Best-Kept Secrets — Monthly series showcasing Victoria businesses with incredible products/spaces but weak social presence. DWNLD creates one piece of stunning content for each — free. Community-first positioning.",
          platform: 'Instagram + TikTok',
          format: 'Monthly short-form video + BTS',
          votes: 5,
        },
      ]

      campaigns.forEach((c) => store.addCampaignIdea(c))

      /* ────────────────────────────────────────────────────
         PHASE 6: PRIORITIES
         ──────────────────────────────────────────────────── */
      const priorities = [
        { id: 'pr-1', description: 'Finalize DWNLD brand positioning and voice guide from this workshop output', owner: 'Aiden + Hiroko', deadline: '2026-04-22', votes: 8 },
        { id: 'pr-2', description: 'Launch consistent LinkedIn content — Aiden personal profile, 3-4x/week using /linkedin skill', owner: 'Aiden', deadline: '2026-04-28', votes: 7 },
        { id: 'pr-3', description: 'Build 3 portfolio-quality case studies from existing client work (carousel + video format)', owner: 'Aiden + Hiroko', deadline: '2026-05-15', votes: 7 },
        { id: 'pr-4', description: "Produce pilot episode of 'The Social Roast' series for TikTok and Instagram Reels", owner: 'Aiden', deadline: '2026-05-01', votes: 6 },
        { id: 'pr-5', description: 'Redesign DWNLD Instagram grid to reflect new brand positioning and visual identity', owner: 'Hiroko', deadline: '2026-05-01', votes: 5 },
        { id: 'pr-6', description: 'Set $5,000/mo minimum retainer floor for all new MRR clients', owner: 'Aiden + Hiroko', deadline: '2026-04-20', votes: 5 },
        { id: 'pr-7', description: 'Create client onboarding workshop template using this app for all new clients', owner: 'Aiden', deadline: '2026-05-15', votes: 4 },
      ]

      priorities.forEach((p) => store.addPriority(p))

      // Set phase to summary so it loads there
      store.setCurrentPhase('priorities')

      setStatus('Done! Redirecting to summary...')

      // Redirect to summary
      setTimeout(() => {
        router.push('/workshop/summary')
      }, 800)
    }, 200)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        <p className="text-white/60 text-sm tracking-widest uppercase">{status}</p>
        <p className="text-white/30 text-xs mt-2">Populating all 7 workshop phases for DWNLD...</p>
      </div>
    </div>
  )
}
