// dashboard.controller.js
const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboard.services");
const jwt = require("../helpers/jwt");
const Role = require("../helpers/role");

// Routes
router.get("/stats", jwt(), getDashboardStats);

module.exports = router;

// Route functions
async function getDashboardStats(req, res, next) {
  const user = req.user;

  try {
    if (![Role.Admin, Role.Librarian].includes(user.role)) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to access this resource.",
      });
    }

    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}
