'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/AuthContext'
import ChatInterface from '@/components/ChatInterface'
import { getStageColor, EmotionStage } from '@/lib/emotionStages'

interface Message {
  id: string
  content: string
  timestamp: Date
  emotionalAnalysis: {
    score: number
    stage: EmotionStage
    intensity: number
    keywords: string[]
  }
  timeSpent: number
  isUser?: boolean
  emotionalScore?: number
  stage?: string
}

interface Conversation {
  id: string
  title?: string
  recipientName?: string
  messages: Message[]
  emotionalScore: number
  stage: string
  isAIEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const conversationId = params.id as string

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    loadConversation()
  }, [conversationId, user, authLoading])

  const loadConversation = async () => {
    try {
      setLoading(true)
      setError(null)

      // First try to get from localStorage to get recipient name
      const localStorageKey = `unsent_conversation_${conversationId}`
      const localData = localStorage.getItem(localStorageKey)
      let localConversation = null
      
      if (localData) {
        try {
          localConversation = JSON.parse(localData)
        } catch (parseError) {
          console.error('Error parsing local conversation:', parseError)
        }
      }

      // Try to get from our API (which will auto-create if needed)
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'x-user-id': user?.id || 'demo-user'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.conversation) {
          const apiConversation = data.conversation
          
          // Merge local data with API data, preferring local recipient name if available
          const mergedConversation: Conversation = {
            id: apiConversation.id,
            title: localConversation?.title || apiConversation.title || `To: ${localConversation?.recipient || apiConversation.recipientName || 'Someone'}`,
            recipientName: localConversation?.recipient || apiConversation.recipientName || 'Someone',
            messages: apiConversation.messages || [],
            emotionalScore: apiConversation.emotionalScore || 0,
            stage: apiConversation.stage || 'denial',
            isAIEnabled: apiConversation.isAIEnabled || false,
            createdAt: new Date(apiConversation.createdAt),
            updatedAt: new Date(apiConversation.updatedAt)
          }
          
          setConversation(mergedConversation)
          
          // Update localStorage with the merged data
          localStorage.setItem(localStorageKey, JSON.stringify({
            ...localConversation,
            ...mergedConversation,
            recipient: mergedConversation.recipientName
          }))
          
          return
        }
      }

      // If API fails but we have local data, use it
      if (localConversation) {
        console.log('Using local conversation data for ID:', conversationId)
        
        const conversation: Conversation = {
          id: conversationId,
          title: localConversation.title || `To: ${localConversation.recipient || 'Someone'}`,
          recipientName: localConversation.recipient || 'Someone',
          messages: (localConversation.messages || []).map((msg: any) => ({
            ...msg,
            emotionalAnalysis: msg.emotionalAnalysis || {
              score: msg.emotionalScore || 0,
              stage: msg.stage || 'denial',
              intensity: 0,
              keywords: []
            },
            timeSpent: msg.timeSpent || 0
          })),
          emotionalScore: localConversation.emotionalScore || 0,
          stage: (localConversation.emotionalStage === 'fog' ? 'denial' : localConversation.emotionalStage) || localConversation.stage || 'denial',
          isAIEnabled: localConversation.isAIEnabled || false,
          createdAt: new Date(localConversation.createdAt || Date.now()),
          updatedAt: new Date(localConversation.updatedAt || Date.now())
        }
        
        setConversation(conversation)
        return
      }

      // If no local data and API fails, create a basic conversation
      console.log('Creating new conversation for ID:', conversationId)
      
      const fallbackConversation: Conversation = {
        id: conversationId,
        title: 'New Conversation',
        recipientName: 'Someone',
        messages: [],
        emotionalScore: 0,
        stage: 'denial',
        isAIEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setConversation(fallbackConversation)
      
      // Save to localStorage
      localStorage.setItem(localStorageKey, JSON.stringify({
        ...fallbackConversation,
        recipient: fallbackConversation.recipientName
      }))

    } catch (error: any) {
      console.error('Error loading conversation:', error)
      
      // Even if there's an error, create a basic conversation
      const fallbackConversation: Conversation = {
        id: conversationId,
        title: 'New Conversation',
        recipientName: 'Someone',
        messages: [],
        emotionalScore: 0,
        stage: 'denial',
        isAIEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setConversation(fallbackConversation)
      setError(null) // Clear error since we provided a fallback
    } finally {
      setLoading(false)
    }
  }

  const handleNewMessage = (content: string, apiResponse?: any) => {
    if (!conversation) return

    // Create a temporary message for immediate UI feedback
    const tempMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      emotionalAnalysis: {
        score: 0,
        stage: 'denial' as EmotionStage,
        intensity: 0,
        keywords: []
      },
      timeSpent: 0
    }

    // Update local state immediately for responsive UI
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, tempMessage],
      updatedAt: new Date()
    }

    setConversation(updatedConversation)

    // Update conversation with server response if available
    if (apiResponse?.conversation) {
      setConversation(prev => prev ? {
        ...prev,
        emotionalScore: apiResponse.conversation.emotionalScore,
        stage: apiResponse.conversation.stage
      } : prev)
    }

    // Save to localStorage (ChatInterface handles the API call)
    localStorage.setItem(
      `unsent_conversation_${conversationId}`,
      JSON.stringify(updatedConversation)
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Conversation</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/conversations')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Conversations
            </button>
            <button
              onClick={() => loadConversation()}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-white mb-2">Conversation Not Found</h1>
          <p className="text-gray-400 mb-6">This conversation doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/conversations')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Conversations
          </button>
        </div>
      </div>
    )
  }

  const stageColor = getStageColor(conversation.stage as EmotionStage)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/conversations')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {conversation.title || `To: ${conversation.recipientName}`}
                </h1>
                <p className="text-sm text-gray-400">
                  {conversation.messages.length} messages • Stage: 
                  <span className="ml-1" style={{ color: stageColor }}>
                    {conversation.stage}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {conversation.isAIEnabled && (
                <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                  AI Active
                </span>
              )}
              
              <div className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                Score: {conversation.emotionalScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto">
        <ChatInterface
          conversationId={conversationId}
          messages={conversation.messages}
          onNewMessage={handleNewMessage}
          recipientName={conversation.recipientName || 'Someone'}
          currentStage={conversation.stage}
          isAIEnabled={conversation.isAIEnabled}
        />
      </div>
    </div>
  )
} 