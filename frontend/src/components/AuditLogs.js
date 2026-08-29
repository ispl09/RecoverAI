import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../services/recoveryCaseService";
import "../css/AuditLogs.css";

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const logs = await getAuditLogs(token);
        setAuditLogs(logs);
      } catch (error) {
        console.error("Audit logs error:", error);
        setError(error.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesEvent =
        eventFilter === "all" || log.eventType === eventFilter;

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        log.eventType?.toLowerCase().includes(search) ||
        log.message?.toLowerCase().includes(search) ||
        log.paymentId?.razorpayPaymentId?.toLowerCase().includes(search) ||
        log.recoveryCaseId?._id?.toLowerCase().includes(search);

      return matchesEvent && matchesSearch;
    });
  }, [auditLogs, searchTerm, eventFilter]);

  const completedCount = auditLogs.filter(
    (log) => log.eventType === "recovery_completed"
  ).length;

  const failedCount = auditLogs.filter(
    (log) => log.eventType === "recovery_failed"
  ).length;

  const executedCount = auditLogs.filter(
    (log) => log.eventType === "action_executed"
  ).length;

  const formatEventType = (eventType) => {
    return (eventType || "event")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "recovery_completed":
        return "bi bi-check-circle-fill";

      case "recovery_failed":
        return "bi bi-x-circle-fill";

      case "action_executed":
        return "bi bi-lightning-charge-fill";

      case "decision_made":
        return "bi bi-stars";

      case "safety_check":
        return "bi bi-shield-check";

      case "analysis_started":
        return "bi bi-cpu";

      case "payment_failed":
        return "bi bi-exclamation-triangle-fill";

      default:
        return "bi bi-journal-text";
    }
  };

  const getEventClass = (eventType) => {
    switch (eventType) {
      case "recovery_completed":
        return "event-success";

      case "recovery_failed":
        return "event-danger";

      case "action_executed":
        return "event-action";

      case "decision_made":
        return "event-decision";

      case "safety_check":
        return "event-safety";

      case "analysis_started":
        return "event-analysis";

      case "payment_failed":
        return "event-payment";

      default:
        return "event-default";
    }
  };

  if (loading) {
    return (
      <div className="audit-logs-loading">
        <div className="spinner-border" role="status"></div>
        <p>Loading audit logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-logs-error">
        <i className="bi bi-exclamation-triangle"></i>
        <h3>{error}</h3>
      </div>
    );
  }

  return (
    <div className="audit-logs-page">

      {/* Header */}
      <div className="audit-logs-header">
        <div>
          <div className="page-eyebrow">
            <i className="bi bi-shield-lock"></i>
            SYSTEM ACTIVITY
          </div>

          <h1>Audit Logs</h1>

          <p>
            Complete history of payment recovery decisions, actions and outcomes
          </p>
        </div>

        <div className="audit-event-counter">
          <strong>{auditLogs.length}</strong>
          <span>Total Events</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="audit-stats">

        <div className="audit-stat-card">
          <div className="audit-stat-icon total">
            <i className="bi bi-journal-text"></i>
          </div>

          <div>
            <span>Total Events</span>
            <strong>{auditLogs.length}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon success">
            <i className="bi bi-check-circle"></i>
          </div>

          <div>
            <span>Recoveries</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon failed">
            <i className="bi bi-x-circle"></i>
          </div>

          <div>
            <span>Failed</span>
            <strong>{failedCount}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon action">
            <i className="bi bi-lightning-charge"></i>
          </div>

          <div>
            <span>Actions Executed</span>
            <strong>{executedCount}</strong>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="audit-filters">

        <div className="audit-search">
          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Search payment, event or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="audit-filter">
          <i className="bi bi-funnel"></i>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="payment_failed">Payment Failed</option>
            <option value="analysis_started">Analysis Started</option>
            <option value="decision_made">Decision Made</option>
            <option value="safety_check">Safety Check</option>
            <option value="action_executed">Action Executed</option>
            <option value="recovery_completed">Recovery Completed</option>
            <option value="recovery_failed">Recovery Failed</option>
          </select>
        </div>

        <div className="audit-result-count">
          Showing <strong>{filteredLogs.length}</strong> of{" "}
          <strong>{auditLogs.length}</strong>
        </div>

      </div>

      {/* Logs */}
      {filteredLogs.length === 0 ? (
        <div className="audit-empty">
          <i className="bi bi-search"></i>
          <h3>No matching events</h3>
          <p>
            Try changing your search or event filter.
          </p>
        </div>
      ) : (
        <div className="audit-timeline">

          {filteredLogs.map((log) => (
            <div className="audit-event" key={log._id}>

              <div
                className={`audit-event-icon ${getEventClass(
                  log.eventType
                )}`}
              >
                <i className={getEventIcon(log.eventType)}></i>
              </div>

              <div className="audit-event-content">

                <div className="audit-event-header">

                  <div>
                    <span
                      className={`audit-event-type ${getEventClass(
                        log.eventType
                      )}`}
                    >
                      {formatEventType(log.eventType)}
                    </span>

                    <h3>{log.message}</h3>
                  </div>

                  <time>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("en-IN")
                      : ""}
                  </time>

                </div>

                <div className="audit-event-details">

                  <div className="audit-detail">
                    <span>Payment</span>
                    <strong>
                      {log.paymentId?.razorpayPaymentId || "N/A"}
                    </strong>
                  </div>

                  <div className="audit-detail">
                    <span>Amount</span>
                    <strong>
                      {log.paymentId?.amount !== undefined
                        ? `₹${log.paymentId.amount.toLocaleString("en-IN")}`
                        : "N/A"}
                    </strong>
                  </div>

                  <div className="audit-detail">
                    <span>Recovery Case</span>
                    <strong>
                      {log.recoveryCaseId?._id || "N/A"}
                    </strong>
                  </div>

                </div>

                {log.metadata &&
                  Object.keys(log.metadata).length > 0 && (
                    <details className="audit-metadata">
                      <summary>
                        <i className="bi bi-code-slash"></i>
                        View event details
                      </summary>

                      <pre>
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default AuditLogs;