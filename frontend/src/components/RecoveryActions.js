import "../css/RecoveryActions.css";

function RecoveryActions({ recoveryActions }) {
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