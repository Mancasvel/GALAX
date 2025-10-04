import { withUnsentDB } from './mongodb'

/**
 * Inicializa la base de datos Unsent con todas las collections e índices necesarios
 */
export async function initializeUnsentDatabase(): Promise<void> {
  return withUnsentDB(async (db) => {
    console.log('🚀 Inicializando base de datos Unsent...')

    // ================================
    // COLLECTION: USERS
    // ================================
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'subscriptionPlan', 'subscriptionStartDate', 'subscriptionEndDate', 'isSubscriptionActive'],
          properties: {
            email: {
              bsonType: 'string',
              description: 'Email del usuario'
            },
            subscriptionPlan: {
              bsonType: 'string',
              enum: ['whisper', 'reflection', 'depths', 'transcendence'],
              description: 'Plan de suscripción'
            },
            subscriptionStartDate: {
              bsonType: 'date',
              description: 'Fecha de inicio de suscripción'
            },
            subscriptionEndDate: {
              bsonType: 'date',
              description: 'Fecha de fin de suscripción'
            },
            isSubscriptionActive: {
              bsonType: 'bool',
              description: 'Si la suscripción está activa'
            },
            aiChatsUsed: {
              bsonType: 'int',
              description: 'Chats de IA utilizados'
            },
            aiChatsLimit: {
              bsonType: 'int',
              description: 'Límite de chats de IA'
            },
            revenueCatUserId: {
              bsonType: 'string',
              description: 'ID de usuario en RevenueCat'
            }
          }
        }
      }
    })

    // Índices para users
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ subscriptionPlan: 1 })
    await db.collection('users').createIndex({ subscriptionEndDate: 1 })
    await db.collection('users').createIndex({ isSubscriptionActive: 1 })
    await db.collection('users').createIndex({ revenueCatUserId: 1 }, { unique: true, sparse: true })
    await db.collection('users').createIndex({ magicLinkToken: 1 }, { sparse: true })
    await db.collection('users').createIndex({ 
      magicLinkExpiration: 1 
    }, { 
      expireAfterSeconds: 0 
    })
    await db.collection('users').createIndex({ lastRevenueCatSync: 1 })

    console.log('✅ Collection users creada con índices')

    // ================================
    // COLLECTION: CONVERSATIONS
    // ================================
    await db.createCollection('conversations', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'personId', 'title', 'createdAt', 'currentStage'],
          properties: {
            userId: {
              bsonType: 'string',
              description: 'ID del usuario'
            },
            personId: {
              bsonType: 'string',
              description: 'ID del perfil de persona'
            },
            title: {
              bsonType: 'string',
              description: 'Título de la conversación'
            },
            currentStage: {
              bsonType: 'string',
              enum: ['denial', 'anger', 'bargaining', 'depression', 'acceptance'],
              description: 'Etapa emocional actual'
            },
            aiEnabled: {
              bsonType: 'bool',
              description: 'Si la IA está habilitada'
            },
            isVectorized: {
              bsonType: 'bool',
              description: 'Si la conversación está vectorizada'
            }
          }
        }
      }
    })

    // Índices para conversations
    await db.collection('conversations').createIndex({ userId: 1 })
    await db.collection('conversations').createIndex({ personId: 1 })
    await db.collection('conversations').createIndex({ userId: 1, isActive: 1 })
    await db.collection('conversations').createIndex({ userId: 1, isArchived: 1 })
    await db.collection('conversations').createIndex({ userId: 1, isBurned: 1 })
    await db.collection('conversations').createIndex({ lastMessageAt: -1 })
    await db.collection('conversations').createIndex({ currentStage: 1 })
    await db.collection('conversations').createIndex({ aiEnabled: 1 })
    await db.collection('conversations').createIndex({ isVectorized: 1 })

    console.log('✅ Collection conversations creada con índices')

    // ================================
    // COLLECTION: MESSAGES
    // ================================
    await db.createCollection('messages', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['conversationId', 'userId', 'content', 'messageType', 'createdAt'],
          properties: {
            conversationId: {
              bsonType: 'string',
              description: 'ID de la conversación'
            },
            userId: {
              bsonType: 'string',
              description: 'ID del usuario'
            },
            content: {
              bsonType: 'string',
              description: 'Contenido cifrado del mensaje'
            },
            messageType: {
              bsonType: 'string',
              enum: ['user', 'ai', 'system'],
              description: 'Tipo de mensaje'
            },
            isVectorized: {
              bsonType: 'bool',
              description: 'Si el mensaje está vectorizado'
            }
          }
        }
      }
    })

    // Índices para messages
    await db.collection('messages').createIndex({ conversationId: 1 })
    await db.collection('messages').createIndex({ userId: 1 })
    await db.collection('messages').createIndex({ conversationId: 1, createdAt: 1 })
    await db.collection('messages').createIndex({ messageType: 1 })
    await db.collection('messages').createIndex({ isDeleted: 1 })
    await db.collection('messages').createIndex({ isVectorized: 1 })
    await db.collection('messages').createIndex({ contentHash: 1 })

    console.log('✅ Collection messages creada con índices')

    // ================================
    // COLLECTION: CONVERSATION_VECTORS
    // ================================
    await db.createCollection('conversation_vectors', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['conversationId', 'userId', 'content', 'vector'],
          properties: {
            conversationId: {
              bsonType: 'string',
              description: 'ID de la conversación'
            },
            userId: {
              bsonType: 'string',
              description: 'ID del usuario'
            },
            content: {
              bsonType: 'string',
              description: 'Contenido cifrado'
            },
            vector: {
              bsonType: 'array',
              description: 'Vector de embeddings'
            }
          }
        }
      }
    })

    // Índices para conversation_vectors
    await db.collection('conversation_vectors').createIndex({ conversationId: 1 })
    await db.collection('conversation_vectors').createIndex({ userId: 1 })
    await db.collection('conversation_vectors').createIndex({ 'metadata.stage': 1 })
    await db.collection('conversation_vectors').createIndex({ 'metadata.createdAt': -1 })
    await db.collection('conversation_vectors').createIndex({ 'metadata.emotionalScore': 1 })
    await db.collection('conversation_vectors').createIndex({ 'metadata.keywords': 1 })

    console.log('✅ Collection conversation_vectors creada con índices')

    // ================================
    // COLLECTION: PERSON_PROFILES
    // ================================
    await db.createCollection('person_profiles', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'name', 'relationship'],
          properties: {
            userId: {
              bsonType: 'string',
              description: 'ID del usuario'
            },
            name: {
              bsonType: 'string',
              description: 'Nombre de la persona'
            },
            relationship: {
              bsonType: 'string',
              enum: ['ex-partner', 'friend', 'family', 'colleague', 'stranger', 'self', 'other'],
              description: 'Tipo de relación'
            }
          }
        }
      }
    })

    // Índices para person_profiles
    await db.collection('person_profiles').createIndex({ userId: 1 })
    await db.collection('person_profiles').createIndex({ relationship: 1 })
    await db.collection('person_profiles').createIndex({ isActive: 1 })
    await db.collection('person_profiles').createIndex({ tags: 1 })

    console.log('✅ Collection person_profiles creada con índices')

    // ================================
    // COLLECTION: NOTIFICATION_SETTINGS
    // ================================
    await db.createCollection('notification_settings', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId'],
          properties: {
            userId: {
              bsonType: 'string',
              description: 'ID del usuario'
            }
          }
        }
      }
    })

    // Índices para notification_settings
    await db.collection('notification_settings').createIndex({ userId: 1 }, { unique: true })

    console.log('✅ Collection notification_settings creada con índices')

    // ================================
    // COLLECTION: MYSTERIOUS_FRAGMENTS
    // ================================
    await db.createCollection('mysterious_fragments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'content', 'stage', 'type'],
          properties: {
            userId: {
              bsonType: 'string',
              description: 'ID del usuario'
            },
            content: {
              bsonType: 'string',
              description: 'Contenido del fragmento'
            },
            stage: {
              bsonType: 'string',
              enum: ['denial', 'anger', 'bargaining', 'depression', 'acceptance'],
              description: 'Etapa emocional'
            },
            type: {
              bsonType: 'string',
              enum: ['notification', 'in_app', 'daily_fragment'],
              description: 'Tipo de fragmento'
            }
          }
        }
      }
    })

    // Índices para mysterious_fragments
    await db.collection('mysterious_fragments').createIndex({ userId: 1 })
    await db.collection('mysterious_fragments').createIndex({ stage: 1 })
    await db.collection('mysterious_fragments').createIndex({ type: 1 })
    await db.collection('mysterious_fragments').createIndex({ shownAt: -1 })
    await db.collection('mysterious_fragments').createIndex({ wasRead: 1 })

    console.log('✅ Collection mysterious_fragments creada con índices')

    // ================================
    // COLLECTION: USER_STATS
    // ================================
    await db.createCollection('user_stats', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId'],
          properties: {
            userId: {
              bsonType: 'string',
              description: 'ID del usuario'
            }
          }
        }
      }
    })

    // Índices para user_stats
    await db.collection('user_stats').createIndex({ userId: 1 }, { unique: true })
    await db.collection('user_stats').createIndex({ subscriptionPlan: 1 })
    await db.collection('user_stats').createIndex({ lastActiveDate: -1 })

    console.log('✅ Collection user_stats creada con índices')

    console.log('🎉 Base de datos Unsent inicializada exitosamente!')
    console.log('📊 Collections creadas:')
    console.log('  - users (gestión de usuarios y suscripciones)')
    console.log('  - conversations (conversaciones cifradas)')
    console.log('  - messages (mensajes cifrados)')
    console.log('  - conversation_vectors (vectorización para RAG)')
    console.log('  - person_profiles (perfiles de personas)')
    console.log('  - notification_settings (configuración de notificaciones)')
    console.log('  - mysterious_fragments (fragmentos misteriosos)')
    console.log('  - user_stats (estadísticas de usuarios)')
    console.log('')
    console.log('🔐 Características del sistema:')
    console.log('  - Cifrado de conversaciones por usuario')
    console.log('  - Vectorización RAG para contexto de IA')
    console.log('  - 4 planes de suscripción con nombres espirituales')
    console.log('  - Límites de chats de IA por plan')
    console.log('  - Sistema de pagos con RevenueCat')
    console.log('')
    console.log('💰 Planes de suscripción:')
    console.log('  - Whisper of Dawn (Gratuito - 7 días - 1 chat IA)')
    console.log('  - Mirror of Reflection (8€ - 30 días - 1 chat IA)')
    console.log('  - Journey to the Depths (10€ - 30 días - 3 chats IA)')
    console.log('  - Path to Transcendence (30€ - 30 días - 15 chats IA)')
    console.log('')
    console.log('🔗 RevenueCat Integration:')
    console.log('  - Webhooks configurados para eventos de suscripción')
    console.log('  - Sincronización automática de estados de pago')
    console.log('  - IDs de usuario vinculados con RevenueCat')
  })
}

