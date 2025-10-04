import { ObjectId } from 'mongodb'
export type EmotionStage = 'denial' | 'anger' | 'bargaining' | 'depression' | 'acceptance'

// Planes de suscripción con nombres espirituales
export type SubscriptionPlan = 'whisper' | 'reflection' | 'depths' | 'transcendence' | 'admin'

export interface SubscriptionPlanDetails {
  name: SubscriptionPlan
  spiritualName: string
  description: string
  price: number // En euros
  duration: number // En días
  aiChatsLimit: number
  features: string[]
  isActive: boolean
  // RevenueCat Integration
  revenueCatProductId: string
  revenueCatEntitlementId: string
}

// Configuración de planes
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  whisper: {
    name: 'whisper',
    spiritualName: 'Whisper of Dawn',
    description: 'A gentle introduction to the depths of your soul',
    price: 0,
    duration: 7,
    aiChatsLimit: 1,
    features: [
      'Access to emotional analysis',
      'Basic conversation storage',
      '1 AI conversation',
      'Mysterious fragments'
    ],
    isActive: true,
    revenueCatProductId: 'whisper_trial',
    revenueCatEntitlementId: 'whisper_access'
  },
  reflection: {
    name: 'reflection',
    spiritualName: 'Mirror of Reflection',
    description: 'Look deeper into the waters of your heart',
    price: 8,
    duration: 30,
    aiChatsLimit: 1,
    features: [
      'All Whisper features',
      'Extended conversation storage',
      'Premium emotional insights',
      'Weekly reflection reports'
    ],
    isActive: true,
    revenueCatProductId: 'reflection_monthly',
    revenueCatEntitlementId: 'reflection_access'
  },
  depths: {
    name: 'depths',
    spiritualName: 'Journey to the Depths',
    description: 'Explore the profound mysteries within',
    price: 10,
    duration: 30,
    aiChatsLimit: 3,
    features: [
      'All Reflection features',
      '3 AI conversations',
      'Advanced emotional tracking',
      'Personalized guidance'
    ],
    isActive: true,
    revenueCatProductId: 'depths_monthly',
    revenueCatEntitlementId: 'depths_access'
  },
  transcendence: {
    name: 'transcendence',
    spiritualName: 'Path to Transcendence',
    description: 'Ascend beyond the veil of unsent words',
    price: 30,
    duration: 30,
    aiChatsLimit: 15,
    features: [
      'All Depths features',
      '15 AI conversations',
      'Unlimited conversations',
      'Priority support',
      'Advanced analytics',
      'Custom mysterious fragments'
    ],
    isActive: true,
    revenueCatProductId: 'transcendence_monthly',
    revenueCatEntitlementId: 'transcendence_access'
  },
  admin: {
    name: 'admin',
    spiritualName: 'Eternal Overseer',
    description: 'Administrative access to all realms',
    price: 0,
    duration: 365,
    aiChatsLimit: 999999,
    features: [
      'Unlimited AI conversations',
      'Administrative dashboard',
      'User management',
      'Analytics access',
      'All premium features',
      'Priority support',
      'Beta feature access'
    ],
    isActive: true,
    revenueCatProductId: 'admin_unlimited',
    revenueCatEntitlementId: 'admin_access'
  }
}

// Tipos para el Usuario actualizado
export interface User {
  _id?: ObjectId
  id?: string // For API responses
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  isActive: boolean
  isAdmin?: boolean
  
  // Sistema de suscripción
  subscriptionPlan: SubscriptionPlan
  subscriptionStartDate: Date
  subscriptionEndDate: Date
  isSubscriptionActive: boolean
  aiChatsUsed: number
  aiChatsLimit: number
  
  // RevenueCat Integration
  revenueCatUserId?: string
  revenueCatCustomerInfo?: RevenueCatCustomerInfo
  lastRevenueCatSync?: Date
  
  // Compatibilidad con sistema anterior
  isPremium: boolean
  premiumExpiration?: Date
  
  // Autenticación
  magicLinkToken?: string
  magicLinkExpiration?: Date
  
  // Estadísticas
  totalConversations: number
  emotionalJourney: EmotionStage[]
  encryptionKeyHash?: string // Hash de la clave de cifrado para verificación
}

// RevenueCat Integration Types
export interface RevenueCatCustomerInfo {
  originalAppUserId: string
  allPurchaseDates: Record<string, string>
  allExpirationDates: Record<string, string>
  activeSubscriptions: string[]
  allActiveSubscriptions: string[]
  nonSubscriptionTransactions: RevenueCatTransaction[]
  latestExpirationDate?: string
  originalApplicationVersion?: string
  entitlements: Record<string, RevenueCatEntitlement>
}

