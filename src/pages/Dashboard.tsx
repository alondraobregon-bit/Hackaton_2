import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../api/dashboard'
import type { DashboardSummary } from '../types/api'

export function Dashboard() {
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
    { label: 'Total Tropeles', value: data.totalTropels, color: 'text-cyan-400' },
    { label: 'Señales Activas', value: data.activeSignals, color: 'text-yellow-400' },
    { label: 'Señales Críticas', value: data.criticalSignals, color: 'text-red-400' },
    { label: 'Sectores', value: data.sectorsCount, color: 'text-green-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            <div className="text-sm text-slate-400 mb-1">{card.label}</div>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
