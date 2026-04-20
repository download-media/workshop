'use client'

import { motion } from 'framer-motion'

interface ExerciseCardProps {
  title: string
  description: string
  children: React.ReactNode
  time?: string
}

export function ExerciseCard({ title, description, children, time }: ExerciseCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="title-caps-md text-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-[#2E2E2E]">
              {description}
            </p>
          )}
        </div>
        {time && (
          <span className="title-caps-sm shrink-0 text-ink/20">{time}</span>
        )}
      </div>
      <div>{children}</div>
    </motion.section>
  )
}
