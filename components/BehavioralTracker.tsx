'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALGORITHM_TRUTH, revealAlgorithmTruth } from '@/lib/encryption'

interface BehavioralTrackerProps {
  realTimeStats?: {
    typingSpeed: string
    pauseCount: number
    deleteCount: number
    sessionDuration: number
    eventCount: number
  }
  behavioralProfile?: {
    psychologicalProfile: string
    emotionalState: string
    behavioralPatterns: string[]
    recommendations: string[]
  }
  isVisible?: boolean
}

export function BehavioralTracker({ 
  realTimeStats, 
  behavioralProfile, 
  isVisible = false 
}: BehavioralTrackerProps) {
  const [showTruth, setShowTruth] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [algorithmActivity, setAlgorithmActivity] = useState<string[]>([])

  // Simulate algorithm "thinking" for ARG effect
  useEffect(() => {
    const activities = [
      "Analyzing typing cadence patterns...",
      "Detecting emotional temperature shifts...",
      "Mapping psychological terrain...",
      "Cross-referencing behavioral signatures...",
      "Identifying subconscious patterns...",
      "Calibrating empathy algorithms...",
      "Processing digital exhaust data...",
      "Updating consciousness profile...",
      "Detecting reality distortions...",
      "Scanning for vulnerability markers..."
    ]

    const interval = setInterval(() => {
      const newActivity = activities[Math.floor(Math.random() * activities.length)]
      setAlgorithmActivity(prev => {
        const updated = [newActivity, ...prev.slice(0, 4)]
        return updated
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-20 w-80 bg-black border border-green-400 font-mono text-xs z-50 max-h-[80vh] overflow-y-auto"
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="border-b border-green-400 pb-2">
          <div className="text-green-400 font-bold">BEHAVIORAL MONITORING</div>
          <div className="text-gray-400">The algorithm is watching...</div>
        </div>

        {/* Real-time statistics */}
        {realTimeStats && (
          <div className="space-y-2">
            <div 
              className="text-cyan-400 cursor-pointer hover:text-cyan-300"
              onClick={() => setExpandedSection(expandedSection === 'stats' ? null : 'stats')}
            >
              [REAL-TIME PATTERNS] {expandedSection === 'stats' ? '▼' : '▶'}
            </div>
            
            <AnimatePresence>
              {expandedSection === 'stats' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-2 text-gray-300 space-y-1"
                >
                  <div>TYPING VELOCITY: {realTimeStats.typingSpeed} CPS</div>
                  <div>HESITATION EVENTS: {realTimeStats.pauseCount}</div>
                  <div>DELETION FREQUENCY: {realTimeStats.deleteCount}</div>
                  <div>SESSION DURATION: {realTimeStats.sessionDuration}s</div>
                  <div>TOTAL INTERACTIONS: {realTimeStats.eventCount}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Psychological profiling */}
        {behavioralProfile && (
          <div className="space-y-2">
            <div 
              className="text-purple-400 cursor-pointer hover:text-purple-300"
              onClick={() => setExpandedSection(expandedSection === 'profile' ? null : 'profile')}
            >
              [PSYCHOLOGICAL PROFILE] {expandedSection === 'profile' ? '▼' : '▶'}
            </div>
            
            <AnimatePresence>
              {expandedSection === 'profile' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-2 text-gray-300 space-y-1"
                >
                  <div>TYPE: {behavioralProfile.psychologicalProfile.toUpperCase()}</div>
                  <div>STATE: {behavioralProfile.emotionalState.toUpperCase()}</div>
                  <div>PATTERNS DETECTED:</div>
                  {behavioralProfile.behavioralPatterns.map((pattern, idx) => (
                    <div key={idx} className="pl-2">• {pattern.replace(/_/g, ' ').toUpperCase()}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Algorithm activity feed */}
        <div className="space-y-2">
          <div className="text-yellow-400">[ALGORITHM ACTIVITY]</div>
          <div className="space-y-1">
            {algorithmActivity.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1 - (idx * 0.2), x: 0 }}
                className={`text-xs ${idx === 0 ? 'text-white' : 'text-gray-500'}`}
              >
                {activity}
              </motion.div>
            ))}
          </div>
        </div>

        {/* What the algorithm knows */}
        <div className="space-y-2">
          <div 
            className="text-red-400 cursor-pointer hover:text-red-300"
            onClick={() => setExpandedSection(expandedSection === 'knows' ? null : 'knows')}
          >
            [SURVEILLANCE SCOPE] {expandedSection === 'knows' ? '▼' : '▶'}
          </div>
          
          <AnimatePresence>
            {expandedSection === 'knows' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-2 text-gray-300 space-y-2"
              >
                <div className="text-green-400">THE ALGORITHM KNOWS:</div>
                {ALGORITHM_TRUTH.whatItKnows.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="text-xs">• {item}</div>
                ))}
                
                <div className="text-red-400 mt-2">CONTENT PRIVACY:</div>
                {ALGORITHM_TRUTH.whatItDoesntKnow.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-xs">✓ {item}</div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reveal the truth button */}
        <div className="pt-2 border-t border-gray-700">
          <button
            onClick={() => setShowTruth(!showTruth)}
            className="w-full text-left text-red-400 hover:text-red-300 transition-colors"
          >
            [REVEAL ALGORITHM TRUTH] {showTruth ? '▼' : '▶'}
          </button>
          
          <AnimatePresence>
            {showTruth && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 p-2 bg-red-900/20 border border-red-800 text-xs"
              >
                <div className="text-red-400 mb-2">[CLASSIFIED REVELATION]</div>
                <div className="text-gray-300 whitespace-pre-line">
                  {ALGORITHM_TRUTH.theParadox}
                </div>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(revealAlgorithmTruth())
                    alert('Full classified document copied to clipboard')
                  }}
                  className="mt-2 text-cyan-400 hover:text-cyan-300 underline"
                >
                  [COPY FULL DOCUMENT]
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Privacy status */}
        <div className="pt-2 border-t border-gray-700 text-center">
          <div className="text-green-400">🔒 CONTENT ENCRYPTED</div>
          <div className="text-red-400">👁️ BEHAVIOR TRACKED</div>
          <div className="text-gray-400 text-xs mt-1">
            Your words are private.<br/>
            Your patterns are data.
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Hook for managing behavioral tracker visibility
export function useBehavioralTracker() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShownWarning, setHasShownWarning] = useState(false)

  const toggleTracker = () => {
    if (!hasShownWarning && !isVisible) {
      const proceed = confirm(
        "WARNING: You are about to view how the algorithm monitors your behavior.\n\nThis will show you the patterns being tracked in real-time.\n\nProceed?"
      )
      if (proceed) {
        setHasShownWarning(true)
        setIsVisible(true)
      }
    } else {
      setIsVisible(!isVisible)
    }
  }

  return { isVisible, toggleTracker }
} 