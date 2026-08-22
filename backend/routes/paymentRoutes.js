const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Payment = require("../models/Payment");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      razorpayPaymentId,
      amount,
      currency,
      status,
      failureReason,
    } = req.body;

    if (!razorpayPaymentId || !amount || !status) {
      return res.status(400).json({
        message: "razorpayPaymentId, amount and status are required",
      });
    }

    const payment = await Payment.create({
      merchantId: req.merchant.merchantId,
      razorpayPaymentId,
      amount,
      currency: currency || "INR",
      status,
      failureReason: failureReason || null,
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Payment creation error:", error.message);

    res.status(500).json({
      message: "Failed to create payment",
    });
  }
});

module.exports = router;