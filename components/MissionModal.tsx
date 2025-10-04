'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MissionModalProps {
  isOpen: boolean
  onClose: () => void
  missionType: string | null
  mentorName: string | null
}

interface Mission {
  id: string
  title: string
  description: string
  type: 'quiz' | 'simulation' | 'exploration' | 'analysis'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  content: {
    question?: string
    options?: string[]
    correctAnswer?: number
    explanation?: string
    facts?: string[]
    tasks?: string[]
  }
}

export function MissionModal({ isOpen, onClose, missionType, mentorName }: MissionModalProps) {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [missionCompleted, setMissionCompleted] = useState(false)

  // Sample missions based on type
  const missions: Record<string, Mission[]> = {
    'Science & Research': [
      {
        id: 'science-1',
        title: 'Microgravity Plant Growth',
        description: 'Learn about how plants grow differently in space',
        type: 'quiz',
        difficulty: 'easy',
        points: 50,
        content: {
          question: 'Why do plants grow differently in microgravity?',
          options: [
            'Lack of gravity affects cell division and growth direction',
            'Plants need soil which isn\'t available in space',
            'Space radiation kills plant cells',
            'Temperature differences affect photosynthesis'
          ],
          correctAnswer: 0,
          explanation: 'In microgravity, plants don\'t know which way is "up," so their roots and stems grow in unexpected directions. This is crucial for long-duration space missions where we need to grow food.'
        }
      },
      {
        id: 'science-2',
        title: 'Crystal Growth Experiment',
        description: 'Understanding protein crystal formation in space',
        type: 'analysis',
        difficulty: 'medium',
        points: 75,
        content: {
          facts: [
            'Crystals grown in space are often larger and more perfect than Earth-grown crystals',
            'This helps scientists understand protein structures for drug development',
            'The International Space Station has dedicated facilities for crystal growth experiments'
          ],
          tasks: [
            'Analyze how microgravity affects crystal formation',
            'Explain why space-grown crystals are better for research',
            'Design an experiment for growing crystals on Mars'
          ]
        }
      }
    ],
    'Engineering & Systems': [
      {
        id: 'engineering-1',
        title: 'Spacecraft Thermal Control',
        description: 'Managing temperature extremes in space',
        type: 'quiz',
        difficulty: 'medium',
        points: 60,
        content: {
          question: 'What is the primary method spacecraft use to control temperature in space?',
          options: [
            'Radiators that emit heat as infrared radiation',
            'Active cooling systems like refrigerators',
            'Insulation blankets to trap heat',
            'Solar panels that convert heat to electricity'
          ],
          correctAnswer: 0,
          explanation: 'Spacecraft use radiators to reject excess heat as infrared radiation. In the vacuum of space, conduction and convection don\'t work, so radiation is the only way to cool down.'
        }
      }
    ],
    'Medicine & Human Factors': [
      {
        id: 'medicine-1',
        title: 'Bone Density in Space',
        description: 'Understanding how microgravity affects human bones',
        type: 'exploration',
        difficulty: 'medium',
        points: 70,
        content: {
          facts: [
            'Astronauts can lose up to 1-2% of bone density per month in space',
            'Exercise countermeasures include treadmills and resistance devices',
            'This research helps patients with osteoporosis on Earth'
          ],
          tasks: [
            'Research current countermeasures for bone loss',
            'Design an exercise program for a Mars mission',
            'Explain how this research benefits Earth medicine'
          ]
        }
      }
    ],
    'general': [
      {
        id: 'general-1',
        title: 'Mission Control Communication',
        description: 'Learning how NASA communicates with spacecraft',
        type: 'simulation',
        difficulty: 'easy',
        points: 40,
        content: {
          facts: [
            'NASA uses the Deep Space Network with antennas around the world',
            'Communication delays can be up to 40 minutes for Mars missions',
            'Multiple communication protocols ensure reliable data transmission'
          ],
          tasks: [
            'Practice sending a message with communication delay',
            'Understand signal strength requirements',
            'Learn about emergency communication procedures'
          ]
        }
      }
    ]
  }

  useEffect(() => {
    if (isOpen && missionType) {
      // Find appropriate mission based on type
      const availableMissions = missions[missionType] || missions['general']
      const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)]
      setCurrentMission(randomMission)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsCompleted(false)
      setMissionCompleted(false)
    }
  }, [isOpen, missionType])

  const handleAnswerSelect = (answerIndex: number) => {
    if (currentMission?.type === 'quiz') {
      setSelectedAnswer(answerIndex)
    }
  }

  const handleSubmitAnswer = () => {
    if (currentMission?.type === 'quiz' && selectedAnswer !== null) {
      setShowResult(true)
      setIsCompleted(true)
    } else if (currentMission?.type !== 'quiz') {
      // For non-quiz missions, mark as completed after reading
      setIsCompleted(true)
      setMissionCompleted(true)
    }
  }

  const handleCompleteMission = () => {
    setMissionCompleted(true)
    // Here you would typically update player progress in the database
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  if (!currentMission) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentMission.title}</h2>
                  <p className="text-purple-200">{currentMission.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold text-lg">{currentMission.points} pts</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${
                    currentMission.difficulty === 'easy' ? 'bg-green-800 text-green-200' :
                    currentMission.difficulty === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                    'bg-red-800 text-red-200'
                  }`}>
                    {currentMission.difficulty}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {!showResult && currentMission.type === 'quiz' && currentMission.content.question && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">{currentMission.content.question}</h3>
                    <div className="space-y-3">
                      {currentMission.content.options?.map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                            selectedAnswer === index
                              ? 'border-blue-400 bg-blue-900/30 text-white'
                              : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Submit Answer
                  </motion.button>
                </div>
              )}

              {showResult && currentMission.type === 'quiz' && currentMission.content.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-lg ${
                    selectedAnswer === currentMission.content.correctAnswer
                      ? 'bg-green-900/30 border border-green-500'
                      : 'bg-red-900/30 border border-red-500'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`text-2xl ${
                      selectedAnswer === currentMission.content.correctAnswer ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedAnswer === currentMission.content.correctAnswer ? '✓' : '✗'}
                    </span>
                    <div>
                      <div className={`font-bold ${
                        selectedAnswer === currentMission.content.correctAnswer ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedAnswer === currentMission.content.correctAnswer ? 'Correct!' : 'Incorrect'}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {currentMission.content.options?.[currentMission.content.correctAnswer || 0]} is the right answer
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-200">{currentMission.content.explanation}</div>
                </motion.div>
              )}

              {(currentMission.type === 'analysis' || currentMission.type === 'exploration') && currentMission.content.facts && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Mission Briefing</h3>
                    <div className="space-y-3">
                      {currentMission.content.facts.map((fact, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <span className="text-blue-400 mt-1">•</span>
                          <div className="text-gray-200">{fact}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentMission.content.tasks && (
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Your Tasks</h3>
                      <div className="space-y-3">
                        {currentMission.content.tasks.map((task, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <span className="text-green-400 mt-1">→</span>
                            <div className="text-gray-200">{task}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentMission.type === 'simulation' && (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-white mb-4">Simulation Training</h3>
                  <div className="text-gray-300 mb-6">
                    This would be an interactive simulation where you practice mission procedures.
                    For this demo, click the button below to complete the training.
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!isCompleted ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitAnswer}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Complete Mission
                </motion.button>
              ) : !missionCompleted ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompleteMission}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Mission Accomplished! (+{currentMission.points} points)
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-2xl font-bold text-green-400 mb-2">Mission Complete!</div>
                  <div className="text-gray-300">Great work, astronaut! Your progress has been saved.</div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

