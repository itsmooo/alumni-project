const mongoose = require('mongoose');

async function testSpecificAnnouncement() {
  try {
    console.log('🔍 Testing Specific Announcement...\n');

    // Try different database connections
    const databases = [
      'mongodb://localhost:27017/alumni-network',
      'mongodb://localhost:27017/alumni',
      'mongodb://localhost:27017/test',
      'mongodb://127.0.0.1:27017/alumni-network',
      'mongodb://127.0.0.1:27017/alumni'
    ];

    for (const dbUri of databases) {
      try {
        console.log(`Testing database: ${dbUri}`);
        await mongoose.connect(dbUri);
        
        const db = mongoose.connection.db;
        console.log(`   Connected to: ${db.databaseName}`);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
        
        // Check announcements collection
        const announcementsCollection = collections.find(col => col.name === 'announcements');
        if (announcementsCollection) {
          const count = await db.collection('announcements').countDocuments();
          console.log(`   Announcements count: ${count}`);
          
          if (count > 0) {
            // Try to find the specific announcement from the screenshot
            const specificId = '685ea3d56403a40ec9b245a9';
            const announcement = await db.collection('announcements').findOne({ _id: new mongoose.Types.ObjectId(specificId) });
            
            if (announcement) {
              console.log(`   ✅ Found specific announcement: ${announcement.title}`);
              console.log(`   Status: ${announcement.status}`);
              console.log(`   PublishDate: ${announcement.publishDate}`);
              console.log(`   targetAudience.isPublic: ${announcement.targetAudience?.isPublic}`);
              
              // Test the API filter
              const now = new Date();
              const apiFilter = {
                status: "published",
                $or: [{ "targetAudience.isPublic": true }, { publishDate: { $lte: now } }],
              };
              
              const publishedCount = await db.collection('announcements').countDocuments(apiFilter);
              console.log(`   API filter result: ${publishedCount} announcements`);
              
              // Test alternative filter
              const altFilter = {
                $or: [
                  { status: "published" },
                  { 
                    status: "draft", 
                    publishDate: { $lte: now }
                  }
                ]
              };
              
              const altCount = await db.collection('announcements').countDocuments(altFilter);
              console.log(`   Alternative filter result: ${altCount} announcements`);
            } else {
              console.log(`   ❌ Specific announcement not found`);
            }
          }
        }
        
        await mongoose.disconnect();
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Connection failed: ${error.message}`);
        await mongoose.disconnect();
        console.log('');
      }
    }
    
    console.log('✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSpecificAnnouncement(); 