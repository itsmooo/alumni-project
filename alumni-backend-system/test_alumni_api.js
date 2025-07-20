const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';

const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phone: '+1234567890',
  password: 'TestPassword123!',
  graduationYear: 2020,
  degree: 'Bachelor of Science',
  major: 'Computer Science'
};

console.log('🧪 Testing Alumni API Endpoints...\n');

async function makeAuthRequest(method, url, data = null) {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (data) config.data = data;
  return axios(config);
}

async function testHealthCheck() {
  console.log('1️⃣ Health Check...');
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/api/health`);
    console.log('✅ Health check passed\n');
    return true;
  } catch (error) {
    console.log('❌ Health check failed\n');
    return false;
  }
}

async function testRegistration() {
  console.log('2️⃣ User Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    authToken = response.data.token;
    testUserId = response.data.user._id;
    console.log('✅ Registration passed\n');
    return true;
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testLogin() {
  console.log('3️⃣ User Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: testUser.email,
      password: testUser.password
    });
    authToken = response.data.token;
    console.log('✅ Login passed\n');
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testGetProfile() {
  console.log('4️⃣ Get User Profile...');
  try {
    const response = await makeAuthRequest('GET', '/users/profile');
    console.log('✅ Get profile passed\n');
    return true;
  } catch (error) {
    console.log('❌ Get profile failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testUpdateProfile() {
  console.log('5️⃣ Update User Profile...');
  try {
    const response = await makeAuthRequest('PUT', '/users/profile', {
      firstName: 'John Updated',
      profile: {
        profession: 'Software Engineer',
        company: 'Tech Corp',
        bio: 'Experienced developer'
      }
    });
    console.log('✅ Update profile passed\n');
    return true;
  } catch (error) {
    console.log('❌ Update profile failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testAlumniDirectory() {
  console.log('6️⃣ Alumni Directory...');
  try {
    const response = await makeAuthRequest('GET', '/alumni');
    console.log(`   Found ${response.data.alumni?.length || 0} alumni`);
    console.log('✅ Alumni directory passed\n');
    return true;
  } catch (error) {
    console.log('❌ Alumni directory failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testSearchAlumni() {
  console.log('7️⃣ Search Alumni...');
  try {
    const response = await makeAuthRequest('GET', '/alumni?search=John&limit=5');
    console.log(`   Found ${response.data.alumni?.length || 0} matching results`);
    console.log('✅ Search alumni passed\n');
    return true;
  } catch (error) {
    console.log('❌ Search alumni failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testGetEvents() {
  console.log('8️⃣ Get Events...');
  try {
    const response = await makeAuthRequest('GET', '/events');
    console.log(`   Found ${response.data.events?.length || 0} events`);
    console.log('✅ Get events passed\n');
    return true;
  } catch (error) {
    console.log('❌ Get events failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testGetAnnouncements() {
  console.log('9️⃣ Get Announcements...');
  try {
    const response = await makeAuthRequest('GET', '/announcements');
    console.log(`   Found ${response.data.announcements?.length || 0} announcements`);
    console.log('✅ Get announcements passed\n');
    return true;
  } catch (error) {
    console.log('❌ Get announcements failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testGetJobs() {
  console.log('🔟 Get Jobs...');
  try {
    const response = await makeAuthRequest('GET', '/jobs');
    console.log(`   Found ${response.data.jobs?.length || 0} jobs`);
    console.log('✅ Get jobs passed\n');
    return true;
  } catch (error) {
    console.log('❌ Get jobs failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testUserSummary() {
  console.log('1️⃣1️⃣ User Summary...');
  try {
    const response = await makeAuthRequest('GET', '/users/summary');
    console.log('✅ User summary passed\n');
    return true;
  } catch (error) {
    console.log('❌ User summary failed:', error.response?.data?.message || error.message, '\n');
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('1️⃣2️⃣ Unauthorized Access Test...');
  try {
    await axios.get(`${BASE_URL}/users/profile');
    console.log('❌ Should have been blocked\n');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access properly blocked\n');
      return true;
    }
    console.log('❌ Unexpected error\n');
    return false;
  }
}

async function runTests() {
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testRegistration());
  results.push(await testLogin());
  results.push(await testGetProfile());
  results.push(await testUpdateProfile());
  results.push(await testAlumniDirectory());
  results.push(await testSearchAlumni());
  results.push(await testGetEvents());
  results.push(await testGetAnnouncements());
  results.push(await testGetJobs());
  results.push(await testUserSummary());
  results.push(await testUnauthorizedAccess());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('🎉 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Success Rate: ${((passed/total)*100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎊 All tests passed! Alumni API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the server and endpoints.');
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 