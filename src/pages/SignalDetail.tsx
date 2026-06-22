import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSignal, updateSignalStatus } from '../api/signals'
import type { Signal } from '../types/api'

export function SignalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [signal, setSignal] = useState<Signal | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [confirmMsg, setConfirmMsg] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError('')
    getSignal(id)
      .then((res) => { if (!cancelled) setSignal(res) })
      .catch(() => { if (!cancelled) setError('Error al cargar señal') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const handleUpdate = async (status: 'PROCESANDO' | 'ATENDIDA') => {
    if (!id || !signal) return
    setUpdating(true)
    setUpdateError('')
    setConfirmMsg('')
    try {
      const updated = await updateSignalStatus(id, { status })
      setSignal(updated)
      setConfirmMsg(`Estado actualizado a ${status}`)
      setTimeout(() => setConfirmMsg(''), 3000)
    } catch {
      setUpdateError('Error al actualizar. Intente nuevamente.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-slate-400 py-8 text-center">Cargando señal...</div>
  if (error) return <div className="text-red-400 py-8 text-center">{error}</div>
  if (!signal) return <div className="text-slate-400 py-8 text-center">Señal no encontrada</div>

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-cyan-400 hover:text-cyan-300 text-sm mb-4"
      >
        ← Volver al feed
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl">
        <h1 className="text-xl font-bold text-cyan-300 mb-4">{signal.title}</h1>

        <div className="space-y-3 text-sm">
          <div><span className="text-slate-500">Descripción:</span> {signal.description}</div>
          <div><span className="text-slate-500">Tipo:</span> {signal.signalType}</div>
          <div><span className="text-slate-500">Severidad:</span> {signal.severity}</div>
          <div><span className="text-slate-500">Estado:</span> {signal.status}</div>
          <div><span className="text-slate-500">Tropel:</span> {signal.tropelName}</div>
          <div><span className="text-slate-500">Creada:</span> {new Date(signal.createdAt).toLocaleString()}</div>
        </div>

        {confirmMsg && (
          <div className="mt-4 bg-green-900/50 text-green-300 text-sm px-4 py-2 rounded">
            {confirmMsg}
          </div>
        )}

        {updateError && (
          <div className="mt-4 bg-red-900/50 text-red-300 text-sm px-4 py-2 rounded">
            {updateError}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => handleUpdate('PROCESANDO')}
            disabled={updating || signal.status === 'PROCESANDO'}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
          >
            {updating ? 'Actualizando...' : 'Procesando'}
          </button>
          <button
            onClick={() => handleUpdate('ATENDIDA')}
            disabled={updating || signal.status === 'ATENDIDA'}
            className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
          >
            {updating ? 'Actualizando...' : 'Atendida'}
          </button>
        </div>
      </div>
    </div>
  )
}
