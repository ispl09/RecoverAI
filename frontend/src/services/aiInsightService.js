const API_URL = "http://localhost:5000/api";

export const getAIInsights = async (token) => {
    const response = await fetch(`${API_URL}/ai-insights`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch AI insights");
    }

    return await response.json();
};

export const analyzeRecoveryCase = async (token, caseId) => {
    const response = await fetch(
        `${API_URL}/ai-insights/case/${caseId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to analyze recovery case"
        );
    }

    return data;
};