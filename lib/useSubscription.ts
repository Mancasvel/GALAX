import { useState, useEffect, useCallback } from 'react'
import { Purchases } from '@revenuecat/purchases-js'
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from './types'

interface SubscriptionStatus {
  plan: SubscriptionPlan
  isActive: boolean
  startDate: string
  endDate: string
  aiChatsUsed: number
  aiChatsLimit: number
  revenueCatUserId?: string
  lastSync?: string
}

interface UseSubscriptionReturn {
  subscription: SubscriptionStatus | null
  loading: boolean
  error: string | null
  refreshSubscription: () => Promise<void>
  canUseAI: boolean
  daysRemaining: number
  initializeRevenueCat: () => Promise<void>
  isRevenueCatReady: boolean
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRevenueCatReady, setIsRevenueCatReady] = useState(false)

  // Initialize RevenueCat
  const initializeRevenueCat = useCallback(async () => {
    try {
      if (isRevenueCatReady) return

      const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY
      if (!apiKey) {
        throw new Error('RevenueCat API key not configured')
      }

      await Purchases.configure({
        apiKey,
        appUserId: 'anonymous-' + Date.now() // Let RevenueCat generate anonymous ID
      })

      setIsRevenueCatReady(true)
    } catch (error: any) {
      console.error('Error initializing RevenueCat:', error)
      setError(error.message || 'Failed to initialize payment system')
    }
  }, [isRevenueCatReady])

  // Fetch subscription status
  const refreshSubscription = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/subscription/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated
          setSubscription(null)
          return
        }
        throw new Error('Failed to fetch subscription status')
      }

      const data = await response.json()
      
      if (data.success) {
        setSubscription(data.subscription)
      } else {
        throw new Error(data.message || 'Failed to get subscription')
      }

    } catch (error: any) {
      console.error('Error fetching subscription:', error)
      setError(error.message || 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    refreshSubscription()
    initializeRevenueCat()
  }, [refreshSubscription, initializeRevenueCat])

  // Calculate derived values
  const canUseAI = subscription 
    ? subscription.isActive && subscription.aiChatsUsed < subscription.aiChatsLimit
    : false

  const daysRemaining = subscription 
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    canUseAI,
    daysRemaining,
    initializeRevenueCat,
    isRevenueCatReady
  }
}

// Hook específico para verificar si el usuario puede usar funciones premium
export function usePremiumAccess() {
  const { subscription, canUseAI, loading } = useSubscription()

  const isPremium = subscription?.isActive && subscription?.plan !== 'whisper'
  const isTrialUser = subscription?.plan === 'whisper'
  const hasAIAccess = canUseAI
  
  const getRemainingAIChats = () => {
    if (!subscription) return 0
    return Math.max(0, subscription.aiChatsLimit - subscription.aiChatsUsed)
  }

  const getPlanLimitations = () => {
    if (!subscription) return null
    
    const planDetails = SUBSCRIPTION_PLANS[subscription.plan]
    return {
      aiChatsLimit: planDetails.aiChatsLimit,
      aiChatsUsed: subscription.aiChatsUsed,
      remainingChats: getRemainingAIChats(),
      features: planDetails.features
    }
  }

// Hook para manejar compras
export function usePurchases() {
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [isRevenueCatReady, setIsRevenueCatReady] = useState(false)

  const purchaseSubscription = async (planId: SubscriptionPlan) => {
    try {
      setPurchasing(planId)
      setPurchaseError(null)

      // Ensure RevenueCat is initialized
      if (!isRevenueCatReady) {
        await initializeRevenueCat()
      }

      const planDetails = SUBSCRIPTION_PLANS[planId]
      
      // For free trial, use our API
      if (planId === 'whisper') {
        const response = await fetch('/api/subscription/activate-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to activate trial')
        }

        await refreshSubscription()
        return { success: true }
      }

      // Simplified purchase flow - RevenueCat integration to be completed in production
      // For now, just sync with backend
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId
        })
      })

      if (!response.ok) {
        throw new Error('Purchase failed - backend sync error')
      }

      const customerInfo = await response.json()

      if (!customerInfo.success) {
        throw new Error('Purchase was not successful')
      }

      await refreshSubscription()
      return { success: true }

    } catch (error: any) {
      console.error('Purchase error:', error)
      setPurchaseError(error.message || 'Purchase failed')
      return { success: false, error: error.message }
    } finally {
      setPurchasing(null)
    }
  }

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    canUseAI: subscription?.isActive || false,
    daysRemaining: subscription?.isActive ?
      Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
    initializeRevenueCat,
    isRevenueCatReady,
    purchaseSubscription,
    restorePurchases,
    purchasing,
    purchaseError
  }
}

// Export the usePurchases hook separately
export { usePurchases } 