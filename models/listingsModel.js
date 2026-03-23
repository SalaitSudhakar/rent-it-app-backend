import mongoose from "mongoose";

const listingsSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    photos: {
      type: [String],
    },

    condition: {
      type: String,
      enum: ["new", "good", "fair"],
    },

    location: {
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },

    pricing: {
      perHour: {
        type: Number,
        default: null,
      },
      perDay: {
        type: Number,
        default: null,
      },
      perWeek: {
        type: Number,
        default: null,
      },
    },

    securityDeposit: {
      type: Number,
      required: true,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    isDeliveryAvailable: {
      type: Boolean,
      default: false,
    },

    blockedDates: {
      type: [
        {
          from: { type: Date, required: true },
          to: { type: Date, required: true },
        },
      ],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },

    adminNote: {
      type: String,
      trim: true,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const listingsModel = mongoose.model("Listing", listingsSchema);

export default listingsModel;
