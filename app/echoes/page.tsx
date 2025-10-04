'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/AuthContext'
import { EmotionStage, getRandomFragment, getStageColors } from '@/lib/emotionStages'

interface Echo {
  id: string
  content: string
  stage: EmotionStage
  shownAt: Date
  wasRead: boolean
  type: 'notification' | 'daily' | 'milestone'
}

export default function EchoesPage() {
  const { user, isAuthenticated } = useAuth()
  const [echoes, setEchoes] = useState<Echo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEcho, setSelectedEcho] = useState<Echo | null>(null)
  const [filter, setFilter] = useState<EmotionStage | 'all'>('all')

  useEffect(() => {
    if (isAuthenticated) {
      // TODO: Fetch real echoes from API
      // For now, using mock data
      const mockEchoes: Echo[] = [
        {
          id: '1',
          content: 'En la oscuridad más profunda, la luz es más preciada...',
          stage: 'depression',
          shownAt: new Date('2024-01-15T22:30:00'),
          wasRead: true,
          type: 'notification'
        },
        {
          id: '2',
          content: 'El fuego que quema por dentro busca salida...',
          stage: 'anger',
          shownAt: new Date('2024-01-14T15:45:00'),
          wasRead: false,
          type: 'daily'
        },
        {
          id: '3',
          content: 'Algunos caminos se cierran para que otros se abran...',
          stage: 'bargaining',
          shownAt: new Date('2024-01-13T18:20:00'),
          wasRead: true,
          type: 'milestone'
        },
        {
          id: '4',
          content: 'A veces la verdad duele más que la mentira...',
          stage: 'denial',
          shownAt: new Date('2024-01-12T09:15:00'),
          wasRead: false,
          type: 'notification'
        },
        {
          id: '5',
          content: 'La paz llega cuando dejamos de luchar contra lo inevitable...',
          stage: 'acceptance',
          shownAt: new Date('2024-01-11T21:10:00'),
          wasRead: true,
          type: 'daily'
        }
      ]
      setEchoes(mockEchoes)
      setLoading(false)
    }
  }, [isAuthenticated])

  const filteredEchoes = echoes.filter(echo => 
    filter === 'all' || echo.stage === filter
  )

  const markAsRead = (echoId: string) => {
    setEchoes(prev => 
      prev.map(echo => 
        echo.id === echoId ? { ...echo, wasRead: true } : echo
      )
    )
  }

  const generateNewEcho = () => {
    const stages: EmotionStage[] = ['denial', 'anger', 'bargaining', 'depression', 'acceptance']
    const randomStage = stages[Math.floor(Math.random() * stages.length)]
    const fragment = getRandomFragment(randomStage)
    
    const newEcho: Echo = {
      id: Date.now().toString(),
      content: fragment,
      stage: randomStage,
      shownAt: new Date(),
      wasRead: false,
      type: 'daily'
    }
    
    setEchoes(prev => [newEcho, ...prev])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Ecos del Alma</h1>
          <p className="text-gray-400">Fragmentos misteriosos que resuenan con tu viaje emocional</p>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-black/40 text-gray-400 hover:bg-black/60'
              }`}
            >
              Todos
            </button>
            {(['denial', 'anger', 'bargaining', 'depression', 'acceptance'] as EmotionStage[]).map(stage => {
              const stageColor = getStageColors(stage)
              return (
                <button
                  key={stage}
                  onClick={() => setFilter(stage)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    filter === stage
                      ? 'text-white'
                      : 'bg-black/40 text-gray-400 hover:bg-black/60'
                  }`}
                  style={{
                    backgroundColor: filter === stage ? stageColor : undefined
                  }}
                >
                  {stage}
                </button>
              )
            })}
          </div>

          {/* Generate New Echo Button */}
          <button
            onClick={generateNewEcho}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
          >
            ✨ Recibir Nuevo Eco
          </button>

          {/* Echoes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEchoes.map((echo) => {
                const stageColor = getStageColors(echo.stage)
                const typeIcons = {
                  notification: '🔔',
                  daily: '🌙',
                  milestone: '⭐'
                }
                
                return (
                  <motion.div
                    key={echo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                    className={`relative p-6 rounded-lg border cursor-pointer transition-all duration-300 ${
                      echo.wasRead
                        ? 'bg-black/20 border-purple-500/20 hover:border-purple-500/40'
                        : 'bg-black/40 border-purple-500/50 hover:border-purple-500/70 shadow-lg'
                    }`}
                    style={{
                      boxShadow: echo.wasRead ? undefined : `0 0 20px ${stageColor}20`
                    }}
                    onClick={() => {
                      setSelectedEcho(echo)
                      if (!echo.wasRead) {
                        markAsRead(echo.id)
                      }
                    }}
                  >
                    {/* Unread indicator */}
                    {!echo.wasRead && (
                      <div 
                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full"
                        style={{ backgroundColor: stageColor }}
                      />
                    )}

                    {/* Type indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{typeIcons[echo.type]}</span>
                      <span 
                        className="text-xs px-2 py-1 rounded-full bg-white/10"
                        style={{ color: stageColor }}
                      >
                        {echo.stage}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-white italic leading-relaxed mb-4">
                      "{echo.content}"
                    </p>

                    {/* Timestamp */}
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{echo.shownAt.toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{echo.shownAt.toLocaleTimeString()}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {filteredEchoes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                {filter === 'all' 
                  ? 'No tienes ecos aún' 
                  : `No tienes ecos en la etapa ${filter}`
                }
              </p>
              <button
                onClick={generateNewEcho}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Generar tu primer eco
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Echo Detail Modal */}
      <AnimatePresence>
        {selectedEcho && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEcho(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-black/90 border border-purple-500/30 rounded-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: getStageColors(selectedEcho.stage) + '20' }}
                >
                  {selectedEcho.type === 'notification' && '🔔'}
                  {selectedEcho.type === 'daily' && '🌙'}
                  {selectedEcho.type === 'milestone' && '⭐'}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  Eco de {selectedEcho.stage}
                </h3>
                
                <p className="text-purple-300 italic text-lg leading-relaxed mb-6">
                  "{selectedEcho.content}"
                </p>
                
                <div className="text-sm text-gray-400 mb-6">
                  Recibido el {selectedEcho.shownAt.toLocaleDateString()} a las {selectedEcho.shownAt.toLocaleTimeString()}
                </div>
                
                <button
                  onClick={() => setSelectedEcho(null)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 