const mongoose = require("mongoose")
const Message = require("./models/Message")
const User = require("./models/User")

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/alumni_network", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function createTestNotifications() {
  try {
    // Get all alumni users
    const users = await User.find({ role: "alumni" }).limit(10)
    
    if (users.length === 0) {
      console.log("No alumni users found. Please create some users first.")
      return
    }

    // Create test notifications
    const testNotifications = [
      {
        type: "broadcast",
        subject: "Welcome to Alumni Network",
        content: "Welcome to our alumni network! We're excited to have you join our community. Stay connected with fellow alumni and discover exciting opportunities.",
        sender: users[0]._id,
        recipients: users.map(user => ({
          user: user._id,
          status: "sent",
          sentAt: new Date(),
        })),
        createdAt: new Date("2024-12-20T10:00:00Z"),
      },
      {
        type: "event",
        subject: "Upcoming Alumni Meetup",
        content: "Join us for our annual alumni meetup next month. Don't miss this opportunity to network with fellow graduates and industry professionals!",
        sender: users[0]._id,
        recipients: users.map(user => ({
          user: user._id,
          status: "sent",
          sentAt: new Date(),
        })),
        createdAt: new Date("2024-12-19T15:30:00Z"),
      },
      {
        type: "announcement",
        subject: "New Job Opportunities Available",
        content: "We have new job opportunities posted on our platform. Check them out and apply for positions that match your skills and experience.",
        sender: users[0]._id,
        recipients: users.map(user => ({
          user: user._id,
          status: "sent",
          sentAt: new Date(),
        })),
        createdAt: new Date("2024-12-18T09:15:00Z"),
      },
      {
        type: "job",
        subject: "Senior Software Engineer Position",
        content: "A leading tech company is looking for senior software engineers. Great benefits and competitive salary. Apply now!",
        sender: users[0]._id,
        recipients: users.map(user => ({
          user: user._id,
          status: "sent",
          sentAt: new Date(),
        })),
        createdAt: new Date("2024-12-17T14:20:00Z"),
      },
      {
        type: "broadcast",
        subject: "Alumni Directory Update",
        content: "Our alumni directory has been updated with new features. You can now search for alumni by industry, location, and graduation year.",
        sender: users[0]._id,
        recipients: users.map(user => ({
          user: user._id,
          status: "sent",
          sentAt: new Date(),
        })),
        createdAt: new Date("2024-12-16T11:45:00Z"),
      },
    ]

    // Clear existing test notifications
    await Message.deleteMany({ type: { $in: ["broadcast", "event", "announcement", "job"] } })
    console.log("Cleared existing test notifications")

    // Insert new test notifications
    const createdNotifications = await Message.insertMany(testNotifications)
    console.log(`Created ${createdNotifications.length} test notifications`)

    // Mark some notifications as read for testing
    const firstUser = users[0]
    const notificationsToMarkAsRead = createdNotifications.slice(0, 2)
    
    for (const notification of notificationsToMarkAsRead) {
      const recipientIndex = notification.recipients.findIndex(r => r.user.toString() === firstUser._id.toString())
      if (recipientIndex !== -1) {
        notification.recipients[recipientIndex].status = "read"
        notification.recipients[recipientIndex].readAt = new Date()
        await notification.save()
      }
    }

    console.log("Marked some notifications as read for testing")
    console.log("Test notifications created successfully!")

  } catch (error) {
    console.error("Error creating test notifications:", error)
  } finally {
    mongoose.connection.close()
  }
}

createTestNotifications() 