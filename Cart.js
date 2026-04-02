const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  items: [cartItemSchema]
});

module.exports = mongoose.model("Cart", cartSchema);