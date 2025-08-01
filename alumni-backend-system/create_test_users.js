const mongoose = require("mongoose")
const User = require("./models/User")
const bcrypt = require("bcryptjs")

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/alumni_network", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function createTestUsers() {
  try {
    // Check if test users already exist
    const existingUsers = await User.find({ email: { $regex: /test.*@example\.com$/ } })
    if (existingUsers.length > 0) {
      console.log("Test users already exist. Skipping creation.")
      return
    }

    const hashedPassword = await bcrypt.hash("password123", 10)

    // Create test users
    const testUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: hashedPassword,
        role: "alumni",
        phone: "+1234567890",
        profile: {
          graduationYear: 2020,
          department: "Computer Science",
          location: {
            city: "New York",
            country: "USA"
          },
          profession: "Software Engineer",
          company: "Tech Corp"
        },
        preferences: {
          privacy: {
            showEmail: true,
            showPhone: true,
            showLocation: true
          }
        }
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: hashedPassword,
        role: "alumni",
        phone: "+1234567891",
        profile: {
          graduationYear: 2019,
          department: "Business Administration",
          location: {
            city: "Los Angeles",
            country: "USA"
          },
          profession: "Marketing Manager",
          company: "Marketing Inc"
        },
        preferences: {
          privacy: {
            showEmail: true,
            showPhone: false,
            showLocation: true
          }
        }
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@example.com",
        password: hashedPassword,
        role: "student",
        phone: "+1234567892",
        profile: {
          graduationYear: 2024,
          department: "Engineering",
          location: {
            city: "Chicago",
            country: "USA"
          },
          profession: "Student",
          company: "University"
        },
        preferences: {
          privacy: {
            showEmail: true,
            showPhone: true,
            showLocation: true
          }
        }
      },
      {
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah.wilson@example.com",
        password: hashedPassword,
        role: "alumni",
        phone: "+1234567893",
        profile: {
          graduationYear: 2021,
          department: "Psychology",
          location: {
            city: "Boston",
            country: "USA"
          },
          profession: "Clinical Psychologist",
          company: "Health Clinic"
        },
        preferences: {
          privacy: {
            showEmail: true,
            showPhone: false,
            showLocation: false
          }
        }
      },
      {
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@example.com",
        password: hashedPassword,
        role: "alumni",
        phone: "+1234567894",
        profile: {
          graduationYear: 2018,
          department: "Economics",
          location: {
            city: "San Francisco",
            country: "USA"
          },
          profession: "Financial Analyst",
          company: "Investment Bank"
        },
        preferences: {
          privacy: {
            showEmail: true,
            showPhone: true,
            showLocation: true
          }
        }
      }
    ]

    // Insert test users
    const createdUsers = await User.insertMany(testUsers)
    console.log(`Created ${createdUsers.length} test users:`)
    
    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`)
    })

    console.log("\nTest users created successfully!")
    console.log("You can now test the email functionality with these users.")

  } catch (error) {
    console.error("Error creating test users:", error)
  } finally {
    mongoose.connection.close()
  }
}

createTestUsers() 