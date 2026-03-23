import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
    },

    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    damageAmountProposed: {
      type: Number,
      required: true,
    },

    damageAmountApproved: {
      type: Number,
      default: null,
    },

    adminNote: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const disputeModel = mongoose.model("Dispute", disputeSchema);

export default disputeModel;
