import { useEffect, useState } from "react";
import RecoveryTimeline from "./RecoveryTimeline";
import RecoveryActions from "./RecoveryActions";
import { getRecoveryCaseDetails } from "../services/recoveryCaseService";
import "../css/RecoveryCaseDetails.css";

function RecoveryCaseDetails({ caseId, onBack }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        />

      </div>
    </div>
  );
}

export default RecoveryCaseDetails;