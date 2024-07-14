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

async function getAllBooks(query) {
  let filter = {};

  if (query) {
    const regex = new RegExp(query, "i");
    filter = {
      $or: [
        { name: regex },
        { author: regex },
        { genre: regex },
        { ISBN: regex },
      ],
    };
  }

  return await Book.find(filter)
    .populate("createdBy", "email name")
    .populate("updatedBy", "email name")
    .sort({ createdAt: -1 });
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
  const book = await Book.findById(bookId);
  if (!book) throw new Error("Book not found");

  // Check if the book is currently borrowed
  const isBorrowed = await Book.exists({ _id: bookId, returnAt: null });
  if (isBorrowed) {
    throw new Error("Cannot delete the book as it is currently borrowed.");
  }

  const deletedBook = await Book.findByIdAndRemove(bookId);
  if (!deletedBook) throw new Error("Book not found");

  return deletedBook
    .populate("createdBy", "email name")
    .populate("updatedBy", "email name")
    .execPopulate();
}

async function getRecommendedBooks() {
  try {
    const mostPurchasedBooks = await Book.aggregate([
      { $group: { _id: "$_id", totalQuantity: { $sum: "$quantity" } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 20 },
    ]);

    const bookIds = mostPurchasedBooks.map((item) => item._id); // Extracting book IDs

    const recommendedBooks = await Book.find({ _id: { $in: bookIds } }).exec();

    return recommendedBooks;
  } catch (error) {
    console.error("Error in getRecommendedBooks:", error.message);
    throw error;
  }
}

async function addBooks(booksData) {
  if (!Array.isArray(booksData)) {
    booksData = [booksData];
  }

  const insertedBooks = await Book.insertMany(booksData);

  return insertedBooks;
}

module.exports = {
  searchBooks,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getRecommendedBooks,
  addBooks,
};
