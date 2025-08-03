const axios = require('axios');

// Test the health endpoint
async function testHealthEndpoint() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('https://your-vercel-app.vercel.app/api/health');
    console.log('Health check response:', response.data);
    return true;
  } catch (error) {
    console.error('Health check failed:', error.response?.data || error.message);
    return false;
  }
}

// Test login endpoint
async function testLoginEndpoint() {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post('https://your-vercel-app.vercel.app/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    console.log('Login response:', response.data);
    return true;
  } catch (error) {
    console.error('Login test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting Vercel deployment tests...');
  
  const healthTest = await testHealthEndpoint();
  const loginTest = await testLoginEndpoint();
  
  console.log('\nTest Results:');
  console.log('Health endpoint:', healthTest ? '✅ PASS' : '❌ FAIL');
  console.log('Login endpoint:', loginTest ? '✅ PASS' : '❌ FAIL');
  
  if (healthTest && loginTest) {
    console.log('\n🎉 All tests passed! Your Vercel deployment is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 