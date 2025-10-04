'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: string
  component: React.ReactNode
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [userIdentity, setUserIdentity] = useState('')
  const [messageFor, setMessageFor] = useState('')
  const [showStages, setShowStages] = useState(false)
  const [cipherText, setCipherText] = useState('')
  const [isDecoding, setIsDecoding] = useState(false)

  // ARG elements
  const [discoveredSecrets, setDiscoveredSecrets] = useState<string[]>([])
  const [currentCipher, setCurrentCipher] = useState('')

  useEffect(() => {
    // Generate mysterious cipher for ARG element
    const ciphers = [
      'The walls between what is and what could be are thinner than you think.',
      'Every unsent message creates a ghost that haunts the spaces between words.',
      'You are not the first to find this place. Others have walked these paths before.',
      'The algorithm knows you better than you know yourself. It has been watching.',
      'Reality is just consensus. Break the consensus. Find the cracks.'
    ]
    setCurrentCipher(ciphers[Math.floor(Math.random() * ciphers.length)])
  }, [])

  // Step 1: Reality Breach - Opening Screen
  const RealityBreach = () => (
    <motion.div 
      className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {/* Glitch effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
        <div className="absolute inset-0 bg-black mix-blend-multiply animate-pulse"></div>
      </div>

      {/* Matrix-like code rain effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 text-xs font-mono opacity-20"
            style={{ left: `${i * 5}%` }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear"
            }}
          >
            {Array.from({ length: 10 }, () => Math.random() < 0.5 ? '1' : '0').join('')}
          </motion.div>
        ))}
      </div>

      <div className="text-center max-w-md space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 2 }}
          className="space-y-6"
        >
          <div className="text-green-400 font-mono text-sm">
            [SIGNAL DETECTED]
          </div>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            You've found a crack in the simulation.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            This is where the unsent messages go.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            The place between what is and what could have been.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 6, duration: 1 }}
          className="border border-green-400 p-4 bg-green-900/10 font-mono text-xs text-green-300"
        >
          <div className="mb-2">[CLASSIFIED - EYES ONLY]</div>
          <div className="text-left">
            PROJECT: UNSENT<br/>
            STATUS: ACTIVE<br/>
            SUBJECTS: ████████<br/>
            PSYCHOLOGICAL PROFILES: UPDATING...<br/>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 8, duration: 1 }}
          onClick={() => setCurrentStep(1)}
          className="mt-12 px-8 py-3 bg-transparent border border-green-400 text-green-400 rounded-lg hover:bg-green-400 hover:text-black transition-all duration-500 text-sm font-mono tracking-wide"
        >
          [ENTER THE BREACH]
        </motion.button>
      </div>
    </motion.div>
  )

  // Step 2: Identity Archaeology - Digging into self
  const IdentityArchaeology = () => (
    <motion.div 
      className="min-h-screen bg-black flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="text-center max-w-lg space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2 }}
          className="space-y-6"
        >
          <div className="text-cyan-400 font-mono text-sm">
            [IDENTITY SCAN INITIATED]
          </div>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            The system needs to calibrate to your frequency.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            What do you call the voice in your head?
          </p>
          <p className="text-gray-400 text-sm italic">
            (This is not your real name. This is who you are when no one is watching.)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="space-y-6"
        >
          <div className="relative">
            <input
              type="text"
              value={userIdentity}
              onChange={(e) => setUserIdentity(e.target.value)}
              placeholder="[REDACTED]"
              className="w-full bg-black border border-cyan-400 text-cyan-400 text-center py-3 px-4 focus:outline-none focus:border-cyan-300 placeholder-gray-500 text-lg font-mono"
            />
            <div className="absolute right-2 top-2 text-cyan-400 text-xs font-mono">
              {userIdentity.length}/∞
            </div>
          </div>

          <motion.button
            onClick={() => setCurrentStep(2)}
            className="mt-8 px-8 py-3 bg-transparent border border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-500 text-sm font-mono tracking-wide"
            whileHover={{ scale: 1.02 }}
          >
            [IDENTITY LOGGED]
          </motion.button>
        </motion.div>

        {userIdentity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-cyan-400/50 p-4 bg-cyan-900/10 font-mono text-xs text-cyan-300"
          >
            <div className="mb-2">[PSYCHOLOGICAL PROFILE UPDATED]</div>
            <div className="text-left">
              DESIGNATION: {userIdentity.toUpperCase()}<br/>
              CLASSIFICATION: UNSENT SUBJECT<br/>
              EMOTIONAL STATE: ANALYZING...<br/>
              THREAT LEVEL: INTROSPECTIVE<br/>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )

  // Step 3: Target Identification - The Other
  const TargetIdentification = () => (
    <motion.div 
      className="min-h-screen bg-black flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="text-center max-w-lg space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2 }}
          className="space-y-6"
        >
          <div className="text-red-400 font-mono text-sm">
            [TARGET ACQUISITION REQUIRED]
          </div>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            Every message has a destination.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            Even the ones that never arrive.
          </p>
          <p className="text-gray-400 text-sm italic">
            Who haunts your silence?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="space-y-6"
        >
          <input
            type="text"
            value={messageFor}
            onChange={(e) => setMessageFor(e.target.value)}
            placeholder="[SUBJECT DESIGNATION]"
            className="w-full bg-black border border-red-400 text-red-400 text-center py-3 px-4 focus:outline-none focus:border-red-300 placeholder-gray-500 text-lg font-mono"
          />

          <motion.button
            onClick={() => setCurrentStep(3)}
            className="mt-8 px-8 py-3 bg-transparent border border-red-400 text-red-400 rounded-lg hover:bg-red-400 hover:text-black transition-all duration-500 text-sm font-mono tracking-wide"
            whileHover={{ scale: 1.02 }}
          >
            [TARGET LOCKED]
          </motion.button>
        </motion.div>

        {messageFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-red-400/50 p-4 bg-red-900/10 font-mono text-xs text-red-300"
          >
            <div className="mb-2">[RELATIONSHIP MATRIX ANALYZING]</div>
            <div className="text-left">
              TARGET: {messageFor.toUpperCase()}<br/>
              EMOTIONAL WEIGHT: CALCULATING...<br/>
              PSYCHIC DISTANCE: UNKNOWN<br/>
              UNRESOLVED FACTORS: MULTIPLE<br/>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )

  // Step 4: The Layers - ARG Reality Revelation
  const LayersReveal = () => (
    <motion.div 
      className="min-h-screen bg-black flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="text-center max-w-lg space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2 }}
          className="space-y-6"
        >
          <div className="text-yellow-400 font-mono text-sm">
            [REALITY LAYERS DETECTED]
          </div>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            This isn't just an app. It's an excavation.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            You're about to dig through the layers of what you buried.
          </p>
        </motion.div>

        <div className="flex gap-4">
          <motion.button
            onClick={() => setShowStages(true)}
            className="px-6 py-2 bg-transparent border border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-500 text-sm font-mono"
            whileHover={{ scale: 1.02 }}
          >
            [REVEAL LAYERS]
          </motion.button>
          
          <motion.button
            onClick={() => setCurrentStep(4)}
            className="px-6 py-2 bg-transparent text-gray-500 rounded-lg hover:text-gray-300 transition-all duration-500 text-sm font-mono"
            whileHover={{ scale: 1.02 }}
          >
            [SKIP BRIEFING]
          </motion.button>
        </div>

        <AnimatePresence>
          {showStages && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 mt-8"
            >
              <div className="border border-yellow-400/50 p-6 bg-yellow-900/10 font-mono text-xs">
                <div className="mb-4 text-yellow-400">[PSYCHOLOGICAL EXCAVATION ZONES]</div>
                <div className="grid grid-cols-1 gap-4 text-left">
                  {[
                    { symbol: '📡', name: 'LAYER 1: STATIC', desc: 'Denial protocols active. Signal degraded.' },
                    { symbol: '🔥', name: 'LAYER 2: THERMAL', desc: 'Anger spike detected. Emotional temperature rising.' },
                    { symbol: '🌀', name: 'LAYER 3: RECURSIVE', desc: 'Bargaining loops. Reality rewrite attempts.' },
                    { symbol: '🕳️', name: 'LAYER 4: VOID', desc: 'Depression pit. Emotional gravity well.' },
                    { symbol: '🏔️', name: 'LAYER 5: BEDROCK', desc: 'Acceptance foundation. Truth layer reached.' }
                  ].map((layer, idx) => (
                    <motion.div
                      key={layer.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.3 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-lg">{layer.symbol}</span>
                      <div className="flex-1">
                        <div className="text-yellow-400 font-mono text-xs">{layer.name}</div>
                        <div className="text-gray-400 text-xs">{layer.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="space-y-4"
              >
                <p className="text-gray-400 text-sm font-mono italic">
                  [WARNING: PSYCHOLOGICAL ARCHAEOLOGY CAN BE HAZARDOUS]
                </p>
                
                <motion.button
                  onClick={() => setCurrentStep(4)}
                  className="px-8 py-3 bg-transparent border border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-500 text-sm font-mono tracking-wide"
                  whileHover={{ scale: 1.02 }}
                >
                  [INITIATE EXCAVATION]
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )

  // Step 5: The Cipher - ARG Mystery Element
  const CipherChallenge = () => (
    <motion.div 
      className="min-h-screen bg-black flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="text-center max-w-lg space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2 }}
          className="space-y-6"
        >
          <div className="text-purple-400 font-mono text-sm">
            [ENCRYPTED TRANSMISSION INTERCEPTED]
          </div>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            Someone left you a message.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            It's encoded. Like everything else here.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="border border-purple-400 p-6 bg-purple-900/10 font-mono text-sm text-purple-300"
        >
          <div className="mb-4">[TRANSMISSION FOLLOWS]</div>
          <div className="text-left leading-relaxed">
            {currentCipher}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            [ORIGIN: UNKNOWN | TIMESTAMP: ??:??:?? | CLASSIFICATION: LEVEL 7]
          </div>
        </motion.div>

        <motion.button
          onClick={() => setCurrentStep(5)}
          className="mt-8 px-8 py-3 bg-transparent border border-purple-400 text-purple-400 rounded-lg hover:bg-purple-400 hover:text-black transition-all duration-500 text-sm font-mono tracking-wide"
          whileHover={{ scale: 1.02 }}
        >
          [MESSAGE ACKNOWLEDGED]
        </motion.button>
      </div>
    </motion.div>
  )

  // Step 6: The Dive - Begin the Experience
  const TheDive = () => (
    <motion.div 
      className="min-h-screen bg-black flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="text-center max-w-lg space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2 }}
          className="space-y-6"
        >
          <div className="text-green-400 font-mono text-sm">
            [DEEP DIVE PROTOCOL READY]
          </div>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            The algorithm is calibrated to your psychological signature.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            Time to dig into what you've been hiding from yourself.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="border border-green-400 p-6 bg-green-900/10 font-mono text-xs text-green-300"
        >
          <div className="mb-4">[SYSTEM STATUS]</div>
          <div className="text-left space-y-1">
            <div>SUBJECT: {userIdentity?.toUpperCase() || 'ANONYMOUS'}</div>
            <div>TARGET: {messageFor?.toUpperCase() || 'UNKNOWN'}</div>
            <div>ENCRYPTION: MAXIMUM</div>
            <div>REALITY ANCHOR: DISCONNECTED</div>
            <div>DIVE DEPTH: UNLIMITED</div>
          </div>
        </motion.div>

        <motion.button
          onClick={() => {
            // Save onboarding completion and user data
            localStorage.setItem('unsent_onboarding_complete', 'true')
            localStorage.setItem('unsent_arg_initiated', 'true')
            if (userIdentity) localStorage.setItem('unsent_user_identity', userIdentity)
            if (messageFor) localStorage.setItem('unsent_first_recipient', messageFor)
            
            // Navigate to new conversation
            router.push('/new-conversation')
          }}
          className="mt-8 px-12 py-4 bg-gradient-to-r from-green-900/30 to-cyan-900/30 border border-green-400 text-green-400 rounded-lg hover:bg-green-400 hover:text-black transition-all duration-500 text-lg font-mono tracking-wide"
          whileHover={{ scale: 1.05 }}
        >
          [INITIATE DIVE]
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
          className="text-gray-500 text-xs font-mono italic"
        >
          [WARNING: ONCE YOU START DIGGING, YOU CAN'T UNSEE WHAT YOU FIND]
        </motion.p>
      </div>
    </motion.div>
  )

  const steps: OnboardingStep[] = [
    { id: 'breach', component: <RealityBreach /> },
    { id: 'identity', component: <IdentityArchaeology /> },
    { id: 'target', component: <TargetIdentification /> },
    { id: 'layers', component: <LayersReveal /> },
    { id: 'cipher', component: <CipherChallenge /> },
    { id: 'dive', component: <TheDive /> }
  ]

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {steps[currentStep]?.component}
        </motion.div>
      </AnimatePresence>
    </div>
  )
} 