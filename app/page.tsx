'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { StarField } from '@/components/StarField'

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <StarField />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-5xl mx-auto"
        >
              <motion.h1
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                style={{
                  textShadow: "0 0 40px rgba(6, 182, 212, 0.6)",
                  filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))"
                }}
              >
                GALAX
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-cyan-300 mb-2 font-semibold tracking-widest px-2"
              >
                Guided Astronaut Learning And eXploration
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto text-center leading-relaxed px-2"
              >
                Your journey to the stars begins here. Train with real NASA astronauts through immersive missions and simulations.
              </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/board')}
            className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-full text-base sm:text-lg lg:text-xl transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-cyan-400/30"
          >
            🚀 Begin Training
          </motion.button>
        </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-8 sm:mt-12 lg:mt-16 text-center px-2"
            >
              <p className="text-cyan-400 mb-3 sm:mb-4 font-semibold text-base sm:text-lg">Six Specialized Training Paths</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm max-w-4xl mx-auto">
                <span className="bg-blue-900/40 text-blue-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-500/30 backdrop-blur-sm">🔬 Science & Research</span>
                <span className="bg-purple-900/40 text-purple-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-purple-500/30 backdrop-blur-sm">⚙️ Engineering & Systems</span>
                <span className="bg-green-900/40 text-green-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-500/30 backdrop-blur-sm">🏥 Medicine & Human Factors</span>
                <span className="bg-yellow-900/40 text-yellow-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-yellow-500/30 backdrop-blur-sm">📡 Communications & Exploration</span>
                <span className="bg-red-900/40 text-red-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-red-500/30 backdrop-blur-sm">🌟 Astronomy & Navigation</span>
                <span className="bg-indigo-900/40 text-indigo-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-indigo-500/30 backdrop-blur-sm">🤖 Technology & Innovation</span>
              </div>
            </motion.div>
      </div>
    </main>
  )
} 