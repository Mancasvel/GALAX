# Persistent Conversation System - Unsent

This system enables continuous and contextual conversations with AI personas representing people in your life, storing the complete history in MongoDB.

## ✨ Key Features

- 🔄 **Persistent History**: All conversations are automatically saved
- 📊 **Smart Limits**: Maximum 20 messages to optimize performance
- 👤 **Multi-User**: Support for authenticated and anonymous users
- 🔒 **Secure**: Efficient handling of multiple simultaneous users
- 🧹 **Auto-Cleanup**: Automatically removes old conversations
- 🎯 **Emotional Journey**: Progress tracking through 5 emotional stages
- 💌 **Person Profiles**: AI responds as specific people based on relationship context

## 🏗️ Arquitectura del Sistema

```
Frontend (React Hooks) ↔ API Routes ↔ MongoDB Collections
```

### Flujo de Conversación:
1. **Usuario envía mensaje** → Hook `sendMessage()`
2. **Recuperar historial** → MongoDB query con límite
3. **Procesar con LLM** → OpenRouter API con contexto completo
4. **Guardar intercambio** → MongoDB insert con timestamp
5. **Retornar respuesta** → UI actualizada con respuesta personalizada

## 📦 Instalación y Configuración

### 1. Variables de Entorno
```env
# .env.local
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### 2. Base de Datos
El sistema creará automáticamente la colección `conversations` con este esquema:

```typescript
interface Conversation {
  _id: string
  userId?: string          // Para usuarios autenticados
  sessionId?: string       // Para usuarios anónimos
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: {
    personProfile?: any
    lastQuery?: string
  }
}

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
}
```

## 🚀 Uso en el Frontend

### Ejemplo Básico - Usuario Anónimo

```tsx
// components/ChatComponent.tsx
import { useSessionConversation } from '@/lib/useConversation'

export default function ChatComponent() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation
  } = useSessionConversation()

  const handleSendMessage = async (message: string) => {
    await sendMessage(message, {
      onSuccess: (response) => {
        console.log('Respuesta recibida:', response)
      },
      onError: (error) => {
        console.error('Error:', error)
      }
    })
  }

  return (
    <div className="chat-container">
      {/* Historial de mensajes */}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {/* Input para nuevo mensaje */}
      <MessageInput 
        onSend={handleSendMessage}
        isLoading={isLoading}
        disabled={isLoading}
      />

      {/* Botón para limpiar conversación */}
      <button onClick={clearConversation}>
        Nueva Conversación
      </button>

      {error && <div className="error">{error}</div>}
    </div>
  )
}
```

### Advanced Example - Authenticated User with Person Profile

```tsx
// components/PersonChatComponent.tsx
import { useUserConversation } from '@/lib/useConversation'
import { useAuth } from '@/lib/AuthContext'

export default function PersonChatComponent() {
  const { user } = useAuth()
  const [personProfile, setPersonProfile] = useState(null)
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    getConversationSummary,
    conversationId
  } = useUserConversation(user?.id || '', true)

  // Load selected person profile
  useEffect(() => {
    if (user?.id) {
      loadPersonProfile(user.id).then(setPersonProfile)
    }
  }, [user])

  const handleSendMessage = async (message: string) => {
    if (!personProfile) {
      alert('First select who you\'re writing to')
      return
    }

    const response = await sendMessage(message, {
      personProfile,
      onSuccess: (data) => {
        // Handle specific person response
        if (data.personResponse?.content) {
          console.log(`${personProfile.name} responded:`, data.personResponse.content)
        }
      }
    })

    return response
  }

  const summary = getConversationSummary()

  return (
    <div className="person-chat">
      {/* Header with person information */}
      {personProfile && (
        <div className="person-header">
          <h3>Writing to {personProfile.name}</h3>
          <p>{personProfile.relationship} • {personProfile.context}</p>
          <small>Messages: {summary.totalMessages}</small>
        </div>
      )}

      {/* Chat messages with emotional styling */}
      <div className="emotion-messages">
        {messages.map((msg, index) => (
          <EmotionalMessageBubble 
            key={index}
            message={msg}
            person={personProfile}
            isFromPerson={msg.role === 'assistant'}
          />
        ))}
      </div>

      {/* Input specialized for emotional writing */}
      <EmotionalMessageInput 
        onSend={handleSendMessage}
        isLoading={isLoading}
        person={personProfile}
        placeholder={`Write your unsent message to ${personProfile?.name}...`}
      />
    </div>
  )
}
```

### Ejemplo de Chat en Tiempo Real

```tsx
// components/RealtimePetChat.tsx
import { useState, useEffect } from 'react'
import { useSessionConversation } from '@/lib/useConversation'

