const express = require("express");
const mongoose = require("mongoose");

const authMiddleware = require("../middleware/authMiddleware");

const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");
const Payment = require("../models/Payment");

const { analyzeRecoveryCase } = require("../services/recoveryEngine");

const router = express.Router();


// =====================================================
// CREATE RECOVERY CASE
// POST /api/recovery-cases
// =====================================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const merchantId = req.merchant.merchantId;

    if (!paymentId) {
      return res.status(400).json({
        message: "paymentId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        message: "Invalid paymentId",
      });
    }

    // Find payment belonging to logged-in merchant
    const payment = await Payment.findOne({
      _id: paymentId,
      merchantId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Recovery only applies to failed payments
    if (payment.status !== "failed") {
      return res.status(400).json({
        message:
          "Recovery case can only be created for failed payments",
      });
    }

    // Check whether this payment already has a recovery case
    const existingCase = await RecoveryCase.findOne({
      paymentId: payment._id,
      merchantId,
    });

    if (existingCase) {
      return res.status(409).json({
        message: "Recovery case already exists for this payment",
        recoveryCase: existingCase,
      });
    }

    // Analyze payment using recovery engine
    const analysis = analyzeRecoveryCase(payment);

    // Create recovery case
    const recoveryCase = await RecoveryCase.create({
      merchantId,
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
// GET ALL RECOVERY CASES
// GET /api/recovery-cases
// =====================================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;

    const recoveryCases = await RecoveryCase.find({
      merchantId,
    })
      .populate("paymentId")
      .sort({ createdAt: -1 });

    res.json({
      recoveryCases,
    });

  } catch (error) {
    console.error(
      "Recovery cases error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to load recovery cases",
    });
  }
});


// =====================================================
// ANALYZE RECOVERY CASE
// POST /api/recovery-cases/:id/analyze
// =====================================================

router.post("/:id/analyze", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;
    const recoveryCaseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recoveryCaseId)) {
      return res.status(400).json({
        message: "Invalid recovery case ID",
      });
    }

    const recoveryCase = await RecoveryCase.findOne({
      _id: recoveryCaseId,
      merchantId,
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

    // Mark as analyzing
    recoveryCase.status = "analyzing";
    await recoveryCase.save();

    // Run recovery engine
    const analysis = analyzeRecoveryCase(payment);

    // Store AI/recovery decision in database
    recoveryCase.failureCategory =
      analysis.failureCategory;

    recoveryCase.selectedAction =
      analysis.recommendedAction;

    recoveryCase.recoveryResult =
      `${analysis.reason} Confidence: ${analysis.confidence}`;

    recoveryCase.status = "recovering";

    await recoveryCase.save();

    res.json({
      message: "Recovery case analyzed successfully",

      recoveryCase,

      analysis,
    });

  } catch (error) {
    console.error(
      "Recovery case analysis error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to analyze recovery case",
    });
  }
});


// =====================================================
// GET SINGLE RECOVERY CASE DETAILS
// GET /api/recovery-cases/:id
// =====================================================

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;
    const recoveryCaseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recoveryCaseId)) {
      return res.status(400).json({
        message: "Invalid recovery case ID",
      });
    }

    const recoveryCase = await RecoveryCase.findOne({
      _id: recoveryCaseId,
      merchantId,
    }).populate("paymentId");

    if (!recoveryCase) {
      return res.status(404).json({
        message: "Recovery case not found",
      });
    }

    const recoveryActions = await RecoveryAction.find({
      recoveryCaseId: recoveryCase._id,
    }).sort({
      createdAt: 1,
    });

    res.json({
      recoveryCase,
      recoveryActions,
    });

  } catch (error) {
    console.error(
      "Recovery case details error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to load recovery case details",
    });
  }
});


module.exports = router;