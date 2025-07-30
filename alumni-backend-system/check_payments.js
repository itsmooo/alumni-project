const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User'); // Add User model import
require('dotenv').config();

async function checkPayments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all payments
    const payments = await Payment.find({}).populate('user', 'firstName lastName email');
    
    console.log(`\n=== PAYMENTS IN DATABASE (${payments.length} total) ===\n`);
    
    if (payments.length === 0) {
      console.log('No payments found in database');
    } else {
      payments.forEach((payment, index) => {
        console.log(`${index + 1}. Payment ID: ${payment._id}`);
        console.log(`   User: ${payment.user?.firstName} ${payment.user?.lastName} (${payment.user?.email})`);
        console.log(`   Type: ${payment.type}`);
        console.log(`   Purpose: ${payment.purpose}`);
        console.log(`   Amount: ${payment.currency} ${payment.amount}`);
        console.log(`   Method: ${payment.paymentMethod}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Created: ${payment.createdAt}`);
        if (payment.paymentDetails?.phoneNumber) {
          console.log(`   Phone: ${payment.paymentDetails.phoneNumber}`);
        }
        if (payment.paymentDetails?.transactionId) {
          console.log(`   Transaction ID: ${payment.paymentDetails.transactionId}`);
        }
        console.log('');
      });
    }

    // Get payment statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          byStatus: { $push: '$status' },
          byMethod: { $push: '$paymentMethod' },
          byType: { $push: '$type' }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log('=== PAYMENT STATISTICS ===');
      console.log(`Total Payments: ${stat.total}`);
      console.log(`Total Amount: $${stat.totalAmount}`);
      
      // Count by status
      const statusCounts = {};
      stat.byStatus.forEach(status => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('By Status:', statusCounts);
      
      // Count by method
      const methodCounts = {};
      stat.byMethod.forEach(method => {
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      });
      console.log('By Method:', methodCounts);
      
      // Count by type
      const typeCounts = {};
      stat.byType.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      console.log('By Type:', typeCounts);
    }

  } catch (error) {
    console.error('Error checking payments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkPayments(); 