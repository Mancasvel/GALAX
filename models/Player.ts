import mongoose, { Document, Schema } from 'mongoose'

export interface IPlayer extends Document {
  playerId: string
  name: string
  currentPath: 'Science & Research' | 'Engineering & Systems' | 'Medicine & Human Factors' | 'Communications & Exploration' | 'Astronomy & Navigation' | 'Technology & Innovation' | 'Central Hub'
  mentor: string
  progress: {
    'Science & Research': number
    'Engineering & Systems': number
    'Medicine & Human Factors': number
    'Communications & Exploration': number
    'Astronomy & Navigation': number
    'Technology & Innovation': number
  }
  points: number
  astronautMode: boolean
  completedMissions: string[]
  currentMission?: string
  createdAt: Date
  updatedAt: Date
}

const PlayerSchema = new Schema<IPlayer>({
  playerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  currentPath: {
    type: String,
    enum: ['Science & Research', 'Engineering & Systems', 'Medicine & Human Factors', 'Communications & Exploration', 'Astronomy & Navigation', 'Technology & Innovation', 'Central Hub'],
    default: 'Central Hub'
  },
  mentor: {
    type: String,
    required: true,
    default: 'Dr. Ellen Ochoa'
  },
  progress: {
    'Science & Research': { type: Number, default: 0 },
    'Engineering & Systems': { type: Number, default: 0 },
    'Medicine & Human Factors': { type: Number, default: 0 },
    'Communications & Exploration': { type: Number, default: 0 },
    'Astronomy & Navigation': { type: Number, default: 0 },
    'Technology & Innovation': { type: Number, default: 0 }
  },
  points: {
    type: Number,
    default: 0
  },
  astronautMode: {
    type: Boolean,
    default: false
  },
  completedMissions: [{
    type: String
  }],
  currentMission: {
    type: String
  }
}, {
  timestamps: true
})

// Index for efficient queries
PlayerSchema.index({ playerId: 1 })
PlayerSchema.index({ currentPath: 1 })
PlayerSchema.index({ points: -1 })

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema)

