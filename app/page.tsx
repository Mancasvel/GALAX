'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { StarField } from '@/components/StarField'

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <StarField />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent"
          >
            NASA Space Dome
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto text-center leading-relaxed"
          >
            Explore, learn, and become an astronaut through interactive missions guided by real NASA astronauts
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/board')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Mission
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">Choose your path in the dome</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full">Science & Research</span>
            <span className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full">Engineering & Systems</span>
            <span className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full">Medicine & Human Factors</span>
            <span className="bg-yellow-900/30 text-yellow-300 px-3 py-1 rounded-full">Communications & Exploration</span>
            <span className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full">Astronomy & Navigation</span>
            <span className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full">Technology & Innovation</span>
          </div>
        </motion.div>
      </div>
    </main>
  )
} 