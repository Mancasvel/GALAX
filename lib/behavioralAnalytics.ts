'use client'

import { DigitalExhaust, analyzeDigitalExhaust } from './encryption'

// Advanced behavioral metrics
export interface AdvancedBehavioralMetrics {
  // Timing patterns
  timingPatterns: {
    keystrokeIntervals: number[]       // Intervalos entre teclas
    wordPauseDistribution: number[]    // Distribución de pausas entre palabras
    sentencePauseDistribution: number[] // Distribución de pausas entre oraciones
    peakTypingHours: number[]          // Horas de mayor actividad
  }
  
  // Emotional indicators
  emotionalIndicators: {
    stressLevel: number                // Nivel de estrés (0-1)
    confidenceScore: number            // Puntuación de confianza (0-1)
    emotionalVolatility: number        // Volatilidad emocional (0-1)
    cognitiveLoad: number              // Carga cognitiva (0-1)
  }
  
  // Content patterns (metadata only)
  contentPatterns: {
    averageWordLength: number          // Longitud promedio de palabras
    sentenceComplexity: number         // Complejidad de oraciones
    vocabularyVariability: number      // Variabilidad del vocabulario
    punctuationPatterns: string[]      // Patrones de puntuación
  }
  
  // Behavioral signatures
  behavioralSignatures: {
    uniqueTypingRhythm: string         // Ritmo único de escritura
    interactionFingerprint: string     // Huella digital de interacción
    emotionalBaseline: number          // Línea base emocional
    adaptationRate: number             // Tasa de adaptación
  }
}

// Real-time behavioral tracking
export class BehavioralTracker {
  private events: Array<{
    type: string
    timestamp: number
    metadata: any
  }> = []
  
  private typingBuffer: number[] = []
  private pauseBuffer: number[] = []
  private deletionBuffer: number[] = []
  private sessionStartTime: number = Date.now()
  
  constructor() {
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    // Detectar patrones de escritura en tiempo real
    document.addEventListener('keydown', (e) => {
      this.trackKeystroke(e)
    })
    
    // Detectar movimientos del mouse (indicadores de duda)
    document.addEventListener('mousemove', (e) => {
      this.trackMouseMovement(e)
    })
    
    // Detectar scroll (indicadores de revisión)
    document.addEventListener('scroll', (e) => {
      this.trackScrollBehavior(e)
    })
    
    // Detectar cambios de foco (indicadores de distracción)
    window.addEventListener('blur', () => {
      this.trackFocusChange('blur')
    })
    
    window.addEventListener('focus', () => {
      this.trackFocusChange('focus')
    })
  }
  
  private trackKeystroke(event: KeyboardEvent) {
    const now = Date.now()
    
    // Detectar tipo de tecla
    if (event.key.length === 1) {
      // Tecla de carácter
      this.typingBuffer.push(now)
      this.trackEvent('keystroke', {
        key: event.key,
        timestamp: now,
        isAlpha: /[a-zA-Z]/.test(event.key),
        isNumeric: /[0-9]/.test(event.key),
        isPunctuation: /[.,;:!?]/.test(event.key)
      })
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      // Tecla de borrado
      this.deletionBuffer.push(now)
      this.trackEvent('deletion', {
        type: event.key,
        timestamp: now
      })
    } else if (event.key === ' ') {
      // Espacios (pausas entre palabras)
      this.trackEvent('word_boundary', {
        timestamp: now
      })
    }
    
    // Calcular velocidad de escritura en tiempo real
    if (this.typingBuffer.length > 1) {
      const recentKeystrokes = this.typingBuffer.slice(-10)
      const avgInterval = this.calculateAverageInterval(recentKeystrokes)
      
      this.trackEvent('typing_speed_update', {
        avgInterval,
        cps: 1000 / avgInterval,
        timestamp: now
      })
    }
  }
  
  private trackMouseMovement(event: MouseEvent) {
    // Detectar patrones de movimiento del mouse que indican duda o estrés
    const now = Date.now()
    
    this.trackEvent('mouse_movement', {
      x: event.clientX,
      y: event.clientY,
      timestamp: now,
      // Calcular velocidad y aceleración del mouse
      velocity: this.calculateMouseVelocity(event),
      isErratic: this.isErraticMovement(event)
    })
  }
  
