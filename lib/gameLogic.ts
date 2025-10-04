import { PlayerData } from '@/models/Player'

export interface GameState {
  player: PlayerData
  currentPath: string | null
  selectedMentor: string | null
  activeMissions: string[]
  completedPaths: string[]
  totalPoints: number
  astronautModeUnlocked: boolean
}

export interface MissionResult {
  success: boolean
  pointsEarned: number
  missionCompleted: string
  newProgress: Record<string, number>
  unlockedPaths?: string[]
  astronautMode?: boolean
}

export class GameLogic {
  private static readonly PATHS = [
    'Science & Research',
    'Engineering & Systems',
    'Medicine & Human Factors',
    'Communications & Exploration',
    'Astronomy & Navigation',
    'Technology & Innovation'
  ]

  private static readonly MISSIONS: Record<string, Array<{
    id: string
    title: string
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
    points: number
  }>> = {
    'Science & Research': [
      {
        id: 'science-mission-1',
        title: 'Microgravity Plant Growth',
        description: 'Learn about how plants grow differently in space',
        difficulty: 'easy',
        points: 50
      },
      {
        id: 'science-mission-2',
        title: 'Protein Crystal Formation',
        description: 'Study how crystals form in microgravity for medical research',
        difficulty: 'medium',
        points: 75
      },
      {
        id: 'science-mission-3',
        title: 'Fluid Physics Experiments',
        description: 'Investigate how liquids behave without gravity',
        difficulty: 'hard',
        points: 100
      }
    ],
    'Engineering & Systems': [
      {
        id: 'engineering-mission-1',
        title: 'Spacecraft Thermal Control',
        description: 'Learn how to manage temperature extremes in space',
        difficulty: 'medium',
        points: 60
      },
      {
        id: 'engineering-mission-2',
        title: 'Life Support Systems',
        description: 'Design systems to keep astronauts alive in space',
        difficulty: 'hard',
        points: 90
      }
    ],
    'Medicine & Human Factors': [
      {
        id: 'medicine-mission-1',
        title: 'Bone Density Studies',
        description: 'Understand how microgravity affects human bones',
        difficulty: 'easy',
        points: 55
      },
      {
        id: 'medicine-mission-2',
        title: 'Cardiovascular Adaptation',
        description: 'Study how the heart adapts to space conditions',
        difficulty: 'medium',
        points: 70
      },
      {
        id: 'medicine-mission-3',
        title: 'Psychological Well-being',
        description: 'Learn about mental health in isolation',
        difficulty: 'hard',
        points: 85
      }
    ],
    'Communications & Exploration': [
      {
        id: 'communications-mission-1',
        title: 'Deep Space Communication',
        description: 'Master communication across vast distances',
        difficulty: 'easy',
        points: 45
      },
      {
        id: 'communications-mission-2',
        title: 'Mission Control Coordination',
        description: 'Coordinate with ground control during critical operations',
        difficulty: 'medium',
        points: 65
      }
    ],
    'Astronomy & Navigation': [
      {
        id: 'astronomy-mission-1',
        title: 'Celestial Navigation',
        description: 'Learn to navigate using stars and celestial bodies',
        difficulty: 'medium',
        points: 65
      }
    ],
    'Technology & Innovation': [
      {
        id: 'technology-mission-1',
        title: 'Space Robotics',
        description: 'Develop robots for space exploration and maintenance',
        difficulty: 'hard',
        points: 95
      }
    ]
  }

  private static readonly MISSIONS_PER_PATH = 3
  private static readonly POINTS_PER_MISSION = {
    easy: 40,
    medium: 60,
    hard: 80
  }

  private static readonly ASTRONAUT_MODE_THRESHOLD = 800 // Total points needed
  private static readonly EXPERT_THRESHOLD = 500
  private static readonly INTERMEDIATE_THRESHOLD = 250

  static calculateProgressPercentage(progress: Record<string, number>): number {
    const totalMissions = this.PATHS.length * this.MISSIONS_PER_PATH
    const completedMissions = Object.values(progress).reduce((sum, count) => sum + count, 0)
    return Math.round((completedMissions / totalMissions) * 100)
  }

  static getNextMissionForPath(path: string, currentProgress: number): { id: string; title: string; description: string; difficulty: "easy" | "medium" | "hard"; points: number; } | null {
    if (currentProgress >= this.MISSIONS_PER_PATH) {
      return null // Path completed
    }

    const pathMissions = this.MISSIONS[path] || []
    const mission = pathMissions[currentProgress]

    if (!mission) {
      return null
    }

    return mission
  }

  static completeMission(
    player: PlayerData,
    missionId: string,
    missionDifficulty: 'easy' | 'medium' | 'hard' = 'easy'
  ): MissionResult {
    const pointsEarned = this.POINTS_PER_MISSION[missionDifficulty]

    // Update progress for the current path
    const currentPath = player.currentPath
    const newProgress = { ...player.progress }

    if (currentPath && currentPath !== 'Central Hub') {
      newProgress[currentPath] = Math.min(
        newProgress[currentPath] + 1,
        this.MISSIONS_PER_PATH
      )
    }

    // Check if path is completed
    const pathCompleted = currentPath && currentPath !== 'Central Hub' && newProgress[currentPath as keyof typeof newProgress] >= this.MISSIONS_PER_PATH
    const completedPaths = pathCompleted
      ? [...player.completedMissions, missionId]
      : player.completedMissions

    // Check if all paths are completed (Astronaut Mode)
    const allPathsCompleted = Object.values(newProgress).every(progress => progress >= this.MISSIONS_PER_PATH)
    const astronautMode = allPathsCompleted && player.points + pointsEarned >= this.ASTRONAUT_MODE_THRESHOLD

    // Check if new paths should be unlocked
    const unlockedPaths: string[] = []
    if (currentPath === 'Central Hub' && Object.keys(newProgress).length === 0) {
      unlockedPaths.push(...this.PATHS.slice(0, 2)) // Unlock first two paths
    } else if (pathCompleted && currentPath) {
      const currentPathIndex = this.PATHS.indexOf(currentPath)
      if (currentPathIndex >= 0 && currentPathIndex < this.PATHS.length - 1) {
        unlockedPaths.push(this.PATHS[currentPathIndex + 1])
      }
    }

    return {
      success: true,
      pointsEarned,
      missionCompleted: missionId,
      newProgress,
      unlockedPaths: unlockedPaths.length > 0 ? unlockedPaths : undefined,
      astronautMode
    }
  }

