import { NextRequest, NextResponse } from 'next/server'
import { getAllSubscriptionPlans } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'
import { getUserById } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los planes disponibles
    const plans = getAllSubscriptionPlans()

    // Obtener información del usuario actual si está autenticado
    let currentUserPlan = null
    const currentUser = getCurrentUser(request)
    
    if (currentUser) {
      const user = await getUserById(currentUser.userId)
      if (user) {
        currentUserPlan = {
          current: user.subscriptionPlan,
          isActive: user.isSubscriptionActive,
          endDate: user.subscriptionEndDate,
          aiChatsUsed: user.aiChatsUsed,
          aiChatsLimit: user.aiChatsLimit,
          revenueCatUserId: user.revenueCatUserId
        }
      }
    }

    // Formatear los planes para el frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.name,
      name: plan.spiritualName,
      description: plan.description,
      price: plan.price,
      currency: 'EUR',
      duration: plan.duration,
      durationType: plan.duration === 7 ? 'trial' : 'monthly',
      aiChatsLimit: plan.aiChatsLimit,
      features: plan.features,
      isActive: plan.isActive,
      isFree: plan.price === 0,
      isPopular: plan.name === 'depths', // Marcar el plan medio como popular
      
      // RevenueCat Integration
      revenueCat: {
        productId: plan.revenueCatProductId,
        entitlementId: plan.revenueCatEntitlementId
      },
      
      // Plan styling para el frontend
      styling: {
        color: getPlanColor(plan.name),
        gradient: getPlanGradient(plan.name),
        icon: getPlanIcon(plan.name)
      }
    }))

    return NextResponse.json({
      success: true,
      plans: formattedPlans,
      currentUser: currentUserPlan,
      meta: {
        totalPlans: formattedPlans.length,
        freePlans: formattedPlans.filter(p => p.isFree).length,
        paidPlans: formattedPlans.filter(p => !p.isFree).length
      }
    })

  } catch (error: any) {
    console.error('Error getting subscription plans:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to get subscription plans' 
      },
      { status: 500 }
    )
  }
}

// Funciones auxiliares para styling
function getPlanColor(planName: string): string {
  const colors = {
    whisper: '#8b5cf6',
    reflection: '#06b6d4',
    depths: '#10b981',
    transcendence: '#f59e0b'
  }
  return colors[planName as keyof typeof colors] || '#8b5cf6'
}

function getPlanGradient(planName: string): string {
  const gradients = {
    whisper: 'from-purple-500 to-pink-500',
    reflection: 'from-cyan-500 to-blue-500',
    depths: 'from-emerald-500 to-teal-500',
    transcendence: 'from-amber-500 to-orange-500'
  }
  return gradients[planName as keyof typeof gradients] || 'from-purple-500 to-pink-500'
}

function getPlanIcon(planName: string): string {
  const icons = {
    whisper: '🌅',
    reflection: '🪞',
    depths: '🌊',
    transcendence: '✨'
  }
  return icons[planName as keyof typeof icons] || '✨'
} 