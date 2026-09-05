import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import RecoveryCases from "./components/RecoveryCases";
import AIInsights from "./components/AIInsights";
import AuditLogs from "./components/AuditLogs";
import CreatePayment from "./pages/CreatePayment";
import Settings from "./components/Settings";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main-content">

        {currentPage === "dashboard" && (
          <Dashboard onLogout={handleLogout} />
        )}

        {currentPage === "recovery" && <RecoveryCases />}

        {currentPage === "ai-insights" && <AIInsights />}

        {currentPage === "audit" && <AuditLogs />}

        {currentPage === "create-payment" && <CreatePayment />}

        {currentPage === "settings" && <Settings />}

        {/* <button
          onClick={handleLogout}
          className="btn btn-danger logout-button"
        >
          <i className="bi bi-box-arrow-right"></i>{" "}
          Logout
        </button> */}

      </main>

    </div>
  );
}

export default App;