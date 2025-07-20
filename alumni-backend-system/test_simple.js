const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Quick Alumni API Test\n');

async function testEndpoint(name, method, url, data = null) {
  try {
    const config = { method, url: `${BASE_URL}${url}` };
    if (data) config.data = data;
    if (method !== 'GET') config.headers = { 'Content-Type': 'application/json' };
    
    const response = await axios(config);
    console.log(`✅ ${name}: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runQuickTests() {
  console.log('Testing basic endpoints...\n');
  
  const tests = [
    ['Health Check', 'GET', '/health'],
    ['Alumni Directory', 'GET', '/alumni'],
    ['Public Events', 'GET', '/events'],
    ['Public Announcements', 'GET', '/announcements'],
    ['Public Jobs', 'GET', '/jobs'],
  ];
  
  let passed = 0;
  for (const [name, method, url] of tests) {
    if (await testEndpoint(name, method, url)) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${tests.length} passed`);
}

runQuickTests(); 