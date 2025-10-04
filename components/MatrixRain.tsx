'use client'

import { useEffect, useRef } from 'react'

interface MatrixRainProps {
  color?: string
  className?: string
}

export default function MatrixRain({ color = '#9f7aea', className = '' }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const chars = '01'
    const fontSize = 14
    let columns = Math.floor(canvas.width / fontSize)
    columns = Math.floor(columns * 0.5) // Menos líneas

    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height
    }

    const draw = () => {
      // Fondo más difuso
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = color
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(text, x, y)

        if (y > canvas.height && Math.random() > 0.99) {
          drops[i] = 0
        }

        // Movimiento más lento
        drops[i] += 0.1 + Math.random() * 0.2
      }
    }

    const interval = setInterval(draw, 50)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none blur-sm opacity-80 ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
