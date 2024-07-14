const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config.json");
const db = require("../helpers/db");
const User = db.User;

async function authenticate({ email, password }) {
  const user = await User.findOne({ email });
  if (user && bcrypt.compareSync(password, user.password) && user.isActive) {
    const token = jwt.sign(
      { sub: user._id, role: user.type },
      config.secret || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return { ...user.toJSON(), token };
  }
}

async function getAll() {
  return await User.find();
}

async function getById(id) {
  return await User.findById(id);
}

async function create(userParam) {
  const user = await User.findOne({ email: userParam.email });
  if (user) throw `This email already exists: ${userParam.email}`;

  const newUser = new User(userParam);
  if (userParam.password) {
    newUser.password = bcrypt.hashSync(userParam.password, 10);
  }
  await newUser.save();
}

async function deleteUser(id) {
  try {
    const deletedUser = await User.findByIdAndRemove(id);
    return { id: deletedUser._id.toString() };
  } catch (error) {
    throw error;
  }
}

async function updateUser(userId, updateFields) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (updateFields.email) user.email = updateFields.email;
    if (updateFields.password)
      user.password = bcrypt.hashSync(updateFields.password, 10);
    if (updateFields.name) user.name = updateFields.name;
    if (updateFields.type) user.type = updateFields.type;
    if (updateFields.hasOwnProperty("isActive"))
      user.isActive = updateFields.isActive;
    if (updateFields.deactivationReason)
      user.deactivationReason = updateFields.deactivationReason;
    if (updateFields.updatedAt) user.updatedAt = updateFields.updatedAt;
    if (updateFields.updatedBy) user.updatedBy = updateFields.updatedBy;

    await user.save();
    return user.toJSON();
  } catch (error) {
    throw error;
  }
}

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  deleteUser,
  updateUser,
};
