const API_URL = "http://localhost:5000/api";

export const getRecoveryCases = async (token) => {
  const response = await fetch(`${API_URL}/recovery-cases`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recovery cases");
  }

  const data = await response.json();

  return data.recoveryCases;
};

export const getRecoveryCaseDetails = async (token, caseId) => {
  const response = await fetch(`${API_URL}/recovery-cases/${caseId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recovery case details");
  }

  return await response.json();
};

export const analyzeRecoveryCase = async (token, caseId) => {
  const response = await fetch(
    `${API_URL}/recovery-cases/${caseId}/analyze`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to analyze recovery case");
  }

  return await response.json();
};

export const createRecoveryAction = async (token, caseId) => {
  const response = await fetch(
    `${API_URL}/recovery/${caseId}/action`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message || "Failed to create recovery action"
    );
  }

  return await response.json();
};

export const executeRecoveryAction = async (token, caseId) => {
  const response = await fetch(
    `${API_URL}/recovery/${caseId}/execute`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message || "Failed to execute recovery action"
    );
  }

  return await response.json();
};

export const getAuditLogs = async (token) => {
  const response = await fetch(
    `${API_URL}/audit-logs`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message || "Failed to fetch audit logs"
    );
  }

  const data = await response.json();

  return data.auditLogs;
};

export const createRecoveryCase = async (token, paymentId) => {
  const response = await fetch(
    "http://localhost:5000/api/recovery",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create recovery case"
    );
  }

  return data;
};

export const batchRecover = async (token, recoveryCaseIds) => {
  const response = await fetch(
    `${API_URL}/batch-recovery/batch-recover`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recoveryCaseIds,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to process batch recovery"
    );
  }

  return data;
};