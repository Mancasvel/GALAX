'use client'

import { useState } from 'react'
import ConversationInterface from '@/components/ConversationInterface'
import { EmotionStage } from '@/lib/types'

export default function DemoConversationPage() {
  const [currentStage, setCurrentStage] = useState<EmotionStage>('denial')
  const [emotionalScore, setEmotionalScore] = useState(15)
  const [isPremium, setIsPremium] = useState(true)

  const handleSendMessage = (content: string) => {
    console.log('Message sent:', content)
    // Here you would typically:
    // 1. Analyze the emotional content
    // 2. Update the emotional score
    // 3. Potentially change the stage
    // 4. Send to AI if premium
  }

  const stageOptions: { stage: EmotionStage, score: number }[] = [
    { stage: 'denial', score: 15 },
    { stage: 'anger', score: 35 },
    { stage: 'bargaining', score: 55 },
    { stage: 'depression', score: 75 },
    { stage: 'acceptance', score: 95 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      {/* Demo Controls */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">
            Conversation Demo - Augmented Reality Game
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stage Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emotional Stage
              </label>
              <select
                value={currentStage}
                onChange={(e) => {
                  const newStage = e.target.value as EmotionStage
                  setCurrentStage(newStage)
                  const stageData = stageOptions.find(s => s.stage === newStage)
                  if (stageData) setEmotionalScore(stageData.score)
                }}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="denial">The Fog (Denial)</option>
                <option value="anger">The Flame (Anger)</option>
                <option value="bargaining">The Loop (Bargaining)</option>
                <option value="depression">The Hollow (Depression)</option>
                <option value="acceptance">The Shore (Acceptance)</option>
              </select>
            </div>

            {/* Score Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emotional Score: {emotionalScore}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={emotionalScore}
                onChange={(e) => setEmotionalScore(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Premium Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User Type
              </label>
              <button
                onClick={() => setIsPremium(!isPremium)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  isPremium
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {isPremium ? 'Premium User' : 'Free User'}
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong>How it works:</strong> This is an augmented reality game with yourself. 
              Change the emotional stage to see how conversation colors adapt. 
              Premium users get AI responses as the person they're writing to, using person profiles for authentic responses.
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Interface */}
      <div className="h-[calc(100vh-200px)]">
        <ConversationInterface
          conversationId="demo-1"
          personName="Sarah"
          personRelationship="ex-partner"
          currentStage={currentStage}
          emotionalScore={emotionalScore}
          isPremium={isPremium}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
} 