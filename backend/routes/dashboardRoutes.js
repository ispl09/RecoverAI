const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Payment = require("../models/Payment");
const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;

    const payments = await Payment.find({ merchantId });

    const totalPayments = payments.length;

    const failedPayments = payments.filter(
      (payment) => payment.status === "failed"
    );

    const totalFailedPayments = failedPayments.length;

    // const revenueAtRisk = failedPayments.reduce(
    //   (total, payment) => total + payment.amount,
    //   0
    // );

    const recoveryCases = await RecoveryCase.find({ merchantId });

    const recoveredPaymentIds = new Set(
      recoveryCases
        .filter((recoveryCase) => recoveryCase.status === "recovered")
        .map((recoveryCase) => recoveryCase.paymentId.toString())
    );

    const revenueAtRisk = failedPayments
      .filter((payment) => !recoveredPaymentIds.has(payment._id.toString()))
      .reduce((total, payment) => total + payment.amount, 0);

    const revenueRecovered = failedPayments
      .filter((payment) => recoveredPaymentIds.has(payment._id.toString()))
      .reduce((total, payment) => total + payment.amount, 0);

    const activeRecoveryCases = recoveryCases.filter(
      (recoveryCase) =>
        recoveryCase.status === "pending" ||
        recoveryCase.status === "analyzing" ||
        recoveryCase.status === "recovering"
    ).length;

    const recoveredCases = recoveryCases.filter(
      (recoveryCase) => recoveryCase.status === "recovered"
    ).length;

    // const totalRecoveredRevenue = recoveredCases.reduce(
    //   (total, recoveryCase) =>
    //     total + (recoveryCase.recoveredAmount || 0),
    //   0
    // );

    const recoveredCasesList = recoveryCases.filter(
      (recoveryCase) => recoveryCase.status === "recovered"
    );

    const totalRecoveredRevenue = recoveredCasesList.reduce(
      (total, recoveryCase) =>
        total + (recoveryCase.recoveredAmount || 0),
      0
    );

    const recoveryActions = await RecoveryAction.find({
      recoveryCaseId: { $in: recoveryCases.map((item) => item._id) },
    });

    const successfulActions = recoveryActions.filter(
      (action) => action.status === "successful"
    ).length;

    const executedActions = recoveryActions.filter(
      (action) =>
        action.status === "executed" || action.status === "successful"
    ).length;

    const recoveryRate =
      totalFailedPayments > 0
        ? ((recoveredCases / totalFailedPayments) * 100).toFixed(2)
        : "0.00";

    res.json({
      dashboard: {
        totalPayments,
        totalFailedPayments,
        revenueAtRisk,
        revenueRecovered,
        activeRecoveryCases,
        recoveredCases,
        totalRecoveredRevenue,
        recoveryActions: recoveryActions.length,
        executedActions,
        successfulActions,
        recoveryRate: `${recoveryRate}%`,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

module.exports = router;