import { useState, useEffect, useCallback } from 'react'
import { callOpenRouter } from './openrouter'
import { 
  encryptMessage, 
  decryptMessage, 
  generateSessionKey, 
  extractBehavioralPatterns, 
  analyzeDigitalExhaust,
  type DigitalExhaust 
} from './encryption'
import { PersonProfile } from './types'

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  emotionalStage?: string
  stageColor?: string
  encryptedContent?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  recipientProfile?: PersonProfile
  currentStage: string
  lastActive: Date
  isCompleted: boolean
  digitalExhaust?: DigitalExhaust
  behavioralProfile?: {
    psychologicalProfile: string
    emotionalState: string
    behavioralPatterns: string[]
    recommendations: string[]
  }
}

// Behavioral tracking for ARG elements
interface InteractionEvent {
  type: string
  timestamp: number
  metadata: any
}

export function useConversation(conversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // ARG behavioral tracking
  const [interactionEvents, setInteractionEvents] = useState<InteractionEvent[]>([])
  const [typingSpeed, setTypingSpeed] = useState<number>(0)
  const [pauseCount, setPauseCount] = useState<number>(0)
  const [deleteCount, setDeleteCount] = useState<number>(0)
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())
  const [lastTypingTime, setLastTypingTime] = useState<number>(0)
  const [isTracking, setIsTracking] = useState<boolean>(true)

  // Session encryption key (never sent to server)
  const [sessionKey] = useState(() => generateSessionKey())

  // Track behavioral patterns for ARG
  const trackInteraction = useCallback((type: string, metadata: any = {}) => {
    if (!isTracking) return
    
    const event: InteractionEvent = {
      type,
      timestamp: Date.now(),
      metadata
    }
    
    setInteractionEvents(prev => [...prev, event])
    
    // Real-time pattern analysis for ARG effect
    if (type === 'typing') {
      const now = Date.now()
      if (lastTypingTime > 0) {
        const timeDiff = now - lastTypingTime
        const newSpeed = 1000 / timeDiff // characters per second
        setTypingSpeed(prev => (prev + newSpeed) / 2) // running average
      }
      setLastTypingTime(now)
    } else if (type === 'pause') {
      setPauseCount(prev => prev + 1)
    } else if (type === 'delete') {
      setDeleteCount(prev => prev + 1)
    }
  }, [isTracking, lastTypingTime])

  // Analyze digital exhaust periodically for ARG insights
  useEffect(() => {
    const interval = setInterval(() => {
      if (interactionEvents.length > 10) {
        const exhaust = extractBehavioralPatterns(interactionEvents)
        const profile = analyzeDigitalExhaust(exhaust)
        
        // Update current conversation with behavioral insights
        if (currentConversation) {
          setCurrentConversation(prev => prev ? {
            ...prev,
            digitalExhaust: exhaust,
            behavioralProfile: profile
          } : null)
        }
        
        // Clear old events to prevent memory bloat
        setInteractionEvents(prev => prev.slice(-50))
      }
    }, 30000) // Analyze every 30 seconds
    
    return () => clearInterval(interval)
  }, [interactionEvents, currentConversation])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
    
    // Track session start
    trackInteraction('session_start', {
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      timeOfDay: new Date().getHours()
    })
    
    setSessionStartTime(Date.now())
    
    return () => {
      // Track session end
      trackInteraction('session_end', {
        duration: Date.now() - sessionStartTime,
        eventCount: interactionEvents.length
      })
    }
  }, [])

  // Load specific conversation if ID provided
  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setCurrentConversation(conversation)
        trackInteraction('conversation_opened', { conversationId })
      }
    }
  }, [conversationId, conversations])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      
      // Try to load from API first
      const response = await fetch('/api/conversations', {
        headers: {
          'x-user-id': 'demo-user' // In production, use proper auth
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const conversations = data.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          messages: [], // Messages will be loaded when conversation is opened
          recipientProfile: conv.recipientProfile,
          currentStage: conv.currentStage,
          lastActive: new Date(conv.lastActive),
          isCompleted: conv.isCompleted,
          digitalExhaust: conv.digitalExhaust,
          behavioralProfile: conv.behavioralProfile
        }))
        setConversations(conversations)
      } else {
        // Fallback to localStorage for backward compatibility
        const saved = localStorage.getItem('unsent_conversations')
        if (saved) {
          const parsed = JSON.parse(saved)
          const decryptedConversations = parsed.map((conv: any) => ({
            ...conv,
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              content: msg.encryptedContent ? 
                decryptMessage(msg.encryptedContent, sessionKey) : 
                msg.content,
              timestamp: new Date(msg.timestamp)
            })),
            lastActive: new Date(conv.lastActive)
          }))
          setConversations(decryptedConversations)
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      setError('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const saveConversations = async (convs: Conversation[]) => {
    try {
      // For now, just update local state
      // Individual messages are saved via API in sendMessage
      setConversations(convs)
      
      // Fallback to localStorage for backward compatibility
      const encryptedConversations = convs.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => ({
          ...msg,
          content: '[ENCRYPTED]', // Never store plain content
          encryptedContent: encryptMessage(msg.content, sessionKey),
          timestamp: msg.timestamp.toISOString()
        })),
        lastActive: conv.lastActive.toISOString()
      }))
      
      localStorage.setItem('unsent_conversations', JSON.stringify(encryptedConversations))
    } catch (error) {
      console.error('Error saving conversations:', error)
      setError('Failed to save conversation')
    }
  }

  const createConversation = async (title: string, recipientProfile?: PersonProfile): Promise<string> => {
    try {
      // Create conversation via API
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          title,
          recipientProfile
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const conversationId = data.id
        
        // Create local conversation object
        const newConversation: Conversation = {
          id: conversationId,
          title,
          messages: [],
          recipientProfile,
          currentStage: 'static',
          lastActive: new Date(),
          isCompleted: false
        }
        
        // Add to local state
        setConversations(prev => [...prev, newConversation])
        setCurrentConversation(newConversation)
        
        trackInteraction('conversation_created', {
          conversationId,
          title,
          hasRecipient: !!recipientProfile
        })
        
        return conversationId
      } else {
        throw new Error('Failed to create conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      setError('Failed to create conversation')
      
      // Fallback to local creation
      const newConversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        messages: [],
        recipientProfile,
        currentStage: 'static',
        lastActive: new Date(),
        isCompleted: false
      }
      
      setConversations(prev => [...prev, newConversation])
      setCurrentConversation(newConversation)
      
      trackInteraction('conversation_created', {
        conversationId: newConversation.id,
        title,
        hasRecipient: !!recipientProfile
      })
      
      return newConversation.id
    }
  }

  const sendMessage = async (content: string): Promise<void> => {
    if (!currentConversation || !content.trim()) return

    try {
      setIsLoading(true)
      setError(null)

      // Track message composition behavior
      trackInteraction('message_sent', {
        length: content.length,
        wordCount: content.split(' ').length,
        compositionTime: Date.now() - lastTypingTime,
        deleteCount,
        pauseCount
      })

      const userMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        isUser: true,
        timestamp: new Date()
      }

      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        lastActive: new Date()
      }

      // Get AI response if this is a premium conversation
      const isPremium = currentConversation.recipientProfile !== undefined
      
      if (isPremium) {
        trackInteraction('ai_response_requested', {
          messageCount: updatedConversation.messages.length,
          conversationAge: Date.now() - new Date(currentConversation.lastActive).getTime()
        })

        const aiResponse = await callOpenRouter(
          content,
          updatedConversation.messages.slice(-5), // Last 5 messages for context
          currentConversation.recipientProfile
        )

        if (aiResponse) {
          const responseMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: aiResponse.personResponse.content,
            isUser: false,
            timestamp: new Date(),
            emotionalStage: aiResponse.emotionalAnalysis.detectedStage,
            stageColor: aiResponse.personResponse.stage_color
          }

          updatedConversation.messages.push(responseMessage)
          updatedConversation.currentStage = aiResponse.emotionalAnalysis.detectedStage

          trackInteraction('ai_response_received', {
            stage: aiResponse.emotionalAnalysis.detectedStage,
            intensity: aiResponse.emotionalAnalysis.intensity,
            responseLength: responseMessage.content.length
          })
        }
      }

      // Update conversations
      const allConversations = conversations.map(c => 
        c.id === currentConversation.id ? updatedConversation : c
      )
      
      saveConversations(allConversations)
      setCurrentConversation(updatedConversation)

      // Reset composition tracking
      setDeleteCount(0)
      setPauseCount(0)

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(c => c.id !== id)
    saveConversations(updatedConversations)
    
    if (currentConversation?.id === id) {
      setCurrentConversation(null)
    }
    
    trackInteraction('conversation_deleted', { id })
  }

  const completeConversation = (id: string, method: 'burn' | 'archive' = 'archive') => {
    const updatedConversations = conversations.map(c => 
      c.id === id ? { ...c, isCompleted: true } : c
    )
    saveConversations(updatedConversations)
    
    trackInteraction('conversation_completed', { 
      id, 
      method,
      messageCount: currentConversation?.messages.length || 0,
      finalStage: currentConversation?.currentStage
    })
  }

  // ARG insights for users to see how they're being "watched"
  const getBehavioralInsights = () => {
    if (interactionEvents.length < 5) return null
    
    const exhaust = extractBehavioralPatterns(interactionEvents)
    const profile = analyzeDigitalExhaust(exhaust)
    
    return {
      ...profile,
      rawData: {
        avgTypingSpeed: typingSpeed.toFixed(2),
        totalPauses: pauseCount,
        totalDeletions: deleteCount,
        sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000),
        interactionCount: interactionEvents.length
      },
      algorithmInsights: [
        `Your typing rhythm suggests ${profile.emotionalState} emotional state`,
        `Pattern classification: ${profile.psychologicalProfile}`,
        `Behavioral markers detected: ${profile.behavioralPatterns.length}`,
        `The algorithm confidence level: ${Math.floor(Math.random() * 40 + 60)}%`
      ]
    }
  }

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    createConversation,
    sendMessage,
    deleteConversation,
    completeConversation,
    setCurrentConversation,
    
    // ARG behavioral tracking
    trackInteraction,
    getBehavioralInsights,
    setIsTracking,
    digitalExhaust: currentConversation?.digitalExhaust,
    behavioralProfile: currentConversation?.behavioralProfile,
    
    // Real-time stats for ARG effect
    realTimeStats: {
      typingSpeed: typingSpeed.toFixed(2),
      pauseCount,
      deleteCount,
      sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000),
      eventCount: interactionEvents.length
    }
  }
}

/**
 * Hook for authenticated user conversations
 */
export function useUserConversation(userId: string, autoLoad = true) {
  return useConversation()
}

/**
 * Hook for anonymous session conversations
 */
export function useSessionConversation(autoLoad = true) {
  return useConversation()
} 