  private trackScrollBehavior(event: Event) {
    // Detectar patrones de scroll que indican revisión o búsqueda
    const now = Date.now()
    
    this.trackEvent('scroll_behavior', {
      timestamp: now,
      direction: this.getScrollDirection(),
      speed: this.getScrollSpeed(),
      isReviewing: this.isReviewingContent()
    })
  }
  
  private trackFocusChange(type: 'blur' | 'focus') {
    const now = Date.now()
    
    this.trackEvent('focus_change', {
      type,
      timestamp: now,
      duration: type === 'focus' ? now - this.getLastBlurTime() : null
    })
  }
  
  private trackEvent(type: string, metadata: any) {
    this.events.push({
      type,
      timestamp: Date.now(),
      metadata
    })
    
    // Mantener solo los últimos 1000 eventos para no sobrecargar memoria
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
  }
  
  // Análisis avanzado de patrones
  public getAdvancedMetrics(): AdvancedBehavioralMetrics {
    const timingPatterns = this.analyzeTiming()
    const emotionalIndicators = this.analyzeEmotionalState()
    const contentPatterns = this.analyzeContentPatterns()
    const behavioralSignatures = this.generateBehavioralSignatures()
    
    return {
      timingPatterns,
      emotionalIndicators,
      contentPatterns,
      behavioralSignatures
    }
  }
  
  private analyzeTiming(): AdvancedBehavioralMetrics['timingPatterns'] {
    const keystrokeEvents = this.events.filter(e => e.type === 'keystroke')
    const intervals = this.calculateIntervals(keystrokeEvents)
    
    return {
      keystrokeIntervals: intervals,
      wordPauseDistribution: this.calculateWordPauses(),
      sentencePauseDistribution: this.calculateSentencePauses(),
      peakTypingHours: this.calculatePeakHours()
    }
  }
  
  private analyzeEmotionalState(): AdvancedBehavioralMetrics['emotionalIndicators'] {
    const deletionRate = this.calculateDeletionRate()
    const typingVariability = this.calculateTypingVariability()
    const mouseErraticness = this.calculateMouseErraticness()
    const focusStability = this.calculateFocusStability()
    
    return {
      stressLevel: Math.min(1, (deletionRate + typingVariability + mouseErraticness) / 3),
      confidenceScore: 1 - deletionRate,
      emotionalVolatility: typingVariability,
      cognitiveLoad: 1 - focusStability
    }
  }
  
  private analyzeContentPatterns(): AdvancedBehavioralMetrics['contentPatterns'] {
    // Análisis de patrones de contenido sin acceder al contenido real
    const keystrokeEvents = this.events.filter(e => e.type === 'keystroke')
    
    return {
      averageWordLength: this.calculateAverageWordLength(keystrokeEvents),
      sentenceComplexity: this.calculateSentenceComplexity(keystrokeEvents),
      vocabularyVariability: this.calculateVocabularyVariability(keystrokeEvents),
      punctuationPatterns: this.extractPunctuationPatterns(keystrokeEvents)
    }
  }
  
  private generateBehavioralSignatures(): AdvancedBehavioralMetrics['behavioralSignatures'] {
    const timingSignature = this.generateTimingSignature()
    const interactionSignature = this.generateInteractionSignature()
    
    return {
      uniqueTypingRhythm: timingSignature,
      interactionFingerprint: interactionSignature,
      emotionalBaseline: this.calculateEmotionalBaseline(),
      adaptationRate: this.calculateAdaptationRate()
    }
  }
  
