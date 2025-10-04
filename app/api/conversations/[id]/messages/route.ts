import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createMessage, getOrCreateConversation } from '@/lib/database'
import { analyzeMessage } from '@/lib/scoreEngine'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Await params before accessing properties (Next.js 15 requirement)
    const { id: conversationId } = await params
    const { content, timeSpent = 0 } = await request.json()

    // Validate input
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Ensure conversation exists (create if it doesn't)
    const conversation = await getOrCreateConversation(
      conversationId,
      currentUser.userId,
      'Someone' // Default recipient name
    )

    // Analyze message emotions
    const analysis = analyzeMessage(content.trim(), timeSpent)

    // Save message to database using createMessage
    const savedMessage = await createMessage(
      conversation._id?.toString() || conversationId,
      currentUser.userId,
      content.trim(),
      'user',
      timeSpent
    )

    console.log(`Message saved to conversation ${conversationId} for user ${currentUser.userId}`)

    return NextResponse.json({
      success: true,
      message: {
        id: savedMessage._id?.toString(),
        content: savedMessage.content,
        timestamp: savedMessage.createdAt,
        emotionalAnalysis: savedMessage.emotionalAnalysis,
        timeSpent: savedMessage.timeSpent,
        isUser: savedMessage.messageType === 'user'
      },
      conversation: {
        id: conversation._id?.toString(),
        emotionalScore: conversation.emotionalScore,
        stage: conversation.currentStage,
        messageCount: conversation.messageCount + 1
      }
    })

  } catch (error: any) {
    console.error('Error saving message:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to save message',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Await params before accessing properties (Next.js 15 requirement)
    const { id: conversationId } = await params

    // TODO: Implement getting messages for a conversation
    // For now, return empty array
    return NextResponse.json({
      success: true,
      messages: []
    })

  } catch (error: any) {
    console.error('Error fetching messages:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch messages' 
      },
      { status: 500 }
    )
  }
} 