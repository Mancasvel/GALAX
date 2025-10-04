'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MENTOR_PROFILES, callMentorAI, MentorResponse } from '@/lib/nasa-mentors'

interface MentorModalProps {
  isOpen: boolean
  onClose: () => void
  mentorName: string | null
  currentPath?: string | null
  conversationHistory?: Array<{role: string, content: string}>
  onUpdateContext?: (pathName: string, messages: Array<{role: string, content: string}>) => void
}

export function MentorModal({ 
  isOpen, 
  onClose, 
  mentorName, 
  currentPath,
  conversationHistory: externalHistory = [],
  onUpdateContext
}: MentorModalProps) {
  const [mentorResponse, setMentorResponse] = useState<MentorResponse | null>(null)
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>(externalHistory)

  const mentor = mentorName ? MENTOR_PROFILES[mentorName] : null
  
  // Sync external history when it changes
  useEffect(() => {
    setConversationHistory(externalHistory)
  }, [externalHistory])

  const handleSendMessage = useCallback(async (message?: string) => {
    const messageToSend = message || userMessage
    if (!messageToSend.trim() || !mentorName) return

    setIsLoading(true)

    try {
      console.log('Calling mentor AI with:', {
        mentorName,
        messageToSend,
        currentPath,
        conversationHistoryLength: conversationHistory.length
      })

      const response = await callMentorAI(
        mentorName,
        messageToSend,
        {
          currentPath: currentPath || undefined,
          progress: 0,
          missionType: 'general',
          previousMessages: conversationHistory
        }
      )

      console.log('Mentor AI response received:', response)

      if (response) {
        setMentorResponse(response)
        const updatedHistory = [
          ...conversationHistory,
          { role: 'user', content: messageToSend },
          { role: 'assistant', content: response.content }
        ]
        setConversationHistory(updatedHistory)
        
        // Update parent context if callback provided
        if (onUpdateContext && currentPath) {
          onUpdateContext(currentPath, updatedHistory)
        }
      } else {
        console.error('No response received from mentor AI')
        setMentorResponse({
          content: "I didn't receive a response from mission control. Please try again.",
          educationalFacts: ["Communication delays can occur in space missions"],
          nextSteps: ["Retry your message", "Check connection status"],
          encouragement: "Persistence is key in space exploration!",
          nasaReference: "Deep Space Network"
        })
      }
    } catch (error: any) {
      console.error('Error calling mentor AI:', error)
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        mentorName,
        messageToSend
      })

      setMentorResponse({
        content: `Error connecting to ${mentorName}: ${error?.message || 'Unknown error'}. Please check the console for more details.`,
        educationalFacts: ["Technical issues can occur in complex systems"],
        nextSteps: ["Check browser console for error details", "Try refreshing the page", "Contact support if issue persists"],
        encouragement: "Even NASA engineers encounter technical challenges!",
        nasaReference: "Mission Control troubleshooting"
      })
    } finally {
      setIsLoading(false)
      setUserMessage('')
    }
  }, [mentorName, currentPath, conversationHistory, userMessage])

  useEffect(() => {
    if (isOpen && mentor && conversationHistory.length === 0 && mentorName && currentPath) {
      console.log('Initializing mentor conversation for:', mentorName, 'Path:', currentPath)
      console.log('Current state:', {
        isOpen,
        mentor: !!mentor,
        conversationHistoryLength: conversationHistory.length,
        mentorName,
        currentPath
      })

      // Send initial greeting when modal opens for the first time
      const greeting = `Hello ${mentor.name}, I'm interested in learning about ${currentPath}. Can you guide me?`
      console.log('Sending greeting:', greeting)

      // Use setTimeout to ensure the component is fully mounted
      setTimeout(() => {
        handleSendMessage(greeting)
      }, 100)
    }
  }, [isOpen, mentor, currentPath, conversationHistory.length, handleSendMessage, mentorName])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!mentor) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-purple-900 p-6 border-b-2 border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-cyan-400/40"
                       style={{
                         boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)'
                       }}>
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{mentor.name}</h2>
                    <p className="text-cyan-300">{mentor.specialty}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm">Online</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                       style={{
                         textShadow: "0 0 15px rgba(6, 182, 212, 0.4)"
                       }}>
                    GALAX
                  </div>
                  <div className="text-xs text-gray-400">AI Mentor System</div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 max-h-96 overflow-y-auto">
              {conversationHistory.length > 0 && (
                <div className="space-y-4 mb-6">
                  {conversationHistory.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}>
                        <div className="text-sm">{message.content}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Mentor Response Display */}
              {mentorResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-lg p-4 mb-4"
                >
                  <div className="text-gray-200 mb-3">{mentorResponse.content}</div>

                  {mentorResponse.educationalFacts.length > 0 && (
                    <div className="mb-3">
                      <div className="text-blue-300 font-semibold text-sm mb-2">Educational Facts:</div>
                      <ul className="space-y-1">
                        {mentorResponse.educationalFacts.map((fact, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {mentorResponse.nextSteps.length > 0 && (
                    <div className="mb-3">
                      <div className="text-green-300 font-semibold text-sm mb-2">Next Steps:</div>
                      <ul className="space-y-1">
                        {mentorResponse.nextSteps.map((step, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start">
                            <span className="text-green-400 mr-2">→</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-purple-300 text-sm italic border-t border-gray-700 pt-2">
                    {mentorResponse.encouragement}
                  </div>

                  {mentorResponse.nasaReference && (
                    <div className="text-yellow-300 text-xs mt-2">
                      Reference: {mentorResponse.nasaReference}
                    </div>
                  )}
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-gray-400"
                >
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">{mentor.name} is thinking...</span>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${mentor.name} a question about ${currentPath || 'space'}...`}
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-400 focus:outline-none"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !userMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
