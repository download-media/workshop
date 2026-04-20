'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkshopStore } from '@/lib/store'

export default function WorkshopIndex() {
  const router = useRouter()
  const currentPhase = useWorkshopStore((s) => s.currentPhase)

  useEffect(() => {
    if (currentPhase === 'setup') {
      router.replace('/overview')
    } else {
      router.replace(`/workshop/${currentPhase}`)
    }
  }, [currentPhase, router])

  return null
}
