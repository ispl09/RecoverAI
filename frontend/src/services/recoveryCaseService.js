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