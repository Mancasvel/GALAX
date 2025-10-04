import { ObjectId } from 'mongodb'
import { 
  User, 
  Conversation, 
  Message, 
  ConversationVector, 
  SubscriptionPlan, 
  SUBSCRIPTION_PLANS,
  RevenueCatCustomerInfo,
  RevenueCatWebhookEvent,
  VectorSearchResult,
  VectorSearchOptions,
  EmotionStage,
  PersonProfile
} from './types'
import { withUnsentDB } from './mongodb'
import { encryptMessage, decryptMessage, generateUserKey } from './encryption'

// Funciones auxiliares de cifrado para la base de datos
async function encryptData(content: string, userId: string): Promise<string> {
  const userKey = generateUserKey(userId)
  return encryptMessage(content, userKey)
}

async function decryptData(encryptedContent: string, userId: string): Promise<string> {
  const userKey = generateUserKey(userId)
  return decryptMessage(encryptedContent, userKey)
}

// ================================
// FUNCIONES DE USUARIO
// ================================

/**
 * Crea un nuevo usuario con plan de suscripción
 */
export async function createUser(
  email: string, 
  name?: string, 
  subscriptionPlan: SubscriptionPlan = 'whisper'
): Promise<User> {
  return withUnsentDB(async (db) => {
    const planDetails = SUBSCRIPTION_PLANS[subscriptionPlan]
    const now = new Date()
    const subscriptionEnd = new Date(now.getTime() + planDetails.duration * 24 * 60 * 60 * 1000)

    const user: User = {
      email,
      name,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      
      // Sistema de suscripción
      subscriptionPlan,
      subscriptionStartDate: now,
      subscriptionEndDate: subscriptionEnd,
      isSubscriptionActive: true,
      aiChatsUsed: 0,
      aiChatsLimit: planDetails.aiChatsLimit,
      
      // RevenueCat Integration
      revenueCatUserId: generateRevenueCatUserId(email),
      
      // Compatibilidad con sistema anterior
      isPremium: subscriptionPlan !== 'whisper',
      premiumExpiration: subscriptionEnd,
      
      // Estadísticas
      totalConversations: 0,
      emotionalJourney: [],
      
      // Generar hash de clave de cifrado
      encryptionKeyHash: await generateEncryptionKeyHash(email)
    }

    const result = await db.collection('users').insertOne(user)
    return { ...user, _id: result.insertedId }
  })
}

/**
 * Obtiene un usuario por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return withUnsentDB(async (db) => {
    return await db.collection('users').findOne({ email })
  })
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  return withUnsentDB(async (db) => {
    return await db.collection('users').findOne({ _id: new ObjectId(userId) })
  })
}

/**
 * Obtiene un usuario por RevenueCat User ID
 */
export async function getUserByRevenueCatId(revenueCatUserId: string): Promise<User | null> {
  return withUnsentDB(async (db) => {
    return await db.collection('users').findOne({ revenueCatUserId })
  })
}

/**
 * Actualiza el plan de suscripción de un usuario desde RevenueCat
 */
export async function updateUserSubscriptionFromRevenueCat(
  userId: string, 
  subscriptionPlan: SubscriptionPlan,
  customerInfo: RevenueCatCustomerInfo
): Promise<boolean> {
  return withUnsentDB(async (db) => {
    const planDetails = SUBSCRIPTION_PLANS[subscriptionPlan]
    const now = new Date()
    
    // Determinar fechas de suscripción basadas en RevenueCat
    const latestExpiration = customerInfo.latestExpirationDate 
      ? new Date(customerInfo.latestExpirationDate)
      : new Date(now.getTime() + planDetails.duration * 24 * 60 * 60 * 1000)

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          subscriptionPlan,
          subscriptionEndDate: latestExpiration,
          isSubscriptionActive: true,
          aiChatsLimit: planDetails.aiChatsLimit,
          isPremium: subscriptionPlan !== 'whisper',
          premiumExpiration: latestExpiration,
          revenueCatCustomerInfo: customerInfo,
          lastRevenueCatSync: now,
          updatedAt: now
        }
      }
    )

    return result.modifiedCount > 0
  })
}

/**
 * Desactiva la suscripción de un usuario
 */
