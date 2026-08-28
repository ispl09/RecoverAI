const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");
const Payment = require("../models/Payment");
const { analyzeRecoveryCase } = require("../services/recoveryEngine");

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

router.get("/", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;

    const recoveryCases = await RecoveryCase.find({ merchantId })
      .populate("paymentId")
      .sort({ createdAt: -1 });

    res.json({
      recoveryCases,
    });
  } catch (error) {
    console.error("Recovery cases error:", error.message);

    res.status(500).json({
      message: "Failed to load recovery cases",
    });
  }
});

router.post("/:id/analyze", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;
    const recoveryCaseId = req.params.id;

    const recoveryCase = await RecoveryCase.findOne({
      _id: recoveryCaseId,
      merchantId: merchantId,
    }).populate("paymentId");

    if (!recoveryCase) {
      return res.status(404).json({
        message: "Recovery case not found",
      });
    }

    const payment = recoveryCase.paymentId;

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found for this recovery case",
      });
    }

    // Mark case as being analyzed
    recoveryCase.status = "analyzing";
    await recoveryCase.save();

    // Run RecoverAI decision engine
    const decision = analyzeRecoveryCase(payment);

    // Save AI decision
    recoveryCase.failureCategory = decision.failureCategory;
    recoveryCase.selectedAction = decision.recommendedAction;

    recoveryCase.recoveryResult =
      `${decision.reason} Confidence: ${decision.confidence}`;

    recoveryCase.status = "recovering";

    await recoveryCase.save();

    res.json({
      message: "Recovery case analyzed successfully",
      recoveryCase,
      decision,
    });
  } catch (error) {
    console.error("AI recovery analysis error:", error.message);

    res.status(500).json({
      message: "Failed to analyze recovery case",
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;
    const recoveryCaseId = req.params.id;

    console.log("Recovery Case ID:", recoveryCaseId);
    console.log("Merchant ID:", merchantId);

    const recoveryCase = await RecoveryCase.findOne({
      _id: recoveryCaseId,
      merchantId: merchantId,
    }).populate("paymentId");

    if (!recoveryCase) {
      console.log("Recovery case not found");

      return res.status(404).json({
        message: "Recovery case not found",
      });
    }

    const recoveryActions = await RecoveryAction.find({
      recoveryCaseId: recoveryCase._id,
    }).sort({ createdAt: 1 });

    res.json({
      recoveryCase,
      recoveryActions,
    });
  } catch (error) {
    console.error("Recovery case details error:", error.message);

    res.status(500).json({
      message: "Failed to load recovery case details",
    });
  }
});

module.exports = router;