const express = require("express");
const router = express.Router();
const userServices = require("../services/user.services");
const jwt = require("../helpers/jwt");
const authenticateToken = require("../middlewares/authenticate");
const Role = require("../helpers/role");

router.post("/authenticate", authenticate);
router.post("/register", register);
router.get("/", jwt(), getUsers);
router.get("/current", jwt(), getCurrent);
router.get("/:id", jwt(), getById);
router.delete("/:id", jwt(), deleteUser);
router.patch("/", jwt(), updateUser);

module.exports = router;

function authenticate(req, res, next) {
  userServices
    .authenticate(req.body)
    .then((user) => {
      user
        ? res.json({ user: user, message: "User logged in successfully" })
        : res
            .status(400)
            .json({ message: "Username or password is incorrect." });
    })
    .catch((error) => next(error));
}

function register(req, res, next) {
  userServices
    .create(req.body)
    .then((user) =>
      res.json({
        user: user,
        message: `User Registered successfully with email ${req.body.email}`,
      })
    )
    .catch((error) => next(error));
}

function getUsers(req, res, next) {
  const user = req.user;

  // Check if the user is authorized (Admin or Librarian)
  if (![Role.Admin, Role.Librarian].includes(user.type)) {
    return res.status(403).json({
      message: "Forbidden: You are not authorized to access user list.",
    });
  }

  userServices
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getCurrent(req, res, next) {
  userServices
    .getById(req.user.sub)
    .then((user) =>
      user
        ? res.json(user)
        : res.status(404).json({ message: "User not found" })
    )
    .catch((error) => next(error));
}

function getById(req, res, next) {
  userServices
    .getById(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User Not Found!" });
      } else {
        res.json(user);
      }
    })
    .catch((error) => next(error));
}

function deleteUser(req, res, next) {
  userServices
    .deleteUser(req.params.id)
    .then((deletedUser) =>
      res.json({
        id: deletedUser._id,
        message: `User with id: ${deletedUser._id} deleted successfully.`,
      })
    )
    .catch((error) => next(error));
}

async function updateUser(req, res, next) {
  const userId = req.user.sub; // Assuming userId is from JWT token
  const updateData = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    type: req.body.type,
    isActive: req.body.isActive,
    deactivationReason: req.body.deactivationReason,
    updatedAt: Date.now(),
    updatedBy: req.user.sub, // Assuming updatedBy is from JWT token
  };

  try {
    const updatedUser = await userServices.updateUser(userId, updateData);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