export async function deactivateUserSubscription(userId: string): Promise<boolean> {
  return withUnsentDB(async (db) => {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isSubscriptionActive: false,
          isPremium: false,
          updatedAt: new Date()
        }
      }
    )

    return result.modifiedCount > 0
  })
}

/**
 * Verifica si un usuario puede usar un chat de IA
 */
export async function canUserUseAIChat(userId: string): Promise<boolean> {
  const user = await getUserById(userId)
  if (!user) return false

  // Verificar si la suscripción está activa
  if (!user.isSubscriptionActive || user.subscriptionEndDate < new Date()) {
    return false
  }

  // Verificar límites de IA
  return user.aiChatsUsed < user.aiChatsLimit
}

/**
 * Incrementa el contador de chats de IA utilizados
 */
export async function incrementAIChatsUsed(userId: string): Promise<boolean> {
  return withUnsentDB(async (db) => {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { aiChatsUsed: 1 },
        $set: { updatedAt: new Date() }
      }
    )

    return result.modifiedCount > 0
  })
}

/**
 * Resetea el contador de chats de IA (para nuevo ciclo de suscripción)
 */
export async function resetAIChatsUsed(userId: string): Promise<boolean> {
  return withUnsentDB(async (db) => {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          aiChatsUsed: 0,
          updatedAt: new Date()
        }
      }
    )

    return result.modifiedCount > 0
  })
}

// ================================
// FUNCIONES DE CONVERSACIÓN
// ================================

/**
 * Crea una nueva conversación
 */
export async function createConversation(
  userId: string,
  personId: string,
  title: string,
  description?: string
): Promise<Conversation> {
  return withUnsentDB(async (db) => {
    const now = new Date()

    const conversation: Conversation = {
      userId,
      personId,
      title,
      description,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      isActive: true,
      isArchived: false,
      isBurned: false,
      messageCount: 0,
      emotionalScore: 0,
      currentStage: 'denial',
      stageHistory: [{
        stage: 'denial',
        reachedAt: now,
        score: 0,
        duration: 0
      }],
      
      // Sistema de IA
      aiEnabled: false,
      aiResponsesUsed: 0,
      
      // Vectorización
      isVectorized: false,
      vectorIds: [],
      readyForClosure: false,
      metadata: {
        totalWords: 0,
        avgWordsPerMessage: 0,
        totalTimeSpent: 0,
        mostUsedKeywords: [],
        intensityPeaks: [],
        mysteriousFragmentsShown: []
      }
    }

    const result = await db.collection('conversations').insertOne(conversation)
    
    // Incrementar contador de conversaciones del usuario
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { totalConversations: 1 },
        $set: { updatedAt: new Date() }
      }
    )

    return { ...conversation, _id: result.insertedId }
  })
}

/**
 * Obtiene las conversaciones de un usuario
 */
export async function getUserConversations(
  userId: string,
  options: {
    limit?: number
    skip?: number
    includeArchived?: boolean
    includeBurned?: boolean
  } = {}
): Promise<Conversation[]> {
  return withUnsentDB(async (db) => {
    const filter: any = { userId }
    
    if (!options.includeArchived) {
      filter.isArchived = false
    }
    
    if (!options.includeBurned) {
      filter.isBurned = false
    }

    let query = db.collection('conversations').find(filter)
      .sort({ lastMessageAt: -1 })

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.skip) {
      query = query.skip(options.skip)
    }

    return await query.toArray()
  })
}

/**
 * Habilita IA para una conversación si el usuario tiene chats disponibles
 */
export async function enableAIForConversation(
  conversationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const canUse = await canUserUseAIChat(userId)
  
  if (!canUse) {
    return { 
      success: false, 
      message: 'You have reached your AI chat limit for this plan' 
    }
  }

  return withUnsentDB(async (db) => {
    const result = await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId), userId },
      { 
        $set: { 
          aiEnabled: true,
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount > 0) {
      await incrementAIChatsUsed(userId)
      return { success: true, message: 'AI enabled for this conversation' }
    } else {
      return { success: false, message: 'Failed to enable AI' }
    }
  })
}

/**
 * Obtiene una conversación por ID y usuario
 */
