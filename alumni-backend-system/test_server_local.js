const axios = require('axios');

async function testLocalServer() {
  try {
    console.log('🧪 Testing local server...');
    
    // Test root endpoint
    const rootResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Root endpoint:', rootResponse.data);
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health endpoint:', healthResponse.data);
    
    // Test auth endpoint (should return 400 for missing body, not 404)
    try {
      const authResponse = await axios.post('http://localhost:5000/api/auth/login', {});
      console.log('❌ Auth endpoint should not work without credentials');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Auth endpoint is working (returned 400 as expected)');
      } else {
        console.log('❌ Auth endpoint error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your server is running with: npm start');
    }
  }
}

testLocalServer();
