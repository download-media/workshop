'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useWorkshopStore } from './store'

export function useAutoSave() {
  const store = useWorkshopStore()
  const sessionIdRef = useRef<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>('')

  const save = useCallback(async () => {
    if (!store.config.clientName) return

    // Serialize current state (excluding functions)
    const data = {
      config: store.config,
      goldenCircle: store.goldenCircle,
      audiences: store.audiences,
      empathyMaps: store.empathyMaps,
      beforeAfter: store.beforeAfter,
      competitors: store.competitors,
      landscapePositions: store.landscapePositions,
      landscapeAxes: store.landscapeAxes,
      voiceAttributes: store.voiceAttributes,
      personalitySliders: store.personalitySliders,
      voiceGuardrails: store.voiceGuardrails,
      toneDimensions: store.toneDimensions,
      contentPillars: store.contentPillars,
      platformStrategies: store.platformStrategies,
      videoStyles: store.videoStyles,
      campaignIdeas: store.campaignIdeas,
      priorities: store.priorities,
    }

    const serialized = JSON.stringify(data)
    if (serialized === lastSavedRef.current) return // No changes
    lastSavedRef.current = serialized

    try {
      const res = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: store.config.clientName,
          facilitator: store.config.facilitatorName,
          serviceType: store.config.serviceType,
          date: store.config.date,
          workshopData: data,
          sessionId: sessionIdRef.current,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        if (result.session?.id) {
          sessionIdRef.current = result.session.id
        }
      }
    } catch (e) {
      console.warn('Auto-save failed:', e)
    }
  }, [store])

  // Debounced save — triggers 3 seconds after last change
  useEffect(() => {
    if (!store.config.clientName) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(save, 3000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [
    store.goldenCircle,
    store.audiences,
    store.empathyMaps,
    store.beforeAfter,
    store.competitors,
    store.landscapePositions,
    store.voiceAttributes,
    store.personalitySliders,
    store.voiceGuardrails,
    store.toneDimensions,
    store.contentPillars,
    store.platformStrategies,
    store.videoStyles,
    store.campaignIdeas,
    store.priorities,
    save,
    store.config.clientName,
  ])

  return { sessionId: sessionIdRef.current }
}
