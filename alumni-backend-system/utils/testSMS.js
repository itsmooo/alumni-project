require("dotenv").config()
const { formatPhoneNumber } = require("../services/notificationService")

// Test phone number formatting
const testPhoneNumbers = [
  "0617710604",
  "+252617710604", 
  "252617710604",
  "617710604"
]

console.log("=== Phone Number Formatting Test ===\n")

testPhoneNumbers.forEach(phone => {
  const formatted = formatPhoneNumber(phone)
  console.log(`${phone} → ${formatted}`)
})

// Check Twilio configuration
console.log("\n=== Twilio Configuration Check ===")
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "✓ Set" : "✗ Missing")
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "✓ Set" : "✗ Missing") 
console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER || "✗ Missing")

// SMS capability check for Somalia
console.log("\n=== Important Notes ===")
console.log("1. Somalia (+252) may not be supported by all Twilio accounts")
console.log("2. You might need to verify your Twilio account for international SMS")
console.log("3. Consider using a different SMS provider for Somalia")
console.log("4. Alternative: Use email-only verification for now")

console.log("\n=== Recommended Solutions ===")
console.log("1. Check Twilio Console: https://console.twilio.com/")
console.log("2. Verify your account supports SMS to Somalia")
console.log("3. Try a US/UK phone number for testing")
console.log("4. Use the email verification only for production") 