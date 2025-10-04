import React, { useState } from 'react'
import { useSubscription, usePremiumAccess, usePurchases } from '@/lib/useSubscription'
import SubscriptionModal from './SubscriptionModal'

export default function SubscriptionExample() {
  const [showModal, setShowModal] = useState(false)
  
  // Use subscription hooks
  const { subscription, loading, error, daysRemaining, canUseAI } = useSubscription()
  const { isPremium, hasAIAccess, getRemainingAIChats, getPlanLimitations } = usePremiumAccess()
  const { purchaseSubscription, restorePurchases, purchasing, purchaseError } = usePurchases()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-300">Loading subscription...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
        <h3 className="font-semibold mb-2">Subscription Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const planLimitations = getPlanLimitations()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Subscription Dashboard</h1>

      {/* Current Subscription Status */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
        
        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-purple-400 font-medium mb-2">Plan</h3>
              <p className="text-white text-lg capitalize">{subscription.plan}</p>
              <p className="text-gray-400 text-sm">
                {isPremium ? 'Premium' : 'Free Trial'}
              </p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-purple-400 font-medium mb-2">AI Chats</h3>
              <p className="text-white text-lg">
                {subscription.aiChatsUsed} / {subscription.aiChatsLimit}
              </p>
              <p className="text-gray-400 text-sm">
                {getRemainingAIChats()} remaining
              </p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-purple-400 font-medium mb-2">
                {subscription.isActive ? 'Expires In' : 'Expired'}
              </h3>
              <p className="text-white text-lg">
                {daysRemaining} days
              </p>
              <p className="text-gray-400 text-sm">
                {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No active subscription</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Choose a Plan
            </button>
          </div>
        )}
      </div>

      {/* Feature Access */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Feature Access</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-white">AI Conversations</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              hasAIAccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {hasAIAccess ? 'Available' : 'Limit Reached'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-white">Premium Features</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isPremium ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
            }`}>
              {isPremium ? 'Unlocked' : 'Upgrade Required'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-white">Conversation Storage</span>
            <span className="px-3 py-1 rounded-full text-sm bg-green-600 text-white">
              Unlimited
            </span>
          </div>
        </div>
      </div>

      {/* Current Plan Features */}
      {planLimitations && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Plan Features</h2>
          
          <ul className="space-y-2">
            {planLimitations.features.map((feature, index) => (
              <li key={index} className="flex items-start text-gray-300">
                <span className="text-purple-400 mr-2 mt-1">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          {subscription ? 'Upgrade Plan' : 'Choose Plan'}
        </button>
        
        <button
          onClick={restorePurchases}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Restore Purchases
        </button>

        {subscription && !subscription.isActive && (
          <button
            onClick={() => purchaseSubscription(subscription.plan)}
            disabled={!!purchasing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {purchasing ? 'Processing...' : 'Reactivate'}
          </button>
        )}
      </div>

      {/* Purchase Error */}
      {purchaseError && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {purchaseError}
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentPlan={subscription?.plan}
        onSubscriptionChange={(plan) => {
          // Refresh subscription data
          window.location.reload()
        }}
      />

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && subscription && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-white font-medium mb-2">Debug Info</h3>
          <pre className="text-xs text-gray-400 overflow-auto">
            {JSON.stringify({
              subscription,
              isPremium,
              hasAIAccess,
              daysRemaining,
              remainingChats: getRemainingAIChats()
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 