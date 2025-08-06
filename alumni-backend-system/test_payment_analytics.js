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

const testPaymentAnalytics = async () => {
  try {
    console.log('=== PAYMENT ANALYTICS TEST ===\n');

    // Test 1: Check all payments
    const allPayments = await Payment.find({}).sort({ createdAt: -1 }).limit(10);
    console.log('📊 Recent Payments:');
    allPayments.forEach(payment => {
      console.log(`  - ${payment.receipt.receiptNumber}: $${payment.amount} (${payment.status}) - ${payment.paymentMethod}`);
    });

    // Test 2: Check completed payments
    const completedPayments = await Payment.find({ status: 'completed' });
    console.log(`\n✅ Completed Payments: ${completedPayments.length}`);
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);

    // Test 3: Check payments by method
    const paymentsByMethod = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    console.log('\n📈 Payments by Method:');
    paymentsByMethod.forEach(method => {
      console.log(`  - ${method._id}: ${method.count} payments, $${method.total.toFixed(2)}`);
    });

    // Test 4: Check payments by type
    const paymentsByType = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    console.log('\n📊 Payments by Type:');
    paymentsByType.forEach(type => {
      console.log(`  - ${type._id}: ${type.count} payments, $${type.total.toFixed(2)}`);
    });

    // Test 5: Check this month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthPayments = await Payment.find({
      status: 'completed',
      createdAt: { $gte: startOfMonth }
    });
    const thisMonthRevenue = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
    console.log(`\n📅 This Month's Revenue: $${thisMonthRevenue.toFixed(2)} (${thisMonthPayments.length} payments)`);

    // Test 6: Check payment status distribution
    const statusDistribution = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\n📋 Payment Status Distribution:');
    statusDistribution.forEach(status => {
      console.log(`  - ${status._id}: ${status.count} payments`);
    });

    console.log('\n=== TEST COMPLETE ===');
    
    // Summary
    console.log('\n🎯 SUMMARY:');
    console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`Completed Payments: ${completedPayments.length}`);
    console.log(`This Month Revenue: $${thisMonthRevenue.toFixed(2)}`);
    
    if (totalRevenue === 0) {
      console.log('\n⚠️  WARNING: No completed payments found!');
      console.log('This could be why the dashboard shows $0 revenue.');
      console.log('Check if payments are being saved with status "completed".');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testPaymentAnalytics();
  mongoose.connection.close();
};

runTest(); 