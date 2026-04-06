require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

/**
 * Configure Middleware
 */
app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Request Logging Middleware
 */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.body) {
    const bodyStr = JSON.stringify(req.body);
    console.log('Body:', bodyStr ? bodyStr.substring(0, 100) : 'empty');
  }
  next();
});

/**
 * Static & Root Routes
 */
app.get("/", (req, res) => res.send("AgroLanka API is running..."));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * API Routes
 */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ascs", require("./routes/ascRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));
app.use("/api/compensation", require("./routes/compensationRoutes"));
app.use("/api/machinery", require("./routes/machineryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

/**
 * Error Handling Middleware
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Database Connection & Server Initialisation
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully.");
    const port = process.env.PORT || 5000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port} (Ready for network connections)`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Error:", err.message);
    process.exit(1);
  });
