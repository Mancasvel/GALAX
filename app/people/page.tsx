'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// Mock data for demonstration
const mockPeople = [
  {
    id: '1',
    name: 'Sarah',
    relationship: 'ex-partner',
    description: 'My ex-girlfriend from college',
    context: 'We dated for 2 years, broke up because of distance. She was always very direct and honest, sometimes brutally so. She would probably be supportive but also call me out on my BS. She hated when I overthought things.',
    tags: ['love', 'closure', 'regret'],
    conversationCount: 3,
    lastConversationAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Dad',
    relationship: 'family',
    description: 'My father who passed away last year',
    context: 'Traditional man who rarely showed emotion. He would be proud but would express it through actions rather than words. He was a good listener and gave practical advice. He always said "actions speak louder than words".',
    tags: ['grief', 'love', 'guidance'],
    conversationCount: 8,
    lastConversationAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Future Me',
    relationship: 'self',
    description: 'The person I want to become',
    context: 'My future self who has overcome current struggles. More confident, wise, and at peace. Would be encouraging but also realistic about the work needed. Speaks with compassion and understanding.',
    tags: ['growth', 'motivation', 'self-love'],
    conversationCount: 1,
    lastConversationAt: new Date('2024-01-10')
  }
]

const relationshipEmojis = {
  'ex-partner': '💔',
  'friend': '👥',
  'family': '👨‍👩‍👧‍👦',
  'colleague': '💼',
  'stranger': '🚶',
  'self': '🪞',
  'other': '❓'
}

export default function PeoplePage() {
  const [people, setPeople] = useState(mockPeople)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPerson, setEditingPerson] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddPerson = () => {
    setShowAddModal(true)
  }

  const handleEditPerson = (person: any) => {
    setEditingPerson(person)
    setShowAddModal(true)
  }

  const handleSavePerson = (personData: any) => {
    // This would normally save to database
    console.log('Saving person:', personData)
    setShowAddModal(false)
    setEditingPerson(null)
  }

  const handleDeletePerson = (personId: string) => {
    if (confirm('Are you sure you want to delete this person? This will also delete all conversations with them.')) {
      setPeople(people.filter(p => p.id !== personId))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Your People
          </h1>
          <p className="text-gray-300 text-lg">
            Create profiles for the people you write to. This helps the AI respond authentically.
          </p>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleAddPerson}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            Add Person
          </button>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/50 via-black/50 to-purple-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300"
            >
              {/* Person Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                    {relationshipEmojis[person.relationship as keyof typeof relationshipEmojis] || '❓'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{person.name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{person.relationship}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPerson(person)}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePerson(person.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {person.description}
              </p>

              {/* Context Preview */}
              <div className="mb-4">
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">AI Context</h4>
                <p className="text-gray-300 text-sm line-clamp-3">
                  {person.context}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {person.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{person.conversationCount} conversations</span>
                <span>Last: {person.lastConversationAt.toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => window.location.href = `/new-conversation?personId=${person.id}`}
                  className="w-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
                >
                  Start New Conversation
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPeople.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No people found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first person to start your journey'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddPerson}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Add Your First Person
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal would go here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 via-black to-purple-900/90 border border-purple-500/30 rounded-2xl w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPerson ? 'Edit Person' : 'Add New Person'}
            </h2>
            <p className="text-gray-300 mb-6">
              PersonProfile component would be rendered here with person data and save handlers.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSavePerson(editingPerson)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                {editingPerson ? 'Update' : 'Add'} Person
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 