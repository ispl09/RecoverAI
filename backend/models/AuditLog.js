const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    recoveryCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecoveryCase",
      default: null,
    },

    eventType: {
      type: String,
      enum: [
        "payment_failed",
        "analysis_started",
        "decision_made",
        "safety_check",
        "action_executed",
        "recovery_completed",
        "recovery_failed",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);