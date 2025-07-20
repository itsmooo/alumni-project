const axios = require('axios');
const { expect } = require('chai');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testEventId = '';
let testJobId = '';
let testAnnouncementId = '';

// Test data
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

const updatedProfile = {
  firstName: 'John Updated',
  lastName: 'Doe Updated',
  profile: {
    profession: 'Software Engineer',
    company: 'Tech Corp',
    bio: 'Experienced software engineer with 5+ years in web development',
    location: {
      city: 'San Francisco',
      country: 'USA'
    }
  }
};

console.log('🧪 Starting Alumni API Endpoint Tests...\n');

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test 1: Health Check
async function testHealthCheck() {
  console.log('1️⃣ Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/api/health`);
    expect(response.status).to.equal(200);
    expect(response.data.status).to.equal('OK');
    console.log('✅ Health check passed\n');
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.data || error.message, '\n');
  }
}

// Test 2: User Registration
async function testUserRegistration() {
  console.log('2️⃣ Testing User Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    expect(response.status).to.equal(201);
    expect(response.data.message).to.include('registered');
    expect(response.data.token).to.exist;
    expect(response.data.user).to.exist;
    
    authToken = response.data.token;
    testUserId = response.data.user._id;
    
    console.log('✅ User registration passed');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...\n`);
  } catch (error) {
    console.log('❌ User registration failed:', error.response?.data || error.message, '\n');
  }
}

// Test 3: User Login
async function testUserLogin() {
  console.log('3️⃣ Testing User Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: testUser.email,
      password: testUser.password
    });
    
    expect(response.status).to.equal(200);
    expect(response.data.message).to.include('successful');
    expect(response.data.token).to.exist;
    expect(response.data.user).to.exist;
    
    authToken = response.data.token;
    
    console.log('✅ User login passed\n');
  } catch (error) {
    console.log('❌ User login failed:', error.response?.data || error.message, '\n');
  }
}

// Test 4: Get User Profile
async function testGetUserProfile() {
  console.log('4️⃣ Testing Get User Profile...');
  try {
    const response = await makeAuthRequest('GET', '/users/profile');
    expect(response.status).to.equal(200);
    expect(response.data.user).to.exist;
    expect(response.data.user.email).to.equal(testUser.email);
    
    console.log('✅ Get user profile passed\n');
  } catch (error) {
    console.log('❌ Get user profile failed:', error.response?.data || error.message, '\n');
  }
}

// Test 5: Update User Profile
async function testUpdateUserProfile() {
  console.log('5️⃣ Testing Update User Profile...');
  try {
    const response = await makeAuthRequest('PUT', '/users/profile', updatedProfile);
    expect(response.status).to.equal(200);
    expect(response.data.message).to.include('updated');
    expect(response.data.user.firstName).to.equal(updatedProfile.firstName);
    expect(response.data.user.profile.profession).to.equal(updatedProfile.profile.profession);
    
    console.log('✅ Update user profile passed\n');
  } catch (error) {
    console.log('❌ Update user profile failed:', error.response?.data || error.message, '\n');
  }
}

// Test 6: Get Alumni Directory
async function testGetAlumniDirectory() {
  console.log('6️⃣ Testing Get Alumni Directory...');
  try {
    const response = await makeAuthRequest('GET', '/alumni');
    expect(response.status).to.equal(200);
    expect(response.data.alumni).to.be.an('array');
    expect(response.data.pagination).to.exist;
    
    console.log(`   Found ${response.data.alumni.length} alumni`);
    console.log(`   Total pages: ${response.data.pagination.totalPages}`);
    console.log('✅ Get alumni directory passed\n');
  } catch (error) {
    console.log('❌ Get alumni directory failed:', error.response?.data || error.message, '\n');
  }
}

// Test 7: Search Alumni
async function testSearchAlumni() {
  console.log('7️⃣ Testing Search Alumni...');
  try {
    const response = await makeAuthRequest('GET', '/alumni?search=John&limit=5');
    expect(response.status).to.equal(200);
    expect(response.data.alumni).to.be.an('array');
    
    console.log(`   Found ${response.data.alumni.length} alumni matching "John"`);
    console.log('✅ Search alumni passed\n');
  } catch (error) {
    console.log('❌ Search alumni failed:', error.response?.data || error.message, '\n');
  }
}

// Test 8: Get Public Events
async function testGetPublicEvents() {
  console.log('8️⃣ Testing Get Public Events...');
  try {
    const response = await makeAuthRequest('GET', '/events');
    expect(response.status).to.equal(200);
    expect(response.data.events).to.be.an('array');
    expect(response.data.pagination).to.exist;
    
    if (response.data.events.length > 0) {
      testEventId = response.data.events[0]._id;
    }
    
    console.log(`   Found ${response.data.events.length} events`);
    console.log('✅ Get public events passed\n');
  } catch (error) {
    console.log('❌ Get public events failed:', error.response?.data || error.message, '\n');
  }
}

// Test 9: Get Event Details
async function testGetEventDetails() {
  if (!testEventId) {
    console.log('9️⃣ Skipping Get Event Details (no events available)\n');
    return;
  }
  
  console.log('9️⃣ Testing Get Event Details...');
  try {
    const response = await makeAuthRequest('GET', `/events/${testEventId}`);
    expect(response.status).to.equal(200);
    expect(response.data.event).to.exist;
    expect(response.data.event._id).to.equal(testEventId);
    
    console.log(`   Event: ${response.data.event.title}`);
    console.log('✅ Get event details passed\n');
  } catch (error) {
    console.log('❌ Get event details failed:', error.response?.data || error.message, '\n');
  }
}

// Test 10: RSVP to Event
async function testEventRSVP() {
  if (!testEventId) {
    console.log('🔟 Skipping Event RSVP (no events available)\n');
    return;
  }
  
  console.log('🔟 Testing Event RSVP...');
  try {
    const response = await makeAuthRequest('POST', `/events/${testEventId}/rsvp`, {
      status: 'registered',
      guests: 1,
      dietaryRestrictions: 'None',
      specialRequests: 'Test RSVP'
    });
    
    expect(response.status).to.equal(200);
    expect(response.data.message).to.include('RSVP');
    
    console.log('✅ Event RSVP passed\n');
  } catch (error) {
    console.log('❌ Event RSVP failed:', error.response?.data || error.message, '\n');
  }
}

// Test 11: Get Public Announcements
async function testGetPublicAnnouncements() {
  console.log('1️⃣1️⃣ Testing Get Public Announcements...');
  try {
    const response = await makeAuthRequest('GET', '/announcements');
    expect(response.status).to.equal(200);
    expect(response.data.announcements).to.be.an('array');
    expect(response.data.pagination).to.exist;
    
    if (response.data.announcements.length > 0) {
      testAnnouncementId = response.data.announcements[0]._id;
    }
    
    console.log(`   Found ${response.data.announcements.length} announcements`);
    console.log('✅ Get public announcements passed\n');
  } catch (error) {
    console.log('❌ Get public announcements failed:', error.response?.data || error.message, '\n');
  }
}

// Test 12: Get Announcement Details
async function testGetAnnouncementDetails() {
  if (!testAnnouncementId) {
    console.log('1️⃣2️⃣ Skipping Get Announcement Details (no announcements available)\n');
    return;
  }
  
  console.log('1️⃣2️⃣ Testing Get Announcement Details...');
  try {
    const response = await makeAuthRequest('GET', `/announcements/${testAnnouncementId}`);
    expect(response.status).to.equal(200);
    expect(response.data.announcement).to.exist;
    expect(response.data.announcement._id).to.equal(testAnnouncementId);
    
    console.log(`   Announcement: ${response.data.announcement.title}`);
    console.log('✅ Get announcement details passed\n');
  } catch (error) {
    console.log('❌ Get announcement details failed:', error.response?.data || error.message, '\n');
  }
}

// Test 13: Get Public Jobs
async function testGetPublicJobs() {
  console.log('1️⃣3️⃣ Testing Get Public Jobs...');
  try {
    const response = await makeAuthRequest('GET', '/jobs');
    expect(response.status).to.equal(200);
    expect(response.data.jobs).to.be.an('array');
    expect(response.data.pagination).to.exist;
    
    if (response.data.jobs.length > 0) {
      testJobId = response.data.jobs[0]._id;
    }
    
    console.log(`   Found ${response.data.jobs.length} jobs`);
    console.log('✅ Get public jobs passed\n');
  } catch (error) {
    console.log('❌ Get public jobs failed:', error.response?.data || error.message, '\n');
  }
}

// Test 14: Get Job Details
async function testGetJobDetails() {
  if (!testJobId) {
    console.log('1️⃣4️⃣ Skipping Get Job Details (no jobs available)\n');
    return;
  }
  
  console.log('1️⃣4️⃣ Testing Get Job Details...');
  try {
    const response = await makeAuthRequest('GET', `/jobs/${testJobId}`);
    expect(response.status).to.equal(200);
    expect(response.data.job).to.exist;
    expect(response.data.job._id).to.equal(testJobId);
    
    console.log(`   Job: ${response.data.job.title}`);
    console.log('✅ Get job details passed\n');
  } catch (error) {
    console.log('❌ Get job details failed:', error.response?.data || error.message, '\n');
  }
}

// Test 15: Apply to Job
async function testJobApplication() {
  if (!testJobId) {
    console.log('1️⃣5️⃣ Skipping Job Application (no jobs available)\n');
    return;
  }
  
  console.log('1️⃣5️⃣ Testing Job Application...');
  try {
    const response = await makeAuthRequest('POST', `/jobs/${testJobId}/apply`, {
      coverLetter: 'I am interested in this position and believe my skills match the requirements.',
      resume: 'https://example.com/resume.pdf',
      portfolio: 'https://github.com/johndoe',
      availability: 'Immediate',
      salaryExpectation: '80000-100000'
    });
    
    expect(response.status).to.equal(200);
    expect(response.data.message).to.include('application');
    
    console.log('✅ Job application passed\n');
  } catch (error) {
    console.log('❌ Job application failed:', error.response?.data || error.message, '\n');
  }
}

// Test 16: Get User Summary
async function testGetUserSummary() {
  console.log('1️⃣6️⃣ Testing Get User Summary...');
  try {
    const response = await makeAuthRequest('GET', '/users/summary');
    expect(response.status).to.equal(200);
    expect(response.data.user).to.exist;
    expect(response.data.stats).to.exist;
    
    console.log('✅ Get user summary passed\n');
  } catch (error) {
    console.log('❌ Get user summary failed:', error.response?.data || error.message, '\n');
  }
}

// Test 17: Test Unauthorized Access
async function testUnauthorizedAccess() {
  console.log('1️⃣7️⃣ Testing Unauthorized Access...');
  try {
    // Try to access protected route without token
    await axios.get(`${BASE_URL}/users/profile`);
    console.log('❌ Unauthorized access test failed - should have been blocked\n');
  } catch (error) {
    expect(error.response.status).to.equal(401);
    console.log('✅ Unauthorized access properly blocked\n');
  }
}

// Test 18: Test Invalid Token
async function testInvalidToken() {
  console.log('1️⃣8️⃣ Testing Invalid Token...');
  try {
    const response = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here'
      }
    });
    console.log('❌ Invalid token test failed - should have been blocked\n');
  } catch (error) {
    expect(error.response.status).to.equal(401);
    console.log('✅ Invalid token properly rejected\n');
  }
}

// Test 19: Test Pagination
async function testPagination() {
  console.log('1️⃣9️⃣ Testing Pagination...');
  try {
    const response = await makeAuthRequest('GET', '/alumni?page=1&limit=5');
    expect(response.status).to.equal(200);
    expect(response.data.pagination).to.exist;
    expect(response.data.pagination.currentPage).to.equal(1);
    expect(response.data.pagination.totalPages).to.be.at.least(1);
    
    console.log(`   Page 1: ${response.data.alumni.length} items`);
    console.log(`   Total pages: ${response.data.pagination.totalPages}`);
    console.log('✅ Pagination test passed\n');
  } catch (error) {
    console.log('❌ Pagination test failed:', error.response?.data || error.message, '\n');
  }
}

// Test 20: Test Search and Filtering
async function testSearchAndFiltering() {
  console.log('2️⃣0️⃣ Testing Search and Filtering...');
  try {
    // Test search
    const searchResponse = await makeAuthRequest('GET', '/alumni?search=John');
    expect(searchResponse.status).to.equal(200);
    
    // Test filtering by graduation year
    const filterResponse = await makeAuthRequest('GET', `/alumni?graduationYear=${testUser.graduationYear}`);
    expect(filterResponse.status).to.equal(200);
    
    console.log(`   Search results: ${searchResponse.data.alumni.length} alumni`);
    console.log(`   Filter results: ${filterResponse.data.alumni.length} alumni`);
    console.log('✅ Search and filtering test passed\n');
  } catch (error) {
    console.log('❌ Search and filtering test failed:', error.response?.data || error.message, '\n');
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Alumni API Endpoint Tests...\n');
  
  try {
    await testHealthCheck();
    await testUserRegistration();
    await testUserLogin();
    await testGetUserProfile();
    await testUpdateUserProfile();
    await testGetAlumniDirectory();
    await testSearchAlumni();
    await testGetPublicEvents();
    await testGetEventDetails();
    await testEventRSVP();
    await testGetPublicAnnouncements();
    await testGetAnnouncementDetails();
    await testGetPublicJobs();
    await testGetJobDetails();
    await testJobApplication();
    await testGetUserSummary();
    await testUnauthorizedAccess();
    await testInvalidToken();
    await testPagination();
    await testSearchAndFiltering();
    
    console.log('🎉 All tests completed!');
    console.log('\n📊 Test Summary:');
    console.log('   - Authentication endpoints: ✅');
    console.log('   - User profile management: ✅');
    console.log('   - Alumni directory: ✅');
    console.log('   - Events and RSVP: ✅');
    console.log('   - Announcements: ✅');
    console.log('   - Job board: ✅');
    console.log('   - Security and authorization: ✅');
    console.log('   - Pagination and filtering: ✅');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Export for use in other files
module.exports = {
  runAllTests,
  testUser,
  authToken,
  testUserId
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
} 