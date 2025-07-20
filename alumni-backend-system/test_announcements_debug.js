const mongoose = require('mongoose');
const Announcement = require('./models/Announcement');

async function debugAnnouncements() {
  try {
    console.log('🔍 Debugging Announcements Filter...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-network');
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log('');

    // List all collections
    console.log('1️⃣ All Collections in Database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Total collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // Check if announcements collection exists
    const announcementsCollection = collections.find(col => col.name === 'announcements');
    if (!announcementsCollection) {
      console.log('❌ Announcements collection not found!');
      return;
    }

    // Get raw count from collection
    console.log('2️⃣ Raw Collection Count:');
    const rawCount = await mongoose.connection.db.collection('announcements').countDocuments();
    console.log(`   Raw announcements count: ${rawCount}`);
    console.log('');

    if (rawCount === 0) {
      console.log('❌ No announcements found in database!');
      return;
    }

    // Get all announcements without any filter
    console.log('3️⃣ All announcements in database:');
    const allAnnouncements = await Announcement.find({});
    console.log(`   Mongoose find count: ${allAnnouncements.length}`);
    
    if (allAnnouncements.length > 0) {
      allAnnouncements.forEach(ann => {
        console.log(`   - ID: ${ann._id}`);
        console.log(`     Title: "${ann.title}"`);
        console.log(`     Status: ${ann.status}`);
        console.log(`     PublishDate: ${ann.publishDate}`);
        console.log(`     ExpiryDate: ${ann.expiryDate}`);
        console.log(`     isPinned: ${ann.isPinned}`);
        console.log(`     targetAudience.isPublic: ${ann.targetAudience?.isPublic}`);
        console.log('');
      });
    }

    // Test the exact filter used in the API
    console.log('4️⃣ Testing API filter logic:');
    const now = new Date();
    console.log(`   Current time: ${now}`);
    
    const apiFilter = {
      status: "published",
      $or: [{ "targetAudience.isPublic": true }, { publishDate: { $lte: now } }],
    };
    
    console.log('   Filter:', JSON.stringify(apiFilter, null, 2));
    
    const publishedAnnouncements = await Announcement.find(apiFilter);
    console.log(`   Published announcements: ${publishedAnnouncements.length}`);
    
    // Test individual filter conditions
    console.log('5️⃣ Testing individual filter conditions:');
    
    // Status filter only
    const statusFilter = { status: "published" };
    const statusOnly = await Announcement.find(statusFilter);
    console.log(`   Status = "published": ${statusOnly.length}`);
    
    // Draft status
    const draftFilter = { status: "draft" };
    const draftOnly = await Announcement.find(draftFilter);
    console.log(`   Status = "draft": ${draftOnly.length}`);
    
    // Public target audience
    const publicFilter = { "targetAudience.isPublic": true };
    const publicOnly = await Announcement.find(publicFilter);
    console.log(`   targetAudience.isPublic = true: ${publicOnly.length}`);
    
    // Publish date in past
    const dateFilter = { publishDate: { $lte: now } };
    const dateOnly = await Announcement.find(dateFilter);
    console.log(`   publishDate <= now: ${dateOnly.length}`);
    
    // Test alternative filters
    console.log('6️⃣ Testing alternative filters:');
    
    // Filter 1: Include draft announcements that have passed publish date
    const altFilter1 = {
      $or: [
        { status: "published" },
        { 
          status: "draft", 
          publishDate: { $lte: now },
          $or: [{ "targetAudience.isPublic": true }, { publishDate: { $lte: now } }]
        }
      ]
    };
    
    const alt1Results = await Announcement.find(altFilter1);
    console.log(`   Alternative filter 1 (draft + published): ${alt1Results.length}`);
    
    // Filter 2: Show all announcements regardless of status
    const altFilter2 = {};
    const alt2Results = await Announcement.find(altFilter2);
    console.log(`   Alternative filter 2 (all): ${alt2Results.length}`);
    
    // Filter 3: Show published OR draft with past publish date
    const altFilter3 = {
      $or: [
        { status: "published" },
        { 
          status: "draft", 
          publishDate: { $lte: now }
        }
      ]
    };
    
    const alt3Results = await Announcement.find(altFilter3);
    console.log(`   Alternative filter 3 (published OR draft with past date): ${alt3Results.length}`);
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugAnnouncements(); 