export interface RevenueCatEntitlement {
  identifier: string
  isActive: boolean
  willRenew: boolean
  periodType: 'trial' | 'intro' | 'normal'
  latestPurchaseDate: string
  originalPurchaseDate: string
  expirationDate?: string
  store: 'app_store' | 'play_store' | 'amazon' | 'mac_app_store' | 'stripe'
  productIdentifier: string
  isSandbox: boolean
  unsubscribeDetectedAt?: string
  billingIssueDetectedAt?: string
}

export interface RevenueCatTransaction {
  productId: string
  purchaseDate: string
  transactionId: string
  store: string
  isSandbox: boolean
}

// RevenueCat Webhook Event Types
export interface RevenueCatWebhookEvent {
  event: {
    id: string
    type: 'INITIAL_PURCHASE' | 'RENEWAL' | 'CANCELLATION' | 'EXPIRATION' | 'BILLING_ISSUE' | 'SUBSCRIBER_ALIAS' | 'UNCANCELLATION'
    app_id: string
    app_user_id: string
    aliases: string[]
    original_app_user_id: string
    period_type: 'trial' | 'intro' | 'normal'
    purchased_at_ms: number
    expiration_at_ms?: number
    environment: 'SANDBOX' | 'PRODUCTION'
    entitlement_id?: string
    entitlement_ids?: string[]
    product_id: string
    price?: number
    currency?: string
    store: 'app_store' | 'play_store' | 'amazon' | 'mac_app_store' | 'stripe'
    transaction_id: string
    original_transaction_id: string
    is_family_share?: boolean
    country_code?: string
    subscriber_attributes?: Record<string, any>
    cancel_reason?: 'UNSUBSCRIBE' | 'BILLING_ERROR' | 'DEVELOPER_INITIATED' | 'PRICE_INCREASE' | 'CUSTOMER_SUPPORT' | 'UNKNOWN'
  }
  api_version: string
}

// Vectorización para RAG
export interface ConversationVector {
  _id?: ObjectId
  conversationId: string
  userId: string
  content: string // Contenido original (cifrado)
  contentPlain: string // Contenido para vectorización (descifrado temporalmente)
  vector: number[] // Vector embeddings
  metadata: {
    stage: EmotionStage
    emotionalScore: number
    wordCount: number
    createdAt: Date
    keywords: string[]
  }
  createdAt: Date
  updatedAt: Date
}

// Tipos para perfiles de personas
export interface PersonProfile {
  _id?: ObjectId
  userId: string
  name: string
  relationship: string // 'ex-partner', 'friend', 'family', 'colleague', 'stranger', 'self', 'other'
  description?: string
  context: string // Contexto personal sobre esta persona
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
  conversationCount: number
  lastConversationAt?: Date
  tags: string[]
  isActive: boolean
}

// Tipos para la Conversación actualizada
export interface Conversation {
  _id?: ObjectId
  userId: string
  personId: string // Referencia al perfil de la persona
  conversationId?: string // Custom conversation ID for non-ObjectId conversations
  title: string // Título generado automáticamente o por el usuario
  description?: string // Descripción opcional
  createdAt: Date
  updatedAt: Date
  lastMessageAt: Date
  isActive: boolean
  isArchived: boolean
  isBurned: boolean // Si fue "quemada" en el ritual
  burnedAt?: Date
  messageCount: number
  emotionalScore: number
  currentStage: EmotionStage
  stageHistory: EmotionStageHistory[]
  
  // Sistema de IA mejorado
  aiEnabled: boolean // Si tiene respuestas de IA activadas
  aiResponsesUsed: number // Contador de respuestas de IA utilizadas
  aiLastResponse?: Date
  aiNextResponse?: Date // Programada para respuesta con delay
  
  // Vectorización
  isVectorized: boolean
  vectorizedAt?: Date
  vectorIds: string[] // IDs de los vectores asociados
  
  readyForClosure: boolean
  closureOfferedAt?: Date
  closureAction?: 'burn' | 'archive' | 'continue'
  closureReason?: string
  metadata: ConversationMetadata
}

// Historial de etapas emocionales
export interface EmotionStageHistory {
  stage: EmotionStage
  score: number
  reachedAt: Date
  duration: number // Tiempo en esta etapa en minutos
}

// Metadatos de conversación
export interface ConversationMetadata {
  totalWords: number
  avgWordsPerMessage: number
  totalTimeSpent: number // En minutos
  mostUsedKeywords: string[]
  intensityPeaks: Date[]
  mysteriousFragmentsShown: string[]
}

