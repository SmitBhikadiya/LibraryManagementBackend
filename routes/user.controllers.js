const express = require("express");
const router = express.Router();
const userServices = require("../services/user.services");
const Role = require("../helpers/role");
const jwt = require("../helpers/jwt");
const authenticateToken = require("../middlewares/authenticate");

//routes
router.post("/authenticate", authenticate);
router.post("/register", register);
router.get("/", jwt(), getAll);
router.get("/current", jwt(), getCurrent);
router.get("/:id", getById);
router.delete("/:id", deleteUser);
router.patch("/", authenticateToken, updateUser);

module.exports = router;

//route functions
function authenticate(req, res, next) {
  userServices
    .authenticate(req.body)
    .then((user) => {
      console.log(user);
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

async function updateUser(req, res, next) {
  const userId = req.user.sub;
  const { firstName, lastName, role, isActive } = req.body;
  try {
    const updatedUser = await userServices.updateUser(userId, {
      firstName,
      lastName,
      role,
      isActive,
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

function getAll(req, res, next) {
  const currentUser = req.user;

  // if (currentUser.role !== Role.Admin) {
  //   return res.status(401).json({ message: "Not Authorized!" });
  // }
  userServices
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getCurrent(req, res, next) {
  console.log(req);
  userServices
    .getById(req.user.sub)
    .then((user) => (user ? res.json(user) : res.status(404)))
    .catch((error) => next(error));
}

function getById(req, res, next) {
  userServices
    .getById(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User Not Found!" });
        next();
      }
      return res.json(user);
    })
    .catch((error) => next(error));
}

function deleteUser(req, res, next) {
  userServices
    .deleteUser(req.params.id)
    .then((deletedUser) =>
      res.json({
        id: deletedUser.id,
        message: `User with id: ${deletedUser.id} deleted successfully.`,
      })
    )
    .catch((error) => next(error));
}
