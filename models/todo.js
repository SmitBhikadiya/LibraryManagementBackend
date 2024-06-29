const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  title: { type: String, required: true },
  status: { type: String, required: true },
  taskDescription: { type: String, required: true },
  dueDate: { type: Date, required: true },
  assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  assignedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Todo", todoSchema);