/**
 * Verifica si la base de datos está correctamente inicializada
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean
  collections: string[]
  issues: string[]
}> {
  return withUnsentDB(async (db) => {
    const issues: string[] = []
    
    // Obtener todas las collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c: any) => c.name)
    
    // Collections requeridas (sin payment_records)
    const requiredCollections = [
      'users',
      'conversations',
      'messages',
      'conversation_vectors',
      'person_profiles',
      'notification_settings',
      'mysterious_fragments',
      'user_stats'
    ]
    
    // Verificar que existan todas las collections
    for (const required of requiredCollections) {
      if (!collectionNames.includes(required)) {
        issues.push(`Missing collection: ${required}`)
      }
    }
    
    // Verificar índices críticos
    try {
      const userIndexes = await db.collection('users').indexes()
      const hasEmailIndex = userIndexes.some((index: any) => 
        index.key.email && index.unique
      )
      if (!hasEmailIndex) {
        issues.push('Missing unique email index on users collection')
      }

      const hasRevenueCatIndex = userIndexes.some((index: any) => 
        index.key.revenueCatUserId && index.unique
      )
      if (!hasRevenueCatIndex) {
        issues.push('Missing unique revenueCatUserId index on users collection')
      }
    } catch (error) {
      issues.push('Error checking users indexes')
    }
    
    return {
      isHealthy: issues.length === 0,
      collections: collectionNames,
      issues
    }
  })
}

/**
 * Reinicia la base de datos (PELIGROSO - solo para desarrollo)
 */
export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production')
  }
  
  return withUnsentDB(async (db) => {
    console.log('⚠️  REINICIANDO BASE DE DATOS...')
    
    // Obtener todas las collections
    const collections = await db.listCollections().toArray()
    
    // Eliminar todas las collections
    for (const collection of collections) {
      await db.collection(collection.name).drop()
      console.log(`🗑️  Collection ${collection.name} eliminada`)
    }
    
    // Reinicializar
    await initializeUnsentDatabase()
    
    console.log('✅ Base de datos reiniciada exitosamente')
  })
} 