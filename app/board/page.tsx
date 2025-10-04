'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SpaceBoard } from '@/components/SpaceBoard'
import { ProgressPanel } from '@/components/ProgressPanel'
import { MentorModal } from '@/components/MentorModal'
import { MissionModal } from '@/components/MissionModal'
import { NBLSimulation } from '@/components/NBLSimulation'
import { PlayerData } from '@/models/Player'

// Path to Mentor mapping
const PATH_TO_MENTOR: { [key: string]: string } = {
  'Science & Research': 'Dr. Mae Jemison',
  'Engineering & Systems': 'Bob Behnken',
  'Medicine & Human Factors': 'Dr. Serena Auñón-Chancellor',
  'Communications & Exploration': 'Chris Hadfield',
  'Astronomy & Navigation': 'Jessica Watkins',
  'Technology & Innovation': 'Victor Glover'
}

export default function BoardPage() {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [showMissionModal, setShowMissionModal] = useState(false)
  const [showNBLSimulation, setShowNBLSimulation] = useState(false)
  const [currentMission, setCurrentMission] = useState<string | null>(null)
  
  // Store conversation context for each path/mentor
  const [conversationContexts, setConversationContexts] = useState<{
    [key: string]: Array<{ role: string; content: string }>
  }>({})

  // Initialize player or load existing progress
  useEffect(() => {
    // For demo purposes, create a default player
    // In production, this would load from database
    const defaultPlayer: PlayerData = {
      playerId: 'demo-player',
      name: 'Astronaut Trainee',
      currentPath: 'Central Hub',
      mentor: 'Dr. Ellen Ochoa',
      progress: {
        'Science & Research': 0,
        'Engineering & Systems': 0,
        'Medicine & Human Factors': 0,
        'Communications & Exploration': 0,
        'Astronomy & Navigation': 0,
        'Technology & Innovation': 0
      },
      points: 0,
      astronautMode: false,
      completedMissions: [],
      currentMission: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setPlayer(defaultPlayer)
  }, [])

  const handlePathSelect = (pathName: string) => {
    console.log('Path selected:', pathName)
    setSelectedPath(pathName)
    
    // Get the mentor for this path
    const mentorForPath = PATH_TO_MENTOR[pathName]
    if (mentorForPath) {
      setSelectedMentor(mentorForPath)
      
      // Update player's current path
      if (player) {
        setPlayer({
          ...player,
          currentPath: pathName as any,
          mentor: mentorForPath
        })
      }
      
      // Open mentor modal
      setShowMentorModal(true)
    }
  }

  const handleMentorInteraction = (mentorName: string) => {
    setSelectedMentor(mentorName)
    // Find the path for this mentor
    const pathForMentor = Object.entries(PATH_TO_MENTOR).find(
      ([_, mentor]) => mentor === mentorName
    )?.[0]
    if (pathForMentor) {
      setSelectedPath(pathForMentor)
    }
    setShowMentorModal(true)
  }
  
  // Save conversation context when modal closes
  const handleMentorModalClose = () => {
    setShowMentorModal(false)
  }
  
  // Update conversation context
  const updateConversationContext = (pathName: string, messages: Array<{ role: string; content: string }>) => {
    setConversationContexts(prev => ({
      ...prev,
      [pathName]: messages
    }))
  }

  const handleMissionStart = (missionType: string) => {
    setCurrentMission(missionType)
    
    // Show NBL simulation for simulation training
    if (missionType === 'simulation') {
      setShowNBLSimulation(true)
    } else {
      setShowMissionModal(true)
    }
  }
  
  const handleNBLComplete = (score: number) => {
    console.log('NBL Training completed with score:', score)
    
    // Update player points
    if (player) {
      setPlayer({
        ...player,
        points: player.points + score
      })
    }
    
    setShowNBLSimulation(false)
    
    // Show success message or update progress
    alert(`Training Complete! You earned ${score} points!`)
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-400 text-lg mb-4">Loading Mission Control...</div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="relative">
        {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-black/80 to-transparent"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-1"
                      style={{
                        textShadow: "0 0 20px rgba(6, 182, 212, 0.5)",
                        filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))"
                      }}>
                    GALAX
                  </h1>
                  <p className="text-xs text-cyan-300 tracking-wider">Guided Astronaut Learning And eXploration</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-cyan-400 font-semibold">
                    Trainee: {player.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    🏆 {player.points} Points
                  </div>
                </div>
              </div>
            </motion.div>

        {/* Main Content */}
        <div className="flex h-screen pt-20">
          {/* Progress Panel */}
          <ProgressPanel
            player={player}
            onMentorClick={handleMentorInteraction}
            onMissionStart={handleMissionStart}
          />

          {/* Space Board */}
          <div className="flex-1 relative">
            <SpaceBoard
              player={player}
              onPathSelect={handlePathSelect}
              onMentorClick={handleMentorInteraction}
            />
          </div>
        </div>

        {/* Debug Panel - Remove in production */}
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/test-openrouter')
                const data = await response.json()
                console.log('OpenRouter test result:', data)
                alert(`Status: ${data.status}\nMessage: ${data.message}\n${data.solution ? `Solution: ${data.solution}` : ''}`)
              } catch (error) {
                console.error('Test failed:', error)
                alert('Test failed. Check console for details.')
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-mono"
          >
            Test API Key
          </button>
          <a
            href="/test-mentor"
            target="_blank"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-mono inline-block"
          >
            Test Mentor
          </a>
        </div>

        {/* Modals */}
        <MentorModal
          isOpen={showMentorModal}
          onClose={handleMentorModalClose}
          mentorName={selectedMentor}
          currentPath={selectedPath}
          conversationHistory={selectedPath ? conversationContexts[selectedPath] || [] : []}
          onUpdateContext={updateConversationContext}
        />

        <MissionModal
          isOpen={showMissionModal}
          onClose={() => setShowMissionModal(false)}
          missionType={currentMission}
          mentorName={selectedMentor}
        />

        <NBLSimulation
          isOpen={showNBLSimulation}
          onClose={() => setShowNBLSimulation(false)}
          onComplete={handleNBLComplete}
          difficulty="beginner"
          specialty={selectedPath || undefined}
        />
      </div>
    </main>
  )
}
