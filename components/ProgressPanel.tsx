'use client'

import { motion } from 'framer-motion'
import { PlayerData } from '@/models/Player'

interface ProgressPanelProps {
  player: PlayerData
  onMentorClick: (mentorName: string) => void
  onMissionStart: (missionType: string) => void
}

export function ProgressPanel({ player, onMentorClick, onMissionStart }: ProgressPanelProps) {
  const progressPercentage = (player.points / 1000) * 100 // Assuming 1000 points for full progress

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-80 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700 p-6 h-full overflow-y-auto"
    >
      {/* Player Info */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 tracking-wider" style={{
          textShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
        }}>
          MISSION STATUS
        </h2>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30"
          style={{
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.05)'
          }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.1)'
              }}
            >
              {player.name.charAt(0)}
              <div className="absolute inset-0 rounded-full border-2 border-white/20" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">{player.name}</div>
              <div className="text-blue-400 text-sm font-medium tracking-wide">ASTRONAUT TRAINEE</div>
            </div>
          </div>

          {/* Points */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm font-medium tracking-wide">MISSION POINTS</span>
              <span className="text-blue-400 font-bold text-lg" style={{
                textShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
              }}>
                {player.points}/1000
              </span>
            </div>
            <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border border-blue-500/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 relative"
                style={{
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
              </motion.div>
            </div>
          </div>

          {/* Current Path */}
          <div>
            <div className="text-gray-300 text-sm mb-2 font-medium tracking-wide">CURRENT PATH</div>
            <div className="bg-gray-700/50 rounded-lg px-3 py-3 border border-purple-500/30"
              style={{
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)'
              }}
            >
              <div className="text-white font-bold mb-1">{player.currentPath}</div>
              <div className="text-purple-400 text-sm font-medium">Mentor: {player.mentor}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4 tracking-wider" style={{
          textShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
        }}>
          TRAINING PROGRESS
        </h3>
        <div className="space-y-3">
          {Object.entries(player.progress).map(([path, progress]) => {
            const maxProgress = 3
            const percentage = (progress / maxProgress) * 100
            
            // Colores específicos para cada camino
            const pathColors: { [key: string]: string } = {
              'Science & Research': '#3b82f6',
              'Engineering & Systems': '#8b5cf6',
              'Medicine & Human Factors': '#10b981',
              'Communications & Exploration': '#f59e0b',
              'Astronomy & Navigation': '#ef4444',
              'Technology & Innovation': '#6366f1'
            }
            const color = pathColors[path] || '#3b82f6'

            return (
              <div 
                key={path} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  borderColor: `${color}40`,
                  boxShadow: progress > 0 ? `0 0 15px ${color}30` : 'none'
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-200 text-xs font-medium">{path}</span>
                  <span 
                    className="text-sm font-bold"
                    style={{
                      color: color,
                      textShadow: `0 0 10px ${color}80`
                    }}
                  >
                    {progress}/{maxProgress}
                  </span>
                </div>
                <div className="relative w-full bg-gray-700/50 rounded-full h-2 overflow-hidden border"
                  style={{
                    borderColor: `${color}30`
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full relative"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4 tracking-wider" style={{
          textShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
        }}>
          QUICK ACTIONS
        </h3>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMentorClick(player.mentor)}
            className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden border-2 border-blue-400/50"
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" 
              style={{
                boxShadow: '0 0 8px rgba(74, 222, 128, 0.8)'
              }}
            />
            <span className="relative z-10 tracking-wide">TALK TO MENTOR</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMissionStart('general')}
            className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 overflow-hidden border-2 border-purple-400/50"
            style={{
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="relative z-10 tracking-wide">START NEW MISSION</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMissionStart('simulation')}
            className="relative w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 overflow-hidden border-2 border-green-400/50"
            style={{
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="relative z-10 tracking-wide">SIMULATION TRAINING</span>
          </motion.button>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4 tracking-wider" style={{
          textShadow: '0 0 10px rgba(234, 179, 8, 0.5)'
        }}>
          RECENT ACHIEVEMENTS
        </h3>
        <div className="space-y-2">
          {player.completedMissions.length > 0 ? (
            player.completedMissions.slice(-3).map((mission, index) => (
              <motion.div
                key={mission}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3 border border-yellow-500/30"
                style={{
                  boxShadow: '0 0 15px rgba(234, 179, 8, 0.2)'
                }}
              >
                <div className="relative w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  style={{
                    boxShadow: '0 0 15px rgba(234, 179, 8, 0.6)'
                  }}
                >
                  <span className="text-xl">🏆</span>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-bold">Mission Complete</div>
                  <div className="text-yellow-400 text-xs font-medium">{mission}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-600/30">
              <div className="text-gray-400 text-sm font-medium mb-1">No missions completed yet</div>
              <div className="text-gray-500 text-xs">Complete your first mission to earn achievements!</div>
            </div>
          )}
        </div>
      </div>

      {/* Astronaut Mode Status */}
      {player.astronautMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0
          }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-5 border-2 border-purple-400/50 overflow-hidden"
          style={{
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), inset 0 0 30px rgba(139, 92, 246, 0.1)'
          }}
        >
          {/* Efecto de brillo animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <motion.span 
                className="text-3xl"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                🚀
              </motion.span>
              <span className="text-purple-200 font-bold text-lg tracking-wider">ASTRONAUT MODE</span>
            </div>
            <div className="text-purple-300 text-sm font-medium">
              Advanced training protocols activated
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                style={{
                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.8)'
                }}
              />
              <span className="text-green-400 text-xs font-bold">ACTIVE</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
