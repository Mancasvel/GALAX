'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PersonProfile } from '@/lib/types'

interface PersonProfileProps {
  profile?: PersonProfile
  onSave: (profile: Partial<PersonProfile>) => void
  onCancel: () => void
  isOpen: boolean
}

const relationshipOptions = [
  { value: 'ex-partner', label: 'Ex-Partner', emoji: '💔' },
  { value: 'friend', label: 'Friend', emoji: '👥' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'colleague', label: 'Colleague', emoji: '💼' },
  { value: 'stranger', label: 'Stranger', emoji: '🚶' },
  { value: 'self', label: 'Myself', emoji: '🪞' },
  { value: 'other', label: 'Other', emoji: '❓' }
]

export default function PersonProfile({ profile, onSave, onCancel, isOpen }: PersonProfileProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    relationship: profile?.relationship || '',
    description: profile?.description || '',
    context: profile?.context || '',
    tags: profile?.tags?.join(', ') || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required'
    }
    
    if (!formData.context.trim()) {
      newErrors.context = 'Context is required to help AI understand this person'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900/90 via-black to-purple-900/90 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {profile ? 'Edit Person' : 'Add Person'}
                </h2>
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Who are you writing to?"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Relationship Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Relationship *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {relationshipOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('relationship', option.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.relationship === option.value
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-black/30 border-gray-600 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{option.emoji}</span>
                          <span className="text-sm">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.relationship && (
                    <p className="text-red-400 text-sm mt-1">{errors.relationship}</p>
                  )}
                </div>

                {/* Context Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Context for AI *
                  </label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => handleInputChange('context', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none ${
                      errors.context ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Tell the AI about this person so it can respond authentically. Include your relationship history, their personality, how they might react..."
                  />
                  {errors.context && (
                    <p className="text-red-400 text-sm mt-1">{errors.context}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    This helps the AI respond as this person would, based on your relationship dynamics.
                  </p>
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    placeholder="A brief description for your reference..."
                  />
                </div>

                {/* Tags Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="pain, closure, love, anger (comma separated)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate tags with commas to help organize your conversations.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                  >
                    {profile ? 'Update Person' : 'Add Person'}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 