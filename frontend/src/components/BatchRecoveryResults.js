import "../css/BatchRecoveryResults.css";

function BatchRecoveryResults({ result, onBack }) {
    const results = result?.results || [];

    const readyCount = results.filter(
        (item) => item.status === "ready"
    ).length;

    const blockedCount = results.filter(
        (item) => item.status === "blocked"
    ).length;

    const escalatedCount = results.filter(
        (item) => item.status === "escalated"
    ).length;

    return (
        <div className="batch-results-page">

            <h1>Batch Recovery Results</h1>

            <p className="batch-results-subtitle">
                Recovery decisions generated for the selected cases.
            </p>

            <div className="batch-summary">

                <div className="batch-summary-card">
                    <h6>Total Cases</h6>
                    <h2>{result?.totalCases || 0}</h2>
                </div>

                <div className="batch-summary-card">
                    <h6>Ready</h6>
                    <h2>{readyCount}</h2>
                </div>

                <div className="batch-summary-card">
                    <h6>Blocked</h6>
                    <h2>{blockedCount}</h2>
                </div>

                <div className="batch-summary-card">
                    <h6>Escalated</h6>
                    <h2>{escalatedCount}</h2>
                </div>

            </div>

            <div className="batch-results-card">

                <h4>Case Results</h4>

                <div className="table-responsive">

                    <table className="batch-results-table">

                        <thead>
                            <tr>
                                <th>Payment</th>
                                <th>Amount</th>
                                <th>Action</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {results.map((item, index) => (
                                <tr key={item.caseId || index}>

                                    <td>
                                        {item.paymentId || "N/A"}
                                    </td>

                                    <td>
                                        ₹{item.amount || 0}
                                    </td>

                                    <td>
                                        {item.action || "Manual Review"}
                                    </td>

                                    <td>
                                        {item.status}
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            <button
                className="batch-back-button"
                onClick={onBack}
            >
                Back to Recovery Cases
            </button>

        </div>
    );
}

export default BatchRecoveryResults;