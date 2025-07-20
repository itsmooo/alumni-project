const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLoginFullUser() {
  try {
    console.log('🧪 Testing Login with Full User Information...\n');

    // Test login with existing user
    console.log('1️⃣ Testing Login Endpoint...');
    try {
      const loginData = {
        identifier: 'mohamedadanmohamed113@gmail.com', // Use the email from your example
        password: 'TestPassword123!' // You'll need to use the actual password
      };

      const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
      
      console.log('✅ Login successful!');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Token: ${response.data.token.substring(0, 50)}...`);
      
      console.log('\n📋 Full User Information:');
      const user = response.data.user;
      
      // Basic info
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Last Login: ${user.lastLogin}`);
      
      // Profile info
      console.log('\n   📝 Profile:');
      if (user.profile) {
        console.log(`     Graduation Year: ${user.profile.graduationYear || 'Not set'}`);
        console.log(`     Degree: ${user.profile.degree || 'Not set'}`);
        console.log(`     Major: ${user.profile.major || 'Not set'}`);
        console.log(`     Profession: ${user.profile.profession || 'Not set'}`);
        console.log(`     Company: ${user.profile.company || 'Not set'}`);
        console.log(`     Bio: ${user.profile.bio || 'Not set'}`);
        console.log(`     Profile Picture: ${user.profile.profilePicture || 'Not set'}`);
        
        if (user.profile.location) {
          console.log(`     Location: ${user.profile.location.city || 'Not set'}, ${user.profile.location.country || 'Not set'}`);
        }
        
        if (user.profile.socialLinks) {
          console.log(`     LinkedIn: ${user.profile.socialLinks.linkedin || 'Not set'}`);
          console.log(`     Twitter: ${user.profile.socialLinks.twitter || 'Not set'}`);
          console.log(`     Facebook: ${user.profile.socialLinks.facebook || 'Not set'}`);
          console.log(`     Website: ${user.profile.socialLinks.website || 'Not set'}`);
        }
        
        console.log(`     Skills: ${user.profile.skills?.length ? user.profile.skills.join(', ') : 'Not set'}`);
        console.log(`     Interests: ${user.profile.interests?.length ? user.profile.interests.join(', ') : 'Not set'}`);
      }
      
      // Preferences
      console.log('\n   ⚙️ Preferences:');
      if (user.preferences) {
        console.log(`     Email Notifications: ${user.preferences.emailNotifications}`);
        console.log(`     SMS Notifications: ${user.preferences.smsNotifications}`);
        console.log(`     Push Notifications: ${user.preferences.pushNotifications}`);
        
        if (user.preferences.privacy) {
          console.log(`     Show Email: ${user.preferences.privacy.showEmail}`);
          console.log(`     Show Phone: ${user.preferences.privacy.showPhone}`);
          console.log(`     Show Location: ${user.preferences.privacy.showLocation}`);
        }
      }
      
      // Verification status
      console.log('\n   ✅ Verification:');
      console.log(`     Email Verified: ${user.verification?.isEmailVerified || false}`);
      console.log(`     Phone Verified: ${user.verification?.isPhoneVerified || false}`);
      
      // Membership
      console.log('\n   🏆 Membership:');
      console.log(`     Status: ${user.membershipStatus}`);
      console.log(`     Expiry: ${user.membershipExpiry || 'Not set'}`);
      
      // Timestamps
      console.log('\n   📅 Timestamps:');
      console.log(`     Created: ${user.createdAt}`);
      console.log(`     Updated: ${user.updatedAt}`);
      
      // Check for sensitive data (should be removed)
      console.log('\n   🔒 Security Check:');
      console.log(`     Password field: ${user.password ? '❌ EXPOSED' : '✅ Removed'}`);
      console.log(`     Email verification token: ${user.verification?.emailVerificationToken ? '❌ EXPOSED' : '✅ Removed'}`);
      console.log(`     Phone verification code: ${user.verification?.phoneVerificationCode ? '❌ EXPOSED' : '✅ Removed'}`);
      console.log(`     Reset password token: ${user.resetPassword ? '❌ EXPOSED' : '✅ Removed'}`);
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        console.log('\n💡 Tip: You may need to use the correct password for the test user.');
        console.log('   Try using a different user or update the password in the test script.');
      }
    }

    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLoginFullUser(); 