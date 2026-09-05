import { useEffect, useState } from "react";
import { getRecoveryCases } from "../services/recoveryCaseService";
import "../css/RecoveryCases.css";
import RecoveryCaseDetails from "./RecoveryCaseDetails";
//import { batchRecover } from "../services/recoveryCaseService";
import BatchRecoveryButton from "./BatchRecoveryButton";
import BatchRecoveryResults from "./BatchRecoveryResults";

function RecoveryCases() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [selectedCaseIds, setSelectedCaseIds] = useState([]);
    const [batchResult, setBatchResult] = useState(null);

    // useEffect(() => {
    //     const loadRecoveryCases = async () => {
    //         try {
    //             const token = localStorage.getItem("token");

    //             if (!token) {
    //                 setError("Authentication required");
    //                 setLoading(false);
    //                 return;
    //             }

    //             const data = await getRecoveryCases(token);

    //             setCases(data);
    //         } catch (error) {
    //             console.error("Recovery cases loading error:", error);
    //             setError("Failed to load recovery cases");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     loadRecoveryCases();
    // }, []);

    const loadRecoveryCases = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication required");
                return;
            }

            setLoading(true);
            setError("");

            const data = await getRecoveryCases(token);

            setCases(data);
        } catch (error) {
            console.error("Recovery cases loading error:", error);
            setError("Failed to load recovery cases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecoveryCases();
    }, []);

    if (selectedCaseId) {
        return (
            <RecoveryCaseDetails
                caseId={selectedCaseId}
                onBack={() => setSelectedCaseId(null)}
            />
        );
    }

    if (batchResult) {
        return (
            <BatchRecoveryResults
                result={batchResult}
                onBack={() => setBatchResult(null)}
            />
        );
    }

    if (loading) {
        return (
            <div className="recovery-loading">
                <div className="spinner-border" role="status"></div>
                <p>Loading recovery cases...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recovery-error">
                <i className="bi bi-exclamation-triangle"></i>
                <h3>{error}</h3>
            </div>
        );
    }

    return (
        <div className="recovery-page">

            <div className="recovery-header">
                <div>
                    <h1>Recovery Cases</h1>
                    <p>Monitor and manage failed payment recovery.</p>
                </div>

                <span className="case-count">
                    {cases.length} Cases
                </span>

                <BatchRecoveryButton
                    selectedCaseIds={selectedCaseIds}
                    onComplete={(result) => {
                        setBatchResult(result);
                    }}
                />
            </div>

            {cases.length === 0 ? (
                <div className="empty-recovery">
                    <i className="bi bi-check-circle"></i>

                    <h3>No Recovery Cases</h3>

                    <p>
                        There are currently no failed payments requiring recovery.
                    </p>
                </div>
            ) : (
                <div className="card recovery-table-card">

                    <div className="table-responsive">

                        <table className="table recovery-table">

                            <thead>
                                <tr>
                                    <th>Payment</th>
                                    <th>Amount</th>
                                    <th>Payment Status</th>
                                    <th>Recovery Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cases.map((recoveryCase) => (
                                    <tr
                                        key={recoveryCase._id}
                                        onClick={() => setSelectedCaseId(recoveryCase._id)}
                                        className="recovery-case-row"
                                    >

                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedCaseIds.includes(recoveryCase._id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();

                                                    if (e.target.checked) {
                                                        setSelectedCaseIds((prev) => [
                                                            ...prev,
                                                            recoveryCase._id,
                                                        ]);
                                                    } else {
                                                        setSelectedCaseIds((prev) =>
                                                            prev.filter(
                                                                (id) => id !== recoveryCase._id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />

                                            <strong className="ms-2">
                                                {recoveryCase.paymentId?.razorpayPaymentId ||
                                                    "N/A"}
                                            </strong>
                                        </td>

                                        <td>
                                            ₹
                                            {recoveryCase.paymentId?.amount?.toLocaleString(
                                                "en-IN"
                                            ) || "0"}
                                        </td>

                                        <td>
                                            <span className="status-badge payment-failed">
                                                {recoveryCase.paymentId?.status || "Unknown"}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge recovery-${recoveryCase.status}`}
                                            >
                                                {recoveryCase.status}
                                            </span>
                                        </td>

                                        <td>
                                            {new Date(
                                                recoveryCase.createdAt
                                            ).toLocaleDateString("en-IN")}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                </div>
            )}

        </div>
    );
}

export default RecoveryCases;