// Tipos para el Mensaje actualizado
export interface Message {
  _id?: ObjectId
  conversationId: string
  userId: string
  content: string // Contenido cifrado
  contentHash: string // Hash del contenido para verificación
  createdAt: Date
  updatedAt?: Date
  isEdited: boolean
  editHistory?: MessageEdit[]
  messageType: 'user' | 'ai' | 'system'
  emotionalAnalysis: MessageEmotionalAnalysis
  aiResponse?: AIResponse
  timeSpent: number // Tiempo invertido escribiendo en segundos
  wordCount: number
  characterCount: number
  isDeleted: boolean
  deletedAt?: Date
  metadata: MessageMetadata
  
  // Vectorización
  isVectorized: boolean
  vectorId?: string
  vectorizedAt?: Date
}

// Análisis emocional del mensaje
export interface MessageEmotionalAnalysis {
  score: number
  stage: EmotionStage
  keywords: string[]
  intensity: number
  progressToNext: number
  factors: {
    keywordMatches: number
    sentimentIntensity: number
    messageLength: number
    emotionalWords: number
    timeSpent: number
  }
}

// Respuesta de IA actualizada
export interface AIResponse {
  content: string // Contenido cifrado
  generatedAt: Date
  deliveredAt?: Date
  model: string // 'claude-3' | 'gpt-4'
  prompt: string
  stage: EmotionStage
  delay: number // Delay programado en minutos
  wasDelivered: boolean
  emotionalTone: string
  mysteriousFragment?: string
  
  // Contexto RAG
  ragContext?: {
    vectorsUsed: string[]
    relevantMessages: string[]
    contextSummary: string
  }
}

// Historial de edición de mensajes
export interface MessageEdit {
  content: string // Contenido cifrado
  editedAt: Date
  reason?: string
}

// Metadatos del mensaje
export interface MessageMetadata {
  deviceInfo?: string
  location?: string
  mood?: string
  tags?: string[]
  attachments?: string[]
  reactions?: string[]
}

// Tipos para el sistema de notificaciones
export interface NotificationSettings {
  userId: string
  pushEnabled: boolean
  mysteriousFragments: boolean
  aiResponses: boolean
  weeklyReports: boolean
  remindersToContinue: boolean
  oneSignalPlayerId?: string
  createdAt: Date
  updatedAt: Date
}

// Tipos para el sistema de fragmentos misteriosos
export interface MysteriousFragment {
  _id?: ObjectId
  userId: string
  content: string
  stage: EmotionStage
  shownAt: Date
  wasRead: boolean
  readAt?: Date
  context: string // Contexto en el que se mostró
  type: 'notification' | 'in_app' | 'daily_fragment'
}

// Tipos para el sistema premium actualizado
export interface PremiumFeature {
  name: string
  description: string
  isActive: boolean
  usageLimit?: number
  usageCount?: number
  resetDate?: Date
}

// Tipos para estadísticas del usuario
export interface UserStats {
  userId: string
  totalMessages: number
  totalConversations: number
  avgEmotionalScore: number
  timeSpent: number
  favoriteStage: EmotionStage
  progressionRate: number
  streakDays: number
  lastActiveDate: Date
  subscriptionPlan: SubscriptionPlan
  aiChatsUsed: number
  updatedAt: Date
}

// Tipos para el sistema de backup
export interface BackupData {
  userId: string
  conversations: Conversation[]
  messages: Message[]
  settings: NotificationSettings
  stats: UserStats
  createdAt: Date
  encrypted: boolean
  version: string
}

// Tipos para respuestas de API
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipos para sesiones de autenticación
export interface AuthSession {
  userId: string
  email: string
  name?: string
  subscriptionPlan: SubscriptionPlan
  isSubscriptionActive: boolean
  aiChatsUsed: number
  aiChatsLimit: number
  isPremium: boolean
  isActive: boolean
  expiresAt: Date
}

// Tipos para análisis de IA
export interface AIAnalysisRequest {
  messages: string[]
  currentStage: EmotionStage
  emotionalScore: number
  userContext: string
  ragContext?: ConversationVector[] // Contexto vectorizado
}

export interface AIAnalysisResponse {
  response: string
  suggestedStage: EmotionStage
  emotionalTone: string
  mysteriousFragment?: string
  shouldOfferClosure: boolean
  delay: number
  ragContext?: {
    vectorsUsed: string[]
    relevantMessages: string[]
    contextSummary: string
  }
}

// Tipos para el sistema de vectorización
export interface VectorSearchResult {
  vector: ConversationVector
  similarity: number
  relevance: number
}

export interface VectorSearchOptions {
  limit?: number
  threshold?: number
  includeMetadata?: boolean
  filterByStage?: EmotionStage
  timeRange?: {
    start: Date
    end: Date
  }
} 