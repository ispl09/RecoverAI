const Payment = require("../models/Payment");
const RecoveryCase = require("../models/RecoveryCase");
const RecoveryAction = require("../models/RecoveryAction");


// =====================================================
// DASHBOARD AI INSIGHTS

const generateAIInsights = async (merchantId) => {
    const payments = await Payment.find({ merchantId });

    const recoveryCases = await RecoveryCase.find({ merchantId });

    const recoveryActions = await RecoveryAction.find({
        recoveryCaseId: { $in: recoveryCases.map((item) => item._id) },
    });

    const failedPayments = payments.filter(
        (payment) => payment.status === "failed"
    );

    const successfulActions = recoveryCases.filter(
        (recoveryCase) => recoveryCase.status === "recovered"
    );

    const recoveredPaymentIds = new Set(
        recoveryCases
            .filter(
                (recoveryCase) =>
                    recoveryCase.status === "recovered"
            )
            .map((recoveryCase) =>
                recoveryCase.paymentId.toString()
            )
    );

    const revenueAtRisk = failedPayments
        .filter(
            (payment) =>
                !recoveredPaymentIds.has(
                    payment._id.toString()
                )
        )
        .reduce(
            (total, payment) => total + payment.amount,
            0
        );

    const recoveryRate =
        failedPayments.length > 0
            ? (successfulActions.length / failedPayments.length) * 100
            : 0;

    const insights = [];

    if (failedPayments.length > 0) {
        insights.push({
            type: "warning",
            icon: "bi-exclamation-circle",
            title: `${failedPayments.length} failed payments`,
            message: "These payments require recovery attention.",
        });
    }

    if (revenueAtRisk > 0) {
        insights.push({
            type: "risk",
            icon: "bi-currency-rupee",
            title: `₹${revenueAtRisk.toLocaleString("en-IN")} at risk`,
            message:
                "This revenue is currently exposed to payment failure.",
        });
    }

    if (successfulActions.length > 0) {
        insights.push({
            type: "success",
            icon: "bi-check-circle",
            title: `${successfulActions.length} cases recovered`,
            message:
                "RecoverAI successfully recovered failed payments.",
        });
    }

    insights.push({
        type: "performance",
        icon: "bi-graph-up",
        title: `Recovery rate: ${recoveryRate.toFixed(2)}%`,
        message: "Current recovery performance.",
    });

    return {
        insights,
        summary: {
            failedPayments: failedPayments.length,
            revenueAtRisk,
            successfulRecoveries: successfulActions.length,
            recoveryRate: `${recoveryRate.toFixed(2)}%`,
        },
    };
};


// =====================================================
// RECOVERY CASE AI ANALYSIS
// =====================================================

const analyzeRecoveryCase = async (merchantId, recoveryCaseId) => {

    const recoveryCase = await RecoveryCase.findOne({
        _id: recoveryCaseId,
        merchantId,
    });

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }


    // -------------------------------------------------
    // Find associated payment
    // -------------------------------------------------

    const payment = await Payment.findOne({
        _id: recoveryCase.paymentId,
        merchantId,
    });

    if (!payment) {
        throw new Error("Associated payment not found");
    }


    // -------------------------------------------------
    // Find previous recovery actions
    // -------------------------------------------------

    const previousActions = await RecoveryAction.find({
        recoveryCaseId: recoveryCase._id,
    }).sort({ createdAt: -1 });


    // -------------------------------------------------
    // Default recommendation
    // -------------------------------------------------

    let recommendedAction = "manual_review";
    let confidence = 0.50;
    let priority = "medium";
    let reason =
        "The payment requires additional analysis before a recovery action can be selected.";


    // =================================================
    // AI DECISION RULES
    // =================================================

    switch (recoveryCase.failureCategory) {

        case "insufficient_funds":

            recommendedAction = "retry_payment";
            confidence = 0.75;
            priority = "high";

            reason =
                "Payment failed due to insufficient funds. " +
                "A retry may succeed after the customer has sufficient balance.";

            break;


        case "bank_declined":

            recommendedAction = "change_payment_method";
            confidence = 0.82;
            priority = "high";

            reason =
                "The payment was declined by the bank. " +
                "Using an alternative payment method may improve recovery chances.";

            break;


        case "network_error":

            recommendedAction = "retry_payment";
            confidence = 0.88;
            priority = "medium";

            reason =
                "The payment appears to have failed because of a network error. " +
                "A retry may succeed when the temporary network issue is resolved.";

            break;


        case "authentication_failed":

            recommendedAction = "notify_customer";
            confidence = 0.78;
            priority = "medium";

            reason =
                "Payment authentication failed. " +
                "The customer should be notified and asked to complete authentication.";

            break;


        case "unknown":

        default:

            recommendedAction = "manual_review";
            confidence = 0.55;
            priority = "low";

            reason =
                "The failure reason could not be confidently classified. " +
                "Manual review is recommended before attempting recovery.";

            break;
    }


    // -------------------------------------------------
    // Check previous successful actions
    // -------------------------------------------------

    const successfulPreviousAction = previousActions.find(
        (action) => action.status === "successful"
    );

    if (successfulPreviousAction) {

        recommendedAction = "manual_review";
        confidence = 0.90;
        priority = "low";

        reason =
            `A previous recovery action (${successfulPreviousAction.actionType}) ` +
            "was already successful. Manual review is recommended before another action.";
    }


    // -------------------------------------------------
    // Check repeated failed actions
    // -------------------------------------------------

    const failedPreviousActions = previousActions.filter(
        (action) => action.status === "failed"
    );

    if (failedPreviousActions.length >= 2) {

        recommendedAction = "manual_review";
        confidence = 0.92;
        priority = "high";

        reason =
            "Multiple recovery attempts have already failed. " +
            "Further automated attempts may be ineffective, so manual review is recommended.";
    }


    // -------------------------------------------------
    // Return AI recommendation
    // -------------------------------------------------

    return {
        recoveryCaseId: recoveryCase._id,

        paymentId: payment._id,

        payment: {
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            failureReason: payment.failureReason,
        },

        analysis: {
            failureCategory: recoveryCase.failureCategory,
            previousAttempts: previousActions.length,
            successfulAttempts: previousActions.filter(
                (action) => action.status === "successful"
            ).length,
            failedAttempts: failedPreviousActions.length,
        },

        recommendation: {
            recommendedAction,
            confidence,
            confidencePercentage: `${Math.round(confidence * 100)}%`,
            priority,
            reason,
        },
    };
};


module.exports = {
    generateAIInsights,
    analyzeRecoveryCase,
};