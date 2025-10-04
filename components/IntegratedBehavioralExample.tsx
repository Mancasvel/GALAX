'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBehavioralTracking, behavioralTracker } from '@/lib/behavioralAnalytics'
import BehavioralDashboard from '@/components/BehavioralDashboard'
import { BehavioralTracker } from '@/components/BehavioralTracker'

export default function IntegratedBehavioralExample() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [showDashboard, setShowDashboard] = useState(false)
  const [showTracker, setShowTracker] = useState(false)
  
  const { getRealTimeStats, getAdvancedMetrics } = useBehavioralTracking()
  const [realTimeStats, setRealTimeStats] = useState(getRealTimeStats())
  
  // Actualizar estadísticas en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(getRealTimeStats())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [getRealTimeStats])

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // El BehavioralTracker detecta automáticamente estos eventos
    // No necesitamos hacer nada adicional aquí
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, message])
      setMessage('')
      
      // Esto se trackea automáticamente por el BehavioralTracker
      console.log('Message sent - behavioral data captured')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-400 font-mono mb-2">
            [BEHAVIORAL TRACKING DEMO]
          </h1>
          <p className="text-gray-400">
            Type something and observe how the algorithm analyzes your behavior in real-time
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-black/50 border border-green-400/30 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowDashboard(true)}
              className="px-4 py-2 bg-green-600/30 text-green-400 border border-green-400/50 rounded hover:bg-green-600/50 transition-colors font-mono text-sm"
            >
              [OPEN DASHBOARD]
            </button>
            <button
              onClick={() => setShowTracker(!showTracker)}
              className="px-4 py-2 bg-purple-600/30 text-purple-400 border border-purple-400/50 rounded hover:bg-purple-600/50 transition-colors font-mono text-sm"
            >
              {showTracker ? '[HIDE TRACKER]' : '[SHOW TRACKER]'}
            </button>
          </div>
        </div>

        {/* Real-time Stats Bar */}
        <div className="bg-gray-900/50 border border-cyan-400/20 rounded-lg p-4 mb-6">
          <h3 className="text-cyan-400 font-mono mb-3">[REAL-TIME BEHAVIORAL METRICS]</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 font-mono">
                {realTimeStats.typingSpeed.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">CPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 font-mono">
                {(realTimeStats.stressLevel * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">STRESS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 font-mono">
                {realTimeStats.pauseCount}
              </div>
              <div className="text-xs text-gray-400">PAUSES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 font-mono">
                {realTimeStats.deleteCount}
              </div>
              <div className="text-xs text-gray-400">DELETES</div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-black/50 border border-green-400/30 rounded-lg p-6 mb-6">
          <h3 className="text-green-400 font-mono mb-4">[MONITORED CHAT INTERFACE]</h3>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-black/60 rounded-lg p-4 mb-4 max-h-48">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                Write your first message to start behavioral analysis...
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="mb-3 p-3 bg-gray-800/50 rounded border-l-2 border-purple-500">
                  <div className="text-sm text-gray-400 mb-1">
                    [YOU - {new Date().toLocaleTimeString()}]
                  </div>
                  <div className="text-white">{msg}</div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2 items-end">
            <textarea
              value={message}
              onChange={handleMessageChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Type your message here... (The algorithm is watching)"
              className="flex-1 bg-black/60 border border-purple-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-mono"
            >
              SEND
            </button>
          </div>
        </div>

        {/* Algorithm Activity */}
        <div className="mt-4 p-3 bg-black/40 rounded-lg border border-green-400/30">
          <div className="text-green-400 font-mono text-sm mb-2">[ALGORITHM ACTIVITY]</div>
          <div className="text-xs text-gray-400">
            <div>Session Duration: <span className="text-cyan-400 font-mono">{realTimeStats.sessionDuration}s</span></div>
            <div className="mt-1">
              <span className="text-gray-300">Events Captured:</span> <span className="text-cyan-400 font-mono">{realTimeStats.eventCount}</span>
            </div>
            <div className="mt-1">
              <span className="text-gray-300">Behavioral Confidence:</span> <span className="text-cyan-400 font-mono">
                {realTimeStats.eventCount > 10 ? 'HIGH' : 'BUILDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="text-yellow-300 font-mono text-sm mb-2">[PRIVACY PARADOX]</div>
          <div className="text-xs text-gray-400">
            The algorithm analyzes your typing patterns, pause frequency, deletion rate, and interaction rhythm. Your content remains encrypted, but your behavior becomes data.
          </div>
        </div>
      </div>

      {/* BehavioralTracker Component */}
      <BehavioralTracker
        realTimeStats={{
          typingSpeed: realTimeStats.typingSpeed.toFixed(2),
          pauseCount: realTimeStats.pauseCount,
          deleteCount: realTimeStats.deleteCount,
          sessionDuration: realTimeStats.sessionDuration,
          eventCount: realTimeStats.eventCount
        }}
        behavioralProfile={{
          psychologicalProfile: "active_explorer",
          emotionalState: "engaged",
          behavioralPatterns: ["real_time_interaction", "pattern_awareness"],
          recommendations: ["Continue exploring", "Algorithm learning active"]
        }}
        isVisible={showTracker}
      />

      {/* Dashboard */}
      <BehavioralDashboard
        isVisible={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </div>
  )
} 