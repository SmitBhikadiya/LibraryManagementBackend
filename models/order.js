const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, auto: true, primary: true },
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  issuedAt: { type: Date, default: Date.now },
  returnAt: { type: Date },
  quantity: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  lateFees: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["new", "expired", "completed"],
    default: "new",
  },
});

module.exports = mongoose.model("BookOrder", orderSchema);
