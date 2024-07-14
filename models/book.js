const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  quantity: { type: Number, required: true },
  genre: { type: String, required: true },
  ISBN: { type: String, unique: true, required: true },
  year: { type: Number, required: true },
  publisher: { type: String, required: true },
  description: { type: String },
  maxReturnDays: { type: Number, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Book", bookSchema);
