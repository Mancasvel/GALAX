import { NextRequest, NextResponse } from 'next/server'
import { getNASASpaceDomeDB } from '@/lib/mongodb'
import Player from '@/models/Player'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 })
    }

    const db = await getNASASpaceDomeDB()
    const player = await db.collection('players').findOne({ playerId })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({ player })
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, name, currentPath, mentor, progress, points, astronautMode, completedMissions, currentMission } = body

    if (!playerId || !name) {
      return NextResponse.json({ error: 'Player ID and name are required' }, { status: 400 })
    }

    const db = await getNASASpaceDomeDB()

    // Check if player already exists
    const existingPlayer = await db.collection('players').findOne({ playerId })

    if (existingPlayer) {
      // Update existing player
      const updateData: any = {
        name,
        currentPath: currentPath || existingPlayer.currentPath,
        mentor: mentor || existingPlayer.mentor,
        points: points !== undefined ? points : existingPlayer.points,
        astronautMode: astronautMode !== undefined ? astronautMode : existingPlayer.astronautMode,
        completedMissions: completedMissions || existingPlayer.completedMissions,
        currentMission: currentMission || existingPlayer.currentMission,
        updatedAt: new Date()
      }

      // Update progress if provided
      if (progress) {
        updateData.progress = { ...existingPlayer.progress, ...progress }
      }

      await db.collection('players').updateOne(
        { playerId },
        { $set: updateData }
      )

      return NextResponse.json({ message: 'Player updated successfully', player: updateData })
    } else {
      // Create new player
      const newPlayer = {
        playerId,
        name,
        currentPath: currentPath || 'Central Hub',
        mentor: mentor || 'Dr. Ellen Ochoa',
        progress: progress || {
          'Science & Research': 0,
          'Engineering & Systems': 0,
          'Medicine & Human Factors': 0,
          'Communications & Exploration': 0,
          'Astronomy & Navigation': 0,
          'Technology & Innovation': 0
        },
        points: points || 0,
        astronautMode: astronautMode || false,
        completedMissions: completedMissions || [],
        currentMission: currentMission || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('players').insertOne(newPlayer)
      return NextResponse.json({ message: 'Player created successfully', player: newPlayer })
    }
  } catch (error) {
    console.error('Error creating/updating player:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, updates } = body

    if (!playerId || !updates) {
      return NextResponse.json({ error: 'Player ID and updates are required' }, { status: 400 })
    }

    const db = await getNASASpaceDomeDB()

    const updateData = {
      ...updates,
      updatedAt: new Date()
    }

    await db.collection('players').updateOne(
      { playerId },
      { $set: updateData }
    )

    return NextResponse.json({ message: 'Player updated successfully' })
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

