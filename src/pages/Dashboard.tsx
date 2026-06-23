import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardSummary } from '../api/dashboard'
import type { DashboardSummary } from '../types/api'

export function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getDashboardSummary()
      .then((res) => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setError('Error al cargar dashboard') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className="text-slate-400">Cargando dashboard...</div>
  if (error) return <div className="text-red-400">{error}</div>
  if (!data) return <div className="text-slate-400">Sin datos</div>

  const cards = [
    { label: 'Total Tropeles', value: data.totalTropels, color: 'text-cyan-400', onClick: () => navigate('/tropels') },
    { label: 'Tropeles Críticos', value: data.criticalTropels, color: 'text-red-400', onClick: () => navigate('/tropels?vitalState=CRITICO') },
    { label: 'Señales Abiertas', value: data.openSignals, color: 'text-yellow-400', onClick: () => navigate('/feed') },
    { label: 'Estabilidad Promedio', value: `${data.sectorStabilityAvg.toFixed(1)}%`, color: 'text-green-400', onClick: () => navigate('/sectors') },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={card.onClick}
            className="text-left bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-cyan-600 transition-colors"
          >
            <div className="text-sm text-slate-400 mb-1">{card.label}</div>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
        <div className="text-sm text-slate-400 mb-3">Señales por severidad</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-slate-500">Leve</div>
            <div className="text-xl font-bold text-slate-300">{data.signalsBySeverity.LEVE}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Moderado</div>
            <div className="text-xl font-bold text-yellow-400">{data.signalsBySeverity.MODERADO}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Grave</div>
            <div className="text-xl font-bold text-orange-400">{data.signalsBySeverity.GRAVE}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Crítico</div>
            <div className="text-xl font-bold text-red-400">{data.signalsBySeverity.CRITICO}</div>
          </div>
        </div>
      </div>
    </div>
  )
}