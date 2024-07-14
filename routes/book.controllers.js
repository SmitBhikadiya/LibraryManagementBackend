const express = require("express");
const router = express.Router();
const bookServices = require("../services/book.services");
const jwt = require("../helpers/jwt");
const Role = require("../helpers/role");

// routes
router.get("/", getAllBooks);
router.get("/recommend", recommendBook);
router.get("/:id", getBookById);
router.patch("/:id", jwt(), updateBook);
router.delete("/:id", jwt(), deleteBook);
router.post("/", jwt(), addBooks);

module.exports = router;

function getAllBooks(req, res, next) {
  const query = req.query.searchBy;
  bookServices
    .getAllBooks(query)
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

function addBooks(req, res, next) {
  const user = req.user;
  const booksData = req.body;

  // Check if the user has the right role
  if (![Role.Admin, Role.Librarian].includes(user.role)) {
    return res
      .status(403)
      .json({ message: "Forbidden: You are not authorized to add books." });
  }

  bookServices
    .addBooks(booksData)
    .then((addedBooks) => res.json(addedBooks))
    .catch((error) => next(error));
}
