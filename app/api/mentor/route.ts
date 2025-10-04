import { NextRequest, NextResponse } from 'next/server'
import { callMentorAI } from '@/lib/nasa-mentors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mentorName, studentMessage, context } = body

    if (!mentorName || !studentMessage) {
      return NextResponse.json(
        { error: 'Mentor name and student message are required' },
        { status: 400 }
      )
    }

    const response = await callMentorAI(mentorName, studentMessage, context)

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to get response from mentor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in mentor API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

