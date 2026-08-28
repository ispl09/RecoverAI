import "../css/RecoveryTimeline.css";

function RecoveryTimeline({ recoveryCase, recoveryActions }) {
  return (
    <div className="col-12">
      <div className="card details-card timeline-card">
        <div className="card-body">

          <div className="details-card-title">
            <i className="bi bi-clock-history"></i>
            <h5>Recovery Timeline</h5>
          </div>

          <div className="recovery-timeline">

            {/* Case Created */}
            <div className="timeline-item completed">
              <div className="timeline-dot">
                <i className="bi bi-check"></i>
              </div>

              <div className="timeline-content">
                <strong>Recovery Case Created</strong>
                <small>
                  {recoveryCase.createdAt
                    ? new Date(
                        recoveryCase.createdAt
                      ).toLocaleString("en-IN")
                    : ""}
                </small>
              </div>
            </div>

            {/* AI Analysis */}
            {recoveryCase.failureCategory && (
              <div className="timeline-item completed">
                <div className="timeline-dot">
                  <i className="bi bi-check"></i>
                </div>

                <div className="timeline-content">
                  <strong>AI Analysis Completed</strong>
                  <small>
                    Failure classified as{" "}
                    {recoveryCase.failureCategory
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                  </small>
                </div>
              </div>
            )}

            {/* Action Selected */}
            {recoveryCase.selectedAction && (
              <div className="timeline-item completed">
                <div className="timeline-dot">
                  <i className="bi bi-check"></i>
                </div>

                <div className="timeline-content">
                  <strong>Recovery Action Selected</strong>
                  <small>
                    {recoveryCase.selectedAction
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                  </small>
                </div>
              </div>
            )}

            {/* Action Executed */}
            {recoveryActions.some(
              (action) =>
                action.status === "executed" ||
                action.status === "successful"
            ) && (
              <div className="timeline-item completed">
                <div className="timeline-dot">
                  <i className="bi bi-check"></i>
                </div>

                <div className="timeline-content">
                  <strong>Recovery Action Executed</strong>
                  <small>
                    Recovery action was executed successfully.
                  </small>
                </div>
              </div>
            )}

            {/* Recovery Completed */}
            {recoveryCase.status === "recovered" && (
              <div className="timeline-item completed">
                <div className="timeline-dot">
                  <i className="bi bi-check"></i>
                </div>

                <div className="timeline-content">
                  <strong>Payment Recovered</strong>
                  <small>
                    Recovery process completed successfully.
                  </small>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default RecoveryTimeline;