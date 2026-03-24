import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    },

    phone: {
      type: String,
      trim: true,
    },

    profilePhoto: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "owner", "admin"],
      lowercase: true,
      trim: true,
      default: "customer",
    },

    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false, // don't fetch this token by default (exclude from all queries)
    },

    isVerifiedOwner: {
      type: Boolean,
      default: false,
    },

    stripeConnectedAccountId: {
      type: String,
      default: null,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    passwordResetOTP: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOTPExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

//  pre-hook runs every time .save() called
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
