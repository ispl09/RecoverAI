import "../css/Sidebar.css";

function Sidebar({ currentPage, setCurrentPage }) {
    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <i className="bi bi-shield-check"></i>
                </div>

                <span>RecoverAI</span>
            </div>

            <nav className="sidebar-nav">

                <div className="sidebar-section-title">
                    MAIN
                </div>

                <button
                    className={`sidebar-link ${currentPage === "dashboard" ? "active" : ""
                        }`}
                    onClick={() => setCurrentPage("dashboard")}
                >
                    <i className="bi bi-grid-1x2-fill"></i>
                    <span>Dashboard</span>
                </button>

                <button
                    className={`sidebar-link ${
                        currentPage === "create-payment" ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage("create-payment")}
                >
                    <i className="bi bi-credit-card"></i>
                    <span>Payments</span>
                </button>

                <button
                    className={`sidebar-link ${currentPage === "recovery" ? "active" : ""
                        }`}
                    onClick={() => setCurrentPage("recovery")}
                >
                    <i className="bi bi-arrow-repeat"></i>
                    <span>Recovery Cases</span>
                </button>

                {/* <div className="sidebar-section-title">
                    INTELLIGENCE            editeddddddd
                </div> */}

                <button
                    className={`sidebar-link ${currentPage === "ai-insights" ? "active" : ""}`}
                    onClick={() => setCurrentPage("ai-insights")}
                >
                    <i className="bi bi-stars"></i>
                    <span>AI Insights</span>
                </button>

                <button
                    className={`sidebar-link ${
                        currentPage === "audit" ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage("audit")}
                >
                    <i className="bi bi-journal-text"></i>
                    <span>Audit Logs</span>
                </button>

                <div className="sidebar-section-title">
                    SYSTEM
                </div>

                <a href="#settings" className="sidebar-link">
                    <i className="bi bi-gear"></i>
                    <span>Settings</span>
                </a>

            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="user-avatar">
                        D
                    </div>

                    <div className="user-info">
                        <strong>Demo Merchant</strong>
                        <small>Merchant Account</small>
                    </div>
                </div>
            </div>

        </aside>
    );
}

export default Sidebar;