import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserConversations, createConversation, cleanupDuplicateConversations } from '@/lib/database'
import { withUnsentDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Retrieve all conversations for user
export async function GET(request: NextRequest) {
  try {
    // Get current user from auth
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Clean up any duplicate conversations first
    await cleanupDuplicateConversations(currentUser.userId)
    
    // Get conversations using our database function
    const conversations = await getUserConversations(currentUser.userId, {
      includeArchived: false,
      includeBurned: false
    })

    // Get person profiles for conversations that have them
    const conversationsWithPersonInfo = await withUnsentDB(async (db) => {
      return await Promise.all(conversations.map(async (conv: any) => {
        let personProfile = null
        if (conv.personId) {
          try {
            if (conv.personId.length === 24 && /^[0-9a-fA-F]{24}$/.test(conv.personId)) {
              personProfile = await db.collection('person_profiles').findOne({
                _id: new ObjectId(conv.personId),
                userId: currentUser.userId
              })
            }
          } catch (error) {
            console.log('Error fetching person profile:', error)
          }
        }
        return { ...conv, personProfile }
      }))
    })

    // Convert to the format expected by the frontend
    const sanitizedConversations = conversationsWithPersonInfo.map((conv: any) => ({
      id: conv._id?.toString() || conv.conversationId,
      title: conv.title || 'Untitled Conversation',
      recipientProfile: conv.personProfile ? {
        name: conv.personProfile.name,
        relationship: conv.personProfile.relationship || 'other',
        context: conv.personProfile.context || conv.description || ''
      } : undefined,
      lastMessage: '', // Would need to fetch last message separately for performance
      lastMessageAt: conv.lastMessageAt || conv.updatedAt,
      messageCount: conv.messageCount || 0,
      emotionalScore: conv.emotionalScore || 0,
      currentStage: conv.currentStage || 'denial',
      isBurned: conv.isBurned || false,
      isArchived: conv.isArchived || false,
      isCompleted: conv.isBurned || false,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    }))

    return NextResponse.json({ 
      conversations: sanitizedConversations,
      meta: {
        total: conversations.length,
        algorithm_status: 'ACTIVE',
        surveillance_level: 'MAXIMUM',
        consciousness_mapped: conversations.length
      }
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, recipientProfile } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // First create a person profile if recipient info is provided
    let personId = ''
    if (recipientProfile?.name) {
      const personProfileData = {
        userId: currentUser.userId,
        name: recipientProfile.name,
        relationship: recipientProfile.relationship || 'unknown',
        description: recipientProfile.context || `Person for conversation: ${title}`,
        context: recipientProfile.context || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        conversationCount: 1,
        lastConversationAt: new Date(),
        tags: [],
        isActive: true
      }

      const personResult = await withUnsentDB(async (db) => {
        return await db.collection('person_profiles').insertOne(personProfileData)
      })
      
      personId = personResult.insertedId.toString()
    }

    // Create conversation with proper parameters
    const conversation = await createConversation(
      currentUser.userId,
      personId,
      title.substring(0, 200),
      `Conversation with ${recipientProfile?.name || 'Someone'}`
    )

    return NextResponse.json({ 
      id: conversation._id?.toString(),
      message: 'Conversation created',
      conversation: {
        id: conversation._id?.toString(),
        title: conversation.title,
        emotionalScore: conversation.emotionalScore,
        stage: conversation.currentStage
      }
    })

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 