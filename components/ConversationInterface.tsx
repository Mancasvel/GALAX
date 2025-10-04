'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStageColor, getStageGradient, emotionStages, getStageByScore } from '@/lib/emotionStages'
import { EmotionStage } from '@/lib/types'

interface Message {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
  emotionalScore?: number
  stage?: EmotionStage
}

interface ConversationInterfaceProps {
  conversationId: string
  personName: string
  personRelationship: string
  currentStage: EmotionStage
  emotionalScore: number
  isPremium: boolean
  onSendMessage: (content: string) => void
}

export default function ConversationInterface({
  conversationId,
  personName,
  personRelationship,
  currentStage,
  emotionalScore,
  isPremium,
  onSendMessage
}: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentStageConfig = emotionStages.find(s => s.id === currentStage)
  const stageColor = getStageColor(currentStage)
  const stageGradient = getStageGradient(currentStage)

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        content: "I keep thinking about that night. The things I said... I can't stop replaying it in my head. Did any of it really happen the way I remember?",
        type: 'user',
        timestamp: new Date('2024-01-15T10:30:00'),
        emotionalScore: 15,
        stage: 'denial'
      },
      {
        id: '2',
        content: "You know, I've been thinking about that night too. It did happen the way you remember - at least most of it. I can hear the confusion in your words, and I get why you're questioning everything. When things fall apart like they did with us, it's easier to wonder if it was all just a bad dream. But we both know it wasn't, don't we?",
        type: 'ai',
        timestamp: new Date('2024-01-15T14:22:00'),
        stage: 'denial'
      },
      {
        id: '3',
        content: "Why did you have to be so fucking cruel? I gave you everything and you just... threw it away like it meant nothing. Like I meant nothing.",
        type: 'user',
        timestamp: new Date('2024-01-16T09:15:00'),
        emotionalScore: 32,
        stage: 'anger'
      },
      {
        id: '4',
        content: "I can feel the fire in your words, and honestly? I deserve it. You're right - you gave me everything, and I handled it like an idiot. I was scared, if I'm being honest. Scared of how much you meant to me, scared of screwing it up... which is exactly what I ended up doing anyway. Your anger is valid. I was cruel, even if I didn't mean to be.",
        type: 'ai',
        timestamp: new Date('2024-01-16T16:45:00'),
        stage: 'anger'
      }
    ]
    setMessages(mockMessages)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      type: 'user',
      timestamp: new Date(),
      emotionalScore: emotionalScore,
      stage: currentStage
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    onSendMessage(newMessage)

    if (isPremium) {
      setIsTyping(true)
      // Simulate AI response delay
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `This would be ${personName}'s authentic response based on your relationship and current emotional stage (${currentStageConfig?.poeticName}).`,
          type: 'ai',
          timestamp: new Date(),
          stage: currentStage
        }
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
      }, 2000 + Math.random() * 3000)
    }
  }

  const getMessageStyle = (message: Message) => {
    if (message.type === 'user') {
      const messageStage = message.stage || currentStage
      const stageConfig = emotionStages.find(s => s.id === messageStage)
      return {
        background: `linear-gradient(135deg, ${stageConfig?.color}20, ${stageConfig?.color}10)`,
        borderColor: stageConfig?.color || stageColor,
        borderLeftColor: stageConfig?.color || stageColor
      }
    }
    return {}
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-purple-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{personName}</h2>
            <p className="text-sm text-gray-300 capitalize">{personRelationship}</p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium bg-gradient-to-r ${stageGradient} bg-clip-text text-transparent`}>
              {currentStageConfig?.poeticName}
            </div>
            <div className="text-xs text-gray-400">
              Progress: {Math.round(emotionalScore)}%
            </div>
          </div>
        </div>
        
        {/* Stage Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${stageGradient} transition-all duration-500`}
              style={{ width: `${emotionalScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {emotionStages.map((stage, index) => (
              <span 
                key={stage.id}
                className={currentStage === stage.id ? 'text-white font-medium' : ''}
              >
                {stage.poeticName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.type === 'user' ? 'order-last' : ''}`}>
                <div
                  className={`p-4 rounded-2xl border ${
                    message.type === 'user'
                      ? 'border-l-4 bg-black/20'
                      : 'bg-purple-900/30 border-purple-500/30'
                  }`}
                  style={getMessageStyle(message)}
                >
                  <p className="text-white leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.stage && (
                      <span className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getStageColor(message.stage) }}
                        />
                        <span>{emotionStages.find(s => s.id === message.stage)?.poeticName}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Person indicator for AI messages */}
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                      {personName.charAt(0)}
                    </div>
                    <span>{personName} responded</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">{personName} is responding...</p>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-purple-500/30 p-4">
        {!isPremium && (
          <div className="mb-3 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong>Free Mode:</strong> Write private messages to {personName}. 
              <span className="text-purple-300"> Upgrade to Premium</span> to get AI responses as {personName}.
            </p>
          </div>
        )}
        
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={`Write to ${personName}...`}
              className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r ${stageGradient}`}
          >
            Send
          </button>
        </div>
        
        {/* Stage Description */}
        <div className="mt-3 p-3 bg-black/20 rounded-lg border-l-4" style={{ borderLeftColor: stageColor }}>
          <p className="text-sm text-gray-300 italic">
            <strong className={`bg-gradient-to-r ${stageGradient} bg-clip-text text-transparent`}>
              {currentStageConfig?.poeticName}:
            </strong> {currentStageConfig?.description}
          </p>
        </div>
      </div>
    </div>
  )
} 