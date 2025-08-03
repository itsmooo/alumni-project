const { ensureConnection } = require('./utils/database');
const mongoose = require('mongoose');

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Is Vercel:', !!process.env.VERCEL);
  
  try {
    // Test connection
    await ensureConnection();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('✅ Database query successful!');
    console.log('Available collections:', collections.map(c => c.name));
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(success => {
      if (success) {
        console.log('\n🎉 Database connection test passed!');
        process.exit(0);
      } else {
        console.log('\n💥 Database connection test failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test error:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection }; 