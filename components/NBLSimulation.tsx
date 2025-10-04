'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NBLSimulationProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (score: number) => void
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  specialty?: string
}

interface Astronaut {
  x: number
  y: number
  z: number // depth in pool
  rotation: number
  velocityX: number
  velocityY: number
  velocityZ: number
  isGrabbing: boolean
  grabbedObject: string | null
}

interface PoolObject {
  id: string
  type: 'tool' | 'component' | 'workstation' | 'handrail' | 'target'
  x: number
  y: number
  z: number
  size: number
  color: string
  label: string
  required: boolean
  installed: boolean
}

interface Task {
  id: string
  title: string
  description: string
  objective: string
  requiredObjects: string[]
  targetLocation: { x: number; y: number; z: number }
  timeBonus: number
  educationalFact: string
}

export function NBLSimulation({ isOpen, onClose, onComplete, difficulty, specialty }: NBLSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  const [gameState, setGameState] = useState({
    started: false,
    paused: false,
    oxygen: 100,
    timeRemaining: 480, // 8 minutes
    score: 0,
    currentTaskIndex: 0,
    tasksCompleted: 0
  })

  const [astronaut, setAstronaut] = useState<Astronaut>({
    x: 400,
    y: 500,
    z: 200, // mid-depth
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0,
    isGrabbing: false,
    grabbedObject: null
  })

  const [poolObjects, setPoolObjects] = useState<PoolObject[]>([])
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  const [showInstructions, setShowInstructions] = useState(true)
  const [currentMessage, setCurrentMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Equipment Installation',
      description: 'Navigate to the ISS mockup and install the thermal control module',
      objective: 'Retrieve wrench, navigate to workstation, install component',
      requiredObjects: ['wrench', 'thermal-module', 'workstation-1'],
      targetLocation: { x: 300, y: 200, z: 150 },
      timeBonus: 100,
      educationalFact: 'The ISS has 8 miles of electrical wiring and requires constant maintenance!'
    },
    {
      id: 'task-2',
      title: 'Solar Array Repair',
      description: 'Replace damaged solar panel connector while maintaining neutral buoyancy',
      objective: 'Use specialized tools to replace the connector without floating away',
      requiredObjects: ['multimeter', 'connector', 'workstation-2'],
      targetLocation: { x: 600, y: 250, z: 180 },
      timeBonus: 150,
      educationalFact: 'Each solar array wing is 112 feet long and generates 32 kilowatts of power!'
    },
    {
      id: 'task-3',
      title: 'Emergency EVA Simulation',
      description: 'Practice emergency procedures while managing oxygen and movement',
      objective: 'Navigate through obstacles to reach the emergency airlock',
      requiredObjects: ['emergency-kit', 'airlock'],
      targetLocation: { x: 750, y: 450, z: 250 },
      timeBonus: 200,
      educationalFact: 'Astronauts can experience up to 7 hours in a spacesuit during training!'
    }
  ]

  // Initialize pool objects
  useEffect(() => {
    if (!isOpen) return

    const objects: PoolObject[] = [
      // Tools
      { id: 'wrench', type: 'tool', x: 150, y: 400, z: 180, size: 20, color: '#60a5fa', label: '🔧 Wrench', required: true, installed: false },
      { id: 'multimeter', type: 'tool', x: 250, y: 450, z: 220, size: 20, color: '#fbbf24', label: '⚡ Multimeter', required: true, installed: false },
      { id: 'emergency-kit', type: 'tool', x: 350, y: 350, z: 160, size: 25, color: '#ef4444', label: '🚨 Emergency Kit', required: true, installed: false },
      
      // Components
      { id: 'thermal-module', type: 'component', x: 200, y: 300, z: 200, size: 30, color: '#8b5cf6', label: '⚙️ Module', required: true, installed: false },
      { id: 'connector', type: 'component', x: 450, y: 380, z: 190, size: 25, color: '#10b981', label: '🔌 Connector', required: true, installed: false },
      
      // Workstations (ISS mockup parts)
      { id: 'workstation-1', type: 'workstation', x: 300, y: 200, z: 150, size: 60, color: '#475569', label: '🏗️ Workstation 1', required: false, installed: false },
      { id: 'workstation-2', type: 'workstation', x: 600, y: 250, z: 180, size: 60, color: '#475569', label: '🏗️ Workstation 2', required: false, installed: false },
      { id: 'airlock', type: 'workstation', x: 750, y: 450, z: 250, size: 80, color: '#1e293b', label: '🚪 Airlock', required: false, installed: false },
      
      // Handrails for navigation
      { id: 'handrail-1', type: 'handrail', x: 250, y: 300, z: 170, size: 15, color: '#94a3b8', label: '✋', required: false, installed: false },
      { id: 'handrail-2', type: 'handrail', x: 400, y: 350, z: 200, size: 15, color: '#94a3b8', label: '✋', required: false, installed: false },
      { id: 'handrail-3', type: 'handrail', x: 550, y: 300, z: 220, size: 15, color: '#94a3b8', label: '✋', required: false, installed: false },
      { id: 'handrail-4', type: 'handrail', x: 650, y: 400, z: 240, size: 15, color: '#94a3b8', label: '✋', required: false, installed: false },
    ]

    setPoolObjects(objects)
  }, [isOpen])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()))
      
      if (e.key === ' ' && !gameState.started) {
        startGame()
      }
      if (e.key === 'Escape') {
        setGameState(prev => ({ ...prev, paused: !prev.paused }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(e.key.toLowerCase())
        return newSet
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState.started])

  // Game loop
  useEffect(() => {
    if (!gameState.started || gameState.paused || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = () => {
      // Update physics
      updateAstronautPhysics()
      checkCollisions()
      
      // Render
      render(ctx, canvas)
      
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState.started, gameState.paused, astronaut, poolObjects, keys])

  // Timer
  useEffect(() => {
    if (!gameState.started || gameState.paused) return

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1
        const newOxygen = Math.max(0, prev.oxygen - 0.05)

        if (newTime <= 0 || newOxygen <= 0) {
          endGame(false)
          return prev
        }

        return {
          ...prev,
          timeRemaining: newTime,
          oxygen: newOxygen
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.started, gameState.paused])

  const startGame = () => {
    setGameState(prev => ({ ...prev, started: true }))
    setShowInstructions(false)
    showMessageToPlayer('Mission started! Navigate to retrieve the wrench.', 3000)
  }

  const showMessageToPlayer = (message: string, duration: number = 2000) => {
    setCurrentMessage(message)
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), duration)
  }

  const updateAstronautPhysics = () => {
    setAstronaut(prev => {
      let newVelX = prev.velocityX * 0.92 // Water resistance
      let newVelY = prev.velocityY * 0.92
      let newVelZ = prev.velocityZ * 0.92
      
      // Movement controls with underwater physics
      const moveSpeed = 2.5
      const rotationSpeed = 0.08
      
      if (keys.has('w')) newVelY -= moveSpeed * 0.3 // Up (against buoyancy)
      if (keys.has('s')) newVelY += moveSpeed * 0.2 // Down (with gravity)
      if (keys.has('a')) newVelX -= moveSpeed * 0.25
      if (keys.has('d')) newVelX += moveSpeed * 0.25
      if (keys.has('q')) newVelZ -= moveSpeed * 0.2 // Move back in depth
      if (keys.has('e')) newVelZ += moveSpeed * 0.2 // Move forward in depth
      
      // Rotation
      if (keys.has('arrowleft')) prev.rotation -= rotationSpeed
      if (keys.has('arrowright')) prev.rotation += rotationSpeed

      // Buoyancy effect (slight upward drift)
      newVelY -= 0.08

      // Clamp velocities
      newVelX = Math.max(-5, Math.min(5, newVelX))
      newVelY = Math.max(-5, Math.min(5, newVelY))
      newVelZ = Math.max(-3, Math.min(3, newVelZ))

      // Update position
      let newX = prev.x + newVelX
      let newY = prev.y + newVelY
      let newZ = prev.z + newVelZ

      // Boundaries (pool walls and surface/bottom)
      newX = Math.max(50, Math.min(750, newX))
      newY = Math.max(50, Math.min(550, newY))
      newZ = Math.max(100, Math.min(300, newZ))

      return {
        ...prev,
        x: newX,
        y: newY,
        z: newZ,
        velocityX: newVelX,
        velocityY: newVelY,
        velocityZ: newVelZ
      }
    })
  }

  const checkCollisions = () => {
    poolObjects.forEach(obj => {
      const distance = Math.sqrt(
        Math.pow(astronaut.x - obj.x, 2) + 
        Math.pow(astronaut.y - obj.y, 2) +
        Math.pow(astronaut.z - obj.z, 2)
      )

      // Interaction distance
      if (distance < 50 && keys.has('f')) {
        handleObjectInteraction(obj)
      }
    })
  }

  const handleObjectInteraction = (obj: PoolObject) => {
    if (astronaut.grabbedObject === obj.id) {
      // Release object
      setAstronaut(prev => ({ ...prev, grabbedObject: null, isGrabbing: false }))
      showMessageToPlayer(`Released ${obj.label}`)
    } else if (!astronaut.grabbedObject && obj.type === 'tool') {
      // Grab tool
      setAstronaut(prev => ({ ...prev, grabbedObject: obj.id, isGrabbing: true }))
      setGameState(prev => ({ ...prev, score: prev.score + 50 }))
      showMessageToPlayer(`Grabbed ${obj.label}! +50 points`)
    } else if (astronaut.grabbedObject && obj.type === 'workstation') {
      // Install component at workstation
      const currentTask = tasks[gameState.currentTaskIndex]
      if (currentTask && currentTask.requiredObjects.includes(obj.id)) {
        completeTaskStep(obj.id)
      }
    } else if (obj.type === 'handrail') {
      // Use handrail for stability
      setAstronaut(prev => ({
        ...prev,
        velocityX: prev.velocityX * 0.3,
        velocityY: prev.velocityY * 0.3,
        velocityZ: prev.velocityZ * 0.3
      }))
      showMessageToPlayer('Using handrail for stability')
    }
  }

  const completeTaskStep = (workstationId: string) => {
    const currentTask = tasks[gameState.currentTaskIndex]
    
    setPoolObjects(prev => prev.map(obj => 
      obj.id === workstationId ? { ...obj, installed: true } : obj
    ))

    setAstronaut(prev => ({ ...prev, grabbedObject: null, isGrabbing: false }))
    
    const points = 200 + currentTask.timeBonus
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      tasksCompleted: prev.tasksCompleted + 1,
      currentTaskIndex: prev.currentTaskIndex + 1
    }))

    showMessageToPlayer(`✅ Task completed! +${points} points`, 3000)

    if (gameState.currentTaskIndex + 1 >= tasks.length) {
      setTimeout(() => endGame(true), 2000)
    } else {
      setTimeout(() => {
        showMessageToPlayer(`Next task: ${tasks[gameState.currentTaskIndex + 1].title}`, 4000)
      }, 3000)
    }
  }

  const endGame = (success: boolean) => {
    setGameState(prev => ({ ...prev, started: false }))
    
    const bonusPoints = Math.floor(gameState.oxygen * 3) + gameState.timeRemaining * 2
    const finalScore = success ? gameState.score + bonusPoints : gameState.score
    
    onComplete(finalScore)
  }

  const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear canvas
    ctx.fillStyle = '#001a33'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw underwater grid (depth perception)
    ctx.strokeStyle = '#0a3d62'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw pool objects with depth sorting
    const sortedObjects = [...poolObjects].sort((a, b) => a.z - b.z)
    
    sortedObjects.forEach(obj => {
      const scale = 0.5 + (obj.z / 300) * 0.5 // Depth scaling
      const renderSize = obj.size * scale
      
      ctx.save()
      ctx.globalAlpha = 0.7 + (obj.z / 300) * 0.3
      
      // Draw object shadow/depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.arc(obj.x + 5, obj.y + 5, renderSize + 2, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw object
      if (obj.type === 'workstation') {
        ctx.fillStyle = obj.installed ? '#10b981' : obj.color
        ctx.fillRect(obj.x - renderSize, obj.y - renderSize, renderSize * 2, renderSize * 2)
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 2
        ctx.strokeRect(obj.x - renderSize, obj.y - renderSize, renderSize * 2, renderSize * 2)
      } else {
        ctx.fillStyle = obj.color
        ctx.beginPath()
        ctx.arc(obj.x, obj.y, renderSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      
      // Draw label
      ctx.fillStyle = '#ffffff'
      ctx.font = `${12 * scale}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(obj.label, obj.x, obj.y - renderSize - 5)
      
      ctx.restore()
    })

    // Draw astronaut
    const astronautScale = 0.5 + (astronaut.z / 300) * 0.5
    const astronautSize = 25 * astronautScale
    
    ctx.save()
    ctx.translate(astronaut.x, astronaut.y)
    ctx.rotate(astronaut.rotation)
    ctx.globalAlpha = 0.9
    
    // Astronaut body (spacesuit)
    ctx.fillStyle = '#f0f0f0'
    ctx.beginPath()
    ctx.arc(0, 0, astronautSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Helmet
    ctx.fillStyle = 'rgba(100, 181, 246, 0.5)'
    ctx.beginPath()
    ctx.arc(0, -astronautSize * 0.3, astronautSize * 0.6, 0, Math.PI * 2)
    ctx.fill()
    
    // Visor reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.arc(-astronautSize * 0.2, -astronautSize * 0.4, astronautSize * 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // Life support pack
    ctx.fillStyle = '#475569'
    ctx.fillRect(-astronautSize * 0.6, astronautSize * 0.2, astronautSize * 0.4, astronautSize * 0.8)
    
    // Grabbed object indicator
    if (astronaut.grabbedObject) {
      const grabbedObj = poolObjects.find(o => o.id === astronaut.grabbedObject)
      if (grabbedObj) {
        ctx.fillStyle = grabbedObj.color
        ctx.beginPath()
        ctx.arc(astronautSize * 0.8, 0, 10, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // Direction indicator
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(astronautSize + 10, 0)
    ctx.stroke()
    
    ctx.restore()

    // Draw depth indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(10, canvas.height - 60, 150, 50)
    ctx.fillStyle = '#60a5fa'
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Depth: ${Math.floor(astronaut.z / 3)}ft`, 20, canvas.height - 35)
    ctx.fillText(`Position: ${Math.floor(astronaut.x)}, ${Math.floor(astronaut.y)}`, 20, canvas.height - 15)
  }

  if (!isOpen) return null

  const currentTask = tasks[gameState.currentTaskIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* HUD Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-start">
            {/* Left: Status */}
            <div className="space-y-2">
              <div className="bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-lg px-4 py-2">
                <div className="text-green-400 text-xs mb-1">OXYGEN</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                      style={{ width: `${gameState.oxygen}%` }}
                    />
                  </div>
                  <span className="text-white font-mono text-sm">{Math.round(gameState.oxygen)}%</span>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2">
                <div className="text-blue-400 text-xs mb-1">TIME</div>
                <div className="text-white font-mono text-lg">
                  {Math.floor(gameState.timeRemaining / 60)}:{String(gameState.timeRemaining % 60).padStart(2, '0')}
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-4 py-2">
                <div className="text-yellow-400 text-xs mb-1">SCORE</div>
                <div className="text-white font-mono text-lg">{gameState.score}</div>
              </div>
            </div>

            {/* Center: Current Task */}
            {currentTask && gameState.started && (
              <div className="bg-black/80 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg px-6 py-4 max-w-md">
                <div className="text-cyan-400 text-sm font-bold mb-1">CURRENT MISSION</div>
                <div className="text-white font-bold text-lg mb-2">{currentTask.title}</div>
                <div className="text-gray-300 text-sm mb-3">{currentTask.description}</div>
                <div className="text-purple-400 text-xs italic">💡 {currentTask.educationalFact}</div>
              </div>
            )}

            {/* Right: Controls */}
            <div className="bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2 text-xs text-gray-300">
              <div className="text-purple-400 font-bold mb-2">CONTROLS</div>
              <div className="space-y-1">
                <div>WASD - Move</div>
                <div>Q/E - Depth</div>
                <div>← → - Rotate</div>
                <div>F - Interact</div>
                <div>ESC - Pause</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-cyan-500/30 rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Bottom: Tasks Progress */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-center gap-4">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  index < gameState.tasksCompleted
                    ? 'bg-green-900/50 border-green-500'
                    : index === gameState.currentTaskIndex
                    ? 'bg-cyan-900/50 border-cyan-500 animate-pulse'
                    : 'bg-gray-900/50 border-gray-600'
                }`}
              >
                <div className="text-xs text-gray-400">Task {index + 1}</div>
                <div className="text-white font-bold text-sm">{task.title.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Overlay */}
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-20"
          >
            <div className="bg-gradient-to-br from-gray-900 to-blue-900/30 border-2 border-cyan-500 rounded-xl p-8 max-w-2xl">
              <h2 className="text-4xl font-bold text-white mb-4 text-center">
                🏊 NBL Training Simulation
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                Welcome to NASA's Neutral Buoyancy Laboratory. Complete underwater tasks to train for spacewalks!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/40 rounded-lg p-4">
                  <h3 className="text-cyan-400 font-bold mb-2">🎯 Objectives</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Navigate the 40ft deep pool</li>
                    <li>• Complete {tasks.length} training tasks</li>
                    <li>• Manage oxygen supply</li>
                    <li>• Use proper equipment</li>
                  </ul>
                </div>
                <div className="bg-black/40 rounded-lg p-4">
                  <h3 className="text-purple-400 font-bold mb-2">🎮 Controls</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• W/A/S/D - Move around</li>
                    <li>• Q/E - Change depth</li>
                    <li>• Arrow Keys - Rotate</li>
                    <li>• F - Grab/Use objects</li>
                  </ul>
                </div>
              </div>

              <motion.button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Press SPACE or Click to Start
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Message Display */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-black/90 border-2 border-cyan-500 rounded-lg px-8 py-4 text-white text-xl font-bold text-center z-30"
            >
              {currentMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
        >
          EXIT
        </button>
      </motion.div>
    </AnimatePresence>
  )
}