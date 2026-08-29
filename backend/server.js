require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Merchant = require("./models/Merchant");
const authRoutes = require("./routes/authRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cors = require("cors");
const recoveryCaseRoutes = require("./routes/recoveryCaseRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recovery-cases", recoveryCaseRoutes);
app.use("/api/audit-logs", auditLogRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("RecoverAI API is running");
});

// app.post("/api/test-merchant", async (req, res) => {
//   try {
//     const merchant = await Merchant.create({
//       name: "Test Merchant",
//       email: "test@recoverai.com",
//       password: "temporary-password",
//     });

//     res.status(201).json(merchant);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

app.listen(PORT, () => {
    console.log(`RecoverAI backend running on port ${PORT}`);
});