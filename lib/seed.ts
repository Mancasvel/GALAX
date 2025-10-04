import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI!)

// Sample conversation starters for different emotional stages
const sampleConversationStarters = [
  {
    category: "Ex-Partner",
    stage: "denial",
    title: "I keep thinking you'll come back",
    description: "A letter to an ex-partner when you're still in denial about the breakup",
    prompt: "Dear [Name], I know you said it's over, but I can't shake the feeling that we're just taking a break..."
  },
  {
    category: "Ex-Partner", 
    stage: "anger",
    title: "How could you do this to me?",
    description: "An angry message to an ex-partner who hurt you",
    prompt: "I can't believe you would just throw away everything we had. After all we've been through..."
  },
  {
    category: "Ex-Partner",
    stage: "bargaining", 
    title: "What if we tried one more time?",
    description: "A desperate attempt to negotiate getting back together",
    prompt: "I know I said I understood, but what if we could work through this? What if I changed..."
  },
  {
    category: "Ex-Partner",
    stage: "depression",
    title: "I miss what we had",
    description: "A melancholy message about missing the relationship",
    prompt: "The apartment feels so empty without you. I keep expecting to hear your key in the door..."
  },
  {
    category: "Ex-Partner",
    stage: "acceptance",
    title: "Thank you for the memories",
    description: "A peaceful farewell message",
    prompt: "I want you to know that despite everything, I'm grateful for the time we had together..."
  },
  {
    category: "Family",
    stage: "denial",
    title: "We're fine, everything is normal",
    description: "A message denying family problems",
    prompt: "I don't know why everyone thinks our family has issues. We're perfectly normal..."
  },
  {
    category: "Family",
    stage: "anger",
    title: "You never understood me",
    description: "An angry message to a family member",
    prompt: "You always took their side. You never once tried to understand what I was going through..."
  },
  {
    category: "Family",
    stage: "bargaining",
    title: "Can we start over?",
    description: "Trying to negotiate a fresh start with family",
    prompt: "I know we have our problems, but we're family. Can't we just forget the past and start fresh?"
  },
  {
    category: "Family",
    stage: "depression",
    title: "I feel so alone",
    description: "Expressing loneliness within the family",
    prompt: "Sometimes I feel like I'm invisible in this family. Like nothing I do matters..."
  },
  {
    category: "Family",
    stage: "acceptance",
    title: "I love you despite everything",
    description: "Accepting the family dynamic with love",
    prompt: "Our family isn't perfect, but I love you anyway. I've learned to accept us as we are..."
  },
  {
    category: "Deceased",
    stage: "denial",
    title: "You can't really be gone",
    description: "A message of disbelief about someone's death",
    prompt: "I keep picking up the phone to call you. This can't be real..."
  },
  {
    category: "Deceased",
    stage: "anger",
    title: "How could you leave me?",
    description: "Anger at someone who died",
    prompt: "How could you just leave? You promised we'd grow old together..."
  },
  {
    category: "Deceased",
    stage: "bargaining",
    title: "If I could trade places with you",
    description: "Bargaining with death or fate",
    prompt: "I would give anything to trade places with you. Anything to bring you back..."
  },
  {
    category: "Deceased",
    stage: "depression",
    title: "The world feels empty without you",
    description: "Deep sadness about loss",
    prompt: "Nothing feels the same without you here. The world has lost its color..."
  },
  {
    category: "Deceased",
    stage: "acceptance",
    title: "I'll carry you with me",
    description: "Peaceful acceptance of loss",
    prompt: "I know you're gone, but I carry you with me in everything I do..."
  }
]