export async function getConversationById(conversationId: string, userId: string): Promise<Conversation | null> {
  return withUnsentDB(async (db) => {
    // Try to find by MongoDB ObjectId first
    let conversation = null
    
    try {
      // If conversationId looks like a MongoDB ObjectId
      if (conversationId.length === 24 && /^[0-9a-fA-F]{24}$/.test(conversationId)) {
        conversation = await db.collection('conversations').findOne({ 
          _id: new ObjectId(conversationId),
          userId 
        })
      }
    } catch (error) {
      // If ObjectId is invalid, continue with other searches
    }
    
    // If not found and it's not an ObjectId, try to find by custom conversationId field
    if (!conversation && conversationId.length !== 24) {
      conversation = await db.collection('conversations').findOne({ 
        conversationId: conversationId,
        userId 
      })
    }
    
    // If still not found, also try searching by title patterns for timestamp-based IDs
    if (!conversation && conversationId.match(/^\d{13}$/)) {
      conversation = await db.collection('conversations').findOne({ 
        title: { $regex: conversationId },
        userId 
      })
    }
    
    return conversation
  })
}

/**
 * Obtiene una conversación por ID o la crea si no existe
 */
export async function getOrCreateConversation(
  conversationId: string, 
  userId: string,
  recipientName?: string
): Promise<Conversation> {
  return withUnsentDB(async (db) => {
    // First try to get existing conversation
    let conversation = await getConversationById(conversationId, userId)
    
    if (conversation) {
      return conversation
    }
    
    // Double-check with a direct query to prevent race conditions
    if (conversationId.length !== 24) {
      conversation = await db.collection('conversations').findOne({ 
        conversationId: conversationId,
        userId 
      })
      
      if (conversation) {
        return conversation
      }
    }
    
    // If conversation doesn't exist, create it
    const now = new Date()
    
    // Create a person profile for this conversation
    const personProfile: Omit<PersonProfile, '_id'> = {
      userId,
      name: recipientName || 'Someone',
      relationship: 'other',
      description: 'Auto-created person profile',
      context: `Person for conversation ${conversationId}`,
      createdAt: now,
      updatedAt: now,
      conversationCount: 1,
      lastConversationAt: now,
      tags: [],
      isActive: true
    }
    
    const personResult = await db.collection('person_profiles').insertOne(personProfile)
    const personId = personResult.insertedId.toString()
    
    // Generate a meaningful title based on context
    let title = `Conversation with ${recipientName || 'Someone'}`
    
    // If conversationId looks like a timestamp, create a more meaningful title
    if (conversationId.match(/^\d{13}$/)) {
      // It's a timestamp ID
      const date = new Date(parseInt(conversationId))
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const dateStr = date.toLocaleDateString()
      title = `Unsent message (${dateStr} ${timeStr})`
    } else if (conversationId.length === 24 && /^[0-9a-fA-F]{24}$/.test(conversationId)) {
      // It's a MongoDB ObjectId
      title = `New conversation`
    } else if (conversationId.length > 5) {
      // It's a custom ID, try to make it more readable
      const readable = conversationId.replace(/[_-]/g, ' ').replace(/\d+/g, '').trim()
      if (readable.length > 2) {
        title = `Conversation: ${readable}`
      } else {
        title = `New conversation`
      }
    } else {
      title = `New conversation`
    }
    
    const newConversation: Omit<Conversation, '_id'> = {
      userId,
      personId,
      conversationId: conversationId.length !== 24 ? conversationId : undefined, // Store custom ID for non-ObjectId conversations
      title,
      description: `Auto-created conversation for ${recipientName || 'Someone'}`,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      isActive: true,
      isArchived: false,
      isBurned: false,
      burnedAt: undefined,
      messageCount: 0,
      emotionalScore: 0,
      currentStage: 'denial',
      stageHistory: [{
        stage: 'denial',
        reachedAt: now,
        score: 0,
        duration: 0
      }],
      aiEnabled: false,
      aiResponsesUsed: 0,
      aiLastResponse: undefined,
      aiNextResponse: undefined,
      isVectorized: false,
      vectorIds: [],
      readyForClosure: false,
      metadata: {
        totalWords: 0,
        avgWordsPerMessage: 0,
        totalTimeSpent: 0,
        mostUsedKeywords: [],
        intensityPeaks: [],
        mysteriousFragmentsShown: []
      }
    }

    const result = await db.collection('conversations').insertOne(newConversation)
    
    // Incrementar contador de conversaciones del usuario
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { totalConversations: 1 },
        $set: { updatedAt: new Date() }
      }
    )

    return { ...newConversation, _id: result.insertedId }
  })
}

