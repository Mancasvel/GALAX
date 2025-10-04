import { Player } from '@/models/Player'

export interface GameState {
  player: Player
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

  private static readonly MISSIONS_PER_PATH = 3
  private static readonly POINTS_PER_MISSION = {
    easy: 40,
    medium: 60,
    hard: 80
  }

  private static readonly ASTRONAUT_MODE_THRESHOLD = 800 // Total points needed

  static calculateProgressPercentage(progress: Record<string, number>): number {
    const totalMissions = this.PATHS.length * this.MISSIONS_PER_PATH
    const completedMissions = Object.values(progress).reduce((sum, count) => sum + count, 0)
    return Math.round((completedMissions / totalMissions) * 100)
  }

  static getNextMissionForPath(path: string, currentProgress: number): string | null {
    if (currentProgress >= this.MISSIONS_PER_PATH) {
      return null // Path completed
    }
    return `${path} Mission ${currentProgress + 1}`
  }

  static completeMission(
    player: Player,
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
    const pathCompleted = currentPath && newProgress[currentPath] >= this.MISSIONS_PER_PATH
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

  static validatePathSelection(player: Player, selectedPath: string): boolean {
    if (selectedPath === 'Central Hub') return true

    // Check if path is unlocked
    const pathIndex = this.PATHS.indexOf(selectedPath)
    if (pathIndex === 0) return true // First path always unlocked

    // Check if previous path is completed
    const previousPath = this.PATHS[pathIndex - 1]
    return player.progress[previousPath] >= this.MISSIONS_PER_PATH
  }

  static getUnlockedPaths(player: Player): string[] {
    const unlockedPaths = ['Central Hub']

    // Always unlock first path
    if (!unlockedPaths.includes(this.PATHS[0])) {
      unlockedPaths.push(this.PATHS[0])
    }

    // Unlock subsequent paths based on progress
    for (let i = 1; i < this.PATHS.length; i++) {
      const previousPath = this.PATHS[i - 1]
      if (player.progress[previousPath] >= this.MISSIONS_PER_PATH) {
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

    const missions: Record<string, Array<{
      title: string
      description: string
      difficulty: 'easy' | 'medium' | 'hard'
      points: number
    }>> = {
      'Science & Research': [
        {
          title: 'Microgravity Plant Growth',
          description: 'Learn about how plants grow differently in space',
          difficulty: 'easy',
          points: 50
        },
        {
          title: 'Protein Crystal Formation',
          description: 'Study how crystals form in microgravity for medical research',
          difficulty: 'medium',
          points: 75
        },
        {
          title: 'Fluid Physics Experiments',
          description: 'Investigate how liquids behave without gravity',
          difficulty: 'hard',
          points: 100
        }
      ],
      'Engineering & Systems': [
        {
          title: 'Spacecraft Thermal Control',
          description: 'Learn how to manage temperature extremes in space',
          difficulty: 'medium',
          points: 60
        },
        {
          title: 'Life Support Systems',
          description: 'Design systems to keep astronauts alive in space',
          difficulty: 'hard',
          points: 90
        }
      ],
      'Medicine & Human Factors': [
        {
          title: 'Bone Density Studies',
          description: 'Understand how microgravity affects human bones',
          difficulty: 'medium',
          points: 70
        },
        {
          title: 'Space Psychology',
          description: 'Study mental health in isolated environments',
          difficulty: 'medium',
          points: 80
        }
      ],
      'Communications & Exploration': [
        {
          title: 'Deep Space Communication',
          description: 'Master communication across vast distances',
          difficulty: 'easy',
          points: 45
        }
      ],
      'Astronomy & Navigation': [
        {
          title: 'Celestial Navigation',
          description: 'Learn to navigate using stars and celestial bodies',
          difficulty: 'medium',
          points: 65
        }
      ],
      'Technology & Innovation': [
        {
          title: 'Space Robotics',
          description: 'Develop robots for space exploration and maintenance',
          difficulty: 'hard',
          points: 95
        }
      ]
    }

    const pathMissions = missions[path] || []
    return pathMissions[progress] || null
  }

  static getGameStatus(player: Player): {
    progressPercentage: number
    completedPaths: number
    totalPaths: number
    currentLevel: string
    nextMilestone: string
  } {
    const progressPercentage = this.calculateProgressPercentage(player.progress)
    const completedPaths = Object.values(player.progress).filter(p => p >= this.MISSIONS_PER_PATH).length
    const totalPaths = this.PATHS.length

    let currentLevel = 'Trainee'
    let nextMilestone = ''

    if (progressPercentage >= 100) {
      currentLevel = 'Astronaut'
      nextMilestone = 'Mission accomplished!'
    } else if (progressPercentage >= 75) {
      currentLevel = 'Senior Cadet'
      nextMilestone = 'Complete final missions to become an Astronaut'
    } else if (progressPercentage >= 50) {
      currentLevel = 'Cadet'
      nextMilestone = 'Complete 2 more paths to become Senior Cadet'
    } else if (progressPercentage >= 25) {
      currentLevel = 'Junior Cadet'
      nextMilestone = 'Complete 3 more paths to become Cadet'
    } else {
      nextMilestone = 'Complete your first path to become Junior Cadet'
    }

    return {
      progressPercentage,
      completedPaths,
      totalPaths,
      currentLevel,
      nextMilestone
    }
  }
}