  static validatePathSelection(player: PlayerData, selectedPath: string): boolean {
    if (selectedPath === 'Central Hub') return true

    // Check if path is unlocked
    const pathIndex = this.PATHS.indexOf(selectedPath)
    if (pathIndex === 0) return true // First path always unlocked

    // Check if previous path is completed
    const previousPath = this.PATHS[pathIndex - 1]
    return player.progress[previousPath as keyof typeof player.progress] >= this.MISSIONS_PER_PATH
  }

  static getUnlockedPaths(player: PlayerData): string[] {
    const unlockedPaths = ['Central Hub']

    // Always unlock first path
    if (!unlockedPaths.includes(this.PATHS[0])) {
      unlockedPaths.push(this.PATHS[0])
    }

    // Unlock subsequent paths based on progress
    for (let i = 1; i < this.PATHS.length; i++) {
      const previousPath = this.PATHS[i - 1]
      if (player.progress[previousPath as keyof typeof player.progress] >= this.MISSIONS_PER_PATH) {
        unlockedPaths.push(this.PATHS[i])
      }
    }

    return unlockedPaths
  }

  static getMentorForPath(path: string): string {
    const mentors: Record<string, string> = {
      'Central Hub': 'Dr. Ellen Ochoa',
      'Science & Research': 'Dr. Mae Jemison',
      'Engineering & Systems': 'Bob Behnken',
      'Medicine & Human Factors': 'Dr. Serena Auñón-Chancellor',
      'Communications & Exploration': 'Chris Hadfield',
      'Astronomy & Navigation': 'Jessica Watkins',
      'Technology & Innovation': 'Victor Glover'
    }

    return mentors[path] || 'Dr. Ellen Ochoa'
  }

  static getPathDescription(path: string): string {
    const descriptions: Record<string, string> = {
      'Central Hub': 'Start your journey at Mission Control and choose your specialization path',
      'Science & Research': 'Conduct experiments in microgravity and advance scientific knowledge',
      'Engineering & Systems': 'Design and maintain spacecraft systems for deep space missions',
      'Medicine & Human Factors': 'Study human health and psychology in extreme environments',
      'Communications & Exploration': 'Master communication systems for exploring distant worlds',
      'Astronomy & Navigation': 'Navigate using celestial bodies and study the cosmos',
      'Technology & Innovation': 'Develop cutting-edge technologies for space exploration'
    }

    return descriptions[path] || 'Explore the mysteries of space'
  }

  static getPathColor(path: string): string {
    const colors: Record<string, string> = {
      'Central Hub': '#3b82f6',
      'Science & Research': '#3b82f6',
      'Engineering & Systems': '#8b5cf6',
      'Medicine & Human Factors': '#10b981',
      'Communications & Exploration': '#f59e0b',
      'Astronomy & Navigation': '#ef4444',
      'Technology & Innovation': '#6366f1'
    }

    return colors[path] || '#3b82f6'
  }

  static getMissionForPathAndProgress(path: string, progress: number): {
    id: string
    title: string
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
    points: number
  } | null {
    if (progress >= this.MISSIONS_PER_PATH) return null

    const pathMissions = this.MISSIONS[path] || []
    return pathMissions[progress] || null
  }

  static getGameStatus(player: PlayerData): {
    progressPercentage: number
    completedPaths: number
    totalPaths: number
    currentLevel: string
    nextMilestone: string
  } {
    const totalPaths = this.PATHS.length
    const completedPaths = Object.values(player.progress).filter(count => count >= this.MISSIONS_PER_PATH).length

    return {
      progressPercentage: this.getProgressPercentage(player.progress),
      completedPaths,
      totalPaths,
      currentLevel: this.getCurrentLevel(player.points),
      nextMilestone: this.getNextMilestone(player.points)
    }
  }

  private static getCurrentLevel(points: number): string {
    if (points >= this.ASTRONAUT_MODE_THRESHOLD) return 'Astronaut'
    if (points >= this.EXPERT_THRESHOLD) return 'Expert'
    if (points >= this.INTERMEDIATE_THRESHOLD) return 'Intermediate'
    return 'Beginner'
  }

  private static getNextMilestone(points: number): string {
    if (points >= this.ASTRONAUT_MODE_THRESHOLD) return 'Maximum level reached!'
    if (points >= this.EXPERT_THRESHOLD) return `Astronaut Mode (${this.ASTRONAUT_MODE_THRESHOLD - points} points needed)`
    if (points >= this.INTERMEDIATE_THRESHOLD) return `Expert Level (${this.EXPERT_THRESHOLD - points} points needed)`
    return `Intermediate Level (${this.INTERMEDIATE_THRESHOLD - points} points needed)`
  }

  private static getProgressPercentage(progress: Record<string, number>): number {
    const totalMissions = this.PATHS.length * this.MISSIONS_PER_PATH
    const completedMissions = Object.values(progress).reduce((sum, count) => sum + count, 0)
    return Math.round((completedMissions / totalMissions) * 100)
  }
}
