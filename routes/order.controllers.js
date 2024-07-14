const express = require("express");
const router = express.Router();
const jwt = require("../helpers/jwt");
const orderServices = require("../services/order.services");
const Role = require("../helpers/role");

// routes
router.get("/", jwt(), getOrderedBook);
router.post("/", jwt(), orderCreate);
// router.patch("/reissueBook/:orderId", jwt(), reissueBook);
router.post("/:orderId/complete", jwt(), orderComplete);

module.exports = router;

// route functions
async function orderCreate(req, res, next) {
  const user = req.user;
  const { bookId, quantity } = req.body;

  try {
    // Check if the user is eligible to borrow the book
    const isEligible = await orderServices.checkEligibility(user.sub, bookId);
    if (!isEligible) {
      return res
        .status(400)
        .json({ message: "Book is not available for borrowing." });
    }

    // Create the order
    const newOrder = await orderServices.createOrder({
      bookId,
      userId: user.sub,
      quantity,
    });

    res.json(newOrder);
  } catch (error) {
    next(error);
  }
}

async function orderComplete(req, res, next) {
  const user = req.user;
  const orderId = req.params.orderId;

  try {
    // Check if the user is admin or librarian
    if (![Role.Admin, Role.Librarian].includes(user.role)) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to complete orders.",
      });
    }

    const completedOrder = await orderServices.completeOrder(orderId);

    res.json(completedOrder);
  } catch (error) {
    next(error);
  }
}

async function getOrderedBook(req, res, next) {
  const user = req.user;
  const ofUser = req.query.ofUser;
  const status = req.query.status;

  try {
    let orderedBooks;

    if ([Role.Admin, Role.Librarian].includes(user.role) && ofUser) {
      // Fetch order history of another user if admin or librarian and ofUser is provided
      orderedBooks = await orderServices.getOrderedBooksByUser(ofUser, status);
    } else if ([Role.Admin, Role.Librarian].includes(user.role) && !ofUser) {
      orderedBooks = await orderServices.getOrderedBooksByUser(null, status);
    } else {
      // Fetch own order history for normal users or if no ofUser provided for admin/librarian
      orderedBooks = await orderServices.getOrderedBooksByUser(
        user.sub,
        status
      );
    }

    res.json(orderedBooks);
  } catch (error) {
    next(error);
  }
}
