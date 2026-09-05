const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const Payment = require("../models/Payment");
const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");
const AuditLog = require("../models/AuditLog");

const { analyzeRecoveryCase } = require("../services/recoveryEngine");
const { validateRecoveryAction } = require("../services/recoveryPolicy");

const router = express.Router();


// =====================================================
// CREATE RECOVERY CASE
// POST /api/recovery
// =====================================================

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
      merchantId: req.merchant.merchantId,
    });

    if (existingCase) {
      return res.status(409).json({
        message: "Recovery case already exists for this payment",
        recoveryCase: existingCase,
      });
    }

    // Analyze payment when creating the case
    const analysis = analyzeRecoveryCase(payment);

    const recoveryCase = await RecoveryCase.create({
      merchantId: req.merchant.merchantId,
      paymentId: payment._id,
      status: "pending",
      failureCategory: analysis.failureCategory,
    });

    res.status(201).json({
      message: "Recovery case created successfully",
      recoveryCase,
    });

  } catch (error) {
    console.error(
      "Recovery case creation error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to create recovery case",
    });
  }
});


// =====================================================
// CREATE RECOVERY ACTION
// POST /api/recovery/:recoveryCaseId/action
// =====================================================

router.post(
  "/:recoveryCaseId/action",
  authMiddleware,
  async (req, res) => {
    try {
      const merchantId = req.merchant.merchantId;
      const recoveryCaseId = req.params.recoveryCaseId;

      const recoveryCase = await RecoveryCase.findOne({
        _id: recoveryCaseId,
        merchantId,
      });

      if (!recoveryCase) {
        return res.status(404).json({
          message: "Recovery case not found",
        });
      }

      // Stopping rule: maximum 2 failed recovery attempts
      const failedAttempts = await RecoveryAction.countDocuments({
        recoveryCaseId: recoveryCase._id,
        status: "failed",
      });

      if (failedAttempts >= 2) {
        recoveryCase.selectedAction = "manual_review";
        recoveryCase.recoveryResult =
          "Maximum recovery attempts reached. Escalated for manual review.";
        recoveryCase.status = "pending";

        await recoveryCase.save();

        await AuditLog.create({
          merchantId,
          paymentId: recoveryCase.paymentId,
          recoveryCaseId: recoveryCase._id,
          eventType: "safety_check",
          message:
            "Maximum recovery attempts reached. Automatic recovery stopped and case escalated for manual review.",
          metadata: {
            failureCategory: recoveryCase.failureCategory,
            failedAttempts,
            maxAttempts: 2,
            escalation: "manual_review",
          },
        });

        return res.status(409).json({
          message:
            "Maximum recovery attempts reached. Manual review required.",
          status: "escalated",
          action: "manual_review",
        });
      }

      // Do not allow new actions on recovered cases
      if (recoveryCase.status === "recovered") {
        return res.status(400).json({
          message: "This recovery case has already been recovered",
        });
      }

      const payment = await Payment.findOne({
        _id: recoveryCase.paymentId,
        merchantId,
      });

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      // ================================================
      // ALWAYS RUN THE SAME AI ENGINE
      // ================================================

      const analysis = analyzeRecoveryCase(payment);

      // ================================================
      // IMPORTANT FIX
      // Save AI decision into RecoveryCase BEFORE
      // running the policy validation.
      // ================================================

      recoveryCase.failureCategory =
        analysis.failureCategory;

      recoveryCase.selectedAction =
        analysis.recommendedAction;

      recoveryCase.recoveryResult =
        `${analysis.reason} Confidence: ${analysis.confidence}`;

      await recoveryCase.save();

      // ================================================
      // POLICY VALIDATION
      // ================================================

      const policyCheck = validateRecoveryAction(
        analysis.recommendedAction,
        recoveryCase
      );

      if (!policyCheck.allowed) {
        return res.status(403).json({
          message: "Recovery action blocked by policy",
          reason: policyCheck.reason,
          analysis,
          recoveryCase,
        });
      }

      // ================================================
      // CHECK EXISTING ACTION
      // ================================================

      const existingAction = await RecoveryAction.findOne({
        recoveryCaseId: recoveryCase._id,
        status: {
          $in: [
            "pending",
            "executed",
            "successful",
          ],
        },
      });

      if (existingAction) {
        return res.status(409).json({
          message:
            "Recovery action already exists for this case",
          recoveryAction: existingAction,
        });
      }

      // ================================================
      // CREATE RECOVERY ACTION
      // ================================================

      const recoveryAction =
        await RecoveryAction.create({
          recoveryCaseId: recoveryCase._id,
          actionType: analysis.recommendedAction,
          status: "pending",
          reason: analysis.reason,
        });

      // ================================================
      // AUDIT LOG
      // ================================================

      await AuditLog.create({
        merchantId,
        paymentId: payment._id,
        recoveryCaseId: recoveryCase._id,
        eventType: "decision_made",
        message:
          `Recovery action recommended: ${analysis.recommendedAction}`,
        metadata: {
          recoveryScore: analysis.recoveryScore,
          recommendedAction:
            analysis.recommendedAction,
          reason: analysis.reason,
        },
      });

      // ================================================
      // UPDATE CASE STATUS
      // ================================================

      recoveryCase.status = "recovering";
      await recoveryCase.save();

      res.status(201).json({
        message:
          "Recovery action created successfully",
        recoveryAction,
        analysis,
        recoveryCase,
      });

    } catch (error) {
      console.error(
        "Recovery action error:",
        error.message
      );

      res.status(500).json({
        message: "Failed to create recovery action",
      });
    }
  }
);


