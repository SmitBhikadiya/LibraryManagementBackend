const Todo = require("../models/todo");
const User = require("../models/user");

async function createTodo(
  { title, status, taskDescription, dueDate, assignees, assignedBy },
  userId
) {
  // Validate required fields
  if (!title || !status || !dueDate) {
    throw new Error("Missing required fields");
  }

  // Validate status
  const validStatuses = ["To-do", "In Progress", "Completed"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  // If no assignees provided, assign to self
  if (!assignees || assignees.length === 0) {
    assignees = [userId];
  } else {
    // Check if all assignees exist
    for (const assigneeId of assignees) {
      const user = await User.findById(assigneeId);
      if (!user) {
        throw new Error(`User with ID ${assigneeId} does not exist`);
      }
    }
  }

  // Check if assignedBy user exists, if provided
  let assigner = userId;
  if (assignedBy) {
    assigner = await User.findById(assignedBy);
    if (!assigner) {
      throw new Error(`User with ID ${assignedBy} does not exist`);
    }
  }

  // Create the todo item
  const todo = new Todo({
    title,
    status,
    taskDescription,
    dueDate,
    assignees,
    createdBy: userId,
    assignedBy: assignedBy || userId,
    createdAt: new Date(),
    assignedAt: new Date(),
  });

  await todo.save();
  return todo;
}

async function updateTodoById(todoId, updateData, userId) {
  const todo = await Todo.findById(todoId);
  if (!todo) {
    throw new Error("Todo not found");
  }

  // Ensure the user cannot change createdBy and createdAt
  if (updateData.createdBy || updateData.createdAt) {
    throw new Error("Cannot change createdBy or createdAt");
  }

  // Check if there is a change in assignees
  if (
    updateData.assignees &&
    !arraysEqual(updateData.assignees, todo.assignees)
  ) {
    updateData.assignedAt = new Date();
  }

  // Update the todo with allowed fields
  Object.assign(todo, updateData);
  await todo.save();
  return todo;
}

// Helper function to compare arrays
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].toString() !== arr2[i].toString()) return false;
  }
  return true;
}

async function getTodosByUser(userId) {
  try {
    const createdTodos = await Todo.find({ createdBy: userId })
      .populate({
        path: "assignees",
        select: "firstName lastName email _id", // Ensure _id is selected
      })
      .populate({
        path: "assignedBy",
        select: "firstName lastName email _id", // Ensure _id is selected
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName email _id", // Ensure _id is selected
      })
      .exec();

    const assignedTodos = await Todo.find({ assignees: userId })
      .populate({
        path: "assignees",
        select: "firstName lastName email _id", // Ensure _id is selected
      })
      .populate({
        path: "assignedBy",
        select: "firstName lastName email _id", // Ensure _id is selected
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName email _id", // Ensure _id is selected
      })
      .exec();

    const uniqueTodos = new Map();

    createdTodos.forEach((todo) => uniqueTodos.set(todo._id.toString(), todo));
    assignedTodos.forEach((todo) => uniqueTodos.set(todo._id.toString(), todo));

    return Array.from(uniqueTodos.values());
  } catch (error) {
    throw new Error("Error fetching todos");
  }
}

async function getTodoById(todoId) {
  const todo = await Todo.findById(todoId).populate(
    "assignees createdBy assignedBy"
  );
  if (!todo) {
    throw new Error("Todo not found");
  }
  return todo;
}

async function deleteTodoById(todoId, userId) {
  try {
    const todo = await Todo.findById(todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }
    if (todo.createdBy.toString() !== userId) {
      throw new Error("You do not have permission to delete this todo");
    }

    await Todo.findByIdAndDelete(todoId);
    return { id: todo._id.toString() }; // Return deleted id
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createTodo,
  getTodosByUser,
  getTodoById,
  deleteTodoById,
  updateTodoById,
};
