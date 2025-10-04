'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function NewConversationPage() {
  const router = useRouter()
  const { userIdentity } = useAuth()
  const [recipient, setRecipient] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showClaudePrompt, setShowClaudePrompt] = useState(false)

  useEffect(() => {
    // Get the recipient from onboarding if available
    const firstRecipient = localStorage.getItem('unsent_first_recipient')
    if (firstRecipient) {
      setRecipient(firstRecipient)
    }
  }, [])

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFirstMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
    
    // Show Claude's gentle prompt after user stops typing for a moment
    if (e.target.value.length > 50) {
      setTimeout(() => {
        setShowClaudePrompt(true)
      }, 3000)
    }
  }

  const handleCreateConversation = async () => {
    if (!recipient || !firstMessage) return

    try {
      // Create person profile
      const personProfile = {
        name: recipient,
        relationship: 'unknown', // Will be refined later
        context: 'Someone important to this person',
        description: 'A person who needs to hear these words',
        tags: []
      }

      // Create conversation
      const conversationData = {
        title: `To ${recipient}`,
        recipient: recipient,
        firstMessage: firstMessage,
        personProfile: personProfile,
        emotionalStage: 'fog',
        createdAt: new Date().toISOString()
      }

      // Store locally and navigate
      const conversationId = Date.now().toString()
      localStorage.setItem(`unsent_conversation_${conversationId}`, JSON.stringify(conversationData))
      
      // Navigate to the conversation
      router.push(`/conversation/${conversationId}`)
      
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <motion.button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors text-sm font-light"
          whileHover={{ x: -5 }}
        >
          ← Back to silence
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h1 className="text-3xl font-light text-white mb-4">
              Your first unsent message
            </h1>
            <p className="text-gray-400 font-light">
              {userIdentity ? `${userIdentity}, t` : 'T'}he words are waiting.
            </p>
          </motion.div>

          {/* Recipient Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="space-y-4"
          >
            <label className="block text-gray-300 font-light">
              Who is this for?
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="a name, a memory, a feeling..."
              className="w-full bg-transparent border-b border-gray-600 text-gray-300 text-lg py-3 focus:outline-none focus:border-purple-500 placeholder-gray-500 font-light"
            />
          </motion.div>

          {/* Message Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="space-y-4"
          >
            <label className="block text-gray-300 font-light">
              What do you need to say?
            </label>
            <textarea
              value={firstMessage}
              onChange={handleMessageChange}
              placeholder="Start writing... the words will come."
              className="w-full bg-transparent border border-gray-600 text-gray-300 text-lg p-4 focus:outline-none focus:border-purple-500 placeholder-gray-500 font-light resize-none rounded-lg"
              rows={8}
            />
          </motion.div>

          {/* Claude's Gentle Prompt */}
          {showClaudePrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <p className="text-gray-500 text-sm font-light italic">
                You don't have to finish. Some things live better half-said.
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={handleCreateConversation}
              disabled={!recipient || !firstMessage}
              className="px-8 py-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700/50 text-white rounded-full hover:border-purple-600 transition-all duration-500 font-light disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: recipient && firstMessage ? 1.05 : 1 }}
            >
              {isTyping ? 'Keep writing...' : 'Send into the void'}
            </motion.button>

            <motion.button
              onClick={() => router.push('/conversations')}
              className="px-8 py-4 bg-transparent border border-gray-600 text-gray-300 rounded-full hover:border-gray-400 hover:text-white transition-all duration-500 font-light"
              whileHover={{ scale: 1.02 }}
            >
              See all conversations
            </motion.button>
          </motion.div>

          {/* Mysterious Fragment */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            className="text-center pt-8"
          >
            <p className="text-gray-600 text-xs font-light italic">
              "Every word you don't send carries the weight of what could have been."
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Everything here stays here</span>
          <span>🔒 End-to-end encrypted</span>
        </div>
      </div>
    </div>
  )
} 