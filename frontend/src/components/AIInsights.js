import { useEffect, useState } from "react";
import { getAIInsights } from "../services/aiInsightService";
import "../css/AIInsights.css";

function AIInsights() {
    const [aiData, setAIData] = useState({
        insights: [],
        summary: {
            failedPayments: 0,
            revenueAtRisk: 0,
            successfulRecoveries: 0,
            recoveryRate: "0%",
        },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInsights = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication required");
                return;
            }

            const data = await getAIInsights(token);

            setAIData(data);
            setError("");
        } catch (error) {
            console.error("AI Insights error:", error);
            setError(error.message || "Failed to load AI insights");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

    if (loading) {
        return (
            <div className="ai-insights-loading">
                <div className="spinner-border" role="status"></div>
                <p>Analyzing recovery data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ai-insights-error">
                <i className="bi bi-exclamation-triangle"></i>
                <h3>{error}</h3>
            </div>
        );
    }

    return (
        <div className="ai-insights-page">

            <div className="ai-insights-page-header">
                <div>
                    <h1>
                        <i className="bi bi-stars me-2"></i>
                        AI Insights
                    </h1>

                    <p>
                        Intelligent analysis of your payment recovery
                        performance
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={loadInsights}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Analysis
                </button>
            </div>

            <div className="row g-4 mb-4">

                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card insight-summary-card">
                        <div className="card-body">
                            <span>Failed Payments</span>
                            <strong>
                                {aiData.summary.failedPayments}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card insight-summary-card">
                        <div className="card-body">
                            <span>Revenue at Risk</span>
                            <strong>
                                ₹{aiData.summary.revenueAtRisk.toLocaleString("en-IN")}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card insight-summary-card">
                        <div className="card-body">
                            <span>Successful Recoveries</span>
                            <strong>
                                {aiData.summary.successfulRecoveries}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card insight-summary-card">
                        <div className="card-body">
                            <span>Recovery Rate</span>
                            <strong>
                                {aiData.summary.recoveryRate}
                            </strong>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card dashboard-card">
                <div className="card-body">

                    <div className="ai-insights-section-header">
                        <div>
                            <h5>RecoverAI Analysis</h5>
                            <p>
                                Insights generated from your recovery activity
                            </p>
                        </div>
                    </div>

                    <div className="ai-insight-list">

                        {aiData.insights.length === 0 ? (
                            <div className="no-ai-insights">
                                <i className="bi bi-stars"></i>
                                <h5>No insights available</h5>
                                <p>
                                    RecoverAI needs more recovery activity
                                    to generate insights.
                                </p>
                            </div>
                        ) : (
                            aiData.insights.map((insight, index) => (
                                <div
                                    className={`ai-insight-item ${insight.type}`}
                                    key={index}
                                >
                                    <i
                                        className={`bi ${insight.icon}`}
                                    ></i>

                                    <div>
                                        <strong>{insight.title}</strong>
                                        <span>{insight.message}</span>
                                    </div>
                                </div>
                            ))
                        )}

                    </div>

                </div>
            </div>

        </div>
    );
}

export default AIInsights;