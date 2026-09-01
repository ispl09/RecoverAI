import { useState } from "react";
import { createPayment } from "../services/paymentService";
import { createRecoveryCase } from "../services/recoveryCaseService";

function CreatePayment() {
  const [formData, setFormData] = useState({
    razorpayPaymentId: "",
    amount: "",
    currency: "INR",
    status: "failed",
    failureReason: "insufficient funds",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdPayment, setCreatedPayment] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required");
        return;
      }

      const paymentData = await 
      createPayment(token, {
        ...formData,
        amount: Number(formData.amount),
      });

      setCreatedPayment(paymentData.payment);
      setMessage("Payment created successfully!");

    //   setFormData({
    //     razorpayPaymentId: "",
    //     amount: "",
    //     currency: "INR",
    //     status: "failed",
    //     failureReason: "insufficient funds",
    //   });

    } catch (err) {
      setError(err.message || "Failed to create payment");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Test Payment</h2>
      <p>Create payments to test RecoverAI.</p>

      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label>Payment ID</label>
          <input
            type="text"
            name="razorpayPaymentId"
            className="form-control"
            value={formData.razorpayPaymentId}
            onChange={handleChange}
            placeholder="pay_test_001"
            required
          />
        </div>

        <div className="mb-3">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
            placeholder="1800"
            required
          />
        </div>

        <div className="mb-3">
          <label>Status</label>
          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="failed">Failed</option>
            <option value="successful">Successful</option>
          </select>
        </div>

        {formData.status === "failed" && (
          <div className="mb-3">
            <label>Failure Reason</label>
            <select
              name="failureReason"
              className="form-select"
              value={formData.failureReason}
              onChange={handleChange}
            >
              <option value="insufficient funds">
                Insufficient Funds
              </option>

              <option value="bank declined">
                Bank Declined
              </option>

              <option value="network error">
                Network Error
              </option>

              <option value="authentication failed">
                Authentication Failed
              </option>

              <option value="unknown">
                Unknown
              </option>
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Create Payment
        </button>

      </form>

      {message && (
        <div className="alert alert-success mt-3">
          {message}
        </div>
      )}

      {createdPayment && createdPayment.status === "failed" && (
        <button
            type="button"
            className="btn btn-warning mt-3"
            onClick={async () => {
            try {
                setError("");
                setMessage("");

                const token = localStorage.getItem("token");

                if (!token) {
                setError("Authentication required");
                return;
                }

                await createRecoveryCase(
                token,
                createdPayment._id
                );

                setMessage("Recovery case created successfully!");
            } catch (err) {
                setError(
                err.message || "Failed to create recovery case"
                );
            }
            }}
        >
            Create Recovery Case
        </button>
        )}

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
    </div>
  );
}

export default CreatePayment;