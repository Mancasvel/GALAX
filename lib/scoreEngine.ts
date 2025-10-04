import { EmotionStage, emotionStages, getStageByScore } from './emotionStages'

export interface EmotionAnalysis {
  score: number
  stage: EmotionStage
  keywords: string[]
  intensity: number
  progressToNext: number
}

export interface ScoreFactors {
  keywordMatches: number
  sentimentIntensity: number
  messageLength: number
  emotionalWords: number
  timeSpent: number
}

/**
 * Analiza un mensaje y calcula su puntuación emocional
 */
export function analyzeMessage(message: string, timeSpent: number = 0): EmotionAnalysis {
  const text = message.toLowerCase()
  const words = text.split(/\s+/)
  
  // Factores de puntuación
  const factors: ScoreFactors = {
    keywordMatches: calculateKeywordMatches(text),
    sentimentIntensity: calculateSentimentIntensity(text),
    messageLength: calculateLengthScore(words.length),
    emotionalWords: calculateEmotionalWords(words),
    timeSpent: calculateTimeSpentScore(timeSpent)
  }
  
  // Calcular puntuación total
  const score = calculateTotalScore(factors)
  const stageConfig = getStageByScore(score)
  const stage = stageConfig.id
  const keywords = findMatchingKeywords(text, stage)
  const intensity = calculateIntensity(factors)
  const progressToNext = calculateProgressToNext(score, stage)
  
  return {
    score,
    stage,
    keywords,
    intensity,
    progressToNext
  }
}

/**
 * Busca coincidencias con palabras clave de las etapas emocionales
 */
function calculateKeywordMatches(text: string): number {
  let matches = 0
  
  for (const stageConfig of emotionStages) {
    for (const keyword of stageConfig.keywords) {
      if (text.includes(keyword)) {
        matches += 1
      }
    }
  }
  
  return Math.min(matches * 2, 20) // Máximo 20 puntos
}

/**
 * Calcula la intensidad emocional basada en patrones
 */
function calculateSentimentIntensity(text: string): number {
  const intensityPatterns = [
    { pattern: /!{2,}/g, points: 3 }, // Múltiples signos de exclamación
    { pattern: /\?{2,}/g, points: 2 }, // Múltiples signos de interrogación
    { pattern: /[A-Z]{3,}/g, points: 4 }, // Palabras en mayúsculas
    { pattern: /\.\.\./g, points: 1 }, // Puntos suspensivos
    { pattern: /(muy|super|extremadamente|completamente)/gi, points: 2 },
    { pattern: /(siempre|nunca|jamás|todo|nada)/gi, points: 1 },
  ]
  
  let intensity = 0
  for (const { pattern, points } of intensityPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      intensity += matches.length * points
    }
  }
  
  return Math.min(intensity, 15) // Máximo 15 puntos
}

/**
 * Calcula puntos por longitud del mensaje
 */
function calculateLengthScore(wordCount: number): number {
  if (wordCount < 10) return 1
  if (wordCount < 50) return 3
  if (wordCount < 100) return 5
  if (wordCount < 200) return 7
  return 10 // Máximo 10 puntos
}

/**
 * Cuenta palabras emocionales específicas
 */
function calculateEmotionalWords(words: string[]): number {
  const emotionalWords = [
    'amor', 'odio', 'dolor', 'feliz', 'triste', 'enojado', 'furioso',
    'perdón', 'culpa', 'miedo', 'esperanza', 'desesperanza', 'vacío',
    'llorar', 'reír', 'corazón', 'alma', 'vida', 'muerte', 'recordar',
    'olvidar', 'extrañar', 'necesitar', 'querer', 'desear', 'soñar'
  ]
  
  let count = 0
  for (const word of words) {
    if (emotionalWords.includes(word)) {
      count += 1
    }
  }
  
  return Math.min(count * 2, 10) // Máximo 10 puntos
}

/**
 * Calcula puntos por tiempo invertido escribiendo
 */
function calculateTimeSpentScore(timeSpent: number): number {
  if (timeSpent < 30) return 1 // Menos de 30 segundos
  if (timeSpent < 120) return 3 // 30s - 2min
  if (timeSpent < 300) return 5 // 2min - 5min
  if (timeSpent < 600) return 7 // 5min - 10min
  return 10 // Más de 10 minutos
}

/**
 * Calcula la puntuación total basada en todos los factores
 */
function calculateTotalScore(factors: ScoreFactors): number {
  const {
    keywordMatches,
    sentimentIntensity,
    messageLength,
    emotionalWords,
    timeSpent
  } = factors
  
  return Math.min(
    keywordMatches + sentimentIntensity + messageLength + emotionalWords + timeSpent,
    100
  )
}

/**
 * Encuentra las palabras clave que coinciden con la etapa actual
 */
function findMatchingKeywords(text: string, stage: EmotionStage): string[] {
  const stageConfig = emotionStages.find(s => s.id === stage)
  const matches: string[] = []
  
  if (stageConfig) {
    for (const keyword of stageConfig.keywords) {
      if (text.includes(keyword)) {
        matches.push(keyword)
      }
    }
  }
  
  return matches
}

/**
 * Calcula la intensidad emocional del mensaje
 */
function calculateIntensity(factors: ScoreFactors): number {
  const totalFactors = Object.values(factors).reduce((sum, value) => sum + value, 0)
  return Math.min(totalFactors / 65 * 100, 100) // Normalizar a 0-100
}

/**
 * Calcula el progreso hacia la siguiente etapa
 */
function calculateProgressToNext(score: number, currentStage: EmotionStage): number {
  const stageConfig = emotionStages.find(s => s.id === currentStage)
  if (!stageConfig) return 0
  
  const [minScore, maxScore] = stageConfig.range
  const rangeSize = maxScore - minScore
  const progressInStage = score - minScore
  
  return Math.min((progressInStage / rangeSize) * 100, 100)
}

/**
 * Actualiza la puntuación acumulada de una conversación
 */
export function updateConversationScore(
  currentScore: number,
  newMessageScore: number,
  messageCount: number
): number {
  // Promedio ponderado que da más peso a mensajes recientes
  const weight = Math.min(messageCount * 0.1, 1) // Máximo peso de 1.0
  const updatedScore = (currentScore * (1 - weight)) + (newMessageScore * weight)
  
  return Math.min(Math.round(updatedScore), 100)
}

/**
 * Determina si una conversación está lista para el cierre
 */
export function isReadyForClosure(score: number, messageCount: number): boolean {
  return score >= 90 && messageCount >= 5 // Mínimo 5 mensajes y score alto
} 