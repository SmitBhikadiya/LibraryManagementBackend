const db = require("../helpers/db");
const Book = db.Book;

async function searchBooks(query) {
  const regex = new RegExp(query, "i"); // 'i' makes it case-insensitive
  return await Book.find({
    $or: [
      { name: regex },
      { author: regex },
      { genre: regex },
      { ISBN: regex },
    ],
  })
    .populate("createdBy", "email name")
    .populate("updatedBy", "email name");
}

async function getAllBooks() {
  return await Book.find()
    .populate("createdBy", "email name")
    .populate("updatedBy", "email name");
}

async function getBookById(id) {
  return await Book.findById(id)
    .populate("createdBy", "email name")
    .populate("updatedBy", "email name");
}

async function updateBook(bookId, updateData) {
  const book = await Book.findById(bookId);
  if (!book) throw new Error("Book not found");

  Object.assign(book, updateData);

  await book.save();
  return book
    .populate("createdBy", "email name")
    .populate("updatedBy", "email name")
    .execPopulate();
}

async function deleteBook(bookId) {
  // Check if the book is currently borrowed
  const isBorrowed = await BookOrder.exists({ bookId, returnAt: null });
  if (isBorrowed)
    throw new Error("Cannot delete the book as it is currently borrowed.");

  const deletedBook = await Book.findByIdAndRemove(bookId);
  if (!deletedBook) throw new Error("Book not found");

  return deletedBook
    .populate("createdBy", "email name")
    .populate("updatedBy", "email name")
    .execPopulate();
}

async function getRecommendedBooks() {
  const mostPurchasedBooks = await BookOrder.aggregate([
    { $group: { _id: "$bookId", totalQuantity: { $sum: "$quantity" } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 20 },
  ]);

  const recommendedBooks = await Book.populate(mostPurchasedBooks, {
    path: "_id",
    select: "name author",
  });

  return recommendedBooks;
}

module.exports = {
  searchBooks,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getRecommendedBooks,
};
