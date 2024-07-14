const express = require("express");
const router = express.Router();
const bookServices = require("../services/book.services");
const jwt = require("../helpers/jwt");

// routes
router.get("/search", jwt(), searchBooks);
router.get("/", jwt(), getAllBooks);
router.get("/:id", jwt(), getBookById);
router.patch("/:id", jwt(), updateBook);
router.delete("/:id", jwt(), deleteBook);
router.get("/recommendBook", jwt(), recommendBook);

module.exports = router;

// route functions
function searchBooks(req, res, next) {
  const query = req.query.by;
  bookServices
    .searchBooks(query)
    .then((books) => res.json(books))
    .catch((error) => next(error));
}

function getAllBooks(req, res, next) {
  bookServices
    .getAllBooks()
    .then((books) => res.json(books))
    .catch((error) => next(error));
}

function getBookById(req, res, next) {
  bookServices
    .getBookById(req.params.id)
    .then((book) => {
      if (!book) {
        res.status(404).json({ message: "Book Not Found!" });
      } else {
        res.json(book);
      }
    })
    .catch((error) => next(error));
}

function updateBook(req, res, next) {
  const user = req.user;
  const bookId = req.params.id;
  const updateData = req.body;

  // Check if the user has the right role
  if (![Role.Admin, Role.Librarian].includes(user.role)) {
    return res
      .status(403)
      .json({ message: "Forbidden: You are not authorized to update books." });
  }

  updateData.updatedBy = user.sub;
  updateData.updatedAt = new Date();

  bookServices
    .updateBook(bookId, updateData)
    .then((updatedBook) => res.json(updatedBook))
    .catch((error) => next(error));
}

function deleteBook(req, res, next) {
  const user = req.user;
  const bookId = req.params.id;

  // Check if the user has the right role
  if (![Role.Admin, Role.Librarian].includes(user.role)) {
    return res
      .status(403)
      .json({ message: "Forbidden: You are not authorized to delete books." });
  }

  bookServices
    .deleteBook(bookId)
    .then((deletedBook) => res.json(deletedBook))
    .catch((error) => next(error));
}

function recommendBook(req, res, next) {
  bookServices
    .getRecommendedBooks()
    .then((recommendedBooks) => res.json(recommendedBooks))
    .catch((error) => next(error));
}
