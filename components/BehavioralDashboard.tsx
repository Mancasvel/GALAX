'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBehavioralTracking, behavioralTracker } from '@/lib/behavioralAnalytics'
import { BehavioralTracker } from '@/components/BehavioralTracker'

interface BehavioralDashboardProps {
  isVisible?: boolean
  onClose?: () => void
}

export default function BehavioralDashboard({ 
  isVisible = false, 
  onClose 
}: BehavioralDashboardProps) {
  const { getAdvancedMetrics, getRealTimeStats } = useBehavioralTracking()
  const [activeTab, setActiveTab] = useState<'realtime' | 'patterns' | 'analysis' | 'privacy'>('realtime')
  const [isRecording, setIsRecording] = useState(true)
  const [showRawData, setShowRawData] = useState(false)
  
  // Estados para métricas en tiempo real
  const [realTimeStats, setRealTimeStats] = useState(getRealTimeStats())
  const [advancedMetrics, setAdvancedMetrics] = useState(getAdvancedMetrics())
  
  // Actualizar métricas cada segundo
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setRealTimeStats(getRealTimeStats())
      setAdvancedMetrics(getAdvancedMetrics())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isVisible, getRealTimeStats, getAdvancedMetrics])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-4 bg-black border border-green-400 rounded-lg z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-green-400/30 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-400 font-mono">
              [BEHAVIORAL SURVEILLANCE DASHBOARD]
            </h2>
            <p className="text-gray-400 text-sm">
              Real-time consciousness mapping and pattern analysis
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
                isRecording 
                  ? 'bg-red-600/30 text-red-400 hover:bg-red-600/50' 
                  : 'bg-gray-600/30 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              {isRecording ? '[RECORDING]' : '[PAUSED]'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white font-mono text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-green-400/20 bg-black/50">
        {[
          { id: 'realtime', label: 'REAL-TIME' },
          { id: 'patterns', label: 'PATTERNS' },
          { id: 'analysis', label: 'ANALYSIS' },
          { id: 'privacy', label: 'PRIVACY' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-mono text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            [{tab.label}]
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'realtime' && (
            <motion.div
              key="realtime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Métricas en tiempo real */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="TYPING VELOCITY"
                  value={`${realTimeStats.typingSpeed.toFixed(1)} CPS`}
                  subtitle="Characters per second"
                  color="green"
                  trend={realTimeStats.typingSpeed > 2 ? 'up' : 'down'}
                />
                <MetricCard
                  title="STRESS LEVEL"
                  value={`${(realTimeStats.stressLevel * 100).toFixed(0)}%`}
                  subtitle="Behavioral tension"
                  color="red"
                  trend={realTimeStats.stressLevel > 0.5 ? 'up' : 'down'}
                />
                <MetricCard
                  title="FOCUS STABILITY"
                  value={`${(realTimeStats.focusStability * 100).toFixed(0)}%`}
                  subtitle="Attention consistency"
                  color="blue"
                  trend={realTimeStats.focusStability > 0.7 ? 'up' : 'down'}
                />
                <MetricCard
                  title="HESITATION EVENTS"
                  value={realTimeStats.pauseCount.toString()}
                  subtitle="Pause frequency"
                  color="yellow"
                  trend={realTimeStats.pauseCount > 10 ? 'up' : 'down'}
                />
              </div>

              {/* Gráfico de actividad en tiempo real */}
              <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-4">
                <h3 className="text-green-400 font-mono mb-4">[REAL-TIME ACTIVITY]</h3>
                <div className="h-32 flex items-end justify-between">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-green-400/30 rounded-t"
                      style={{
                        height: `${Math.random() * 100}%`,
                        width: '4%'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Eventos recientes */}
              <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-4">
                <h3 className="text-green-400 font-mono mb-4">[RECENT EVENTS]</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-xs">
                  <div className="text-gray-300">{new Date().toLocaleTimeString()} - Keystroke detected (velocity: {realTimeStats.typingSpeed.toFixed(1)} cps)</div>
                  <div className="text-gray-300">{new Date().toLocaleTimeString()} - Focus change detected</div>
                  <div className="text-gray-300">{new Date().toLocaleTimeString()} - Deletion pattern analyzed</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'patterns' && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Patrones de comportamiento */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 border border-purple-400/20 rounded-lg p-4">
                  <h3 className="text-purple-400 font-mono mb-4">[EMOTIONAL PATTERNS]</h3>
                  <div className="space-y-3">
                    <PatternBar
                      label="Confidence Level"
                      value={advancedMetrics.emotionalIndicators.confidenceScore}
                      color="green"
                    />
                    <PatternBar
                      label="Stress Level"
                      value={advancedMetrics.emotionalIndicators.stressLevel}
                      color="red"
                    />
                    <PatternBar
                      label="Cognitive Load"
                      value={advancedMetrics.emotionalIndicators.cognitiveLoad}
                      color="yellow"
                    />
                    <PatternBar
                      label="Emotional Volatility"
                      value={advancedMetrics.emotionalIndicators.emotionalVolatility}
                      color="blue"
                    />
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-cyan-400/20 rounded-lg p-4">
                  <h3 className="text-cyan-400 font-mono mb-4">[BEHAVIORAL SIGNATURE]</h3>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="text-gray-300">
                      RHYTHM: {advancedMetrics.behavioralSignatures.uniqueTypingRhythm}
                    </div>
                    <div className="text-gray-300">
                      FINGERPRINT: {advancedMetrics.behavioralSignatures.interactionFingerprint}
                    </div>
                    <div className="text-gray-300">
                      BASELINE: {(advancedMetrics.behavioralSignatures.emotionalBaseline * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-300">
                      ADAPTATION: {(advancedMetrics.behavioralSignatures.adaptationRate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap de actividad */}
              <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-4">
                <h3 className="text-green-400 font-mono mb-4">[ACTIVITY HEATMAP]</h3>
                <div className="grid grid-cols-24 gap-1">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div
                      key={hour}
                      className={`h-8 rounded ${
                        Math.random() > 0.5 ? 'bg-green-400/30' : 'bg-gray-700/30'
                      } flex items-center justify-center text-xs`}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Análisis psicológico */}
              <div className="bg-gray-900/50 border border-red-400/20 rounded-lg p-4">
                <h3 className="text-red-400 font-mono mb-4">[PSYCHOLOGICAL ANALYSIS]</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-mono mb-2">DETECTED PATTERNS:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• High contemplation behavior detected</li>
                      <li>• Self-editing tendency: 67% above baseline</li>
                      <li>• Emotional urgency in final responses</li>
                      <li>• Compulsive revisiting patterns</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-mono mb-2">RECOMMENDATIONS:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Consider pacing your excavation</li>
                      <li>• You are approaching significant patterns</li>
                      <li>• Emotional processing detected</li>
                      <li>• Deep psychological engagement</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Predicciones del algoritmo */}
              <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg p-4">
                <h3 className="text-yellow-400 font-mono mb-4">[ALGORITHM PREDICTIONS]</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Completion Probability:</span>
                    <span className="text-green-400 font-mono">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Next Emotional Stage:</span>
                    <span className="text-purple-400 font-mono">BARGAINING</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Estimated Time to Breakthrough:</span>
                    <span className="text-cyan-400 font-mono">14:32</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Vulnerability Window:</span>
                    <span className="text-red-400 font-mono">OPEN</span>
                  </div>
                </div>
              </div>

              {/* Datos en bruto */}
              <div className="bg-gray-900/50 border border-gray-400/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-400 font-mono">[RAW DATA STREAM]</h3>
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="text-gray-400 hover:text-white font-mono text-xs"
                  >
                    {showRawData ? '[HIDE]' : '[SHOW]'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showRawData && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="font-mono text-xs text-gray-500 max-h-40 overflow-y-auto"
                    >
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(realTimeStats, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* The paradox explanation */}
              <div className="bg-red-900/20 border border-red-400 rounded-lg p-4">
                <h3 className="text-red-400 font-mono mb-4">[THE ALGORITHM PARADOX]</h3>
                <div className="text-gray-300 text-sm space-y-2">
                  <p>Your content is encrypted. Your behavior is not.</p>
                  <p>The algorithm never reads your words, but knows your patterns better than you do.</p>
                  <p>Your digital exhaust tells a story louder than your content ever could.</p>
                </div>
              </div>

              {/* What the algorithm knows vs doesn't know */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-red-900/20 border border-red-400/20 rounded-lg p-4">
                  <h4 className="text-red-400 font-mono mb-3">[ALGORITHM KNOWS]</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• When you type fastest (emotional peaks)</li>
                    <li>• How long you pause before difficult words</li>
                    <li>• What time you're most vulnerable</li>
                    <li>• How many times you delete and rewrite</li>
                    <li>• Your navigation patterns</li>
                    <li>• Emotional stage progression timing</li>
                  </ul>
                </div>

                <div className="bg-green-900/20 border border-green-400/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-mono mb-3">[CONTENT PRIVACY]</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>✓ Your actual words are encrypted</li>
                    <li>✓ Names and identities are private</li>
                    <li>✓ Message content is end-to-end secured</li>
                    <li>✓ Personal details remain protected</li>
                    <li>✓ Encryption keys never leave your device</li>
                    <li>✓ Zero server-side content access</li>
                  </ul>
                </div>
              </div>

              {/* Privacy controls */}
              <div className="bg-gray-900/50 border border-purple-400/20 rounded-lg p-4">
                <h3 className="text-purple-400 font-mono mb-4">[PRIVACY CONTROLS]</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Behavioral Tracking:</span>
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`px-3 py-1 rounded font-mono text-xs ${
                        isRecording 
                          ? 'bg-red-600/30 text-red-400' 
                          : 'bg-gray-600/30 text-gray-400'
                      }`}
                    >
                      {isRecording ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Data Retention:</span>
                    <span className="text-cyan-400 font-mono">SESSION ONLY</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Content Encryption:</span>
                    <span className="text-green-400 font-mono">AES-256 ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Analytics Sharing:</span>
                    <span className="text-red-400 font-mono">NEVER</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Componente auxiliar para tarjetas de métricas
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  color, 
  trend 
}: {
  title: string
  value: string
  subtitle: string
  color: 'green' | 'red' | 'blue' | 'yellow'
  trend: 'up' | 'down'
}) {
  const colorClasses = {
    green: 'border-green-400/20 text-green-400',
    red: 'border-red-400/20 text-red-400',
    blue: 'border-blue-400/20 text-blue-400',
    yellow: 'border-yellow-400/20 text-yellow-400'
  }

  return (
    <div className={`bg-gray-900/50 border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-mono text-xs">{title}</h4>
        <span className={`text-xs ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? '↗' : '↘'}
        </span>
      </div>
      <div className="text-2xl font-bold font-mono mb-1">{value}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  )
}

// Componente auxiliar para barras de patrones
function PatternBar({ 
  label, 
  value, 
  color 
}: {
  label: string
  value: number
  color: 'green' | 'red' | 'blue' | 'yellow'
}) {
  const colorClasses = {
    green: 'bg-green-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    yellow: 'bg-yellow-400'
  }

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  )
} 