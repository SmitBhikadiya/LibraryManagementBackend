// dashboard.service.js
const Order = require("../models/order");
const User = require("../models/user");
const Book = require("../models/book");

async function getDashboardStats() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7); // Seven days ago

  try {
    const userCreationStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const bookBorrowStats = await Order.aggregate([
      {
        $match: {
          issuedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$issuedAt" } },
          count: { $sum: "$quantity" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const bookAdditionStats = await Book.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return { userCreationStats, bookBorrowStats, bookAdditionStats };
  } catch (error) {
    console.error("Error in getDashboardStats:", error.message);
    throw error;
  }
}

module.exports = {
  getDashboardStats,
};
