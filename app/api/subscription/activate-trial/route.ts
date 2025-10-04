import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateUserSubscriptionFromRevenueCat, getUserById } from '@/lib/database'
import { RevenueCatCustomerInfo } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { plan } = await request.json()

    // Verify it's the whisper (free trial) plan
    if (plan !== 'whisper') {
      return NextResponse.json(
        { error: 'This endpoint is only for free trial activation' },
        { status: 400 }
      )
    }

    // Get user details
    const user = await getUserById(currentUser.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    if (user.isSubscriptionActive && user.subscriptionPlan !== 'whisper') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Create mock RevenueCat customer info for free trial
    const now = new Date()
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const mockCustomerInfo: RevenueCatCustomerInfo = {
      originalAppUserId: user.revenueCatUserId || user._id!.toString(),
      allPurchaseDates: { 'whisper_trial': now.toISOString() },
      allExpirationDates: { 'whisper_trial': trialEnd.toISOString() },
      activeSubscriptions: ['whisper_trial'],
      allActiveSubscriptions: ['whisper_trial'],
      nonSubscriptionTransactions: [],
      latestExpirationDate: trialEnd.toISOString(),
      entitlements: {
        whisper_access: {
          identifier: 'whisper_access',
          isActive: true,
          willRenew: false,
          periodType: 'trial',
          latestPurchaseDate: now.toISOString(),
          originalPurchaseDate: now.toISOString(),
          expirationDate: trialEnd.toISOString(),
          store: 'web',
          productIdentifier: 'whisper_trial',
          isSandbox: process.env.NODE_ENV !== 'production'
        }
      }
    }

    // Update user subscription
    const success = await updateUserSubscriptionFromRevenueCat(
      currentUser.userId,
      'whisper',
      mockCustomerInfo
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to activate trial' },
        { status: 500 }
      )
    }

    console.log(`Free trial activated for user ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Free trial activated successfully',
      plan: 'whisper',
      expiresAt: trialEnd.toISOString()
    })

  } catch (error: any) {
    console.error('Error activating trial:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to activate trial' 
      },
      { status: 500 }
    )
  }
} 