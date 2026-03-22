import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      trim: true,
      default: null,
    },

    phone: {
        type: String,
        trim: true,
    },

    profilePhoto: {
        type: String,
        time: true,
    },

    role: {
        type: String,
        enum: ["customer", "owner", "admin"],
        lowercase: true,
        trim: true,
    },

    address: {
        street: {
            type: String,
            lowercase: true,
            trim: true
        },
        city: {
            type: String,
            lowercase: true,
            trim: true
        },
        state: {
            type: String,
            lowercase: true,
            trim: true
        },
        pincode: {
            type: String,
            lowercase: true,
            trim: true
        },
        country: {
            type: String,
            lowercase: true,
            trim: true
        },
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLoginAt: {
        type: Date,
    },

    googleId: {
        type: String,
        default: null,
    },


    isGoogleUser: {
        type: String, 
        default: null,
    },

    refreshToken: {
        type: String,
        default: false,
    }, 

    
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
