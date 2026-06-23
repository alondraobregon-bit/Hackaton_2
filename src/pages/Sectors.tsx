import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSectors } from '../api/sectors'
import type { Sector } from '../types/api'

export function Sectors() {
  const navigate = useNavigate()
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getSectors()
      .then((res) => { if (!cancelled) setSectors(res) })
      .catch(() => { if (!cancelled) setError('Error al cargar sectores') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const goToStory = (id: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => navigate(`/sectors/${id}/story`))
    } else {
      navigate(`/sectors/${id}/story`)
    }
  }

  if (loading) return <div className="text-slate-400 py-8 text-center">Cargando sectores...</div>
  if (error) return <div className="text-red-400 py-8 text-center">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sectores</h1>
      {sectors.length === 0 ? (
        <div className="text-slate-500 py-8 text-center">Sin sectores</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectors.map((s) => (
  <button
    key={s.id}
    onClick={() => goToStory(s.id)}
    className="text-left bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-cyan-600 transition-colors"
  >
    <div className="flex items-center justify-between">
      <div className="font-medium text-cyan-300">{s.name}</div>
      <span className="text-xs text-slate-500">{s.sectorCode}</span>
    </div>
    <div className="text-sm text-slate-400 mt-1">{s.climate.replace('_', ' ')}</div>
    <div className="text-xs text-slate-500 mt-2">
      Carga: {s.currentLoad}/{s.capacity}
    </div>
    <div className="text-xs mt-1">
      <span className="text-slate-500">Estabilidad: </span>
      <span className={
        s.stabilityLevel >= 70 ? 'text-green-400' :
        s.stabilityLevel >= 50 ? 'text-yellow-400' : 'text-red-400'
      }>
        {s.stabilityLevel}%
      </span>
    </div>
  </button>
))}
        </div>
      )}
    </div>
  )
}