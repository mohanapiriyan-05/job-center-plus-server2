const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

// ======================
// DASHBOARD STATS
// ======================
router.get("/stats", getDashboardStats);

module.exports = router;