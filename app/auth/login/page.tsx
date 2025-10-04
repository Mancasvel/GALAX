'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const { sendMagicLink, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const success = await sendMagicLink(email)
      
      if (success) {
        setMessage('Magic link sent! Check your email.')
        setMessageType('success')
        setEmail('')
      } else {
        setMessage('Error sending the link. Please try again.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Connection error. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(139,92,246,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse"></div>
      
      {/* Floating neon lights */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full blur-sm animate-pulse"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-pink-400 rounded-full blur-sm animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-400 rounded-full blur-sm animate-pulse delay-2000"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer"
                style={{
                  textShadow: "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)",
                  filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))"
                }}
              >
                UNSENT
              </motion.h1>
            </Link>
            <p className="text-gray-300 text-lg">
              Enter your email to begin
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/25 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-purple-500/25"
                style={{
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send magic link'
                )}
              </button>
            </form>

            {/* Status message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mt-4 p-4 rounded-lg text-sm ${
                  messageType === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                    : 'bg-red-500/20 border border-red-500/30 text-red-300'
                }`}
              >
                {message}
              </motion.div>
            )}

            {/* Additional information */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 leading-relaxed">
                We'll send you a magic link to your email.<br />
                No password needed, just click the link.
              </p>
            </div>
          </motion.div>

          {/* Encryption information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-8 text-center"
          >
            <div className="bg-black/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-yellow-300 font-semibold mb-2">🔒 Total Privacy</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                All your messages are encrypted locally with a unique key. 
                No one else can read what you write, not even us.
              </p>
            </div>
          </motion.div>

          {/* Mysterious fragment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-8 p-4 border border-purple-500/20 bg-black/20 backdrop-blur-sm rounded-lg text-center"
          >
            <p className="text-purple-300 italic text-sm">
              "Every unsent message is a pending conversation with yourself..."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 