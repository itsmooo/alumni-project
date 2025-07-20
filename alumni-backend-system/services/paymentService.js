const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Payment = require("../models/Payment")

// Create Stripe payment intent
const createStripePayment = async ({ amount, currency, userId, type, purpose }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId,
        type,
        purpose,
      },
    })

    // Create payment record
    const payment = new Payment({
      user: userId,
      type,
      purpose,
      amount,
      currency,
      paymentMethod: "card",
      paymentDetails: {
        stripePaymentIntentId: paymentIntent.id,
      },
      status: "pending",
    })

    await payment.save()

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    }
  } catch (error) {
    console.error("Stripe payment creation error:", error)
    throw error
  }
}

// Handle Stripe webhook
const handleStripeWebhook = async (event) => {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        await Payment.findOneAndUpdate(
          { "paymentDetails.stripePaymentIntentId": paymentIntent.id },
          {
            status: "completed",
            processedAt: new Date(),
            "paymentDetails.cardLast4": paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
            "paymentDetails.cardBrand": paymentIntent.charges.data[0]?.payment_method_details?.card?.brand,
          },
        )
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        await Payment.findOneAndUpdate(
          { "paymentDetails.stripePaymentIntentId": failedPayment.id },
          {
            status: "failed",
            failureReason: failedPayment.last_payment_error?.message,
          },
        )
        break
    }
  } catch (error) {
    console.error("Stripe webhook error:", error)
    throw error
  }
}

// Process mobile money payment (mock implementation)
const processMobileMoneyPayment = async ({ phoneNumber, amount, currency, userId, type, purpose, provider }) => {
  try {
    // This would integrate with actual mobile money APIs (Hormuud, Zaad, etc.)
    // For now, this is a mock implementation

    const payment = new Payment({
      user: userId,
      type,
      purpose,
      amount,
      currency,
      paymentMethod: provider.toLowerCase(),
      paymentDetails: {
        phoneNumber,
        transactionId: `MM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      status: "processing",
    })

    await payment.save()

    // Simulate API call to mobile money provider
    setTimeout(async () => {
      try {
        // Simulate success/failure (80% success rate)
        const isSuccess = Math.random() > 0.2

        if (isSuccess) {
          payment.status = "completed"
          payment.processedAt = new Date()
        } else {
          payment.status = "failed"
          payment.failureReason = "Insufficient balance or network error"
        }

        await payment.save()
      } catch (error) {
        console.error("Mobile money callback error:", error)
      }
    }, 5000) // Simulate 5 second processing time

    return {
      paymentId: payment._id,
      transactionId: payment.paymentDetails.transactionId,
      status: "processing",
    }
  } catch (error) {
    console.error("Mobile money payment error:", error)
    throw error
  }
}

// Generate receipt
const generateReceipt = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId).populate("user", "firstName lastName email")

    if (!payment) {
      throw new Error("Payment not found")
    }

    // Generate receipt HTML (you can use a template engine like Handlebars)
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Alumni Network</h1>
          <h2>Payment Receipt</h2>
        </div>
        <div class="details">
          <p><strong>Receipt Number:</strong> ${payment.receipt.receiptNumber}</p>
          <p><strong>Date:</strong> ${payment.createdAt.toLocaleDateString()}</p>
          <p><strong>Name:</strong> ${payment.user.firstName} ${payment.user.lastName}</p>
          <p><strong>Email:</strong> ${payment.user.email}</p>
          <p><strong>Purpose:</strong> ${payment.purpose}</p>
          <p><strong>Payment Method:</strong> ${payment.paymentMethod.toUpperCase()}</p>
          <p class="amount"><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
          <p><strong>Status:</strong> ${payment.status.toUpperCase()}</p>
        </div>
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>For any questions, contact us at support@alumninetwork.com</p>
        </div>
      </body>
      </html>
    `

    // In a real implementation, you would convert HTML to PDF using libraries like puppeteer
    // For now, we'll just store the HTML
    payment.receipt.issuedAt = new Date()
    payment.receipt.downloadUrl = `/api/payments/${paymentId}/receipt`
    await payment.save()

    return receiptHtml
  } catch (error) {
    console.error("Receipt generation error:", error)
    throw error
  }
}

module.exports = {
  createStripePayment,
  handleStripeWebhook,
  processMobileMoneyPayment,
  generateReceipt,
}
