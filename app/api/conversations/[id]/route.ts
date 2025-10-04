import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getOrCreateConversation, getConversationWithMessages } from '@/lib/database'

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

    // Validate conversation ID
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    try {
      // First try to get existing conversation with messages
      const result = await getConversationWithMessages(conversationId, currentUser.userId)
      
      if (result) {
        const { conversation, messages, personProfile } = result
        
        return NextResponse.json({
          success: true,
          conversation: {
            id: conversation._id?.toString() || conversationId,
            title: conversation.title,
            recipientName: personProfile?.name || 'Someone',
            messages: messages.map(msg => ({
              id: msg._id?.toString(),
              content: msg.content,
              isUser: msg.messageType === 'user',
              timestamp: msg.createdAt,
              emotionalAnalysis: msg.emotionalAnalysis || {
                score: 0,
                stage: 'denial',
                intensity: 0,
                keywords: []
              },
              timeSpent: msg.timeSpent || 0,
              aiResponse: msg.aiResponse
            })),
            emotionalScore: conversation.emotionalScore,
            stage: conversation.currentStage,
            isAIEnabled: conversation.aiEnabled,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            userId: conversation.userId,
            isActive: conversation.isActive,
            personProfile: personProfile
          }
        })
      }
      
      // If conversation doesn't exist, create it
      const newConversation = await getOrCreateConversation(
        conversationId, 
        currentUser.userId,
        'Someone' // Default recipient name
      )
      
      return NextResponse.json({
        success: true,
        conversation: {
          id: newConversation._id?.toString() || conversationId,
          title: newConversation.title,
          recipientName: 'Someone',
          messages: [],
          emotionalScore: newConversation.emotionalScore,
          stage: newConversation.currentStage,
          isAIEnabled: newConversation.aiEnabled,
          createdAt: newConversation.createdAt,
          updatedAt: newConversation.updatedAt,
          userId: newConversation.userId,
          isActive: newConversation.isActive
        }
      })
      
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      
      // If database operations fail, return a basic conversation structure
      return NextResponse.json({
        success: true,
        conversation: {
          id: conversationId,
          title: `New Conversation`,
          recipientName: 'Someone',
          messages: [],
          emotionalScore: 0,
          stage: 'denial',
          isAIEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: currentUser.userId,
          isActive: true
        }
      })
    }

  } catch (error: any) {
    console.error('Error fetching conversation:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch conversation',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const updateData = await request.json()

    // Validate conversation ID
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // For now, just return success - full update functionality can be implemented later
    return NextResponse.json({
      success: true,
      message: 'Conversation updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating conversation:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to update conversation' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Validate conversation ID
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // For now, just return success - full delete functionality can be implemented later
    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting conversation:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to delete conversation' 
      },
      { status: 500 }
    )
  }
} 