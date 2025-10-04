import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        error: 'OpenRouter API key is not configured',
        status: 'missing',
        solution: 'Add OPENROUTER_API_KEY to your .env.local file'
      }, { status: 400 })
    }

    // Test API call with a simple request
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nasa-space-dome.app',
        'X-Title': 'NASA Space Dome - Test'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: 'Hello! Just testing the connection. Please respond with "Connection successful" if you can read this.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        status: 'success',
        message: 'OpenRouter API is working correctly',
        response: data.choices[0]?.message?.content || 'No response content'
      })
    } else {
      const errorText = await response.text()
      return NextResponse.json({
        error: 'OpenRouter API call failed',
        status: response.status,
        message: errorText,
        solution: 'Check your API key and try again'
      }, { status: response.status })
    }
  } catch (error: any) {
    console.error('Test OpenRouter API error:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error?.message || 'Unknown error',
      solution: 'Check your internet connection and API key'
    }, { status: 500 })
  }
}

