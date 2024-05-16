const { Schema, model } = require("mongoose");

const User = new Schema({
  name: String,
  chatId: Number,
  phone: String,
  admin: {
    type: Boolean,
    default: false,
  },
  region: String,
  action: String,
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: Date,
  reply_to: String,
});

module.exports = model("User", User);
