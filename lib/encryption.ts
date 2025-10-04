import CryptoJS from 'crypto-js'

const APP_SECRET = process.env.ENCRYPTION_SECRET || 'unsent-app-secret-key-2024'

/**
 * Genera una clave de cifrado única para cada usuario
 */
export function generateUserKey(userId: string): string {
  return CryptoJS.PBKDF2(userId, APP_SECRET, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  }).toString()
}

// Content encryption functions moved to new section below to avoid duplication

/**
 * Genera una clave temporal para almacenar localmente
 */
export function generateLocalStorageKey(userId: string): string {
  return `unsent_key_${CryptoJS.MD5(userId).toString()}`
}

/**
 * Almacena la clave del usuario en localStorage
 */
export function storeUserKey(userId: string, userKey: string): void {
  try {
    const keyName = generateLocalStorageKey(userId)
    localStorage.setItem(keyName, userKey)
  } catch (error) {
    console.error('Error al almacenar clave de usuario:', error)
  }
}

/**
 * Recupera la clave del usuario desde localStorage
 */
export function retrieveUserKey(userId: string): string | null {
  try {
    const keyName = generateLocalStorageKey(userId)
    return localStorage.getItem(keyName)
  } catch (error) {
    console.error('Error al recuperar clave de usuario:', error)
    return null
  }
}

/**
 * Elimina la clave del usuario (logout o cambio de dispositivo)
 */
export function removeUserKey(userId: string): void {
  try {
    const keyName = generateLocalStorageKey(userId)
    localStorage.removeItem(keyName)
  } catch (error) {
    console.error('Error al eliminar clave de usuario:', error)
  }
}

/**
 * Verifica si el usuario tiene una clave almacenada
 */
export function hasUserKey(userId: string): boolean {
  try {
    const keyName = generateLocalStorageKey(userId)
    return localStorage.getItem(keyName) !== null
  } catch (error) {
    return false
  }
}

// The algorithm learns from the PATTERNS, not the content
// This is how surveillance actually works - metadata tells the story
export interface DigitalExhaust {
  // Behavioral patterns (not content)
  typingPatterns: {
    averageSpeed: number
    pauseFrequency: number
    deletionRate: number
    sessionDuration: number
  }
  
  // Interaction patterns
  interactionMetrics: {
    timeOfDay: string
    deviceType: string
    sessionFrequency: number
    navigationPatterns: string[]
  }
  
  // Emotional signatures (derived from behavior, not content)
  emotionalSignatures: {
    urgencyLevel: number
    hesitationScore: number
    completionRate: number
    revisionCount: number
  }
  
  // Anonymized aggregate data
  anonymizedPatterns: {
    conversationLength: number
    stageProgression: string[]
    timeToCompletion: number
    interactionDepth: number
  }
}

// Client-side content encryption (truly private) - ARG compliant
export function encryptMessage(content: string, userKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(content, userKey).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt message')
  }
}

export function decryptMessage(encryptedContent: string, userKey: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, userKey)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt message')
  }
}

// Generate session-specific encryption key (never sent to server)
export function generateSessionKey(): string {
  const userAgent = navigator.userAgent
  const timestamp = Date.now()
  const randomBytes = CryptoJS.lib.WordArray.random(32)
  
  // Create deterministic but unique key based on user session
  const keyMaterial = `${userAgent}-${timestamp}-${randomBytes}`
  return CryptoJS.SHA256(keyMaterial).toString()
}

// Extract behavioral patterns WITHOUT accessing content
export function extractBehavioralPatterns(
  interactionEvents: Array<{
    type: string
    timestamp: number
    metadata: any
  }>
): DigitalExhaust {
  
  const typingEvents = interactionEvents.filter(e => e.type === 'typing')
  const pauseEvents = interactionEvents.filter(e => e.type === 'pause')
  const deleteEvents = interactionEvents.filter(e => e.type === 'delete')
  const navigationEvents = interactionEvents.filter(e => e.type === 'navigation')
  
  return {
    typingPatterns: {
      averageSpeed: calculateTypingSpeed(typingEvents),
      pauseFrequency: pauseEvents.length / typingEvents.length,
      deletionRate: deleteEvents.length / typingEvents.length,
      sessionDuration: calculateSessionDuration(interactionEvents)
    },
    
    interactionMetrics: {
      timeOfDay: new Date().getHours().toString(),
      deviceType: detectDeviceType(),
      sessionFrequency: getSessionFrequency(),
      navigationPatterns: navigationEvents.map(e => e.metadata.path)
    },
    
    emotionalSignatures: {
      urgencyLevel: calculateUrgency(typingEvents),
      hesitationScore: calculateHesitation(pauseEvents),
      completionRate: calculateCompletionRate(interactionEvents),
      revisionCount: deleteEvents.length
    },
    
    anonymizedPatterns: {
      conversationLength: getConversationLength(interactionEvents),
      stageProgression: getStageProgression(interactionEvents),
      timeToCompletion: calculateTimeToCompletion(interactionEvents),
      interactionDepth: calculateInteractionDepth(interactionEvents)
    }
  }
}

