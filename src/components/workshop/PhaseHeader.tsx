'use client'

import { motion } from 'framer-motion'

interface PhaseHeaderProps {
  number: number
  title: string
  subtitle: string
  color: string
}

export function PhaseHeader({ number, title, subtitle }: PhaseHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-14"
    >
      <span className="title-caps-sm mb-4 block text-sky-deep/50">
        PHASE {String(number).padStart(2, '0')}
      </span>
      <h1 className="title-caps-lg text-ink">
        {title}
      </h1>
      <p className="mt-4 text-base text-[#2E2E2E]">
        {subtitle}
      </p>
      <div className="mt-8 h-px w-full bg-ink/[0.06]" />
    </motion.div>
  )
}