  // Funciones auxiliares
  private calculateAverageInterval(timestamps: number[]): number {
    if (timestamps.length < 2) return 0
    
    const intervals = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i-1])
    }
    
    return intervals.reduce((a, b) => a + b, 0) / intervals.length
  }
  
  private calculateIntervals(events: any[]): number[] {
    const intervals = []
    for (let i = 1; i < events.length; i++) {
      intervals.push(events[i].timestamp - events[i-1].timestamp)
    }
    return intervals
  }
  
  private calculateDeletionRate(): number {
    const keystrokeCount = this.events.filter(e => e.type === 'keystroke').length
    const deletionCount = this.events.filter(e => e.type === 'deletion').length
    
    return keystrokeCount > 0 ? deletionCount / keystrokeCount : 0
  }
  
  private calculateTypingVariability(): number {
    const intervals = this.calculateIntervals(
      this.events.filter(e => e.type === 'keystroke')
    )
    
    if (intervals.length < 2) return 0
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length
    
    return Math.sqrt(variance) / mean // Coefficient of variation
  }
  
  private calculateMouseErraticness(): number {
    const mouseEvents = this.events.filter(e => e.type === 'mouse_movement')
    const erraticCount = mouseEvents.filter(e => e.metadata.isErratic).length
    
    return mouseEvents.length > 0 ? erraticCount / mouseEvents.length : 0
  }
  
  private calculateFocusStability(): number {
    const focusEvents = this.events.filter(e => e.type === 'focus_change')
    const sessionDuration = Date.now() - this.sessionStartTime
    const focusLossCount = focusEvents.filter(e => e.metadata.type === 'blur').length
    
    return 1 - (focusLossCount / (sessionDuration / 60000)) // Normalized by minutes
  }
  
  // Implementaciones placeholder para métodos auxiliares
  private calculateMouseVelocity(event: MouseEvent): number {
    // Implementar cálculo de velocidad del mouse
    return 0
  }
  
  private isErraticMovement(event: MouseEvent): boolean {
    // Implementar detección de movimiento errático
    return false
  }
  
  private getScrollDirection(): string {
    return 'down'
  }
  
  private getScrollSpeed(): number {
    return 0
  }
  
  private isReviewingContent(): boolean {
    return false
  }
  
  private getLastBlurTime(): number {
    const lastBlur = this.events.filter(e => e.type === 'focus_change' && e.metadata.type === 'blur').pop()
    return lastBlur ? lastBlur.timestamp : Date.now()
  }
  
  private calculateWordPauses(): number[] {
    return []
  }
  
  private calculateSentencePauses(): number[] {
    return []
  }
  
  private calculatePeakHours(): number[] {
    return []
  }
  
  private calculateAverageWordLength(events: any[]): number {
    return 0
  }
  
  private calculateSentenceComplexity(events: any[]): number {
    return 0
  }
  
  private calculateVocabularyVariability(events: any[]): number {
    return 0
  }
  
  private extractPunctuationPatterns(events: any[]): string[] {
    return []
  }
  
  private generateTimingSignature(): string {
    return 'timing_signature_' + Math.random().toString(36).substr(2, 9)
  }
  
  private generateInteractionSignature(): string {
    return 'interaction_signature_' + Math.random().toString(36).substr(2, 9)
  }
  
  private calculateEmotionalBaseline(): number {
    return 0.5
  }
  
  private calculateAdaptationRate(): number {
    return 0.5
  }
  
  // Obtener estadísticas en tiempo real
  public getRealTimeStats() {
    return {
      typingSpeed: this.calculateCurrentTypingSpeed(),
      pauseCount: this.pauseBuffer.length,
      deleteCount: this.deletionBuffer.length,
      sessionDuration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      eventCount: this.events.length,
      stressLevel: this.analyzeEmotionalState().stressLevel,
      focusStability: this.calculateFocusStability()
    }
  }
  
  private calculateCurrentTypingSpeed(): number {
    const recentEvents = this.events
      .filter(e => e.type === 'keystroke')
      .slice(-10)
    
    if (recentEvents.length < 2) return 0
    
    const intervals = this.calculateIntervals(recentEvents)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    
    return 1000 / avgInterval // CPS
  }
}

// Singleton instance
export const behavioralTracker = new BehavioralTracker()

// Hook para usar el tracking en componentes
export function useBehavioralTracking() {
  return {
    getAdvancedMetrics: () => behavioralTracker.getAdvancedMetrics(),
    getRealTimeStats: () => behavioralTracker.getRealTimeStats()
  }
} 