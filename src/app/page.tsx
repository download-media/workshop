'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useWorkshopStore } from '@/lib/store'
import { useClientStore } from '@/lib/client-store'

type FormStepId = 'client' | 'facilitator' | 'date' | 'service'

const FORM_STEPS: { id: FormStepId; label: string; placeholder?: string }[] = [
  { id: 'client', label: 'CLIENT', placeholder: 'Who is this for?' },
  { id: 'facilitator', label: 'FACILITATOR', placeholder: 'Your name' },
  { id: 'date', label: 'DATE' },
  { id: 'service', label: 'SERVICE' },
]

function FormSteps({
  clientName, setClientName,
  facilitatorName, setFacilitatorName,
  date, setDate,
  serviceType, setServiceType,
}: {
  clientName: string
  setClientName: (v: string) => void
  facilitatorName: string
  setFacilitatorName: (v: string) => void
  date: string
  setDate: (v: string) => void
  serviceType: 'social' | 'web' | 'branding' | 'ideation'
  setServiceType: (v: 'social' | 'web' | 'branding' | 'ideation') => void
}) {
  const [step, setStep] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // New vs returning decides how the name is validated against the client list:
  // a new client must not collide with an existing record, a returning one must match.
  const [clientMode, setClientMode] = useState<'new' | 'returning'>('new')
  const [clientError, setClientError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  // Existing-client suggestions from the DB — picking one keeps the exact same
  // spelling so sessions always tie back to one client record
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; facilitator: string }[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  useEffect(() => {
    if (step !== 0 || clientName.trim().length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/workshop/api/clients?search=${encodeURIComponent(clientName.trim())}`, { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.clients || [])
        }
      } catch {}
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [clientName, step])

  useEffect(() => {
    // Auto-focus text inputs
    if (step < 2) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [step])

  const canAdvance = () => {
    if (step === 0) return clientName.trim().length > 0 && !checking
    if (step === 1) return facilitatorName.trim().length > 0
    if (step === 2) return date.length > 0
    if (step === 3) return true
    return false
  }

  // Step 0 gate: check the typed name against the client list before moving on.
  // New + exact match -> collision. Returning + no match -> nothing to resume.
  // If the check itself fails (offline, server hiccup) the workshop is never blocked.
  const validateClient = async (): Promise<string | null> => {
    const name = clientName.trim()
    try {
      const abort = new AbortController()
      const timer = setTimeout(() => abort.abort(), 4000)
      const res = await fetch(`/workshop/api/clients?search=${encodeURIComponent(name)}`, { signal: abort.signal })
      clearTimeout(timer)
      if (!res.ok) return null
      const data = await res.json()
      const exact = (data.clients || []).find(
        (c: { name: string }) => c.name.toLowerCase() === name.toLowerCase()
      )
      if (clientMode === 'new' && exact) {
        setClientName(exact.name)
        return `“${exact.name}” already exists`
      }
      if (clientMode === 'returning' && !exact) return `No client called “${name}” yet`
    } catch {
      return null
    }
    return null
  }

  const advance = async () => {
    if (!canAdvance() || step >= 3) return
    if (step === 0) {
      setChecking(true)
      const error = await validateClient()
      setChecking(false)
      if (error) {
        setSuggestionsOpen(false)
        setClientError(error)
        return
      }
    }
    setClientError(null)
    setStep(step + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canAdvance()) {
      e.preventDefault()
      void advance()
    }
  }

  const summaryItems = [
    { label: 'CLIENT', value: clientName },
    { label: 'FACILITATOR', value: facilitatorName },
    { label: 'DATE', value: date },
    { label: 'SERVICE', value: serviceType?.toUpperCase() },
  ]

  const hasCompletedAny = step > 0

  return (
    <>
      <div className="flex flex-col items-center">
        {/* Step indicator + back button row */}
        <div className="flex items-center gap-3 mb-4">
          {step > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setStep(step - 1)}
              className="text-[#1A1A1A]/20 hover:text-[#1A1A1A]/50 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            </motion.button>
          )}
          <div className="flex items-center gap-2">
            {FORM_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === step ? 20 : 6,
                  backgroundColor: i <= step ? 'rgba(26,26,26,0.3)' : 'rgba(26,26,26,0.08)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Current step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center w-full max-w-[340px] min-h-[80px]"
          >
            <label className="title-caps-sm mb-3 text-[#1A1A1A]/35">
              {FORM_STEPS[step].label}
            </label>

            {step === 0 && (
              <div className="relative w-full">
                {/* New vs returning — same pill language as the service picker */}
                <div className="mb-4 flex items-center justify-center gap-1.5">
                  {([['new', 'NEW CLIENT'], ['returning', 'RETURNING']] as const).map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => { setClientMode(mode); setClientError(null) }}
                      className={`rounded-full px-4 py-1.5 text-[10px] font-bold tracking-wider transition-all duration-300 ${
                        clientMode === mode
                          ? 'bg-[#1A1A1A] text-white'
                          : 'text-[#1A1A1A]/30 hover:text-[#1A1A1A]/55'
                      }`}
                      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={clientName}
                  onChange={(e) => { setClientName(e.target.value); setSuggestionsOpen(true); setClientError(null) }}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                  placeholder={clientMode === 'new' ? 'Who is this for?' : 'Which client is back?'}
                  className="w-full bg-transparent text-center text-xl font-bold tracking-tight text-[#1A1A1A] outline-none border-b border-[#1A1A1A]/10 pb-2 placeholder:text-[#1A1A1A]/18 focus:border-[#4A8AC2]/40"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                />
                {clientError && (
                  <div
                    className="absolute left-0 right-0 top-full mt-2 z-30 flex flex-col items-center gap-2 rounded-xl px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    }}
                  >
                    <p
                      className="text-center text-[11px] font-semibold leading-snug text-[#1A1A1A]/70"
                      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                    >
                      {clientError}
                      {clientMode === 'new'
                        ? ' — continue their existing record instead?'
                        : ' — register them as a new client?'}
                    </p>
                    <button
                      onClick={() => {
                        setClientMode(clientMode === 'new' ? 'returning' : 'new')
                        setClientError(null)
                      }}
                      className="rounded-full bg-[#1A1A1A] px-4 py-1.5 text-[10px] font-bold tracking-wider text-white transition-transform duration-300 hover:scale-[1.03]"
                      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                    >
                      {clientMode === 'new' ? 'SWITCH TO RETURNING' : 'CREATE NEW CLIENT'}
                    </button>
                  </div>
                )}
                {!clientError && suggestionsOpen && clientName.trim().length >= 2 && suggestions.length > 0 &&
                  suggestions[0].name.toLowerCase() !== clientName.trim().toLowerCase() && (
                  <div
                    className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    }}
                  >
                    {suggestions.slice(0, 4).map((s) => (
                      <button
                        key={s.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          // Picking an existing record IS the returning flow, whatever the toggle said
                          setClientName(s.name)
                          setClientMode('returning')
                          setClientError(null)
                          setSuggestionsOpen(false)
                          setStep(1)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#1A1A1A]/70 hover:bg-black/[0.03] transition-colors flex items-center justify-between"
                        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] tracking-wider text-[#1A1A1A]/30 uppercase">Existing</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <input
                ref={inputRef}
                type="text"
                value={facilitatorName}
                onChange={(e) => setFacilitatorName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your name"
                className="w-full bg-transparent text-center text-xl font-bold tracking-tight text-[#1A1A1A] outline-none border-b border-[#1A1A1A]/10 pb-2 placeholder:text-[#1A1A1A]/18 focus:border-[#4A8AC2]/40"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              />
            )}

            {step === 2 && (
              <input
                ref={inputRef}
                type="text"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && date.trim()) {
                    e.preventDefault()
                    advance()
                  }
                }}
                placeholder="YYYY-MM-DD"
                className="w-full bg-transparent text-center text-xl font-bold tracking-tight text-[#1A1A1A] outline-none border-b border-[#1A1A1A]/10 pb-2 placeholder:text-[#1A1A1A]/18 focus:border-[#4A8AC2]/40"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              />
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-1.5 w-full justify-items-center">
                {SERVICES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setServiceType(s.value as typeof serviceType)}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-bold tracking-wider transition-all duration-300 w-fit ${
                      serviceType === s.value
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#1A1A1A]/30 hover:text-[#1A1A1A]/55'
                    }`}
                    style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next step button */}
        {step < 3 ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: canAdvance() ? 1 : 0.2 }}
            onClick={() => void advance()}
            disabled={!canAdvance()}
            className="mt-3 text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60 transition-colors"
          >
            {checking ? (
              <span
                className="block h-5 w-5 animate-spin rounded-full border-[1.5px] border-[#1A1A1A]/15 border-t-[#1A1A1A]/45"
                aria-label="Checking client name"
              />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </motion.button>
        ) : (
          <div className="mt-3 h-5" />
        )}
      </div>

      {/* Summary card — fixed position on viewport, top right area */}
      <AnimatePresence>
        {hasCompletedAny && (
          <motion.div
            initial={{ opacity: 0, x: -8, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed rounded-2xl px-4 py-3 hidden lg:block"
            style={{
              right: '12vw',
              top: '30vh',
              width: '120px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(24px) saturate(130%)',
              WebkitBackdropFilter: 'blur(24px) saturate(130%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex flex-col gap-3">
              {summaryItems.map((item, i) => {
                if (i >= step || !item.value) return null
                return (
                  <button
                    key={item.label}
                    onClick={() => setStep(i)}
                    className="text-left group"
                  >
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/25">
                      {item.label}
                    </p>
                    <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors truncate">
                      {item.value}
                    </p>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const SERVICES = [
  { value: 'social', label: 'SOCIAL' },
  { value: 'web', label: 'WEB' },
  { value: 'branding', label: 'BRAND' },
  { value: 'ideation', label: 'IDEATION' },
] as const

export default function SetupPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SetupPage />
    </Suspense>
  )
}

function SetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const skipToForm = searchParams.get('form') === '1'
  const { config, setConfig, setCurrentPhase, resetWorkshop, setSessionId } = useWorkshopStore()
  const registerClient = useClientStore((s) => s.registerClient)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [started, setStarted] = useState(skipToForm)
  const [videoEnded, setVideoEnded] = useState(skipToForm)
  const [logoVisible, setLogoVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(skipToForm)
  const [videoFading, setVideoFading] = useState(skipToForm)

  // Sync skip state when navigating back with ?form=1 (adjust-during-render pattern)
  if (skipToForm && !formVisible) {
    setStarted(true)
    setVideoEnded(true)
    setVideoFading(true)
    setFormVisible(true)
  }

  const [clientName, setClientName] = useState(config.clientName)
  const [facilitatorName, setFacilitatorName] = useState(config.facilitatorName)
  const [serviceType, setServiceType] = useState<typeof config.serviceType>(config.serviceType)
  const [date, setDate] = useState(config.date)
  const isReady = clientName.trim().length > 0 && facilitatorName.trim().length > 0 && date.length > 0

  // Fade in logo
  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // Start: play video seamlessly over the first-frame image
  const handleStart = useCallback(() => {
    if (started) return
    setStarted(true)
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — skip straight to end state
        setVideoEnded(true)
        setFormVisible(true)
      })
    }
  }, [started])

  // Skip video — jump straight to form
  const handleSkipToForm = useCallback(() => {
    if (videoRef.current) videoRef.current.pause()
    setStarted(true)
    setVideoEnded(true)
    setVideoFading(true)
    setFormVisible(true)
  }, [])

  // Spacebar: first press starts video, second press skips to form.
  // Once the form is visible the listener must stand down completely —
  // swallowing Space here is what turned "Prima Strata" into "Primastrata".
  useEffect(() => {
    if (formVisible) return
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        if (!started) {
          handleStart()
        } else {
          handleSkipToForm()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleStart, handleSkipToForm, started, formVisible])

  // Start fading video before it fully ends — crossfade during final motion
  useEffect(() => {
    const video = videoRef.current
    if (!video || !started) return

    function onTimeUpdate() {
      if (!video) return
      const remaining = video.duration - video.currentTime
      // Start fade 0.5s before end — while camera still has slight motion
      if (remaining < 0.5 && remaining > 0 && !videoFading) {
        setVideoFading(true)
        setTimeout(() => setFormVisible(true), 600)
      }
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [started, videoFading])

  // Video fully ended
  const handleVideoEnd = useCallback(() => {
    setVideoEnded(true)
    setVideoFading(true)
    setTimeout(() => setFormVisible(true), 200)
  }, [])

  const [launching, setLaunching] = useState(false)

  // Reset launching state when coming back via ?form=1 (adjust-during-render pattern)
  const [prevSkipToForm, setPrevSkipToForm] = useState(skipToForm)
  if (skipToForm !== prevSkipToForm) {
    setPrevSkipToForm(skipToForm)
    if (skipToForm && launching) setLaunching(false)
  }

  // A brand-new client pauses on their freshly minted access code before entering;
  // returning clients go straight through after the fade.
  const [newClientCode, setNewClientCode] = useState<string | null>(null)

  function handleLaunch() {
    if (!isReady || launching) return
    resetWorkshop()
    setConfig({ clientName, facilitatorName, serviceType, date })
    registerClient(clientName, facilitatorName, serviceType, date)
    setLaunching(true)

    // Navigation NEVER waits on the network. The nav timer always fires after the
    // fade; a fast, successful registration of a NEW client is the only thing
    // allowed to intercept it, to pause on their access code first.
    let navigated = false
    const navTimer = setTimeout(() => { navigated = true; router.push('/overview') }, 700)

    // Register client + session in the DB while the fade runs. The returned session id
    // makes auto-save update one row instead of spawning duplicates; the canonical name
    // keeps "aeropress" and "AeroPress" tied to the same client record.
    const abort = new AbortController()
    const abortTimer = setTimeout(() => abort.abort(), 8000)
    fetch('/workshop/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abort.signal,
      body: JSON.stringify({
        clientName,
        facilitator: facilitatorName,
        serviceType,
        date,
        workshopData: { config: { clientName, facilitatorName, serviceType, date } },
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session?.id) setSessionId(data.session.id)
        if (data?.client?.name && data.client.name !== clientName) {
          setConfig({ clientName: data.client.name })
        }
        if (!navigated && data?.created && data?.client?.access_code) {
          clearTimeout(navTimer)
          setNewClientCode(data.client.access_code)
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(abortTimer))
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black"
      onClick={!started ? handleStart : undefined}
      style={{ cursor: !started ? 'pointer' : 'default' }}
    >

      {/* ═══════════════════════════════════════════════════
          LAYER 1: First frame — always present, same crop as video
          Visible initially, hidden once video is playing
          ═══════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 z-10 transition-opacity duration-500"
        style={{ opacity: started ? 0 : 1, transform: 'scaleX(-1)' }}
      >
        <Image
          src="/workshop/images/first-frame.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          LAYER 2: Video — same size/crop, sits behind first frame
          Starts playing when user triggers, seamless because
          first frame image matches video frame 1 exactly
          ═══════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 z-5"
        style={{ opacity: videoFading ? 0 : 1, transition: 'opacity 1s ease-out' }}
      >
        <video
          ref={videoRef}
          src="/workshop/images/intro.mp4"
          onEnded={handleVideoEnd}
          playsInline
          muted
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          LAYER 3: Last frame — same size/crop, sits behind video
          Always rendered, becomes visible when video fades out
          ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/workshop/images/last-frame.jpg"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          OVERLAY: Logo + prompt (before start)
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!started && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(20px)' }}
            transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Full liquid glass panel — fitted to screen with breathing room */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="absolute inset-4 sm:inset-8 lg:inset-12 rounded-3xl overflow-hidden"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 80px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              {/* Layered blur — backdrop on the whole panel */}
              <div
                className="absolute inset-0"
                style={{
                  backdropFilter: 'blur(30px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(140%)',
                }}
              />

              {/* Gradient opacity layers — moving white washes for depth */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.18) 0%, transparent 70%),
                    radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255,255,255,0.12) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 40% at 80% 70%, rgba(255,255,255,0.10) 0%, transparent 55%),
                    linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.10) 100%)
                  `,
                }}
              />

              {/* Single large flowing orb */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div
                  className="glass-orb-1 absolute rounded-full"
                  style={{
                    width: '70vw',
                    height: '70vw',
                    maxWidth: '800px',
                    maxHeight: '800px',
                    top: '-10%',
                    left: '-10%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
                  }}
                />
              </div>

              {/* Subtle inner border glow at top */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.35) 50%, transparent 90%)' }}
              />

              {/* Center content — title + prompt */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
                <motion.h2
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1.6rem, 4vw, 3rem)',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.85)',
                    textShadow: '0 1px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  BRAND WORKSHOP
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={logoVisible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 2 }}
                  className="mt-4"
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: 'clamp(0.7rem, 1.1vw, 0.85rem)',
                    letterSpacing: '0.3em',
                    animation: 'pulse-opacity 3s ease-in-out infinite',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>[ </span>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>PRESS SPACE TO BEGIN</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}> ]</span>
                </motion.p>
              </div>

              {/* Bottom logo band — repeating dwnld logos with 3D edge distortion */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center overflow-hidden"
                style={{ height: 'clamp(50px, 7vh, 80px)' }}
              >
                {/* Subtle top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.12) 50%, transparent 95%)' }}
                />

                <div className="flex items-center justify-between w-full px-6 sm:px-10 lg:px-16">
                  {/* Left edge — rotated in */}
                  <div style={{ perspective: '500px', opacity: 0.2 }}>
                    <Image
                      src="/workshop/images/logo-wordmark-white.png"
                      alt=""
                      width={90}
                      height={23}
                      className="h-auto pointer-events-none"
                      style={{
                        width: 'clamp(55px, 6vw, 80px)',
                        transform: 'rotateY(50deg) scale(0.9)',
                        filter: 'blur(0.5px)',
                      }}
                    />
                  </div>

                  {/* Center — straight */}
                  <div style={{ opacity: 0.4 }}>
                    <Image
                      src="/workshop/images/logo-wordmark-white.png"
                      alt=""
                      width={100}
                      height={25}
                      className="h-auto pointer-events-none"
                      style={{ width: 'clamp(65px, 7vw, 100px)' }}
                    />
                  </div>

                  {/* Right edge — rotated in */}
                  <div style={{ perspective: '500px', opacity: 0.2 }}>
                    <Image
                      src="/workshop/images/logo-wordmark-white.png"
                      alt=""
                      width={90}
                      height={23}
                      className="h-auto pointer-events-none"
                      style={{
                        width: 'clamp(55px, 6vw, 80px)',
                        transform: 'rotateY(-50deg) scale(0.9)',
                        filter: 'blur(0.5px)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          OVERLAY: Skip button (during video)
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {started && !videoEnded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            onClick={() => {
              if (videoRef.current) videoRef.current.pause()
              handleVideoEnd()
            }}
            className="absolute bottom-7 right-8 z-30 text-xs tracking-[0.2em] text-white/15 hover:text-white/35 transition-colors"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            SKIP →
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          OVERLAY: Form (after video ends)
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {formVisible && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Form — centered on viewport, slight upward nudge for monitor position */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '7%' }}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative"
              >
                <FormSteps
                  clientName={clientName}
                  setClientName={setClientName}
                  facilitatorName={facilitatorName}
                  setFacilitatorName={setFacilitatorName}
                  date={date}
                  setDate={setDate}
                  serviceType={serviceType}
                  setServiceType={setServiceType}
                />
              </motion.div>
            </div>

            {/* Internal view link — bottom left */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              onClick={() => router.push('/clients')}
              className="absolute left-8 z-30 text-[11px] tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors"
              style={{ bottom: '6.8vh', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              INTERNAL →
            </motion.button>

            {/* Begin button — pinned to bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute left-0 right-0 flex justify-center"
              style={{ bottom: '6vh' }}
            >
              <button
                onClick={handleLaunch}
                disabled={!isReady || launching}
                className={`group flex items-center gap-4 transition-all duration-700 ${
                  isReady && !launching ? 'text-white' : 'cursor-not-allowed text-white/10'
                }`}
              >
                <span
                  className="title-caps-sm tracking-[0.15em]"
                  style={{ textShadow: isReady ? '0 1px 10px rgba(0,0,0,0.4)' : 'none' }}
                >
                  {launching ? 'LAUNCHING...' : isReady ? 'BEGIN' : 'FILL IN DETAILS'}
                </span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-700 ${
                    isReady && !launching
                      ? 'bg-white text-[#1A1A1A] group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]'
                      : 'bg-white/5 text-white/10'
                  }`}
                >
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          LAUNCH TRANSITION — cloud image fades over everything
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {launching && (
          <motion.div
            className="fixed inset-0 z-50 sky-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Image
              src="/workshop/images/cloud-cutouts.jpeg"
              alt=""
              fill
              className="object-cover opacity-[0.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E8F0F6]/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          NEW CLIENT REGISTERED — show their access code once,
          on top of the cloud fade, before entering the workshop
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {newClientCode && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center px-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="flex w-full max-w-[360px] flex-col items-center gap-5 rounded-3xl px-8 py-9 text-center"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(28px) saturate(140%)',
                WebkitBackdropFilter: 'blur(28px) saturate(140%)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              }}
            >
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]/35"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                New client registered
              </p>
              <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                {config.clientName || clientName}
              </p>
              <div className="w-full rounded-2xl border border-[#1A1A1A]/[0.06] bg-white/60 px-4 py-4">
                <p className="mb-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[#1A1A1A]/30"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  Access code
                </p>
                <p className="font-mono text-xl tracking-[0.25em] text-[#1A1A1A]">{newClientCode}</p>
              </div>
              <p className="max-w-[260px] text-xs leading-relaxed text-[#1A1A1A]/40"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                This is their password for the client portal. It stays available under Clients.
              </p>
              <button
                onClick={() => router.push('/overview')}
                className="rounded-full bg-[#1A1A1A] px-6 py-2.5 text-[11px] font-bold tracking-wider text-white transition-transform duration-300 hover:scale-[1.03]"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                START THE WORKSHOP →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
