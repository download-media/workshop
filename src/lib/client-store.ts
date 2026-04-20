'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ClientRecord {
  id: string
  name: string
  facilitator: string
  createdAt: string
  lastServiceType: string
  sessions: { serviceType: string; date: string }[]
}

interface ClientStore {
  clients: ClientRecord[]
  registerClient: (name: string, facilitator: string, serviceType: string, date: string) => void
  getClient: (name: string) => ClientRecord | undefined
  removeClient: (id: string) => void
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

      registerClient: (name, facilitator, serviceType, date) => {
        const existing = get().clients.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        )

        if (existing) {
          // Update existing client with new session
          const hasSession = existing.sessions.some(
            (s) => s.serviceType === serviceType && s.date === date
          )
          set((s) => ({
            clients: s.clients.map((c) =>
              c.id === existing.id
                ? {
                    ...c,
                    facilitator,
                    lastServiceType: serviceType,
                    sessions: hasSession
                      ? c.sessions
                      : [...c.sessions, { serviceType, date }],
                  }
                : c
            ),
          }))
        } else {
          // New client
          set((s) => ({
            clients: [
              ...s.clients,
              {
                id: uid(),
                name,
                facilitator,
                createdAt: date,
                lastServiceType: serviceType,
                sessions: [{ serviceType, date }],
              },
            ],
          }))
        }
      },

      getClient: (name) => {
        return get().clients.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        )
      },

      removeClient: (id) => {
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }))
      },
    }),
    { name: 'client-store' }
  )
)