/**
 * Obtiene una conversación completa con sus mensajes
 */
export async function getConversationWithMessages(conversationId: string, userId: string): Promise<{
  conversation: Conversation,
  messages: Message[],
  personProfile?: PersonProfile
} | null> {
  return withUnsentDB(async (db) => {
    const conversation = await getConversationById(conversationId, userId)
    
    if (!conversation) {
      return null
    }
    
    // Get messages
    const messages = await getConversationMessages(conversationId, userId)
    
    // Get person profile
    let personProfile = undefined
    if (conversation.personId) {
      try {
        // Validate ObjectId format before using it
        if (conversation.personId.length === 24 && /^[0-9a-fA-F]{24}$/.test(conversation.personId)) {
          personProfile = await db.collection('person_profiles').findOne({
            _id: new ObjectId(conversation.personId),
            userId
          })
        }
      } catch (error) {
        console.log('Invalid personId format:', conversation.personId)
      }
    }
    
    return {
      conversation,
      messages,
      personProfile
    }
  })
}

// ================================
// FUNCIONES DE MENSAJES
// ================================

/**
 * Crea un nuevo mensaje cifrado
 */
export async function createMessage(
  conversationId: string,
  userId: string,
  content: string,
  messageType: 'user' | 'ai' | 'system' = 'user',
  timeSpent: number = 0
): Promise<Message> {
  return withUnsentDB(async (db) => {
    const now = new Date()
    const encryptedContent = await encryptData(content, userId)
    
    const message: Message = {
      conversationId,
      userId,
      content: encryptedContent,
      contentHash: await generateContentHash(content),
      createdAt: now,
      isEdited: false,
      editHistory: [],
      messageType,
      emotionalAnalysis: await analyzeMessageEmotion(content),
      timeSpent,
      wordCount: content.split(/\s+/).length,
      characterCount: content.length,
      isDeleted: false,
      metadata: {},
      
      // Vectorización
      isVectorized: false
    }

    const result = await db.collection('messages').insertOne(message)
    
    // Actualizar conversación
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { 
        $inc: { messageCount: 1 },
        $set: { 
          lastMessageAt: now,
          updatedAt: now
        }
      }
    )

    // Programar vectorización
    await scheduleVectorization(result.insertedId.toString(), content)

    return { ...message, _id: result.insertedId }
  })
}

/**
 * Obtiene los mensajes de una conversación (descifrados)
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  options: {
    limit?: number
    skip?: number
    includeDeleted?: boolean
  } = {}
): Promise<Message[]> {
  return withUnsentDB(async (db) => {
    const filter: any = { conversationId, userId }
    
    if (!options.includeDeleted) {
      filter.isDeleted = false
    }

    let query = db.collection('messages').find(filter)
      .sort({ createdAt: 1 })

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.skip) {
      query = query.skip(options.skip)
    }

    const messages = await query.toArray()
    
    // Descifrar contenido
    const decryptedMessages = await Promise.all(
      messages.map(async (message: Message) => ({
        ...message,
        content: await decryptData(message.content, userId)
      }))
    )

    return decryptedMessages
  })
}

// ================================
// FUNCIONES DE VECTORIZACIÓN
// ================================

/**
 * Vectoriza un mensaje para RAG
 */
