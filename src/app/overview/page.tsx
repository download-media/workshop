'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import Image from 'next/image'
import { useWorkshopStore } from '@/lib/store'
import { useClientStore } from '@/lib/client-store'
import type { ClientRecord } from '@/lib/client-store'

const SERVICE_LABELS: Record<string, string> = {
  social: 'Social Media',
  web: 'Web Development',
  branding: 'Brand Strategy',
  ideation: 'Ideation',
}

const SESSION_ROUTES: Record<string, string> = {
  social: '/workshop/foundation',
  web: '/workshop/foundation',
  branding: '/workshop/foundation',
  ideation: '/workshop/ideation',
}

export default function WorkshopOverview() {
  const router = useRouter()
  const { config, setCurrentPhase, resetWorkshop, setConfig,
    setGoldenCircle, addAudience, updatePersonalitySlider, addContentPillar
  } = useWorkshopStore()
  const { clients } = useClientStore()
  const [elementsVisible, setElementsVisible] = useState(false)
  const [showClientSwitch, setShowClientSwitch] = useState(false)

  // Brand intel state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [guidelinesText, setGuidelinesText] = useState('')
  const [guidelinesFileName, setGuidelinesFileName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null)
  const [scanError, setScanError] = useState('')
  const [applied, setApplied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get current client record for session history
  const currentClient = clients.find(
    (c) => c.name.toLowerCase() === config.clientName?.toLowerCase()
  )

  useEffect(() => {
    if (!config.clientName) {
      router.replace('/')
      return
    }
    const timer = setTimeout(() => setElementsVisible(true), 400)
    return () => clearTimeout(timer)
  }, [config.clientName, router])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setGuidelinesFileName(file.name)
    const text = await file.text()
    setGuidelinesText(text)
  }

  async function handleBrandScan() {
    if (!websiteUrl && !guidelinesText) return
    setScanning(true)
    setScanError('')
    setScanResult(null)
    try {
      const res = await fetch('/api/brand-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: websiteUrl || undefined,
          guidelinesText: guidelinesText || undefined,
          clientName: config.clientName,
        }),
      })
      const data = await res.json()
      if (data.analysis) {
        setScanResult(data.analysis)
      } else {
        setScanError(data.error || 'Scan failed')
      }
    } catch {
      setScanError('Failed to connect to API')
    } finally {
      setScanning(false)
    }
  }

  function applyToWorkshop() {
    if (!scanResult) return
    const r = scanResult as {
      goldenCircle?: { what?: string; how?: string; why?: string }
      audienceSuggestions?: { name: string; description: string }[]
      personalitySliders?: Record<string, number>
      contentPillarSuggestions?: { name: string; description: string }[]
    }

    if (r.goldenCircle) {
      setGoldenCircle({
        what: r.goldenCircle.what || '',
        how: r.goldenCircle.how || '',
        why: r.goldenCircle.why || '',
      })
    }

    if (r.audienceSuggestions) {
      r.audienceSuggestions.slice(0, 3).forEach((a, i) => {
        addAudience({
          id: `ai-aud-${Date.now()}-${i}`,
          name: a.name,
          description: a.description,
          platformBehavior: '',
          rank: i + 1,
        })
      })
    }

    if (r.personalitySliders) {
      const sliderMap: Record<string, string> = {
        friendVsAuthority: 'ps-1',
        innovativeVsClassic: 'ps-2',
        playfulVsSerious: 'ps-3',
        massVsElite: 'ps-4',
        casualVsFormal: 'ps-5',
        boldVsSubtle: 'ps-6',
      }
      Object.entries(r.personalitySliders).forEach(([key, val]) => {
        const id = sliderMap[key]
        if (id && typeof val === 'number') updatePersonalitySlider(id, val)
      })
    }

    if (r.contentPillarSuggestions) {
      r.contentPillarSuggestions.forEach((p, i) => {
        addContentPillar({
          id: `ai-pillar-${Date.now()}-${i}`,
          name: p.name,
          description: p.description,
          businessAlignment: 3,
          audienceInterest: 3,
          credibility: 3,
          sustainability: 3,
          contentIdeas: [],
        })
      })
    }

    setApplied(true)
  }

  function handleStartSession() {
    setCurrentPhase('foundation')
    const route = SESSION_ROUTES[config.serviceType] || '/workshop/foundation'
    router.push(route)
  }

  function handleBackToForm() {
    router.push('/?form=1')
  }

  function handleSwitchToClient(client: ClientRecord) {
    resetWorkshop()
    setConfig({
      clientName: client.name,
      facilitatorName: client.facilitator,
      serviceType: client.lastServiceType as 'social' | 'web' | 'branding' | 'ideation',
      date: new Date().toISOString().split('T')[0],
    })
    setShowClientSwitch(false)
    // Force re-render by navigating to self
    router.refresh()
  }

  if (!config.clientName) return null

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const currentServiceLabel = SERVICE_LABELS[config.serviceType] || config.serviceType

  return (
    <div className="relative min-h-screen sky-bg overflow-hidden">
      {/* Cloud background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/cloud-cutouts.jpeg"
          alt=""
          fill
          className="object-cover opacity-[0.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E8F0F6]/60" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: elementsVisible ? 1 : 0 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 mx-auto max-w-3xl px-6 sm:px-10 py-20 sm:py-28 min-h-screen flex flex-col"
      >
        {/* Date */}
        <p className="title-caps-sm text-ink/25 mb-16">{today}</p>

        {/* Client name */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={elementsVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="title-caps-xl text-ink mb-4"
        >
          {config.clientName}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={elementsVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-16">
            <span className="text-ink/30 text-sm">Facilitated by</span>
            <span className="text-ink/60 text-sm font-medium">{config.facilitatorName}</span>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={elementsVisible ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="h-px bg-ink/[0.06] mb-12 origin-left"
        />

        {/* Brand Intel — optional inputs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={elementsVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mb-12"
        >
          <p className="title-caps-sm text-ink/30 mb-6">BRAND INTEL</p>
          <p className="text-sm text-[#2E2E2E] mb-6">
            Optional. Add a website or brand guidelines and AI will pre-fill sections of the workshop as a starting point.
          </p>

          <div className="flex flex-col gap-4">
            {/* Website URL */}
            <div className="liquid-glass rounded-2xl p-5">
              <label className="title-caps-sm text-ink/40 mb-2 block">WEBSITE</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-transparent text-sm text-ink outline-none border-b border-ink/10 pb-2 placeholder:text-ink/20 focus:border-[#4A8AC2]/40"
              />
            </div>

            {/* Guidelines upload */}
            <div className="liquid-glass rounded-2xl p-5">
              <label className="title-caps-sm text-ink/40 mb-2 block">BRAND GUIDELINES</label>
              {guidelinesFileName ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink/60">{guidelinesFileName}</span>
                  <button
                    onClick={() => { setGuidelinesFileName(''); setGuidelinesText(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-ink/20 hover:text-ink/50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-ink/30 hover:text-ink/50 transition-colors"
                >
                  Upload a file (.txt, .md, .pdf)
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              {/* Or paste directly */}
              {!guidelinesFileName && (
                <textarea
                  value={guidelinesText}
                  onChange={(e) => setGuidelinesText(e.target.value)}
                  placeholder="Or paste brand guidelines here..."
                  className="w-full mt-3 bg-transparent text-sm text-ink outline-none border border-ink/6 rounded-xl p-3 min-h-[80px] placeholder:text-ink/15 focus:border-[#4A8AC2]/30 resize-none"
                />
              )}
            </div>

            {/* Scan button */}
            {(websiteUrl || guidelinesText) && !scanResult && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleBrandScan}
                disabled={scanning}
                className="liquid-glass rounded-2xl p-5 text-left transition-all hover:bg-white/50 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="title-caps-sm text-[#2E5E8C] mb-1">
                      {scanning ? 'SCANNING...' : 'ENHANCE WITH AI'}
                    </h3>
                    <p className="text-xs text-ink/35">
                      {scanning
                        ? 'Reading website and guidelines. This takes about 10 seconds.'
                        : 'Claude will analyze and pre-fill workshop suggestions as a starting point'}
                    </p>
                  </div>
                  {!scanning && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2E5E8C]/10 text-[#2E5E8C] group-hover:bg-[#2E5E8C] group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                  {scanning && (
                    <div className="h-5 w-5 rounded-full border-2 border-[#2E5E8C]/30 border-t-[#2E5E8C] animate-spin" />
                  )}
                </div>
              </motion.button>
            )}

            {/* Error */}
            {scanError && (
              <p className="text-sm text-[#E85A5A]">{scanError}</p>
            )}

            {/* Scan results */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="title-caps-sm text-[#2E5E8C]">AI ANALYSIS</h3>
                  {!applied && (
                    <button
                      onClick={applyToWorkshop}
                      className="title-caps-sm text-[11px] bg-[#2E5E8C] text-white rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity"
                    >
                      APPLY TO WORKSHOP
                    </button>
                  )}
                  {applied && (
                    <span className="title-caps-sm text-[11px] text-[#2E5E8C]/50">APPLIED</span>
                  )}
                </div>

                {/* Summary */}
                {(scanResult as { summary?: string }).summary && (
                  <p className="text-sm text-ink/70 mb-4 leading-relaxed">
                    {(scanResult as { summary: string }).summary}
                  </p>
                )}

                {/* Quick preview of what was found */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {(scanResult as { goldenCircle?: { why?: string } }).goldenCircle?.why && (
                    <div className="bg-white/20 rounded-xl p-3">
                      <span className="title-caps-sm text-ink/30 text-[9px]">PURPOSE</span>
                      <p className="text-ink/60 mt-1">{(scanResult as { goldenCircle: { why: string } }).goldenCircle.why}</p>
                    </div>
                  )}
                  {(scanResult as { positioningHypothesis?: string }).positioningHypothesis && (
                    <div className="bg-white/20 rounded-xl p-3">
                      <span className="title-caps-sm text-ink/30 text-[9px]">POSITIONING</span>
                      <p className="text-ink/60 mt-1">{(scanResult as { positioningHypothesis: string }).positioningHypothesis}</p>
                    </div>
                  )}
                  {(scanResult as { voiceAttributes?: string[] }).voiceAttributes && (
                    <div className="bg-white/20 rounded-xl p-3">
                      <span className="title-caps-sm text-ink/30 text-[9px]">VOICE</span>
                      <p className="text-ink/60 mt-1">{((scanResult as { voiceAttributes: string[] }).voiceAttributes).join(', ')}</p>
                    </div>
                  )}
                  {(scanResult as { competitorSuggestions?: string[] }).competitorSuggestions && (
                    <div className="bg-white/20 rounded-xl p-3">
                      <span className="title-caps-sm text-ink/30 text-[9px]">COMPETITORS</span>
                      <p className="text-ink/60 mt-1">{((scanResult as { competitorSuggestions: string[] }).competitorSuggestions).join(', ')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Today's session */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={elementsVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.0 }}
        >
          <p className="title-caps-sm text-ink/30 mb-6">TODAY&apos;S SESSION</p>

          <button
            onClick={handleStartSession}
            className="group w-full text-left liquid-glass rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:bg-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="title-caps-md text-ink mb-2">
                  {config.serviceType === 'ideation' ? 'CREATIVE IDEATION WORKSHOP' : 'BRAND DISCOVERY WORKSHOP'}
                </h2>
                <p className="text-sm text-ink/40">
                  {currentServiceLabel}
                  {config.serviceType === 'social' && ' — Foundation, Audience, Position, Identity, Application, Priorities'}
                  {config.serviceType === 'ideation' && ' — Room, Frame, Generate, Flip, Matrix, Vote'}
                  {config.serviceType === 'web' && ' — Foundation, Audience, Position, Identity, Application, Priorities'}
                  {config.serviceType === 'branding' && ' — Foundation, Audience, Position, Identity, Application, Priorities'}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/[0.04] text-ink/30 group-hover:bg-ink group-hover:text-white transition-all duration-300">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        </motion.div>

        {/* Past sessions by service */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={elementsVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-12"
        >
          <p className="title-caps-sm text-ink/30 mb-6">SESSIONS</p>

          <div className="flex flex-col gap-2">
            {Object.entries(SERVICE_LABELS).map(([key, label]) => {
              const isCurrentService = key === config.serviceType
              const pastSessions = currentClient?.sessions.filter(
                (s) => s.serviceType === key
              ) || []
              const hasSessions = pastSessions.length > 0

              return (
                <div
                  key={key}
                  className={`rounded-2xl p-5 sm:p-6 transition-all ${
                    isCurrentService ? 'liquid-glass' : hasSessions ? 'liquid-glass-subtle' : 'liquid-glass-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="title-caps-sm text-ink/50">{label.toUpperCase()}</span>
                      {isCurrentService && (
                        <span className="text-[10px] font-bold tracking-wider text-[#2E5E8C] bg-[#2E5E8C]/10 rounded-full px-2.5 py-0.5">
                          TODAY
                        </span>
                      )}
                    </div>
                    {hasSessions ? (
                      <span className="text-xs text-ink/35">
                        {pastSessions.map((s) => s.date).join(', ')}
                      </span>
                    ) : (
                      <span className="text-xs text-ink/15">No sessions</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={elementsVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="mt-16 pt-8 border-t border-ink/[0.04]"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToForm}
              className="title-caps-sm text-ink/30 hover:text-ink/60 transition-colors"
            >
              ← EDIT DETAILS
            </button>
            <Image
              src="/images/logo-wordmark-black.png"
              alt="DWNLD"
              width={60}
              height={15}
              className="opacity-15"
            />
          </div>

          {/* Switch client */}
          {clients.length > 1 && (
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => setShowClientSwitch(!showClientSwitch)}
                className="text-[11px] text-ink/20 hover:text-ink/45 transition-colors tracking-wide"
              >
                {showClientSwitch ? 'Close' : 'Switch client'}
              </button>
            </div>
          )}

          <AnimatePresence>
            {showClientSwitch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  {clients
                    .filter((c) => c.name.toLowerCase() !== config.clientName?.toLowerCase())
                    .map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSwitchToClient(client)}
                        className="group liquid-glass-subtle rounded-xl px-5 py-4 text-left transition-all hover:bg-white/40"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="title-caps-sm text-ink/60 group-hover:text-ink transition-colors">
                              {client.name.toUpperCase()}
                            </p>
                            <p className="text-[11px] text-ink/25 mt-1">
                              {client.sessions.length} session{client.sessions.length !== 1 ? 's' : ''} &middot; Last: {client.lastServiceType}
                            </p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-ink/15 group-hover:text-ink/40 transition-colors" />
                        </div>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
