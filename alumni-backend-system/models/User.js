const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["alumni", "admin", "moderator"],
      default: "alumni",
    },
    photo: {
      type: String,
      default: '', // URL to profile photo
    },
    profile: {
      graduationYear: {
        type: Number,
        required: false,
      },
      degree: String,
      major: String,
      profession: String,
      company: String,
      location: {
        city: String,
        country: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      bio: String,
      profilePicture: String,
      socialLinks: {
        linkedin: String,
        twitter: String,
        facebook: String,
        website: String,
      },
      skills: [String],
      interests: [String],
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      pushNotifications: {
        type: Boolean,
        default: true,
      },
      privacy: {
        showEmail: {
          type: Boolean,
          default: false,
        },
        showPhone: {
          type: Boolean,
          default: false,
        },
        showLocation: {
          type: Boolean,
          default: true,
        },
      },
    },
    verification: {
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      isPhoneVerified: {
        type: Boolean,
        default: false,
      },
      emailVerificationToken: String,
      phoneVerificationCode: String,
      verificationExpires: Date,
    },
    resetPassword: {
      token: String,
      expires: Date,
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    membershipStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    membershipExpiry: Date,
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
userSchema.index({
  firstName: "text",
  lastName: "text",
  "profile.profession": "text",
  "profile.company": "text",
  "profile.location.city": "text",
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Transform output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.verification
  delete user.resetPassword
  return user
}

module.exports = mongoose.model("User", userSchema)
