const { Schema, model } = require("mongoose");

const Station = new Schema({
  name: String,
  phone: String,
  adminNumber: String,
  oilTypes: Array,
  image: String,
  workTime: Object,
  location: String,
  createdAdmin: String,
  status: {
    type: Boolean,
    default: 0,
  },
  isOpen: {
    type: Boolean,
    default: true
  }
});

module.exports = model("Station", Station);
