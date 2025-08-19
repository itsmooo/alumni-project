const mongoose = require('mongoose');
const Announcement = require('./models/Announcement');
const User = require('./models/User');
require('dotenv').config();

async function createTestAnnouncements() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-network');
    console.log('Connected to database');

    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'admin',
        graduationYear: 2020,
        isActive: true,
        verification: {
          emailVerified: true,
          phoneVerified: true
        }
      });
      await testUser.save();
      console.log('Created test user');
    }

    // Create test announcements
    const testAnnouncements = [
      {
        title: 'Welcome to Alumni Network!',
        content: 'This is a test announcement to welcome all alumni to our new network platform. We\'re excited to connect with everyone!',
        category: 'general',
        priority: 'high',
        status: 'published',
        author: testUser._id,
        isPinned: true,
        publishDate: new Date(),
        targetAudience: {
          isPublic: true
        }
      },
      {
        title: 'Job Opportunity: Software Developer',
        content: 'We have an exciting job opportunity for a software developer position. Great company, competitive salary, and excellent benefits.',
        category: 'jobs',
        priority: 'medium',
        status: 'published',
        author: testUser._id,
        isPinned: false,
        publishDate: new Date(),
        targetAudience: {
          isPublic: true
        }
      },
      {
        title: 'Upcoming Alumni Event',
        content: 'Join us for our annual alumni gathering next month. It\'s a great opportunity to network and reconnect with old friends.',
        category: 'events',
        priority: 'medium',
        status: 'published',
        author: testUser._id,
        isPinned: false,
        publishDate: new Date(),
        targetAudience: {
          isPublic: true
        }
      },
      {
        title: 'Scholarship Applications Open',
        content: 'Applications for the annual alumni scholarship program are now open. Don\'t miss this opportunity to support current students.',
        category: 'scholarships',
        priority: 'high',
        status: 'published',
        author: testUser._id,
        isPinned: false,
        publishDate: new Date(),
        targetAudience: {
          isPublic: true
        }
      }
    ];

    // Clear existing test announcements
    await Announcement.deleteMany({ author: testUser._id });
    console.log('Cleared existing test announcements');

    // Create new test announcements
    for (const announcementData of testAnnouncements) {
      const announcement = new Announcement(announcementData);
      await announcement.save();
      console.log(`Created announcement: ${announcement.title}`);
    }

    console.log('✅ Test announcements created successfully!');
    
    // Show what was created
    const allAnnouncements = await Announcement.find({}).populate('author', 'firstName lastName');
    console.log('\n📋 All announcements in database:');
    allAnnouncements.forEach((ann, index) => {
      console.log(`${index + 1}. ${ann.title} (${ann.status}) - by ${ann.author.firstName} ${ann.author.lastName}`);
    });

  } catch (error) {
    console.error('❌ Error creating test announcements:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

createTestAnnouncements();
