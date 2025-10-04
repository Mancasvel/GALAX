import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { User, AuthSession } from './types'

const JWT_SECRET = process.env.JWT_SECRET || "pawsitive-secret-key-2024"

interface JWTPayload {
  userId: string
  email: string
  name: string
  iat: number
  exp: number
}

// SMTP Configuration with fallback for development
const createTransporter = () => {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  
  // Only create transporter if credentials are available
  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
  }
  
  return null
}

const transporter = createTransporter()

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from cookie
  const token = request.cookies.get('auth-token')?.value
  
  if (token) {
    return token
  }

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export function getCurrentUser(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  return verifyToken(token)
}

export function requireAuth(request: NextRequest): JWTPayload {
  const user = getCurrentUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Generate a magic link token
 */
export function generateMagicLinkToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  
  return { token, expiresAt }
}

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(email: string, magicLinkUrl: string): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@unsent.app',
      to: email,
      subject: 'Your magic link for Unsent',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; font-size: 2.5em; margin: 0; text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);">UNSENT</h1>
            <p style="color: #a855f7; font-size: 1.2em; margin: 10px 0 0 0;">Messages that were never sent</p>
          </div>
          
          <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello,<br><br>
              You've requested access to your personal space in Unsent. Click the link below to continue:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLinkUrl}" 
                 style="display: inline-block; padding: 15px 30px; background: linear-gradient(45deg, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
                Access Unsent
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0 0;">
              This link will expire in 15 minutes for security.
            </p>
          </div>
          
          <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              🔒 Your messages are encrypted and completely private<br>
              If you didn't request this link, you can safely ignore this email
            </p>
          </div>
        </div>
      `
    }

    if (transporter) {
      await transporter.sendMail(mailOptions)
      console.log('Magic link email sent successfully to:', email)
    } else {
      // Development fallback - log the magic link instead of sending email
      console.log('┌─────────────────────────────────────────────────┐')
      console.log('│            🚀 DEVELOPMENT MODE                  │')
      console.log('│         Magic Link for Testing                  │')
      console.log('├─────────────────────────────────────────────────┤')
      console.log('│ Email:', email.padEnd(35), '│')
      console.log('│ Magic Link URL:                                 │')
      console.log('│', magicLinkUrl.padEnd(47), '│')
      console.log('├─────────────────────────────────────────────────┤')
      console.log('│ Copy the URL above and paste it in your browser│')
      console.log('│ to complete the login process.                  │')
      console.log('└─────────────────────────────────────────────────┘')
      
      // Don't throw error in development mode - just log
      return
    }
  } catch (error) {
    console.error('Error sending email:', error)
    
    // In development, show the magic link even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('┌─────────────────────────────────────────────────┐')
      console.log('│          ⚠️  EMAIL FAILED - DEV MODE            │')
      console.log('│         Using Console Magic Link                │')
      console.log('├─────────────────────────────────────────────────┤')
      console.log('│ Email:', email.padEnd(35), '│')
      console.log('│ Magic Link URL:                                 │')
      console.log('│', magicLinkUrl.padEnd(47), '│')
      console.log('├─────────────────────────────────────────────────┤')
      console.log('│ Copy the URL above and paste it in your browser│')
      console.log('│ Email service will be configured later.         │')
      console.log('└─────────────────────────────────────────────────┘')
      
      // Don't throw error in development - let user continue with console link
      return
    }
    
    throw new Error('Error sending verification email')
  }
}

/**
 * Verify if a magic link token is valid
 */
export function verifyMagicLinkToken(token: string, storedToken: string, expiresAt: Date): boolean {
  if (!token || !storedToken) return false
  if (new Date() > expiresAt) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken))
}

/**
 * Generate a session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a user session
 */
export function createUserSession(user: User): AuthSession {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  return {
    userId: user._id!.toString(),
    email: user.email,
    name: user.name,
    subscriptionPlan: user.subscriptionPlan,
    isSubscriptionActive: user.isSubscriptionActive,
    aiChatsUsed: user.aiChatsUsed,
    aiChatsLimit: user.aiChatsLimit,
    isPremium: user.isPremium,
    isActive: user.isActive,
    expiresAt
  }
}

/**
 * Validate a user session
 */
export function validateSession(session: AuthSession): boolean {
  if (!session) return false
  if (new Date() > session.expiresAt) return false
  if (!session.isActive) return false
  
  return true
}

/**
 * Generate a secure hash for storing tokens
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Verify if a hash matches a token
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token)
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash))
}

/**
 * Generate a unique device identifier
 */
export function generateDeviceId(): string {
  return crypto.randomUUID()
}

/**
 * Calculate time remaining until expiration
 */
export function getTimeUntilExpiration(expiresAt: Date): number {
  return Math.max(0, expiresAt.getTime() - Date.now())
}

/**
 * Format remaining time in readable text
 */
export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

/**
 * Clean up expired tokens from database
 */
export async function cleanupExpiredTokens(db: any): Promise<void> {
  try {
    const usersCollection = db.collection('users')
    const now = new Date()
    
    await usersCollection.updateMany(
      { magicLinkExpiration: { $lt: now } },
      { 
        $unset: { 
          magicLinkToken: "",
          magicLinkExpiration: "" 
        }
      }
    )
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
  }
} 