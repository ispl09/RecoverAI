const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");
//const Payment = require("../models/Payment");

const router = express.Router();

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