const checkPolicy = (recoveryCase) => {
  const {
    failureCategory,
    selectedAction,
  } = recoveryCase;

  // Policy 1:
  // Unknown failures must always go to manual review.
  if (failureCategory === "unknown") {
    return {
      allowed: false,
      reason: "Unknown payment failure requires manual review.",
    };
  }

  // Policy 2:
  // Retry payment is allowed only for specific temporary failures.
  if (
    selectedAction === "retry_payment" &&
    ![
      "insufficient_funds",
      "network_error",
    ].includes(failureCategory)
  ) {
    return {
      allowed: false,
      reason:
        "Retry payment is not allowed for this failure category.",
    };
  }

  // Policy 3:
  // Manual review should never be automatically executed.
  if (selectedAction === "manual_review") {
    return {
      allowed: false,
      reason: "Manual review cannot be automatically executed.",
    };
  }

  // If all policies pass
  return {
    allowed: true,
    reason: "Recovery action is allowed by policy.",
  };
};

module.exports = {
  checkPolicy,
};