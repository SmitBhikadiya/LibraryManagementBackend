const db = require("../helpers/db");
const Book = db.Book;
const Order = db.Order;

async function checkEligibility(userId, bookId) {
  // Check if the book quantity is greater than 0
  const book = await Book.findById(bookId);
  console.log({ book });
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

async function completeOrder(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Update status to completed
    order.status = "completed";
    await order.save();

    return order;
  } catch (error) {
    console.error("Error in completeOrder:", error.message);
    throw error;
  }
}

async function getOrderedBooksByUser(userId = null, status = null) {
  try {
    // Query to get order history
    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const orderedBooks = await Order.find(query)
      .populate("bookId", "name author genre ISBN") // Populate book details if needed
      .exec();

    return orderedBooks;
  } catch (error) {
    console.error("Error in getOrderedBooksByUser:", error.message);
    throw error;
  }
}

function calculateDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // Example: Due date is 14 days from now
  return dueDate;
}

module.exports = {
  checkEligibility,
  createOrder,
  // reissueBook,
  completeOrder,
  getOrderedBooksByUser,
};
