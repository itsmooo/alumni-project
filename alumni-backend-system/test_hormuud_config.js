require('dotenv').config();

console.log('=== HORMUUD CONFIGURATION TEST ===');

// Check environment variables
const hormuudConfig = {
  merchantUid: process.env.HORMUUD_MERCHANT_UID,
  apiUserId: process.env.HORMUUD_API_USER_ID,
  apiKey: process.env.HORMUUD_API_KEY,
};

console.log('Environment variables:');
console.log('- HORMUUD_MERCHANT_UID:', hormuudConfig.merchantUid ? '✅ Set' : '❌ Missing');
console.log('- HORMUUD_API_USER_ID:', hormuudConfig.apiUserId ? '✅ Set' : '❌ Missing');
console.log('- HORMUUD_API_KEY:', hormuudConfig.apiKey ? '✅ Set' : '❌ Missing');

// Check if any config is missing
const missingConfig = Object.entries(hormuudConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.log('\n❌ MISSING CONFIGURATION:');
  console.log('The following Hormuud configuration variables are missing:');
  missingConfig.forEach(key => {
    console.log(`  - ${key}`);
  });
  
  console.log('\n📝 TO FIX THIS:');
  console.log('1. Add the missing variables to your .env file:');
  console.log('   HORMUUD_MERCHANT_UID=your-hormuud-merchant-uid');
  console.log('   HORMUUD_API_USER_ID=your-hormuud-api-user-id');
  console.log('   HORMUUD_API_KEY=your-hormuud-api-key');
  console.log('\n2. Get these credentials from your Hormuud payment provider');
  console.log('3. Restart your server after adding the variables');
} else {
  console.log('\n✅ ALL CONFIGURATION PRESENT');
  console.log('Hormuud configuration appears to be complete.');
  console.log('\n🔍 NEXT STEPS:');
  console.log('1. Verify the credentials are correct');
  console.log('2. Test the payment endpoint');
  console.log('3. Check Hormuud API documentation for any additional requirements');
}

console.log('\n=== TEST COMPLETE ==='); 