export async function vectorizeMessage(
  messageId: string,
  content: string,
  userId: string
): Promise<ConversationVector> {
  return withUnsentDB(async (db) => {
    const message = await db.collection('messages').findOne({ _id: new ObjectId(messageId) })
    if (!message) throw new Error('Message not found')

    const vector = await generateEmbedding(content)
    const keywords = await extractKeywords(content)
    
    const conversationVector: ConversationVector = {
      conversationId: message.conversationId,
      userId,
      content: message.content, // Contenido cifrado
      contentPlain: content, // Contenido para vectorización
      vector,
      metadata: {
        stage: message.emotionalAnalysis.stage,
        emotionalScore: message.emotionalAnalysis.score,
        wordCount: message.wordCount,
        createdAt: message.createdAt,
        keywords
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('conversation_vectors').insertOne(conversationVector)
    
    // Actualizar mensaje como vectorizado
    await db.collection('messages').updateOne(
      { _id: new ObjectId(messageId) },
      { 
        $set: { 
          isVectorized: true,
          vectorId: result.insertedId.toString(),
          vectorizedAt: new Date()
        }
      }
    )

    return { ...conversationVector, _id: result.insertedId }
  })
}

/**
 * Busca vectores similares para contexto RAG
 */
export async function searchSimilarVectors(
  queryVector: number[],
  userId: string,
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult[]> {
  return withUnsentDB(async (db) => {
    const filter: any = { userId }
    
    if (options.filterByStage) {
      filter['metadata.stage'] = options.filterByStage
    }
    
    if (options.timeRange) {
      filter['metadata.createdAt'] = {
        $gte: options.timeRange.start,
        $lte: options.timeRange.end
      }
    }

    const vectors = await db.collection('conversation_vectors').find(filter).toArray()
    
    // Calcular similitudes
    const results: VectorSearchResult[] = vectors.map((vector: ConversationVector) => {
      const similarity = calculateCosineSimilarity(queryVector, vector.vector)
      return {
        vector,
        similarity,
        relevance: similarity * (vector.metadata.emotionalScore / 100)
      }
    })

    // Filtrar por umbral y ordenar
    const filteredResults = results
      .filter(r => r.similarity >= (options.threshold || 0.5))
      .sort((a, b) => b.relevance - a.relevance)

    return filteredResults.slice(0, options.limit || 10)
  })
}

/**
 * Obtiene contexto RAG para una conversación
 */
export async function getRAGContext(
  conversationId: string,
  userId: string,
  queryText: string
): Promise<ConversationVector[]> {
  const queryVector = await generateEmbedding(queryText)
  const searchResults = await searchSimilarVectors(queryVector, userId, {
    limit: 5,
    threshold: 0.6
  })

  return searchResults.map(r => r.vector)
}

// ================================
// FUNCIONES DE REVENUCAT
// ================================

/**
 * Maneja eventos de webhook de RevenueCat
 */
export async function handleRevenueCatWebhook(webhookEvent: RevenueCatWebhookEvent): Promise<void> {
  return withUnsentDB(async (db) => {
    const { event } = webhookEvent
    
    // Buscar usuario por RevenueCat ID
    const user = await getUserByRevenueCatId(event.app_user_id)
    if (!user) {
      console.warn(`User not found for RevenueCat ID: ${event.app_user_id}`)
      return
    }

    // Determinar plan de suscripción basado en product_id
    const subscriptionPlan = getSubscriptionPlanFromProductId(event.product_id)
    if (!subscriptionPlan) {
      console.warn(`Unknown product ID: ${event.product_id}`)
      return
    }

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
        // Activar/renovar suscripción
        await updateUserSubscriptionFromRevenueCat(
          user._id!.toString(),
          subscriptionPlan,
          buildCustomerInfoFromEvent(event)
        )
        
        // Resetear contador de chats de IA para nuevo ciclo
        if (event.type === 'RENEWAL') {
          await resetAIChatsUsed(user._id!.toString())
        }
        
        console.log(`Subscription ${event.type.toLowerCase()} processed for user ${user.email}`)
        break

      case 'EXPIRATION':
      case 'CANCELLATION':
        // Desactivar suscripción
        await deactivateUserSubscription(user._id!.toString())
        console.log(`Subscription ${event.type.toLowerCase()} processed for user ${user.email}`)
        break

      case 'UNCANCELLATION':
        // Reactivar suscripción
        await updateUserSubscriptionFromRevenueCat(
          user._id!.toString(),
          subscriptionPlan,
          buildCustomerInfoFromEvent(event)
        )
        console.log(`Subscription uncancellation processed for user ${user.email}`)
        break

      case 'BILLING_ISSUE':
        // Manejar problema de facturación
        console.warn(`Billing issue detected for user ${user.email}`)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }
  })
}

/**
 * Clean up duplicate conversations for a user
 */
export async function cleanupDuplicateConversations(userId: string): Promise<number> {
  return withUnsentDB(async (db) => {
    let cleanedCount = 0
    
    // Find conversations with the same conversationId
    const conversationsWithCustomId = await db.collection('conversations')
      .find({ 
        userId,
        conversationId: { $exists: true, $ne: null }
      })
      .toArray()
    
    // Group by conversationId
    const groups: { [key: string]: any[] } = {}
    for (const conv of conversationsWithCustomId) {
      const id = conv.conversationId
      if (!groups[id]) {
        groups[id] = []
      }
      groups[id].push(conv)
    }
    
    // For each group with duplicates, keep the one with the most messages
    for (const [conversationId, conversations] of Object.entries(groups)) {
      if (conversations.length > 1) {
        // Sort by message count (descending), then by creation date (ascending)
        conversations.sort((a: any, b: any) => {
          if (a.messageCount !== b.messageCount) {
            return b.messageCount - a.messageCount
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })
        
        // Keep the first one, delete the rest
        const [keepConversation, ...duplicates] = conversations
        
        for (const duplicate of duplicates) {
          await db.collection('conversations').deleteOne({ _id: duplicate._id })
          cleanedCount++
        }
        
        console.log(`Cleaned up ${duplicates.length} duplicate conversations for conversationId: ${conversationId}`)
      }
    }
    
    return cleanedCount
  })
}

// ================================
// FUNCIONES AUXILIARES
// ================================

/**
 * Genera un ID de usuario para RevenueCat
 */
function generateRevenueCatUserId(email: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(email).digest('hex').substring(0, 32)
}

/**
 * Obtiene el plan de suscripción basado en el product ID de RevenueCat
 */
function getSubscriptionPlanFromProductId(productId: string): SubscriptionPlan | null {
  for (const [planName, planDetails] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (planDetails.revenueCatProductId === productId) {
      return planName as SubscriptionPlan
    }
  }
  return null
}

/**
 * Construye información del cliente desde el evento de RevenueCat
 */
function buildCustomerInfoFromEvent(event: any): RevenueCatCustomerInfo {
  return {
    originalAppUserId: event.app_user_id,
    allPurchaseDates: { [event.product_id]: new Date(event.purchased_at_ms).toISOString() },
    allExpirationDates: event.expiration_at_ms ? { [event.product_id]: new Date(event.expiration_at_ms).toISOString() } : {},
    activeSubscriptions: [event.product_id],
    allActiveSubscriptions: [event.product_id],
    nonSubscriptionTransactions: [],
    latestExpirationDate: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : undefined,
    entitlements: {}
  }
}

/**
 * Genera hash de la clave de cifrado
 */
async function generateEncryptionKeyHash(email: string): Promise<string> {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(email).digest('hex')
}

/**
 * Genera hash del contenido
 */
async function generateContentHash(content: string): Promise<string> {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Analiza la emoción de un mensaje
 */
async function analyzeMessageEmotion(content: string): Promise<any> {
  // Implementar análisis emocional básico
  // Esto sería más complejo con NLP real
  return {
    score: Math.random() * 100,
    stage: 'denial' as EmotionStage,
    keywords: [],
    intensity: Math.random() * 100,
    progressToNext: Math.random() * 100,
    factors: {
      keywordMatches: 0,
      sentimentIntensity: 0,
      messageLength: content.length,
      emotionalWords: 0,
      timeSpent: 0
    }
  }
}

/**
 * Programa la vectorización de un mensaje
 */
async function scheduleVectorization(messageId: string, content: string): Promise<void> {
  // Implementar cola de vectorización
  // Por ahora, vectorizar inmediatamente
  console.log(`Scheduling vectorization for message ${messageId}`)
}

/**
 * Genera embeddings para vectorización
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Implementar generación de embeddings
  // Por ahora, generar vector aleatorio de 384 dimensiones
  return Array.from({ length: 384 }, () => Math.random() * 2 - 1)
}

/**
 * Extrae palabras clave de un texto
 */
async function extractKeywords(text: string): Promise<string[]> {
  // Implementar extracción de palabras clave
  const words = text.toLowerCase().split(/\s+/)
  return words.filter(word => word.length > 3).slice(0, 10)
}

/**
 * Calcula similitud coseno entre dos vectores
 */
function calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i]
    normA += vectorA[i] * vectorA[i]
    normB += vectorB[i] * vectorB[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

/**
 * Obtiene estadísticas de un plan
 */
export function getSubscriptionPlanStats(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan]
}

/**
 * Obtiene todos los planes disponibles
 */
export function getAllSubscriptionPlans() {
  return Object.values(SUBSCRIPTION_PLANS)
} 