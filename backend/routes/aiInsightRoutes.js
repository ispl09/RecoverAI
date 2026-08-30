const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
    generateAIInsights,
    analyzeRecoveryCase,
} = require("../services/aiInsightService");

const router = express.Router();


// =====================================================
// DASHBOARD AI INSIGHTS
// =====================================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const merchantId = req.merchant.merchantId;

        const data = await generateAIInsights(merchantId);

        res.json(data);

    } catch (error) {
        console.error("AI Insights error:", error.message);

        res.status(500).json({
            message: "Failed to generate AI insights",
        });
    }
});


// =====================================================
// AI ANALYSIS FOR A SPECIFIC RECOVERY CASE
// =====================================================

router.get("/case/:caseId", authMiddleware, async (req, res) => {
    try {
        const merchantId = req.merchant.merchantId;
        const { caseId } = req.params;

        const data = await analyzeRecoveryCase(
            merchantId,
            caseId
        );

        res.json(data);

    } catch (error) {
        console.error(
            "Recovery case AI analysis error:",
            error.message
        );

        if (error.message === "Recovery case not found") {
            return res.status(404).json({
                message: "Recovery case not found",
            });
        }

        if (error.message === "Associated payment not found") {
            return res.status(404).json({
                message: "Associated payment not found",
            });
        }

        res.status(500).json({
            message: "Failed to analyze recovery case",
        });
    }
});


module.exports = router;