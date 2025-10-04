import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Purchases from '@revenuecat/purchases-js'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  duration: number
  durationType: string
  aiChatsLimit: number
  features: string[]
  isFree: boolean
  isPopular: boolean
  revenueCat: {
    productId: string
    entitlementId: string
  }
  styling: {
    color: string
    gradient: string
    icon: string
  }
}

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  onSubscriptionChange?: (plan: string) => void
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  currentPlan,
  onSubscriptionChange 
}: SubscriptionModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadPlans()
      initializeRevenueCat()
    }
  }, [isOpen])

  const initializeRevenueCat = async () => {
    try {
      await Purchases.configure({
        apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
        appUserID: null // RevenueCat will generate anonymous ID
      })
    } catch (error) {
      console.error('Error initializing RevenueCat:', error)
      setError('Failed to initialize payment system')
    }
  }

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans')
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.plans)
      } else {
        setError('Failed to load subscription plans')
      }
    } catch (error) {
      console.error('Error loading plans:', error)
      setError('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.isFree) {
      // Handle free trial
      try {
        const response = await fetch('/api/subscription/activate-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: plan.id })
        })
        
        if (response.ok) {
          onSubscriptionChange?.(plan.id)
          onClose()
        }
      } catch (error) {
        setError('Failed to activate trial')
      }
      return
    }

    setPurchasing(plan.id)
    setError(null)

    try {
      // Get available packages from RevenueCat
      const packages = await Purchases.getOfferings()
      const targetPackage = Object.values(packages.current?.availablePackages || {})
        .find((pkg: any) => pkg.identifier === plan.revenueCat.productId)

      if (!targetPackage) {
        throw new Error(`Package ${plan.revenueCat.productId} not found`)
      }

      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage(targetPackage)
      
      // Check if the purchase was successful
      const entitlement = customerInfo.entitlements.active[plan.revenueCat.entitlementId]
      
      if (entitlement) {
        // Sync with backend
        await fetch('/api/subscription/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            customerInfo,
            plan: plan.id 
          })
        })

        onSubscriptionChange?.(plan.id)
        onClose()
      } else {
        throw new Error('Purchase was not successful')
      }

    } catch (error: any) {
      console.error('Purchase error:', error)
      
      if (error.userCancelled) {
        setError('Purchase was cancelled')
      } else {
        setError(error.message || 'Purchase failed')
      }
    } finally {
      setPurchasing(null)
    }
  }

  const isPlanCurrent = (planId: string) => currentPlan === planId

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Choose Your Spiritual Path
              </h2>
              <p className="text-gray-400">
                Each plan offers deeper access to the mysteries within
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              /* Plans Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    className={`relative bg-gray-800 rounded-xl p-6 border ${
                      plan.isPopular 
                        ? 'border-purple-500 ring-2 ring-purple-500/50' 
                        : 'border-gray-700'
                    } ${
                      isPlanCurrent(plan.id) 
                        ? 'ring-2 ring-green-500/50 border-green-500' 
                        : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Popular Badge */}
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isPlanCurrent(plan.id) && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Current
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">{plan.styling.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {plan.description}
                      </p>
                      
                      {/* Price */}
                      <div className="mb-4">
                        {plan.isFree ? (
                          <span className="text-2xl font-bold text-green-400">
                            Free Trial
                          </span>
                        ) : (
                          <div>
                            <span className="text-3xl font-bold text-white">
                              €{plan.price}
                            </span>
                            <span className="text-gray-400 text-sm ml-1">
                              /{plan.durationType}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* AI Chats Limit */}
                      <div className="text-center p-3 bg-gray-700/50 rounded-lg mb-4">
                        <span className="text-purple-400 font-medium">
                          {plan.aiChatsLimit} AI Conversation{plan.aiChatsLimit !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-300">
                          <span className="text-purple-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={purchasing === plan.id || isPlanCurrent(plan.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                        isPlanCurrent(plan.id)
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : plan.isFree
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                          : `bg-gradient-to-r ${plan.styling.gradient} text-white hover:opacity-90`
                      } ${
                        purchasing === plan.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {purchasing === plan.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : isPlanCurrent(plan.id) ? (
                        'Current Plan'
                      ) : plan.isFree ? (
                        'Start Free Trial'
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Close Button */}
            <div className="text-center mt-8">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 