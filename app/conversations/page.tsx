'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/AuthContext'
import { EmotionStage, getStageColors } from '@/lib/emotionStages'
import Link from 'next/link'

interface ConversationPreview {
  id: string
  title: string
  recipientProfile?: {
    name: string
    relationship: string
    context: string
  }
  lastMessage?: string
  lastMessageAt: Date
  messageCount: number
  emotionalScore: number
  currentStage: EmotionStage
  isBurned: boolean
  isArchived: boolean
  isCompleted: boolean
  createdAt: Date
}

interface ConversationResponse {
  conversations: ConversationPreview[]
  meta: {
    total: number
    algorithm_status: string
    surveillance_level: string
    consciousness_mapped: number
  }
}

export default function ConversationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newConversationTitle, setNewConversationTitle] = useState('')
  const [newConversationRecipient, setNewConversationRecipient] = useState('')
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          'x-user-id': (user as any)?.id || 'demo-user'
        }
      })
      
      if (response.ok) {
        const data: ConversationResponse = await response.json()
        setConversations(data.conversations)
      } else {
        console.error('Failed to fetch conversations')
        // Fallback to mock data if API fails
        loadMockData()
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    const mockConversations: ConversationPreview[] = [
      {
        id: '1',
        title: 'Letter to my father',
        lastMessage: 'I could never tell you what I really felt...',
        lastMessageAt: new Date('2024-01-15'),
        messageCount: 12,
        emotionalScore: 75,
        currentStage: 'acceptance',
        isBurned: false,
        isArchived: false,
        isCompleted: false,
        createdAt: new Date('2024-01-10'),
        recipientProfile: {
          name: 'Father',
          relationship: 'family',
          context: 'My father who passed away'
        }
      },
      {
        id: '2',
        title: 'To my past self',
        lastMessage: 'I wish I had known then what I know now...',
        lastMessageAt: new Date('2024-01-10'),
        messageCount: 8,
        emotionalScore: 45,
        currentStage: 'bargaining',
        isBurned: false,
        isArchived: false,
        isCompleted: false,
        createdAt: new Date('2024-01-08'),
        recipientProfile: {
          name: 'Past Me',
          relationship: 'self',
          context: 'Younger version of myself'
        }
      },
      {
        id: '3',
        title: 'Archived conversation',
        lastMessage: 'This conversation was archived',
        lastMessageAt: new Date('2024-01-05'),
        messageCount: 15,
        emotionalScore: 90,
        currentStage: 'acceptance',
        isBurned: false,
        isArchived: true,
        isCompleted: true,
        createdAt: new Date('2024-01-01'),
        recipientProfile: {
          name: 'Ex-partner',
          relationship: 'ex-partner',
          context: 'Someone I used to love'
        }
      }
    ]
    setConversations(mockConversations)
  }

  const createConversation = async () => {
    if (!newConversationRecipient.trim()) return
    
    setCreating(true)
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': (user as any)?.id || 'demo-user'
        },
        body: JSON.stringify({
          title: newConversationTitle.trim() || `To ${newConversationRecipient}`,
          recipientProfile: {
            name: newConversationRecipient,
            relationship: 'unknown',
            context: `Conversation with ${newConversationRecipient}`
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNewConversationTitle('')
        setNewConversationRecipient('')
        setShowNewConversationModal(false)
        // Navigate to the new conversation
        router.push(`/conversation/${data.id}`)
      } else {
        console.error('Failed to create conversation')
        // Fallback: navigate to new conversation page
        router.push('/new-conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      router.push('/new-conversation')
    } finally {
      setCreating(false)
    }
  }

  const archiveConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${id}&method=archive`, {
        method: 'DELETE',
        headers: {
          'x-user-id': (user as any)?.id || 'demo-user'
        }
      })

      if (response.ok) {
        fetchConversations()
      } else {
        // Fallback: update local state
        setConversations(prev => 
          prev.map(conv => 
            conv.id === id ? { ...conv, isArchived: true } : conv
          )
        )
      }
    } catch (error) {
      console.error('Error archiving conversation:', error)
      // Fallback: update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === id ? { ...conv, isArchived: true } : conv
        )
      )
    }
  }

  const burnConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${id}&method=burn`, {
        method: 'DELETE',
        headers: {
          'x-user-id': (user as any)?.id || 'demo-user'
        }
      })

      if (response.ok) {
        fetchConversations()
      } else {
        // Fallback: update local state
        setConversations(prev => 
          prev.map(conv => 
            conv.id === id ? { ...conv, isBurned: true } : conv
          )
        )
      }
    } catch (error) {
      console.error('Error burning conversation:', error)
      // Fallback: update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === id ? { ...conv, isBurned: true } : conv
        )
      )
    }
  }

  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'archived') return conv.isArchived
    if (filter === 'active') return !conv.isArchived && !conv.isBurned
    return !conv.isBurned
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">My Conversations</h1>
          <p className="text-gray-400">All the words you never sent</p>
          
          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-gray-400">Total</p>
              <p className="text-white font-semibold">{conversations.length}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-gray-400">Active</p>
              <p className="text-white font-semibold">
                {conversations.filter(c => !c.isArchived && !c.isBurned).length}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-gray-400">Archived</p>
              <p className="text-white font-semibold">
                {conversations.filter(c => c.isArchived).length}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-gray-400">Completed</p>
              <p className="text-white font-semibold">
                {conversations.filter(c => c.isCompleted).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filter === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-black/40 text-gray-400 hover:bg-black/60'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filter === 'active' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-black/40 text-gray-400 hover:bg-black/60'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filter === 'archived' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-black/40 text-gray-400 hover:bg-black/60'
                }`}
              >
                Archived
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                + New Conversation
              </button>
              <Link
                href="/new-conversation"
                className="px-6 py-3 bg-black/40 hover:bg-black/60 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-semibold rounded-lg transition-all duration-300"
              >
                Guided Start
              </Link>
            </div>
          </div>

          {/* Conversations List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredConversations.map((conversation) => {
                const stageColor = getStageColors(conversation.currentStage)
                
                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                    className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300 hover:bg-black/60 group"
                  >
                    <div className="flex items-start justify-between">
                      <Link href={`/conversation/${conversation.id}`} className="flex-1">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                {conversation.title}
                              </h3>
                              {conversation.recipientProfile && (
                                <p className="text-purple-400 text-sm mb-2">
                                  To: {conversation.recipientProfile.name}
                                  <span className="text-gray-500 ml-2">
                                    ({conversation.recipientProfile.relationship})
                                  </span>
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="w-20 h-2 bg-gray-700 rounded-full mb-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${conversation.emotionalScore}%`,
                                    backgroundColor: stageColor
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {conversation.emotionalScore}/100
                              </span>
                            </div>
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                              {conversation.lastMessage}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{conversation.messageCount} messages</span>
                            <span>•</span>
                            <span>{formatTimestamp(conversation.lastMessageAt)}</span>
                            <span>•</span>
                            <span 
                              className="font-medium capitalize"
                              style={{ color: stageColor }}
                            >
                              {conversation.currentStage}
                            </span>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            archiveConversation(conversation.id)
                          }}
                          className="px-3 py-1 text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded transition-colors"
                          title="Archive conversation"
                        >
                          Archive
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            burnConversation(conversation.id)
                          }}
                          className="px-3 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                          title="Burn conversation"
                        >
                          Burn
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {filteredConversations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💜</div>
              <p className="text-gray-400 text-lg mb-4">
                {filter === 'all' 
                  ? 'No conversations yet' 
                  : filter === 'archived' 
                  ? 'No archived conversations'
                  : 'No active conversations'
                }
              </p>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Start your first conversation. Write to someone you need to forgive, 
                someone you miss, or even to yourself.
              </p>
              <Link
                href="/new-conversation"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Start your first conversation
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewConversationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-purple-500/50 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Quick Start Conversation
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Who would you like to write to? Start your conversation now.
              </p>
              <div className="mb-4">
                <label className="block text-purple-300 text-sm font-medium mb-2">
                  Who is this conversation for?
                </label>
                <input
                  type="text"
                  value={newConversationRecipient}
                  onChange={(e) => setNewConversationRecipient(e.target.value)}
                  className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="e.g., My father, Sarah, My past self..."
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newConversationRecipient.length}/50 characters
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-purple-300 text-sm font-medium mb-2">
                  Conversation Title (Optional)
                </label>
                <input
                  type="text"
                  value={newConversationTitle}
                  onChange={(e) => setNewConversationTitle(e.target.value)}
                  className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="e.g., Letter about forgiveness, Things I never said..."
                  maxLength={100}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newConversationRecipient.trim()) {
                      createConversation()
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newConversationTitle.length}/100 characters
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createConversation}
                  disabled={creating || !newConversationRecipient.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create & Start Writing'}
                </button>
                <button
                  onClick={() => setShowNewConversationModal(false)}
                  className="px-4 py-2 bg-black/50 hover:bg-black/70 border border-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 