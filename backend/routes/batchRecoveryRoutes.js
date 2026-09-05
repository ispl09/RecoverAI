const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const Payment = require("../models/Payment");
const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");
const AuditLog = require("../models/AuditLog");

const {
    analyzeRecoveryCase,
} = require("../services/recoveryEngine");

const {
    validateRecoveryAction,
} = require("../services/recoveryPolicy");

const router = express.Router();

router.post("/batch-recover", authMiddleware, async (req, res) => {
    try {
        const { recoveryCaseIds } = req.body;
        const merchantId = req.merchant.merchantId;

        if (
            !Array.isArray(recoveryCaseIds) ||
            recoveryCaseIds.length === 0
        ) {
            return res.status(400).json({
                message: "Please select at least one recovery case",
            });
        }

        const recoveryCases = await RecoveryCase.find({
            _id: { $in: recoveryCaseIds },
            merchantId,
        });

        if (recoveryCases.length === 0) {
            return res.status(404).json({
                message: "No valid recovery cases found",
            });
        }

        const results = [];

        for (const recoveryCase of recoveryCases) {
            try {
                const payment = await Payment.findOne({
                    _id: recoveryCase.paymentId,
                    merchantId,
                });

                if (!payment) {
                    results.push({
                        caseId: recoveryCase._id,
                        paymentId: "N/A",
                        amount: 0,
                        status: "failed",
                        action: "Manual Review",
                        message: "Payment not found",
                    });
                    continue;
                }

                // AI diagnosis
                const analysis = await analyzeRecoveryCase(payment);

                console.log("BATCH ANALYSIS:", analysis);
                console.log(
                    "RECOMMENDED ACTION:",
                    analysis.recommendedAction
                );

                recoveryCase.failureCategory =
                    analysis.failureCategory;

                // Safety / policy check
                const policyCheck = validateRecoveryAction(
                    analysis.recommendedAction,
                    recoveryCase
                );

                if (!policyCheck.allowed) {
                    // Unknown failures must be escalated for manual review
                    if (
                        recoveryCase.failureCategory ===
                        "unknown"
                    ) {
                        recoveryCase.selectedAction =
                            "manual_review";

                        recoveryCase.recoveryResult =
                            "Unknown payment failure escalated for manual review.";

                        recoveryCase.status = "pending";

                        await recoveryCase.save();

                        await AuditLog.create({
                            merchantId,
                            paymentId: recoveryCase.paymentId,
                            recoveryCaseId: recoveryCase._id,
                            eventType: "safety_check",
                            message:
                                "Automatic recovery blocked and case escalated for manual review.",
                            metadata: {
                                failureCategory:
                                    recoveryCase.failureCategory,
                                escalation: "manual_review",
                                reason: policyCheck.reason,
                            },
                        });

                        results.push({
                            caseId: recoveryCase._id,
                            paymentId:
                                payment.razorpayPaymentId,
                            amount: payment.amount,
                            status: "escalated",
                            action: "manual_review",
                            message:
                                "Unknown payment failure escalated for manual review.",
                        });

                        continue;
                    }

                    results.push({
                        caseId: recoveryCase._id,
                        paymentId:
                            payment.razorpayPaymentId,
                        amount: payment.amount,
                        status: "blocked",
                        action:
                            analysis.recommendedAction ||
                            "Manual Review",
                        message: policyCheck.reason,
                    });

                    continue;
                }

                recoveryCase.status = "pending";

                recoveryCase.failureCategory =
                    analysis.failureCategory;

                recoveryCase.selectedAction =
                    analysis.recommendedAction;

                recoveryCase.recoveryResult =
                    analysis.reason;

                await recoveryCase.save();

                // Stopping rule: maximum 2 failed recovery attempts
                const failedAttempts =
                    await RecoveryAction.countDocuments({
                        recoveryCaseId: recoveryCase._id,
                        status: "failed",
                    });

                if (failedAttempts >= 2) {
                    recoveryCase.selectedAction =
                        "manual_review";

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
                            failureCategory:
                                analysis.failureCategory,
                            failedAttempts,
                            maxAttempts: 2,
                            escalation: "manual_review",
                        },
                    });

                    results.push({
                        caseId: recoveryCase._id,
                        paymentId:
                            payment.razorpayPaymentId,
                        amount: payment.amount,
                        status: "escalated",
                        action: "manual_review",
                        message:
                            "Maximum recovery attempts reached. Manual review required.",
                    });

                    continue;
                }

                // Check if a recovery action already exists for this case
                const existingAction =
                    await RecoveryAction.findOne({
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
                    results.push({
                        caseId: recoveryCase._id,
                        paymentId:
                            payment.razorpayPaymentId,
                        amount: payment.amount,
                        status: "blocked",
                        action:
                            existingAction.actionType ||
                            analysis.recommendedAction ||
                            "Manual Review",
                        message:
                            "A recovery action already exists for this case.",
                    });

                    continue;
                }

                // Create recovery action
                const recoveryAction =
                    await RecoveryAction.create({
                        recoveryCaseId: recoveryCase._id,
                        actionType:
                            analysis.recommendedAction,
                        reason: analysis.reason,
                        status: "pending",
                    });

                await AuditLog.create({
                    merchantId,
                    paymentId: recoveryCase.paymentId,
                    recoveryCaseId: recoveryCase._id,
                    eventType: "decision_made",
                    message:
                        `Batch recovery decision: ${analysis.recommendedAction}`,
                    metadata: {
                        actionType:
                            analysis.recommendedAction,
                        recoveryScore:
                            analysis.recoveryScore,
                        confidence:
                            analysis.confidence,
                    },
                });

                results.push({
                    caseId: recoveryCase._id,
                    paymentId:
                        payment.razorpayPaymentId,
                    amount: payment.amount,
                    status: "ready",
                    action: recoveryAction.actionType,
                    recoveryActionId:
                        recoveryAction._id,
                });
            } catch (caseError) {
                results.push({
                    caseId: recoveryCase._id,
                    paymentId: "N/A",
                    amount: 0,
                    status: "failed",
                    action: "Manual Review",
                    message: caseError.message,
                });
            }
        }

        res.json({
            message: "Batch recovery processed",
            totalCases: recoveryCases.length,
            results,
        });
    } catch (error) {
        console.error(
            "Batch recovery error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to process batch recovery",
        });
    }
});

module.exports = router;