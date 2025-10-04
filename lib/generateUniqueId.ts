import { ObjectId } from 'mongodb'

/**
 * Genera un ID único para conversaciones
 */
export function generateUniqueConversationId(): string {
  // Usar timestamp + random para garantizar unicidad
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `conv_${timestamp}_${random}`
}

/**
 * Genera un ObjectId como string
 */
export function generateObjectIdString(): string {
  return new ObjectId().toString()
}

/**
 * Valida si un string es un ObjectId válido de MongoDB
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Genera un ID único basado en timestamp (más legible)
 */
export function generateTimestampId(): string {
  return Date.now().toString()
}

/**
 * Genera un ID de sesión único
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
} 