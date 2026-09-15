'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Printer, Sparkles } from 'lucide-react'
import { useWorkshopStore } from '@/lib/store'
import { SummaryDocument, type WorkshopSummaryData } from '@/components/summary/SummaryDocument'
import { serializeWorkshop } from '@/lib/use-auto-save'
import { buildHandoffMarkdown } from '@/lib/handoff'

export default function SummaryPage() {
  const store = useWorkshopStore()
  const [interpreting, setInterpreting] = useState(false)
  const [briefError, setBriefError] = useState('')
  const [handoffCopied, setHandoffCopied] = useState(false)

  const data: WorkshopSummaryData = serializeWorkshop(store)

  const handlePrint = () => window.print()

  const handleInterpret = async () => {
    setInterpreting(true)
    setBriefError('')
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopData: data,
          clientName: store.config.clientName,
          serviceType: store.config.serviceType,
        }),
      })
      const result = await res.json()
      if (result.brief) {
        // Persisted with the session via auto-save, so the brief survives reloads
        store.setAiBrief(result.brief)
      } else {
        setBriefError(result.error || 'The brief could not be generated. Try again.')
      }
    } catch {
      setBriefError('Could not reach the AI service. Try again.')
    } finally {
      setInterpreting(false)
    }
  }

  const handleHandoff = () => {
    const markdown = buildHandoffMarkdown(data)
    // Copy for pasting straight into Claude/ChatGPT
    navigator.clipboard.writeText(markdown).catch(() => {})
    setHandoffCopied(true)
    setTimeout(() => setHandoffCopied(false), 2500)
    // And download as a .md file for the project folder
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(store.config.clientName || 'workshop').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-workshop-handoff.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="summary-page mx-auto max-w-3xl">
      {/* ── Toolbar — never printed ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print mb-10 liquid-glass rounded-2xl px-5 py-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleInterpret}
              disabled={interpreting}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#2E5E8C' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {interpreting ? 'WRITING BRIEF...' : store.aiBrief ? 'REGENERATE BRIEF' : 'GENERATE BRIEF'}
            </button>
            <button
              onClick={handleHandoff}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold tracking-wider transition-all hover:bg-white/70"
              style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: '#1A1A1A', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              {handoffCopied ? <Check className="h-3.5 w-3.5 text-[#2E5E8C]" /> : <Copy className="h-3.5 w-3.5" />}
              {handoffCopied ? 'COPIED + DOWNLOADED' : 'HAND OFF TO AI'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold tracking-wider text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              <Printer className="h-3.5 w-3.5" />
              PRINT / PDF
            </button>
          </div>
          <p className="text-[11px] text-ink/30">
            Hand off copies a complete markdown brief to your clipboard and downloads it as a file.
          </p>
        </div>
        {briefError && <p className="mt-3 text-xs text-[#E85A5A]">{briefError}</p>}
        {interpreting && (
          <p className="mt-3 text-xs text-ink/35">Claude is reading the whole workshop and writing the strategic brief. About 30 seconds.</p>
        )}
      </motion.div>

      {/* ── The document ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SummaryDocument data={data} />
      </motion.div>
    </div>
  )
}
