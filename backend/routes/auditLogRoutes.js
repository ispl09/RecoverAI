const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

// Get audit logs for the logged-in merchant
router.get("/", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;

    const auditLogs = await AuditLog.find({
      merchantId,
    })
      .populate("paymentId")
      .populate("recoveryCaseId")
      .sort({ createdAt: -1 });

    res.json({
      auditLogs,
    });
  } catch (error) {
    console.error("Audit logs error:", error.message);

    res.status(500).json({
      message: "Failed to load audit logs",
    });
  }
});

module.exports = router;