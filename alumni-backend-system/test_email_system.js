require("dotenv").config()
const { sendEmail, sendBulkEmail } = require("./services/notificationService")

async function testEmailSystem() {
  console.log("=== Testing Email System ===\n")

  // Test 1: Single email
  console.log("1. Testing single email...")
  try {
    const singleEmailResult = await sendEmail({
      to: "test@example.com",
      subject: "Test Email from Alumni System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Alumni Network</h2>
          <h3>Test Email</h3>
          <div style="line-height: 1.6; color: #374151;">
            This is a test email from the Alumni Network system.
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent from the Alumni Network system.
          </p>
        </div>
      `,
      text: "This is a test email from the Alumni Network system."
    })
    console.log("✅ Single email test passed")
    console.log("Message ID:", singleEmailResult.messageId)
  } catch (error) {
    console.log("❌ Single email test failed:", error.message)
  }

  // Test 2: Bulk email
  console.log("\n2. Testing bulk email...")
  try {
    const bulkEmailResult = await sendBulkEmail(
      ["test1@example.com", "test2@example.com"],
      {
        subject: "Bulk Test Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Alumni Network</h2>
            <h3>Bulk Test Email</h3>
            <div style="line-height: 1.6; color: #374151;">
              This is a bulk test email from the Alumni Network system.
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              This email was sent from the Alumni Network system.
            </p>
          </div>
        `,
        text: "This is a bulk test email from the Alumni Network system."
      }
    )
    console.log("✅ Bulk email test passed")
    console.log("Successful:", bulkEmailResult.successful)
    console.log("Failed:", bulkEmailResult.failed)
  } catch (error) {
    console.log("❌ Bulk email test failed:", error.message)
  }

  // Test 3: Check environment variables
  console.log("\n3. Checking environment variables...")
  const requiredVars = [
    "SMTP_HOST",
    "SMTP_PORT", 
    "SMTP_USER",
    "SMTP_PASS",
    "FROM_EMAIL"
  ]
  
  let allVarsSet = true
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: Set`)
    } else {
      console.log(`❌ ${varName}: Missing`)
      allVarsSet = false
    }
  })

  if (!allVarsSet) {
    console.log("\n⚠️  Some environment variables are missing!")
    console.log("Please set the following in your .env file:")
    console.log("SMTP_HOST=your-smtp-host")
    console.log("SMTP_PORT=587")
    console.log("SMTP_USER=your-email")
    console.log("SMTP_PASS=your-password")
    console.log("FROM_EMAIL=noreply@alumni.com")
  } else {
    console.log("\n✅ All environment variables are set!")
  }

  console.log("\n=== Email System Test Complete ===")
}

// Run the test
testEmailSystem().catch(console.error) 