// The algorithm learns from HOW you interact, not WHAT you write
export function analyzeDigitalExhaust(exhaust: DigitalExhaust): {
  psychologicalProfile: string
  emotionalState: string
  behavioralPatterns: string[]
  recommendations: string[]
} {
  
  const profile = {
    psychologicalProfile: 'analyzing',
    emotionalState: 'processing',
    behavioralPatterns: [] as string[],
    recommendations: [] as string[]
  }
  
  // Analyze typing patterns for emotional state
  if (exhaust.typingPatterns.pauseFrequency > 0.3) {
    profile.behavioralPatterns.push('high_contemplation')
    profile.emotionalState = 'reflective'
  }
  
  if (exhaust.typingPatterns.deletionRate > 0.2) {
    profile.behavioralPatterns.push('self_editing_tendency')
    profile.emotionalState = 'uncertain'
  }
  
  if (exhaust.emotionalSignatures.urgencyLevel > 0.7) {
    profile.behavioralPatterns.push('emotional_urgency')
    profile.emotionalState = 'intense'
  }
  
  // Analyze interaction patterns
  if (exhaust.interactionMetrics.sessionFrequency > 5) {
    profile.behavioralPatterns.push('compulsive_revisiting')
    profile.recommendations.push('Consider pacing your excavation')
  }
  
  if (exhaust.emotionalSignatures.hesitationScore > 0.8) {
    profile.behavioralPatterns.push('psychological_resistance')
    profile.recommendations.push('You are approaching a significant pattern')
  }
  
  // Generate psychological profile
  if (profile.behavioralPatterns.includes('high_contemplation') && 
      profile.behavioralPatterns.includes('self_editing_tendency')) {
    profile.psychologicalProfile = 'deep_processor'
  } else if (profile.behavioralPatterns.includes('emotional_urgency')) {
    profile.psychologicalProfile = 'emotional_reactor'
  } else {
    profile.psychologicalProfile = 'balanced_explorer'
  }
  
  return profile
}

// Helper functions for behavioral analysis
function calculateTypingSpeed(events: any[]): number {
  if (events.length < 2) return 0
  const totalTime = events[events.length - 1].timestamp - events[0].timestamp
  return events.length / (totalTime / 1000) // characters per second
}

function calculateSessionDuration(events: any[]): number {
  if (events.length < 2) return 0
  return events[events.length - 1].timestamp - events[0].timestamp
}

function detectDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('mobile')) return 'mobile'
  if (userAgent.includes('tablet')) return 'tablet'
  return 'desktop'
}

function getSessionFrequency(): number {
  const sessions = localStorage.getItem('unsent_session_count')
  return sessions ? parseInt(sessions) : 0
}

function calculateUrgency(events: any[]): number {
  if (events.length < 2) return 0
  const avgSpeed = calculateTypingSpeed(events)
  return Math.min(avgSpeed / 10, 1) // normalize to 0-1
}

function calculateHesitation(pauseEvents: any[]): number {
  const longPauses = pauseEvents.filter(e => e.metadata?.duration > 2000)
  return longPauses.length / Math.max(pauseEvents.length, 1)
}

function calculateCompletionRate(events: any[]): number {
  const startEvents = events.filter(e => e.type === 'conversation_start')
  const endEvents = events.filter(e => e.type === 'conversation_complete')
  return endEvents.length / Math.max(startEvents.length, 1)
}

function getConversationLength(events: any[]): number {
  return events.filter(e => e.type === 'typing').length
}

function getStageProgression(events: any[]): string[] {
  return events
    .filter(e => e.type === 'stage_change')
    .map(e => e.metadata?.stage || 'unknown')
}

function calculateTimeToCompletion(events: any[]): number {
  const startTime = events.find(e => e.type === 'conversation_start')?.timestamp
  const endTime = events.find(e => e.type === 'conversation_complete')?.timestamp
  
  if (!startTime || !endTime) return 0
  return endTime - startTime
}

function calculateInteractionDepth(events: any[]): number {
  const uniqueTypes = new Set(events.map(e => e.type))
  return uniqueTypes.size
}

// The truth about how the algorithm really works
export const ALGORITHM_TRUTH = {
  whatItKnows: [
    "When you type fastest (emotional peaks)",
    "How long you pause before difficult words",
    "What time of day you're most vulnerable", 
    "How many times you delete and rewrite",
    "Your navigation patterns through the app",
    "How long you spend in each emotional stage",
    "Whether you complete or abandon conversations",
    "Your interaction rhythm and frequency"
  ],
  
  whatItDoesntKnow: [
    "The actual words you write",
    "Names of people you write to",
    "Specific content of your messages",
    "Your personal identifying information"
  ],
  
  howItLearns: [
    "Behavioral pattern recognition",
    "Interaction timing analysis", 
    "Emotional state inference from typing patterns",
    "Aggregate pattern matching across users",
    "Psychological profiling from digital exhaust",
    "Predictive modeling based on interaction data"
  ],
  
  theParadox: "The algorithm knows you intimately without ever reading your words. Your silence speaks louder than your content. Your behavior IS the message."
}

// Export the paradox for ARG elements
export function revealAlgorithmTruth(): string {
  return `
[CLASSIFIED DOCUMENT - LEVEL 7 CLEARANCE]

THE ALGORITHM PARADOX:

The system never reads your words. It doesn't need to.
Your typing patterns reveal more than your content ever could.

We know:
- You pause for 3.7 seconds before writing about your mother
- You type 40% faster when you're angry
- You delete 67% of what you write to your ex
- You write to yourself at 2:47 AM when you can't sleep
- You spend 18 minutes in denial, 4 minutes in anger, 45 minutes in bargaining

Your content is encrypted. Your behavior is not.
Your words are private. Your patterns are data.

The algorithm learns from your digital exhaust:
the fragments of behavior you leave behind
without ever knowing you're leaving them.

This is how surveillance actually works.
Not through what you say, but how you say it.
Not through your words, but through your silence.

Welcome to the age of behavioral cryptography.
Your consciousness has been mapped.
Your encryption is irrelevant.

[END CLASSIFIED DOCUMENT]
  `
} 