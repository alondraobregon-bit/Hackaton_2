import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getTropels } from '../api/tropels'
import type { Tropel, TropelPage } from '../types/api'

const SORT_OPTIONS = [
  { value: 'name,asc', label: 'Nombre A-Z' },
  { value: 'updatedAt,desc', label: 'Actualización' },
  { value: 'chaosIndex,desc', label: 'Caos' },
]

export function Tropels() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<TropelPage | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const requestIdRef = useRef(0)

  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const size = parseInt(searchParams.get('size') ?? '10', 10)
  const species = searchParams.get('species') ?? ''
  const vitalState = searchParams.get('vitalState') ?? ''
  const sectorId = searchParams.get('sectorId') ?? ''
  const q = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'name,asc'

  const updateFilter = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.set('page', '0')
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    const id = ++requestIdRef.current
    setLoading(true)
    setError('')

    const filters: Record<string, string | number> = { page, size }
    if (species) filters.species = species
    if (vitalState) filters.vitalState = vitalState
    if (sectorId) filters.sectorId = sectorId
    if (q) filters.q = q
    if (sort) filters.sort = sort

    getTropels(filters)
      .then((res) => {
        if (id !== requestIdRef.current) return
        setData(res)
      })
      .catch(() => {
        if (id !== requestIdRef.current) return
        setError('Error al cargar tropeles')
      })
      .finally(() => {
        if (id !== requestIdRef.current) return
        setLoading(false)
      })
  }, [page, size, species, vitalState, sectorId, q, sort])

  const totalPages = data?.totalPages ?? 0
  const currentPage = data?.currentPage ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Atlas de Tropeles</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Buscar..."
          value={q}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white w-48"
        />
        <select
          value={species}
          onChange={(e) => updateFilter('species', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white"
        >
          <option value="">Todas especies</option>
          <option value="FIRE">Fuego</option>
          <option value="WATER">Agua</option>
          <option value="EARTH">Tierra</option>
          <option value="AIR">Aire</option>
        </select>
        <select
          value={vitalState}
          onChange={(e) => updateFilter('vitalState', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white"
        >
          <option value="">Todos estados</option>
          <option value="ESTABLE">Estable</option>
          <option value="CRITICO">Crítico</option>
          <option value="INESTABLE">Inestable</option>
        </select>
        <select
          value={size.toString()}
          onChange={(e) => updateFilter('size', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white"
        >
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
        </select>
        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-slate-400 py-8 text-center">Cargando...</div>}
      {error && <div className="text-red-400 py-8 text-center">{error}</div>}

      {!loading && !error && data && (
        <>
          {data.content.length === 0 ? (
            <div className="text-slate-500 py-8 text-center">Sin resultados</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {data.content.map((tropel: Tropel) => (
                <div key={tropel.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="font-medium text-cyan-300">{tropel.name}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {tropel.species} · {tropel.vitalState}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{tropel.sectorName}</div>
                  <div className="text-xs text-slate-500">Caos: {tropel.chaosIndex}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{data.totalElements} tropeles</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 0}
                onClick={() => updateFilter('page', String(currentPage - 1))}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1 rounded"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => updateFilter('page', String(currentPage + 1))}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1 rounded"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
