import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSectorStory } from '../api/sectors'
import type { SectorStory as SectorStoryType } from '../types/api'

export function SectorStory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [story, setStory] = useState<SectorStoryType | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState(0)
  const stageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getSectorStory(id)
      .then((res) => { if (!cancelled) setStory(res) })
      .catch(() => { if (!cancelled) setError('Error al cargar historia') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!story) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const index = stageRefs.current.findIndex((ref) => ref === entry.target)
          if (index >= 0) setActiveStage(index)
        }
      }
    }, { threshold: 0.5, rootMargin: '-80px 0px -20% 0px' })
    for (const ref of stageRefs.current) if (ref) observer.observe(ref)
    return () => observer.disconnect()
  }, [story])

  const goToStage = useCallback((index: number) => {
    const el = stageRefs.current[index]
    if (!el || !story) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
    setActiveStage(index)
  }, [story])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!story) return
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      goToStage(Math.min(activeStage + 1, story.stages.length - 1))
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      goToStage(Math.max(activeStage - 1, 0))
    }
  }

  const handleBack = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => navigate('/sectors'))
    } else {
      navigate('/sectors')
    }
  }

  if (loading) return <div className="text-slate-400 py-8 text-center">Cargando historia...</div>
  if (error) return <div className="text-red-400 py-8 text-center">{error}</div>
  if (!story) return <div className="text-slate-400 py-8 text-center">Historia no encontrada</div>

  const progress = ((activeStage + 1) / story.stages.length) * 100
  const currentStage = story.stages[activeStage]

  return (
    <div className="max-w-5xl mx-auto" tabIndex={0} onKeyDown={handleKeyDown} aria-label="Historia del sector, usa flechas para navegar">
      <button onClick={handleBack} className="text-cyan-400 hover:text-cyan-300 text-sm mb-2">← Volver a sectores</button>

      <div className="sticky top-14 z-10 bg-slate-900/90 backdrop-blur py-3 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">{story.name}</h1>
        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
          <span>Etapa {activeStage + 1} de {story.stages.length}</span>
          <span className="flex gap-2">
            <button onClick={() => goToStage(Math.max(activeStage - 1, 0))} className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700" aria-label="Etapa anterior">↑</button>
            <button onClick={() => goToStage(Math.min(activeStage + 1, story.stages.length - 1))} className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700" aria-label="Etapa siguiente">↓</button>
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 mt-6">
        {/* Visual persistente: cambia con la etapa activa, no se desmonta */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="stage-visual is-active bg-slate-800 border border-cyan-700 rounded-lg p-6 text-center">
            <div className="text-5xl font-black text-cyan-400 transition-all duration-500">{activeStage + 1}</div>
            <div className="text-sm text-slate-300 mt-2">{currentStage.title}</div>
            <div className="mt-4 space-y-1">
              {Object.entries(currentStage.metrics).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs text-slate-400">
                  <span className="uppercase">{k}</span><span className="text-cyan-300 font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          {story.stages.map((stage, index) => (
            <div key={stage.id} ref={(el) => { stageRefs.current[index] = el }}
              className={`stage-visual relative py-12 ${index === activeStage ? 'is-active' : ''}`}>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-cyan-300 mb-2">{stage.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-12 text-center">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 inline-block">
          <div className="text-sm text-slate-400">Recorrido completado</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  )
}