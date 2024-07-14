const db = require("../helpers/db");
const Book = db.Book;
const Order = db.Order;

async function checkEligibility(userId, bookId) {
  // Check if the book quantity is greater than 0
  const book = await Book.findById(bookId);
  if (!book || book.quantity <= 0) {
    return false;
  }

  // Check if the user has any late fees for this book
  const existingOrder = await Order.findOne({
    userId,
    bookId,
    returnAt: null,
    lateFees: { $gt: 0 },
  });

  return !existingOrder;
}

async function createOrder(orderData) {
  const { bookId, userId, quantity } = orderData;

  // Decrease the book quantity
  const book = await Book.findById(bookId);
  if (!book || book.quantity < quantity) {
    throw new Error("Not enough quantity available for borrowing.");
  }
  book.quantity -= quantity;
  await book.save();

  // Create the order
  const newOrder = new Order({
    bookId,
    userId,
    quantity,
    dueDate: calculateDueDate(),
  });
  await newOrder.save();

  return newOrder;
}

async function reissueBook(orderId, issuedAt) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // Update issuedAt to today's date
  order.issuedAt = issuedAt;
  order.dueDate = calculateDueDate(issuedAt); // Recalculate due date

  await order.save();

  return order;
}

async function completeOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // Update status to completed
  order.status = "completed";
  await order.save();

  return order;
}

async function getOrderedBooksByUser(userId) {
  const orderedBooks = await Order.find({ userId })
    .populate({
      path: "bookId",
      select: "name author",
    })
    .populate({
      path: "userId",
      select: "name email",
    });

  return orderedBooks;
}

function calculateDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // Example: Due date is 14 days from now
  return dueDate;
}

module.exports = {
  checkEligibility,
  createOrder,
  reissueBook,
  completeOrder,
  getOrderedBooksByUser,
};
