import { useState } from "react";
import { batchRecover } from "../services/recoveryCaseService";

function BatchRecoveryButton({ selectedCaseIds, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleBatchRecovery = async () => {
    if (!selectedCaseIds || selectedCaseIds.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const result = await batchRecover(token, selectedCaseIds);

      const readyCount =
        result.results?.filter((item) => item.status === "ready").length || 0;

      const blockedCount =
        result.results?.filter((item) => item.status === "blocked").length || 0;

      const escalatedCount =
        result.results?.filter((item) => item.status === "escalated").length ||
        0;

      setMessage(
        `Batch recovery processed: ${readyCount} ready, ${blockedCount} blocked, ${escalatedCount} escalated.`
      );

      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error("Batch recovery error:", err);
      setError(err.message || "Failed to process batch recovery");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCaseIds || selectedCaseIds.length === 0) {
    return null;
  }

  return (
    <div className="batch-recovery-container">

      <button
        className="btn btn-primary"
        onClick={handleBatchRecovery}
        disabled={loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            Processing...
          </>
        ) : (
          <>
            <i className="bi bi-lightning-charge me-2"></i>
            Recover Selected ({selectedCaseIds.length})
          </>
        )}
      </button>

      {message && (
        <div className="alert alert-success mt-3 mb-0">
          <i className="bi bi-check-circle me-2"></i>
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3 mb-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

    </div>
  );
}

export default BatchRecoveryButton;