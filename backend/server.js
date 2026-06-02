const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const sequelize = require("./db.js");
// Models
const User = require("./models/User.js");
const Store = require("./models/Store.js");
const Rating = require("./models/Rating.js");

// Routes
const authRoutes = require("./routes/auth.js");
const adminRoutes = require("./routes/admin.js");
const storesRoutes = require("./routes/stores.js");
const ratingsRoutes = require("./routes/ratings.js");
const ownerRoutes = require("./routes/owner.js");
const { Sequelize } = require("sequelize");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/owner", ownerRoutes);

// Health Check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message, success: false });
});

// Database Sync & Server Start
const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  })


