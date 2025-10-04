import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateUserSubscriptionFromRevenueCat, getUserById } from '@/lib/database'
import { RevenueCatCustomerInfo, SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/lib/types'

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

    const { customerInfo, plan } = await request.json()

    // Validate inputs
    if (!customerInfo || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: customerInfo and plan' },
        { status: 400 }
      )
    }

    // Validate plan exists
    if (!SUBSCRIPTION_PLANS[plan as SubscriptionPlan]) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
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

    // Process RevenueCat customer info
    const revenueCatInfo: RevenueCatCustomerInfo = {
      originalAppUserId: customerInfo.originalAppUserId || user.revenueCatUserId || user._id!.toString(),
      allPurchaseDates: customerInfo.allPurchaseDates || {},
      allExpirationDates: customerInfo.allExpirationDates || {},
      activeSubscriptions: customerInfo.activeSubscriptions || [],
      allActiveSubscriptions: customerInfo.allActiveSubscriptions || [],
      nonSubscriptionTransactions: customerInfo.nonSubscriptionTransactions || [],
      latestExpirationDate: customerInfo.latestExpirationDate,
      originalApplicationVersion: customerInfo.originalApplicationVersion,
      entitlements: customerInfo.entitlements || {}
    }

    // Update user subscription
    const success = await updateUserSubscriptionFromRevenueCat(
      currentUser.userId,
      plan as SubscriptionPlan,
      revenueCatInfo
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to sync subscription' },
        { status: 500 }
      )
    }

    // Get updated user data
    const updatedUser = await getUserById(currentUser.userId)
    
    console.log(`Subscription synced for user ${user.email}: ${plan}`)

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      user: {
        subscriptionPlan: updatedUser?.subscriptionPlan,
        isSubscriptionActive: updatedUser?.isSubscriptionActive,
        subscriptionEndDate: updatedUser?.subscriptionEndDate,
        aiChatsUsed: updatedUser?.aiChatsUsed,
        aiChatsLimit: updatedUser?.aiChatsLimit
      }
    })

  } catch (error: any) {
    console.error('Error syncing subscription:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to sync subscription',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check current subscription status
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getUserById(currentUser.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: user.subscriptionPlan,
        isActive: user.isSubscriptionActive,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        aiChatsUsed: user.aiChatsUsed,
        aiChatsLimit: user.aiChatsLimit,
        revenueCatUserId: user.revenueCatUserId,
        lastSync: user.lastRevenueCatSync
      },
      planDetails: SUBSCRIPTION_PLANS[user.subscriptionPlan]
    })

  } catch (error: any) {
    console.error('Error getting subscription status:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to get subscription status' 
      },
      { status: 500 }
    )
  }
} 