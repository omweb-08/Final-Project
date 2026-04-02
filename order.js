const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  customerName: {
    type: String,
    required: true
  },

  customerEmail: {
    type: String,
    required: true
  },

  customerPhone: {
    type: String,
    required: true
  },

  itemName: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    default: 1
  },

  feedback: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now   // ⭐ this forces the date to be stored
  }

});

module.exports = mongoose.model("Order", orderSchema);