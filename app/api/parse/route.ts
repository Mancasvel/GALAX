import { NextRequest, NextResponse } from 'next/server'
import { withUnsentDB } from '@/lib/mongodb'
import { emotionStages, getStageByScore } from '@/lib/emotionStages'

interface ParseRequest {
  query: string
  userId?: string
  sessionId?: string
  conversationHistory?: any[]
  emotionalContext?: {
    currentStage?: string
    recipientProfile?: any
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody: ParseRequest = await request.json()
    const { query, userId, sessionId, conversationHistory, emotionalContext } = requestBody

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log('🌙 Processing emotional query:', query)
    console.log('📖 Conversation context:', {
      userId: userId || 'anonymous',
      sessionId: sessionId || 'no-session',
      historyLength: conversationHistory?.length || 0,
      currentStage: emotionalContext?.currentStage || 'unknown'
    })

    // Analyze emotional content of the query
    const emotionalAnalysis = analyzeEmotionalContent(query, conversationHistory)
    
    // Determine emotional stage based on content
    const emotionalStage = getStageByScore(emotionalAnalysis.score)
    
    // Generate insights based on emotional analysis
    const insights = generateEmotionalInsights(query, emotionalAnalysis, emotionalContext)

    // Simple response for now - in production this could call an AI service
    const response = {
      analysis: emotionalAnalysis,
      stage: emotionalStage,
      insights: insights,
      suggestions: generateSuggestions(emotionalStage.id, query),
      metadata: {
        timestamp: new Date(),
        userId: userId || 'anonymous',
        sessionId: sessionId || 'no-session'
      }
    }

    console.log('✨ Emotional analysis complete:', {
      stage: emotionalStage.name,
      score: emotionalAnalysis.score,
      keyEmotions: emotionalAnalysis.detectedEmotions
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Error in parse route:', error)
    return NextResponse.json(
      { error: 'Error processing emotional query' },
      { status: 500 }
    )
  }
}

function analyzeEmotionalContent(query: string, history?: any[]) {
  const lowercaseQuery = query.toLowerCase()
  let score = 0
  const detectedEmotions: string[] = []

  // Analyze current query
  for (const stage of emotionStages) {
    for (const keyword of stage.keywords) {
      if (lowercaseQuery.includes(keyword.toLowerCase())) {
        score += stage.threshold / stage.keywords.length
        if (!detectedEmotions.includes(stage.name)) {
          detectedEmotions.push(stage.name)
        }
      }
    }
  }

  // Factor in conversation history if available
  if (history && history.length > 0) {
    const historyScore = history.reduce((acc, msg) => {
      if (msg.content) {
        const msgLower = msg.content.toLowerCase()
        let msgScore = 0
        for (const stage of emotionStages) {
          for (const keyword of stage.keywords) {
            if (msgLower.includes(keyword.toLowerCase())) {
              msgScore += stage.threshold / stage.keywords.length * 0.3 // Reduced weight for history
            }
          }
        }
        return acc + msgScore
      }
      return acc
    }, 0)
    score += historyScore / history.length
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    detectedEmotions,
    confidence: detectedEmotions.length > 0 ? 0.8 : 0.3,
    rawScore: score
  }
}

function generateEmotionalInsights(query: string, analysis: any, context?: any) {
  const insights = []
  
  if (analysis.detectedEmotions.length > 0) {
    insights.push(`Detected emotional themes: ${analysis.detectedEmotions.join(', ')}`)
  }
  
  if (analysis.score > 80) {
    insights.push('High emotional intensity detected. Consider taking time to process these feelings.')
  } else if (analysis.score < 20) {
    insights.push('Low emotional intensity. This might be a good time for reflection.')
  }
  
  if (context?.currentStage) {
    insights.push(`Current emotional stage: ${context.currentStage}`)
  }
  
  return insights
}

function generateSuggestions(stage: string, query: string) {
  const suggestions = []
  
  switch (stage) {
    case 'denial':
      suggestions.push('Take time to acknowledge what you\'re feeling')
      suggestions.push('Consider writing about what feels unreal or hard to accept')
      break
    case 'anger':
      suggestions.push('Express your feelings safely through writing')
      suggestions.push('Consider what this anger is protecting or revealing')
      break
    case 'bargaining':
      suggestions.push('Explore the \'what ifs\' that come to mind')
      suggestions.push('Write about what you wish could be different')
      break
    case 'depression':
      suggestions.push('Be gentle with yourself during this process')
      suggestions.push('Consider what support or comfort you need')
      break
    case 'acceptance':
      suggestions.push('Reflect on what you\'ve learned from this experience')
      suggestions.push('Consider how you\'ve grown through this process')
      break
    default:
      suggestions.push('Continue exploring your feelings through writing')
      suggestions.push('Take time to understand what you\'re experiencing')
  }
  
  return suggestions
} 