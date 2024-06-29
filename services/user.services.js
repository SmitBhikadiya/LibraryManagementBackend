const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config.json");
const db = require("../helpers/db");
const { getTodosByUser } = require("./todo.services");
const User = db.User;

//this will authenticate the user credentials
async function authenticate({ email, password }) {
  //find the user using email

  const user = await User.findOne({ email });
  console.log("user model", user);
  //if user is truthy then sign the token
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      config.secret || process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    // console.log("user.toJsoon", ...user.toJSON());
    return { ...user.toJSON(), token };
  }
}
//retrieving all users
async function getAll() {
  return await User.find();
}
//retrieving user using id
async function getById(id) {
  console.log("finding id: ", id);
  return await User.findById(id);
}

//adding user to db
async function create(userParam) {
  //check if user exist
  const user = await User.findOne({ email: userParam.email });
  //validate
  if (user) throw `This email already exists: ${userParam.email}`;

  //create user obj
  const newUser = new User(userParam);
  if (userParam.password) {
    newUser.password = bcrypt.hashSync(userParam.password, 10);
  }
  await newUser.save();
}

async function deleteUser(id) {
  try {
    const deletedUser = await User.findByIdAndRemove(id);
    let latestTODOList = getTodosByUser(id);
    global.io?.emit("get_todo_list", latestTODOList);
    return { id: deletedUser._id.toString() }; // Return deleted id
  } catch (error) {
    throw error;
  }
}

async function updateUser(userId, updateFields) {
  try {
    // Validate if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update specified fields
    if (updateFields.firstName) user.firstName = updateFields.firstName;
    if (updateFields.lastName) user.lastName = updateFields.lastName;
    if (updateFields.role) user.role = updateFields.role;
    if (updateFields.hasOwnProperty("isActive"))
      user.isActive = updateFields.isActive;

    // Save updated user
    await user.save();
    let latestTODOList = getTodosByUser(userId);
    global.io?.emit("get_todo_list", latestTODOList);
    return user.toJSON(); // Return updated user object
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
