import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth'
import { getUserById } from '@/lib/database'
import { SUBSCRIPTION_PLANS } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Obtener información completa del usuario
    const user = await getUserById(currentUser.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Obtener detalles del plan de suscripción
    const planDetails = SUBSCRIPTION_PLANS[user.subscriptionPlan]
    
    // Si no existe el plan, usar valores por defecto
    if (!planDetails) {
      console.warn(`Plan ${user.subscriptionPlan} not found in SUBSCRIPTION_PLANS, defaulting to whisper`)
      user.subscriptionPlan = 'whisper'
    }
    
    const finalPlanDetails = planDetails || SUBSCRIPTION_PLANS.whisper

    // Verificar si la suscripción está activa
    const isSubscriptionActive = user.isSubscriptionActive && user.subscriptionEndDate > new Date()

    return NextResponse.json({
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionPlanName: finalPlanDetails.spiritualName,
        subscriptionPlanDescription: finalPlanDetails.description,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        isSubscriptionActive,
        isAdmin: user.isAdmin || false,
        aiChatsUsed: user.aiChatsUsed,
        aiChatsLimit: user.aiChatsLimit,
        aiChatsRemaining: Math.max(0, user.aiChatsLimit - user.aiChatsUsed),
        totalConversations: user.totalConversations,
        emotionalJourney: user.emotionalJourney,
        isPremium: user.isPremium, // Compatibilidad con sistema anterior
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        planFeatures: finalPlanDetails.features,
        planPrice: finalPlanDetails.price,
        planDuration: finalPlanDetails.duration
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error getting current user:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 