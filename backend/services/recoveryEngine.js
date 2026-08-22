const analyzeRecoveryCase = (payment) => {
  const failureReason = (payment.failureReason || "").toLowerCase();

  let recommendedAction;
  let reason;
  let recoveryScore;

  if (failureReason.includes("insufficient")) {
    recommendedAction = "retry_payment";
    reason = "Payment failed due to insufficient funds. A retry may succeed later.";
    recoveryScore = 0.75;
  } else if (failureReason.includes("declined")) {
    recommendedAction = "send_payment_link";
    reason = "The bank declined the payment. Sending a payment link gives the customer another way to pay.";
    recoveryScore = 0.55;
  } else if (failureReason.includes("network")) {
    recommendedAction = "retry_payment";
    reason = "A network-related failure may be temporary, so retrying the payment is appropriate.";
    recoveryScore = 0.80;
  } else {
    recommendedAction = "manual_review";
    reason = "The failure reason is unknown or requires additional investigation.";
    recoveryScore = 0.30;
  }

  return {
    recommendedAction,
    reason,
    recoveryScore,
  };
};

module.exports = {
  analyzeRecoveryCase,
};