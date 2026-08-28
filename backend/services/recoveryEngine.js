const analyzeRecoveryCase = (payment) => {
  const failureReason = (payment.failureReason || "").toLowerCase();
  const amount = Number(payment.amount || 0);

  let failureCategory;
  let recommendedAction;
  let reason;
  let recoveryScore;

  if (
    failureReason.includes("insufficient") ||
    failureReason.includes("funds")
  ) {
    failureCategory = "insufficient_funds";
    recommendedAction = "retry_payment";
    reason =
      "Payment failed due to insufficient funds. A retry may succeed after the customer has sufficient balance.";
    recoveryScore = amount <= 5000 ? 0.75 : 0.60;
  } else if (
    failureReason.includes("declined") ||
    failureReason.includes("bank")
  ) {
    failureCategory = "bank_declined";
    recommendedAction = "send_payment_link";
    reason =
      "The bank declined the payment. Sending a payment link gives the customer another way to complete the payment.";
    recoveryScore = 0.55;
  } else if (
    failureReason.includes("network") ||
    failureReason.includes("timeout")
  ) {
    failureCategory = "network_error";
    recommendedAction = "retry_payment";
    reason =
      "The payment encountered a temporary network problem. Retrying the payment is recommended.";
    recoveryScore = 0.80;
  } else if (
    failureReason.includes("authentication") ||
    failureReason.includes("auth")
  ) {
    failureCategory = "authentication_failed";
    recommendedAction = "send_payment_link";
    reason =
      "Payment authentication failed. A new payment attempt through a payment link may allow the customer to authenticate again.";
    recoveryScore = 0.45;
  } else {
    failureCategory = "unknown";
    recommendedAction = "manual_review";

    if (!failureReason) {
      reason =
        "No failure reason was provided. Manual review is recommended because the payment cannot be reliably classified.";
      recoveryScore = 0.20;
    } else {
      reason =
        "The payment failure could not be confidently classified. Manual review is recommended.";
      recoveryScore = 0.30;
    }
  }

  return {
    failureCategory,
    recommendedAction,
    reason,
    recoveryScore,
    confidence: `${Math.round(recoveryScore * 100)}%`,
  };
};

module.exports = {
  analyzeRecoveryCase,
};