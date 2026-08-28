const allowedActions = [
  "retry_payment",
  "send_payment_link",
  "notify_customer",
  "change_payment_method",
  "manual_review",
];

const validateRecoveryAction = (action, recoveryCase) => {
  const { failureCategory } = recoveryCase;

  // Policy 1: Action must be supported
  if (!allowedActions.includes(action)) {
    return {
      allowed: false,
      reason: "This recovery action is not supported.",
    };
  }

  // Policy 2: Recovered cases cannot be processed again
  if (recoveryCase.status === "recovered") {
    return {
      allowed: false,
      reason: "This recovery case has already been recovered.",
    };
  }

  // Policy 3: Failed cases cannot be processed again
  if (recoveryCase.status === "failed") {
    return {
      allowed: false,
      reason: "This recovery case has already failed.",
    };
  }

  // Policy 4: Unknown failures require manual review
  if (failureCategory === "unknown") {
    return {
      allowed: false,
      reason:
        "Unknown payment failure requires manual review.",
    };
  }

  // Policy 5: Retry is only allowed for recoverable temporary failures
  if (
    action === "retry_payment" &&
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

  // Policy 6: Manual review must not be automatically executed
  if (action === "manual_review") {
    return {
      allowed: false,
      reason:
        "Manual review cannot be automatically executed.",
    };
  }

  return {
    allowed: true,
    reason: "Recovery action is allowed by policy.",
  };
};

module.exports = {
  validateRecoveryAction,
};