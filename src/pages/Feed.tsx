import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getSignalFeed } from '../api/signals'
import type { Signal } from '../types/api'

export function Feed() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [items, setItems] = useState<Signal[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loadingRef = useRef(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const signalType = searchParams.get('signalType') ?? ''
  const severity = searchParams.get('severity') ?? ''
  const status = searchParams.get('status') ?? ''
  const q = searchParams.get('q') ?? ''

  const filterKey = `${signalType}|${severity}|${status}|${q}`

  const updateFilter = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    setItems([])
    setNextCursor(null)
    setHasMore(true)
    setError('')
    setInitialLoading(true)
    loadingRef.current = false

    let cancelled = false
    setLoading(true)
    getSignalFeed({ limit: 15, signalType: signalType || undefined, severity: severity || undefined, status: status || undefined, q: q || undefined })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setNextCursor(res.nextCursor)
        setHasMore(res.hasMore)
      })
      .catch(() => {
        if (cancelled) return
        setError('Error al cargar señales')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
        setInitialLoading(false)
      })

    return () => { cancelled = true }
  }, [filterKey])

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || !nextCursor) return
    loadingRef.current = true
    setLoading(true)

    let cancelled = false
    getSignalFeed({ cursor: nextCursor, limit: 15, signalType: signalType || undefined, severity: severity || undefined, status: status || undefined, q: q || undefined })
      .then((res) => {
        if (cancelled) return
        setItems((prev) => {
          const existingIds = new Set(prev.map((s) => s.id))
          const newItems = res.items.filter((s) => !existingIds.has(s.id))
          return [...prev, ...newItems]
        })
        setNextCursor(res.nextCursor)
        setHasMore(res.hasMore)
      })
      .catch(() => {
        if (cancelled) return
        setError('Error al cargar más señales')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
        loadingRef.current = false
      })

    return () => { cancelled = true }
  }, [nextCursor, hasMore, signalType, severity, status, q])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
            loadMore()
          }
        },
        { rootMargin: '200px' },
      )
      observerRef.current.observe(node)
    },
    [loadMore, hasMore],
  )

  if (initialLoading) {
    return <div className="text-slate-400 py-8 text-center">Cargando señales...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Feed de Señales</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Buscar..."
          value={q}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white w-48"
        />
        <select
          value={signalType}
          onChange={(e) => updateFilter('signalType', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white"
        >
          <option value="">Todos tipos</option>
          <option value="ALERTA">Alerta</option>
          <option value="ERROR">Error</option>
          <option value="INFO">Info</option>
        </select>
        <select
          value={severity}
          onChange={(e) => updateFilter('severity', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white"
        >
          <option value="">Todas severidades</option>
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
          <option value="CRITICA">Crítica</option>
        </select>
        <select
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white"
        >
          <option value="">Todos estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PROCESANDO">Procesando</option>
          <option value="ATENDIDA">Atendida</option>
        </select>
      </div>

      {error && !loading && items.length === 0 && (
        <div className="text-red-400 py-8 text-center">{error}</div>
      )}

      {error && items.length > 0 && (
        <div className="text-yellow-400 text-sm mb-2">{error}</div>
      )}

      <div className="space-y-2">
        {items.map((signal) => (
          <div
            key={signal.id}
            onClick={() => navigate(`/feed/${signal.id}`)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-cyan-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-cyan-300">{signal.title}</div>
                <div className="text-sm text-slate-400 mt-1">{signal.tropelName}</div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded ${
                  signal.severity === 'CRITICA' ? 'bg-red-900 text-red-300' :
                  signal.severity === 'ALTA' ? 'bg-orange-900 text-orange-300' :
                  signal.severity === 'MEDIA' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {signal.severity}
                </span>
                <span className={`px-2 py-0.5 rounded ${
                  signal.status === 'ATENDIDA' ? 'bg-green-900 text-green-300' :
                  signal.status === 'PROCESANDO' ? 'bg-blue-900 text-blue-300' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {signal.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && items.length > 0 && (
        <div className="text-slate-500 text-center py-4">Cargando más...</div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-slate-500 text-center py-4 text-sm">No hay más señales</div>
      )}

      {hasMore && !loading && <div ref={sentinelRef} className="h-4" />}
    </div>
  )
}
