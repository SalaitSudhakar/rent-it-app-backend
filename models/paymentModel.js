import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "rental_payment",
        "deposit_hold",
        "deposit_release",
        "deposit_deduct",
        "late_fee",
        "owner_payout",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "usd",
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
      select: false,
    },

    stripeTransferId: {
      type: String,
      default: null,
      select: false,
    },

    stripeRefundId: {
      type: String,
      default: null,
      select: false,
    },

    commissionRate: {
      type: Number,
      default: null,
    },

    commissionAmount: {
      type: Number,
      default: null,
    },

    ownerEarning: {
      type: Number,
      default: null,
    },

    refund: {
      isRefunded: {
        type: Boolean,
        default: false,
      },

      refundAmount: {
        type: Number,
        default: null,
      },

      refundedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
);

const paymentModel = mongoose.model("Payment", paymentSchema);

export default paymentModel;
