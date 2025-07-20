const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAnnouncementsFix() {
  try {
    console.log('🧪 Testing Announcements Fix...\n');

    // Test the debug endpoint first
    console.log('1️⃣ Testing Debug Endpoint...');
    try {
      const debugResponse = await axios.get(`${BASE_URL}/announcements/debug`);
      const debugData = debugResponse.data.debug;
      
      console.log(`   Total announcements in DB: ${debugData.totalAnnouncements}`);
      console.log(`   Old filter results: ${debugData.oldFilterResults}`);
      console.log(`   New filter results: ${debugData.newFilterResults}`);
      console.log(`   Current time: ${debugData.currentTime}`);
      
      if (debugData.allAnnouncements.length > 0) {
        console.log('   Announcements details:');
        debugData.allAnnouncements.forEach(ann => {
          console.log(`     - ID: ${ann.id}`);
          console.log(`       Title: "${ann.title}"`);
          console.log(`       Status: ${ann.status}`);
          console.log(`       PublishDate: ${ann.publishDate}`);
          console.log(`       targetAudience.isPublic: ${ann.targetAudience?.isPublic}`);
          console.log('');
        });
      }
      
    } catch (error) {
      console.log('   ❌ Debug endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test the main announcements endpoint
    console.log('2️⃣ Testing Main Announcements Endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/announcements`);
      console.log(`   ✅ Main endpoint returned ${response.data.announcements?.length || 0} announcements`);
      
      if (response.data.announcements && response.data.announcements.length > 0) {
        console.log('   First announcement:');
        const firstAnn = response.data.announcements[0];
        console.log(`     Title: "${firstAnn.title}"`);
        console.log(`     Status: ${firstAnn.status}`);
        console.log(`     PublishDate: ${firstAnn.publishDate}`);
      }
      
    } catch (error) {
      console.log('   ❌ Main endpoint failed:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAnnouncementsFix(); 