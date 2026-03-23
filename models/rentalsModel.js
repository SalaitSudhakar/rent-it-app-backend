import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    rentType: {
      type: String,
      enum: ["hour", "day", "week"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    handoverMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },

    priceSnapshot: {
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
      deliveryFee: {
        type: Number,
      },
    },

    totalAmount: {
      type: Number,
    },

    securityDeposit: {
      type: Number,
    },

    lateFee: {
      type: Number,
      default: 0,
    },

    depositStatus: {
      type: String,
      enum: ["held", "released", "deducted"],
      default: 'held'
    },

    actualReturnDate: {
      type: Date,
      default: null,
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    isReviewed: {
      type: Boolean,
      default: false,
    },

    damageDescription: {
      type: String,
      default: null,
    },

    damagePhotos: {
      type: [String],
    },

    damageAmountProposed: {
      type: Number,
      default: null,
    },

    damageAmountApproved: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "returned",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true },
);

const rentalModel = mongoose.model("Rental", rentalSchema);

export default rentalModel;
