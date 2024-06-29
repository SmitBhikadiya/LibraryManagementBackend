const express = require("express");
const router = express.Router();
const todoService = require("../services/todo.services");
const authenticateToken = require("../middlewares/authenticate");

router.post("/create-todo", authenticateToken, createTodo);
router.get("/", authenticateToken, getTodosByUser);
router.get("/:todoId", authenticateToken, getTodoById);
router.delete("/:todoId", authenticateToken, deleteTodoById);
router.patch("/:todoId", authenticateToken, updateTodoById);

module.exports = router;

function createTodo(req, res, next) {
  todoService
    .createTodo(req.body, req.user.sub) // Pass the logged-in user's ID
    .then((todo) => res.status(201).json(todo))
    .catch((error) => res.status(400).json({ message: error.message }));
}

function getTodosByUser(req, res, next) {
  todoService
    .getTodosByUser(req.user.sub)
    .then((todos) => res.json(todos))
    .catch((error) => res.status(400).json({ message: error.message }));
}

function getTodoById(req, res, next) {
  todoService
    .getTodoById(req.params.todoId)
    .then((todo) => res.json(todo))
    .catch((error) => res.status(400).json({ message: error.message }));
}

function deleteTodoById(req, res, next) {
  todoService
    .deleteTodoById(req.params.todoId, req.user.sub)
    .then((deletedTodo) =>
      res.status(200).json({
        id: deletedTodo.id,
        message: `Todo with id: ${deletedTodo.id} deleted successfully`,
      })
    )
    .catch((error) => res.status(400).json({ message: error.message }));
}

function updateTodoById(req, res, next) {
  todoService
    .updateTodoById(req.params.todoId, req.body, req.user.sub)
    .then((todo) => res.json(todo))
    .catch((error) => res.status(400).json({ message: error.message }));
}
