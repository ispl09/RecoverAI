const mongoose = require("mongoose");

const recoveryCaseSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "analyzing", "recovering", "recovered", "failed"],
      default: "pending",
    },

    failureCategory: {
      type: String,
      enum: [
        "insufficient_funds",
        "bank_declined",
        "network_error",
        "authentication_failed",
        "unknown",
      ],
      default: "unknown",
    },

    selectedAction: {
      type: String,
      default: null,
    },

    recoveryResult: {
      type: String,
      default: null,
    },

    recoveredAmount: {
      type: Number,
      default: 0,
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecoveryCase", recoveryCaseSchema);