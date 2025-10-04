import { NextRequest, NextResponse } from 'next/server'
import { withUnsentDB } from '@/lib/mongodb'
import { verifyMagicLinkToken, createUserSession } from '@/lib/auth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "pawsitive-secret-key-2024"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const result = await withUnsentDB(async (db) => {
      const usersCollection = db.collection('users')
      
      // Find user with this magic link token
      const user = await usersCollection.findOne({
        magicLinkToken: token,
        magicLinkExpiration: { $gt: new Date() }
      })

      if (!user) {
        return { success: false, error: 'Invalid or expired token' }
      }

      // Verify the token (additional security check)
      const isValid = verifyMagicLinkToken(
        token, 
        user.magicLinkToken, 
        user.magicLinkExpiration
      )

      if (!isValid) {
        return { success: false, error: 'Invalid token' }
      }

      // Clear the magic link token (one-time use)
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $unset: {
            magicLinkToken: "",
            magicLinkExpiration: ""
          },
          $set: {
            updatedAt: new Date(),
            lastLoginAt: new Date()
          }
        }
      )

      return { success: true, user }
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Create JWT session token
    const sessionToken = jwt.sign(
      {
        userId: result.user._id.toString(),
        email: result.user.email,
        name: result.user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response with session cookie
    const response = NextResponse.json({
      message: 'Authentication successful',
      success: true,
      user: {
        id: result.user._id.toString(),
        email: result.user.email,
        name: result.user.name,
        isPremium: result.user.isPremium,
        isActive: result.user.isActive
      }
    }, { status: 200 })

    // Set HTTP-only cookie for security
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Error in token verification:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 