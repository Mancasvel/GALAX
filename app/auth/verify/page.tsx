'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/AuthContext'

function VerifyPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Redirect after success
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Connection error. Please try again.')
      }
    }

    verifyToken()
  }, [searchParams, router])

  // If already authenticated, redirect
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md text-center"
        >
          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            style={{
              textShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
              filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))"
            }}
          >
            UNSENT
          </motion.h1>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8"
          >
            {status === 'loading' && (
              <div className="space-y-4">
                <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-xl font-semibold text-white">Verifying...</h2>
                <p className="text-gray-400">Please wait while we authenticate your access</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-green-400">Authentication Successful!</h2>
                <p className="text-gray-400">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-red-400">Verification Failed</h2>
                <p className="text-gray-400">{message}</p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-6"
          >
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black relative overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-300">Loading...</span>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
} 