const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Merchant = require("../models/Merchant");

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.merchant.merchantId).select(
      "-password"
    );

    if (!merchant) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    res.json({
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        createdAt: merchant.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

module.exports = router;