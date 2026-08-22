import { useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService";
import "../css/Dashboard.css";

function Dashboard() {
    const [dashboard, setDashboard] = useState({
        totalPayments: 0,
        totalFailedPayments: 0,
        revenueAtRisk: 0,
        activeRecoveryCases: 0,
        recoveryRate: "0%",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Authentication required");
                    setLoading(false);
                    return;
                }

                const data = await getDashboardData(token);

                setDashboard(data);
            } catch (error) {
                console.error("Dashboard loading error:", error);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

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

                <div className="dashboard-header">
                    <div>
                        <h1>RecoverAI</h1>
                        <p>AI-Powered Revenue Recovery</p>
                    </div>

                    <button className="btn btn-primary">
                        <i className="bi bi-arrow-clockwise"></i>{" "}
                        Refresh
                    </button>
                </div>

                <div className="row g-4">

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

                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">
                                <div className="metric-icon">
                                    <i className="bi bi-credit-card"></i>
                                </div>

                                <h6>Failed Payments</h6>
                                <h2>{dashboard.totalFailedPayments}</h2>

                                <span>Payments requiring recovery</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">
                                <div className="metric-icon">
                                    <i className="bi bi-arrow-repeat"></i>
                                </div>

                                <h6>Active Recovery</h6>
                                <h2>{dashboard.activeRecoveryCases}</h2>

                                <span>Cases being processed</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="card metric-card">
                            <div className="card-body">
                                <div className="metric-icon">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>

                                <h6>Recovery Rate</h6>
                                <h2>{dashboard.recoveryRate}</h2>

                                <span>Successful recoveries</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="row g-4 mt-2">

                    <div className="col-12 col-md-4">
                        <div className="card metric-card">
                            <div className="card-body">
                                <div className="metric-icon">
                                    <i className="bi bi-lightning-charge"></i>
                                </div>

                                <h6>Recovery Actions</h6>
                                <h2>{dashboard.recoveryActions}</h2>

                                <span>Actions created by RecoverAI</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="card metric-card">
                            <div className="card-body">
                                <div className="metric-icon">
                                    <i className="bi bi-check2-circle"></i>
                                </div>

                                <h6>Executed Actions</h6>
                                <h2>{dashboard.executedActions}</h2>

                                <span>Actions processed</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="card metric-card">
                            <div className="card-body">
                                <div className="metric-icon">
                                    <i className="bi bi-graph-up"></i>
                                </div>

                                <h6>Successful Actions</h6>
                                <h2>{dashboard.successfulActions}</h2>

                                <span>Successful recoveries</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-8">
                        <div className="card dashboard-card">
                            <div className="card-body">
                                <h5>Recovery Overview</h5>

                                <p className="text-muted">
                                    Your recovery performance will appear here.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="card dashboard-card">
                            <div className="card-body">
                                <h5>AI Insights</h5>

                                <p className="text-muted">
                                    RecoverAI recommendations will appear here.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Dashboard;