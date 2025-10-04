import { NextRequest, NextResponse } from 'next/server'
import { withUnsentDB } from '@/lib/mongodb'
import { generateMagicLinkToken, sendMagicLinkEmail } from '@/lib/auth'
import { User } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }

    const result = await withUnsentDB(async (db) => {
      const usersCollection = db.collection('users')
      
      // Find or create user
      let user = await usersCollection.findOne({ email: email.toLowerCase() })
      
      if (!user) {
        // Create new user
        const newUser: User = {
          email: email.toLowerCase(),
          name: email.split('@')[0], // Temporary name based on email
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          isPremium: false,
          totalConversations: 0,
          emotionalJourney: []
        }
        
        const insertResult = await usersCollection.insertOne(newUser)
        user = { ...newUser, _id: insertResult.insertedId }
      }

      // Generate magic link token
      const { token, expiresAt } = generateMagicLinkToken()
      
      // Update user with token
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            magicLinkToken: token,
            magicLinkExpiration: expiresAt,
            updatedAt: new Date()
          }
        }
      )

      return { user, token }
    })

    // Generate the correct base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3001'
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`
    
    // Send email with magic link
    const magicLinkUrl = `${baseUrl}/auth/verify?token=${result.token}`
    
    await sendMagicLinkEmail(email, magicLinkUrl)

    return NextResponse.json({
      message: 'Magic link sent successfully',
      success: true
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error in magic link:', error)
    
    if (error.message.includes('Email')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 