const mongoose = require("mongoose")
require("dotenv").config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/alumni-network")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

const User = require("../models/User")

// Function to find and display duplicate users by email
const findDuplicateUsers = async () => {
  try {
    const duplicates = await User.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          users: { $push: { id: "$_id", firstName: "$firstName", lastName: "$lastName", createdAt: "$createdAt" } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ])

    if (duplicates.length === 0) {
      console.log("No duplicate users found")
    } else {
      console.log("Duplicate users found:")
      duplicates.forEach(duplicate => {
        console.log(`\nEmail: ${duplicate._id}`)
        console.log(`Count: ${duplicate.count}`)
        duplicate.users.forEach((user, index) => {
          console.log(`  ${index + 1}. ID: ${user.id}, Name: ${user.firstName} ${user.lastName}, Created: ${user.createdAt}`)
        })
      })
    }

    return duplicates
  } catch (error) {
    console.error("Error finding duplicates:", error)
  }
}

// Function to clean up duplicate users (keeps the latest one)
const cleanupDuplicateUsers = async () => {
  try {
    const duplicates = await findDuplicateUsers()
    
    for (const duplicate of duplicates) {
      // Sort by creation date, keep the latest one
      const sortedUsers = duplicate.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const usersToDelete = sortedUsers.slice(1) // Remove all except the first (latest)
      
      console.log(`\nCleaning up duplicates for ${duplicate._id}:`)
      console.log(`Keeping: ${sortedUsers[0].firstName} ${sortedUsers[0].lastName} (${sortedUsers[0].id})`)
      
      for (const userToDelete of usersToDelete) {
        await User.findByIdAndDelete(userToDelete.id)
        console.log(`Deleted: ${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.id})`)
      }
    }
    
    console.log("\nCleanup completed!")
  } catch (error) {
    console.error("Error during cleanup:", error)
  }
}

// Run the functions
const main = async () => {
  console.log("=== User Cleanup Utility ===\n")
  
  // First, show duplicates
  await findDuplicateUsers()
  
  // Ask if user wants to clean up (in a real scenario, you'd add readline for user input)
  // For now, just show what would be cleaned
  console.log("\nTo clean up duplicates, uncomment the line below and run again:")
  console.log("// await cleanupDuplicateUsers()")
  
  // Uncomment the line below if you want to actually clean up
  // await cleanupDuplicateUsers()
  
  process.exit(0)
}

if (require.main === module) {
  main()
}

module.exports = {
  findDuplicateUsers,
  cleanupDuplicateUsers
} 