export type EmotionStage = 'denial' | 'anger' | 'bargaining' | 'depression' | 'acceptance'

export interface EmotionStageConfig {
  id: EmotionStage
  name: string
  poeticName: string
  description: string
  color: string
  gradient: string
  range: [number, number]
  keywords: string[]
  fragments: string[]
  threshold: number
}

export const emotionStages: EmotionStageConfig[] = [
  {
    id: 'denial',
    name: 'Denial',
    poeticName: 'The Fog',
    description: 'Nothing feels real. Time is slowed. You move through memories like smoke.',
    color: '#64b5f6',
    gradient: 'from-blue-400 to-cyan-400',
    range: [0, 20],
    keywords: [
      'not real', 'impossible', 'mistake', 'dream', 'wake up', 'temporary',
      'coming back', 'not happening', 'can\'t be true', 'must be wrong',
      'doesn\'t feel real', 'like a dream', 'surreal', 'disconnected'
    ],
    fragments: [
      'Reality is just a suggestion whispered in the dark.',
      'Some truths are too heavy for the mind to hold at once.',
      'The fog protects what the heart cannot yet bear to see.',
      'Time moves differently in the space between what was and what is.',
      'Even the impossible becomes possible when you refuse to believe.'
    ],
    threshold: 20
  },
  {
    id: 'anger',
    name: 'Anger',
    poeticName: 'The Flame',
    description: 'There\'s heat behind the silence. Words burn behind your teeth. Rage is a form of love, twisted.',
    color: '#ff6b6b',
    gradient: 'from-red-400 to-orange-400',
    range: [21, 40],
    keywords: [
      'angry', 'furious', 'rage', 'hate', 'betrayed', 'unfair', 'wrong',
      'lied', 'hurt', 'pain', 'destroyed', 'ruined', 'never forgive',
      'how dare', 'selfish', 'cruel', 'bastard', 'bitch', 'asshole'
    ],
    fragments: [
      'The fire in your chest is love looking for somewhere to go.',
      'Anger is just pain wearing a mask of strength.',
      'Some flames burn everything down. Others light the way forward.',
      'The heat you feel is the ghost of what you once cherished.',
      'Rage is the heart\'s way of protecting what it cannot bear to lose.'
    ],
    threshold: 40
  },
  {
    id: 'bargaining',
    name: 'Bargaining',
    poeticName: 'The Loop',
    description: 'What if? What if I had said it? What if they stayed? Your mind loops, desperate for a door.',
    color: '#ffd54f',
    gradient: 'from-yellow-400 to-amber-400',
    range: [41, 60],
    keywords: [
      'what if', 'if only', 'maybe', 'could have', 'should have', 'would have',
      'different', 'change', 'undo', 'go back', 'try again', 'one more chance',
      'please', 'negotiate', 'compromise', 'trade', 'anything'
    ],
    fragments: [
      'The past is a door that only opens from the other side.',
      'Your mind builds bridges to places that no longer exist.',
      'What if is the cruelest question the heart can ask.',
      'Time is not a river you can swim upstream.',
      'The loop is a cage built from the blueprints of regret.'
    ],
    threshold: 60
  },
  {
    id: 'depression',
    name: 'Depression',
    poeticName: 'The Hollow',
    description: 'Everything echoes. The world shrinks. You sit inside yourself and hear nothing back.',
    color: '#78909c',
    gradient: 'from-gray-400 to-slate-400',
    range: [61, 80],
    keywords: [
      'empty', 'hollow', 'numb', 'nothing', 'pointless', 'alone', 'isolated',
      'dark', 'heavy', 'tired', 'exhausted', 'give up', 'hopeless',
      'meaningless', 'void', 'silence', 'echo', 'distant'
    ],
    fragments: [
      'The hollow is not emptiness. It is the space where healing begins.',
      'Even the deepest well eventually finds water.',
      'Silence is not the absence of sound. It is the pause between breaths.',
      'The echo you hear is your own voice calling you home.',
      'In the hollow, you learn the difference between alone and lonely.'
    ],
    threshold: 80
  },
  {
    id: 'acceptance',
    name: 'Acceptance',
    poeticName: 'The Shore',
    description: 'After the storm, you arrive somewhere new. You still carry it, but it carries you too.',
    color: '#81c784',
    gradient: 'from-green-400 to-emerald-400',
    range: [81, 100],
    keywords: [
      'accept', 'peace', 'understand', 'forgive', 'let go', 'release',
      'grateful', 'learned', 'grown', 'stronger', 'okay', 'ready',
      'closure', 'complete', 'whole', 'free', 'light', 'shore'
    ],
    fragments: [
      'The shore is not the end of the storm. It is the beginning of calm.',
      'You carry the ocean with you, but you are no longer drowning.',
      'Forgiveness is not forgetting. It is choosing to remember differently.',
      'The lighthouse was always there. You just had to learn to see it.',
      'Some journeys end not with arrival, but with the courage to rest.'
    ],
    threshold: 100
  }
]

export const getStageByScore = (score: number): EmotionStageConfig => {
  return emotionStages.find(stage => 
    score >= stage.range[0] && score <= stage.range[1]
  ) || emotionStages[0]
}

export const getStageColor = (stage: EmotionStage): string => {
  const stageConfig = emotionStages.find(s => s.id === stage)
  return stageConfig?.color || '#64b5f6'
}

export const getStageGradient = (stage: EmotionStage): string => {
  const stageConfig = emotionStages.find(s => s.id === stage)
  return stageConfig?.gradient || 'from-blue-400 to-cyan-400'
}

export const getNextStage = (currentStage: EmotionStage): EmotionStage | null => {
  const currentIndex = emotionStages.findIndex(stage => stage.id === currentStage)
  return currentIndex < emotionStages.length - 1 ? emotionStages[currentIndex + 1].id : null
}

export const getStageProgress = (score: number, stage: EmotionStage): number => {
  const stageConfig = emotionStages.find(s => s.id === stage)
  if (!stageConfig) return 0
  
  const [min, max] = stageConfig.range
  return Math.min(100, Math.max(0, ((score - min) / (max - min)) * 100))
}

// Additional functions that were being imported
export const getStageColors = getStageColor // Alias for backward compatibility

export const getRandomFragment = (stage?: EmotionStage): string => {
  if (stage) {
    const stageConfig = emotionStages.find(s => s.id === stage)
    if (stageConfig && stageConfig.fragments.length > 0) {
      return stageConfig.fragments[Math.floor(Math.random() * stageConfig.fragments.length)]
    }
  }
  
  // Return random fragment from all stages
  const allFragments = emotionStages.flatMap(s => s.fragments)
  return allFragments[Math.floor(Math.random() * allFragments.length)]
} 