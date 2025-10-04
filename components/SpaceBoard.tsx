'use client'

import { motion } from 'framer-motion'
import { PlayerData } from '@/models/Player'

interface SpaceBoardProps {
  player: PlayerData
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
  // Responsive center coordinates - smaller on mobile
  const centerX = typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : 400
  const centerY = typeof window !== 'undefined' && window.innerWidth < 640 ? 250 : 300
  
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

  // Function to create hexagon path
  const createHexagonPath = (cx: number, cy: number, size: number) => {
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2
      const x = cx + size * Math.cos(angle)
      const y = cy + size * Math.sin(angle)
      points.push(`${x},${y}`)
    }
    return points.join(' ')
  }

  // Calculate hexagon window positions
  const getHexagonPosition = (angle: number, distance: number) => {
    const radian = (angle * Math.PI) / 180
    return {
      x: centerX + distance * Math.cos(radian),
      y: centerY + distance * Math.sin(radian)
    }
  }

  // Create trapezoidal panel shape (structural panels around windows)
  const createTrapezoidalPanel = (angle: number, innerDist: number, outerDist: number, width: number) => {
    const radian = (angle * Math.PI) / 180
    const perpRadian = radian + Math.PI / 2
    
    const inner1X = centerX + innerDist * Math.cos(radian) + (width / 2) * Math.cos(perpRadian)
    const inner1Y = centerY + innerDist * Math.sin(radian) + (width / 2) * Math.sin(perpRadian)
    
    const inner2X = centerX + innerDist * Math.cos(radian) - (width / 2) * Math.cos(perpRadian)
    const inner2Y = centerY + innerDist * Math.sin(radian) - (width / 2) * Math.sin(perpRadian)
    
    const outer1X = centerX + outerDist * Math.cos(radian) + (width * 0.8) * Math.cos(perpRadian)
    const outer1Y = centerY + outerDist * Math.sin(radian) + (width * 0.8) * Math.sin(perpRadian)
    
    const outer2X = centerX + outerDist * Math.cos(radian) - (width * 0.8) * Math.cos(perpRadian)
    const outer2Y = centerY + outerDist * Math.sin(radian) - (width * 0.8) * Math.sin(perpRadian)
    
    return `${inner1X},${inner1Y} ${outer1X},${outer1Y} ${outer2X},${outer2Y} ${inner2X},${inner2Y}`
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden touch-none">
      {/* Enhanced space background */}
      <div className="absolute inset-0">
        {/* Deep space gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(30, 58, 138, 0.5) 0%, rgba(0, 0, 0, 0.9) 40%, #000000 80%)',
          }}
        />

        {/* Earth glow in center */}
        <div 
          className="absolute"
          style={{
            width: '700px',
            height: '700px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle at 40% 40%, rgba(100, 181, 246, 0.4) 0%, rgba(33, 150, 243, 0.25) 25%, rgba(13, 71, 161, 0.15) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)'
          }}
        />

        {/* Stars */}
        {Array.from({ length: 250 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.85 ? '2px' : '1px',
              height: Math.random() > 0.85 ? '2px' : '1px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              boxShadow: Math.random() > 0.9 ? `0 0 ${Math.random() * 4 + 1}px rgba(255,255,255,0.9)` : 'none'
            }}
          />
        ))}
      </div>

      {/* Cupola Structure */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Dark metallic frame gradient */}
          <linearGradient id="darkMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d0d0d" />
            <stop offset="25%" stopColor="#1a1a1a" />
            <stop offset="50%" stopColor="#050505" />
            <stop offset="75%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>

          {/* Structural panel gradient */}
          <linearGradient id="structuralPanel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d2d2d" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>

          {/* Glass/space view for windows */}
          <radialGradient id="spaceView">
            <stop offset="0%" stopColor="rgba(30, 58, 138, 0.3)" />
            <stop offset="60%" stopColor="rgba(0, 26, 51, 0.6)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.95)" />
          </radialGradient>

          {/* Path-specific space views */}
          {paths.map((path) => (
            <radialGradient key={`space-${path.name}`} id={`space-${path.name.replace(/\s+/g, '-')}`}>
              <stop offset="0%" stopColor={path.color} stopOpacity="0.12" />
              <stop offset="30%" stopColor={path.color} stopOpacity="0.08" />
              <stop offset="70%" stopColor="#001a33" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
            </radialGradient>
          ))}

          {/* Reflection gradient */}
          <linearGradient id="glassReflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Outer structural ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={295}
          fill="#0a0a0a"
          stroke="#000000"
          strokeWidth={8}
          opacity={0.95}
        />

        {/* Trapezoidal structural panels around each window */}
        {paths.map((path, index) => (
          <g key={`panel-${path.name}`}>
            {/* Outer structural panel */}
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
              points={createTrapezoidalPanel(path.angle, 110, 250, 45)}
              fill="url(#structuralPanel)"
              stroke="#000000"
              strokeWidth={3}
              opacity={0.9}
            />
            
            {/* Panel details - rivets */}
            {Array.from({ length: 4 }).map((_, i) => {
              const dist = 110 + ((250 - 110) / 3) * i
              const pos = getHexagonPosition(path.angle, dist)
              return (
                <circle
                  key={i}
                  cx={pos.x}
                  cy={pos.y}
                  r={2}
                  fill="#1a1a1a"
                  stroke="#404040"
                  strokeWidth={0.5}
                />
              )
            })}
          </g>
        ))}

        {/* Hexagonal side windows */}
        {paths.map((path, index) => {
          const hexDistance = 175
          const hexPos = getHexagonPosition(path.angle, hexDistance)
          const hexSize = 72
          const frameSize = 80
          
          return (
            <g key={path.name} className="cursor-pointer" onClick={() => onPathSelect(path.name)}>
              {/* Thick outer metal frame */}
              <motion.polygon
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 * index }}
                points={createHexagonPath(hexPos.x, hexPos.y, frameSize)}
                fill="url(#darkMetal)"
                stroke="#000000"
                strokeWidth={14}
                style={{
                  filter: 'drop-shadow(0px 6px 15px rgba(0, 0, 0, 0.95))'
                }}
              />

              {/* Inner frame ring */}
              <polygon
                points={createHexagonPath(hexPos.x, hexPos.y, frameSize - 4)}
                fill="none"
                stroke="#2d2d2d"
                strokeWidth={1.5}
                opacity={0.7}
              />

              {/* Space view through window */}
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.25 + 0.1 * index }}
                points={createHexagonPath(hexPos.x, hexPos.y, hexSize)}
                fill={`url(#space-${path.name.replace(/\s+/g, '-')})`}
                stroke={path.color}
                strokeWidth={2.5}
                opacity={0.95}
                style={{
                  filter: `drop-shadow(0 0 18px ${path.color}70)`
                }}
              />

              {/* Glass reflection on top part */}
              <polygon
                points={createHexagonPath(hexPos.x, hexPos.y - 12, hexSize - 20)}
                fill="url(#glassReflection)"
                opacity={0.25}
                className="pointer-events-none"
              />

              {/* Inner glow border */}
              <polygon
                points={createHexagonPath(hexPos.x, hexPos.y, hexSize - 3)}
                fill="none"
                stroke={path.color}
                strokeWidth={1.5}
                opacity={0.5}
                style={{
                  filter: `drop-shadow(0 0 10px ${path.color}80)`
                }}
              />

              {/* Corner rivets/bolts */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (Math.PI / 3) * i - Math.PI / 2
                const rivetX = hexPos.x + (frameSize - 6) * Math.cos(angle)
                const rivetY = hexPos.y + (frameSize - 6) * Math.sin(angle)
                
                return (
                  <g key={i}>
                    <circle cx={rivetX} cy={rivetY} r={3.5} fill="#0a0a0a" stroke="#303030" strokeWidth={0.8} />
                    <circle cx={rivetX - 0.8} cy={rivetY - 0.8} r={1.8} fill="#1a1a1a" />
                  </g>
                )
              })}

              {/* Progress indicator */}
              {path.progress > 0 && (
                <>
                  <circle
                    cx={hexPos.x}
                    cy={hexPos.y}
                    r={hexSize + 8}
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.25)"
                    strokeWidth={3.5}
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 2 * Math.PI * (hexSize + 8) }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * (hexSize + 8) * (1 - path.progress / 3)
                    }}
                    transition={{ duration: 1.5, delay: 0.6 + 0.1 * index }}
                    cx={hexPos.x}
                    cy={hexPos.y}
                    r={hexSize + 8}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={3.5}
                    strokeDasharray={`${2 * Math.PI * (hexSize + 8)}`}
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 8px #10b981)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: `${hexPos.x}px ${hexPos.y}px`
                    }}
                  />
                  <text
                    x={hexPos.x}
                    y={hexPos.y + 6}
                    textAnchor="middle"
                    className="text-sm font-bold"
                    fill="#10b981"
                    style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                      textShadow: '0 0 10px rgba(16, 185, 129, 0.9)'
                    }}
                  >
                    {path.progress}/3
                  </text>
                </>
              )}

              {/* Hover effect */}
              <polygon
                points={createHexagonPath(hexPos.x, hexPos.y, hexSize)}
                fill={path.color}
                opacity={0}
                className="transition-opacity duration-300 hover:opacity-25"
              />
            </g>
          )
        })}

        {/* Central circular Nadir window */}
        <g>
          {/* Outer frame ring */}
          <motion.circle
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            cx={centerX}
            cy={centerY}
            r={100}
            fill="url(#darkMetal)"
            stroke="#000000"
            strokeWidth={18}
            style={{
              filter: 'drop-shadow(0px 8px 20px rgba(0, 0, 0, 0.95))'
            }}
          />

          {/* Frame detail rings */}
          {[96, 88, 82].map((r, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke={i === 0 ? "#2d2d2d" : i === 1 ? "#1a1a1a" : "#404040"}
              strokeWidth={i === 2 ? 0.8 : 1.2}
              opacity={i === 2 ? 0.8 : 0.5}
            />
          ))}

          {/* Central space view */}
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            cx={centerX}
            cy={centerY}
            r={78}
            fill="url(#spaceView)"
            stroke="rgba(16, 185, 129, 0.5)"
            strokeWidth={2.5}
            style={{
              filter: 'drop-shadow(0 0 25px rgba(16, 185, 129, 0.4))'
            }}
          />

          {/* Earth visible through center */}
          <circle
            cx={centerX}
            cy={centerY + 12}
            r={50}
            fill="radial-gradient(circle at 35% 35%, rgba(100, 181, 246, 0.5), rgba(33, 150, 243, 0.35), rgba(13, 71, 161, 0.25))"
            opacity={0.7}
          />

          {/* Glass reflection */}
          <ellipse
            cx={centerX - 15}
            cy={centerY - 20}
            rx={35}
            ry={30}
            fill="url(#glassReflection)"
            opacity={0.3}
            className="pointer-events-none"
          />

          {/* Central indicator dot */}
          <motion.circle
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            cx={centerX}
            cy={centerY}
            r={8}
            fill="#10b981"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))'
            }}
          />

          {/* Rivets around central window */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (Math.PI * 2 / 16) * i
            const rivetX = centerX + 91 * Math.cos(angle)
            const rivetY = centerY + 91 * Math.sin(angle)
            
            return (
              <g key={i}>
                <circle cx={rivetX} cy={rivetY} r={3.8} fill="#0a0a0a" stroke="#303030" strokeWidth={0.8} />
                <circle cx={rivetX - 0.8} cy={rivetY - 0.8} r={2} fill="#1a1a1a" />
              </g>
            )
          })}

          {/* Pulsing ring indicator */}
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={85}
            fill="none"
            stroke="rgba(16, 185, 129, 0.35)"
            strokeWidth={1.5}
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.35, 0.65, 0.35]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              transformOrigin: `${centerX}px ${centerY}px`
            }}
          />
        </g>

        {/* Labels */}
        {paths.map((path, index) => {
          const labelDistance = 272
          const labelPos = getHexagonPosition(path.angle, labelDistance)
          
          return (
            <g key={`label-${path.name}`}>
              <foreignObject
                x={labelPos.x - 115}
                y={labelPos.y - 35}
                width={230}
                height={80}
                style={{ overflow: 'visible' }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 + 0.08 * index }}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => onPathSelect(path.name)}
                >
                  <div 
                    className="px-5 py-2.5 rounded-lg text-xs font-bold text-center backdrop-blur-lg whitespace-nowrap transition-all duration-300 group-hover:scale-105 border-2"
                    style={{
                      backgroundColor: `${path.color}28`,
                      borderColor: path.color,
                      boxShadow: `0 0 22px ${path.color}55, inset 0 0 12px ${path.color}18`,
                      color: '#ffffff',
                      textShadow: `0 0 10px ${path.color}90`
                    }}
                  >
                    {path.name}
                  </div>
                  
                  <div 
                    className="text-xs text-center mt-2.5 font-bold whitespace-nowrap transition-all duration-300 group-hover:scale-105"
                    style={{
                      color: path.color,
                      textShadow: `0 0 14px ${path.color}, 0 0 8px ${path.color}90`
                    }}
                  >
                    {path.mentor}
                  </div>
                </motion.div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}