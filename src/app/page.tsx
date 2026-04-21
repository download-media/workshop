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

  useEffect(() => {
    // Auto-focus text inputs
    if (step < 2) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [step])

  const canAdvance = () => {
    if (step === 0) return clientName.trim().length > 0
    if (step === 1) return facilitatorName.trim().length > 0
    if (step === 2) return date.length > 0
    if (step === 3) return true
    return false
  }

  const advance = () => {
    if (canAdvance() && step < 3) setStep(step + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canAdvance()) {
      e.preventDefault()
      advance()
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
            className="flex flex-col items-center justify-center w-full max-w-[340px] h-[80px]"
          >
            <label className="title-caps-sm mb-3 text-[#1A1A1A]/35">
              {FORM_STEPS[step].label}
            </label>

            {step === 0 && (
              <input
                ref={inputRef}
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Who is this for?"
                className="w-full bg-transparent text-center text-xl font-bold tracking-tight text-[#1A1A1A] outline-none border-b border-[#1A1A1A]/10 pb-2 placeholder:text-[#1A1A1A]/18 focus:border-[#4A8AC2]/40"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              />
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
            onClick={advance}
            disabled={!canAdvance()}
            className="mt-3 text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
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
  const { config, setConfig, setCurrentPhase, resetWorkshop } = useWorkshopStore()
  const registerClient = useClientStore((s) => s.registerClient)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [started, setStarted] = useState(skipToForm)
  const [videoEnded, setVideoEnded] = useState(skipToForm)
  const [logoVisible, setLogoVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(skipToForm)

  // Sync skip state when navigating back with ?form=1
  useEffect(() => {
    if (skipToForm) {
      setStarted(true)
      setVideoEnded(true)
      setVideoFading(true)
      setFormVisible(true)
    }
  }, [skipToForm])

  const [clientName, setClientName] = useState(config.clientName)
  const [facilitatorName, setFacilitatorName] = useState(config.facilitatorName)
  const [serviceType, setServiceType] = useState<typeof config.serviceType>(config.serviceType)
  const [date, setDate] = useState(config.date)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(clientName.trim().length > 0 && facilitatorName.trim().length > 0 && date.length > 0)
  }, [clientName, facilitatorName, date])

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

  // Spacebar: first press starts video, second press skips to form
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        if (!started) {
          handleStart()
        } else if (!formVisible) {
          handleSkipToForm()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleStart, handleSkipToForm, started, formVisible])

  // Start fading video before it fully ends — crossfade during final motion
  const [videoFading, setVideoFading] = useState(false)

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

  // Reset launching state when coming back via ?form=1
  useEffect(() => {
    if (skipToForm) setLaunching(false)
  }, [skipToForm])

  function handleLaunch() {
    if (!isReady || launching) return
    resetWorkshop()
    setConfig({ clientName, facilitatorName, serviceType, date })
    registerClient(clientName, facilitatorName, serviceType, date)
    setLaunching(true)
    // Navigate after the cloud fade completes
    setTimeout(() => {
      router.push('/overview')
    }, 2000)
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
          src="/images/first-frame.jpg"
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
          src="/images/intro.mp4"
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
          src="/images/last-frame.jpg"
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
                      src="/images/logo-wordmark-white.png"
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
                      src="/images/logo-wordmark-white.png"
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
                      src="/images/logo-wordmark-white.png"
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
            transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Image
              src="/images/cloud-cutouts.jpeg"
              alt=""
              fill
              className="object-cover opacity-[0.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E8F0F6]/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
