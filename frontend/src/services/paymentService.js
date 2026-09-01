export const createPayment = async (token, paymentData) => {
  const response = await fetch(
    "http://localhost:5000/api/payments",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payment");
  }

  return data;
};