// Sample emotional fragments for different stages
const sampleEmotionalFragments = [
  {
    stage: "denial",
    type: "daily_fragment",
    title: "Fragments of What Was",
    content: "Your coffee cup is still in the sink. I left it there on purpose.",
    color: "#3B82F6"
  },
  {
    stage: "denial",
    type: "notification",
    title: "Echoes",
    content: "I saw someone who looked like you today. For a moment, I forgot.",
    color: "#3B82F6"
  },
  {
    stage: "anger",
    type: "daily_fragment", 
    title: "Burning Words",
    content: "There are words I want to scream at you. They burn in my throat.",
    color: "#EF4444"
  },
  {
    stage: "anger",
    type: "notification",
    title: "Rage",
    content: "You left me with all this anger and nowhere to put it.",
    color: "#EF4444"
  },
  {
    stage: "bargaining",
    type: "daily_fragment",
    title: "What If",
    content: "If I had said something different, would you still be here?",
    color: "#F59E0B"
  },
  {
    stage: "bargaining",
    type: "notification",
    title: "Negotiations",
    content: "I keep making deals with the universe. None of them work.",
    color: "#F59E0B"
  },
  {
    stage: "depression",
    type: "daily_fragment",
    title: "Empty Spaces",
    content: "The silence where you used to be is deafening.",
    color: "#6B7280"
  },
  {
    stage: "depression",
    type: "notification",
    title: "Hollow",
    content: "Some days I feel like I'm made of shadows.",
    color: "#6B7280"
  },
  {
    stage: "acceptance",
    type: "daily_fragment",
    title: "New Light",
    content: "Today I smiled and it didn't feel like betrayal.",
    color: "#10B981"
  },
  {
    stage: "acceptance",
    type: "notification",
    title: "Peace",
    content: "I can think of you now without drowning.",
    color: "#10B981"
  }
]

async function seedDatabase() {
  try {
    console.log('💌 Connecting to MongoDB...')
    await client.connect()
    
    const db = client.db('Unsent')
    
    // Clear existing data
    console.log('🧹 Cleaning existing data...')
    await db.collection('conversation_starters').deleteMany({})
    await db.collection('emotional_fragments').deleteMany({})
    
    // Insert conversation starters
    console.log('✍️ Inserting conversation starters...')
    const startersResult = await db.collection('conversation_starters').insertMany(sampleConversationStarters)
    
    // Insert emotional fragments
    console.log('🌙 Inserting emotional fragments...')
    const fragmentsResult = await db.collection('emotional_fragments').insertMany(sampleEmotionalFragments)
    
    console.log(`✅ Seeding completed!`)
    console.log(`💌 Inserted ${startersResult.insertedCount} conversation starters`)
    console.log(`🌙 Inserted ${fragmentsResult.insertedCount} emotional fragments`)
    
    // Show statistics
    const stageStats: Record<string, number> = {}
    sampleConversationStarters.forEach(starter => {
      stageStats[starter.stage] = (stageStats[starter.stage] || 0) + 1
    })
    
    console.log(`📊 Conversation starters by stage:`)
    Object.entries(stageStats).forEach(([stage, count]) => {
      const stageEmoji = {
        'denial': '🌫️',
        'anger': '🔥', 
        'bargaining': '🔄',
        'depression': '🌧️',
        'acceptance': '🌅'
      }[stage]
      console.log(`  ${stageEmoji} ${stage}: ${count} starters`)
    })
    
    // Create indexes for better search performance
    console.log('📊 Creating indexes...')
    await db.collection('conversation_starters').createIndex({ "category": 1 })
    await db.collection('conversation_starters').createIndex({ "stage": 1 })
    await db.collection('conversation_starters').createIndex({ "title": "text", "description": "text" })
    
    await db.collection('emotional_fragments').createIndex({ "stage": 1 })
    await db.collection('emotional_fragments').createIndex({ "type": 1 })
    
    console.log('✅ Indexes created successfully')
    console.log('🎉 Unsent database ready for emotional journeys!')
    
  } catch (error) {
    console.error('❌ Error in seeding:', error)
  } finally {
    await client.close()
    console.log('🔐 Connection closed')
  }
}

// Execute seeding
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase 