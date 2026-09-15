'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useWorkshopStore } from './store'

export function serializeWorkshop(store: ReturnType<typeof useWorkshopStore.getState>) {
  return {
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
    logistics: store.logistics,
    videoStyles: store.videoStyles,
    campaignIdeas: store.campaignIdeas,
    priorities: store.priorities,
    aiBrief: store.aiBrief,
  }
}

export function useAutoSave() {
  const store = useWorkshopStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>('')
  const inFlightRef = useRef(false)

  const save = useCallback(async () => {
    if (!store.config.clientName || inFlightRef.current) return

    const data = serializeWorkshop(store)
    const serialized = JSON.stringify(data)
    if (serialized === lastSavedRef.current) return // No changes

    inFlightRef.current = true
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
          sessionId: store.sessionId,
        }),
      })

      if (res.ok) {
        lastSavedRef.current = serialized
        const result = await res.json()
        if (result.session?.id && result.session.id !== store.sessionId) {
          store.setSessionId(result.session.id)
        }
      }
    } catch (e) {
      console.warn('Auto-save failed:', e)
    } finally {
      inFlightRef.current = false
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
    store.landscapeAxes,
    store.voiceAttributes,
    store.personalitySliders,
    store.voiceGuardrails,
    store.toneDimensions,
    store.contentPillars,
    store.platformStrategies,
    store.logistics,
    store.videoStyles,
    store.campaignIdeas,
    store.priorities,
    store.aiBrief,
    save,
    store.config.clientName,
  ])

  return { sessionId: store.sessionId }
}
