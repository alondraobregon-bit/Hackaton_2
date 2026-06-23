import { createContext, useState, useCallback, type ReactNode } from 'react'
import type { Signal } from '../types/api'

interface FeedState {
  items: Signal[]
  nextCursor: string | null
  hasMore: boolean
  filterKey: string
  scrollY: number
}

interface FeedContextType {
  state: FeedState
  setState: (s: Partial<FeedState>) => void
  resetState: (filterKey: string) => void
}

const initial: FeedState = { items: [], nextCursor: null, hasMore: true, filterKey: '', scrollY: 0 }

export const FeedContext = createContext<FeedContextType | undefined>(undefined)

export function FeedProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<FeedState>(initial)

  const setState = useCallback((s: Partial<FeedState>) => {
    setStateRaw((prev) => ({ ...prev, ...s }))
  }, [])

  const resetState = useCallback((filterKey: string) => {
    setStateRaw({ items: [], nextCursor: null, hasMore: true, filterKey, scrollY: 0 })
  }, [])

  return (
    <FeedContext.Provider value={{ state, setState, resetState }}>
      {children}
    </FeedContext.Provider>
  )
}