import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/database'
import { generateMagicLinkToken, sendMagicLinkEmail } from '@/lib/auth'
import { withUnsentDB } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

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

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(normalizedEmail)
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered. Please use the login form instead.' },
        { status: 409 }
      )
    }

    // Crear nuevo usuario con plan gratuito "Whisper of Dawn"
    const newUser = await createUser(normalizedEmail, name, 'whisper')

    // Generar magic link para verificación
    const { token, expiresAt } = generateMagicLinkToken()

    // Guardar token en base de datos
    await withUnsentDB(async (db) => {
      await db.collection('users').updateOne(
        { _id: newUser._id },
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
      message: 'Account created successfully! Please check your email for the magic link to access your account.',
      success: true,
      user: {
        id: newUser._id?.toString(),
        name: newUser.name,
        email: newUser.email,
        subscriptionPlan: newUser.subscriptionPlan,
        isSubscriptionActive: newUser.isSubscriptionActive,
        aiChatsUsed: newUser.aiChatsUsed,
        aiChatsLimit: newUser.aiChatsLimit
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error registering user:', error)
    
    if (error.message === 'This email is already registered') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 