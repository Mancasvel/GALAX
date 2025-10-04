'use client'

import { useState } from 'react'
import { callMentorAI } from '@/lib/nasa-mentors'

export default function TestMentorPage() {
  const [mentorName, setMentorName] = useState('Dr. Ellen Ochoa')
  const [message, setMessage] = useState('Hello! I want to learn about space engineering.')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      console.log('Testing mentor AI call...')
      const result = await callMentorAI(mentorName, message)
      console.log('Test result:', result)
      setResponse(result)
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mentor AI Test Page</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Mentor:</label>
            <select
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            >
              <option value="Dr. Ellen Ochoa">Dr. Ellen Ochoa</option>
              <option value="Dr. Mae Jemison">Dr. Mae Jemison</option>
              <option value="Bob Behnken">Bob Behnken</option>
              <option value="Dr. Serena Auñón-Chancellor">Dr. Serena Auñón-Chancellor</option>
              <option value="Chris Hadfield">Chris Hadfield</option>
              <option value="Jessica Watkins">Jessica Watkins</option>
              <option value="Victor Glover">Victor Glover</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 h-24"
              placeholder="Enter your test message..."
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading ? 'Testing...' : 'Test Mentor AI'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Error:</h3>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-4">Response:</h3>

            <div className="mb-4">
              <h4 className="font-semibold text-green-200 mb-2">Content:</h4>
              <p className="text-green-100 bg-gray-800 p-3 rounded">{response.content}</p>
            </div>

            {response.educationalFacts && response.educationalFacts.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-green-200 mb-2">Educational Facts:</h4>
                <ul className="text-green-100 bg-gray-800 p-3 rounded">
                  {response.educationalFacts.map((fact: string, index: number) => (
                    <li key={index} className="mb-1">• {fact}</li>
                  ))}
                </ul>
              </div>
            )}

            {response.nextSteps && response.nextSteps.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-green-200 mb-2">Next Steps:</h4>
                <ul className="text-green-100 bg-gray-800 p-3 rounded">
                  {response.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="mb-1">→ {step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold text-green-200 mb-2">Encouragement:</h4>
              <p className="text-green-100 bg-gray-800 p-3 rounded italic">{response.encouragement}</p>
            </div>

            {response.nasaReference && (
              <div>
                <h4 className="font-semibold text-green-200 mb-2">NASA Reference:</h4>
                <p className="text-green-100 bg-gray-800 p-3 rounded">{response.nasaReference}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <p>Check the browser console (F12) for detailed logs and debugging information.</p>
        </div>
      </div>
    </div>
  )
}

