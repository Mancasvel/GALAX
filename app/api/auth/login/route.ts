import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/database'
import { generateMagicLinkToken, sendMagicLinkEmail } from '@/lib/auth'
import { withUnsentDB } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validación básica
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Buscar usuario por email
    const user = await getUserByEmail(normalizedEmail)
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please register first.' },
        { status: 404 }
      )
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // Generar magic link
    const { token, expiresAt } = generateMagicLinkToken()

    // Guardar token en base de datos
    await withUnsentDB(async (db) => {
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            magicLinkToken: token,
            magicLinkExpiration: expiresAt,
            updatedAt: new Date()
          }
        }
      )
    })

    // Generar URL del magic link
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
    const magicLinkUrl = `${baseUrl}/auth/verify?token=${token}`

    // Enviar email con magic link
    await sendMagicLinkEmail(normalizedEmail, magicLinkUrl)

    return NextResponse.json({
      message: 'Magic link sent! Please check your email to access your account.',
      success: true,
      user: {
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        isSubscriptionActive: user.isSubscriptionActive
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error sending magic link:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 