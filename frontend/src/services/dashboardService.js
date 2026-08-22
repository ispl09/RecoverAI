const API_URL = "http://localhost:5000/api";

export const getDashboardData = async (token) => {
  const response = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  const data = await response.json();

  return data.dashboard;
};