const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Payment = require("../models/Payment");
const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");
const AuditLog = require("../models/AuditLog");

const { analyzeRecoveryCase } = require("../services/recoveryEngine");
const { validateRecoveryAction } = require("../services/recoveryPolicy");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: "paymentId is required",
      });
    }

    const payment = await Payment.findOne({
      _id: paymentId,
      merchantId: req.merchant.merchantId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.status !== "failed") {
      return res.status(400).json({
        message: "Recovery case can only be created for failed payments",
      });
    }

    const existingCase = await RecoveryCase.findOne({
      paymentId: payment._id,
    });

    if (existingCase) {
      return res.status(409).json({
        message: "Recovery case already exists for this payment",
        recoveryCase: existingCase,
      });
    }

    const recoveryCase = await RecoveryCase.create({
      merchantId: req.merchant.merchantId,
      paymentId: payment._id,
      status: "pending",
    });

    res.status(201).json({
      message: "Recovery case created successfully",
      recoveryCase,
    });
  } catch (error) {
    console.error("Recovery case creation error:", error.message);

    res.status(500).json({
      message: "Failed to create recovery case",
    });
  }
});

router.post("/:recoveryCaseId/analyze", authMiddleware, async (req, res) => {
  try {
    const recoveryCase = await RecoveryCase.findOne({
      _id: req.params.recoveryCaseId,
      merchantId: req.merchant.merchantId,
    });

    if (!recoveryCase) {
      return res.status(404).json({
        message: "Recovery case not found",
      });
    }

    const payment = await Payment.findOne({
      _id: recoveryCase.paymentId,
      merchantId: req.merchant.merchantId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const analysis = analyzeRecoveryCase(payment);

    recoveryCase.status = "analyzing";
    await recoveryCase.save();

    res.json({
      message: "Recovery case analyzed successfully",
      recoveryCase: {
        id: recoveryCase._id,
        status: recoveryCase.status,
      },
      analysis,
    });
  } catch (error) {
    console.error("Recovery analysis error:", error.message);

    res.status(500).json({
      message: "Failed to analyze recovery case",
    });
  }
});

router.post("/:recoveryCaseId/action", authMiddleware, async (req, res) => {
  try {
    const recoveryCase = await RecoveryCase.findOne({
      _id: req.params.recoveryCaseId,
      merchantId: req.merchant.merchantId,
    });

    if (!recoveryCase) {
      return res.status(404).json({
        message: "Recovery case not found",
      });
    }

    const payment = await Payment.findOne({
      _id: recoveryCase.paymentId,
      merchantId: req.merchant.merchantId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const analysis = analyzeRecoveryCase(payment);

    const policy = validateRecoveryAction(
      analysis.recommendedAction,
      recoveryCase
    );

    if (!policy.allowed) {
      return res.status(403).json({
        message: "Recovery action blocked by policy",
        reason: policy.reason,
      });
    }

    const existingAction = await RecoveryAction.findOne({
      recoveryCaseId: recoveryCase._id,
      status: { $in: ["pending", "executed", "successful"] },
    });

    if (existingAction) {
      return res.status(409).json({
        message: "Recovery action already exists for this case",
        recoveryAction: existingAction,
      });
    }

    const recoveryAction = await RecoveryAction.create({
      recoveryCaseId: recoveryCase._id,
      actionType: analysis.recommendedAction,
      status: "pending",
      reason: analysis.reason,
    });

    await AuditLog.create({
      merchantId: req.merchant.merchantId,
      paymentId: payment._id,
      recoveryCaseId: recoveryCase._id,
      eventType: "decision_made",
      message: `Recovery action recommended: ${analysis.recommendedAction}`,
      metadata: {
        recoveryScore: analysis.recoveryScore,
        recommendedAction: analysis.recommendedAction,
        reason: analysis.reason,
      },
    });

    recoveryCase.status = "recovering";
    await recoveryCase.save();

    res.status(201).json({
      message: "Recovery action created successfully",
      recoveryAction,
      analysis,
    });
  } catch (error) {
    console.error("Recovery action error:", error.message);

    res.status(500).json({
      message: "Failed to create recovery action",
    });
  }
});

router.post("/:recoveryCaseId/execute", authMiddleware, async (req, res) => {
  try {
    const recoveryCase = await RecoveryCase.findOne({
      _id: req.params.recoveryCaseId,
      merchantId: req.merchant.merchantId,
    });

    if (!recoveryCase) {
      return res.status(404).json({
        message: "Recovery case not found",
      });
    }

    const existingAction = await RecoveryAction.findOne({
    recoveryCaseId: recoveryCase._id,
    status: { $in: ["executed", "successful"] },
  });

  if (existingAction) {
    return res.status(409).json({
      message: "Recovery action has already been executed for this case",
      recoveryAction: existingAction,
    });
  }

  const recoveryAction = await RecoveryAction.findOne({
    recoveryCaseId: recoveryCase._id,
    status: "pending",
  });
    if (!recoveryAction) {
      return res.status(404).json({
        message: "No pending recovery action found",
      });
    }

    let result;

    switch (recoveryAction.actionType) {
      case "retry_payment":
        result = "Payment retry initiated successfully";
        break;

      case "send_payment_link":
        result = "Payment link generated and ready to send";
        break;

      case "notify_customer":
        result = "Customer notification prepared successfully";
        break;

      case "change_payment_method":
        result = "Payment method change requested";
        break;

      case "manual_review":
        result = "Case sent for manual review";
        break;

      default:
        return res.status(400).json({
          message: "Unsupported recovery action",
        });
    }

    recoveryAction.status = "executed";
    recoveryAction.executedAt = new Date();
    recoveryAction.result = result;

    await recoveryAction.save();

    recoveryCase.status = "recovering";
    await recoveryCase.save();

    await AuditLog.create({
      merchantId: req.merchant.merchantId,
      paymentId: recoveryCase.paymentId,
      recoveryCaseId: recoveryCase._id,
      eventType: "action_executed",
      message: `Recovery action executed: ${recoveryAction.actionType}`,
      metadata: {
        actionType: recoveryAction.actionType,
        result,
      },
    });

    res.json({
      message: "Recovery action executed successfully",
      recoveryAction,
      result,
    });
  } catch (error) {
    console.error("Recovery action execution error:", error.message);

    res.status(500).json({
      message: "Failed to execute recovery action",
    });
  }
});

router.post("/:recoveryCaseId/outcome", authMiddleware, async (req, res) => {
  try {
    const { outcome } = req.body;

    if (!["successful", "failed"].includes(outcome)) {
      return res.status(400).json({
        message: "Outcome must be either successful or failed",
      });
    }

    const recoveryCase = await RecoveryCase.findOne({
      _id: req.params.recoveryCaseId,
      merchantId: req.merchant.merchantId,
    });

    if (!recoveryCase) {
      return res.status(404).json({
        message: "Recovery case not found",
      });
    }

    const recoveryAction = await RecoveryAction.findOne({
      recoveryCaseId: recoveryCase._id,
      status: "executed",
    });

    if (!recoveryAction) {
      return res.status(404).json({
        message: "No executed recovery action found",
      });
    }

    recoveryAction.status = outcome;
    recoveryAction.result =
      outcome === "successful"
        ? "Payment successfully recovered"
        : "Recovery attempt failed";

    await recoveryAction.save();

    recoveryCase.status =
      outcome === "successful" ? "recovered" : "failed";

    if (outcome === "successful") {
      const payment = await Payment.findById(recoveryCase.paymentId);

      recoveryCase.recoveredAmount = payment ? payment.amount : 0;
    } else {
      recoveryCase.recoveredAmount = 0;
    }

    await recoveryCase.save();

    await AuditLog.create({
      merchantId: req.merchant.merchantId,
      paymentId: recoveryCase.paymentId,
      recoveryCaseId: recoveryCase._id,
      eventType:
        outcome === "successful"
          ? "recovery_completed"
          : "recovery_failed",
      message:
        outcome === "successful"
          ? "Payment successfully recovered"
          : "Recovery attempt failed",
      metadata: {
        actionType: recoveryAction.actionType,
        outcome,
      },
    });

    res.json({
      message:
        outcome === "successful"
          ? "Recovery completed successfully"
          : "Recovery marked as failed",
      recoveryCase,
      recoveryAction,
    });
  } catch (error) {
    console.error("Recovery outcome error:", error.message);

    res.status(500).json({
      message: "Failed to update recovery outcome",
    });
  }
});

module.exports = router;

//module.exports = router;