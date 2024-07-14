const express = require("express");
const router = express.Router();
const jwt = require("../helpers/jwt");
const orderServices = require("../services/order.services");
const Role = require("../helpers/role");

// routes
router.post("/orderCreate", jwt(), orderCreate);
router.patch("/reissueBook/:orderId", jwt(), reissueBook);
router.patch("/orderComplete/:orderId", jwt(), orderComplete);
router.get("/orderedBooksByUser", jwt(), getOrderedBooksByUser);

module.exports = router;

// route functions
async function orderCreate(req, res, next) {
  const user = req.user;
  const { bookId, quantity } = req.body;

  try {
    // Check if the user is eligible to borrow the book
    const isEligible = await orderServices.checkEligibility(user._id, bookId);
    if (!isEligible) {
      return res
        .status(400)
        .json({ message: "Book is not available for borrowing." });
    }

    // Create the order
    const newOrder = await orderServices.createOrder({
      bookId,
      userId: user._id,
      quantity,
    });

    res.json(newOrder);
  } catch (error) {
    next(error);
  }
}

async function reissueBook(req, res, next) {
  const { orderId } = req.params;
  const today = new Date();

  try {
    const updatedOrder = await orderServices.reissueBook(orderId, today);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
}

async function orderComplete(req, res, next) {
  const { orderId } = req.params;

  try {
    const completedOrder = await orderServices.completeOrder(orderId);

    res.json(completedOrder);
  } catch (error) {
    next(error);
  }
}

async function getOrderedBooksByUser(req, res, next) {
  const userId = req.user.sub;

  try {
    const orderedBooks = await orderServices.getOrderedBooksByUser(userId);

    res.json(orderedBooks);
  } catch (error) {
    next(error);
  }
}
