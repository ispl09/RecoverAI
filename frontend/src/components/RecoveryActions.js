import "../css/RecoveryActions.css";

function RecoveryActions({ recoveryActions, 
  onExecute, 
  onOutcome,
  actionLoading }) {
  if (!recoveryActions || recoveryActions.length === 0) {
    return (
      <div className="col-12">
        <div className="card details-card">
          <div className="card-body">
            <div className="details-card-title">
              <i className="bi bi-lightning-charge"></i>
              <h5>Recovery Actions</h5>
            </div>

            <div className="no-actions">
              <i className="bi bi-hourglass-split"></i>
              <p>No recovery actions recorded yet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-12">
      <div className="card details-card">
        <div className="card-body">

          <div className="details-card-title">
            <i className="bi bi-lightning-charge"></i>
            <h5>Recovery Actions</h5>
          </div>

          <div className="action-list">
            {recoveryActions.map((action, index) => (
              <div className="action-item" key={action._id}>

                <div className="action-number">
                  {index + 1}
                </div>

                <div className="action-content">

                  <div className="action-top">
                    <strong>
                      {(action.actionType || "Recovery Action")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )}
                    </strong>

                    <span className="status-badge">
                      {action.status}
                    </span>
                  </div>

                  <p>
                    {action.reason ||
                      "No reason provided."}
                  </p>

                  {action.result && (
                    <p className="action-result">
                      <strong>Result:</strong>{" "}
                      {action.result}
                    </p>
                  )}

                  {action.status === "pending" && (
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => onExecute(action._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Executing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-play-circle me-2"></i>
                          Execute Recovery Action
                        </>
                      )}
                    </button>
                  )}

                  {action.status === "executed" && (
                    <div className="mt-3">
                      <p className="mb-2">
                        Was the recovery successful?
                      </p>

                      <button
                        className="btn btn-success me-2"
                        onClick={() => onOutcome("successful")}
                        disabled={actionLoading}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Mark Successful
                      </button>

                      <button
                        className="btn btn-outline-danger"
                        onClick={() => onOutcome("failed")}
                        disabled={actionLoading}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Mark Failed
                      </button>
                    </div>
                  )}

                  <small>
                    {action.createdAt
                      ? new Date(
                          action.createdAt
                        ).toLocaleString("en-IN")
                      : ""}
                  </small>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default RecoveryActions;