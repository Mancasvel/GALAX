'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SpaceBoard } from '@/components/SpaceBoard'
import { ProgressPanel } from '@/components/ProgressPanel'
import { MentorModal } from '@/components/MentorModal'
import { MissionModal } from '@/components/MissionModal'
import { Player } from '@/models/Player'

export default function BoardPage() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [showMissionModal, setShowMissionModal] = useState(false)
  const [currentMission, setCurrentMission] = useState<string | null>(null)

  // Initialize player or load existing progress
  useEffect(() => {
    // For demo purposes, create a default player
    // In production, this would load from database
    const defaultPlayer: Player = {
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
      currentMission: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setPlayer(defaultPlayer)
  }, [])

  const handlePathSelect = (pathName: string) => {
    setSelectedPath(pathName)
    // Here you would typically load path-specific content
    // For now, we'll just show the mentor modal
    setShowMentorModal(true)
  }

  const handleMentorInteraction = (mentorName: string) => {
    setSelectedMentor(mentorName)
    setShowMentorModal(true)
  }

  const handleMissionStart = (missionType: string) => {
    setCurrentMission(missionType)
    setShowMissionModal(true)
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
          className="absolute top-0 left-0 right-0 z-20 p-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              NASA Space Dome
            </h1>
            <div className="text-sm text-gray-300">
              Welcome, {player.name}
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
          onClose={() => setShowMentorModal(false)}
          mentorName={selectedMentor}
          currentPath={selectedPath}
        />

        <MissionModal
          isOpen={showMissionModal}
          onClose={() => setShowMissionModal(false)}
          missionType={currentMission}
          mentorName={selectedMentor}
        />
      </div>
    </main>
  )
}
