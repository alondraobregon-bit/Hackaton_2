import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getSectorStory } from '../api/sectors'
import type { SectorStory as SectorStoryType } from '../types/api'

export function SectorStory() {
  const { id } = useParams<{ id: string }>()
  const [story, setStory] = useState<SectorStoryType | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState(0)
  const stageRefs = useRef<(HTMLDivElement | null)[]>([])
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = stageRefs.current.findIndex((ref) => ref === entry.target)
            if (index >= 0) setActiveStage(index)
          }
        }
      },
      { threshold: 0.5, rootMargin: '-80px 0px -20% 0px' },
    )

    for (const ref of stageRefs.current) {
      if (ref) observer.observe(ref)
    }

    return () => observer.disconnect()
  }, [story])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches
    const handler = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (loading) return <div className="text-slate-400 py-8 text-center">Cargando historia...</div>
  if (error) return <div className="text-red-400 py-8 text-center">{error}</div>
  if (!story) return <div className="text-slate-400 py-8 text-center">Historia no encontrada</div>

  const progress = ((activeStage + 1) / story.stages.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-14 z-10 bg-slate-900/90 backdrop-blur py-3 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">{story.name}</h1>
        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Etapa {activeStage + 1} de {story.stages.length}
        </div>
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-0.5 bg-slate-700" />

        {story.stages.map((stage, index) => {
          const stageMetrics = stage.metrics
          const stageKeys = Object.keys(stageMetrics)

          return (
            <div
              key={stage.id}
              ref={(el) => { stageRefs.current[index] = el }}
              data-stage={index}
              className={`relative pl-0 lg:pl-20 py-16 transition-opacity duration-500 ${
                index <= activeStage ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div className={`hidden lg:flex absolute left-4 w-9 h-9 rounded-full items-center justify-center text-sm font-bold border-2 transition-all ${
                index <= activeStage
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-500'
              }`}>
                {index + 1}
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-cyan-300 mb-2">{stage.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{stage.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {stageKeys.map((key) => (
                    <div
                      key={key}
                      className="bg-slate-900/50 rounded p-3"
                    >
                      <div className="text-xs text-slate-500 uppercase tracking-wider">{key}</div>
                      <div className={`text-lg font-bold mt-1 transition-all duration-700 ${
                        index <= activeStage
                          ? 'text-cyan-400 translate-y-0'
                          : 'text-slate-600 translate-y-2'
                      }`}>
                        {stageMetrics[key]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="py-12 text-center">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 inline-block">
          <div className="text-sm text-slate-400">Recorrido completado</div>
          <div className="text-2xl font-bold text-green-400 mt-1">100%</div>
        </div>
      </div>
    </div>
  )
}
