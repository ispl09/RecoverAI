const mongoose = require("mongoose");

const recoveryActionSchema = new mongoose.Schema(
  {
    recoveryCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecoveryCase",
      required: true,
    },

    actionType: {
      type: String,
      enum: [
        "retry_payment",
        "send_payment_link",
        "notify_customer",
        "change_payment_method",
        "manual_review",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "executed", "successful", "failed"],
      default: "pending",
    },

    reason: {
      type: String,
      default: null,
    },

    executedAt: {
      type: Date,
      default: null,
    },

    result: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecoveryAction", recoveryActionSchema);