export default function RealtimePetChat() {
  const {
    messages,
    isLoading,
    sendMessage,
    loadConversationHistory
  } = useSessionConversation()

  const [currentMessage, setCurrentMessage] = useState('')

  // Efecto para scroll automático a nuevos mensajes
  useEffect(() => {
    const container = document.getElementById('messages-container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  const handleQuickMessage = async (quickMessage: string) => {
    await sendMessage(quickMessage, {
      onSuccess: (response) => {
        // Mostrar notificación de respuesta
        if (response.petVoiceResponse?.hasRegisteredPet) {
          showPetNotification(response.petVoiceResponse)
        }
      }
    })
  }

  const quickMessages = [
    "¿Cómo estás hoy?",
    "¿Qué necesitas para estar mejor?",
    "Cuéntame sobre tu día",
    "¿Tienes hambre?",
    "¿Quieres jugar?"
  ]

  return (
    <div className="realtime-chat">
      {/* Botones de mensajes rápidos */}
      <div className="quick-messages">
        {quickMessages.map((msg, index) => (
          <button
            key={index}
            onClick={() => handleQuickMessage(msg)}
            disabled={isLoading}
            className="quick-msg-btn"
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Contenedor de mensajes con scroll */}
      <div id="messages-container" className="messages-scroll">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.role}`}
          >
            <div className="message-content">
              {message.role === 'assistant' ? (
                <PetResponseRenderer content={message.content} />
              ) : (
                <UserMessageRenderer content={message.content} />
              )}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && <TypingIndicator />}
      </div>

      {/* Input con funciones avanzadas */}
      <form onSubmit={(e) => {
        e.preventDefault()
        if (currentMessage.trim()) {
          sendMessage(currentMessage)
          setCurrentMessage('')
        }
      }}>
        <div className="input-container">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={isLoading || !currentMessage.trim()}
            className="send-button"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
```

## 🔧 API Endpoints

### POST `/api/parse`
Procesa un mensaje y mantiene el contexto de conversación.

```typescript
// Request
{
  query: string,           // Mensaje del usuario
  userPet?: object,        // Información de la mascota
  userId?: string,         // ID del usuario autenticado
  sessionId?: string       // ID de sesión para anónimos
}

// Response
{
  recommendations: Array,
  petVoiceResponse?: {
    hasRegisteredPet: boolean,
    petName: string,
    voiceMessage: string,
    emotionalTone: string
  },
  summary: string,
  total: number,
  conversationSaved: boolean
}
```

### GET `/api/conversation`
Obtiene historial de conversación.

```typescript
// Query params: userId o sessionId
// Response
{
  conversation: {
    id: string,
    createdAt: Date,
    updatedAt: Date,
    metadata: object
  },
  messages: ConversationMessage[],
  total: number
}
```

### DELETE `/api/conversation`
Limpia conversaciones antiguas (admin).

```typescript
// Query params: days (opcional, default: 30)
// Response
{
  success: boolean,
  deletedConversations: number,
  message: string
}
```

## 🎯 Casos de Uso Reales

### 1. Consulta Veterinaria Continua
```tsx
// El usuario puede hacer seguimiento a problemas de salud
const { sendMessage } = useUserConversation(userId)

// Primera consulta
await sendMessage("Mi perro Max está cojeando de la pata trasera")

// Días después, continúa la conversación
await sendMessage("Max sigue cojeando, ¿debería llevarlo al vet?")
// El sistema recuerda el contexto anterior
```

### 2. Entrenamiento Progresivo
```tsx
// Seguimiento de progreso en entrenamiento
await sendMessage("Quiero enseñar a sentarse a mi cachorro")
// ... después de una semana ...
await sendMessage("Ya aprendió a sentarse, ¿qué sigue?")
// El sistema sabe que es el mismo cachorro y su progreso
```

### 3. Monitoreo Nutricional
```tsx
// Conversación sobre alimentación
await sendMessage("Mi gato come mucho pero está perdiendo peso")
// ... seguimiento semanal ...
await sendMessage("Cambié su comida como dijiste, ¿cómo evalúo mejoras?")
```

## ⚡ Optimizaciones y Rendimiento

### Límite de Mensajes
- **Automático**: El sistema mantiene máximo 20 mensajes
- **Inteligente**: Preserva mensajes del sistema importantes
- **Eficiente**: Reduce tokens enviados a la API

### Caché y Velocidad
```typescript
// El hook implementa caché inteligente
const { messages } = useConversation({
  userId: 'user123',
  autoLoad: true  // Carga historial automáticamente
})
```

### Manejo de Errores
```typescript
const { error, sendMessage } = useConversation()

await sendMessage("Mensaje", {
  onError: (error) => {
    // Manejar errores de red, API, etc.
    showNotification(error, 'error')
  }
})
```

## 🧹 Mantenimiento

### Limpieza Automática
```bash
# Limpiar conversaciones de más de 30 días
curl -X DELETE "/api/conversation?days=30"
```

### Estadísticas
```bash
# Obtener stats del sistema
curl -X POST "/api/conversation"
```

### Monitoreo
```typescript
// En el componente
const stats = getConversationStats()
console.log('Total mensajes:', stats.totalMessages)
console.log('Conversación activa:', stats.hasConversation)
```

## 🔒 Seguridad y Privacidad

- ✅ **Identificación Segura**: userId o sessionId requeridos
- ✅ **Datos Encriptados**: MongoDB con TLS
- ✅ **Auto-limpieza**: Conversaciones antiguas se eliminan
- ✅ **Sin Datos Sensibles**: Solo se guarda contexto necesario
- ✅ **Aislamiento**: Cada usuario/sesión está aislado

## 🚨 Troubleshooting

### Problema: Conversación no se guarda
```typescript
// Verificar que se envíen identificadores
const response = await fetch('/api/parse', {
  body: JSON.stringify({
    query: "mensaje",
    userId: "user123", // ← Requerido
    // O sessionId: "session_xyz"
  })
})
```

### Problema: Historial perdido
```typescript
// Cargar manualmente si autoLoad falla
const { loadConversationHistory } = useConversation()
await loadConversationHistory()
```

### Problema: Error de conexión MongoDB
```bash
# Verificar variables de entorno
echo $MONGODB_URI
echo $OPENROUTER_API_KEY
```

Este sistema proporciona una base sólida para conversaciones persistentes que mejoran significativamente la experiencia del usuario en Unsent. 💫✨ 