// =====================================================
// EXECUTE RECOVERY ACTION
// POST /api/recovery/:recoveryCaseId/execute
// =====================================================

router.post(
  "/:recoveryCaseId/execute",
  authMiddleware,
  async (req, res) => {
    try {
      const merchantId = req.merchant.merchantId;
      const recoveryCaseId = req.params.recoveryCaseId;

      const recoveryCase = await RecoveryCase.findOne({
        _id: recoveryCaseId,
        merchantId,
      });

      if (!recoveryCase) {
        return res.status(404).json({
          message: "Recovery case not found",
        });
      }

      // ================================================
      // CHECK ALREADY EXECUTED ACTION
      // ================================================

      const executedAction =
        await RecoveryAction.findOne({
          recoveryCaseId: recoveryCase._id,
          status: {
            $in: [
              "executed",
              "successful",
            ],
          },
        });

      if (executedAction) {
        return res.status(409).json({
          message:
            "Recovery action has already been executed for this case",
          recoveryAction: executedAction,
        });
      }

      // ================================================
      // FIND PENDING ACTION
      // ================================================

      const recoveryAction =
        await RecoveryAction.findOne({
          recoveryCaseId: recoveryCase._id,
          status: "pending",
        });

      if (!recoveryAction) {
        return res.status(404).json({
          message:
            "No pending recovery action found",
        });
      }

      const payment = await Payment.findOne({
        _id: recoveryCase.paymentId,
        merchantId,
      });

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      // ================================================
      // EXECUTE ACTION
      // ================================================

      let result;

      // switch (recoveryAction.actionType) {

      //   case "retry_payment":
      //     result =
      //       "Payment retry initiated successfully";
      //     break;

      //   case "send_payment_link":
      //     result =
      //       "Payment link generated and ready to send";
      //     break;

      //   case "notify_customer":
      //     result =
      //       "Customer notification prepared successfully";
      //     break;

      //   case "change_payment_method":
      //     result =
      //       "Payment method change requested";
      //     break;

      //   case "manual_review":
      //     result =
      //       "Case sent for manual review";
      //     break;

      //   default:
      //     return res.status(400).json({
      //       message:
      //         "Unsupported recovery action",
      //     });
      // }

      switch (recoveryAction.actionType) {
        case "retry_payment":
          result = `Payment retry executed for ₹${payment.amount}. Awaiting recovery outcome.`;
          break;

        case "send_payment_link":
          result = `Recovery payment link generated for ₹${payment.amount}. Awaiting customer payment.`;
          break;

        case "notify_customer":
          result = `Customer recovery notification sent for ₹${payment.amount}.`;
          break;

        case "change_payment_method":
          result = `Payment method change workflow initiated for ₹${payment.amount}.`;
          break;

        case "manual_review":
          result = "Case sent for manual review.";
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

      // ================================================
      // AUDIT LOG
      // ================================================

      await AuditLog.create({
        merchantId,
        paymentId: recoveryCase.paymentId,
        recoveryCaseId: recoveryCase._id,
        eventType: "action_executed",
        message:
          `Recovery action executed: ${recoveryAction.actionType}`,
        metadata: {
          actionType:
            recoveryAction.actionType,
          result,
        },
      });

      res.json({
        message:
          "Recovery action executed successfully",
        recoveryAction,
        result,
      });

    } catch (error) {
      console.error(
        "Recovery action execution error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to execute recovery action",
      });
    }
  }
);


// =====================================================
// UPDATE RECOVERY OUTCOME
// POST /api/recovery/:recoveryCaseId/outcome
// =====================================================

router.post(
  "/:recoveryCaseId/outcome",
  authMiddleware,
  async (req, res) => {
    try {
      const { outcome } = req.body;
      const merchantId = req.merchant.merchantId;

      if (
        !["successful", "failed"].includes(outcome)
      ) {
        return res.status(400).json({
          message:
            "Outcome must be either successful or failed",
        });
      }

      const recoveryCase =
        await RecoveryCase.findOne({
          _id: req.params.recoveryCaseId,
          merchantId,
        });

      if (!recoveryCase) {
        return res.status(404).json({
          message: "Recovery case not found",
        });
      }

      const recoveryAction =
        await RecoveryAction.findOne({
          recoveryCaseId: recoveryCase._id,
          status: "executed",
        });

      if (!recoveryAction) {
        return res.status(404).json({
          message:
            "No executed recovery action found",
        });
      }

      // ================================================
      // UPDATE ACTION
      // ================================================

      recoveryAction.status = outcome;

      recoveryAction.result =
        outcome === "successful"
          ? "Payment successfully recovered"
          : "Recovery attempt failed";

      await recoveryAction.save();

      // ================================================
      // UPDATE CASE
      // ================================================

      recoveryCase.status =
        outcome === "successful"
          ? "recovered"
          : "failed";

      if (outcome === "successful") {

        const payment =
          await Payment.findOne({
            _id: recoveryCase.paymentId,
            merchantId,
          });

        recoveryCase.recoveredAmount =
          payment ? payment.amount : 0;

      } else {

        recoveryCase.recoveredAmount = 0;

      }

      await recoveryCase.save();

      // ================================================
      // AUDIT LOG
      // ================================================

      await AuditLog.create({
        merchantId,
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
          actionType:
            recoveryAction.actionType,
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
      console.error(
        "Recovery outcome error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to update recovery outcome",
      });
    }
  }
);


module.exports = router;