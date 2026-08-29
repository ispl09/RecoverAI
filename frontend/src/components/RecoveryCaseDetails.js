import { useEffect, useState } from "react";
import RecoveryTimeline from "./RecoveryTimeline";
import RecoveryActions from "./RecoveryActions";
import {
  getRecoveryCaseDetails,
  createRecoveryAction,
  executeRecoveryAction,
} from "../services/recoveryCaseService";
import "../css/RecoveryCaseDetails.css";

function RecoveryCaseDetails({ caseId, onBack }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const loadCaseDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const data = await getRecoveryCaseDetails(token, caseId);

        setCaseData(data);
      } catch (error) {
        console.error("Recovery case details error:", error);
        setError("Failed to load recovery case details");
      } finally {
        setLoading(false);
      }
    };

    loadCaseDetails();
  }, [caseId]);

  const handleCreateAction = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setActionError("Authentication required");
        return;
      }

      setActionLoading(true);
      setActionMessage("");
      setActionError("");

      const data = await createRecoveryAction(token, caseId);

      setActionMessage(
        data.message || "Recovery action created successfully"
      );

      // Reload case details so the new action appears immediately
      const updatedCaseData = await getRecoveryCaseDetails(token, caseId);
      setCaseData(updatedCaseData);
    } catch (error) {
      console.error("Create recovery action error:", error);
      setActionError(error.message || "Failed to create recovery action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteAction = async (actionId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setActionError("Authentication required");
        return;
      }

      setActionLoading(true);
      setActionMessage("");
      setActionError("");

      const data = await executeRecoveryAction(token, caseId);

      setActionMessage(
        data.message || "Recovery action executed successfully"
      );

      // Reload case details so the updated action appears
      const updatedCaseData = await getRecoveryCaseDetails(token, caseId);
      setCaseData(updatedCaseData);
    } catch (error) {
      console.error("Execute recovery action error:", error);
      setActionError(
        error.message || "Failed to execute recovery action"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOutcome = async (outcome) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setActionError("Authentication required");
        return;
      }

      setActionLoading(true);
      setActionMessage("");
      setActionError("");

      const response = await fetch(
        `http://localhost:5000/api/recovery/${caseId}/outcome`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            outcome,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update recovery outcome"
        );
      }

      setActionMessage(
        data.message || "Recovery outcome updated successfully"
      );

      const updatedCaseData = await getRecoveryCaseDetails(
        token,
        caseId
      );

      setCaseData(updatedCaseData);
    } catch (error) {
      console.error("Recovery outcome error:", error);

      setActionError(
        error.message || "Failed to update recovery outcome"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="case-details-loading">
        <div className="spinner-border" role="status"></div>
        <p>Loading recovery case...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-details-error">
        <i className="bi bi-exclamation-triangle"></i>
        <h3>{error}</h3>

        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          Back to Recovery Cases
        </button>
      </div>
    );
  }

  const recoveryCase = caseData.recoveryCase;
  const recoveryActions = caseData.recoveryActions || [];
  const payment = recoveryCase.paymentId;

  return (
    <div className="case-details-page">

      <div className="case-details-header">
        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left"></i>{" "}
          Back
        </button>

        <div>
          <h1>Recovery Case Details</h1>
          <p>
            Payment recovery analysis and activity
          </p>
        </div>
      </div>

      <div className="row g-4">

        {/* Payment Information */}
        <div className="col-12 col-lg-5">
          <div className="card details-card">

            <div className="card-body">

              <div className="details-card-title">
                <i className="bi bi-credit-card"></i>
                <h5>Payment Information</h5>
              </div>

              <div className="detail-item">
                <span>Payment ID</span>
                <strong>
                  {payment?.razorpayPaymentId || "N/A"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Amount</span>
                <strong>
                  ₹
                  {payment?.amount?.toLocaleString("en-IN") || "0"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Currency</span>
                <strong>
                  {payment?.currency || "INR"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Payment Status</span>
                <span className="status-badge payment-failed">
                  {payment?.status || "Unknown"}
                </span>
              </div>

              <div className="detail-item">
                <span>Failure Reason</span>
                <strong>
                  {payment?.failureReason || "Unknown"}
                </strong>
              </div>

            </div>
          </div>
        </div>

        {/* Recovery Information */}
        <div className="col-12 col-lg-7">
          <div className="card details-card">

            <div className="card-body">

              <div className="details-card-title">
                <i className="bi bi-arrow-repeat"></i>
                <h5>Recovery Information</h5>
              </div>

              <div className="detail-item">
                <span>Recovery Status</span>

                <span
                  className={`status-badge recovery-${recoveryCase.status}`}
                >
                  {recoveryCase.status}
                </span>
              </div>

              <div className="detail-item">
                <span>Failure Category</span>
                <strong>
                  {recoveryCase.failureCategory || "Unknown"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Selected Action</span>
                <strong>
                  {recoveryCase.selectedAction || "Not selected"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Recovery Result</span>
                <strong>
                  {recoveryCase.recoveryResult || "Not available"}
                </strong>
              </div>

            </div>
          </div>
        </div>

        {/* AI Decision */}
        <div className="col-12">
          <div className="card details-card ai-decision-card">
            <div className="card-body">

              <div className="details-card-title">
                <i className="bi bi-robot"></i>
                <h5>RecoverAI Decision</h5>
              </div>

              <div className="ai-decision-content">

                <div className="ai-decision-main">
                  <span>Recommended Action</span>
                  <strong>
                    {recoveryCase.selectedAction
                      ? recoveryCase.selectedAction
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )
                      : "Not available"}
                  </strong>
                </div>

                <div className="ai-confidence">
                  <span>Confidence</span>
                  <strong>
                    {recoveryCase.recoveryResult
                      ?.match(/Confidence:\s*(\d+%)/)?.[1] || "N/A"}
                  </strong>
                </div>

                <div className="ai-category">
                  <span>Failure Category</span>
                  <strong>
                    {recoveryCase.failureCategory
                      ? recoveryCase.failureCategory
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )
                      : "Unknown"}
                  </strong>
                </div>

              </div>

              <div className="ai-reason">
                <span>Why this action?</span>
                <p>
                  {recoveryCase.recoveryResult
                    ?.replace(/Confidence:\s*\d+%/, "")
                    .trim() ||
                    "No AI reasoning available."}
                </p>
              </div>

              <div className="ai-action-controls">

                <button
                  className="btn btn-primary"
                  onClick={handleCreateAction}
                  disabled={actionLoading || recoveryActions.length > 0}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating Action...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Create Recovery Action
                    </>
                  )}
                </button>

                {actionMessage && (
                  <div className="alert alert-success mt-3">
                    {actionMessage}
                  </div>
                )}

                {actionError && (
                  <div className="alert alert-danger mt-3">
                    {actionError}
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* Recovery Timeline */}
        <RecoveryTimeline
          recoveryCase={recoveryCase}
          recoveryActions={recoveryActions}
        />

        {/* Recovery Actions */}
        <RecoveryActions
          recoveryActions={recoveryActions}
          onExecute={handleExecuteAction}
          onOutcome={handleOutcome}
          actionLoading={actionLoading}
        />

      </div>
    </div>
  );
}

export default RecoveryCaseDetails;