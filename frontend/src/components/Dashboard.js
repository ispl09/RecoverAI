import { useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService";
import { getAIInsights } from "../services/aiInsightService";
import "../css/Dashboard.css";

function Dashboard({ onLogout }) {
    const [dashboard, setDashboard] = useState({
        totalPayments: 0,
        totalFailedPayments: 0,
        revenueAtRisk: 0,
        totalRecoveredRevenue: 0,
        activeRecoveryCases: 0,
        recoveredCases: 0,
        recoveryRate: "0%",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [aiInsights, setAIInsights] = useState([]);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication required");
                return;
            }

            const data = await getDashboardData(token);

            setDashboard(data);

            const aiData = await getAIInsights(token);

            setAIInsights(aiData.insights || []);

            setError("");
        } catch (error) {
            console.error("Dashboard loading error:", error);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner-border" role="status"></div>
                <p>Loading RecoverAI...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <i className="bi bi-exclamation-triangle"></i>
                <h3>{error}</h3>
                <p>Please login to access your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="container-fluid">

                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>RecoverAI</h1>
                        <p>AI-Powered Revenue Recovery</p>
                    </div>

                    <div className="dashboard-header-actions">

                        <button
                            className="btn btn-primary"
                            onClick={loadDashboard}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise"></i>{" "}
                            Refresh
                        </button>

                        <button
                            className="btn btn-outline-danger dashboard-logout-button"
                            onClick={onLogout}
                        >
                            <i className="bi bi-box-arrow-right"></i>{" "}
                            Logout
                        </button>

                    </div>
                </div>


                {/* =====================================================
                    ROW 1 — FINANCIAL / PAYMENT METRICS
                ====================================================== */}

                <div className="row g-4">

                    {/* Revenue at Risk */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-currency-rupee"></i>
                                </div>

                                <h6>Revenue at Risk</h6>

                                <h2>
                                    ₹{dashboard.revenueAtRisk.toLocaleString("en-IN")}
                                </h2>

                                <span>Failed payment value</span>

                            </div>
                        </div>
                    </div>


                    {/* Revenue Recovered */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-cash-stack"></i>
                                </div>

                                <h6>Revenue Recovered</h6>

                                <h2>
                                    ₹{dashboard.totalRecoveredRevenue.toLocaleString("en-IN")}
                                </h2>

                                <span>Money recovered by RecoverAI</span>

                            </div>
                        </div>
                    </div>


                    {/* Failed Payments */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-credit-card"></i>
                                </div>

                                <h6>Failed Payments</h6>

                                <h2>
                                    {dashboard.totalFailedPayments}
                                </h2>

                                <span>Payments requiring recovery</span>

                            </div>
                        </div>
                    </div>


                    {/* Active Recovery */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-arrow-repeat"></i>
                                </div>

                                <h6>Active Recovery</h6>

                                <h2>
                                    {dashboard.activeRecoveryCases}
                                </h2>

                                <span>Cases being processed</span>

                            </div>
                        </div>
                    </div>

                </div>


                {/* =====================================================
                    ROW 2 — RECOVERY OPERATION METRICS
                ====================================================== */}

                <div className="row g-4 mt-2">

                    {/* Recovery Rate */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>

                                <h6>Recovery Rate</h6>

                                <h2>
                                    {dashboard.recoveryRate}
                                </h2>

                                <span>Successful recoveries</span>

                            </div>
                        </div>
                    </div>


                    {/* Recovery Actions */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-lightning-charge"></i>
                                </div>

                                <h6>Recovery Actions</h6>

                                <h2>
                                    {dashboard.recoveryActions}
                                </h2>

                                <span>Actions created by RecoverAI</span>

                            </div>
                        </div>
                    </div>


                    {/* Executed Actions */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-check2-circle"></i>
                                </div>

                                <h6>Executed Actions</h6>

                                <h2>
                                    {dashboard.executedActions}
                                </h2>

                                <span>Actions processed</span>

                            </div>
                        </div>
                    </div>


                    {/* Successful Actions */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">

                                <div className="metric-icon">
                                    <i className="bi bi-graph-up"></i>
                                </div>

                                <h6>Successful Actions</h6>

                                <h2>
                                    {dashboard.successfulActions}
                                </h2>

                                <span>Successful recoveries</span>

                            </div>
                        </div>
                    </div>

                </div>


                {/* =====================================================
                    LOWER SECTION — RECOVERY OVERVIEW + AI INSIGHTS
                ====================================================== */}

                <div className="row g-4 mt-2">

                    {/* Recovery Overview */}
                    <div className="col-12 col-lg-8">
                        <div className="card dashboard-card">
                            <div className="card-body">

                                <div className="overview-header">
                                    <div>
                                        <h5>Recovery Overview</h5>
                                        <p>
                                            Current revenue recovery performance
                                        </p>
                                    </div>
                                </div>


                                <div className="recovery-overview">

                                    {/* Failed Payments */}
                                    <div className="overview-item">
                                        <span>Failed Payments</span>

                                        <strong>
                                            {dashboard.totalFailedPayments}
                                        </strong>
                                    </div>


                                    {/* Recovery Cases */}
                                    <div className="overview-item">
                                        <span>Recovery Cases</span>

                                        <strong>
                                            {dashboard.activeRecoveryCases +
                                                dashboard.recoveredCases}
                                        </strong>
                                    </div>


                                    {/* Recovered Cases */}
                                    <div className="overview-item">
                                        <span>Recovered Cases</span>

                                        <strong>
                                            {dashboard.recoveredCases}
                                        </strong>
                                    </div>


                                    {/* Recovery Rate */}
                                    <div className="overview-item">
                                        <span>Recovery Rate</span>

                                        <strong>
                                            {dashboard.recoveryRate}
                                        </strong>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>


                    {/* AI Insights */}
                    <div className="col-12 col-lg-4">
                        <div className="card dashboard-card ai-insights-card">
                            <div className="card-body">

                                <div className="ai-insights-header">
                                    <div>

                                        <h5>
                                            <i className="bi bi-stars me-2"></i>
                                            AI Insights
                                        </h5>

                                        <p>RecoverAI analysis</p>

                                    </div>
                                </div>


                                <div className="ai-insight-list">

                                    {aiInsights.length === 0 ? (
                                        <p className="text-muted">
                                            No AI insights available yet.
                                        </p>
                                    ) : (
                                        aiInsights.map((insight, index) => (
                                            <div
                                                className={`ai-insight-item ${insight.type}`}
                                                key={index}
                                            >

                                                <i
                                                    className={`bi ${insight.icon}`}
                                                ></i>

                                                <div>

                                                    <strong>
                                                        {insight.title}
                                                    </strong>

                                                    <span>
                                                        {insight.message}
                                                    </span>

                                                </div>

                                            </div>
                                        ))
                                    )}

                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Dashboard;