import React, { useState } from "react";
import "../css/Settings.css";

function Settings() {
    const [recoveryEnabled, setRecoveryEnabled] = useState(true);
    const [autoRetry, setAutoRetry] = useState(true);
    const [customerNotifications, setCustomerNotifications] = useState(true);

    return (
        <div className="settings-page">

            <div className="settings-header">
                <h1>Settings</h1>
                <p>
                    Manage your RecoverAI recovery preferences and safety controls.
                </p>
            </div>

            {/* Merchant Profile */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div>
                        <h3>Merchant Profile</h3>
                        <p>Basic information about your merchant account.</p>
                    </div>
                </div>

                <div className="settings-grid">

                    <div className="settings-field">
                        <label>Merchant Name</label>
                        <input
                            type="text"
                            value="Ishika Paul"
                            readOnly
                        />
                    </div>

                    <div className="settings-field">
                        <label>Currency</label>
                        <input
                            type="text"
                            value="INR"
                            readOnly
                        />
                    </div>

                </div>
            </div>

            {/* Recovery Preferences */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div>
                        <h3>Recovery Preferences</h3>
                        <p>Control how RecoverAI handles payment recovery.</p>
                    </div>
                </div>

                <div className="settings-option">
                    <div>
                        <h4>AI Recovery</h4>
                        <p>
                            Allow RecoverAI to analyze failed payments and recommend
                            recovery actions.
                        </p>
                    </div>

                    <label className="settings-switch">
                        <input
                            type="checkbox"
                            checked={recoveryEnabled}
                            onChange={() =>
                                setRecoveryEnabled(!recoveryEnabled)
                            }
                        />
                        <span></span>
                    </label>
                </div>

                <div className="settings-option">
                    <div>
                        <h4>Automatic Retry</h4>
                        <p>
                            Allow eligible failed payments to be retried automatically.
                        </p>
                    </div>

                    <label className="settings-switch">
                        <input
                            type="checkbox"
                            checked={autoRetry}
                            onChange={() => setAutoRetry(!autoRetry)}
                        />
                        <span></span>
                    </label>
                </div>

                <div className="settings-option">
                    <div>
                        <h4>Customer Notifications</h4>
                        <p>
                            Notify customers when a recovery action requires their
                            attention.
                        </p>
                    </div>

                    <label className="settings-switch">
                        <input
                            type="checkbox"
                            checked={customerNotifications}
                            onChange={() =>
                                setCustomerNotifications(
                                    !customerNotifications
                                )
                            }
                        />
                        <span></span>
                    </label>
                </div>
            </div>

            {/* Recovery Safety */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div>
                        <h3>Recovery Safety</h3>
                        <p>
                            RecoverAI follows bounded recovery and escalation rules.
                        </p>
                    </div>
                </div>

                <div className="safety-list">

                    <div className="safety-item">
                        <span className="safety-status">Active</span>
                        <div>
                            <h4>Retry Limits</h4>
                            <p>
                                Repeated failed attempts are stopped to prevent
                                unnecessary retries.
                            </p>
                        </div>
                    </div>

                    <div className="safety-item">
                        <span className="safety-status">Active</span>
                        <div>
                            <h4>Manual Escalation</h4>
                            <p>
                                Cases that cannot be safely recovered are sent for
                                manual review.
                            </p>
                        </div>
                    </div>

                    <div className="safety-item">
                        <span className="safety-status">Active</span>
                        <div>
                            <h4>Audit Trail</h4>
                            <p>
                                Recovery decisions and actions are recorded for
                                traceability.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* System Information */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div>
                        <h3>System Information</h3>
                        <p>RecoverAI application information.</p>
                    </div>
                </div>

                <div className="settings-info-grid">

                    <div>
                        <span>Platform</span>
                        <strong>RecoverAI</strong>
                    </div>

                    <div>
                        <span>Recovery Engine</span>
                        <strong>Rule-Based AI</strong>
                    </div>

                    <div>
                        <span>Recovery Mode</span>
                        <strong>Bounded Execution</strong>
                    </div>

                    <div>
                        <span>Audit Logging</span>
                        <strong>Enabled</strong>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Settings;