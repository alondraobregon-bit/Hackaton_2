import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getSignalFeed } from '../api/signals'
import { useFeed } from '../hooks/useFeed'

export function Feed() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { state, setState, resetState } = useFeed()
  const loadingRef = useRef(false)
  const restoredRef = useRef(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  // Carga inicial o por cambio de filtros (si ya hay data cacheada con el mismo filterKey, no refetch)
  useEffect(() => {
    if (state.filterKey === filterKey && state.items.length > 0) {
      restoredRef.current = false
      return
    }

    resetState(filterKey)
    let cancelled = false
    setLoading(true)
    setError('')

    getSignalFeed({
      limit: 15,
      signalType: signalType || undefined,
      severity: severity || undefined,
      status: status || undefined,
      q: q || undefined,
    })
      .then((res) => {
        if (cancelled) return
        setState({ items: res.items, nextCursor: res.nextCursor, hasMore: res.hasMore, filterKey })
      })
      .catch(() => {
        if (!cancelled) setError('Error al cargar señales')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [filterKey])

  const loadMore = useCallback(() => {
    if (loadingRef.current || !state.hasMore || !state.nextCursor) return
    if (state.filterKey !== filterKey) return

    loadingRef.current = true
    setLoading(true)
    const requestFilterKey = filterKey

    getSignalFeed({
      cursor: state.nextCursor,
      limit: 15,
      signalType: signalType || undefined,
      severity: severity || undefined,
      status: status || undefined,
      q: q || undefined,
    })
      .then((res) => {
        // Si los filtros cambiaron mientras la request estaba en vuelo, descartar el resultado
        if (requestFilterKey !== filterKey) return
        setState((prevLike => {
          const existingIds = new Set(state.items.map((s) => s.id))
          const newItems = res.items.filter((s) => !existingIds.has(s.id))
          return { items: [...state.items, ...newItems], nextCursor: res.nextCursor, hasMore: res.hasMore }
        })())
      })
      .catch(() => {
        setError('Error al cargar más señales')
      })
      .finally(() => {
        setLoading(false)
        loadingRef.current = false
      })
  }, [state.nextCursor, state.hasMore, state.filterKey, state.items, filterKey, signalType, severity, status, q, setState])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.hasMore && !loadingRef.current) {
          loadMore()
        }
      },
      { rootMargin: '200px' },
    )
    observerRef.current.observe(node)
  }, [loadMore, state.hasMore])

  // Restaurar posición de scroll al volver del detalle (solo una vez por montaje)
  useLayoutEffect(() => {
    if (restoredRef.current) return
    if (state.items.length > 0 && state.scrollY > 0) {
      window.scrollTo(0, state.scrollY)
    }
    restoredRef.current = true
  }, [state.items.length, state.scrollY])

  const openDetail = (id: string) => {
    setState({ scrollY: window.scrollY })
    navigate(`/feed/${id}`)
  }

  if (loading && state.items.length === 0) {
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

      {error && state.items.length === 0 && (
        <div className="text-red-400 py-8 text-center">{error}</div>
      )}
      {error && state.items.length > 0 && (
        <div className="text-yellow-400 text-sm mb-2">{error}</div>
      )}

      {!loading && !error && state.items.length === 0 && (
        <div className="text-slate-500 py-8 text-center">Sin resultados</div>
      )}

      <div className="space-y-2">
        {state.items.map((signal) => (
          <div
            key={signal.id}
            onClick={() => openDetail(signal.id)}
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

      {loading && state.items.length > 0 && (
        <div className="text-slate-500 text-center py-4">Cargando más...</div>
      )}
      {!state.hasMore && state.items.length > 0 && (
        <div className="text-slate-500 text-center py-4 text-sm">No hay más señales</div>
      )}
      {state.hasMore && !loading && <div ref={sentinelRef} className="h-4" />}
    </div>
  )
}