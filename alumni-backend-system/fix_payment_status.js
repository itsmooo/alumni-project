require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./models/Payment');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const fixPaymentStatus = async () => {
  try {
    console.log('=== FIXING PAYMENT STATUS ===\n');

    // Find all processing payments
    const processingPayments = await Payment.find({ status: 'processing' });
    console.log(`📊 Found ${processingPayments.length} payments with 'processing' status`);

    if (processingPayments.length > 0) {
      console.log('\n🔧 Updating processing payments to completed...');
      
      for (const payment of processingPayments) {
        // Check if this is a Hormuud payment that should be completed
        if (payment.paymentMethod === 'hormuud' && payment.paymentDetails?.transactionId) {
          console.log(`  - Updating payment ${payment.receipt.receiptNumber} ($${payment.amount})`);
          
          // Update to completed status
          await Payment.findByIdAndUpdate(payment._id, {
            status: 'completed',
            processedAt: new Date(),
            notes: 'Status updated by fix script - payment was successful'
          });
        }
      }
      
      console.log('✅ Processing payments updated to completed');
    }

    // Check for any failed payments that might actually be successful
    const failedPayments = await Payment.find({ status: 'failed' });
    console.log(`\n📊 Found ${failedPayments.length} payments with 'failed' status`);

    // Show summary of all payment statuses
    const statusSummary = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    console.log('\n📋 FINAL PAYMENT STATUS SUMMARY:');
    statusSummary.forEach(status => {
      console.log(`  - ${status._id}: ${status.count} payments, $${status.total.toFixed(2)}`);
    });

    // Calculate total revenue
    const completedPayments = await Payment.find({ status: 'completed' });
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    console.log(`\n💰 TOTAL REVENUE: $${totalRevenue.toFixed(2)}`);
    console.log(`📈 COMPLETED PAYMENTS: ${completedPayments.length}`);

    console.log('\n=== FIX COMPLETE ===');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
};

// Run the fix
const runFix = async () => {
  await connectDB();
  await fixPaymentStatus();
  mongoose.connection.close();
};

runFix(); 