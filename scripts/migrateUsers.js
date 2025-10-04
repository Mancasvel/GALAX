const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unsent'

// Valid subscription plans
const VALID_PLANS = ['whisper', 'reflection', 'depths', 'transcendence', 'admin']

// Admin user email
const ADMIN_EMAIL = 'mancasvel1@alum.us.es'

async function migrateUsers() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const usersCollection = db.collection('users')
    
    // **Step 1: Set admin user**
    console.log('\n🔧 Step 1: Setting up admin user...')
    const adminUser = await usersCollection.findOne({ email: ADMIN_EMAIL })
    
    if (adminUser) {
      // Update existing admin user
      const adminUpdateResult = await usersCollection.updateOne(
        { email: ADMIN_EMAIL },
        {
          $set: {
            subscriptionPlan: 'admin',
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            isSubscriptionActive: true,
            isAdmin: true,
            aiChatsUsed: 0,
            aiChatsLimit: 999999,
            isPremium: true,
            premiumExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          }
        }
      )
      console.log(`✅ Updated admin user: ${ADMIN_EMAIL}`)
    } else {
      console.log(`⚠️ Admin user ${ADMIN_EMAIL} not found. Please register first.`)
    }
    
    // **Step 2: Find users with invalid subscription plans**
    console.log('\n🔧 Step 2: Finding users with invalid subscription plans...')
    const invalidUsers = await usersCollection.find({
      $and: [
        { email: { $ne: ADMIN_EMAIL } }, // Exclude admin user
        {
          $or: [
            { subscriptionPlan: { $exists: false } },
            { subscriptionPlan: null },
            { subscriptionPlan: { $nin: VALID_PLANS } }
          ]
        }
      ]
    }).toArray()
    
    console.log(`Found ${invalidUsers.length} users with invalid subscription plans`)
    
    if (invalidUsers.length === 0) {
      console.log('✅ All non-admin users have valid subscription plans!')
    } else {
      // Show details of invalid users
      console.log('\nUsers to be updated:')
      for (const user of invalidUsers) {
        console.log(`- ${user.email}: "${user.subscriptionPlan}" -> "whisper"`)
      }
      
      // Update all invalid users to default plan
      const updateResult = await usersCollection.updateMany(
        {
          $and: [
            { email: { $ne: ADMIN_EMAIL } }, // Exclude admin user
            {
              $or: [
                { subscriptionPlan: { $exists: false } },
                { subscriptionPlan: null },
                { subscriptionPlan: { $nin: VALID_PLANS } }
              ]
            }
          ]
        },
        {
          $set: {
            subscriptionPlan: 'whisper',
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            isSubscriptionActive: true,
            isAdmin: false,
            aiChatsUsed: 0,
            aiChatsLimit: 7,
            isPremium: false,
            premiumExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          }
        }
      )
      
      console.log(`✅ Updated ${updateResult.modifiedCount} users to default 'whisper' plan`)
    }
    
    // **Step 3: Verify the migration**
    console.log('\n🔧 Step 3: Verifying migration...')
    
    // Check admin user
    const verifyAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL })
    if (verifyAdmin && verifyAdmin.subscriptionPlan === 'admin' && verifyAdmin.isAdmin) {
      console.log(`✅ Admin user ${ADMIN_EMAIL} configured correctly`)
    } else {
      console.log(`❌ Admin user ${ADMIN_EMAIL} not configured properly`)
    }
    
    // Check for remaining invalid users
    const stillInvalidUsers = await usersCollection.find({
      $and: [
        { email: { $ne: ADMIN_EMAIL } },
        { subscriptionPlan: { $nin: VALID_PLANS } }
      ]
    }).toArray()
    
    if (stillInvalidUsers.length === 0) {
      console.log('✅ All users have valid subscription plans!')
    } else {
      console.log(`❌ ${stillInvalidUsers.length} users still have invalid plans`)
      for (const user of stillInvalidUsers) {
        console.log(`- ${user.email}: ${user.subscriptionPlan}`)
      }
    }
    
    // **Step 4: Summary**
    console.log('\n📊 Migration Summary:')
    const totalUsers = await usersCollection.countDocuments()
    const adminUsers = await usersCollection.countDocuments({ isAdmin: true })
    const premiumUsers = await usersCollection.countDocuments({ 
      subscriptionPlan: { $in: ['reflection', 'depths', 'transcendence', 'admin'] } 
    })
    const freeUsers = await usersCollection.countDocuments({ subscriptionPlan: 'whisper' })
    
    console.log(`- Total users: ${totalUsers}`)
    console.log(`- Admin users: ${adminUsers}`)
    console.log(`- Premium users: ${premiumUsers}`)
    console.log(`- Free users: ${freeUsers}`)
    
    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run if called directly
if (require.main === module) {
  migrateUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateUsers } 