'use client'

import { motion } from 'framer-motion'
import { IPlayer } from '@/models/Player'

interface SpaceBoardProps {
  player: IPlayer
  onPathSelect: (pathName: string) => void
  onMentorClick: (mentorName: string) => void
}

interface PathConfig {
  name: string
  angle: number
  color: string
  mentor: string
  unlocked: boolean
  progress: number
}

export function SpaceBoard({ player, onPathSelect, onMentorClick }: SpaceBoardProps) {
  const centerX = 400
  const centerY = 300
  const radius = 200

  const paths: PathConfig[] = [
    {
      name: 'Science & Research',
      angle: 0,
      color: '#3b82f6',
      mentor: 'Dr. Mae Jemison',
      unlocked: true,
      progress: player.progress['Science & Research']
    },
    {
      name: 'Engineering & Systems',
      angle: 60,
      color: '#8b5cf6',
      mentor: 'Bob Behnken',
      unlocked: true,
      progress: player.progress['Engineering & Systems']
    },
    {
      name: 'Medicine & Human Factors',
      angle: 120,
      color: '#10b981',
      mentor: 'Dr. Serena Auñón-Chancellor',
      unlocked: true,
      progress: player.progress['Medicine & Human Factors']
    },
    {
      name: 'Communications & Exploration',
      angle: 180,
      color: '#f59e0b',
      mentor: 'Chris Hadfield',
      unlocked: true,
      progress: player.progress['Communications & Exploration']
    },
    {
      name: 'Astronomy & Navigation',
      angle: 240,
      color: '#ef4444',
      mentor: 'Jessica Watkins',
      unlocked: true,
      progress: player.progress['Astronomy & Navigation']
    },
    {
      name: 'Technology & Innovation',
      angle: 300,
      color: '#6366f1',
      mentor: 'Victor Glover',
      unlocked: true,
      progress: player.progress['Technology & Innovation']
    }
  ]

  const getPathCoordinates = (angle: number, distance: number) => {
    const radian = (angle * Math.PI) / 180
    return {
      x: centerX + distance * Math.cos(radian),
      y: centerY + distance * Math.sin(radian)
    }
  }

  const getPathPoints = (angle: number) => {
    const innerPoint = getPathCoordinates(angle, radius - 40)
    const midPoint = getPathCoordinates(angle, radius + 20)
    const outerPoint = getPathCoordinates(angle, radius + 80)

    return `${innerPoint.x},${innerPoint.y} ${midPoint.x},${midPoint.y} ${outerPoint.x},${outerPoint.y}`
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Radial Paths */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
        {/* Definiciones de gradientes y efectos */}
        <defs>
          <radialGradient id="innerGlow">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          
          {paths.map((path) => (
            <radialGradient key={`gradient-${path.name}`} id={`gradient-${path.name.replace(/\s+/g, '-')}`}>
              <stop offset="0%" stopColor={path.color} stopOpacity="1" />
              <stop offset="100%" stopColor={path.color} stopOpacity="0.6" />
            </radialGradient>
          ))}
          {/* Gradiente para el círculo central */}
          <radialGradient id="centralGradient">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0d9488" />
          </radialGradient>
        </defs>
        
        {paths.map((path, index) => {
          const innerPoint = getPathCoordinates(path.angle, radius - 40)
          const midPoint = getPathCoordinates(path.angle, radius + 20)
          const outerPoint = getPathCoordinates(path.angle, radius + 80)

          return (
            <g key={path.name}>
              {/* Path line */}
              <motion.line
                initial={{ opacity: 0 }}
                animate={{ opacity: path.unlocked ? 1 : 0.3 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                x1={centerX}
                y1={centerY}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke={path.color}
                strokeWidth={path.unlocked ? 3 : 1}
                strokeDasharray={path.unlocked ? "none" : "10,5"}
                className="cursor-pointer"
                onClick={() => onPathSelect(path.name)}
              />

              {/* Path window/node - Anillo exterior brillante */}
              {path.unlocked && (
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.3 + 0.1 * index
                  }}
                  cx={midPoint.x}
                  cy={midPoint.y}
                  r={40}
                  fill="none"
                  stroke={path.color}
                  strokeWidth={2}
                  opacity={0.4}
                  style={{
                    filter: `drop-shadow(0 0 8px ${path.color})`
                  }}
                />
              )}
              
              {/* Path window/node - Círculo principal */}
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + 0.1 * index }}
                cx={midPoint.x}
                cy={midPoint.y}
                r={path.unlocked ? 28 : 15}
                fill={path.color}
                stroke={path.unlocked ? "#fff" : path.color}
                strokeWidth={3}
                className="cursor-pointer"
                onClick={() => onPathSelect(path.name)}
                style={{
                  filter: path.unlocked ? `drop-shadow(0 0 15px ${path.color})` : 'none'
                }}
              >
                <animate
                  attributeName="opacity"
                  values="1;0.8;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </motion.circle>
              
              {/* Círculo interior con brillo */}
              {path.unlocked && (
                <circle
                  cx={midPoint.x}
                  cy={midPoint.y}
                  r={18}
                  fill="url(#innerGlow)"
                  opacity={0.6}
                  className="pointer-events-none"
                />
              )}

              {/* Progress indicator - Anillo de progreso */}
              {path.unlocked && path.progress > 0 && (
                <>
                  {/* Base del anillo */}
                  <circle
                    cx={midPoint.x}
                    cy={midPoint.y}
                    r={38}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={4}
                  />
                  
                  {/* Progreso animado */}
                  <motion.circle
                    initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - path.progress / 3) }}
                    transition={{ duration: 1.5, delay: 0.5 + 0.1 * index, ease: "easeOut" }}
                    cx={midPoint.x}
                    cy={midPoint.y}
                    r={38}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={4}
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 8px #10b981)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: `${midPoint.x}px ${midPoint.y}px`
                    }}
                  />
                  
                  {/* Texto de progreso */}
                  <text
                    x={midPoint.x}
                    y={midPoint.y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                    style={{
                      fontSize: '10px',
                      textShadow: '0 0 5px rgba(0,0,0,0.8)'
                    }}
                  >
                    {path.progress}/3
                  </text>
                </>
              )}
            </g>
          )
        })}

        {/* Path Labels dentro del SVG */}
        {paths.map((path, index) => {
          // Calcular la posición de la etiqueta en el mismo radio que los círculos exteriores
          const labelPoint = getPathCoordinates(path.angle, radius + 100)
          
          return (
            <g key={`label-${path.name}`}>
              {/* Etiqueta del camino usando foreignObject */}
              <foreignObject
                x={labelPoint.x - 90}
                y={labelPoint.y - 25}
                width={180}
                height={60}
                style={{ overflow: 'visible' }}
              >
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => onPathSelect(path.name)}
                  style={{
                    opacity: 1,
                    transform: 'scale(1)',
                    transition: 'all 0.8s ease-in-out'
                  }}
                >
                  {/* Etiqueta del camino */}
                  <div 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 text-center backdrop-blur-sm whitespace-nowrap ${
                      path.unlocked ? 'text-white' : 'text-gray-500'
                    }`}
                    style={{
                      backgroundColor: path.unlocked ? `${path.color}40` : '#1f2937',
                      border: `2px solid ${path.color}`,
                      boxShadow: path.unlocked ? `0 0 20px ${path.color}80, inset 0 0 10px ${path.color}30` : 'none'
                    }}
                  >
                    {path.name}
                  </div>
                  
                  {/* Nombre del mentor */}
                  <div 
                    className="text-xs text-center mt-1.5 font-medium whitespace-nowrap"
                    style={{
                      color: path.unlocked ? path.color : '#6b7280',
                      textShadow: path.unlocked ? `0 0 10px ${path.color}` : 'none'
                    }}
                  >
                    {path.mentor}
                  </div>
                </div>
              </foreignObject>
            </g>
          )
        })}

        {/* Central Hub - Punto de inicio (renderizado al final para estar encima) */}
        <g style={{ zIndex: 100 }}>
          {/* Anillo exterior pulsante */}
          <motion.circle
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            cx={centerX}
            cy={centerY}
            r={35}
            fill="none"
            stroke="rgba(34, 197, 94, 0.6)"
            strokeWidth={3}
            style={{
              filter: 'drop-shadow(0 0 25px rgba(34, 197, 94, 0.7))'
            }}
          />

          {/* Círculo principal verde */}
          <motion.circle
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.2, type: "spring" }}
            cx={centerX}
            cy={centerY}
            r={28}
            fill="url(#centralGradient)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={2}
            style={{
              filter: 'drop-shadow(0 0 35px rgba(34, 197, 94, 0.8))'
            }}
          />

          {/* Círculo interior brillante */}
          <circle
            cx={centerX}
            cy={centerY}
            r={20}
            fill="url(#innerGlow)"
            opacity={0.4}
          />

          {/* Texto del cohete en el centro */}
          <text
            x={centerX}
            y={centerY + 6}
            textAnchor="middle"
            fontSize="24"
            style={{
              filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))'
            }}
          >
            🚀
          </text>

          {/* Partículas orbitales */}
          {[0, 120, 240].map((angle, i) => {
            const particleAngle = (angle * Math.PI) / 180
            const orbitRadius = 35
            return (
              <motion.circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={2}
                fill="#10b981"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.9))'
                }}
                animate={{
                  cx: [
                    centerX + orbitRadius * Math.cos(particleAngle),
                    centerX + orbitRadius * Math.cos(particleAngle + Math.PI * 2)
                  ],
                  cy: [
                    centerY + orbitRadius * Math.sin(particleAngle),
                    centerY + orbitRadius * Math.sin(particleAngle + Math.PI * 2)
                  ]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )
          })}
        </g>
      </svg>

      {/* Interactive hover effects */}
      <div className="absolute inset-0 pointer-events-none">
        {paths.map((path) => {
          const hoverPoint = getPathCoordinates(path.angle, radius + 20)

          return (
            <motion.div
              key={`hover-${path.name}`}
              className="absolute pointer-events-auto"
              style={{
                left: hoverPoint.x - 12,
                top: hoverPoint.y - 12
              }}
              whileHover={{ scale: 1.2 }}
              onClick={() => onPathSelect(path.name)}
            >
              <div className={`w-6 h-6 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 ${
                path.unlocked ? 'bg-white shadow-lg' : 'bg-gray-600'
              }`} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
