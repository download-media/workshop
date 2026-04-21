'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useWorkshopStore } from '@/lib/store'
import { useAutoSave } from '@/lib/use-auto-save'
import { PHASES, getNextPhase, getPrevPhase } from '@/lib/phases'
import type { PhaseId } from '@/lib/types'

function NavBar({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    function onScroll() {
      setScrolled((main as HTMLElement).scrollTop > 20)
    }
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-5 sm:px-10 flex items-center justify-between"
      style={{
        background: 'rgba(205, 220, 235, 0.88)',
        backdropFilter: 'blur(80px) saturate(220%)',
        WebkitBackdropFilter: 'blur(80px) saturate(220%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.05)' : 'none',
      }}
    >
      {children}
    </nav>
  )
}

const WORKSHOP_PHASES = PHASES.filter((p) => p.id !== 'setup')

const PHASE_IMAGES: Record<string, string> = {
  foundation: '/images/frosted-cloud.jpeg',
  audience: '/images/clouds-portrait.jpeg',
  position: '/images/bokeh-light.jpeg',
  identity: '/images/cloud-cutouts.jpeg',
  application: '/images/frosted-cloud.jpeg',
  priorities: '/images/cloud-cutouts.jpeg',
}

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { currentPhase, setCurrentPhase, config } = useWorkshopStore()
  useAutoSave() // Auto-saves workshop data to Supabase every 3s

  const currentIndex = WORKSHOP_PHASES.findIndex((p) => p.id === currentPhase)
  const prev = getPrevPhase(currentPhase)
  const next = getNextPhase(currentPhase)

  function navigatePhase(phaseId: PhaseId) {
    setCurrentPhase(phaseId)
    router.push(`/workshop/${phaseId}`)
  }

  return (
    <div className="relative min-h-screen sky-bg">

      {/* ── Full bleed background image — fades between phases ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          className="pointer-events-none fixed inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <Image
            src={PHASE_IMAGES[currentPhase] || '/images/clouds-portrait.jpeg'}
            alt=""
            fill
            className="object-cover opacity-[0.08]"
            priority
          />
          {/* Gradient fade to sky at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E8F0F6]/80" />
        </motion.div>
      </AnimatePresence>

      {/* ── Minimal top bar — develops liquid glass on scroll ── */}
      <NavBar>
        {/* Left: wordmark */}
        <button
          onClick={() => router.push('/overview')}
          className="title-caps-sm text-ink/30 hover:text-ink/60 transition-colors"
        >
          DWNLD {config.clientName && <>/ {config.clientName.toUpperCase()}</>}
        </button>

        {/* Center: phases as bare text */}
        <div className="hidden md:flex items-center gap-1">
          {WORKSHOP_PHASES.map((phase, idx) => {
            const isActive = phase.id === currentPhase
            const isPast = idx < currentIndex
            return (
              <button
                key={phase.id}
                onClick={() => navigatePhase(phase.id)}
                className="relative px-3 py-2 group"
              >
                <span className={`title-caps-sm transition-all duration-500 ${
                  isActive ? 'text-ink' : isPast ? 'text-ink/35' : 'text-ink/15 group-hover:text-ink/30'
                }`}>
                  {phase.title}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-1 h-1 rounded-full bg-ink"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Right: summary */}
        <button
          onClick={() => router.push('/workshop/summary')}
          className="title-caps-sm text-ink/15 hover:text-ink/40 transition-colors"
        >
          SUMMARY
        </button>
      </NavBar>

      {/* ── Progress line — thin, across full width ── */}
      <div className="fixed top-14 left-0 right-0 z-40 h-px bg-ink/[0.04]">
        <motion.div
          className="h-full bg-ink/20"
          animate={{ width: `${((currentIndex + 1) / WORKSHOP_PHASES.length) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* ── Content — full bleed, exercises live directly on the sky ── */}
      <main className="relative z-10 pt-24 pb-24 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-16"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom nav — just floating text, no bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 py-5 sm:px-10 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="title-caps-sm text-ink/20 hover:text-ink/50 transition-colors"
        >
          ← BACK
        </button>

        <span className="title-caps-sm text-ink/10">
          {String(currentIndex + 1).padStart(2, '0')}/{String(WORKSHOP_PHASES.length).padStart(2, '0')}
        </span>

        {next ? (
          <button
            onClick={() => navigatePhase(next.id)}
            className="title-caps-sm text-ink/30 hover:text-ink/60 transition-colors"
          >
            {next.title.toUpperCase()} →
          </button>
        ) : (
          <button
            onClick={() => router.push('/workshop/summary')}
            className="title-caps-sm text-ink/30 hover:text-ink/60 transition-colors"
          >
            VIEW SUMMARY →
          </button>
        )}
      </div>
    </div>
  )
}
